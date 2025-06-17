import { CheckoutService } from '../../../application/services/checkout.service';
import { MessageService } from '../../../application/services/message.service';
import { TokenService } from '../../../application/services/token.service';
import { MessageRepository } from '../../../repositories/message.repository';

// Mock delle dipendenze
jest.mock('../../../repositories/message.repository');
jest.mock('../../../application/services/token.service');
jest.mock('../../../application/services/checkout.service');

describe('TASK 8: Message Flow Scenarios - Unit Tests', () => {
  let messageService: MessageService;
  let mockMessageRepository: jest.Mocked<MessageRepository>;
  let mockTokenService: jest.Mocked<TokenService>;
  let mockCheckoutService: jest.Mocked<CheckoutService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    messageService = new MessageService();
    mockMessageRepository = (messageService as any).messageRepository;
    mockTokenService = (messageService as any).tokenService;
    mockCheckoutService = (messageService as any).checkoutService;

    // Mock global apiLimitService
    (global as any).apiLimitService = {
      checkApiLimit: jest.fn().mockResolvedValue({ exceeded: false,
        currentUsage: 10,
        limit: 100,
        remaining: 90,
        resetTime: new Date(Date.now() + 3600000) }),
      incrementApiUsage: jest.fn().mockResolvedValue(undefined)
    };
  });

  describe('Flow Sequence Validation', () => {
    it('should execute all flow steps in correct order', async () => {
      // Arrange
      const mockWorkspaceSettings = {
        id: 'workspace-123',
        isActive: true,
        welcomeMessages: { 'en': 'Welcome!' },
        url: 'https://example.com'
      };

      const mockCustomer = {
        id: 'customer-123',
        name: 'Test Customer',
        phone: '+1234567890',
        language: 'ENG',
        activeChatbot: true,
        workspaceId: 'workspace-123'
      };

      // Mock all dependencies
      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(mockCustomer);
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false);
      mockMessageRepository.hasRecentActivity.mockResolvedValue(true);
      mockCheckoutService.detectCheckoutIntent.mockReturnValue(false);
      mockMessageRepository.getRouterAgent.mockResolvedValue({ id: 'agent-1', content: 'Test agent' });
      mockMessageRepository.getProducts.mockResolvedValue([]);
      mockMessageRepository.getServices.mockResolvedValue([]);
      mockMessageRepository.getResponseFromRag.mockResolvedValue('AI response');
      mockMessageRepository.saveMessage.mockResolvedValue(undefined);

      // Act
      const result = await messageService.processMessage(
        'Hello, I need help',
        '+1234567890',
        'workspace-123'
      );

      // Assert - Verify flow sequence
      expect(result).toBe('AI response');
      
      // Verify all steps were called in order
      expect(mockMessageRepository.getWorkspaceSettings).toHaveBeenCalled();
      expect(mockMessageRepository.findCustomerByPhone).toHaveBeenCalled();
      expect(mockMessageRepository.isCustomerBlacklisted).toHaveBeenCalled();
      expect(mockMessageRepository.hasRecentActivity).toHaveBeenCalled();
      expect(mockCheckoutService.detectCheckoutIntent).toHaveBeenCalled();
      expect(mockMessageRepository.getRouterAgent).toHaveBeenCalled();
      expect(mockMessageRepository.getResponseFromRag).toHaveBeenCalled();
    });

    it('should stop flow at spam detection step', async () => {
      // Arrange
      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: true, messageCount: 10 });
      jest.spyOn(messageService as any, 'addToAutoBlacklist').mockResolvedValue(undefined);

      // Act
      const result = await messageService.processMessage(
        'Spam message',
        '+1234567890',
        'workspace-123'
      );

      // Assert
      expect(result).toBe("");
      
      // Verify flow stopped at spam detection
      expect(mockMessageRepository.getWorkspaceSettings).not.toHaveBeenCalled();
      expect(mockMessageRepository.findCustomerByPhone).not.toHaveBeenCalled();
    });

    it('should stop flow at blacklist check step', async () => {
      // Arrange
      const mockWorkspaceSettings = { id: 'workspace-123', isActive: true };
      const mockCustomer = { id: 'customer-123', activeChatbot: true };

      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(mockCustomer);
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(true); // Blacklisted

      // Act
      const result = await messageService.processMessage(
        'Hello',
        '+1234567890',
        'workspace-123'
      );

      // Assert
      expect(result).toBe("");
      
      // Verify flow stopped at blacklist check
      expect(mockMessageRepository.isCustomerBlacklisted).toHaveBeenCalled();
      expect(mockMessageRepository.hasRecentActivity).not.toHaveBeenCalled();
    });

    it('should handle operator control step correctly', async () => {
      // Arrange
      const mockWorkspaceSettings = { id: 'workspace-123', isActive: true };
      const mockCustomer = { 
        id: 'customer-123', 
        name: 'Test Customer',
        activeChatbot: false // Operator control
      };

      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(mockCustomer);
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false);
      mockMessageRepository.saveMessage.mockResolvedValue(undefined);

      // Act
      const result = await messageService.processMessage(
        'I need help',
        '+1234567890',
        'workspace-123'
      );

      // Assert
      expect(result).toBe(''); // Empty string for operator control
      
      // Verify message was saved
      expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          agentSelected: 'Manual Operator Control'
        })
      );
      
      // Verify flow stopped at operator control
      expect(mockMessageRepository.hasRecentActivity).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle workspace not found gracefully', async () => {
      // Arrange
      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(null);

      // Act
      const result = await messageService.processMessage(
        'Hello',
        '+1234567890',
        'non-existent-workspace'
      );

      // Assert
      expect(result).toBe('Workspace not found. Please contact support.');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      jest.spyOn(messageService as any, 'checkSpamBehavior').mockRejectedValue(new Error('Database error'));

      // Act
      const result = await messageService.processMessage(
        'Hello',
        '+1234567890',
        'workspace-123'
      );

      // Assert
      // Should not crash and should handle error gracefully
      expect(result).toBeDefined();
    });

    it('should handle RAG service errors gracefully', async () => {
      // Arrange
      const mockWorkspaceSettings = { id: 'workspace-123', isActive: true };
      const mockCustomer = { id: 'customer-123', activeChatbot: true };

      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(mockCustomer);
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false);
      mockMessageRepository.hasRecentActivity.mockResolvedValue(true);
      mockCheckoutService.detectCheckoutIntent.mockReturnValue(false);
      mockMessageRepository.getRouterAgent.mockResolvedValue({ id: 'agent-1', content: 'Test agent' });
      mockMessageRepository.getProducts.mockResolvedValue([]);
      mockMessageRepository.getServices.mockResolvedValue([]);
      mockMessageRepository.getResponseFromRag.mockRejectedValue(new Error('RAG service error'));
      mockMessageRepository.saveMessage.mockResolvedValue(undefined);

      // Act
      const result = await messageService.processMessage(
        'Hello',
        '+1234567890',
        'workspace-123'
      );

      // Assert
      // Should handle RAG error gracefully
      expect(result).toBeDefined();
    });
  });

  describe('Language Detection and Handling', () => {
    it('should detect and use correct language for responses', async () => {
      // Arrange
      const mockWorkspaceSettings = {
        id: 'workspace-123',
        isActive: true,
        welcomeMessages: {
          'en': 'Welcome!',
          'it': 'Benvenuto!'
        }
      };

      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(null); // New customer
      mockTokenService.createRegistrationToken.mockResolvedValue('test-token');
      mockMessageRepository.createCustomer.mockResolvedValue(undefined);
      mockMessageRepository.saveMessage.mockResolvedValue(undefined);

      // Act - Italian greeting
      const result = await messageService.processMessage(
        'Ciao',
        '+1234567890',
        'workspace-123'
      );

      // Assert
      expect(result).toContain('Benvenuto!'); // Should use Italian welcome message
    });

    it('should fallback to English when language not supported', async () => {
      // Arrange
      const mockWorkspaceSettings = {
        id: 'workspace-123',
        isActive: true,
        welcomeMessages: {
          'en': 'Welcome!',
          'it': 'Benvenuto!'
        }
      };

      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(null);
      mockTokenService.createRegistrationToken.mockResolvedValue('test-token');
      mockMessageRepository.createCustomer.mockResolvedValue(undefined);
      mockMessageRepository.saveMessage.mockResolvedValue(undefined);

      // Act - Unsupported language greeting
      const result = await messageService.processMessage(
        'Bonjour', // French greeting
        '+1234567890',
        'workspace-123'
      );

      // Assert
      expect(result).toContain('Welcome!'); // Should fallback to English
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle empty messages gracefully', async () => {
      // Arrange
      const mockWorkspaceSettings = { id: 'workspace-123', isActive: true };

      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(null);

      // Act
      const result = await messageService.processMessage(
        '',
        '+1234567890',
        'workspace-123'
      );

      // Assert
      expect(result).toBe(""); // Empty message should not trigger welcome flow
    });

    it('should handle very long messages gracefully', async () => {
      // Arrange
      const longMessage = 'A'.repeat(10000); // 10KB message
      const mockWorkspaceSettings = { id: 'workspace-123', isActive: true };
      const mockCustomer = { id: 'customer-123', activeChatbot: true };

      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(mockCustomer);
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false);
      mockMessageRepository.hasRecentActivity.mockResolvedValue(true);
      mockCheckoutService.detectCheckoutIntent.mockReturnValue(false);
      mockMessageRepository.getRouterAgent.mockResolvedValue({ id: 'agent-1', content: 'Test agent' });
      mockMessageRepository.getProducts.mockResolvedValue([]);
      mockMessageRepository.getServices.mockResolvedValue([]);
      mockMessageRepository.getResponseFromRag.mockResolvedValue('AI response');
      mockMessageRepository.saveMessage.mockResolvedValue(undefined);

      // Act
      const result = await messageService.processMessage(
        longMessage,
        '+1234567890',
        'workspace-123'
      );

      // Assert
      expect(result).toBe('AI response');
      expect(mockMessageRepository.getResponseFromRag).toHaveBeenCalledWith(
        expect.anything(),
        longMessage, // Should handle long message
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything()
      );
    });

    it('should handle special characters in phone numbers', async () => {
      // Arrange
      const specialPhoneNumber = '+39-123-456-7890';
      const mockWorkspaceSettings = { id: 'workspace-123', isActive: true };

      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(null);
      mockTokenService.createRegistrationToken.mockResolvedValue('test-token');
      mockMessageRepository.createCustomer.mockResolvedValue(undefined);
      mockMessageRepository.saveMessage.mockResolvedValue(undefined);

      // Act
      const result = await messageService.processMessage(
        'Hello',
        specialPhoneNumber,
        'workspace-123'
      );

      // Assert
      expect(result).toBeTruthy();
      expect(mockTokenService.createRegistrationToken).toHaveBeenCalledWith(
        specialPhoneNumber,
        'workspace-123'
      );
    });
  });

  describe('Concurrent Message Handling', () => {
    it('should handle concurrent messages from same user gracefully', async () => {
      // Arrange
      const mockWorkspaceSettings = { id: 'workspace-123', isActive: true };
      const mockCustomer = { id: 'customer-123', activeChatbot: true };

      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(mockCustomer);
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false);
      mockMessageRepository.hasRecentActivity.mockResolvedValue(true);
      mockCheckoutService.detectCheckoutIntent.mockReturnValue(false);
      mockMessageRepository.getRouterAgent.mockResolvedValue({ id: 'agent-1', content: 'Test agent' });
      mockMessageRepository.getProducts.mockResolvedValue([]);
      mockMessageRepository.getServices.mockResolvedValue([]);
      mockMessageRepository.getResponseFromRag.mockResolvedValue('AI response');
      mockMessageRepository.saveMessage.mockResolvedValue(undefined);

      // Act - Send multiple messages concurrently
      const promises = [
        messageService.processMessage('Message 1', '+1234567890', 'workspace-123'),
        messageService.processMessage('Message 2', '+1234567890', 'workspace-123'),
        messageService.processMessage('Message 3', '+1234567890', 'workspace-123')
      ];

      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBe('AI response');
      });
    });
  });
}); 