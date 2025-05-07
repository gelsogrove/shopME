import { mockDeep, mockReset } from 'jest-mock-extended';
import { MessageRepository } from '../../infrastructure/repositories/message.repository';
import { MessageService } from './message.service';

// Mock del repository
const mockMessageRepository = mockDeep<MessageRepository>();

describe('MessageService', () => {
  let service: MessageService;
  
  beforeEach(() => {
    mockReset(mockMessageRepository);
    service = new MessageService(mockMessageRepository);
  });
  
  describe('activeChatbot flag handling', () => {
    it('should skip bot response when customer has activeChatbot=false', async () => {
      // Arrange
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({ isActive: true } as any);
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue({ 
        id: 'customer-id', 
        name: 'Test Customer', 
        activeChatbot: false 
      } as any);
      
      // Act
      const result = await service.processMessage('test message', '+123456789', 'workspace-id');

      // Assert
      expect(result).toBe('');  // Empty string means no bot response
      expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: 'workspace-id',
          phoneNumber: '+123456789',
          message: 'test message',
          response: '',
          agentSelected: 'Manual Operator Control'
        })
      );
      
      // Verify that none of the chatbot processing methods were called
      expect(mockMessageRepository.getRouterAgent).not.toHaveBeenCalled();
      expect(mockMessageRepository.getResponseFromRag).not.toHaveBeenCalled();
      expect(mockMessageRepository.getConversationResponse).not.toHaveBeenCalled();
    });

    it('should process bot response normally when customer has activeChatbot=true', async () => {
      // Arrange
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({ isActive: true } as any);
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue({ 
        id: 'customer-id', 
        name: 'Test Customer', 
        activeChatbot: true,
        language: 'en'
      } as any);
      mockMessageRepository.getRouterAgent.mockResolvedValue({});
      mockMessageRepository.getProducts.mockResolvedValue([]);
      mockMessageRepository.getServices.mockResolvedValue([]);
      mockMessageRepository.getLatesttMessages.mockResolvedValue([]);
      mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue({ name: 'TestAgent' });
      mockMessageRepository.getResponseFromRag.mockResolvedValue('System prompt');
      mockMessageRepository.getConversationResponse.mockResolvedValue('Bot response');
      
      // Act
      const result = await service.processMessage('test message', '+123456789', 'workspace-id');

      // Assert
      expect(result).toBe('Bot response');
      expect(mockMessageRepository.getResponseFromAgentRouter).toHaveBeenCalled();
      expect(mockMessageRepository.getResponseFromRag).toHaveBeenCalled();
      expect(mockMessageRepository.getConversationResponse).toHaveBeenCalled();
    });
  });
}); 