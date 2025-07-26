import { MessageRepository } from "../../repositories/message.repository"
import { PrismaClient } from "@prisma/client"
import logger from "../../utils/logger"

// Mock dependencies
jest.mock("../../utils/logger")
jest.mock("../../services/usage.service", () => ({
  usageService: {
    trackUsage: jest.fn(),
  },
}))

const mockPrisma = {
  workspace: {
    findUnique: jest.fn(),
  },
  customers: {
    findFirst: jest.fn(),
  },
  chatSession: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  message: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  // Add other methods that might be called
  $transaction: jest.fn((callback) => callback(mockPrisma)),
} as unknown as PrismaClient

describe("Debug Mode - Usage Tracking", () => {
  let messageRepository: MessageRepository
  let mockUsageService: jest.Mocked<any>

  beforeEach(() => {
    jest.clearAllMocks()
    messageRepository = new MessageRepository(mockPrisma)
    
    // Import the mocked usage service
    mockUsageService = require("../../services/usage.service").usageService
  })

  describe("when debugMode is true", () => {
    it("should skip usage tracking", async () => {
      // Arrange
      const mockCustomer = {
        id: "customer-123",
        name: "Test Customer",
        phone: "+1234567890",
        activeChatbot: true,
      }

      const mockWorkspace = {
        debugMode: true, // Debug mode enabled
      }

      const mockSession = {
        id: "session-123",
      }

      const mockMessage = {
        id: "message-123",
        content: "Test response",
      }

      mockPrisma.customers.findFirst = jest.fn().mockResolvedValue(mockCustomer)
      mockPrisma.workspace.findUnique = jest.fn().mockResolvedValue(mockWorkspace)
      mockPrisma.chatSession.findFirst = jest.fn().mockResolvedValue(mockSession)
      mockPrisma.message.create = jest.fn().mockResolvedValue(mockMessage)

      // Act
      await messageRepository.saveMessage({
        workspaceId: "workspace-123",
        phoneNumber: "+1234567890",
        message: "Test message",
        response: "Test response",
        agentSelected: "TestAgent",
      })

      // Assert
      expect(mockUsageService.trackUsage).not.toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Usage tracking skipped - debug mode enabled")
      )
    })
  })

  describe("when debugMode is false", () => {
    it("should track usage normally", async () => {
      // Arrange
      const mockCustomer = {
        id: "customer-123",
        name: "Test Customer",
        phone: "+1234567890",
        activeChatbot: true,
      }

      const mockWorkspace = {
        debugMode: false, // Debug mode disabled
      }

      const mockSession = {
        id: "session-123",
      }

      const mockMessage = {
        id: "message-123",
        content: "Test response",
      }

      mockPrisma.customers.findFirst = jest.fn().mockResolvedValue(mockCustomer)
      mockPrisma.workspace.findUnique = jest.fn().mockResolvedValue(mockWorkspace)
      mockPrisma.chatSession.findFirst = jest.fn().mockResolvedValue(mockSession)
      mockPrisma.message.create = jest.fn().mockResolvedValue(mockMessage)

      // Act
      await messageRepository.saveMessage({
        workspaceId: "workspace-123",
        phoneNumber: "+1234567890",
        message: "Test message",
        response: "Test response",
        agentSelected: "TestAgent",
      })

      // Assert
      expect(mockUsageService.trackUsage).toHaveBeenCalledWith({
        clientId: "customer-123",
        workspaceId: "workspace-123",
        price: 0.005,
      })
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("€0.005 tracked before saving AI response")
      )
    })
  })

  describe("when debugMode is undefined (default)", () => {
    it("should treat as true and skip usage tracking", async () => {
      // Arrange
      const mockCustomer = {
        id: "customer-123",
        name: "Test Customer",
        phone: "+1234567890",
        activeChatbot: true,
      }

      const mockWorkspace = {
        // debugMode is undefined, should default to true
      }

      const mockSession = {
        id: "session-123",
      }

      const mockMessage = {
        id: "message-123",
        content: "Test response",
      }

      mockPrisma.customers.findFirst = jest.fn().mockResolvedValue(mockCustomer)
      mockPrisma.workspace.findUnique = jest.fn().mockResolvedValue(mockWorkspace)
      mockPrisma.chatSession.findFirst = jest.fn().mockResolvedValue(mockSession)
      mockPrisma.message.create = jest.fn().mockResolvedValue(mockMessage)

      // Act
      await messageRepository.saveMessage({
        workspaceId: "workspace-123",
        phoneNumber: "+1234567890",
        message: "Test message",
        response: "Test response",
        agentSelected: "TestAgent",
      })

      // Assert
      expect(mockUsageService.trackUsage).not.toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Usage tracking skipped - debug mode enabled")
      )
    })
  })

  describe("when workspace not found", () => {
    it("should handle gracefully and skip tracking", async () => {
      // Arrange
      const mockCustomer = {
        id: "customer-123",
        name: "Test Customer",
        phone: "+1234567890",
        activeChatbot: true,
      }

      const mockSession = {
        id: "session-123",
      }

      const mockMessage = {
        id: "message-123",
        content: "Test response",
      }

      mockPrisma.customers.findFirst = jest.fn().mockResolvedValue(mockCustomer)
      mockPrisma.workspace.findUnique = jest.fn().mockResolvedValue(null) // Workspace not found
      mockPrisma.chatSession.findFirst = jest.fn().mockResolvedValue(mockSession)
      mockPrisma.message.create = jest.fn().mockResolvedValue(mockMessage)

      // Act
      await messageRepository.saveMessage({
        workspaceId: "workspace-123",
        phoneNumber: "+1234567890",
        message: "Test message",
        response: "Test response",
        agentSelected: "TestAgent",
      })

      // Assert
      expect(mockUsageService.trackUsage).not.toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Usage tracking skipped - debug mode enabled")
      )
    })
  })
})