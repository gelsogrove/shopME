import { ApiLimitService } from '../../../application/services/api-limit.service';
import { CheckoutService } from '../../../application/services/checkout.service';
import { MessageService } from '../../../application/services/message.service';
import { TokenService } from '../../../application/services/token.service';
import { MessageRepository } from '../../../repositories/message.repository';

// Mock delle dipendenze
jest.mock('../../../repositories/message.repository');
jest.mock('../../../application/services/token.service');
jest.mock('../../../application/services/checkout.service');
jest.mock('../../../application/services/api-limit.service');

describe('TASK 7: WIP Message Fix', () => {
  let messageService: MessageService;
  let mockMessageRepository: jest.Mocked<MessageRepository>;
  let mockTokenService: jest.Mocked<TokenService>;
  let mockCheckoutService: jest.Mocked<CheckoutService>;
  let mockApiLimitService: jest.Mocked<ApiLimitService>;

  beforeEach(() => {
    // Reset dei mock
    jest.clearAllMocks();
    
    // Setup del service
    messageService = new MessageService();
    mockMessageRepository = (messageService as any).messageRepository;
    mockTokenService = (messageService as any).tokenService;
    mockCheckoutService = (messageService as any).checkoutService;
    
    // Mock ApiLimitService
    mockApiLimitService = {
      checkApiLimit: jest.fn(),
      incrementApiUsage: jest.fn()
    } as any;
    
    // Replace the global apiLimitService
    (global as any).apiLimitService = mockApiLimitService;
  });

  describe('WIP Message Behavior', () => {
    const mockWorkspaceSettings = {
      id: 'workspace-123',
      isActive: false, // Workspace inactive to trigger WIP
      wipMessages: {
        'en': 'Service temporarily unavailable. We will be back soon!',
        'it': 'Servizio temporaneamente non disponibile. Torneremo presto!',
        'es': 'Servicio temporalmente no disponible. ¡Volveremos pronto!'
      },
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

    it('should send WIP notification but continue with normal flow processing', async () => {
      // Arrange
      mockApiLimitService.checkApiLimit.mockResolvedValue({ 
        exceeded: false,
        currentUsage: 10,
        limit: 100,
        remaining: 90,
        resetTime: new Date(Date.now() + 3600000)
      });
      mockApiLimitService.incrementApiUsage.mockResolvedValue(undefined);
      
      // Mock spam check
      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      
      // Mock workspace settings (inactive)
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings);
      
      // Mock customer
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(mockCustomer);
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false);
      mockMessageRepository.hasRecentActivity.mockResolvedValue(true); // Skip welcome back
      
      // Mock checkout service
      mockCheckoutService.detectCheckoutIntent.mockReturnValue(false);
      
      // Mock normal AI processing
      mockMessageRepository.getRouterAgent.mockResolvedValue({ id: 'agent-1', content: 'Test agent' });
      mockMessageRepository.getProducts.mockResolvedValue([]);
      mockMessageRepository.getServices.mockResolvedValue([]);
      mockMessageRepository.getResponseFromRag.mockResolvedValue('AI response after WIP');
      mockMessageRepository.saveMessage.mockResolvedValue(undefined);

      // Act
      const result = await messageService.processMessage(
        'Hello, I need help',
        '+1234567890',
        'workspace-123'
      );

      // Assert
      // Should NOT return WIP message (should continue processing)
      expect(result).toBe('AI response after WIP');
      
      // Should save WIP notification message
      expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: 'workspace-123',
          phoneNumber: '+1234567890',
          message: 'Hello, I need help',
          response: 'Service temporarily unavailable. We will be back soon!',
          agentSelected: 'WIP Notification'
        })
      );
      
      // Should continue with normal AI processing
      expect(mockMessageRepository.getRouterAgent).toHaveBeenCalled();
      expect(mockMessageRepository.getResponseFromRag).toHaveBeenCalled();
      
      // Should save final AI response
      expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          response: 'AI response after WIP',
          agentSelected: expect.any(String)
        })
      );
    });

    it('should use correct language for WIP message', async () => {
      // Arrange - Customer with Italian language
      const italianCustomer = { ...mockCustomer, language: 'ITA' };
      
      mockApiLimitService.checkApiLimit.mockResolvedValue({ 
        exceeded: false,
        currentUsage: 10,
        limit: 100,
        remaining: 90,
        resetTime: new Date(Date.now() + 3600000)
      });
      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(italianCustomer);
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false);
      mockMessageRepository.hasRecentActivity.mockResolvedValue(true);
      mockCheckoutService.detectCheckoutIntent.mockReturnValue(false);
      mockMessageRepository.getRouterAgent.mockResolvedValue({ id: 'agent-1', content: 'Test agent' });
      mockMessageRepository.getProducts.mockResolvedValue([]);
      mockMessageRepository.getServices.mockResolvedValue([]);
      mockMessageRepository.getResponseFromRag.mockResolvedValue('Risposta AI');
      mockMessageRepository.saveMessage.mockResolvedValue(undefined);

      // Act
      const result = await messageService.processMessage(
        'Ciao, ho bisogno di aiuto',
        '+1234567890',
        'workspace-123'
      );

      // Assert
      // Should use Italian WIP message
      expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          response: 'Servizio temporaneamente non disponibile. Torneremo presto!',
          agentSelected: 'WIP Notification'
        })
      );
      
      // Should continue and return AI response
      expect(result).toBe('Risposta AI');
    });

    it('should fallback to English WIP message when customer language not available', async () => {
      // Arrange - Customer with unsupported language
      const frenchCustomer = { ...mockCustomer, language: 'FRA' };
      
      mockApiLimitService.checkApiLimit.mockResolvedValue({ 
        exceeded: false,
        currentUsage: 10,
        limit: 100,
        remaining: 90,
        resetTime: new Date(Date.now() + 3600000)
      });
      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(frenchCustomer);
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
        'Bonjour, j\'ai besoin d\'aide',
        '+1234567890',
        'workspace-123'
      );

      // Assert
      // Should fallback to English WIP message
      expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          response: 'Service temporarily unavailable. We will be back soon!',
          agentSelected: 'WIP Notification'
        })
      );
      
      // Should continue and return AI response
      expect(result).toBe('AI response');
    });

    it('should handle WIP scenario with new customer (no existing customer)', async () => {
      // Arrange - No existing customer
      mockApiLimitService.checkApiLimit.mockResolvedValue({ 
        exceeded: false,
        currentUsage: 10,
        limit: 100,
        remaining: 90,
        resetTime: new Date(Date.now() + 3600000)
      });
      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(null); // No customer
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false);
      mockTokenService.createRegistrationToken.mockResolvedValue('test-token');
      mockMessageRepository.createCustomer.mockResolvedValue(undefined);
      mockMessageRepository.saveMessage.mockResolvedValue(undefined);

      // Act
      const result = await messageService.processMessage(
        'Hello', // Greeting to trigger welcome flow
        '+1234567890',
        'workspace-123'
      );

      // Assert
      // Should send WIP notification first
      expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          response: 'Service temporarily unavailable. We will be back soon!',
          agentSelected: 'WIP Notification'
        })
      );
      
      // Should continue with welcome flow for new user
      expect(mockTokenService.createRegistrationToken).toHaveBeenCalled();
      expect(mockMessageRepository.createCustomer).toHaveBeenCalled();
      
      // Should return welcome message with registration link
      expect(result).toContain('https://example.com/register');
    });

    it('should work correctly when workspace is active (no WIP message)', async () => {
      // Arrange - Active workspace (no WIP)
      const activeWorkspaceSettings = { ...mockWorkspaceSettings, isActive: true };
      
      mockApiLimitService.checkApiLimit.mockResolvedValue({ 
        exceeded: false,
        currentUsage: 10,
        limit: 100,
        remaining: 90,
        resetTime: new Date(Date.now() + 3600000)
      });
      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({ isSpam: false, messageCount: 1 });
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(activeWorkspaceSettings);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(mockCustomer);
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false);
      mockMessageRepository.hasRecentActivity.mockResolvedValue(true);
      mockCheckoutService.detectCheckoutIntent.mockReturnValue(false);
      mockMessageRepository.getRouterAgent.mockResolvedValue({ id: 'agent-1', content: 'Test agent' });
      mockMessageRepository.getProducts.mockResolvedValue([]);
      mockMessageRepository.getServices.mockResolvedValue([]);
      mockMessageRepository.getResponseFromRag.mockResolvedValue('Normal AI response');
      mockMessageRepository.saveMessage.mockResolvedValue(undefined);

      // Act
      const result = await messageService.processMessage(
        'Hello, I need help',
        '+1234567890',
        'workspace-123'
      );

      // Assert
      // Should NOT send WIP notification
      expect(mockMessageRepository.saveMessage).not.toHaveBeenCalledWith(
        expect.objectContaining({
          agentSelected: 'WIP Notification'
        })
      );
      
      // Should process normally
      expect(result).toBe('Normal AI response');
      expect(mockMessageRepository.getRouterAgent).toHaveBeenCalled();
    });
  });
}); 