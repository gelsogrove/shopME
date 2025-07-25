import { ContactOperator } from '../../../src/chatbot/calling-functions/ContactOperator'
import { EmailService } from '../../../src/application/services/email.service'
import { prisma } from '../../../src/lib/prisma'
import logger from '../../../src/utils/logger'

// Mock dependencies
jest.mock('../../../src/lib/prisma', () => ({
  prisma: {
    customers: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    workspace: {
      findUnique: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
    },
  },
}))

jest.mock('../../../src/application/services/email.service')
jest.mock('../../../src/utils/logger')

// Mock fetch for AI summary
global.fetch = jest.fn()

describe('ContactOperator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockCustomer = {
    id: 'customer-123',
    name: 'Mario Rossi',
    email: 'mario@example.com',
    phone: '+393451234567',
    workspaceId: 'workspace-123',
    language: 'it'
  }

  const mockWorkspace = {
    id: 'workspace-123',
    name: 'Test Shop',
    whatsappSettings: {
      adminEmail: 'admin@testshop.com'
    }
  }

  const mockMessages = [
    {
      id: 'msg-1',
      direction: 'INBOUND',
      content: 'Ciao, vorrei informazioni sui prodotti',
      createdAt: new Date()
    },
    {
      id: 'msg-2',
      direction: 'OUTBOUND',
      content: 'Certo! Abbiamo vari prodotti disponibili...',
      createdAt: new Date()
    }
  ]

  describe('Successful operator contact request', () => {
    beforeEach(() => {
      (prisma.customers.findFirst as jest.Mock).mockResolvedValue(mockCustomer)
      (prisma.workspace.findUnique as jest.Mock).mockResolvedValue(mockWorkspace)
      (prisma.customers.update as jest.Mock).mockResolvedValue(mockCustomer)
      (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages)
      
      // Mock AI response
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: 'RIASSUNTO AI: Il cliente Mario ha chiesto informazioni sui prodotti. Conversazione cordiale e professionale. Il cliente sembra interessato all\'acquisto. Consiglio: Contattare per fornire catalogo dettagliato.'
            }
          }]
        })
      })

      // Mock EmailService
      const mockEmailService = {
        sendOperatorNotificationEmail: jest.fn().mockResolvedValue(true)
      }
      ;(EmailService as jest.Mock).mockImplementation(() => mockEmailService)
    })

    it('should successfully process operator contact request', async () => {
      const result = await ContactOperator({
        phone: '+393451234567',
        workspaceId: 'workspace-123'
      })

      // Verify customer lookup
      expect(prisma.customers.findFirst).toHaveBeenCalledWith({
        where: { phone: '+393451234567', workspaceId: 'workspace-123' }
      })

      // Verify workspace lookup
      expect(prisma.workspace.findUnique).toHaveBeenCalledWith({
        where: { id: 'workspace-123' },
        include: { whatsappSettings: true }
      })

      // Verify chatbot was disabled
      expect(prisma.customers.update).toHaveBeenCalledWith({
        where: { id: 'customer-123' },
        data: { activeChatbot: false }
      })

      // Verify recent messages were fetched
      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: {
          chatSession: {
            workspaceId: 'workspace-123',
            customerId: 'customer-123'
          },
          createdAt: {
            gte: expect.any(Date)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

      // Verify AI summary was generated
      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('Mario Rossi')
        })
      )

      // Verify email was sent to admin
      const emailService = new EmailService()
      expect(emailService.sendOperatorNotificationEmail).toHaveBeenCalledWith({
        to: 'admin@testshop.com',
        customerName: 'Mario Rossi',
        chatSummary: expect.stringContaining('RIASSUNTO AI'),
        workspaceName: 'Test Shop',
        subject: '🔔 Cliente Mario Rossi richiede assistenza operatore',
        fromEmail: 'noreply@shopme.com'
      })

      // Verify response message
      expect(result).toEqual({
        message: 'Certo, verrà contattato il prima possibile dal nostro operatore.'
      })
    })

    it('should handle customer without email gracefully', async () => {
      const customerWithoutEmail = { ...mockCustomer, email: null }
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(customerWithoutEmail)

      const result = await ContactOperator({
        phone: '+393451234567',
        workspaceId: 'workspace-123'
      })

      // Should continue execution and log warning
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('has no email - continuing without email requirement')
      )

      expect(result).toEqual({
        message: 'Certo, verrà contattato il prima possibile dal nostro operatore.'
      })
    })

    it('should handle AI summary failure with fallback', async () => {
      // Mock AI failure
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('AI service unavailable'))

      const result = await ContactOperator({
        phone: '+393451234567',
        workspaceId: 'workspace-123'
      })

      // Should use fallback summary
      const emailService = new EmailService()
      expect(emailService.sendOperatorNotificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          chatSummary: expect.stringContaining('Riassunto AI non disponibile')
        })
      )

      expect(result.message).toBe('Certo, verrà contattato il prima possibile dal nostro operatore.')
    })

    it('should continue execution if email sending fails', async () => {
      const emailService = new EmailService()
      ;(emailService.sendOperatorNotificationEmail as jest.Mock).mockRejectedValue(
        new Error('SMTP error')
      )

      const result = await ContactOperator({
        phone: '+393451234567',
        workspaceId: 'workspace-123'
      })

      // Should log error but continue
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send operator notification email')
      )

      expect(result).toEqual({
        message: 'Certo, verrà contattato il prima possibile dal nostro operatore.'
      })
    })
  })

  describe('Error handling', () => {
    it('should throw error if phone or workspaceId is missing', async () => {
      await expect(ContactOperator({ phone: '', workspaceId: 'workspace-123' }))
        .rejects.toThrow('Missing phone or workspaceId')

      await expect(ContactOperator({ phone: '+393451234567', workspaceId: '' }))
        .rejects.toThrow('Missing phone or workspaceId')
    })

    it('should throw error if customer is not found', async () => {
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(null)

      await expect(ContactOperator({
        phone: '+393451234567',
        workspaceId: 'workspace-123'
      })).rejects.toThrow('Customer not found')
    })

    it('should throw error if workspace is not found', async () => {
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(mockCustomer)
      ;(prisma.workspace.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(ContactOperator({
        phone: '+393451234567',
        workspaceId: 'workspace-123'
      })).rejects.toThrow('Workspace not found')
    })

    it('should handle missing adminEmail gracefully', async () => {
      const workspaceWithoutAdmin = {
        ...mockWorkspace,
        whatsappSettings: { adminEmail: null }
      }
      ;(prisma.workspace.findUnique as jest.Mock).mockResolvedValue(workspaceWithoutAdmin)

      const result = await ContactOperator({
        phone: '+393451234567',
        workspaceId: 'workspace-123'
      })

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('No admin email configured')
      )

      expect(result.message).toBe('Certo, verrà contattato il prima possibile dal nostro operatore.')
    })
  })

  describe('AI Summary Generation', () => {
    beforeEach(() => {
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(mockCustomer)
      ;(prisma.workspace.findUnique as jest.Mock).mockResolvedValue(mockWorkspace)
      ;(prisma.customers.update as jest.Mock).mockResolvedValue(mockCustomer)
      ;(prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages)
    })

    it('should generate AI summary with correct parameters', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: { content: 'AI Summary Generated' }
          }]
        })
      })

      await ContactOperator({
        phone: '+393451234567',
        workspaceId: 'workspace-123'
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"model":"openai/gpt-4o-mini"')
        })
      )

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(fetchCall[1].body)
      
      expect(requestBody.temperature).toBe(0.3)
      expect(requestBody.max_tokens).toBe(400)
      expect(requestBody.messages).toHaveLength(2)
      expect(requestBody.messages[0].role).toBe('system')
      expect(requestBody.messages[1].role).toBe('user')
    })

    it('should include conversation context in AI prompt', async () => {
      await ContactOperator({
        phone: '+393451234567',
        workspaceId: 'workspace-123'
      })

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(fetchCall[1].body)
      const userPrompt = requestBody.messages[1].content

      expect(userPrompt).toContain('Mario Rossi')
      expect(userPrompt).toContain('Cliente: Ciao, vorrei informazioni sui prodotti')
      expect(userPrompt).toContain('Bot: Certo! Abbiamo vari prodotti disponibili')
    })
  })
})
