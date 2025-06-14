// @ts-nocheck
import "@jest/globals";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MessageService } from "../../../application/services/message.service";
import { TokenService } from "../../../application/services/token.service";
import { MessageRepository } from "../../../repositories/message.repository";
import logger from "../../../utils/logger";

// Mock dependencies
jest.mock("../../../repositories/message.repository");
jest.mock("../../../application/services/token.service");
jest.mock("../../../utils/logger");

describe("MessageService - Spam Detection", () => {
  let messageService: MessageService;
  let mockMessageRepository: jest.Mocked<MessageRepository>;
  let mockTokenService: jest.Mocked<TokenService>;

  const workspaceId = "test-workspace-id";
  const phoneNumber = "+1234567890";
  const spamMessage = "spam message";

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mocked instances
    mockMessageRepository = new MessageRepository() as jest.Mocked<MessageRepository>;
    mockTokenService = new TokenService() as jest.Mocked<TokenService>;

    // Create service instance
    messageService = new MessageService();
    
    // Inject mocked dependencies
    (messageService as any).messageRepository = mockMessageRepository;
    (messageService as any).tokenService = mockTokenService;

    // Setup default mocks
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: workspaceId,
      isActive: true,
      welcomeMessages: { en: "Welcome!" },
    } as any);
  });

  describe("Spam Detection Logic", () => {
    it("should detect spam when user sends 10 messages in 30 seconds", async () => {
      // Setup: Mock 10 recent messages (spam threshold)
      mockMessageRepository.countRecentMessages.mockResolvedValue(10);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue({
        id: "customer-id",
        phone: phoneNumber,
        name: "Test Customer",
        workspaceId,
      } as any);

      // Execute
      const result = await messageService.processMessage(spamMessage, phoneNumber, workspaceId);

      // Assert: Should return null (blocked)
      expect(result).toBeNull();
      
      // Verify spam check was called
      expect(mockMessageRepository.countRecentMessages).toHaveBeenCalledWith(
        phoneNumber,
        workspaceId,
        expect.any(Date)
      );

      // Verify auto-blacklist methods were called
      expect(mockMessageRepository.updateCustomerBlacklist).toHaveBeenCalledWith(
        "customer-id",
        workspaceId,
        true
      );
      expect(mockMessageRepository.addToWorkspaceBlocklist).toHaveBeenCalledWith(
        phoneNumber,
        workspaceId
      );
    });

    it("should allow message when user sends less than 10 messages in 30 seconds", async () => {
      // Setup: Mock 5 recent messages (below spam threshold)
      mockMessageRepository.countRecentMessages.mockResolvedValue(5);
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue({
        id: "customer-id",
        phone: phoneNumber,
        name: "Test Customer",
        workspaceId,
        activeChatbot: true,
      } as any);

      // Mock other required methods for normal processing
      mockMessageRepository.getAgentByWorkspaceId.mockResolvedValue({
        name: "Test Agent",
        content: "Test prompt",
      });
      mockMessageRepository.getResponseFromAgent.mockResolvedValue({
        name: "Test Agent",
        content: "Test response",
      });
      mockMessageRepository.getProducts.mockResolvedValue([]);
      mockMessageRepository.getServices.mockResolvedValue([]);
      mockMessageRepository.getLatesttMessages.mockResolvedValue([]);
      mockMessageRepository.getResponseFromRag.mockResolvedValue("Test prompt");
      mockMessageRepository.getConversationResponse.mockResolvedValue("Test response");

      // Execute
      const result = await messageService.processMessage("normal message", phoneNumber, workspaceId);

      // Assert: Should process normally (not null)
      expect(result).not.toBeNull();
      expect(result).toBe("Test response");
      
      // Verify spam check was called but didn't trigger blacklist
      expect(mockMessageRepository.countRecentMessages).toHaveBeenCalled();
      expect(mockMessageRepository.updateCustomerBlacklist).not.toHaveBeenCalled();
      expect(mockMessageRepository.addToWorkspaceBlocklist).not.toHaveBeenCalled();
    });

    it("should handle spam detection errors gracefully", async () => {
      // Setup: Mock error in spam detection
      mockMessageRepository.countRecentMessages.mockRejectedValue(new Error("Database error"));
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue({
        id: "customer-id",
        phone: phoneNumber,
        name: "Test Customer",
        workspaceId,
        activeChatbot: true,
      } as any);

      // Mock other required methods
      mockMessageRepository.getAgentByWorkspaceId.mockResolvedValue({
        name: "Test Agent",
        content: "Test prompt",
      });
      mockMessageRepository.getResponseFromAgent.mockResolvedValue({
        name: "Test Agent",
        content: "Test response",
      });
      mockMessageRepository.getProducts.mockResolvedValue([]);
      mockMessageRepository.getServices.mockResolvedValue([]);
      mockMessageRepository.getLatesttMessages.mockResolvedValue([]);
      mockMessageRepository.getResponseFromRag.mockResolvedValue("Test prompt");
      mockMessageRepository.getConversationResponse.mockResolvedValue("Test response");

      // Execute
      const result = await messageService.processMessage("normal message", phoneNumber, workspaceId);

      // Assert: Should continue processing despite spam detection error
      expect(result).toBe("Test response");
      
      // Verify error was logged
      expect(logger.error).toHaveBeenCalledWith("Error checking spam behavior:", expect.any(Error));
    });

    it("should auto-blacklist customer without existing customer record", async () => {
      // Setup: Mock 10 recent messages but no existing customer
      mockMessageRepository.countRecentMessages.mockResolvedValue(10);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(null);

      // Execute
      const result = await messageService.processMessage(spamMessage, phoneNumber, workspaceId);

      // Assert: Should return null (blocked)
      expect(result).toBeNull();
      
      // Verify spam check was called
      expect(mockMessageRepository.countRecentMessages).toHaveBeenCalled();

      // Verify workspace blocklist was updated even without customer
      expect(mockMessageRepository.addToWorkspaceBlocklist).toHaveBeenCalledWith(
        phoneNumber,
        workspaceId
      );
      
      // Customer blacklist update should not be called since no customer exists
      expect(mockMessageRepository.updateCustomerBlacklist).not.toHaveBeenCalled();
    });
  });

  describe("Time Window Calculation", () => {
    it("should check messages within exactly 30 seconds", async () => {
      // Setup
      const mockDate = new Date("2024-01-01T12:00:00Z");
      const expectedSinceDate = new Date("2024-01-01T11:59:30Z"); // 30 seconds earlier
      
      jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
      
      mockMessageRepository.countRecentMessages.mockResolvedValue(5);
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false);
      mockMessageRepository.findCustomerByPhone.mockResolvedValue({
        id: "customer-id",
        activeChatbot: true,
      } as any);

      // Mock other methods
      mockMessageRepository.getAgentByWorkspaceId.mockResolvedValue({ name: "Test" });
      mockMessageRepository.getResponseFromAgent.mockResolvedValue({ name: "Test", content: "Response" });
      mockMessageRepository.getProducts.mockResolvedValue([]);
      mockMessageRepository.getServices.mockResolvedValue([]);
      mockMessageRepository.getLatesttMessages.mockResolvedValue([]);
      mockMessageRepository.getResponseFromRag.mockResolvedValue("Prompt");
      mockMessageRepository.getConversationResponse.mockResolvedValue("Response");

      // Execute
      await messageService.processMessage("test", phoneNumber, workspaceId);

      // Assert: Verify the time window is exactly 30 seconds
      expect(mockMessageRepository.countRecentMessages).toHaveBeenCalledWith(
        phoneNumber,
        workspaceId,
        expectedSinceDate
      );
    });
  });
}); 