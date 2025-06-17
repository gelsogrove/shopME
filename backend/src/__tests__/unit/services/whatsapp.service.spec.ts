import { PrismaClient } from '@prisma/client';
import { MessageService } from '../../../application/services/message.service';
import { WhatsAppService } from '../../../application/services/whatsapp.service';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    whatsappSettings: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    customers: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    chatSession: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    message: {
      create: jest.fn(),
    },
  })),
  MessageDirection: {
    INBOUND: 'INBOUND',
    OUTBOUND: 'OUTBOUND',
  },
}));

// Mock MessageService
jest.mock('../../../application/services/message.service');

describe('WhatsAppService', () => {
  let whatsappService: WhatsAppService;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockMessageService: jest.Mocked<MessageService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    whatsappService = new WhatsAppService();
    
    // Get the mocked instances
    mockPrisma = (whatsappService as any).prisma;
    mockMessageService = (whatsappService as any).messageService;
  });

  describe('processWebhook orchestration', () => {
    it('should call MessageService.processMessage when processing webhook', async () => {
      // Setup webhook data
      const webhookData = {
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '+1234567890',
                text: { body: 'Hello, I need help' },
                id: 'msg-123',
                timestamp: '1234567890'
              }]
            }
          }]
        }]
      };

      // Mock database responses
      mockPrisma.whatsappSettings.findFirst.mockResolvedValue({
        id: 'settings-1',
        workspaceId: 'workspace-123',
        phoneNumber: '+1234567890',
        apiKey: 'test-key'
      } as any);

      mockPrisma.customers.findFirst.mockResolvedValue({
        id: 'customer-1',
        phone: '+1234567890',
        name: 'Test Customer',
        workspaceId: 'workspace-123'
      } as any);

      mockPrisma.chatSession.findFirst.mockResolvedValue({
        id: 'session-1',
        customerId: 'customer-1',
        workspaceId: 'workspace-123',
        status: 'active'
      } as any);

      mockPrisma.message.create.mockResolvedValue({
        id: 'message-1'
      } as any);

      // Mock MessageService response
      mockMessageService.processMessage.mockResolvedValue('Bot response: How can I help you?');

      // Execute
      await whatsappService.processWebhook(webhookData);

      // Verify MessageService was called with correct parameters
      expect(mockMessageService.processMessage).toHaveBeenCalledWith(
        'Hello, I need help',
        '+1234567890',
        'workspace-123'
      );

      // Verify incoming message was saved
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: {
          chatSessionId: 'session-1',
          content: 'Hello, I need help',
          direction: 'INBOUND',
          type: 'TEXT',
          metadata: {
            messageId: 'msg-123',
            timestamp: '1234567890',
            source: 'whatsapp'
          }
        }
      });

      // Verify bot response was saved
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: {
          chatSessionId: 'session-1',
          content: 'Bot response: How can I help you?',
          direction: 'OUTBOUND',
          type: 'TEXT',
          metadata: {
            source: 'whatsapp_bot',
            timestamp: expect.any(String)
          }
        }
      });
    });

    it('should handle null response from MessageService (blocked message)', async () => {
      // Setup webhook data
      const webhookData = {
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '+1234567890',
                text: { body: 'Spam message' },
                id: 'msg-123',
                timestamp: '1234567890'
              }]
            }
          }]
        }]
      };

      // Mock database responses
      mockPrisma.whatsappSettings.findFirst.mockResolvedValue({
        id: 'settings-1',
        workspaceId: 'workspace-123',
        phoneNumber: '+1234567890',
        apiKey: 'test-key'
      } as any);

      mockPrisma.customers.findFirst.mockResolvedValue({
        id: 'customer-1',
        phone: '+1234567890',
        name: 'Test Customer',
        workspaceId: 'workspace-123'
      } as any);

      mockPrisma.chatSession.findFirst.mockResolvedValue({
        id: 'session-1',
        customerId: 'customer-1',
        workspaceId: 'workspace-123',
        status: 'active'
      } as any);

      mockPrisma.message.create.mockResolvedValue({
        id: 'message-1'
      } as any);

      // Mock MessageService returning null (blocked message)
      mockMessageService.processMessage.mockResolvedValue(null);

      // Execute
      await whatsappService.processWebhook(webhookData);

      // Verify MessageService was called
      expect(mockMessageService.processMessage).toHaveBeenCalledWith(
        'Spam message',
        '+1234567890',
        'workspace-123'
      );

      // Verify incoming message was saved
      expect(mockPrisma.message.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: {
          chatSessionId: 'session-1',
          content: 'Spam message',
          direction: 'INBOUND',
          type: 'TEXT',
          metadata: {
            messageId: 'msg-123',
            timestamp: '1234567890',
            source: 'whatsapp'
          }
        }
      });

      // Verify NO bot response was saved (because message was blocked)
      expect(mockPrisma.message.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            direction: 'OUTBOUND'
          })
        })
      );
    });

    it('should handle empty response from MessageService (operator control)', async () => {
      // Setup webhook data
      const webhookData = {
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '+1234567890',
                text: { body: 'Customer message' },
                id: 'msg-123',
                timestamp: '1234567890'
              }]
            }
          }]
        }]
      };

      // Mock database responses
      mockPrisma.whatsappSettings.findFirst.mockResolvedValue({
        id: 'settings-1',
        workspaceId: 'workspace-123',
        phoneNumber: '+1234567890',
        apiKey: 'test-key'
      } as any);

      mockPrisma.customers.findFirst.mockResolvedValue({
        id: 'customer-1',
        phone: '+1234567890',
        name: 'Test Customer',
        workspaceId: 'workspace-123'
      } as any);

      mockPrisma.chatSession.findFirst.mockResolvedValue({
        id: 'session-1',
        customerId: 'customer-1',
        workspaceId: 'workspace-123',
        status: 'active'
      } as any);

      mockPrisma.message.create.mockResolvedValue({
        id: 'message-1'
      } as any);

      // Mock MessageService returning empty string (operator control)
      mockMessageService.processMessage.mockResolvedValue('');

      // Execute
      await whatsappService.processWebhook(webhookData);

      // Verify MessageService was called
      expect(mockMessageService.processMessage).toHaveBeenCalledWith(
        'Customer message',
        '+1234567890',
        'workspace-123'
      );

      // Verify incoming message was saved
      expect(mockPrisma.message.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: {
          chatSessionId: 'session-1',
          content: 'Customer message',
          direction: 'INBOUND',
          type: 'TEXT',
          metadata: {
            messageId: 'msg-123',
            timestamp: '1234567890',
            source: 'whatsapp'
          }
        }
      });

      // Verify NO bot response was saved (because response was empty)
      expect(mockPrisma.message.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            direction: 'OUTBOUND'
          })
        })
      );
    });

    it('should handle MessageService errors gracefully', async () => {
      // Setup webhook data
      const webhookData = {
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '+1234567890',
                text: { body: 'Test message' },
                id: 'msg-123',
                timestamp: '1234567890'
              }]
            }
          }]
        }]
      };

      // Mock database responses
      mockPrisma.whatsappSettings.findFirst.mockResolvedValue({
        id: 'settings-1',
        workspaceId: 'workspace-123',
        phoneNumber: '+1234567890',
        apiKey: 'test-key'
      } as any);

      mockPrisma.customers.findFirst.mockResolvedValue({
        id: 'customer-1',
        phone: '+1234567890',
        name: 'Test Customer',
        workspaceId: 'workspace-123'
      } as any);

      mockPrisma.chatSession.findFirst.mockResolvedValue({
        id: 'session-1',
        customerId: 'customer-1',
        workspaceId: 'workspace-123',
        status: 'active'
      } as any);

      mockPrisma.message.create.mockResolvedValue({
        id: 'message-1'
      } as any);

      // Mock MessageService throwing an error
      mockMessageService.processMessage.mockRejectedValue(new Error('Processing failed'));

      // Execute
      await whatsappService.processWebhook(webhookData);

      // Verify MessageService was called
      expect(mockMessageService.processMessage).toHaveBeenCalledWith(
        'Test message',
        '+1234567890',
        'workspace-123'
      );

      // Verify incoming message was saved
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: {
          chatSessionId: 'session-1',
          content: 'Test message',
          direction: 'INBOUND',
          type: 'TEXT',
          metadata: {
            messageId: 'msg-123',
            timestamp: '1234567890',
            source: 'whatsapp'
          }
        }
      });

      // Verify error response was saved
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: {
          chatSessionId: 'session-1',
          content: 'Mi dispiace, si è verificato un errore. Riprova più tardi.',
          direction: 'OUTBOUND',
          type: 'TEXT',
          metadata: {
            source: 'whatsapp_bot_error',
            timestamp: expect.any(String),
            error: 'Processing failed'
          }
        }
      });
    });
  });
}); 