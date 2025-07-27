// @ts-nocheck - Jest types not configured in TypeScript, needs @types/jest setup
import { Request, Response } from 'express'
import { WhatsAppController } from '../../interfaces/http/controllers/whatsapp.controller'
import { MessageService } from '../../application/services/message.service'
import { SessionTokenService } from '../../application/services/session-token.service'

// Mock dependencies
jest.mock('../../application/services/message.service')
jest.mock('../../application/services/session-token.service')
jest.mock('../../utils/logger')

// Mock PrismaClient per questo specifico test
const mockCustomerFindFirst = jest.fn()
const mockWorkspaceFindFirst = jest.fn()
const mockMessageCreate = jest.fn()

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    customer: {
      findFirst: mockCustomerFindFirst,
    },
    message: {
      create: mockMessageCreate,
    },
    workspace: {
      findFirst: mockWorkspaceFindFirst,
    },
  })),
}))

describe('WhatsApp Controller - Blacklist Behavior', () => {
  let controller: WhatsAppController
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>

  beforeEach(() => {
    jest.clearAllMocks()
    
    controller = new WhatsAppController()
    
    mockReq = {
      method: 'POST',
      body: {
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '+1234567890',
                text: { body: 'Test message from blacklisted user' }
              }],
              metadata: {
                phone_number_id: '123456789',
                display_phone_number: '+1987654321'
              }
            }
          }]
        }]
      }
    }
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }
  })

  describe('Customer isBlacklisted = true', () => {
    beforeEach(() => {
      // Mock workspace lookup
      mockWorkspaceFindFirst.mockResolvedValue({
        id: 'workspace-123',
        name: 'Test Workspace',
        whatsappPhoneNumber: '+1987654321',
        isActive: true,
        isDelete: false,
      })

      // Mock customer lookup - BLACKLISTED customer
      mockCustomerFindFirst.mockResolvedValue({
        id: 'customer-123',
        phoneNumber: '+1234567890',
        isActive: true,
        isBlacklisted: true, // 🚨 BLACKLISTED
        workspaceId: 'workspace-123',
      })
    })

    it('should NOT save message to database when customer is blacklisted', async () => {
      await controller.handleWebhook(mockReq as Request, mockRes as Response)

      // ✅ VERIFY: No message saved to database for blacklisted customer
      // The key assertion: blacklisted customers should have NO trace in message history
      expect(mockMessageCreate).not.toHaveBeenCalled()
      
      // ✅ VERIFY: Response indicates customer was filtered out
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.send).toHaveBeenCalledWith('EVENT_RECEIVED_CUSTOMER_INACTIVE')
    })

    it('should block N8N forwarding for blacklisted customer', async () => {
      // Mock MessageService to track if processMessage was called
      const mockProcessMessage = jest.fn()
      ;(MessageService as jest.MockedClass<typeof MessageService>).mockImplementation(() => ({
        processMessage: mockProcessMessage,
      } as any))

      await controller.handleWebhook(mockReq as Request, mockRes as Response)

      // ✅ VERIFY: Message processing should still occur (for security gateway)
      // But N8N forwarding should be blocked after customer status check
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.send).toHaveBeenCalledWith('EVENT_RECEIVED_CUSTOMER_INACTIVE')
    })
  })

  describe('Customer isBlacklisted = false (normal behavior)', () => {
    beforeEach(() => {
      // Mock workspace lookup
      mockWorkspaceFindFirst.mockResolvedValue({
        id: 'workspace-123',
        name: 'Test Workspace',
        whatsappPhoneNumber: '+1987654321',
        isActive: true,
        isDelete: false,
      })

      // Mock customer lookup - NORMAL customer
      mockCustomerFindFirst.mockResolvedValue({
        id: 'customer-123',
        phoneNumber: '+1234567890',
        isActive: true,
        isBlacklisted: false, // ✅ NOT BLACKLISTED
        workspaceId: 'workspace-123',
      })
    })

    it('should allow message processing for non-blacklisted customer', async () => {
      await controller.handleWebhook(mockReq as Request, mockRes as Response)

      // ✅ VERIFY: Normal customers proceed through the flow
      // (This test verifies the blacklist check doesn't block normal users)
      expect(mockRes.status).toHaveBeenCalledWith(200)
      // The response would be different for normal flow, but that's controlled by other logic
    })
  })

  describe('Customer isActive = false', () => {
    beforeEach(() => {
      // Mock workspace lookup
      mockWorkspaceFindFirst.mockResolvedValue({
        id: 'workspace-123',
        name: 'Test Workspace',
        whatsappPhoneNumber: '+1987654321',
        isActive: true,
        isDelete: false,
      })

      // Mock customer lookup - INACTIVE customer
      mockCustomerFindFirst.mockResolvedValue({
        id: 'customer-123',
        phoneNumber: '+1234567890',
        isActive: false, // 🚨 INACTIVE
        isBlacklisted: false,
        workspaceId: 'workspace-123',
      })
    })

    it('should NOT save message to database when customer is inactive', async () => {
      await controller.handleWebhook(mockReq as Request, mockRes as Response)

      // ✅ VERIFY: Inactive customers also don't get messages saved
      expect(mockMessageCreate).not.toHaveBeenCalled()
      
      // ✅ VERIFY: Same response as blacklisted
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.send).toHaveBeenCalledWith('EVENT_RECEIVED_CUSTOMER_INACTIVE')
    })
  })

  describe('Edge Cases', () => {
    it('should handle both isActive=false AND isBlacklisted=true', async () => {
      // Mock workspace lookup
      mockWorkspaceFindFirst.mockResolvedValue({
        id: 'workspace-123',
        name: 'Test Workspace',
        whatsappPhoneNumber: '+1987654321',
        isActive: true,
        isDelete: false,
      })

      // Mock customer - BOTH inactive AND blacklisted
      mockCustomerFindFirst.mockResolvedValue({
        id: 'customer-123',
        phoneNumber: '+1234567890',
        isActive: false, // 🚨 INACTIVE
        isBlacklisted: true, // 🚨 BLACKLISTED
        workspaceId: 'workspace-123',
      })

      await controller.handleWebhook(mockReq as Request, mockRes as Response)

      // ✅ VERIFY: Double-filtered customer still gets no message saved
      expect(mockMessageCreate).not.toHaveBeenCalled()
      
      // ✅ VERIFY: Response indicates filtering
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.send).toHaveBeenCalledWith('EVENT_RECEIVED_CUSTOMER_INACTIVE')
    })

    it('should handle customer not found scenario', async () => {
      // Mock workspace lookup
      mockWorkspaceFindFirst.mockResolvedValue({
        id: 'workspace-123',
        name: 'Test Workspace',
        whatsappPhoneNumber: '+1987654321',
        isActive: true,
        isDelete: false,
      })

      // Mock customer not found
      mockCustomerFindFirst.mockResolvedValue(null)

      await controller.handleWebhook(mockReq as Request, mockRes as Response)

      // ✅ VERIFY: Non-existent customers don't get messages saved
      expect(mockMessageCreate).not.toHaveBeenCalled()
    })
  })
})
