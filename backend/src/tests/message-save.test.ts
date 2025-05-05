import '@jest/globals';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MessageDirection } from '@prisma/client';
import { MessageService } from '../application/services/message.service';
import { MessageRepository } from '../infrastructure/repositories/message.repository';

// Mock dependencies
jest.mock('../infrastructure/repositories/message.repository');
jest.mock('../utils/logger');

describe('Message Metadata Saving Tests', () => {
  let messageService: MessageService;
  let mockMessageRepository: jest.Mocked<MessageRepository>;
  let capturedSaveParams: any = null;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    capturedSaveParams = null;
    
    // Create a new instance of the service before each test
    messageService = new MessageService();
    
    // Get the mocked repository instance
    mockMessageRepository = (MessageRepository as jest.MockedClass<typeof MessageRepository>).mock.instances[0] as jest.Mocked<MessageRepository>;
    
    // Set up default responses for common methods
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: 'test-workspace-id',
      isActive: true
    } as any);
    
    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false);
    
    // Mock a registered customer
    mockMessageRepository.findCustomerByPhone.mockResolvedValue({
      id: 'test-customer-id',
      name: 'Test Customer',
      phone: '+1234567890',
      language: 'Italian'
    } as any);
    
    // Mock message saving to capture parameters
    mockMessageRepository.saveMessage.mockImplementation((data) => {
      capturedSaveParams = data;
      return Promise.resolve({
        id: 'test-message-id',
        content: data.response,
        chatSessionId: 'test-session-id',
        direction: MessageDirection.OUTBOUND,
        createdAt: new Date(),
        metadata: data.agentSelected ? { agentName: data.agentSelected } : {},
      } as any);
    });
    
    // Mock agent routing
    mockMessageRepository.getRouterAgent.mockResolvedValue('router prompt');
    mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue({
      name: 'Generic',
      content: 'You are a generic agent',
      department: 'GENERIC'
    });
    
    // Mock response generation
    mockMessageRepository.getProducts.mockResolvedValue([]);
    mockMessageRepository.getServices.mockResolvedValue([]);
    mockMessageRepository.getLatesttMessages.mockResolvedValue([]);
    mockMessageRepository.getResponseFromRag.mockResolvedValue('Test response');
    mockMessageRepository.getConversationResponse.mockResolvedValue('Test response');
  });

  it('should save message with Generic agent name metadata by default', async () => {
    // Execute
    await messageService.processMessage('Hello', '+1234567890', 'test-workspace-id');
    
    // Verify saveMessage was called with correct agent name
    expect(capturedSaveParams).toBeTruthy();
    expect(capturedSaveParams.agentSelected).toBe('Generic');
  });

  it('should save message with Products agent name metadata', async () => {
    // Setup Products agent selection
    mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue({
      name: 'Products',
      content: 'You are a products agent',
      department: 'PRODUCTS'
    });
    
    // Execute
    await messageService.processMessage('Show me your products', '+1234567890', 'test-workspace-id');
    
    // Verify
    expect(capturedSaveParams).toBeTruthy();
    expect(capturedSaveParams.agentSelected).toBe('Products');
  });

  it('should save message with Services agent name metadata', async () => {
    // Setup Services agent selection
    mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue({
      name: 'Services',
      content: 'You are a services agent',
      department: 'SERVICES'
    });
    
    // Execute
    await messageService.processMessage('What services do you offer?', '+1234567890', 'test-workspace-id');
    
    // Verify
    expect(capturedSaveParams).toBeTruthy();
    expect(capturedSaveParams.agentSelected).toBe('Services');
  });

  it('should save message with Customer agent name metadata', async () => {
    // Setup Customer agent selection
    mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue({
      name: 'Customer',
      content: 'You are a customer service agent',
      department: 'CUSTOMER'
    });
    
    // Execute
    await messageService.processMessage('I have a question about my order', '+1234567890', 'test-workspace-id');
    
    // Verify
    expect(capturedSaveParams).toBeTruthy();
    expect(capturedSaveParams.agentSelected).toBe('Customer');
  });

  it('should save "Error" agent name when an error occurs during response generation', async () => {
    // Setup error scenario
    mockMessageRepository.getResponseFromRag.mockRejectedValue(new Error('API error'));
    
    // Execute
    await messageService.processMessage('This will trigger an error', '+1234567890', 'test-workspace-id');
    
    // Verify
    expect(capturedSaveParams).toBeTruthy();
    expect(capturedSaveParams.agentSelected).toBe('Error');
  });
  
  it('should save all required message data', async () => {
    // Execute
    const testMessage = 'Test message';
    const testPhone = '+1234567890';
    const testWorkspaceId = 'test-workspace-id';
    
    await messageService.processMessage(testMessage, testPhone, testWorkspaceId);
    
    // Verify all required data is saved
    expect(capturedSaveParams).toEqual({
      workspaceId: testWorkspaceId,
      phoneNumber: testPhone,
      message: testMessage,
      response: 'Test response',
      agentSelected: 'Generic'
    });
  });
}); 