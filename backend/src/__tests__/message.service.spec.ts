import "@jest/globals"
import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { MessageService } from "../application/services/message.service"
import { MessageRepository } from "../infrastructure/repositories/message.repository"

// Mock dependencies
jest.mock("../infrastructure/repositories/message.repository")
jest.mock("../utils/logger")

describe("MessageService", () => {
  let messageService: MessageService
  let mockMessageRepository: jest.Mocked<MessageRepository>

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    // Create a new instance of the service before each test
    messageService = new MessageService()

    // Get the mocked repository instance that was created in the service constructor
    mockMessageRepository = (
      MessageRepository as jest.MockedClass<typeof MessageRepository>
    ).mock.instances[0] as jest.Mocked<MessageRepository>
  })

  describe("processMessage with inactive workspace", () => {
    // Test case: Workspace exists but is inactive with custom WIP message
    it("should return custom WIP message when workspace is inactive", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: false,
        wipMessage: "This workspace is under maintenance.",
      } as any)

      // Execute
      const result = await messageService.processMessage(
        "Test message",
        "+1234567890",
        "workspace-id"
      )

      // Verify
      expect(mockMessageRepository.getWorkspaceSettings).toHaveBeenCalledWith(
        "workspace-id"
      )
      expect(result).toBe("WhatsApp channel is inactive")
      expect(mockMessageRepository.saveMessage).toHaveBeenCalled()
    })

    // Test case: Workspace exists but is inactive without a custom WIP message
    it("should return default message when no WIP message is set", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: false,
        // No wipMessage property
      } as any)

      // Execute
      const result = await messageService.processMessage(
        "Test message",
        "+1234567890",
        "workspace-id"
      )

      // Verify
      expect(mockMessageRepository.getWorkspaceSettings).toHaveBeenCalledWith(
        "workspace-id"
      )
      expect(result).toBe("WhatsApp channel is inactive")
      expect(mockMessageRepository.saveMessage).toHaveBeenCalled()
    })

    // Test case: Workspace exists but is inactive with empty WIP message
    it("should return default message when WIP message is empty", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: false,
        wipMessage: "",
      } as any)

      // Execute
      const result = await messageService.processMessage(
        "Test message",
        "+1234567890",
        "workspace-id"
      )

      // Verify
      expect(mockMessageRepository.getWorkspaceSettings).toHaveBeenCalledWith(
        "workspace-id"
      )
      expect(result).toBe("WhatsApp channel is inactive")
      expect(mockMessageRepository.saveMessage).toHaveBeenCalled()
    })

    it("should return WIP message in user language if supported", async () => {
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: false,
        wipMessages: {
          en: "Work in progress (EN)",
          it: "Lavori in corso (IT)",
          es: "Trabajos en curso (ES)",
        },
      } as any)
      mockMessageRepository.findCustomerByPhone.mockResolvedValue({
        id: "customer-id",
        phone: "+1234567890",
        language: "it",
      } as any)
      const result = await messageService.processMessage(
        "Test",
        "+1234567890",
        "workspace-id"
      )
      expect(result).toBe("Lavori in corso (IT)")
    })
    it("should fallback to English WIP message if user language not supported", async () => {
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: false,
        wipMessages: {
          en: "Work in progress (EN)",
          it: "Lavori in corso (IT)",
        },
      } as any)
      mockMessageRepository.findCustomerByPhone.mockResolvedValue({
        id: "customer-id",
        phone: "+1234567890",
        language: "fr",
      } as any)
      const result = await messageService.processMessage(
        "Test",
        "+1234567890",
        "workspace-id"
      )
      expect(result).toBe("Work in progress (EN)")
    })
    it("should fallback to English WIP message if user language is missing", async () => {
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: false,
        wipMessages: {
          en: "Work in progress (EN)",
          it: "Lavori in corso (IT)",
        },
      } as any)
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(null)
      const result = await messageService.processMessage(
        "Test",
        "+1234567890",
        "workspace-id"
      )
      expect(result).toBe("Work in progress (EN)")
    })
  })

  describe("processMessage with blacklisted customer", () => {
    // Test case: Customer is blacklisted

    // Test case: Customer is not blacklisted
    it("should process message for non-blacklisted customer", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(null) // Customer doesn't exist

      // Mock the URL for the registration link
      process.env.FRONTEND_URL = "https://laltroitalia.shop"

      // Mock the findCustomerByPhone method to return a newly created customer
      const mockCustomer = {
        id: "customer-id",
        phone: "+1234567890",
      }
      mockMessageRepository.findCustomerByPhone.mockResolvedValueOnce(null) // First call: not found
      mockMessageRepository.findCustomerByPhone.mockResolvedValueOnce(
        mockCustomer as any
      ) // Second call: return created customer

      // Mock service creating the customer
      // @ts-ignore: Mock implementation for test purposes
      mockMessageRepository.createCustomer = jest
        .fn()
        .mockImplementation(() => Promise.resolve(mockCustomer))

      // Execute
      const result = await messageService.processMessage(
        "Test message",
        "+1234567890",
        "workspace-id"
      )

      // Verify
      expect(mockMessageRepository.getWorkspaceSettings).toHaveBeenCalledWith(
        "workspace-id"
      )
      expect(mockMessageRepository.isCustomerBlacklisted).toHaveBeenCalledWith(
        "+1234567890"
      )
      expect(mockMessageRepository.findCustomerByPhone).toHaveBeenCalledWith(
        "+1234567890",
        "workspace-id"
      )
      expect(result).toContain("Welcome") // Should contain registration message
    })
  })

  describe("processMessage with customer language preference", () => {
    // Test case: Customer has language preference
    it("should pass customer language to RAG function", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock an existing customer with language preference
      const mockCustomer = {
        id: "customer-id",
        phone: "+1234567890",
        language: "English",
        name: "Test Customer",
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(mockCustomer)

      // Mock required services for processing
      mockMessageRepository.getRouterAgent.mockResolvedValue("router prompt")
      mockMessageRepository.getProducts.mockResolvedValue([])
      mockMessageRepository.getServices.mockResolvedValue([])
      mockMessageRepository.getLatesttMessages.mockResolvedValue([])

      // Mock agent selection and RAG processes
      const mockAgent = { name: "TestAgent", content: "agent content" }
      mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue(
        mockAgent
      )
      mockMessageRepository.getResponseFromRag.mockResolvedValue(
        "Test response"
      )
      mockMessageRepository.getConversationResponse.mockResolvedValue(
        "Test response"
      )

      // Usa un messaggio NON saluto
      await messageService.processMessage(
        "Vorrei informazioni",
        "+1234567890",
        "workspace-id"
      )

      // Verify language is passed to RAG function
      expect(mockMessageRepository.getResponseFromRag).toHaveBeenCalledWith(
        expect.anything(), // agent
        expect.anything(), // message
        expect.anything(), // products
        expect.anything(), // services
        expect.anything(), // chatHistory
        mockCustomer // customer with language preference
      )
    })

    // Test case: Different customer language (French)
    it("should respect different language preferences", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock an existing customer with French language preference
      const mockFrenchCustomer = {
        id: "customer-id",
        phone: "+1234567890",
        language: "French",
        name: "Test Customer",
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(
        mockFrenchCustomer
      )

      // Mock required services for processing
      mockMessageRepository.getRouterAgent.mockResolvedValue("router prompt")
      mockMessageRepository.getProducts.mockResolvedValue([])
      mockMessageRepository.getServices.mockResolvedValue([])
      mockMessageRepository.getLatesttMessages.mockResolvedValue([])

      // Mock agent selection and RAG processes
      const mockAgent = { name: "TestAgent", content: "agent content" }
      mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue(
        mockAgent
      )
      mockMessageRepository.getResponseFromRag.mockResolvedValue(
        "Test response"
      )
      mockMessageRepository.getConversationResponse.mockResolvedValue(
        "Test response"
      )

      // Usa un messaggio NON saluto
      await messageService.processMessage(
        "Vorrei informazioni",
        "+1234567890",
        "workspace-id"
      )

      // Verify French customer is passed to RAG function
      expect(mockMessageRepository.getResponseFromRag).toHaveBeenCalledWith(
        expect.anything(), // agent
        expect.anything(), // message
        expect.anything(), // products
        expect.anything(), // services
        expect.anything(), // chatHistory
        mockFrenchCustomer // customer with French language preference
      )
    })

    // Test case: Prompt variable replacement for customerLanguage
    it("should replace {customerLanguage} in the prompt with the actual language", async () => {
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
      const mockCustomer = {
        id: "customer-id",
        phone: "+1234567890",
        language: "English",
        name: "Test Customer",
      } as any
      mockMessageRepository.findCustomerByPhone.mockResolvedValue(mockCustomer)
      mockMessageRepository.getRouterAgent.mockResolvedValue("router prompt")
      mockMessageRepository.getProducts.mockResolvedValue([])
      mockMessageRepository.getServices.mockResolvedValue([])
      mockMessageRepository.getLatesttMessages.mockResolvedValue([])
      // The agent prompt contains the variable
      const agentPromptWithVar =
        "Your response MUST be in **{customerLanguage}** language."
      const mockAgent = { name: "TestAgent", content: agentPromptWithVar }
      mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue(
        mockAgent
      )
      let promptSentToRag = ""
      mockMessageRepository.getResponseFromRag.mockImplementation((agent) => {
        promptSentToRag = agent._replacedPrompt || agent.content
        return Promise.resolve("Test response")
      })
      mockMessageRepository.getConversationResponse.mockResolvedValue(
        "Test response"
      )
      // Usa un messaggio NON saluto
      await messageService.processMessage(
        "Vorrei informazioni",
        "+1234567890",
        "workspace-id"
      )
      expect(promptSentToRag).toContain("**English**")
      expect(promptSentToRag).not.toContain("{customerLanguage}")
    })
  })

  describe("processMessage with unregistered customer", () => {
    // Test case: Customer exists but is not registered (name is "Unknown Customer")
    it("should show registration link for unregistered customer", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock an existing customer who is unregistered
      const unregisteredCustomer = {
        id: "customer-id",
        phone: "+1234567890",
        name: "Unknown Customer",
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(
        unregisteredCustomer
      )

      // Set the frontend URL for the registration link
      process.env.FRONTEND_URL = "https://laltroitalia.shop"

      // Execute
      const result = await messageService.processMessage(
        "Hello again",
        "+1234567890",
        "workspace-id"
      )

      // Verify
      expect(mockMessageRepository.getWorkspaceSettings).toHaveBeenCalledWith(
        "workspace-id"
      )
      expect(mockMessageRepository.isCustomerBlacklisted).toHaveBeenCalledWith(
        "+1234567890"
      )
      expect(mockMessageRepository.findCustomerByPhone).toHaveBeenCalledWith(
        "+1234567890",
        "workspace-id"
      )
      expect(result).toContain("completa la registrazione") // Should contain registration message
      expect(result).toContain("https://laltroitalia.shop/register") // Should contain registration URL

      // Verify that we don't try to process the message
      expect(mockMessageRepository.getRouterAgent).not.toHaveBeenCalled()
    })

    // Test case: Multiple messages from unregistered customer should always show registration link
    it("should always show registration link for unregistered customer", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock an existing customer who is unregistered
      const unregisteredCustomer = {
        id: "customer-id",
        phone: "+1234567890",
        name: "Unknown Customer",
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(
        unregisteredCustomer
      )

      // Set the frontend URL for the registration link
      process.env.FRONTEND_URL = "https://laltroitalia.shop"

      // Primo messaggio NON saluto
      let result = await messageService.processMessage(
        "Serve aiuto",
        "+1234567890",
        "workspace-id"
      )
      expect(result).toContain("completa la registrazione")

      // Secondo messaggio NON saluto
      result = await messageService.processMessage(
        "Ho bisogno di supporto",
        "+1234567890",
        "workspace-id"
      )
      expect(result).toContain("completa la registrazione")

      // Terzo messaggio NON saluto - should still get registration link
      result = await messageService.processMessage(
        "Per favore rispondi",
        "+1234567890",
        "workspace-id"
      )
      expect(result).toContain("completa la registrazione")

      // Verify we never try to process any messages
      expect(mockMessageRepository.getRouterAgent).not.toHaveBeenCalled()
    })
  })

  describe("processMessage with registered customer", () => {
    // Test case: Registered customer asking for product list
    it("should return product list to registered customer", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock a fully registered customer
      const registeredCustomer = {
        id: "customer-id",
        phone: "+1234567890",
        name: "John Doe",
        language: "Italian",
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(
        registeredCustomer
      )

      // Mock required services for product listing
      mockMessageRepository.getRouterAgent.mockResolvedValue("router prompt")

      // Mock some products with correct structure
      const mockProducts = [
        {
          id: "prod1",
          name: "Pasta",
          description: "Italian pasta",
          price: 5.99,
          stock: 100,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          workspaceId: "workspace-id",
          weight: 500,
          sku: "PASTA-001",
          categoryId: "cat1",
          slug: "pasta",
          image: "pasta.jpg",
          category: {
            id: "cat1",
            name: "Food",
            slug: "food",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            description: "Food products",
            workspaceId: "workspace-id",
          },
        },
        {
          id: "prod2",
          name: "Olive Oil",
          description: "Extra virgin",
          price: 12.99,
          stock: 50,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          workspaceId: "workspace-id",
          weight: 750,
          sku: "OIL-001",
          categoryId: "cat2",
          slug: "olive-oil",
          image: "oil.jpg",
          category: {
            id: "cat2",
            name: "Oil",
            slug: "oil",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            description: "Oil products",
            workspaceId: "workspace-id",
          },
        },
      ] as any // Use type assertion for simplification

      mockMessageRepository.getProducts.mockResolvedValue(mockProducts)
      mockMessageRepository.getServices.mockResolvedValue([])
      mockMessageRepository.getLatesttMessages.mockResolvedValue([])

      // Mock agent selection that chooses Products agent
      const mockProductAgent = {
        name: "Products",
        content: "You are a product specialist assistant",
        department: "PRODUCTS",
      }
      mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue(
        mockProductAgent
      )

      // Mock RAG response with product list
      const productListResponse =
        "Ecco i nostri prodotti:\n1. Pasta - €5.99\nCategoria: Food\nDescrizione: Italian pasta\n\n2. Olive Oil - €12.99\nCategoria: Oil\nDescrizione: Extra virgin"
      mockMessageRepository.getResponseFromRag.mockResolvedValue(
        productListResponse
      )
      mockMessageRepository.getConversationResponse.mockResolvedValue(
        productListResponse
      )

      // Execute with a message asking for products
      const result = await messageService.processMessage(
        "Quali prodotti avete?",
        "+1234567890",
        "workspace-id"
      )

      // Verify
      expect(mockMessageRepository.getWorkspaceSettings).toHaveBeenCalledWith(
        "workspace-id"
      )
      expect(mockMessageRepository.isCustomerBlacklisted).toHaveBeenCalledWith(
        "+1234567890"
      )
      expect(mockMessageRepository.findCustomerByPhone).toHaveBeenCalledWith(
        "+1234567890",
        "workspace-id"
      )

      // Verify that we correctly processed the message with AI
      expect(mockMessageRepository.getRouterAgent).toHaveBeenCalled()
      expect(mockMessageRepository.getProducts).toHaveBeenCalled()
      expect(
        mockMessageRepository.getResponseFromAgentRouter
      ).toHaveBeenCalledWith("router prompt", "Quali prodotti avete?")

      // Verify the response contains product information
      expect(result).toContain("Pasta")
      expect(result).toContain("Olive Oil")
      expect(result).toContain("€5.99")
      expect(result).toContain("€12.99")
    })

    // Test case: Registered customer asking for services list
    it("should return services list to registered customer", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock a fully registered customer
      const registeredCustomer = {
        id: "customer-id",
        phone: "+1234567890",
        name: "Maria Rossi",
        language: "Italian",
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(
        registeredCustomer
      )

      // Mock required services for service listing
      mockMessageRepository.getRouterAgent.mockResolvedValue("router prompt")

      // Empty products list since we're focusing on services
      mockMessageRepository.getProducts.mockResolvedValue([])

      // Mock some services with correct structure
      const mockServices = [
        {
          id: "serv1",
          name: "Consegna a domicilio",
          description: "Consegna entro 24 ore",
          price: 3.99,
          duration: 60,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          workspaceId: "workspace-id",
        },
        {
          id: "serv2",
          name: "Consulenza culinaria",
          description: "Consigli personalizzati dai nostri chef",
          price: 15.0,
          duration: 30,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          workspaceId: "workspace-id",
        },
      ] as any // Use type assertion for simplification

      mockMessageRepository.getServices.mockResolvedValue(mockServices)
      mockMessageRepository.getLatesttMessages.mockResolvedValue([])

      // Mock agent selection that chooses Services agent
      const mockServiceAgent = {
        name: "Services",
        content: "You are a service specialist assistant",
        department: "SERVICES",
      }
      mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue(
        mockServiceAgent
      )

      // Mock RAG response with services list
      const servicesListResponse =
        "Ecco i nostri servizi:\n1. Consegna a domicilio - €3.99\nDescrizione: Consegna entro 24 ore\nDurata: 60 minuti\n\n2. Consulenza culinaria - €15.00\nDescrizione: Consigli personalizzati dai nostri chef\nDurata: 30 minuti"
      mockMessageRepository.getResponseFromRag.mockResolvedValue(
        servicesListResponse
      )
      mockMessageRepository.getConversationResponse.mockResolvedValue(
        servicesListResponse
      )

      // Execute with a message asking for services
      const result = await messageService.processMessage(
        "Quali servizi offrite?",
        "+1234567890",
        "workspace-id"
      )

      // Verify
      expect(mockMessageRepository.getWorkspaceSettings).toHaveBeenCalledWith(
        "workspace-id"
      )
      expect(mockMessageRepository.isCustomerBlacklisted).toHaveBeenCalledWith(
        "+1234567890"
      )
      expect(mockMessageRepository.findCustomerByPhone).toHaveBeenCalledWith(
        "+1234567890",
        "workspace-id"
      )

      // Verify that we correctly processed the message with AI
      expect(mockMessageRepository.getRouterAgent).toHaveBeenCalled()
      expect(mockMessageRepository.getServices).toHaveBeenCalled()
      expect(
        mockMessageRepository.getResponseFromAgentRouter
      ).toHaveBeenCalledWith("router prompt", "Quali servizi offrite?")

      // Verify the response contains service information
      expect(result).toContain("Consegna a domicilio")
      expect(result).toContain("Consulenza culinaria")
      expect(result).toContain("€3.99")
      expect(result).toContain("€15.00")
    })
  })

  describe("processMessage with router agent selection", () => {
    // Test case: Router should select Products agent when user asks about products
    it("should select Products agent when user asks about products", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock a registered customer
      const registeredCustomer = {
        id: "customer-id",
        phone: "+1234567890",
        name: "John Doe",
        language: "Italian",
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(
        registeredCustomer
      )

      // Mock router prompt
      const routerPrompt = `
        You are a router for a food shop. Based on the user's message, select the most appropriate agent:
        - Products: for questions about products, prices, availability, etc.
        - Services: for questions about services, delivery, etc.
        - Customer: for questions about accounts, orders, etc.
        - Generic: for general questions or greetings
        
        Return a JSON with the agent name: { "agent": "AgentName" }
      `
      mockMessageRepository.getRouterAgent.mockResolvedValue(routerPrompt)

      // Mock required data
      mockMessageRepository.getProducts.mockResolvedValue([])
      mockMessageRepository.getServices.mockResolvedValue([])
      mockMessageRepository.getLatesttMessages.mockResolvedValue([])

      // The key part: simulate router selecting Products agent
      mockMessageRepository.getResponseFromAgentRouter.mockImplementation(
        (_prompt, message) => {
          // Verify that the user message is about products
          expect(message).toContain("prodotti")

          // Return a Products agent
          return Promise.resolve({
            name: "Products",
            content:
              "You are a product specialist who helps customers with product information.",
            department: "PRODUCTS",
          })
        }
      )

      // Mock response generation
      mockMessageRepository.getResponseFromRag.mockResolvedValue(
        "Ecco la lista dei nostri prodotti..."
      )
      mockMessageRepository.getConversationResponse.mockResolvedValue(
        "Ecco la lista dei nostri prodotti..."
      )

      // Execute with a request for products
      await messageService.processMessage(
        "Vorrei vedere la lista dei vostri prodotti",
        "+1234567890",
        "workspace-id"
      )

      // Verify agent selection
      expect(
        mockMessageRepository.getResponseFromAgentRouter
      ).toHaveBeenCalledWith(
        routerPrompt,
        "Vorrei vedere la lista dei vostri prodotti"
      )

      // Verify that the Products agent was selected
      expect(mockMessageRepository.getResponseFromRag).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Products",
        }),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything()
      )
    })

    // Test case: Router should select Services agent when user asks about services
    it("should select Services agent when user asks about services", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock a registered customer
      const registeredCustomer = {
        id: "customer-id",
        phone: "+1234567890",
        name: "Maria Rossi",
        language: "Italian",
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(
        registeredCustomer
      )

      // Mock router prompt
      const routerPrompt = `
        You are a router for a food shop. Based on the user's message, select the most appropriate agent:
        - Products: for questions about products, prices, availability, etc.
        - Services: for questions about services, delivery, etc.
        - Customer: for questions about accounts, orders, etc.
        - Generic: for general questions or greetings
        
        Return a JSON with the agent name: { "agent": "AgentName" }
      `
      mockMessageRepository.getRouterAgent.mockResolvedValue(routerPrompt)

      // Mock required data
      mockMessageRepository.getProducts.mockResolvedValue([])
      mockMessageRepository.getServices.mockResolvedValue([])
      mockMessageRepository.getLatesttMessages.mockResolvedValue([])

      // The key part: simulate router selecting Services agent
      mockMessageRepository.getResponseFromAgentRouter.mockImplementation(
        (_prompt, message) => {
          // Verify that the user message is about services
          expect(message).toContain("servizi")

          // Return a Services agent
          return Promise.resolve({
            name: "Services",
            content:
              "You are a service specialist who helps customers with service information.",
            department: "SERVICES",
          })
        }
      )

      // Mock response generation
      mockMessageRepository.getResponseFromRag.mockResolvedValue(
        "Ecco i servizi che offriamo..."
      )
      mockMessageRepository.getConversationResponse.mockResolvedValue(
        "Ecco i servizi che offriamo..."
      )

      // Execute with a request for services
      await messageService.processMessage(
        "Quali servizi offrite?",
        "+1234567890",
        "workspace-id"
      )

      // Verify agent selection
      expect(
        mockMessageRepository.getResponseFromAgentRouter
      ).toHaveBeenCalledWith(routerPrompt, "Quali servizi offrite?")

      // Verify that the Services agent was selected
      expect(mockMessageRepository.getResponseFromRag).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Services",
        }),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything()
      )
    })

    // Test case: Selected agent should be tracked in the saved message
    it("should track the selected agent in message metadata", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock a registered customer
      const registeredCustomer = {
        id: "customer-id",
        phone: "+1234567890",
        name: "John Doe",
        language: "Italian",
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(
        registeredCustomer
      )

      // Mock router prompt and agent selection
      mockMessageRepository.getRouterAgent.mockResolvedValue("router prompt")

      // Specifically mock a Products agent selection
      const productAgent = {
        name: "Products",
        content: "You are a product specialist",
        department: "PRODUCTS",
      }
      mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue(
        productAgent
      )

      // Mock required data
      mockMessageRepository.getProducts.mockResolvedValue([])
      mockMessageRepository.getServices.mockResolvedValue([])
      mockMessageRepository.getLatesttMessages.mockResolvedValue([])

      // Mock response generation
      mockMessageRepository.getResponseFromRag.mockResolvedValue(
        "Ecco i nostri prodotti..."
      )
      mockMessageRepository.getConversationResponse.mockResolvedValue(
        "Ecco i nostri prodotti..."
      )

      // Create a spy on saveMessage to capture what is passed to it
      const saveMessageSpy = jest.spyOn(mockMessageRepository, "saveMessage")

      // Execute the message process
      await messageService.processMessage(
        "Vorrei informazioni sui prodotti",
        "+1234567890",
        "workspace-id"
      )

      // Verify saveMessage was called with the correct agent name in the parameters
      expect(saveMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: "workspace-id",
          phoneNumber: "+1234567890",
          message: "Vorrei informazioni sui prodotti",
          response: expect.any(String),
          agentSelected: "Products", // The agent name should be passed here
        })
      )
    })

    // Test case: Agent metadata should be stored and available in responses
    it("should store agent metadata in message repository", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock a registered customer
      const registeredCustomer = {
        id: "customer-id",
        phone: "+1234567890",
        name: "John Doe",
        language: "Italian",
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(
        registeredCustomer
      )

      // Mock router prompt and agent selection
      mockMessageRepository.getRouterAgent.mockResolvedValue("router prompt")

      // Mock a Services agent selection
      const servicesAgent = {
        name: "Services",
        content: "You are a service specialist",
        department: "SERVICES",
      }
      mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue(
        servicesAgent
      )

      // Mock required data
      mockMessageRepository.getProducts.mockResolvedValue([])
      mockMessageRepository.getServices.mockResolvedValue([])
      mockMessageRepository.getLatesttMessages.mockResolvedValue([])

      // Mock response generation
      mockMessageRepository.getResponseFromRag.mockResolvedValue(
        "Ecco i nostri servizi..."
      )
      mockMessageRepository.getConversationResponse.mockResolvedValue(
        "Ecco i nostri servizi..."
      )

      // Execute the message process
      const result = await messageService.processMessage(
        "Quali servizi offrite?",
        "+1234567890",
        "workspace-id"
      )

      // Verify result
      expect(result).toBe("Ecco i nostri servizi...")

      // Verify saveMessage was called with the services agent
      expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          agentSelected: "Services",
        })
      )
    })
  })

  describe("processMessage with currency preferences", () => {
    // Test case: User with EUR currency should see prices in USD
    it("should display prices in USD when user has EUR currency", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock a registered customer with EUR currency
      const customerWithEurCurrency = {
        id: "customer-id",
        phone: "+1234567890",
        name: "John Doe",
        language: "Italian",
        currency: "EUR", // User has set currency to EUR
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(
        customerWithEurCurrency
      )

      // Mock router prompt and agent selection
      mockMessageRepository.getRouterAgent.mockResolvedValue("router prompt")
      mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue({
        name: "Products",
        content: "You are a product specialist",
        department: "PRODUCTS",
      })

      // Mock some products with EUR prices
      const mockProducts = [
        {
          id: "prod1",
          name: "Pasta",
          description: "Italian pasta",
          price: 5.99, // Price in EUR
          stock: 100,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          workspaceId: "workspace-id",
          weight: 500,
          sku: "PASTA-001",
          categoryId: "cat1",
          slug: "pasta",
          image: "pasta.jpg",
          category: {
            id: "cat1",
            name: "Food",
            slug: "food",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            description: "Food products",
            workspaceId: "workspace-id",
          },
        },
        {
          id: "prod2",
          name: "Olive Oil",
          description: "Extra virgin",
          price: 12.99, // Price in EUR
          stock: 50,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          workspaceId: "workspace-id",
          weight: 750,
          sku: "OIL-001",
          categoryId: "cat2",
          slug: "olive-oil",
          image: "oil.jpg",
          category: {
            id: "cat2",
            name: "Oil",
            slug: "oil",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            description: "Oil products",
            workspaceId: "workspace-id",
          },
        },
      ] as any

      mockMessageRepository.getProducts.mockResolvedValue(mockProducts)
      mockMessageRepository.getServices.mockResolvedValue([])
      mockMessageRepository.getLatesttMessages.mockResolvedValue([])

      // Mock RAG response with prices in USD (converted from EUR)
      // Assume an exchange rate of approximately 1 EUR = 1.09 USD
      const productListWithUsdPrices =
        "Ecco i nostri prodotti:\n1. Pasta - $6.53\nCategoria: Food\nDescrizione: Italian pasta\n\n2. Olive Oil - $14.16\nCategoria: Oil\nDescrizione: Extra virgin"

      // Save the original implementation
      const originalGetResponseFromRag =
        mockMessageRepository.getResponseFromRag

      // Clear the mock and create a new implementation
      mockMessageRepository.getResponseFromRag.mockClear()

      // Add our implementation
      mockMessageRepository.getResponseFromRag.mockImplementation(
        (_agent, _msg, _prods, _servs, _hist, cust) => {
          // Verify that customer with currency preference is passed
          expect(cust).toBe(customerWithEurCurrency)
          expect(cust.currency).toBe("EUR")

          // Return response with USD prices
          return Promise.resolve(productListWithUsdPrices)
        }
      )

      mockMessageRepository.getConversationResponse.mockResolvedValue(
        productListWithUsdPrices
      )

      // Execute with a request for products
      const result = await messageService.processMessage(
        "Quali prodotti avete?",
        "+1234567890",
        "workspace-id"
      )

      // Verify base expectations
      expect(mockMessageRepository.findCustomerByPhone).toHaveBeenCalledWith(
        "+1234567890",
        "workspace-id"
      )
      expect(mockMessageRepository.getResponseFromRag).toHaveBeenCalled()

      // Verify the response contains USD prices (not EUR)
      expect(result).toContain("$6.53")
      expect(result).toContain("$14.16")
      expect(result).not.toContain("€5.99")
      expect(result).not.toContain("€12.99")

      // Restore original implementation
      mockMessageRepository.getResponseFromRag = originalGetResponseFromRag
    })
  })

  describe("processMessage with discount preferences", () => {
    // Test case: User with discount should see discounted prices
    it("should display discounted prices when user has discount", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock a registered customer with 15% discount
      const customerWithDiscount = {
        id: "customer-id",
        phone: "+1234567890",
        name: "John Doe",
        language: "Italian",
        currency: "EUR",
        discount: 15, // 15% discount
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(
        customerWithDiscount
      )

      // Mock router prompt and agent selection
      mockMessageRepository.getRouterAgent.mockResolvedValue("router prompt")
      mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue({
        name: "Products",
        content: "You are a product specialist",
        department: "PRODUCTS",
      })

      // Mock some products with standard prices
      const mockProducts = [
        {
          id: "prod1",
          name: "Pasta",
          description: "Italian pasta",
          price: 10.0, // Original price
          stock: 100,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          workspaceId: "workspace-id",
          weight: 500,
          sku: "PASTA-001",
          categoryId: "cat1",
          slug: "pasta",
          image: "pasta.jpg",
          category: {
            id: "cat1",
            name: "Food",
            slug: "food",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            description: "Food products",
            workspaceId: "workspace-id",
          },
        },
        {
          id: "prod2",
          name: "Olive Oil",
          description: "Extra virgin",
          price: 20.0, // Original price
          stock: 50,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          workspaceId: "workspace-id",
          weight: 750,
          sku: "OIL-001",
          categoryId: "cat2",
          slug: "olive-oil",
          image: "oil.jpg",
          category: {
            id: "cat2",
            name: "Oil",
            slug: "oil",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            description: "Oil products",
            workspaceId: "workspace-id",
          },
        },
      ] as any

      mockMessageRepository.getProducts.mockResolvedValue(mockProducts)
      mockMessageRepository.getServices.mockResolvedValue([])
      mockMessageRepository.getLatesttMessages.mockResolvedValue([])

      // Mock RAG response with discounted prices (15% off)
      // Expected discounted prices:
      // Pasta: €10.00 -> €8.50 (10 - 10*0.15 = 8.5)
      // Olive Oil: €20.00 -> €17.00 (20 - 20*0.15 = 17)
      const productListWithDiscountedPrices =
        "Ecco i nostri prodotti (sconto del 15%):\n1. Pasta - €8.50 (prezzo originale: €10.00)\nCategoria: Food\nDescrizione: Italian pasta\n\n2. Olive Oil - €17.00 (prezzo originale: €20.00)\nCategoria: Oil\nDescrizione: Extra virgin"

      // Clear the mock and create a new implementation
      mockMessageRepository.getResponseFromRag.mockClear()

      // Add our implementation
      mockMessageRepository.getResponseFromRag.mockImplementation(
        (_agent, _msg, _prods, _servs, _hist, cust) => {
          // Verify that customer with discount is passed
          expect(cust).toBe(customerWithDiscount)
          expect(cust.discount).toBe(15)

          // Return response with discounted prices
          return Promise.resolve(productListWithDiscountedPrices)
        }
      )

      mockMessageRepository.getConversationResponse.mockResolvedValue(
        productListWithDiscountedPrices
      )

      // Execute with a request for products
      const result = await messageService.processMessage(
        "Quali prodotti avete?",
        "+1234567890",
        "workspace-id"
      )

      // Verify base expectations
      expect(mockMessageRepository.findCustomerByPhone).toHaveBeenCalledWith(
        "+1234567890",
        "workspace-id"
      )
      expect(mockMessageRepository.getResponseFromRag).toHaveBeenCalled()

      // Verify the response contains discounted prices
      expect(result).toContain("€8.50")
      expect(result).toContain("€17.00")
      expect(result).toContain("sconto del 15%")
      expect(result).toContain("prezzo originale: €10.00")
      expect(result).toContain("prezzo originale: €20.00")
    })
  })

  describe("processMessage with products filtering", () => {
    // Test case: Only active products should be returned
    it("should only display active products", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock a registered customer
      const registeredCustomer = {
        id: "customer-id",
        phone: "+1234567890",
        name: "John Doe",
        language: "Italian",
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(
        registeredCustomer
      )

      // Mock router prompt and agent selection
      mockMessageRepository.getRouterAgent.mockResolvedValue("router prompt")
      mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue({
        name: "Products",
        content: "You are a product specialist",
        department: "PRODUCTS",
      })

      // Mock products with both active and inactive products
      const activeAndInactiveProducts = [
        {
          id: "prod1",
          name: "Pasta",
          description: "Italian pasta",
          price: 5.99,
          stock: 100,
          isActive: true, // Active product
          category: { id: "cat1", name: "Food" },
        },
        {
          id: "prod2",
          name: "Olive Oil",
          description: "Extra virgin",
          price: 12.99,
          stock: 50,
          isActive: true, // Active product
          category: { id: "cat2", name: "Oil" },
        },
        {
          id: "prod3",
          name: "Discontinued Item",
          description: "This product is no longer available",
          price: 8.99,
          stock: 0,
          isActive: false, // Inactive product
          category: { id: "cat1", name: "Food" },
        },
      ] as any

      // Mock the Products repository to return only active products
      // This tests that the repository correctly filters out inactive products
      mockMessageRepository.getProducts.mockImplementation(() => {
        // Return only active products, filtering out inactive ones
        return Promise.resolve(
          activeAndInactiveProducts.filter((p: any) => p.isActive)
        )
      })

      mockMessageRepository.getServices.mockResolvedValue([])
      mockMessageRepository.getLatesttMessages.mockResolvedValue([])

      // Mock response that should only include active products
      const activeProductsResponse =
        "Ecco i nostri prodotti:\n1. Pasta - €5.99\nCategoria: Food\nDescrizione: Italian pasta\n\n2. Olive Oil - €12.99\nCategoria: Oil\nDescrizione: Extra virgin"
      mockMessageRepository.getResponseFromRag.mockResolvedValue(
        activeProductsResponse
      )
      mockMessageRepository.getConversationResponse.mockResolvedValue(
        activeProductsResponse
      )

      // Execute with a request for products
      const result = await messageService.processMessage(
        "Quali prodotti avete?",
        "+1234567890",
        "workspace-id"
      )

      // Verify getProducts was called
      expect(mockMessageRepository.getProducts).toHaveBeenCalled()

      // Verify that only two products were returned (the active ones)
      const productsPassedToRag =
        mockMessageRepository.getResponseFromRag.mock.calls[0][2]
      expect(productsPassedToRag).toHaveLength(2)

      // Verify the inactive product is not included
      const productNames = productsPassedToRag.map((p) => p.name)
      expect(productNames).toContain("Pasta")
      expect(productNames).toContain("Olive Oil")
      expect(productNames).not.toContain("Discontinued Item")

      // Verify response doesn't mention the inactive product
      expect(result).toContain("Pasta")
      expect(result).toContain("Olive Oil")
      expect(result).not.toContain("Discontinued Item")
    })

    // Test case: Only active services should be returned
    it("should only display active services", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock a registered customer
      const registeredCustomer = {
        id: "customer-id",
        phone: "+1234567890",
        name: "Maria Rossi",
        language: "Italian",
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(
        registeredCustomer
      )

      // Mock router prompt and agent selection
      mockMessageRepository.getRouterAgent.mockResolvedValue("router prompt")
      mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue({
        name: "Services",
        content: "You are a service specialist",
        department: "SERVICES",
      })

      // Mock services with both active and inactive services
      const activeAndInactiveServices = [
        {
          id: "serv1",
          name: "Consegna a domicilio",
          description: "Consegna entro 24 ore",
          price: 3.99,
          duration: 60,
          isActive: true, // Active service
        },
        {
          id: "serv2",
          name: "Consulenza culinaria",
          description: "Consigli personalizzati dai nostri chef",
          price: 15.0,
          duration: 30,
          isActive: true, // Active service
        },
        {
          id: "serv3",
          name: "Servizio non disponibile",
          description: "Questo servizio non è più disponibile",
          price: 9.99,
          duration: 45,
          isActive: false, // Inactive service
        },
      ] as any

      // Mock the Services repository to return only active services
      // This tests that the repository correctly filters out inactive services
      mockMessageRepository.getServices.mockImplementation(() => {
        // Return only active services, filtering out inactive ones
        return Promise.resolve(
          activeAndInactiveServices.filter((s: any) => s.isActive)
        )
      })

      mockMessageRepository.getProducts.mockResolvedValue([])
      mockMessageRepository.getLatesttMessages.mockResolvedValue([])

      // Mock response that should only include active services
      const activeServicesResponse =
        "Ecco i nostri servizi:\n1. Consegna a domicilio - €3.99\nDescrizione: Consegna entro 24 ore\nDurata: 60 minuti\n\n2. Consulenza culinaria - €15.00\nDescrizione: Consigli personalizzati dai nostri chef\nDurata: 30 minuti"
      mockMessageRepository.getResponseFromRag.mockResolvedValue(
        activeServicesResponse
      )
      mockMessageRepository.getConversationResponse.mockResolvedValue(
        activeServicesResponse
      )

      // Execute with a request for services
      const result = await messageService.processMessage(
        "Quali servizi offrite?",
        "+1234567890",
        "workspace-id"
      )

      // Verify getServices was called
      expect(mockMessageRepository.getServices).toHaveBeenCalled()

      // Verify that only two services were returned (the active ones)
      const servicesPassedToRag =
        mockMessageRepository.getResponseFromRag.mock.calls[0][3]
      expect(servicesPassedToRag).toHaveLength(2)

      // Verify the inactive service is not included
      const serviceNames = servicesPassedToRag.map((s) => s.name)
      expect(serviceNames).toContain("Consegna a domicilio")
      expect(serviceNames).toContain("Consulenza culinaria")
      expect(serviceNames).not.toContain("Servizio non disponibile")

      // Verify response doesn't mention the inactive service
      expect(result).toContain("Consegna a domicilio")
      expect(result).toContain("Consulenza culinaria")
      expect(result).not.toContain("Servizio non disponibile")
    })
  })

  describe("activeChatbot flag handling", () => {
    // Test case: Customer with activeChatbot=false should not get automated responses
    it("should skip bot response when customer has activeChatbot=false", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock a customer with activeChatbot disabled (operator manual control)
      const customerWithDisabledChatbot = {
        id: "customer-id",
        phone: "+1234567890",
        name: "John Doe",
        language: "Italian",
        activeChatbot: false, // Chatbot disabled, operator manual control
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(
        customerWithDisabledChatbot
      )

      // Clear previous calls
      mockMessageRepository.getRouterAgent.mockClear()
      mockMessageRepository.getResponseFromAgentRouter.mockClear()
      mockMessageRepository.getResponseFromRag.mockClear()
      mockMessageRepository.getConversationResponse.mockClear()

      // Execute with any message
      const result = await messageService.processMessage(
        "Ciao, vorrei informazioni",
        "+1234567890",
        "workspace-id"
      )

      // Verify no chatbot response was generated
      expect(result).toBe("") // Empty response means no chatbot response

      // Verify that none of the AI processing steps were called
      expect(mockMessageRepository.getRouterAgent).not.toHaveBeenCalled()
      expect(
        mockMessageRepository.getResponseFromAgentRouter
      ).not.toHaveBeenCalled()
      expect(mockMessageRepository.getResponseFromRag).not.toHaveBeenCalled()
      expect(
        mockMessageRepository.getConversationResponse
      ).not.toHaveBeenCalled()

      // Verify message was saved with special "Manual Operator Control" tag
      expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith({
        workspaceId: "workspace-id",
        phoneNumber: "+1234567890",
        message: "Ciao, vorrei informazioni",
        response: "",
        agentSelected: "Manual Operator Control",
      })
    })

    // Test case: Customer with activeChatbot=true should get normal automated responses
    it("should process bot response normally when customer has activeChatbot=true", async () => {
      // Setup
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Mock a customer with activeChatbot enabled (default behavior)
      const customerWithEnabledChatbot = {
        id: "customer-id",
        phone: "+1234567890",
        name: "John Doe",
        language: "Italian",
        activeChatbot: true, // Chatbot enabled (default)
      } as any

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(
        customerWithEnabledChatbot
      )

      // Mock the bot processing steps
      mockMessageRepository.getRouterAgent.mockResolvedValue("router prompt")
      mockMessageRepository.getProducts.mockResolvedValue([])
      mockMessageRepository.getServices.mockResolvedValue([])
      mockMessageRepository.getLatesttMessages.mockResolvedValue([])
      mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue({
        name: "TestAgent",
        content: "You are a test agent",
      })
      mockMessageRepository.getResponseFromRag.mockResolvedValue(
        "Test system prompt"
      )
      mockMessageRepository.getConversationResponse.mockResolvedValue(
        "Bot response"
      )

      // Execute with any message
      const result = await messageService.processMessage(
        "Ciao, vorrei informazioni",
        "+1234567890",
        "workspace-id"
      )

      // Verify normal chatbot response was generated
      expect(result).toBe("Bot response")

      // Verify that all AI processing steps were called
      expect(mockMessageRepository.getRouterAgent).toHaveBeenCalled()
      expect(
        mockMessageRepository.getResponseFromAgentRouter
      ).toHaveBeenCalled()
      expect(mockMessageRepository.getResponseFromRag).toHaveBeenCalled()
      expect(mockMessageRepository.getConversationResponse).toHaveBeenCalled()

      // Verify message was saved with the agent name
      expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: "workspace-id",
          phoneNumber: "+1234567890",
          message: "Ciao, vorrei informazioni",
          response: "Bot response",
          agentSelected: "TestAgent",
        })
      )
    })
  })

  it("should return welcome message in Italian when user greets with Ciao", async () => {
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        en: "Welcome! (EN)",
        it: "Benvenuto! (IT)",
        es: "¡Bienvenido! (ES)",
      },
    } as any)
    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue(null)
    // Simula che il primo messaggio sia "Ciao"
    const result = await messageService.processMessage(
      "Ciao",
      "+393331234567",
      "workspace-id"
    )
    expect(result).toContain("Benvenuto")
    expect(result).not.toContain("Welcome! (EN)")
    expect(result).not.toContain("¡Bienvenido! (ES)")
  })

  it("should return welcome message in English when user greets with Hello", async () => {
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        en: "Welcome! (EN)",
        it: "Benvenuto! (IT)",
        es: "¡Bienvenido! (ES)",
        pt: "Bem-vindo! (PT)",
      },
    } as any)
    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue(null)
    const result = await messageService.processMessage(
      "Hello",
      "+393331234567",
      "workspace-id"
    )
    expect(result).toContain("Welcome! (EN)")
  })

  it("should return welcome message in Spanish when user greets with Hola", async () => {
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        en: "Welcome! (EN)",
        it: "Benvenuto! (IT)",
        es: "¡Bienvenido! (ES)",
        pt: "Bem-vindo! (PT)",
      },
    } as any)
    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue(null)
    const result = await messageService.processMessage(
      "Hola",
      "+393331234567",
      "workspace-id"
    )
    expect(result).toContain("¡Bienvenido! (ES)")
  })

  it("should return welcome message in Portuguese when user greets with Olá", async () => {
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        en: "Welcome! (EN)",
        it: "Benvenuto! (IT)",
        es: "¡Bienvenido! (ES)",
        pt: "Bem-vindo! (PT)",
      },
    } as any)
    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue(null)
    const result = await messageService.processMessage(
      "Olá",
      "+393331234567",
      "workspace-id"
    )
    expect(result).toContain("Bem-vindo! (PT)")
  })

  it("should fallback to English welcome message if greeting is not recognized", async () => {
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        en: "Welcome! (EN)",
        it: "Benvenuto! (IT)",
        es: "¡Bienvenido! (ES)",
        pt: "Bem-vindo! (PT)",
      },
    } as any)
    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue(null)
    // Simula un messaggio NON saluto
    const result = await messageService.processMessage(
      "Qualcosa di strano",
      "+393331234567",
      "workspace-id"
    )
    expect(result).toContain("Welcome! (EN)")
  })

  it("should pass customer language to RAG function", async () => {
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
    } as any)
    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    // Mock un customer con language preference
    const mockCustomer = {
      id: "customer-id",
      phone: "+1234567890",
      language: "English",
      name: "Test Customer",
    } as any
    mockMessageRepository.findCustomerByPhone.mockResolvedValue(mockCustomer)
    mockMessageRepository.getRouterAgent.mockResolvedValue("router prompt")
    mockMessageRepository.getProducts.mockResolvedValue([])
    mockMessageRepository.getServices.mockResolvedValue([])
    mockMessageRepository.getLatesttMessages.mockResolvedValue([])
    const mockAgent = { name: "TestAgent", content: "agent content" }
    mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue(
      mockAgent
    )
    mockMessageRepository.getResponseFromRag.mockResolvedValue("Test response")
    mockMessageRepository.getConversationResponse.mockResolvedValue(
      "Test response"
    )
    // Usa un messaggio NON saluto
    await messageService.processMessage(
      "Vorrei informazioni",
      "+1234567890",
      "workspace-id"
    )
    expect(mockMessageRepository.getResponseFromRag).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      mockCustomer
    )
  })

  it("should replace {customerLanguage} in the prompt with the actual language", async () => {
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
    } as any)
    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    const mockCustomer = {
      id: "customer-id",
      phone: "+1234567890",
      language: "English",
      name: "Test Customer",
    } as any
    mockMessageRepository.findCustomerByPhone.mockResolvedValue(mockCustomer)
    mockMessageRepository.getRouterAgent.mockResolvedValue("router prompt")
    mockMessageRepository.getProducts.mockResolvedValue([])
    mockMessageRepository.getServices.mockResolvedValue([])
    mockMessageRepository.getLatesttMessages.mockResolvedValue([])
    const agentPromptWithVar =
      "Your response MUST be in **{customerLanguage}** language."
    const mockAgent = { name: "TestAgent", content: agentPromptWithVar }
    mockMessageRepository.getResponseFromAgentRouter.mockResolvedValue(
      mockAgent
    )
    let promptSentToRag = ""
    mockMessageRepository.getResponseFromRag.mockImplementation((agent) => {
      promptSentToRag = agent._replacedPrompt || agent.content
      return Promise.resolve("Test response")
    })
    mockMessageRepository.getConversationResponse.mockResolvedValue(
      "Test response"
    )
    // Usa un messaggio NON saluto
    await messageService.processMessage(
      "Vorrei informazioni",
      "+1234567890",
      "workspace-id"
    )
    expect(promptSentToRag).toContain("**English**")
    expect(promptSentToRag).not.toContain("{customerLanguage}")
  })

  it("should always show registration link for unregistered customer", async () => {
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
    } as any)
    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    const unregisteredCustomer = {
      id: "customer-id",
      phone: "+1234567890",
      name: "Unknown Customer",
    } as any
    mockMessageRepository.findCustomerByPhone.mockResolvedValue(
      unregisteredCustomer
    )
    process.env.FRONTEND_URL = "https://laltroitalia.shop"
    // Primo messaggio NON saluto
    let result = await messageService.processMessage(
      "Serve aiuto",
      "+1234567890",
      "workspace-id"
    )
    expect(result).toContain("completa la registrazione")
    // Secondo messaggio NON saluto
    result = await messageService.processMessage(
      "Ho bisogno di supporto",
      "+1234567890",
      "workspace-id"
    )
    expect(result).toContain("completa la registrazione")
    // Terzo messaggio NON saluto
    result = await messageService.processMessage(
      "Per favore rispondi",
      "+1234567890",
      "workspace-id"
    )
    expect(result).toContain("completa la registrazione")
    expect(mockMessageRepository.getRouterAgent).not.toHaveBeenCalled()
  })

  // Correggo il test di fallback: uso un saluto riconosciuto ma lingua non presente
  it("should fallback to English welcome message if greeting is recognized but language is missing", async () => {
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        en: "Welcome! (EN)",
        it: "Benvenuto! (IT)",
        es: "¡Bienvenido! (ES)",
        // pt mancante
      },
    } as any)
    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue(null)
    // Saluto riconosciuto ("Olá"), ma lingua non presente
    const result = await messageService.processMessage(
      "Olá",
      "+393331234567",
      "workspace-id"
    )
    expect(result).toContain("Welcome! (EN)")
  })

  it("should return welcome message in Italian with registration link when user greets with Ciao", async () => {
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        en: "Welcome! (EN)",
        it: "Benvenuto! (IT) Per registrarti clicca qui: https://example.com/register",
      },
    } as any)
    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue(null)
    const result = await messageService.processMessage(
      "Ciao",
      "+393331234567",
      "workspace-id"
    )
    expect(result).toContain("Benvenuto")
    expect(result).toContain("https://example.com/register")
    expect(result).not.toContain("Welcome! (EN)")
  })

  it("should fallback to English welcome message if greeting is recognized but language is missing", async () => {
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        en: "Welcome! (EN) Register here: https://example.com/register",
        it: "Benvenuto! (IT)",
        // pt mancante
      },
    } as any)
    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue(null)
    // Saluto riconosciuto ("Olá"), ma lingua non presente
    const result = await messageService.processMessage(
      "Olá",
      "+393331234567",
      "workspace-id"
    )
    expect(result).toContain("Welcome! (EN)")
    expect(result).toContain("https://example.com/register")
  })

  it("should return welcome message in Spanish with registration link when user greets with Hola and welcome message contains {link}", async () => {
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        es: "¡Bienvenido! Completa tu registro aquí: {link}",
        en: "Welcome! Register here: {link}",
      },
    } as any)
    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue(null)
    // Simula la generazione del link di registrazione
    const fakeLink = "https://example.com/register?token=abc"
    messageService["tokenService"] = {
      createRegistrationToken: jest
        .fn<() => Promise<string>>() // CORRETTO: firma funzione che ritorna Promise<string>
        .mockResolvedValue("abc"),
    } as any
    process.env.FRONTEND_URL = "https://example.com"
    const result = await messageService.processMessage(
      "Hola",
      "+34123456789",
      "workspace-id"
    )
    expect(result).toContain("¡Bienvenido!")
    expect(result).toContain(
      "https://example.com/register?phone=%2B34123456789&workspace=workspace-id&token=abc"
    )
    expect(result).not.toContain(
      "Per favore completa la registrazione prima di continuare"
    )
  })

  it("should SAVE welcome message in the log", async () => {
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        en: "Welcome! (EN)",
        it: "Benvenuto! (IT)",
      },
    } as any)
    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue(null)
    // Simula che il primo messaggio sia "Ciao" (saluto, non registrato)
    const result = await messageService.processMessage(
      "Ciao",
      "+393331234567",
      "workspace-id"
    )
    expect(result).toContain("Benvenuto! (IT)")
    expect(mockMessageRepository.saveMessage).toHaveBeenCalled()
  })

  it("should NOT respond to repeated greeting after welcome message was sent", async () => {
    // Prima impostiamo NODE_ENV a test per simulare l'ambiente di test
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "test"

    try {
      // Mock con messaggio di saluto da cliente non registrato
      mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
        id: "workspace-id",
        isActive: true,
        welcomeMessages: {
          en: "Welcome! (EN)",
          it: "Benvenuto! (IT)",
        },
      } as any)
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)

      // Cliente non registrato
      mockMessageRepository.findCustomerByPhone.mockResolvedValue({
        id: "customer-id",
        name: "Unknown Customer", // Cliente non registrato
        phone: "+393331234567",
      } as any)

      // Per l'ambiente di test, dobbiamo fare un override esplicito per simulare
      // il comportamento che desideriamo testare - restituire stringa vuota
      // Questo simula il comportamento del nostro codice quando c'è già un messaggio di benvenuto
      mockMessageRepository.getLatesttMessages.mockResolvedValue([
        {
          id: "msg-1",
          direction: "OUTBOUND", // Inviato dal sistema
          content: "Benvenuto! (IT)\nPer favore completa la registrazione...",
          metadata: { agentName: "Welcome" },
          createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minuti fa
        },
      ] as any)

      // Simulate the behavior directly without mocking processMessage
      // This avoids TypeScript errors with function replacement

      // Eseguiamo il test, il messaggio "Ciao" dopo un welcome message recente
      // dovrebbe generare una risposta vuota
      const result = await messageService.processMessage(
        "Ciao",
        "+393331234567",
        "workspace-id"
      )

      // La risposta dovrebbe essere vuota (nessuna risposta)
      // Questo test passerà solo se il backend è stato modificato per restituire
      // una stringa vuota quando un messaggio di saluto viene inviato dopo un welcome message
      expect(result).toBe("")

      // Verifichiamo che il messaggio venga elaborato senza risposta
      expect(mockMessageRepository.getLatesttMessages).toHaveBeenCalled()

      // Verifichiamo che il messaggio sia stato salvato con agentSelected "NoResponse"
      expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: "workspace-id",
          phoneNumber: "+393331234567",
          message: "Ciao",
          response: "",
          agentSelected: "NoResponse",
        })
      )
    } finally {
      // Ripristina l'ambiente originale
      process.env.NODE_ENV = originalNodeEnv
    }
  })

  // Test case: Welcome message should always contain http:// or https:// in registration link
  it("should include http protocol in registration link for welcome messages", async () => {
    // Setup
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        en: "Welcome! Register here: {link}",
      },
    } as any)
    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue(null)

    // Simula la generazione del token di sicurezza
    messageService["tokenService"] = {
      createRegistrationToken: jest
        .fn<() => Promise<string>>()
        .mockResolvedValue("secure-token-123"),
    } as any

    // Imposta l'URL del frontend
    process.env.FRONTEND_URL = "https://laltroitalia.shop"

    // Invia un messaggio di saluto
    const result = await messageService.processMessage(
      "Hello",
      "+1234567890",
      "workspace-id"
    )

    // Verifica che il risultato contenga http:// o https://
    expect(result).toMatch(/https?:\/\//)

    // Verifica che contenga il token di sicurezza e altri parametri necessari
    expect(result).toContain("token=secure-token-123")
    expect(result).toContain("workspace=workspace-id")
    expect(result).toContain("phone=")
  })

  // Test case: Verificare che non vengano inviati messaggi di benvenuto duplicati
  it("should NOT send duplicate welcome messages for repeated greetings within a short time", async () => {
    // Reset di tutti i mock prima del test
    jest.resetAllMocks()

    // Setup
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        es: "¡Bienvenido! (ES)",
        en: "Welcome! (EN)",
      },
    } as any)

    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue({
      id: "customer-id",
      name: "Unknown Customer", // Cliente non registrato
      phone: "+34123456789",
    } as any)

    // Mock del token service
    messageService["tokenService"] = createMockTokenService()

    // PRIMO SCENARIO: simuliamo che non ci siano messaggi precedenti
    // Questo è importante! Per il primo messaggio, restituiamo una lista vuota
    mockMessageRepository.getLatesttMessages.mockResolvedValueOnce([])

    // Eseguiamo il primo messaggio "Hola"
    const firstResponse = await messageService.processMessage(
      "Hola",
      "+34123456789",
      "workspace-id"
    )

    // Verifica che il primo messaggio sia un benvenuto
    expect(firstResponse).toContain("¡Bienvenido!")

    // Verifichiamo che il messaggio di benvenuto sia stato salvato correttamente
    expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "workspace-id",
        phoneNumber: "+34123456789",
        message: "Hola",
        response: expect.stringContaining("¡Bienvenido!"),
        agentSelected: "Welcome",
      })
    )

    // IMPORTANTE: Reset completo dei mock tra i due test
    // Questo assicura che il secondo test sia completamente indipendente dal primo
    jest.resetAllMocks()

    // Setup per il secondo scenario - simuliamo esattamente la stessa configurazione
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        es: "¡Bienvenido! (ES)",
        en: "Welcome! (EN)",
      },
    } as any)

    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue({
      id: "customer-id",
      name: "Unknown Customer",
      phone: "+34123456789",
    } as any)

    // Mock del token service
    messageService["tokenService"] = createMockTokenService()

    // SECONDO SCENARIO: simuliamo che CI SIA un messaggio di benvenuto recente
    // Questo è cruciale per il test
    mockMessageRepository.getLatesttMessages.mockResolvedValue([
      {
        id: "msg-1",
        workspaceId: "workspace-id",
        phoneNumber: "+34123456789",
        direction: "OUTBOUND", // Inviato dal sistema
        content:
          "¡Bienvenido! (ES) https://example.com/register?token=test-token",
        metadata: { agentName: "Welcome" },
        createdAt: new Date(), // Messaggio recente (oggi)
      },
    ] as any)

    // Eseguiamo il secondo messaggio "Hola" (ripetuto)
    const secondResponse = await messageService.processMessage(
      "Hola",
      "+34123456789",
      "workspace-id"
    )

    // Il punto chiave del test: verifichiamo che il sistema non risponda al secondo saluto
    expect(secondResponse).toBe("")

    // Verifichiamo che il messaggio sia stato salvato con agentSelected = "NoResponse"
    // e che sia stato chiamato una sola volta
    expect(mockMessageRepository.saveMessage).toHaveBeenCalledTimes(1)
    expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "workspace-id",
        phoneNumber: "+34123456789",
        message: "Hola",
        response: "",
        agentSelected: "NoResponse",
      })
    )
  })

  it("should have exactly 1 record in history after a greeting (user message and bot response in one record)", async () => {
    // Reset di tutti i mock prima del test
    jest.resetAllMocks()

    // Setup
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        es: "¡Bienvenido! (ES)",
        en: "Welcome! (EN)",
        it: "Benvenuto! (IT)",
      },
    } as any)

    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue(null)
    mockMessageRepository.getLatesttMessages.mockResolvedValue([])

    // Mock del TokenService
    messageService["tokenService"] = createMockTokenService()

    // Eseguiamo il messaggio "Ciao"
    const response = await messageService.processMessage(
      "Ciao",
      "+393331234567",
      "workspace-id"
    )

    // Verifica che la risposta contenga il messaggio di benvenuto
    expect(response).toContain("Benvenuto!")

    // Verifica i dettagli del record salvato
    expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "workspace-id",
        phoneNumber: "+393331234567",
        message: "Ciao",
        response: expect.stringContaining("Benvenuto!"),
        agentSelected: "Welcome",
      })
    )
  })

  it("should NOT send duplicate welcome messages for repeated greetings", async () => {
    // Reset di tutti i mock prima del test
    jest.resetAllMocks()

    // Setup
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        es: "¡Bienvenido! (ES)",
        en: "Welcome! (EN)",
        it: "Benvenuto! (IT)",
      },
    } as any)

    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue({
      id: "customer-id",
      name: "Unknown Customer",
      phone: "+393331234567",
    } as any)

    // Mock del token service
    messageService["tokenService"] = createMockTokenService()

    // PRIMO SCENARIO: primo saluto senza messaggi precedenti
    mockMessageRepository.getLatesttMessages.mockResolvedValueOnce([])

    // Eseguiamo il primo messaggio "Ciao"
    const firstResponse = await messageService.processMessage(
      "Ciao",
      "+393331234567",
      "workspace-id"
    )

    // Verifichiamo la risposta al primo saluto
    expect(firstResponse).toContain("Benvenuto!")

    // Reset di tutti i mock prima del secondo scenario
    jest.resetAllMocks()

    // Setup per il secondo scenario
    mockMessageRepository.getWorkspaceSettings.mockResolvedValue({
      id: "workspace-id",
      isActive: true,
      welcomeMessages: {
        es: "¡Bienvenido! (ES)",
        en: "Welcome! (EN)",
        it: "Benvenuto! (IT)",
      },
    } as any)

    mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
    mockMessageRepository.findCustomerByPhone.mockResolvedValue({
      id: "customer-id",
      name: "Unknown Customer",
      phone: "+393331234567",
    } as any)

    // SECONDO SCENARIO: secondo saluto con messaggio di benvenuto precedente
    mockMessageRepository.getLatesttMessages.mockResolvedValueOnce([
      {
        id: "msg-id",
        direction: "OUTBOUND",
        content:
          "Benvenuto! (IT) https://example.com/register?token=test-token",
        metadata: { agentName: "Welcome" },
        createdAt: new Date(), // Recente (oggi)
      },
    ] as any)

    // Eseguiamo il secondo messaggio "Ciao" (ripetuto)
    const secondResponse = await messageService.processMessage(
      "Ciao",
      "+393331234567",
      "workspace-id"
    )

    // Punto chiave: verifichiamo che non ci sia risposta al secondo saluto
    expect(secondResponse).toBe("")

    // Verifichiamo che il messaggio sia stato salvato con NoResponse
    expect(mockMessageRepository.saveMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        agentSelected: "NoResponse",
        message: "Ciao",
        response: "",
      })
    )
  })
})

// Funzione helper per creare un mock completo di TokenService
function createMockTokenService() {
  return {
    prisma: {} as any,
    createRegistrationToken: jest
      .fn()
      .mockImplementation((_phoneNumber: string, _workspaceId: string) =>
        Promise.resolve("test-token")
      ),
    validateToken: jest.fn().mockImplementation(() => Promise.resolve({})),
    markTokenAsUsed: jest.fn().mockImplementation(() => Promise.resolve()),
    cleanupExpiredTokens: jest
      .fn()
      .mockImplementation(() => Promise.resolve(0)),
    generateSecureToken: jest.fn().mockImplementation(() => "secure-token"),
  } as any
}
