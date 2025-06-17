import { MessageDirection, MessageType, PrismaClient } from "@prisma/client"
import dotenv from "dotenv"
import OpenAI from "openai"
import logger from "../utils/logger"

// Load environment variables
dotenv.config()

// Log API key status (safely)
const apiKey = process.env.OPENAI_API_KEY || ""
logger.info(
  `OpenAI API key status: ${
    apiKey ? "Present (length: " + apiKey.length + ")" : "Missing"
  }`
)
if (apiKey) {
  logger.info(`API key prefix: ${apiKey.substring(0, 10)}...`)
}

// OpenAI client instance
const openai = new OpenAI({
  apiKey: apiKey, // No default 'your-api-key-here' value, just use the actual key
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://laltroitalia.shop",
    "X-Title": "L'Altra Italia Shop",
  },
})

// Helper function to check if OpenAI is properly configured
function isOpenAIConfigured() {
  // In test environment, always return true
  if (process.env.NODE_ENV === 'test') {
    return true;
  }
  
  const apiKey = process.env.OPENAI_API_KEY
  // Log for debugging
  console.log(
    `API key check - key present: ${!!apiKey}, key length: ${
      apiKey ? apiKey.length : 0
    }`
  )
  if (apiKey) {
    console.log(`API key prefix: ${apiKey.substring(0, 10)}...`)
  }
  return apiKey && apiKey.length > 10 && apiKey !== "your-api-key-here"
}

export class MessageRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Create a new chat session for a customer
   *
   * @param workspaceId The workspace ID
   * @param customerId The customer ID
   * @returns The created chat session
   */
  async createChatSession(workspaceId: string, customerId: string) {
    try {
      const session = await this.prisma.chatSession.create({
        data: {
          workspaceId,
          customerId,
          status: "active",
        },
      })

      logger.info(`Created new chat session: ${session.id}`)
      return session
    } catch (error) {
      logger.error("Error creating chat session:", error)
      throw new Error("Failed to create chat session")
    }
  }

  /**
   * Save a single message to the database
   *
   * @param chatSessionId The chat session ID
   * @param content The message content
   * @param direction The message direction (INBOUND or OUTBOUND)
   * @param type The message type
   * @param aiGenerated Whether the message was AI generated
   * @param metadata Additional metadata
   * @returns The created message
   */
  async saveOriginalMessage(
    chatSessionId: string,
    content: string,
    direction: MessageDirection,
    type: MessageType = MessageType.TEXT,
    aiGenerated: boolean = false,
    metadata: any = {}
  ) {
    try {
      const message = await this.prisma.message.create({
        data: {
          chatSessionId,
          content,
          direction,
          type,
          aiGenerated,
          metadata,
        },
      })

      logger.info(`Saved message: ${message.id}`)
      return message
    } catch (error) {
      logger.error("Error saving message:", error)
      throw new Error("Failed to save message")
    }
  }

  /**
   * Get chat session messages
   *
   * @param chatSessionId The chat session ID
   * @param workspaceId Optional workspace ID to filter
   * @returns The messages for the chat session
   */
  async getChatSessionMessages(chatSessionId: string, workspaceId?: string) {
    try {
      // First get the chat session to verify workspace
      if (workspaceId) {
        const session = await this.prisma.chatSession.findFirst({
          where: {
            id: chatSessionId,
            workspaceId: workspaceId
          },
          select: { id: true }
        });
        
        if (!session) {
          logger.warn(`getChatSessionMessages: Chat session ${chatSessionId} not found in workspace ${workspaceId}`);
          return [];
        }
      }
      
      const messages = await this.prisma.message.findMany({
        where: {
          chatSessionId,
        },
        orderBy: {
          createdAt: "asc",
        },
      })

      return messages
    } catch (error) {
      logger.error("Error getting chat session messages:", error)
      throw new Error("Failed to get chat session messages")
    }
  }

  /**
   * Find or create a customer by phone number
   *
   * @param workspaceId The workspace ID
   * @param phoneNumber The customer's phone number
   * @returns The customer
   */
  async findCustomerByPhone(phoneNumber: string, workspaceId: string) {
    try {
      const customer = await this.prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId,
        },
      })
      return customer
    } catch (error) {
      logger.error("Error finding customer by phone:", error)
      throw new Error("Failed to find customer by phone")
    }
  }

  /**
   * Find an active chat session or create a new one
   *
   * @param workspaceId The workspace ID
   * @param customerId The customer ID
   * @returns The chat session
   */
  async findOrCreateChatSession(workspaceId: string, customerId: string) {
    try {
      // Try to find an active session
      let session
      try {
        session = await this.prisma.chatSession.findFirst({
          where: {
            customerId: customerId,
            status: "active",
          },
          orderBy: {
            startedAt: "desc",
          },
        })

        if (!session) {
          session = await this.prisma.chatSession.create({
            data: {
              workspaceId: workspaceId,
              customerId: customerId,
              status: "active",
            },
          })
          logger.info(`Created new chat session: ${session.id}`)
        }
      } catch (error) {
        logger.error("Error finding or creating chat session:", error)
        throw new Error("Failed to find or create chat session")
      }

      return session
    } catch (error) {
      logger.error("Error finding or creating chat session:", error)
      throw new Error("Failed to find or create chat session")
    }
  }

  /**
   * Check if customer is in the blacklist
   *
   * @param phoneNumber The customer phone number to check
   * @param workspaceId The workspace ID to check blocklist
   * @returns True if customer is blacklisted, false otherwise
   */
  async isCustomerBlacklisted(phoneNumber: string, workspaceId?: string): Promise<boolean> {
    try {
      // Check if customer has isBlacklisted flag
      const customer = await this.prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
        },
        select: {
          isBlacklisted: true,
          workspaceId: true,
        },
      })

      // If customer is explicitly blacklisted, return true
      if (customer?.isBlacklisted === true) {
        return true
      }

      // If no workspaceId provided but we found the customer, use their workspaceId
      if (!workspaceId && customer?.workspaceId) {
        workspaceId = customer.workspaceId
      }

      // If we have a workspaceId, check the workspace blocklist
      if (workspaceId) {
        const workspace = await this.prisma.workspace.findUnique({
          where: { id: workspaceId },
          select: { blocklist: true },
        })

        if (workspace?.blocklist) {
          // Split the blocklist by newlines and check if the phone number is in the list
          const blockedNumbers = workspace.blocklist.split(/[\n,]/).map(num => num.trim())
          if (blockedNumbers.includes(phoneNumber)) {
            return true
          }
        }
      }

      return false
    } catch (error) {
      logger.error("Error checking customer blacklist status:", error)
      return false
    }
  }

  /**
   * Save a conversation message pair (user question and bot response)
   *
   * @param data Object containing message details
   * @returns The created message
   */
  async saveMessage(data: {
    workspaceId: string
    phoneNumber: string
    message: string
    response: string
    direction?: string
    agentSelected?: string
  }) {
    try {
      // Validate required fields
      if (!data.phoneNumber) {
        logger.error("saveMessage: Phone number is required")
        throw new Error("Phone number is required")
      }

      if (!data.message) {
        logger.error("saveMessage: Message content is required")
        throw new Error("Message content is required")
      }

      // Verify workspace ID
      let workspaceId = data.workspaceId
      logger.info(`saveMessage: Using provided workspace ID: ${workspaceId}`)

      // Validate workspace ID using the dedicated method
      if (workspaceId) {
        const isValid = await this.validateWorkspaceId(workspaceId)
        if (!isValid) {
          logger.warn(
            `saveMessage: Provided workspace ID ${workspaceId} is invalid, will search for alternative`
          )
          workspaceId = ""
        } else {
          // Check if workspace is active
          const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { isActive: true },
          })

          if (!workspace?.isActive) {
            logger.warn(
              `saveMessage: Workspace ${workspaceId} exists but is inactive, will search for active workspace`
            )
            workspaceId = ""
          }
        }
      }

      // If no valid workspace ID provided, try to find an existing workspace
      if (!workspaceId) {
        // Try to find an active workspace
        logger.info("saveMessage: Searching for an active workspace")

        // First try to get a workspace associated with this phone number
        let existingCustomer = await this.prisma.customers.findFirst({
          where: {
            phone: data.phoneNumber,
          },
          include: {
            workspace: {
              select: { id: true, isActive: true },
            },
          },
        })

        // If customer exists and has a workspace associated
        if (existingCustomer?.workspace?.id) {
          workspaceId = existingCustomer.workspace.id
          logger.info(
            `saveMessage: Found workspace ${workspaceId} associated with customer ${existingCustomer.id}`
          )
        }
        // Otherwise look for any active workspace
        else {
          const activeWorkspace = await this.prisma.workspace.findFirst({
            where: { isActive: true },
            select: { id: true },
          })

          if (activeWorkspace) {
            workspaceId = activeWorkspace.id
            logger.info(`saveMessage: Found active workspace: ${workspaceId}`)
          } else {
            // If no active workspace, try any workspace
            const anyWorkspace = await this.prisma.workspace.findFirst({
              select: { id: true },
            })

            if (anyWorkspace) {
              workspaceId = anyWorkspace.id
              logger.info(
                `saveMessage: No active workspaces. Using workspace: ${workspaceId}`
              )
            } else {
              logger.error("saveMessage: No workspaces found in the database")
              throw new Error("No workspace found in the database")
            }
          }
        }
      }

      // Find or create customer
      let customer = await this.findCustomerByPhone(
        data.phoneNumber,
        workspaceId
      )

      // If no customer exists, create one with the determined workspaceId
      if (!customer) {
        customer = await this.prisma.customers.create({
          data: {
            name: "Unknown Customer",
            email: `customer-${Date.now()}@example.com`,
            phone: data.phoneNumber,
            workspaceId: workspaceId,
          },
        })
        logger.info(`saveMessage: Created new customer: ${customer.id}`)
      }

      // Update customer's lastContact field
      await this.prisma.customers.update({
        where: { id: customer.id },
        data: { updatedAt: new Date() },
      })

      // Find or create chat session
      let session = await this.prisma.chatSession.findFirst({
        where: {
          customerId: customer.id,
          status: "active",
        },
        orderBy: {
          startedAt: "desc",
        },
      })

      if (!session) {
        session = await this.prisma.chatSession.create({
          data: {
            workspaceId: workspaceId,
            customerId: customer.id,
            status: "active",
          },
        })
        logger.info(`saveMessage: Created new chat session: ${session.id}`)
      }

      // Use INBOUND as default direction
      const direction =
        data.direction === "OUTBOUND"
          ? MessageDirection.OUTBOUND
          : MessageDirection.INBOUND

      // Save both messages in the conversation
      const userMessage =
        direction === MessageDirection.INBOUND ? data.message : data.response
      const botMessage =
        direction === MessageDirection.INBOUND ? data.response : data.message

      // Prepare metadata for bot response with agent info
      const botMetadata = data.agentSelected
        ? { agentName: data.agentSelected }
        : {}

      // Save user message (ensure it's not empty)
      if (userMessage && userMessage.trim()) {
        await this.prisma.message.create({
          data: {
            chatSessionId: session.id,
            content: userMessage,
            direction: MessageDirection.INBOUND,
            type: MessageType.TEXT,
            aiGenerated: false,
          },
        })
      }

      // Save bot response (ensure it's not empty)
      let botResponse = null
      if (botMessage && botMessage.trim()) {
        botResponse = await this.prisma.message.create({
          data: {
            chatSessionId: session.id,
            content: botMessage,
            direction: MessageDirection.OUTBOUND,
            type: MessageType.TEXT,
            aiGenerated: true,
            metadata: botMetadata,
          },
        })
      }

      // Also update the chat session's lastMessageAt
      await this.prisma.chatSession.update({
        where: { id: session.id },
        data: { updatedAt: new Date() },
      })

      logger.info(
        `saveMessage: Saved conversation pair for phone number: ${data.phoneNumber}`
      )
      return botResponse
    } catch (error) {
      logger.error("Error saving message pair:", error)
      throw new Error(`Failed to save message pair: ${error.message}`)
    }
  }

  /**
   * Get all chat sessions with their most recent message, ordered by latest message
   *
   * @param limit Number of chat sessions to return
   * @returns Array of chat sessions with latest message info
   */
  async getRecentChats(limit = 20, workspaceId?: string) {
    try {
      // Get all chat sessions with their most recent message
      const chatSessions = await this.prisma.chatSession.findMany({
        take: limit,
        include: {
          customer: true,
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        where: {
          ...(workspaceId ? { workspaceId } : {})
        }
      })

      // Format the results to include last message information
      return chatSessions.map((session) => {
        const lastMessage = session.messages[0]
        return {
          sessionId: session.id,
          customerId: session.customerId,
          customerName: session.customer.name,
          customerPhone: session.customer.phone,
          companyName: session.customer.company || null,
          lastMessage: lastMessage ? lastMessage.content : null,
          lastMessageTime: lastMessage
            ? lastMessage.createdAt
            : session.updatedAt,
          status: session.status,
          unreadCount: 0, // Will be updated later
          workspaceId: session.workspaceId, // Add workspaceId to the returned object
        }
      })
    } catch (error) {
      logger.error("Error getting recent chats:", error)
      throw new Error("Failed to get recent chats")
    }
  }

  /**
   * Get unread message count for a specific chat session
   *
   * @param chatSessionId The chat session ID
   * @returns Number of unread messages
   */
  async getUnreadCount(chatSessionId: string) {
    try {
      const count = await this.prisma.message.count({
        where: {
          chatSessionId,
          direction: MessageDirection.INBOUND, // Solo messaggi in entrata (dal cliente)
          read: false,
        },
      })

      return count
    } catch (error) {
      logger.error(
        `Error counting unread messages for session ${chatSessionId}:`,
        error
      )
      return 0
    }
  }

  /**
   * Mark all messages in a chat session as read
   *
   * @param chatSessionId The chat session ID
   * @param workspaceId Optional workspace ID to filter
   * @returns Success status
   */
  async markMessagesAsRead(chatSessionId: string, workspaceId?: string) {
    try {
      // First verify that the chat session belongs to the workspace if workspaceId is provided
      if (workspaceId) {
        const session = await this.prisma.chatSession.findFirst({
          where: {
            id: chatSessionId,
            workspaceId
          },
          select: { id: true }
        });
        
        if (!session) {
          logger.warn(`markMessagesAsRead: Chat session ${chatSessionId} not found in workspace ${workspaceId}`);
          return false;
        }
      }

      await this.prisma.message.updateMany({
        where: {
          chatSessionId,
          direction: MessageDirection.INBOUND,
          read: false,
        },
        data: {
          read: true,
          updatedAt: new Date(),
        },
      })

      return true
    } catch (error) {
      logger.error(
        `Error marking messages as read for session ${chatSessionId}:`,
        error
      )
      return false
    }
  }

  /**
   * Get chat sessions with unread message counts
   *
   * @param limit Maximum number of sessions to return
   * @param workspaceId Optional workspace ID to filter sessions
   * @returns Array of chat sessions with unread counts
   */
  async getChatSessionsWithUnreadCounts(limit = 20, workspaceId?: string) {
    try {
      // Get all chat sessions
      // @ts-ignore - Prisma types issue
      const chatSessions = await this.prisma.chatSession.findMany({
        where: {
          ...(workspaceId ? { workspaceId } : {})
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              // Remove avatar as it doesn't exist in the schema
            },
          },
          workspace: {
            select: {
              id: true,
              name: true,
            },
          },
          // Include message count
          messages: {
            where: {
              read: false, // Use 'read' instead of 'isRead'
              direction: "INBOUND",
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: limit,
      })

      // Map sessions to include unread count
      return chatSessions.map((session) => ({
        ...session,
        unreadCount: session.messages.length,
        messages: undefined, // Remove messages array
      }))
    } catch (error) {
      console.error("Error getting chat sessions with unread counts:", error)
      return []
    }
  }

  /**
   * Validate a workspace ID
   * @param workspaceId The workspace ID to validate
   * @returns True if valid, False otherwise
   */
  async validateWorkspaceId(workspaceId: string): Promise<boolean> {
    try {
      if (!workspaceId || typeof workspaceId !== "string") {
        logger.warn("Invalid workspace ID format")
        return false
      }

      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
      })

      return !!workspace
    } catch (error) {
      logger.error("Error validating workspace ID:", error)
      return false
    }
  }

  /**
   * Get workspace settings for a workspace
   * @param workspaceId The workspace ID
   * @returns Workspace settings
   */
  async getWorkspaceSettings(workspaceId: string) {
    try {
      logger.info(`Getting workspace settings for workspace ${workspaceId}`)

      // Check if workspaceId is missing or empty
      if (!workspaceId || workspaceId.trim() === "") {
        logger.warn(
          "getWorkspaceSettings: No workspace ID provided, trying to find default workspace"
        )

        // Try to find any active workspace
        const activeWorkspace = await this.prisma.workspace.findFirst({
          where: { isActive: true },
        })

        if (activeWorkspace) {
          logger.info(
            `getWorkspaceSettings: Found active workspace ${activeWorkspace.id} to use as default`
          )
          return activeWorkspace
        }

        // If no active workspace, try any workspace
        const anyWorkspace = await this.prisma.workspace.findFirst()
        if (anyWorkspace) {
          logger.warn(
            `getWorkspaceSettings: No active workspaces found, using ${anyWorkspace.id} (inactive)`
          )
          return anyWorkspace
        }

        logger.error(
          "getWorkspaceSettings: No workspaces found in the database"
        )
        return null
      }

      // Try to find by exact ID first
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
      })

      // If found, return it
      if (workspace) {
        logger.info(
          `getWorkspaceSettings: Workspace ${workspaceId} found, isActive: ${workspace.isActive}`
        )
        return workspace
      }

      // If not found by ID, try searching by name or slug
      logger.warn(
        `getWorkspaceSettings: Workspace with ID ${workspaceId} not found, trying alternative searches`
      )

      // Try by name or slug
      const workspaceByName = await this.prisma.workspace.findFirst({
        where: {
          OR: [
            { name: { contains: workspaceId, mode: "insensitive" } },
            { slug: { contains: workspaceId, mode: "insensitive" } },
          ],
        },
      })

      if (workspaceByName) {
        logger.info(
          `getWorkspaceSettings: Found workspace by name/slug match: ${workspaceByName.id}`
        )
        return workspaceByName
      }

      // If still not found, try to get any active workspace
      logger.warn(
        "getWorkspaceSettings: No matching workspace found, falling back to any active workspace"
      )

      const fallbackWorkspace = await this.prisma.workspace.findFirst({
        where: { isActive: true },
      })

      if (fallbackWorkspace) {
        logger.info(
          `getWorkspaceSettings: Using fallback active workspace: ${fallbackWorkspace.id}`
        )
        return fallbackWorkspace
      }

      logger.error(
        "getWorkspaceSettings: No workspaces found after all fallback attempts"
      )
      return null
    } catch (error) {
      logger.error(
        `Error getting workspace settings for ${workspaceId}:`,
        error
      )
      return null
    }
  }

  /**
   * Get the router agent
   * @param workspaceId Workspace ID to filter by
   * @returns The router agent prompt
   */
  async getRouterAgent(workspaceId?: string) {
    try {
      const routerAgent = await this.prisma.prompts.findFirst({
        where: {
          isRouter: true,
          ...(workspaceId ? { workspaceId } : {})
        },
      })
      
      return routerAgent
    } catch (error) {
      logger.error("Error getting router agent:", error)
      return null
    }
  }

  /**
   * Get all products
   * @param workspaceId Workspace ID to filter by
   * @returns List of products
   */
  async getProducts(workspaceId?: string) {
    try {
      const products = await this.prisma.products.findMany({
        where: workspaceId ? { workspaceId } : {},
        orderBy: {
          name: "asc",
        },
      })
      return products
    } catch (error) {
      logger.error("Error getting products:", error)
      return []
    }
  }

  /**
   * Get all services
   * @param workspaceId Workspace ID to filter by
   * @returns List of services
   */
  async getServices(workspaceId?: string) {
    try {
      const services = await this.prisma.services.findMany({
        where: workspaceId ? { workspaceId } : {},
        orderBy: {
          name: "asc",
        },
      })
      return services
    } catch (error) {
      logger.error("Error getting services:", error)
      return []
    }
  }

  /**
   * Get all events
   * @param workspaceId Workspace ID to filter by
   * @returns List of events
   */
  async getEvents(workspaceId?: string) {
    try {
      // Events functionality has been removed from the system
      logger.info("Events functionality has been removed from the system");
      return [];
    } catch (error) {
      logger.error("Error getting events:", error)
      return []
    }
  }

  /**
   * Update a customer's language preference
   * 
   * @param customerId The customer's ID
   * @param language The language code to set
   * @returns The updated customer
   */
  async updateCustomerLanguage(customerId: string, language: string) {
    try {
      const updatedCustomer = await this.prisma.customers.update({
        where: {
          id: customerId
        },
        data: {
          language
        }
      });
      
      logger.info(`Updated language for customer ${customerId} to ${language}`);
      return updatedCustomer;
    } catch (error) {
      logger.error(`Error updating customer language:`, error);
      throw new Error("Failed to update customer language");
    }
  }

  /**
   * Create a new customer
   *
   * @param data Customer data
   * @returns The created customer
   */
  async createCustomer({
    name,
    email,
    phone,
    workspaceId,
    language = "ENG" // Add default language
  }: {
    name: string
    email: string
    phone: string
    workspaceId: string
    language?: string
  }) {
    try {
      const customer = await this.prisma.customers.create({
        data: {
          name,
          email,
          phone,
          workspaceId,
          language,
        },
      })
      logger.info(`Created customer: ${customer.id}`)
      return customer
    } catch (error) {
      logger.error("Error creating customer:", error)
      throw new Error("Failed to create customer")
    }
  }

  /**
   * Ottiene il prompt per il router di funzioni
   * @returns Il contenuto del prompt
   */
  async getFunctionRouterPrompt(): Promise<string> {
    try {
      // Ottieni il prompt per il function router
      const functionRouterPrompt = await this.prisma.prompts.findFirst({
        where: {
          name: {
            contains: "function-router",
            mode: "insensitive",
          },
        },
      })

      if (!functionRouterPrompt) {
        logger.warn("Function router prompt not found, using default")

        // Fallback: leggi il file direttamente
        try {
          const fs = require("fs")
          const path = require("path")
          const promptPath = path.join(
            __dirname,
            "../../../prisma/prompts/function-router.md"
          )

          if (fs.existsSync(promptPath)) {
            return fs.readFileSync(promptPath, "utf8")
          }
        } catch (fsError) {
          logger.error("Error reading function router prompt file:", fsError)
        }

        // Se tutto fallisce, usa un prompt di default
        return "You are a function router for a WhatsApp chatbot. Your task is to analyze the user's message and determine which function to call."
      }

      return functionRouterPrompt.content
    } catch (error) {
      logger.error("Error getting function router prompt:", error)
      return "You are a function router for a WhatsApp chatbot. Your task is to analyze the user's message and determine which function to call."
    }
  }

  /**
   * Chiama il function router di OpenAI per ottenere la funzione da chiamare
   * @param message Messaggio dell'utente
   * @returns Risultato della chiamata al function router
   */
  async callFunctionRouter(message: string): Promise<any> {
    try {
      // Check if OpenAI is properly configured
      if (!isOpenAIConfigured()) {
        logger.warn(
          "OpenAI API key not configured properly for function router"
        )
        return {
          function_call: {
            name: "get_generic_response",
            arguments: {},
          },
        }
      }

      // Ottieni il prompt del function router
      const functionRouterPrompt = await this.getFunctionRouterPrompt()

      // Definisci le funzioni disponibili per OpenAI
      const availableFunctions = [
        {
          name: "get_product_info",
          description: "Retrieves information about a specific product",
          parameters: {
            type: "object",
            properties: {
              product_name: {
                type: "string",
                description: "The name of the product to get information about",
              },
            },
            required: ["product_name"],
          },
        },
        {
          name: "get_event_by_date",
          description: "Retrieves events scheduled for a specific date",
          parameters: {
            type: "object",
            properties: {
              date: {
                type: "string",
                description: "The date in format YYYY-MM-DD",
              },
            },
            required: ["date"],
          },
        },
        {
          name: "get_service_info",
          description: "Retrieves information about a specific service",
          parameters: {
            type: "object",
            properties: {
              service_name: {
                type: "string",
                description: "The name of the service to get information about",
              },
            },
            required: ["service_name"],
          },
        },
        {
          name: "welcome_user",
          description: "Handles user greetings and generates welcome messages",
          parameters: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "create_order",
          description:
            "Creates a new order using products from the user's cart",
          parameters: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_cart_info",
          description:
            "Retrieves information about the user's current shopping cart",
          parameters: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_order_status",
          description: "Retrieves the status of a user's order",
          parameters: {
            type: "object",
            properties: {
              order_id: {
                type: "string",
                description:
                  "The ID of the order to check status for (optional)",
              },
            },
          },
        },
        {
          name: "add_to_cart",
          description: "Adds a product to the user's cart",
          parameters: {
            type: "object",
            properties: {
              product_name: {
                type: "string",
                description: "The name of the product to add to the cart",
              },
              quantity: {
                type: "integer",
                description: "The quantity of the product to add (default: 1)",
              },
            },
            required: ["product_name"],
          },
        },
        {
          name: "remove_from_cart",
          description: "Removes a product from the user's cart",
          parameters: {
            type: "object",
            properties: {
              product_name: {
                type: "string",
                description: "The name of the product to remove from the cart",
              },
              quantity: {
                type: "integer",
                description: "The quantity of the product to remove (optional)",
              },
            },
            required: ["product_name"],
          },
        },
        {
          name: "get_product_list",
          description: "Gets a list of available products",
          parameters: {
            type: "object",
            properties: {
              limit: {
                type: "integer",
                description:
                  "Maximum number of products to return, default is 10",
              },
            },
          },
        },
        {
          name: "get_products_by_category",
          description: "Gets products filtered by a specific category",
          parameters: {
            type: "object",
            properties: {
              category_name: {
                type: "string",
                description: "The name of the category to filter products by",
              },
              limit: {
                type: "integer",
                description:
                  "Maximum number of products to return, default is 10",
              },
            },
            required: ["category_name"],
          },
        },
        {
          name: "get_categories",
          description: "Gets a list of all available product categories",
          parameters: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_faq_info",
          description: "Retrieves information from the FAQ database",
          parameters: {
            type: "object",
            properties: {
              question: {
                type: "string",
                description: "The question to search for in the FAQ database",
              },
            },
            required: ["question"],
          },
        },
        {
          name: "get_generic_response",
          description:
            "Handles general conversation, greetings, or unclear requests",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      ]

      logger.info(
        `Calling function router for message: "${message.substring(0, 30)}${
          message.length > 30 ? "..." : ""
        }"`
      )

      // Chiamata all'API OpenAI con le funzioni definite
      const response = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: functionRouterPrompt },
          { role: "user", content: message },
        ],
        functions: availableFunctions,
        function_call: "auto",
      })

      // Estrai la chiamata di funzione dal risultato
      const functionCall = response.choices[0]?.message?.function_call

      if (!functionCall) {
        logger.warn("No function call returned by OpenAI")
        return {
          function_call: {
            name: "get_generic_response",
            arguments: {},
          },
        }
      }

      // Parsing degli argomenti della funzione
      let functionArgs = {}
      try {
        if (functionCall.arguments) {
          functionArgs = JSON.parse(functionCall.arguments)
        }
      } catch (error) {
        logger.error("Error parsing function arguments:", error)
      }

      logger.info(`Function router selected: ${functionCall.name}`)

      return {
        function_call: {
          name: functionCall.name,
          arguments: functionArgs,
        },
      }
    } catch (error) {
      logger.error("Error calling function router:", error)
      return {
        function_call: {
          name: "get_generic_response",
          arguments: {},
        },
      }
    }
  }

  /**
   * Delete a chat session and all its messages
   *
   * @param chatSessionId The chat session ID
   * @param workspaceId Optional workspace ID for filtering
   * @returns True if successful, false otherwise
   */
  async deleteChat(chatSessionId: string, workspaceId?: string): Promise<boolean> {
    try {
      // First verify that the chat session belongs to the workspace if needed
      if (workspaceId) {
        const session = await this.prisma.chatSession.findFirst({
          where: {
            id: chatSessionId,
            workspaceId
          },
          select: { id: true }
        });
        
        if (!session) {
          logger.warn(`deleteChat: Chat session ${chatSessionId} not found in workspace ${workspaceId}`);
          return false;
        }
      }

      // Delete all messages in the chat session
      await this.prisma.message.deleteMany({
        where: {
          chatSessionId,
        },
      })

      // Then delete the chat session itself
      await this.prisma.chatSession.delete({
        where: {
          id: chatSessionId,
        },
      })

      logger.info(`Deleted chat session: ${chatSessionId}`)
      return true
    } catch (error) {
      logger.error(`Error deleting chat session ${chatSessionId}:`, error)
      return false
    }
  }

  /**
   * Get latest messages for a phone number
   * @param phoneNumber The phone number
   * @param limit Number of messages to return
   * @param workspaceId Workspace ID to filter by
   * @returns Recent chat messages
   */
  async getLatesttMessages(phoneNumber: string, limit = 30, workspaceId?: string) {
    try {
      // Find customer by phone - use workspaceId if provided, otherwise use empty string
      const customer = await this.findCustomerByPhone(phoneNumber, workspaceId || "")
      
      if (!customer) return []

      // Find active chat session
      const session = await this.prisma.chatSession.findFirst({
        where: {
          customerId: customer.id,
          status: "active",
          ...(workspaceId ? { workspaceId } : {})
        },
      })
      
      if (!session) {
        return []
      }

      // Find messages for this session
      const messages = await this.prisma.message.findMany({
        where: {
          chatSessionId: session.id
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      })

      return messages
    } catch (error) {
      logger.error("Error getting latest messages:", error)
      return []
    }
  }

  /**
   * Get agent by workspace ID
   * @param workspaceId Workspace ID
   * @returns Agent for the workspace
   */
  async getAgentByWorkspaceId(workspaceId: string) {
    try {
      const agent = await this.prisma.prompts.findFirst({
        where: {
          workspaceId
        }
      })
      return agent
    } catch (error) {
      logger.error(`Error getting agent for workspace ${workspaceId}:`, error)
      return null
    }
  }

  /**
   * Get response from an agent
   * @param agent The agent to use
   * @param message The message to process
   * @returns The agent response
   */
  async getResponseFromAgent(agent: any, message: string) {
    try {
      // In a real implementation, this would call an LLM API
      // For now, we'll just return a mock response based on the message content
      const response = {
        name: agent.name || "Unknown",
        content: agent.content || "",
        department: agent.department || null
      }
      
      return response
    } catch (error) {
      logger.error("Error getting response from agent:", error)
      return { name: "Error", content: "Failed to get agent response" }
    }
  }
  

  
  /**
   * Get conversation response from LLM
   * @param chatHistory Previous messages
   * @param message Current user message
   * @param systemPrompt System prompt for the LLM
   * @returns LLM response
   */
  async getConversationResponse(
    chatHistory: any[],
    message: string,
    systemPrompt: string
  ) {
    try {
      // In a real implementation, this would call an LLM API
      // For now, we'll just return a mock response
      return "This is a mock response from the LLM"
    } catch (error) {
      logger.error("Error getting conversation response:", error)
      return "Failed to generate response"
    }
  }

  /**
   * Count recent messages from a phone number within a time window
   * @param phoneNumber Customer phone number
   * @param workspaceId Workspace ID
   * @param since Date to count messages from
   * @returns Number of messages
   */
  async countRecentMessages(phoneNumber: string, workspaceId: string, since: Date): Promise<number> {
    try {
      const count = await this.prisma.message.count({
        where: {
          chatSession: {
            workspaceId: workspaceId,
            customer: {
              phone: phoneNumber
            }
          },
          direction: MessageDirection.INBOUND,
          createdAt: {
            gte: since
          }
        }
      });
      
      return count;
    } catch (error) {
      logger.error('Error counting recent messages:', error);
      return 0; // Return 0 on error to avoid false positives
    }
  }

  /**
   * Update customer blacklist status
   * @param customerId Customer ID
   * @param workspaceId Workspace ID
   * @param isBlacklisted Blacklist status
   */
  async updateCustomerBlacklist(customerId: string, workspaceId: string, isBlacklisted: boolean): Promise<void> {
    try {
      await this.prisma.customers.update({
        where: {
          id: customerId,
          workspaceId,
        },
        data: {
          isBlacklisted,
        },
      });
      
      logger.info(`Customer ${customerId} blacklist status updated to: ${isBlacklisted}`);
    } catch (error) {
      logger.error("Error updating customer blacklist status:", error);
      throw error;
    }
  }

  /**
   * Add phone number to workspace blocklist
   * @param phoneNumber Phone number to add
   * @param workspaceId Workspace ID
   */
  async addToWorkspaceBlocklist(phoneNumber: string, workspaceId: string): Promise<void> {
    try {
      // Get current workspace
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { blocklist: true },
      });

      if (!workspace) {
        throw new Error(`Workspace ${workspaceId} not found`);
      }

      // Parse current blocklist
      const currentBlocklist = workspace.blocklist || "";
      const blockedNumbers = currentBlocklist
        .split(/[\n,]/)
        .map(num => num.trim())
        .filter(num => num.length > 0);

      // Add phone number if not already present
      if (!blockedNumbers.includes(phoneNumber)) {
        blockedNumbers.push(phoneNumber);
        
        // Update workspace blocklist
        const newBlocklist = blockedNumbers.join('\n');
        await this.prisma.workspace.update({
          where: { id: workspaceId },
          data: { blocklist: newBlocklist },
        });

        logger.info(`Phone ${phoneNumber} added to workspace ${workspaceId} blocklist`);
      } else {
        logger.info(`Phone ${phoneNumber} already in workspace ${workspaceId} blocklist`);
      }
    } catch (error) {
      logger.error("Error adding to workspace blocklist:", error);
      throw error;
    }
  }

  /**
   * TASK 4: Check if customer has recent activity within specified hours
   * Used for "Bentornato {NOME}" functionality
   * 
   * @param customerId The customer ID
   * @param hours Number of hours to check back (default: 2)
   * @param workspaceId The workspace ID for filtering
   * @returns true if customer has recent activity, false otherwise
   */
  async hasRecentActivity(customerId: string, hours: number = 2, workspaceId?: string): Promise<boolean> {
    try {
      const hoursAgo = new Date();
      hoursAgo.setHours(hoursAgo.getHours() - hours);

      const recentMessage = await this.prisma.message.findFirst({
        where: {
          chatSession: {
            customerId: customerId,
            ...(workspaceId && { workspaceId: workspaceId })
          },
          direction: MessageDirection.INBOUND, // Only check incoming messages from customer
          createdAt: {
            gte: hoursAgo
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const hasActivity = !!recentMessage;
      
      logger.info(`[TASK4] hasRecentActivity for customer ${customerId}: ${hasActivity} (within ${hours} hours)`);
      
      return hasActivity;
    } catch (error) {
      logger.error(`[TASK4] Error checking recent activity for customer ${customerId}:`, error);
      return false; // Return false on error to trigger welcome back message (safer)
    }
  }



  /**
   * Get WIP message from database - NO HARDCODE
   * @param workspaceId Workspace ID
   * @param language Customer language
   * @returns WIP message from database
   */
  async getWipMessage(workspaceId: string, language: string): Promise<string> {
    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { wipMessages: true }
      });

      if (!workspace?.wipMessages) {
        logger.warn(`No WIP messages found for workspace ${workspaceId}`);
        return "Service temporarily unavailable. We will be back soon!";
      }

      const wipMessages = workspace.wipMessages as Record<string, string>;
      return wipMessages[language] || wipMessages['en'] || "Service temporarily unavailable. We will be back soon!";
    } catch (error) {
      logger.error(`Error getting WIP message for workspace ${workspaceId}:`, error);
      return "Service temporarily unavailable. We will be back soon!";
    }
  }

  /**
   * Get welcome message from database - NO HARDCODE
   * @param workspaceId Workspace ID
   * @param language Customer language
   * @returns Welcome message from database
   */
  async getWelcomeMessage(workspaceId: string, language: string): Promise<string> {
    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { welcomeMessages: true }
      });

      if (!workspace?.welcomeMessages) {
        logger.warn(`No welcome messages found for workspace ${workspaceId}`);
        return "Welcome! Please register to continue:";
      }

      const welcomeMessages = workspace.welcomeMessages as Record<string, string>;
      return welcomeMessages[language] || welcomeMessages['en'] || "Welcome! Please register to continue:";
    } catch (error) {
      logger.error(`Error getting welcome message for workspace ${workspaceId}:`, error);
      return "Welcome! Please register to continue:";
    }
  }

  /**
   * Get welcome back message from database - NO HARDCODE
   * Uses afterRegistrationMessages as welcome back messages
   * @param workspaceId Workspace ID
   * @param customerName Customer name
   * @param language Customer language
   * @returns Welcome back message from database
   */
  async getWelcomeBackMessage(workspaceId: string, customerName: string, language: string): Promise<string> {
    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { afterRegistrationMessages: true }
      });

      if (!workspace?.afterRegistrationMessages) {
        logger.warn(`No after registration messages found for workspace ${workspaceId}`);
        return `Welcome back, ${customerName}! How can I help you today?`;
      }

      const afterRegMessages = workspace.afterRegistrationMessages as Record<string, string>;
      const template = afterRegMessages[language] || afterRegMessages['en'] || `Welcome back, {name}! How can I help you today?`;
      
      return template.replace('{name}', customerName).replace('{customerName}', customerName).replace('[nome]', customerName);
    } catch (error) {
      logger.error(`Error getting welcome back message for workspace ${workspaceId}:`, error);
      return `Welcome back, ${customerName}! How can I help you today?`;
    }
  }

  /**
   * Get error message from database - NO HARDCODE
   * Uses wipMessages as fallback for error messages
   * @param workspaceId Workspace ID
   * @param language Customer language
   * @returns Error message from database
   */
  async getErrorMessage(workspaceId: string, language: string): Promise<string> {
    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { wipMessages: true }
      });

      if (!workspace?.wipMessages) {
        logger.warn(`No error messages found for workspace ${workspaceId}`);
        return "Sorry, I'm having technical difficulties. Please try again later.";
      }

      // Use WIP messages as error messages fallback
      const wipMessages = workspace.wipMessages as Record<string, string>;
      return wipMessages[language] || wipMessages['en'] || "Sorry, I'm having technical difficulties. Please try again later.";
    } catch (error) {
      logger.error(`Error getting error message for workspace ${workspaceId}:`, error);
      return "Sorry, I'm having technical difficulties. Please try again later.";
    }
  }

  /**
   * Get agent configuration from database - NO HARDCODE
   * @param workspaceId Workspace ID
   * @returns Agent configuration from database
   */
  async getAgentConfig(workspaceId: string): Promise<{
    prompt: string;
    model: string;
    temperature: number;
    maxTokens: number;
  } | null> {
    try {
      const agentConfig = await this.prisma.agentConfig.findFirst({
        where: {
          workspaceId: workspaceId,
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (!agentConfig) {
        return null
      }

      return {
        prompt: agentConfig.prompt || "",
        model: agentConfig.model || "openai/gpt-4o-mini",
        temperature: agentConfig.temperature || 0.7,
        maxTokens: agentConfig.maxTokens || 1000
      }
    } catch (error) {
      logger.error(`Error getting agent config for workspace ${workspaceId}:`, error);
      return null;
    }
  }

  /**
   * Get workspace URL for registration links
   */
  async getWorkspaceUrl(workspaceId: string): Promise<string> {
    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { url: true }
      });
      
      if (!workspace?.url) {
        logger.warn(`No URL found for workspace ${workspaceId}, using default`);
        return 'http://localhost:3000';
      }
      
      return workspace.url;
    } catch (error) {
      logger.error('Error getting workspace URL:', error);
      return 'http://localhost:3000';
    }
  }

  /**
   * Get prompt by name from database
   */
  async getPromptByName(workspaceId: string, promptName: string): Promise<{
    id: string;
    name: string;
    content: string;
    model: string;
    temperature: number;
    maxTokens: number;
  } | null> {
    try {
      const prompt = await this.prisma.prompts.findFirst({
        where: {
          workspaceId,
          name: promptName,
          isActive: true
        },
        select: {
          id: true,
          name: true,
          content: true,
          model: true,
          temperature: true,
          max_tokens: true
        }
      });
      
      if (!prompt) {
        logger.warn(`Prompt "${promptName}" not found for workspace ${workspaceId}`);
        return null;
      }
      
      return {
        id: prompt.id,
        name: prompt.name,
        content: prompt.content,
        model: prompt.model || 'openai/gpt-4o-mini',
        temperature: prompt.temperature || 0.7,
        maxTokens: prompt.max_tokens || 1000
      };
    } catch (error) {
      logger.error(`Error getting prompt "${promptName}":`, error);
      return null;
    }
  }

  /**
   * Get RAG response with dynamic configuration - NO HARDCODE
   * @param customer Customer object
   * @param message User message
   * @param prompt Agent prompt from database
   * @param model Model from database
   * @param temperature Temperature from database
   * @param maxTokens Max tokens from database
   * @param workspaceId Workspace ID
   * @returns RAG response
   */
  async getResponseFromRag(
    customer: any,
    message: string,
    prompt: string,
    model: string,
    temperature: number,
    maxTokens: number,
    workspaceId: string,
    welcomeBackContext?: string
  ): Promise<string | null> {
    try {
      // Import embedding service for semantic search
      const { embeddingService } = await import('../services/embeddingService');
      
      // STEP 1: SEMANTIC SEARCH ACROSS ALL CHUNKS
      logger.info(`[RAG] Searching all content types for: "${message}"`);
      
      // Search all content types in parallel using semantic search
      const [productResults, faqResults, serviceResults, documentResults] = await Promise.all([
        embeddingService.searchProducts(message, workspaceId, 5),
        embeddingService.searchFAQs(message, workspaceId, 5), 
        embeddingService.searchServices(message, workspaceId, 5),
        Promise.resolve([]) // Documents search not implemented yet
      ]);

      logger.info(`[RAG] Found: ${productResults.length} products, ${faqResults.length} FAQs, ${serviceResults.length} services, ${documentResults.length} documents`);

      // STEP 2: GET FULL PRODUCT DETAILS WITH STOCK VERIFICATION
      const productIds = productResults.map(r => r.id);
      const fullProducts = productIds.length > 0 ? await this.prisma.products.findMany({
        where: {
          id: { in: productIds },
          workspaceId: workspaceId,
          isActive: true,
          stock: { gt: 0 } // VERIFY AVAILABILITY
        },
        include: {
          category: true
        }
      }) : [];

      // STEP 3: GET FULL FAQ DETAILS
      const faqIds = faqResults.map(r => r.id);
      const fullFAQs = faqIds.length > 0 ? await this.prisma.fAQ.findMany({
        where: {
          id: { in: faqIds },
          workspaceId: workspaceId,
          isActive: true
        }
      }) : [];

      // STEP 4: GET FULL SERVICE DETAILS  
      const serviceIds = serviceResults.map(r => r.id);
      const fullServices = serviceIds.length > 0 ? await this.prisma.services.findMany({
        where: {
          id: { in: serviceIds },
          workspaceId: workspaceId,
          isActive: true
        }
      }) : [];

      // STEP 5: GET CHAT HISTORY
      const chatHistory = await this.getLatesttMessages(customer.phone, 5, workspaceId);

      // STEP 6: BUILD UNIFIED CONTEXT FOR LLM FORMATTER
      const unifiedContext = {
        customer: {
          name: customer.name,
          language: customer.language,
          discount: customer.discount
        },
        welcomeBack: welcomeBackContext || null,
        searchResults: {
          products: productResults.map(r => ({
            similarity: r.similarity,
            content: r.content,
            product: fullProducts.find(p => p.id === r.id)
          })).filter(r => r.product), // Only include available products
          faqs: faqResults.map(r => ({
            similarity: r.similarity,
            content: r.content,
            faq: fullFAQs.find(f => f.id === r.id)
          })).filter(r => r.faq),
          services: serviceResults.map(r => ({
            similarity: r.similarity,
            content: r.content,
            service: fullServices.find(s => s.id === r.id)
          })).filter(r => r.service),
          documents: documentResults
        },
        chatHistory: chatHistory.slice(0, 5)
      };

      // STEP 7: BUILD COMPREHENSIVE PROMPT FOR LLM FORMATTER
      const finalPrompt = `${prompt}

CUSTOMER CONTEXT:
- Name: ${unifiedContext.customer.name}
- Language: ${unifiedContext.customer.language}
- Discount: ${unifiedContext.customer.discount}%

${unifiedContext.welcomeBack ? `WELCOME BACK MESSAGE: ${unifiedContext.welcomeBack}` : ''}

SEMANTIC SEARCH RESULTS:

PRODUCTS FOUND (with availability):
${unifiedContext.searchResults.products.map(r => 
  `- ${r.product?.name} (Similarity: ${r.similarity.toFixed(3)})
    Price: €${r.product?.price}
    Stock: ${r.product?.stock} units available
    Category: ${r.product?.category?.name || 'General'}
    Match: ${r.content}`
).join('\n\n')}

FAQS FOUND:
${unifiedContext.searchResults.faqs.map(r => 
  `- ${r.faq?.question} (Similarity: ${r.similarity.toFixed(3)})
    Answer: ${r.faq?.answer}
    Match: ${r.content}`
).join('\n\n')}

SERVICES FOUND:
${unifiedContext.searchResults.services.map(r => 
  `- ${r.service?.name} (Similarity: ${r.similarity.toFixed(3)})
    Description: ${r.service?.description}
    Price: €${r.service?.price}
    Duration: ${r.service?.duration || 'N/A'}
    Match: ${r.content}`
).join('\n\n')}

DOCUMENTS FOUND:
${unifiedContext.searchResults.documents.map(r => 
  `- Document: ${r.sourceName} (Similarity: ${r.similarity.toFixed(3)})
    Content: ${r.content}`
).join('\n\n')}

RECENT CHAT HISTORY:
${unifiedContext.chatHistory.map(h => `${h.direction === MessageDirection.INBOUND ? 'Customer' : 'Bot'}: ${h.content}`).join('\n')}

CUSTOMER MESSAGE: ${message}

INSTRUCTIONS FOR LLM FORMATTER:
- Combine ALL relevant information into a single, coherent response
- Include welcome back message if provided
- Show product availability and prices
- Include FAQ answers if relevant
- Mention services if applicable
- Reference document information if found
- Respond in ${unifiedContext.customer.language}
- Be helpful and comprehensive but concise`;

      logger.info(`[RAG] Sending unified context to LLM formatter (${model})`);

      // STEP 8: CALL LLM FORMATTER WITH UNIFIED CONTEXT
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: finalPrompt
            }
          ],
          temperature: temperature,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const formattedResponse = data.choices?.[0]?.message?.content || null;
      
      logger.info(`[RAG] LLM formatter response generated successfully`);
      return formattedResponse;

    } catch (error) {
      logger.error('Error in getResponseFromRag:', error);
      return null;
    }
  }

  /**
   * Get Prisma client for direct database access (public method for services)
   */
  public getPrismaClient(): PrismaClient {
    return this.prisma
  }

  /**
   * Find services with filtering (public method for LangChain)
   */
  public async findServices(workspaceId: string, options?: {
    category?: string
    limit?: number
    isActive?: boolean
  }) {
    try {
      const whereClause: any = {
        workspaceId,
        isActive: options?.isActive ?? true
      }

      if (options?.category) {
        whereClause.category = options.category
      }

      return await this.prisma.services.findMany({
        where: whereClause,
        take: options?.limit || 10,
        orderBy: { name: 'asc' }
      })
    } catch (error) {
      logger.error('Error finding services:', error)
      return []
    }
  }

  /**
   * Find products with filtering (public method for LangChain)
   */
  public async findProducts(workspaceId: string, options?: {
    category?: string
    productIds?: string[]
    limit?: number
    isActive?: boolean
  }) {
    try {
      const whereClause: any = {
        workspaceId,
        isActive: options?.isActive ?? true
      }

      if (options?.category) {
        whereClause.category = { name: options.category }
      }

      if (options?.productIds && options.productIds.length > 0) {
        whereClause.id = { in: options.productIds }
      }

      return await this.prisma.products.findMany({
        where: whereClause,
        include: { category: true },
        take: options?.limit || 10,
        orderBy: { name: 'asc' }
      })
    } catch (error) {
      logger.error('Error finding products:', error)
      return []
    }
  }

  /**
   * Find FAQs with filtering (public method for LangChain)
   */
  public async findFAQs(workspaceId: string, options?: {
    topic?: string
    limit?: number
    isActive?: boolean
  }) {
    try {
      const whereClause: any = {
        workspaceId,
        isActive: options?.isActive ?? true
      }

      if (options?.topic) {
        whereClause.OR = [
          { question: { contains: options.topic, mode: 'insensitive' } },
          { answer: { contains: options.topic, mode: 'insensitive' } }
        ]
      }

      return await this.prisma.fAQ.findMany({
        where: whereClause,
        take: options?.limit || 5,
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      logger.error('Error finding FAQs:', error)
      return []
    }
  }

  /**
   * Find offers with filtering (public method for LangChain)
   */
  public async findOffers(workspaceId: string, options?: {
    category?: string
    limit?: number
    isActive?: boolean
  }) {
    try {
      const now = new Date()
      const whereClause: any = {
        workspaceId,
        isActive: options?.isActive ?? true,
        startDate: { lte: now },
        endDate: { gte: now }
      }

      if (options?.category) {
        whereClause.category = { name: options.category }
      }

      return await this.prisma.offers.findMany({
        where: whereClause,
        include: { category: true },
        take: options?.limit || 10,
        orderBy: { discountPercent: 'desc' }
      })
    } catch (error) {
      logger.error('Error finding offers:', error)
      return []
    }
  }

  /**
   * Create order (public method for LangChain)
   */
  public async createOrder(data: {
    customerId: string
    workspaceId: string
    status?: string
    total?: number
  }) {
    try {
      return await this.prisma.orders.create({
        data: {
          customerId: data.customerId,
          workspaceId: data.workspaceId,
          status: data.status || 'PENDING',
          total: data.total || 0
        }
      })
    } catch (error) {
      logger.error('Error creating order:', error)
      throw new Error('Failed to create order')
    }
  }
}
