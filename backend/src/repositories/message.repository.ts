import {
  MessageDirection,
  MessageType,
  OrderStatus,
  PrismaClient,
} from "@prisma/client"
import * as dotenv from "dotenv"
import OpenAI from "openai"
import { config } from "../config"
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
  if (process.env.NODE_ENV === "test") {
    return true
  }

  const apiKey = process.env.OPENAI_API_KEY
  // Log for debugging
  logger.info(
    `API key check - key present: ${!!apiKey}, key length: ${
      apiKey ? apiKey.length : 0
    }`
  )
  if (apiKey) {
    logger.info(`API key prefix: ${apiKey.substring(0, 10)}...`)
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
   * @returns The messages for the chat session (all messages, blacklist status affects only new message sending)
   */
  async getChatSessionMessages(chatSessionId: string, workspaceId?: string) {
    try {
      // First get the chat session to verify workspace
      const session = await this.prisma.chatSession.findFirst({
        where: {
          id: chatSessionId,
          ...(workspaceId ? { workspaceId: workspaceId } : {}),
        },
        select: {
          id: true,
          customerId: true,
          customer: {
            select: {
              isBlacklisted: true,
              phone: true,
            },
          },
        },
      })

      if (!session) {
        logger.warn(
          `getChatSessionMessages: Chat session ${chatSessionId} not found${workspaceId ? ` in workspace ${workspaceId}` : ""}`
        )
        return []
      }

      // Log blacklist status but still return messages (blacklist only affects new message sending)
      if (session.customer?.isBlacklisted) {
        logger.info(
          `getChatSessionMessages: Customer ${session.customer.phone} (${session.customerId}) is blacklisted - showing existing messages but new messages will be blocked`
        )
      }

      // Check workspace blocklist if workspaceId is provided (for logging)
      if (workspaceId && session.customer?.phone) {
        const isBlacklisted = await this.isCustomerBlacklisted(
          session.customer.phone,
          workspaceId
        )
        if (isBlacklisted) {
          logger.info(
            `getChatSessionMessages: Customer ${session.customer.phone} is in workspace blocklist - showing existing messages but new messages will be blocked`
          )
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
  async findCustomerByPhone(phoneNumber: string) {
    try {
      const customer = await this.prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
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
  async isCustomerBlacklisted(
    phoneNumber: string,
    workspaceId?: string
  ): Promise<boolean> {
    try {
      // ✅ BLACKLIST CHECK ENABLED - Check customer blacklist status
      logger.info(`[BLACKLIST] Checking blacklist status for ${phoneNumber}`)

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
          const blockedNumbers = workspace.blocklist
            .split(/[\n,]/)
            .map((num) => num.trim())
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
    // 🔧 Debug fields
    translatedQuery?: string
    processedPrompt?: string
    functionCallsDebug?: any[]
    processingSource?: string
    debugInfo?: string // 🔧 NEW: Debug info as JSON string
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

      // Check if customer is blacklisted before saving any message
      const existingCustomer = await this.prisma.customers.findFirst({
        where: {
          phone: data.phoneNumber,
          workspaceId: data.workspaceId,
        },
        select: {
          id: true,
          isBlacklisted: true,
          name: true,
        },
      })

      if (existingCustomer?.isBlacklisted) {
        logger.warn(
          `saveMessage: Customer ${existingCustomer.name} (${data.phoneNumber}) is blacklisted - message blocked`
        )
        throw new Error("Customer is blacklisted - messages are not allowed")
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
      let customer = await this.findCustomerByPhone(data.phoneNumber)

      // If no customer exists, create a temporary "Unknown User-XXX" for new users
      // This allows us to save messages in chat history even before registration
      if (!customer) {
        logger.info(
          `saveMessage: No customer found for phone ${data.phoneNumber} - creating temporary customer for new user`
        )

        // Generate random 3-digit number for temporary user
        const randomNumber = Math.floor(Math.random() * 900) + 100 // 100-999

        // Detect language from message content
        let detectedLanguage = "IT" // Default to Italian
        if (data.message) {
          const lowerMessage = data.message.toLowerCase()

          // Italian detection
          const italianWords = [
            "ciao",
            "buongiorno",
            "buonasera",
            "buonanotte",
            "voglio",
            "ho bisogno",
            "vorrei",
            "per favore",
            "grazie",
            "prego",
            "sì",
            "no",
            "il",
            "la",
            "i",
            "le",
            "e",
            "o",
            "ma",
            "con",
            "per",
            "da",
            "in",
            "su",
            "a",
            "di",
          ]

          // English detection
          const englishWords = [
            "hello",
            "hi",
            "good morning",
            "good afternoon",
            "good evening",
            "i want",
            "i need",
            "i would like",
            "please",
            "thank you",
            "thanks",
            "yes",
            "no",
            "the",
            "and",
            "or",
            "but",
            "with",
            "for",
            "to",
            "from",
            "in",
            "on",
            "at",
            "by",
          ]

          // Spanish detection
          const spanishWords = [
            "hola",
            "buenos días",
            "buenas tardes",
            "buenas noches",
            "quiero",
            "necesito",
            "me gustaría",
            "por favor",
            "gracias",
            "sí",
            "no",
            "el",
            "la",
            "los",
            "las",
            "y",
            "o",
            "pero",
            "con",
            "para",
            "de",
            "en",
            "por",
          ]

          // Portuguese detection
          const portugueseWords = [
            "olá",
            "bom dia",
            "boa tarde",
            "boa noite",
            "quero",
            "preciso",
            "gostaria",
            "por favor",
            "obrigado",
            "obrigada",
            "sim",
            "não",
            "o",
            "a",
            "os",
            "as",
            "e",
            "ou",
            "mas",
            "com",
            "para",
            "de",
            "em",
            "por",
          ]

          // Count matches for each language
          const italianMatches = italianWords.filter((word) =>
            lowerMessage.includes(word)
          ).length
          const englishMatches = englishWords.filter((word) =>
            lowerMessage.includes(word)
          ).length
          const spanishMatches = spanishWords.filter((word) =>
            lowerMessage.includes(word)
          ).length
          const portugueseMatches = portugueseWords.filter((word) =>
            lowerMessage.includes(word)
          ).length

          // Determine language based on highest match count
          if (
            italianMatches > englishMatches &&
            italianMatches > spanishMatches &&
            italianMatches > portugueseMatches
          ) {
            detectedLanguage = "IT"
          } else if (
            englishMatches > italianMatches &&
            englishMatches > spanishMatches &&
            englishMatches > portugueseMatches
          ) {
            detectedLanguage = "ENG"
          } else if (
            spanishMatches > italianMatches &&
            spanishMatches > englishMatches &&
            spanishMatches > portugueseMatches
          ) {
            detectedLanguage = "ESP"
          } else if (
            portugueseMatches > italianMatches &&
            portugueseMatches > englishMatches &&
            portugueseMatches > spanishMatches
          ) {
            detectedLanguage = "PRT"
          }
        }

        // Create a temporary customer for new users
        customer = await this.prisma.customers.create({
          data: {
            name: `Unknown User-${randomNumber}`,
            email: `${data.phoneNumber.replace(/[^0-9]/g, "")}@temp.com`,
            phone: data.phoneNumber,
            workspaceId: workspaceId,
            isActive: false, // Mark as inactive until they register
            language: detectedLanguage,
            currency: "EUR",
          },
        })

        logger.info(
          `saveMessage: Created temporary customer ${customer.id} (Unknown User-${randomNumber}) for new user ${data.phoneNumber} with detected language: ${detectedLanguage}`
        )
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
        // 🚨 ANTI-DUPLICATE CHECK: Verify if similar message exists in same hour:minute
        const now = new Date()
        const currentHourMinute = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`

        // Search for messages in the last 2 minutes to catch duplicates across minute boundaries
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
        const existingMessage = await this.prisma.message.findFirst({
          where: {
            chatSessionId: session.id,
            content: userMessage,
            direction: MessageDirection.INBOUND,
            createdAt: {
              gte: twoMinutesAgo,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })

        if (existingMessage) {
          const existingHourMinute = `${existingMessage.createdAt.getHours()}:${existingMessage.createdAt.getMinutes().toString().padStart(2, "0")}`
          logger.warn(
            `🚨 DUPLICATE DETECTED: Message "${userMessage.substring(0, 50)}..." already exists from ${existingHourMinute} (${existingMessage.createdAt.toISOString()}). Current time: ${currentHourMinute}. Skipping insert.`
          )
        } else {
          await this.prisma.message.create({
            data: {
              chatSessionId: session.id,
              content: userMessage,
              direction: MessageDirection.INBOUND,
              type: MessageType.TEXT,
              aiGenerated: false,
            },
          })
          logger.info(
            `✅ SAVED USER MESSAGE: "${userMessage.substring(0, 50)}..." for session ${session.id}`
          )
        }
      }

      // Save bot response (ensure it's not empty)
      let botResponse = null
      // Fix: Ensure botMessage is a string before calling trim()
      const botMessageStr =
        typeof botMessage === "string" ? botMessage : String(botMessage || "")
      if (botMessageStr && botMessageStr.trim()) {
        // 🚨 ANTI-DUPLICATE CHECK: Verify if similar bot response exists in same hour:minute
        const now = new Date()
        const currentHourMinute = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`

        // Search for messages in the last 2 minutes to catch duplicates across minute boundaries
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
        const existingBotMessage = await this.prisma.message.findFirst({
          where: {
            chatSessionId: session.id,
            content: botMessageStr,
            direction: MessageDirection.OUTBOUND,
            createdAt: {
              gte: twoMinutesAgo,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })

        if (existingBotMessage) {
          const existingHourMinute = `${existingBotMessage.createdAt.getHours()}:${existingBotMessage.createdAt.getMinutes().toString().padStart(2, "0")}`
          logger.warn(
            `🚨 DUPLICATE BOT RESPONSE DETECTED: Response "${botMessageStr.substring(0, 50)}..." already exists from ${existingHourMinute} (${existingBotMessage.createdAt.toISOString()}). Current time: ${currentHourMinute}. Skipping insert.`
          )
          botResponse = existingBotMessage // Return existing response instead of creating new one
        } else {
          logger.info(
            `[DEBUG-TRACKING] 🔍 About to track usage for customer: ${customer.id}, workspace: ${workspaceId}`
          )

          // 💰 USAGE TRACKING: Check debugMode before tracking €0.005
          try {
            // Get workspace to check debugMode setting
            const workspace = await this.prisma.workspace.findUnique({
              where: { id: workspaceId },
              select: { debugMode: true },
            })

            if (!(workspace?.debugMode ?? true)) {
              // debugMode is false, track usage normally
              const { usageService } = await import("../services/usage.service")
              logger.info(
                `[DEBUG-TRACKING] 🔍 usageService imported successfully`
              )

              await usageService.trackUsage({
                clientId: customer.id,
                workspaceId: workspaceId,
                price: config.llm.defaultPrice,
              })

              logger.info(
                `[DEBUG-TRACKING] ✅ usageService.trackUsage called successfully`
              )
              logger.info(
                `[USAGE-TRACKING] 💰 €${config.llm.defaultPrice} tracked before saving AI response for customer ${customer.name} (${data.phoneNumber})`
              )
            } else {
              // debugMode is true, skip tracking
              logger.info(
                `[DEBUG-MODE] 🚫 Usage tracking skipped - debug mode enabled for workspace ${workspaceId}`
              )
            }
          } catch (trackingError) {
            logger.error(`[DEBUG-TRACKING] ❌ Tracking error:`, trackingError)
            logger.warn(
              `[USAGE-TRACKING] ❌ Failed to track usage, but conversation will still be saved:`,
              trackingError.message
            )
          }

          botResponse = await this.prisma.message.create({
            data: {
              chatSessionId: session.id,
              content: botMessageStr,
              direction: MessageDirection.OUTBOUND,
              type: MessageType.TEXT,
              aiGenerated: true,
              metadata: botMetadata,
              // 🔧 Debug fields
              translatedQuery: data.translatedQuery,
              processedPrompt: data.processedPrompt,
              functionCallsDebug: data.functionCallsDebug
                ? JSON.stringify(data.functionCallsDebug)
                : null,
              processingSource: data.processingSource,
              debugInfo: data.debugInfo, // 🔧 NEW: Debug info (already JSON string)
            },
          })
          logger.info(
            `✅ SAVED BOT RESPONSE: "${botMessageStr.substring(0, 50)}..." for session ${session.id}`
          )
        }
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
   * Recupera le FAQ attive dal database.
   * @param workspaceId L'ID del workspace.
   * @returns Una stringa con le FAQ formattate.
   */
  async getActiveFaqs(workspaceId: string): Promise<string> {
    try {
      const faqs = await this.prisma.fAQ.findMany({
        where: {
          workspaceId: workspaceId,
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      })

      if (faqs.length === 0) {
        return "" // Nessuna FAQ attiva
      }

      // Formatta le FAQ come stringa per il prompt
      const formattedFaqs = faqs
        .map((faq) => `D: ${faq.question}\nR: ${faq.answer}`)
        .join("\n\n")

      return `\n\n${formattedFaqs}`
    } catch (error) {
      logger.error("Error fetching active FAQs:", error)
      return "" // In caso di errore, restituisce una stringa vuota
    }
  }

  /**
   * Recupera i servizi attivi dal database e li formatta per il prompt.
   * @param workspaceId L'ID del workspace.
   * @returns Una stringa con i servizi formattati.
   */
  async getActiveServices(workspaceId: string): Promise<string> {
    try {
      const services = await this.prisma.services.findMany({
        where: {
          workspaceId: workspaceId,
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      })

      if (services.length === 0) {
        return "" // Nessun servizio attivo
      }

      // Formatta i servizi come stringa per il prompt
      const formattedServices = services
        .map(
          (service) =>
            `🔧 ${service.name}: ${service.description || "Servizio disponibile"}`
        )
        .join("\n")

      return `\n\n${formattedServices}`
    } catch (error) {
      logger.error("Error fetching active services:", error)
      return "" // In caso di errore, restituisce una stringa vuota
    }
  }

  /**
   * Recupera i prodotti attivi dal database e li formatta per il prompt.
   * @param workspaceId L'ID del workspace.
   * @param customerDiscount Sconto del customer (opzionale)
   * @returns Una stringa con i prodotti formattati.
   */
  async getActiveProducts(
    workspaceId: string,
    customerDiscount: number = 0
  ): Promise<string> {
    try {
      const products = await this.prisma.products.findMany({
        where: {
          workspaceId: workspaceId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          ProductCode: true,
          price: true,
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          category: {
            name: "asc",
          },
        },
      })

      if (products.length === 0) {
        return ""
      }

      // Calcola i prezzi con sconti
      const { PriceCalculationService } = await import(
        "../application/services/price-calculation.service"
      )
      const priceService = new PriceCalculationService(this.prisma)
      const productIds = products.map((p) => p.id)
      const priceResult = await priceService.calculatePricesWithDiscounts(
        workspaceId,
        productIds,
        customerDiscount
      )
      const priceMap = new Map(priceResult.products.map((p) => [p.id, p]))

      // 🔧 DEBUG: Controlla risultati pricing
      console.log("🔧 DEBUG getActiveProducts:")
      console.log("  - customerDiscount:", customerDiscount)
      console.log("  - productIds count:", productIds.length)
      console.log(
        "  - priceResult.products count:",
        priceResult.products.length
      )
      console.log("  - Sample price data:", priceResult.products.slice(0, 2))

      // Raggruppa i prodotti per categoria con prezzi scontati
      const productsByCategory = products.reduce(
        (acc, product) => {
          const categoryName = product.category?.name || "Senza Categoria"
          const priceData = priceMap.get(product.id)
          if (!acc[categoryName]) {
            acc[categoryName] = []
          }
          acc[categoryName].push({
            ...product,
            originalPrice: priceData?.originalPrice || product.price,
            finalPrice: priceData?.finalPrice || product.price,
            hasDiscount: (priceData?.appliedDiscount || 0) > 0,
          })
          return acc
        },
        {} as Record<string, any[]>
      )

      // Formatta l'output con prezzi scontati - versione compatta per evitare troncamento
      let formattedProducts = ""

      for (const categoryName in productsByCategory) {
        const productList = productsByCategory[categoryName]
        formattedProducts += `\n**${categoryName.toUpperCase()}** (${productList.length} prodotti)\n`

        // Mostra tutti i prodotti della categoria
        const productsToShow = productList
        
        // Formato: ogni prodotto su una riga separata
        productsToShow.forEach((p) => {
          const originalPrice = Number(p.originalPrice).toFixed(2)
          const finalPrice = Number(p.finalPrice).toFixed(2)

          if (p.hasDiscount) {
            formattedProducts += `• ${p.name} ~~€${originalPrice}~~ → €${finalPrice}\n`
          } else {
            formattedProducts += `• ${p.name} €${finalPrice}\n`
          }
        })
        formattedProducts += "\n"
      }

      return formattedProducts
    } catch (error) {
      logger.error("Error fetching active products:", error)
      return ""
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
          ...(workspaceId ? { workspaceId } : {}),
        },
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
          activeChatbot: session.customer?.activeChatbot ?? true, // Add activeChatbot for chat list icon
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
            workspaceId,
          },
          select: { id: true },
        })

        if (!session) {
          logger.warn(
            `markMessagesAsRead: Chat session ${chatSessionId} not found in workspace ${workspaceId}`
          )
          return false
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
      // Get all chat sessions, including those with blacklisted customers
      // We want to show all chats but mark blacklisted ones visually
      // @ts-ignore - Prisma types issue
      const chatSessions = await this.prisma.chatSession.findMany({
        where: {
          ...(workspaceId ? { workspaceId } : {}),
          // Removed isBlacklisted filter - we want to show all chats
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              company: true, // Include company name for chat list display
              activeChatbot: true, // Include activeChatbot for chat list icon
              isBlacklisted: true, // Include to show blacklist status in UI
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

      // Return all sessions - we'll show blacklisted status in UI instead of hiding
      // Map sessions to include unread count and activeChatbot
      return chatSessions.map((session) => ({
        ...session,
        unreadCount: session.messages.length,
        activeChatbot: session.customer?.activeChatbot ?? true,
        messages: undefined, // Remove messages array
      }))
    } catch (error) {
      logger.error("Error getting chat sessions with unread counts:", error)
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
          ...(workspaceId ? { workspaceId } : {}),
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
      logger.info("Events functionality has been removed from the system")
      return []
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
          id: customerId,
        },
        data: {
          language,
        },
      })

      logger.info(`Updated language for customer ${customerId} to ${language}`)
      return updatedCustomer
    } catch (error) {
      logger.error(`Error updating customer language:`, error)
      throw new Error("Failed to update customer language")
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
    language = "ENG", // Add default language
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
          isActive: true,
          activeChatbot: true,
          currency: "EUR",
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
      // Usa il prompt principale dell'agente per il function router
      const agentPrompt = await this.prisma.prompts.findFirst({
        where: {
          name: {
            contains: "SofIA",
            mode: "insensitive",
          },
          isActive: true,
        },
      })

      if (!agentPrompt) {
        logger.warn("Agent prompt not found, using default")
        return "You are a function router for a WhatsApp chatbot. Your task is to analyze the user's message and determine which function to call."
      }

      return agentPrompt.content
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
    console.log("🚨 DEBUG - callFunctionRouter CALLED with message:", message)
    try {
      // Check if OpenRouter is properly configured
      console.log("🔍 DEBUG - OPENROUTER_API_KEY check:", {
        present: !!process.env.OPENROUTER_API_KEY,
        length: process.env.OPENROUTER_API_KEY?.length || 0,
        prefix: process.env.OPENROUTER_API_KEY?.substring(0, 15) || "MISSING",
      })

      if (!process.env.OPENROUTER_API_KEY) {
        logger.warn(
          "OpenRouter API key not configured properly for function router"
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

      // ANDREA DECISION: CF ATTIVE CON NOMI CORRETTI
      const availableFunctions = [
        {
          name: "ContactOperator",
          description:
            "Contact a human operator when the user explicitly requests to speak with a human representative, operator, or customer service agent",
          parameters: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description:
                  "The user's original message requesting operator contact",
              },
            },
            required: ["message"],
          },
        },
        {
          name: "GetLinkOrderByCode",
          description:
            "Get a secure link to view a specific order (or the last order if omitted). Triggers when user asks for a specific order or invoice.",
          parameters: {
            type: "object",
            properties: {
              orderCode: {
                type: "string",
                description:
                  "Order number or code to retrieve (optional, falls back to last order)",
              },
              documentType: {
                type: "string",
                description:
                  "Type of document requested: invoice, ddt, order (optional)",
              },
              message: {
                type: "string",
                description: "User's original request",
              },
            },
            required: ["message"],
          },
        },
        {
          name: "getShipmentTrackingLink",
          description:
            "Get shipment tracking link when user asks about order status, delivery, where is my order, when will it arrive, tracking information, last order",
          parameters: {
            type: "object",
            properties: {
              orderCode: {
                type: "string",
                description: "Order number or code to track",
              },
              message: {
                type: "string",
                description: "User's original tracking request",
              },
            },
            required: ["message"],
          },
        },
      ]

      logger.info(
        `Calling function router for message: "${message.substring(0, 30)}${
          message.length > 30 ? "..." : ""
        }"`
      )

      // Chiamata all'API OpenRouter con le funzioni definite
      const axios = require("axios")
      const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
      const openRouterApiKey = process.env.OPENROUTER_API_KEY

      // DEBUG: Log prompt e funzioni
      console.log(
        "🔍 DEBUG - Function Router Prompt:",
        functionRouterPrompt.substring(0, 200) + "..."
      )
      console.log(
        "🔍 DEBUG - Available Functions:",
        availableFunctions.map((f) => f.name)
      )
      console.log("🔍 DEBUG - User Message:", message)
      console.log("🔍 DEBUG - OpenRouter API Key present:", !!openRouterApiKey)

      const requestPayload = {
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: functionRouterPrompt },
          { role: "user", content: message },
        ],
        tools: availableFunctions.map((func) => ({
          type: "function",
          function: func,
        })),
        tool_choice: "auto",
      }

      console.log(
        "🔍 DEBUG - Request payload:",
        JSON.stringify(requestPayload, null, 2)
      )

      let response
      try {
        response = await axios.post(openRouterUrl, requestPayload, {
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
            "X-Title": "ShopME Function Router",
          },
        })
        console.log("🔍 DEBUG - Axios call successful")
      } catch (axiosError) {
        console.error("🔍 DEBUG - Axios error:", axiosError.message)
        if (axiosError.response) {
          console.error(
            "🔍 DEBUG - Axios response error:",
            axiosError.response.data
          )
        }
        throw axiosError
      }

      // DEBUG: Log risposta OpenRouter
      console.log(
        "🔍 DEBUG - OpenRouter Response:",
        JSON.stringify(response.data.choices[0]?.message, null, 2)
      )

      // Estrai la chiamata di tool dal risultato
      const toolCalls = response.data.choices[0]?.message?.tool_calls
      const toolCall = toolCalls?.[0]

      if (!toolCall || !toolCall.function) {
        logger.warn("No tool call returned by OpenRouter")
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
        if (toolCall.function.arguments) {
          functionArgs = JSON.parse(toolCall.function.arguments)
        }
      } catch (error) {
        logger.error("Error parsing function arguments:", error)
      }

      logger.info(`Function router selected: ${toolCall.function.name}`)

      return {
        function_call: {
          name: toolCall.function.name,
          arguments: functionArgs,
        },
        // Normalize for debug clients and downstream services
        name: toolCall.function.name,
        arguments: functionArgs,
        functionCalls: [
          {
            name: toolCall.function.name,
            arguments: functionArgs,
            source: "function-router",
          },
        ],
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
  async deleteChat(
    chatSessionId: string,
    workspaceId?: string
  ): Promise<boolean> {
    try {
      // First verify that the chat session belongs to the workspace if needed
      if (workspaceId) {
        const session = await this.prisma.chatSession.findFirst({
          where: {
            id: chatSessionId,
            workspaceId,
          },
          select: { id: true },
        })

        if (!session) {
          logger.warn(
            `deleteChat: Chat session ${chatSessionId} not found in workspace ${workspaceId}`
          )
          return false
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
  async getLatesttMessages(
    phoneNumber: string,
    limit = 30,
    workspaceId?: string
  ) {
    try {
      // Find customer by phone - use workspaceId if provided, otherwise use empty string
      const customer = await this.findCustomerByPhone(phoneNumber)

      if (!customer) return []

      // Find active chat session
      const session = await this.prisma.chatSession.findFirst({
        where: {
          customerId: customer.id,
          status: "active",
          ...(workspaceId ? { workspaceId } : {}),
        },
      })

      if (!session) {
        return []
      }

      // Find messages for this session
      const messages = await this.prisma.message.findMany({
        where: {
          chatSessionId: session.id,
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
          workspaceId,
        },
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
        department: agent.department || null,
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
  async countRecentMessages(
    phoneNumber: string,
    workspaceId: string,
    since: Date
  ): Promise<number> {
    try {
      const count = await this.prisma.message.count({
        where: {
          chatSession: {
            workspaceId: workspaceId,
            customer: {
              phone: phoneNumber,
            },
          },
          direction: MessageDirection.INBOUND,
          createdAt: {
            gte: since,
          },
        },
      })

      return count
    } catch (error) {
      logger.error("Error counting recent messages:", error)
      return 0 // Return 0 on error to avoid false positives
    }
  }

  /**
   * Update customer blacklist status
   * @param customerId Customer ID
   * @param workspaceId Workspace ID
   * @param isBlacklisted Blacklist status
   */
  async updateCustomerBlacklist(
    customerId: string,
    workspaceId: string,
    isBlacklisted: boolean
  ): Promise<void> {
    try {
      await this.prisma.customers.update({
        where: {
          id: customerId,
          workspaceId,
        },
        data: {
          isBlacklisted,
        },
      })

      logger.info(
        `Customer ${customerId} blacklist status updated to: ${isBlacklisted}`
      )
    } catch (error) {
      logger.error("Error updating customer blacklist status:", error)
      throw error
    }
  }

  /**
   * Add phone number to workspace blocklist
   * @param phoneNumber Phone number to add
   * @param workspaceId Workspace ID
   */
  async addToWorkspaceBlocklist(
    phoneNumber: string,
    workspaceId: string
  ): Promise<void> {
    try {
      // Get current workspace
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { blocklist: true },
      })

      if (!workspace) {
        throw new Error(`Workspace ${workspaceId} not found`)
      }

      // Parse current blocklist
      const currentBlocklist = workspace.blocklist || ""
      const blockedNumbers = currentBlocklist
        .split(/[\n,]/)
        .map((num) => num.trim())
        .filter((num) => num.length > 0)

      // Add phone number if not already present
      if (!blockedNumbers.includes(phoneNumber)) {
        blockedNumbers.push(phoneNumber)

        // Update workspace blocklist
        const newBlocklist = blockedNumbers.join("\n")
        await this.prisma.workspace.update({
          where: { id: workspaceId },
          data: { blocklist: newBlocklist },
        })

        logger.info(
          `Phone ${phoneNumber} added to workspace ${workspaceId} blocklist`
        )
      } else {
        logger.info(
          `Phone ${phoneNumber} already in workspace ${workspaceId} blocklist`
        )
      }
    } catch (error) {
      logger.error("Error adding to workspace blocklist:", error)
      throw error
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
  async hasRecentActivity(
    customerId: string,
    hours: number = 2,
    workspaceId?: string
  ): Promise<boolean> {
    try {
      const hoursAgo = new Date()
      hoursAgo.setHours(hoursAgo.getHours() - hours)

      const recentMessage = await this.prisma.message.findFirst({
        where: {
          chatSession: {
            customerId: customerId,
            ...(workspaceId && { workspaceId: workspaceId }),
          },
          direction: MessageDirection.INBOUND, // Only check incoming messages from customer
          createdAt: {
            gte: hoursAgo,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      const hasActivity = !!recentMessage

      logger.info(
        `[TASK4] hasRecentActivity for customer ${customerId}: ${hasActivity} (within ${hours} hours)`
      )

      return hasActivity
    } catch (error) {
      logger.error(
        `[TASK4] Error checking recent activity for customer ${customerId}:`,
        error
      )
      return false // Return false on error to trigger welcome back message (safer)
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
        select: { wipMessages: true },
      })

      if (!workspace?.wipMessages) {
        logger.warn(`No WIP messages found for workspace ${workspaceId}`)
        return "Service temporarily unavailable. We will be back soon!"
      }

      const wipMessages = workspace.wipMessages as Record<string, string>
      return (
        wipMessages[language] ||
        wipMessages["en"] ||
        "Service temporarily unavailable. We will be back soon!"
      )
    } catch (error) {
      logger.error(
        `Error getting WIP message for workspace ${workspaceId}:`,
        error
      )
      return "Service temporarily unavailable. We will be back soon!"
    }
  }

  /**
   * Get welcome message from database - NO HARDCODE
   * @param workspaceId Workspace ID
   * @param language Customer language
   * @returns Welcome message from database
   */
  async getWelcomeMessage(
    workspaceId: string,
    language: string
  ): Promise<string> {
    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { welcomeMessages: true },
      })

      if (!workspace?.welcomeMessages) {
        logger.warn(`No welcome messages found for workspace ${workspaceId}`)
        return "Welcome! Please register to continue:"
      }

      const welcomeMessages = workspace.welcomeMessages as Record<
        string,
        string
      >
      return (
        welcomeMessages[language] ||
        welcomeMessages["en"] ||
        "Welcome! Please register to continue:"
      )
    } catch (error) {
      logger.error(
        `Error getting welcome message for workspace ${workspaceId}:`,
        error
      )
      return "Welcome! Please register to continue:"
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
  async getWelcomeBackMessage(
    workspaceId: string,
    customerName: string,
    language: string
  ): Promise<string> {
    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { afterRegistrationMessages: true },
      })

      if (!workspace?.afterRegistrationMessages) {
        logger.warn(
          `No after registration messages found for workspace ${workspaceId}`
        )
        return `Welcome back, ${customerName}! How can I help you today?`
      }

      const afterRegMessages = workspace.afterRegistrationMessages as Record<
        string,
        string
      >
      const template =
        afterRegMessages[language] ||
        afterRegMessages["en"] ||
        `Welcome back, {name}! How can I help you today?`

      return template
        .replace("{name}", customerName)
        .replace("{customerName}", customerName)
        .replace("[nome]", customerName)
    } catch (error) {
      logger.error(
        `Error getting welcome back message for workspace ${workspaceId}:`,
        error
      )
      return `Welcome back, ${customerName}! How can I help you today?`
    }
  }

  /**
   * Get error message from database - NO HARDCODE
   * Uses wipMessages as fallback for error messages
   * @param workspaceId Workspace ID
   * @param language Customer language
   * @returns Error message from database
   */
  async getErrorMessage(
    workspaceId: string,
    language: string
  ): Promise<string> {
    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { wipMessages: true },
      })

      if (!workspace?.wipMessages) {
        logger.warn(`No error messages found for workspace ${workspaceId}`)
        return "Sorry, I'm having technical difficulties. Please try again later."
      }

      // Use WIP messages as error messages fallback
      const wipMessages = workspace.wipMessages as Record<string, string>
      return (
        wipMessages[language] ||
        wipMessages["en"] ||
        "Sorry, I'm having technical difficulties. Please try again later."
      )
    } catch (error) {
      logger.error(
        `Error getting error message for workspace ${workspaceId}:`,
        error
      )
      return "Sorry, I'm having technical difficulties. Please try again later."
    }
  }

  /**
   * Get agent configuration from database - NO HARDCODE
   * @param workspaceId Workspace ID
   * @returns Agent configuration from database
   */
  async getAgentConfig(workspaceId: string): Promise<{
    prompt: string
    model: string
    temperature: number
    maxTokens: number
  } | null> {
    try {
      const agentConfig = await this.prisma.agentConfig.findFirst({
        where: {
          workspaceId: workspaceId,
          isActive: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      if (!agentConfig) {
        return null
      }

      return {
        prompt: agentConfig.prompt || "",
        model: agentConfig.model || "openai/gpt-4o-mini",
        temperature: agentConfig.temperature || 0.0, // Default to 0 temperature
        maxTokens: agentConfig.maxTokens || 5000,
      }
    } catch (error) {
      logger.error(
        `Error getting agent config for workspace ${workspaceId}:`,
        error
      )
      return null
    }
  }

  /**
   * Get workspace URL for registration links
   */
  async getWorkspaceUrl(workspaceId: string): Promise<string> {
    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { url: true },
      })

      if (!workspace?.url) {
        logger.warn(`No URL found for workspace ${workspaceId}, using default`)
        return "http://localhost:3000"
      }

      return workspace.url
    } catch (error) {
      logger.error("Error getting workspace URL:", error)
      return "http://localhost:3000"
    }
  }

  /**
   * Get prompt by name from database
   */
  async getPromptByName(
    workspaceId: string,
    promptName: string
  ): Promise<{
    id: string
    name: string
    content: string
    model: string
    temperature: number
    maxTokens: number
  } | null> {
    try {
      const prompt = await this.prisma.prompts.findFirst({
        where: {
          workspaceId,
          name: promptName,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          content: true,
          model: true,
          temperature: true,
          max_tokens: true,
        },
      })

      if (!prompt) {
        logger.warn(
          `Prompt "${promptName}" not found for workspace ${workspaceId}`
        )
        return null
      }

      return {
        id: prompt.id,
        name: prompt.name,
        content: prompt.content,
        model: prompt.model || "openai/gpt-4o-mini",
        temperature: prompt.temperature || 0.0, // Default to 0 temperature
        maxTokens: prompt.max_tokens || 5000,
      }
    } catch (error) {
      logger.error(`Error getting prompt "${promptName}":`, error)
      return null
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
      const { embeddingService } = await import("../services/embeddingService")

      // STEP 1: SEMANTIC SEARCH ACROSS ALL CHUNKS
      logger.info(`[RAG] Searching all content types for: "${message}"`)

      // Search all content types in parallel using semantic search
      // Use embedding service default search limit to allow higher recall
      const { EmbeddingService } = await import("../services/embeddingService")
      const defaultLimit = EmbeddingService.DEFAULT_SEARCH_LIMIT

      const [productResults, faqResults, serviceResults, documentResults] =
        await Promise.all([
          embeddingService.searchProducts(message, workspaceId, defaultLimit),
          embeddingService.searchFAQs(message, workspaceId, defaultLimit),
          embeddingService.searchServices(message, workspaceId, defaultLimit),
          Promise.resolve([]), // Documents search not implemented yet
        ])

      logger.info(
        `[RAG] Found: ${productResults.length} products, ${faqResults.length} FAQs, ${serviceResults.length} services, ${documentResults.length} documents`
      )

      // STEP 2: GET FULL PRODUCT DETAILS WITH STOCK VERIFICATION
      const productIds = productResults.map((r) => r.id)
      const fullProducts =
        productIds.length > 0
          ? await this.prisma.products.findMany({
              where: {
                id: { in: productIds },
                workspaceId: workspaceId,
                isActive: true,
                stock: { gt: 0 }, // VERIFY AVAILABILITY
              },
              include: {
                category: true,
              },
            })
          : []

      // STEP 3: GET FULL FAQ DETAILS
      const faqIds = faqResults.map((r) => r.id)
      const fullFAQs =
        faqIds.length > 0
          ? await this.prisma.fAQ.findMany({
              where: {
                id: { in: faqIds },
                workspaceId: workspaceId,
                isActive: true,
              },
            })
          : []

      // STEP 4: GET FULL SERVICE DETAILS
      const serviceIds = serviceResults.map((r) => r.id)
      const fullServices =
        serviceIds.length > 0
          ? await this.prisma.services.findMany({
              where: {
                id: { in: serviceIds },
                workspaceId: workspaceId,
                isActive: true,
              },
            })
          : []

      // STEP 5: GET CHAT HISTORY
      const chatHistory = await this.getLatesttMessages(
        customer.phone,
        5,
        workspaceId
      )

      // STEP 6: BUILD UNIFIED CONTEXT FOR LLM FORMATTER
      const unifiedContext = {
        customer: {
          name: customer.name,
          language: customer.language,
          discount: customer.discount,
        },
        welcomeBack: welcomeBackContext || null,
        searchResults: {
          products: productResults
            .map((r) => ({
              similarity: r.similarity,
              content: r.content,
              product: fullProducts.find((p) => p.id === r.id),
            }))
            .filter((r) => r.product), // Only include available products
          faqs: faqResults
            .map((r) => ({
              similarity: r.similarity,
              content: r.content,
              faq: fullFAQs.find((f) => f.id === r.id),
            }))
            .filter((r) => r.faq),
          services: serviceResults
            .map((r) => ({
              similarity: r.similarity,
              content: r.content,
              service: fullServices.find((s) => s.id === r.id),
            }))
            .filter((r) => r.service),
          documents: documentResults,
        },
        chatHistory: chatHistory.slice(0, 5),
      }

      // STEP 7: BUILD COMPREHENSIVE PROMPT FOR LLM FORMATTER
      const finalPrompt = `${prompt}

CUSTOMER CONTEXT:
- Name: ${unifiedContext.customer.name}
- Language: ${unifiedContext.customer.language}
- Discount: ${unifiedContext.customer.discount}%

${unifiedContext.welcomeBack ? `WELCOME BACK MESSAGE: ${unifiedContext.welcomeBack}` : ""}

SEMANTIC SEARCH RESULTS:

PRODUCTS FOUND (with availability):
${unifiedContext.searchResults.products
  .map(
    (r) =>
      `- ${r.product?.name} (Similarity: ${r.similarity.toFixed(3)})
    Price: €${r.product?.price}
    Stock: ${r.product?.stock} units available
    Category: ${r.product?.category?.name || "General"}
    Match: ${r.content}`
  )
  .join("\n\n")}

FAQS FOUND:
${unifiedContext.searchResults.faqs
  .map(
    (r) =>
      `- ${r.faq?.question} (Similarity: ${r.similarity.toFixed(3)})
    Answer: ${r.faq?.answer}
    Match: ${r.content}`
  )
  .join("\n\n")}

SERVICES FOUND:
${unifiedContext.searchResults.services
  .map(
    (r) =>
      `- ${r.service?.name} (Similarity: ${r.similarity.toFixed(3)})
    Description: ${r.service?.description}
    Price: €${r.service?.price}
    Duration: ${r.service?.duration || "N/A"}
    Match: ${r.content}`
  )
  .join("\n\n")}

DOCUMENTS FOUND:
${unifiedContext.searchResults.documents
  .map(
    (r) =>
      `- Document: ${r.sourceName} (Similarity: ${r.similarity.toFixed(3)})
    Content: ${r.content}`
  )
  .join("\n\n")}

RECENT CHAT HISTORY:
${unifiedContext.chatHistory.map((h) => `${h.direction === MessageDirection.INBOUND ? "Customer" : "Bot"}: ${h.content}`).join("\n")}

CUSTOMER MESSAGE: ${message}

INSTRUCTIONS FOR LLM FORMATTER:
- Combine ALL relevant information into a single, coherent response
- Include welcome back message if provided
- Show product availability and prices
- Include FAQ answers if relevant
- Mention services if applicable
- Reference document information if found
- Respond in ${unifiedContext.customer.language}
- Be helpful and comprehensive but concise`

      logger.info(`[RAG] Sending unified context to LLM formatter (${model})`)

      // STEP 8: CALL LLM FORMATTER WITH UNIFIED CONTEXT
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "user",
                content: finalPrompt,
              },
            ],
            temperature: temperature,
            max_tokens: maxTokens,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const data = await response.json()
      const formattedResponse = data.choices?.[0]?.message?.content || null

      logger.info(`[RAG] LLM formatter response generated successfully`)

      // 💰 USAGE TRACKING: Now handled in saveMessage (Andrea's Logic)
      // No need to track here - tracking happens when external systems save final conversation

      return formattedResponse
    } catch (error) {
      logger.error("Error in getResponseFromRag:", error)
      return null
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
  public async findServices(
    workspaceId: string,
    options?: {
      category?: string
      limit?: number
      isActive?: boolean
    }
  ) {
    try {
      const whereClause: any = {
        workspaceId,
        isActive: options?.isActive ?? true,
      }

      if (options?.category) {
        whereClause.category = options.category
      }

      return await this.prisma.services.findMany({
        where: whereClause,
        take: options?.limit || 10,
        orderBy: { name: "asc" },
      })
    } catch (error) {
      logger.error("Error finding services:", error)
      return []
    }
  }

  /**
   * Find FAQs with filtering (public method for LangChain)
   */
  public async findFAQs(
    workspaceId: string,
    options?: {
      topic?: string
      limit?: number
      isActive?: boolean
    }
  ) {
    try {
      const whereClause: any = {
        workspaceId,
        isActive: options?.isActive ?? true,
      }

      if (options?.topic) {
        whereClause.OR = [
          { question: { contains: options.topic, mode: "insensitive" } },
          { answer: { contains: options.topic, mode: "insensitive" } },
        ]
      }

      return await this.prisma.fAQ.findMany({
        where: whereClause,
        take: options?.limit || 5,
        orderBy: { createdAt: "desc" },
      })
    } catch (error) {
      logger.error("Error finding FAQs:", error)
      return []
    }
  }

  /**
   * Find offers with filtering (public method for LangChain)
   */
  public async findOffers(
    workspaceId: string,
    options?: {
      category?: string
      limit?: number
      isActive?: boolean
    }
  ) {
    try {
      const now = new Date()
      const whereClause: any = {
        workspaceId,
        isActive: options?.isActive ?? true,
        startDate: { lte: now },
        endDate: { gte: now },
      }

      if (options?.category) {
        whereClause.category = { name: options.category }
      }

      return await this.prisma.offers.findMany({
        where: whereClause,
        include: { category: true },
        take: options?.limit || 10,
        orderBy: { discountPercent: "desc" },
      })
    } catch (error) {
      logger.error("Error finding offers:", error)
      return []
    }
  }

  /**
   * Create order (public method for LangChain)
   */
  public async createOrder(data: {
    customerId: string
    workspaceId: string
    status?: OrderStatus
    totalAmount?: number
  }) {
    try {
      // Generate unique order code - 5 uppercase letters
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      let orderCode = ""
      for (let i = 0; i < 5; i++) {
        orderCode += letters.charAt(Math.floor(Math.random() * letters.length))
      }

      return await this.prisma.orders.create({
        data: {
          orderCode: orderCode,
          customerId: data.customerId,
          workspaceId: data.workspaceId,
          status: data.status || OrderStatus.PENDING,
          totalAmount: data.totalAmount || 0,
        },
      })
    } catch (error) {
      logger.error("Error creating order:", error)
      throw new Error("Failed to create order")
    }
  }

  /**
   * Recupera le categorie attive dal database e le formatta per il prompt.
   * @param workspaceId L'ID del workspace.
   * @returns Una stringa con le categorie formattate.
   */
  async getActiveCategories(workspaceId: string): Promise<string> {
    try {
      console.log("🔧 DEBUG getActiveCategories: workspaceId:", workspaceId)
      const categories = await this.prisma.categories.findMany({
        where: {
          workspaceId: workspaceId,
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      })

      console.log(
        "🔧 DEBUG getActiveCategories: trovate",
        categories.length,
        "categorie"
      )
      console.log(
        "🔧 DEBUG getActiveCategories: categorie raw:",
        categories.map((c) => `${c.name}: ${c.description}`)
      )

      if (categories.length === 0) {
        return "" // Nessuna categoria attiva
      }

      // Formatta le categorie come lista verticale per il prompt
      // Estrae solo l'emoji e una descrizione breve dalla description
      const formattedCategories = categories
        .map((category) => {
          // Estrae l'emoji e la prima parte della descrizione
          const description = category.description || ""
          const emoji = description.match(/^[^\w\s]+/)?.[0] || "📦" // Prende l'emoji all'inizio o usa default

          // Estrae la parte descrittiva dopo l'emoji (primi 50 caratteri)
          const shortDesc = description
            .replace(/^[^\w\s]+\s*/, "") // Rimuove emoji iniziale
            .split(",")[0] // Prende solo la prima parte prima della virgola
            .substring(0, 50)
            .trim()

          // Formatta come elemento di lista con descrizione
          return `${emoji} **${category.name}** - ${shortDesc}`
        })
        .join("\n")

      console.log("🔧 DEBUG getActiveCategories: risultato finale:")
      console.log(formattedCategories)

      const result = `\n${formattedCategories}\n`
      console.log(
        "🔧 DEBUG getActiveCategories: return string length:",
        result.length
      )
      return result
    } catch (error) {
      logger.error("Error fetching active categories:", error)
      return "" // In caso di errore, restituisce una stringa vuota
    }
  }
}
