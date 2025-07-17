import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { WhatsAppController } from '../../../../interfaces/http/controllers/whatsapp.controller';

// Mock PrismaClient
const mockCustomersFind = jest.fn();
const mockMessageSave = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    customers: {
      findFirst: mockCustomersFind,
    },
  })),
}));

// Mock dependencies
jest.mock('../../../../application/services/message.service');
jest.mock('../../../../application/services/session-token.service');
jest.mock('../../../../utils/logger');

// Mock MessageRepository
jest.mock('../../../../repositories/message.repository', () => ({
  MessageRepository: jest.fn(() => ({
    saveMessage: mockMessageSave,
  })),
}));

describe('WhatsApp Controller - Task #23 Customer Status Checks', () => {
  let whatsappController: WhatsAppController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    whatsappController = new WhatsAppController();
    mockRequest = {
      method: 'POST',
      body: {
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '+393451234567',
                text: { body: 'Test message' }
              }],
              metadata: {
                phone_number_id: 'business123',
                display_phone_number: '+390123456789'
              }
            }
          }]
        }]
      }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('checkCustomerStatus', () => {
    it('should return isActive=false for non-existent customer', async () => {
      // Arrange
      mockCustomersFind.mockResolvedValueOnce(null);

      // Act
      const result = await (whatsappController as any).checkCustomerStatus(
        '+393451234567',
        'workspace123'
      );

      // Assert
      expect(result).toEqual({
        isActive: false,
        isBlacklisted: false
      });
      expect(mockCustomersFind).toHaveBeenCalledWith({
        where: {
          phone: '+393451234567',
          workspaceId: 'workspace123'
        }
      });
    });

    it('should return correct status for active customer', async () => {
      // Arrange
      const mockCustomer = {
        id: 'customer123',
        phone: '+393451234567',
        isActive: true,
        isBlacklisted: false,
        activeChatbot: true
      };
      mockCustomersFind.mockResolvedValueOnce(mockCustomer);

      // Act
      const result = await (whatsappController as any).checkCustomerStatus(
        '+393451234567',
        'workspace123'
      );

      // Assert
      expect(result).toEqual({
        isActive: true,
        isBlacklisted: false,
        customer: mockCustomer
      });
    });

    it('should return correct status for inactive customer', async () => {
      // Arrange
      const mockCustomer = {
        id: 'customer123',
        phone: '+393451234567',
        isActive: false,
        isBlacklisted: false,
        activeChatbot: true
      };
      mockCustomersFind.mockResolvedValueOnce(mockCustomer);

      // Act
      const result = await (whatsappController as any).checkCustomerStatus(
        '+393451234567',
        'workspace123'
      );

      // Assert
      expect(result).toEqual({
        isActive: false,
        isBlacklisted: false,
        customer: mockCustomer
      });
    });

    it('should return correct status for blacklisted customer', async () => {
      // Arrange
      const mockCustomer = {
        id: 'customer123',
        phone: '+393451234567',
        isActive: true,
        isBlacklisted: true,
        activeChatbot: true
      };
      mockCustomersFind.mockResolvedValueOnce(mockCustomer);

      // Act
      const result = await (whatsappController as any).checkCustomerStatus(
        '+393451234567',
        'workspace123'
      );

      // Assert
      expect(result).toEqual({
        isActive: true,
        isBlacklisted: true,
        customer: mockCustomer
      });
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      mockCustomersFind.mockRejectedValueOnce(new Error('Database error'));

      // Act
      const result = await (whatsappController as any).checkCustomerStatus(
        '+393451234567',
        'workspace123'
      );

      // Assert
      expect(result).toEqual({
        isActive: false,
        isBlacklisted: false
      });
    });
  });

  describe('saveIncomingMessageForStatus', () => {
    it('should save message with CUSTOMER_INACTIVE agent for inactive customer', async () => {
      // Arrange
      const statusResult = {
        isActive: false,
        isBlacklisted: false,
        customer: { id: 'customer123' }
      };

      // Act
      await (whatsappController as any).saveIncomingMessageForStatus(
        '+393451234567',
        'Test message',
        'workspace123',
        statusResult
      );

      // Assert
      expect(mockMessageSave).toHaveBeenCalledWith({
        workspaceId: 'workspace123',
        phoneNumber: '+393451234567',
        message: 'Test message',
        response: '',
        agentSelected: 'CUSTOMER_INACTIVE',
        direction: 'INBOUND'
      });
    });

    it('should save message with CUSTOMER_BLACKLISTED agent for blacklisted customer', async () => {
      // Arrange
      const statusResult = {
        isActive: true,
        isBlacklisted: true,
        customer: { id: 'customer123' }
      };

      // Act
      await (whatsappController as any).saveIncomingMessageForStatus(
        '+393451234567',
        'Test message',
        'workspace123',
        statusResult
      );

      // Assert
      expect(mockMessageSave).toHaveBeenCalledWith({
        workspaceId: 'workspace123',
        phoneNumber: '+393451234567',
        message: 'Test message',
        response: '',
        agentSelected: 'CUSTOMER_BLACKLISTED',
        direction: 'INBOUND'
      });
    });
  });
});
