import { ApiLimitService } from "../../../application/services/api-limit.service";
import { CheckoutService } from "../../../application/services/checkout.service";
import { MessageService } from "../../../application/services/message.service";
import { TokenService } from "../../../application/services/token.service";
import { MessageRepository } from "../../../repositories/message.repository";

/**
 * 🧪 MessageService Unit Tests
 * Tests for the core message processing service following DDD architecture
 */
describe("MessageService", () => {
  let messageService: MessageService;
  let mockMessageRepository: jest.Mocked<MessageRepository>;
  let mockTokenService: jest.Mocked<TokenService>;
  let mockCheckoutService: jest.Mocked<CheckoutService>;
  let mockApiLimitService: jest.Mocked<ApiLimitService>;

  beforeEach(() => {
    // Create comprehensive mocks
    mockMessageRepository = {
      getWorkspaceSettings: jest.fn(),
      findCustomerByPhone: jest.fn(),
      isCustomerBlacklisted: jest.fn(),
      hasRecentActivity: jest.fn(),
      getWelcomeBackMessage: jest.fn(),
      saveMessage: jest.fn(),
      updateCustomerLanguage: jest.fn(),
      checkSpamBehavior: jest.fn(),
      addToAutoBlacklist: jest.fn(),
      getResponseFromRag: jest.fn()
    } as any;

    mockTokenService = {
      createRegistrationToken: jest.fn()
    } as any;

    mockCheckoutService = {
      detectCheckoutIntent: jest.fn()
    } as any;

    mockApiLimitService = {
      checkApiLimit: jest.fn(),
      incrementApiUsage: jest.fn()
    } as any;

    // Create service with mocked dependencies
    messageService = new MessageService(
      mockMessageRepository,
      mockTokenService,
      mockCheckoutService,
      mockApiLimitService
    );
  });

  describe("Dependency Injection", () => {
    it("should create MessageService with dependency injection", () => {
      expect(messageService).toBeDefined();
      expect(messageService.getMessageRepository()).toBe(mockMessageRepository);
    });

    it("should create MessageService with default dependencies", () => {
      const serviceWithDefaults = new MessageService();
      expect(serviceWithDefaults).toBeDefined();
      expect(serviceWithDefaults.getMessageRepository()).toBeDefined();
    });
  });

  describe("API Limit Check", () => {
    it("should return null when API limit is exceeded", async () => {
      // Arrange
      mockApiLimitService.checkApiLimit.mockResolvedValue({
        exceeded: true,
        currentUsage: 101,
        limit: 100,
        remaining: 0,
        resetTime: new Date()
      });

      // Act
      const result = await messageService.processMessage("Hello", "+1234567890", "workspace-1");

      // Assert
      expect(result).toBeNull();
      expect(mockApiLimitService.checkApiLimit).toHaveBeenCalledWith("workspace-1", "whatsapp_message");
    });

    it("should continue processing when API limit is not exceeded", async () => {
      // Arrange
      mockApiLimitService.checkApiLimit.mockResolvedValue({
        exceeded: false,
        currentUsage: 50,
        limit: 100,
        remaining: 50,
        resetTime: new Date()
      });

      mockMessageRepository.checkSpamBehavior.mockResolvedValue({
        isSpam: false,
        messageCount: 1
      });

      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        isActive: false,
        wipMessages: { en: "We are currently under maintenance" }
      });

      // Act
      const result = await messageService.processMessage("Hello", "+1234567890", "workspace-1");

      // Assert
      expect(mockApiLimitService.checkApiLimit).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("Spam Detection", () => {
    it("should block and blacklist spam behavior", async () => {
      // Arrange
      mockApiLimitService.checkApiLimit.mockResolvedValue({
        exceeded: false,
        currentUsage: 50,
        limit: 100,
        remaining: 50,
        resetTime: new Date()
      });

      mockMessageRepository.checkSpamBehavior.mockResolvedValue({
        isSpam: true,
        messageCount: 15
      });

      mockMessageRepository.addToAutoBlacklist.mockResolvedValue();

      // Act
      const result = await messageService.processMessage("Spam message", "+1234567890", "workspace-1");

      // Assert
      expect(result).toBeNull();
      expect(mockMessageRepository.addToAutoBlacklist).toHaveBeenCalledWith(
        "+1234567890",
        "workspace-1",
        "Auto-blacklisted for spam behavior: 15 messages in 30 seconds"
      );
    });
  });

  describe("Workspace Active Check", () => {
    it("should send WIP message but continue processing when workspace is inactive", async () => {
      // Arrange
      mockApiLimitService.checkApiLimit.mockResolvedValue({
        exceeded: false,
        currentUsage: 50,
        limit: 100,
        remaining: 50,
        resetTime: new Date()
      });

      mockMessageRepository.checkSpamBehavior.mockResolvedValue({
        isSpam: false,
        messageCount: 1
      });

      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        isActive: false,
        wipMessages: { en: "We are currently under maintenance" }
      });

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(null);
      mockMessageRepository.saveMessage.mockResolvedValue();

      // Act
      const result = await messageService.processMessage("Hello", "+1234567890", "workspace-1");

      // Assert
      expect(mockMessageRepository.saveMessage).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("Greeting Detection", () => {
    it("should detect English greetings", () => {
      const greetings = ["hello", "hi", "hey", "good morning"];
      
      greetings.forEach(greeting => {
        // Use reflection to access private method for testing
        const detectedLang = (messageService as any).detectGreeting(greeting);
        expect(detectedLang).toBe("en");
      });
    });

    it("should detect Italian greetings", () => {
      const greetings = ["ciao", "salve", "buongiorno", "buonasera"];
      
      greetings.forEach(greeting => {
        const detectedLang = (messageService as any).detectGreeting(greeting);
        expect(detectedLang).toBe("it");
      });
    });

    it("should return null for non-greeting messages", () => {
      const nonGreetings = ["I need help", "What is your price?", "Order status"];
      
      nonGreetings.forEach(message => {
        const detectedLang = (messageService as any).detectGreeting(message);
        expect(detectedLang).toBeNull();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      // Arrange
      mockApiLimitService.checkApiLimit.mockRejectedValue(new Error("Database connection failed"));

      // Act
      const result = await messageService.processMessage("Hello", "+1234567890", "workspace-1");

      // Assert
      expect(result).toBeNull();
    });

    it("should handle missing workspace settings", async () => {
      // Arrange
      mockApiLimitService.checkApiLimit.mockResolvedValue({
        exceeded: false,
        currentUsage: 50,
        limit: 100,
        remaining: 50,
        resetTime: new Date()
      });

      mockMessageRepository.checkSpamBehavior.mockResolvedValue({
        isSpam: false,
        messageCount: 1
      });

      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(null);

      // Act
      const result = await messageService.processMessage("Hello", "+1234567890", "workspace-1");

      // Assert
      expect(result).toBeDefined(); // Should handle gracefully
    });
  });
}); 