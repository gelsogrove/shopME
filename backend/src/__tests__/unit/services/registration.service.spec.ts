import "@jest/globals"
import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { RegistrationService } from "../../../application/services/registration.service"
import { MessageRepository } from "../../../repositories/message.repository"

// Mock dependencies
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn(),
  }
})

jest.mock("../../../repositories/message.repository")

describe("RegistrationService", () => {
  let registrationService: RegistrationService
  let mockPrismaClient: any
  let mockMessageRepository: jest.Mocked<MessageRepository>
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    
    // Create service instance
    registrationService = new RegistrationService()
    
    // Create mock objects
    mockPrismaClient = {
      customers: {
        findUnique: jest.fn()
      }
    }
    mockMessageRepository = new MessageRepository() as jest.Mocked<MessageRepository>
    
    // Assign mocks to the service instance
    // @ts-ignore - TS doesn't know about the private properties
    registrationService.prisma = mockPrismaClient
    // @ts-ignore
    registrationService.messageRepository = mockMessageRepository
  })
  
  describe("sendAfterRegistrationMessage", () => {
    it("should send after-registration message successfully", async () => {
      // Mock customer data
      const mockCustomer = {
        id: "customer-123",
        name: "John Doe",
        phone: "+123456789",
        language: "English",
        workspaceId: "workspace-123",
        workspace: {
          id: "workspace-123",
          name: "Test Workspace"
        }
      }
      
      // Mock workspace settings
      const mockWorkspaceSettings = {
        id: "workspace-123",
        afterRegistrationMessages: {
          en: "Thank you for registering, [nome]! How can I help you today? Would you like to see your orders? The offers? Or do you need other information?",
          it: "Grazie per esserti registrato, [nome]! Come ti posso aiutare oggi? Vuoi vedere i tuoi ordini? Le offerte? O hai bisogno di altre informazioni?"
        }
      }
      
      // Setup mocks
      mockPrismaClient.customers.findUnique.mockResolvedValue(mockCustomer as any)
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings as any)
      mockMessageRepository.saveMessage.mockResolvedValue(null)
      
      // Call the method
      const result = await registrationService.sendAfterRegistrationMessage("customer-123")
      
      // Verify behavior
      expect(mockPrismaClient.customers.findUnique).toHaveBeenCalledWith({
        where: { id: "customer-123" },
        include: { workspace: true }
      })
      
      expect(mockMessageRepository.getWorkspaceSettings).toHaveBeenCalledWith("workspace-123")
      
      expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: "workspace-123",
          phoneNumber: "+123456789",
          message: '',
          response: "Thank you for registering, John! How can I help you today? Would you like to see your orders? The offers? Or do you need other information?",
          direction: "OUTBOUND",
          agentSelected: "CHATBOX"
        })
      )
      
      expect(result).toBe(true)
    })
    
    it("should use fallback message if no message in customer language", async () => {
      // Mock customer with Italian language
      const mockCustomer = {
        id: "customer-123",
        name: "Marco Rossi",
        phone: "+123456789",
        language: "Italian", // Customer language is Italian
        workspaceId: "workspace-123",
        workspace: {
          id: "workspace-123",
          name: "Test Workspace"
        }
      }
      
      // Mock workspace settings with only English message
      const mockWorkspaceSettings = {
        id: "workspace-123",
        afterRegistrationMessages: {
          en: "Registration completed successfully. Hello [nome], how can I help you today?"
          // No Italian message
        }
      }
      
      // Setup mocks
      mockPrismaClient.customers.findUnique.mockResolvedValue(mockCustomer as any)
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings as any)
      mockMessageRepository.saveMessage.mockResolvedValue(null)
      
      // Call the method
      const result = await registrationService.sendAfterRegistrationMessage("customer-123")
      
      // Verify that the English message was used, but with the correct name
      expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          response: "Registration completed successfully. Hello Marco, how can I help you today?"
        })
      )
      
      expect(result).toBe(true)
    })
    
    it("should use default message if no messages in workspace settings", async () => {
      // Mock customer
      const mockCustomer = {
        id: "customer-123",
        name: "John Doe",
        phone: "+123456789",
        language: "English",
        workspaceId: "workspace-123",
        workspace: {
          id: "workspace-123",
          name: "Test Workspace"
        }
      }
      
      // Mock workspace settings without after-registration messages
      const mockWorkspaceSettings = {
        id: "workspace-123"
        // No afterRegistrationMessages
      }
      
      // Setup mocks
      mockPrismaClient.customers.findUnique.mockResolvedValue(mockCustomer as any)
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(mockWorkspaceSettings as any)
      mockMessageRepository.saveMessage.mockResolvedValue(null)
      
      // Call the method
      const result = await registrationService.sendAfterRegistrationMessage("customer-123")
      
      // Verify that the default message was used
      expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          response: "Registration completed successfully. Hello John, how can I help you today?"
        })
      )
      
      expect(result).toBe(true)
    })
    
    it("should return false if customer not found", async () => {
      // Mock customer not found
      mockPrismaClient.customers.findUnique.mockResolvedValue(null)
      
      // Call the method
      const result = await registrationService.sendAfterRegistrationMessage("non-existent-id")
      
      // Verify behavior
      expect(mockPrismaClient.customers.findUnique).toHaveBeenCalledWith({
        where: { id: "non-existent-id" },
        include: { workspace: true }
      })
      
      expect(mockMessageRepository.saveMessage).not.toHaveBeenCalled()
      
      expect(result).toBe(false)
    })
    
    it("should return false if workspace settings not found", async () => {
      // Mock customer
      const mockCustomer = {
        id: "customer-123",
        name: "John Doe",
        phone: "+123456789",
        language: "English",
        workspaceId: "workspace-123",
        workspace: {
          id: "workspace-123",
          name: "Test Workspace"
        }
      }
      
      // Mock workspace settings not found
      mockPrismaClient.customers.findUnique.mockResolvedValue(mockCustomer as any)
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(null)
      
      // Call the method
      const result = await registrationService.sendAfterRegistrationMessage("customer-123")
      
      // Verify behavior
      expect(mockPrismaClient.customers.findUnique).toHaveBeenCalled()
      expect(mockMessageRepository.getWorkspaceSettings).toHaveBeenCalledWith("workspace-123")
      expect(mockMessageRepository.saveMessage).not.toHaveBeenCalled()
      
      expect(result).toBe(false)
    })
  })
}) 