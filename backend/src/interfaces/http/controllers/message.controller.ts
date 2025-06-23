import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import { MessageService } from "../../../application/services/message.service"
import { detectLanguage } from "../../../utils/language-detector"
import logger from "../../../utils/logger"

const prisma = new PrismaClient()

export class MessageController {
  private messageService: MessageService

  constructor() {
    this.messageService = new MessageService()
  }

  /**
   * Process a message and return a response (N8N will handle the business logic)
   * @route POST /api/messages
   */
  async processMessage(req: Request, res: Response): Promise<void> {
    try {
      logger.info(
        `[MESSAGES API] 🚀 NEW IMPLEMENTATION - Processing message with registration check`
      )
      const {
        message,
        phoneNumber,
        workspaceId,
        sessionId,
        isNewConversation,
      } = req.body

      // 🚨 DEBUG: Log del payload ricevuto
      console.log("🚨 DEBUG: PAYLOAD RICEVUTO DAL FRONTEND:")
      console.log("🚨 Message:", message)
      console.log("🚨 PhoneNumber:", phoneNumber)
      console.log("🚨 WorkspaceId:", workspaceId)
      console.log("🚨 Full Body:", JSON.stringify(req.body, null, 2))

      // Validate required fields
      if (!message || typeof message !== "string") {
        logger.warn("Invalid request: Message is required and must be a string")
        res.status(400).json({
          success: false,
          error: "Message is required and must be a string",
        })
        return
      }

      if (!phoneNumber || typeof phoneNumber !== "string") {
        logger.warn(
          "Invalid request: Phone number is required and must be a string"
        )
        res.status(400).json({
          success: false,
          error: "Phone number is required and must be a string",
        })
        return
      }

      if (!workspaceId || typeof workspaceId !== "string") {
        logger.warn(
          "Invalid request: Workspace ID is required and must be a string"
        )
        res.status(400).json({
          success: false,
          error: "Workspace ID is required and must be a string",
        })
        return
      }

      // Log the request details
      logger.info(`[MESSAGES API] Processing message: ${message}`)
      logger.info(`[MESSAGES API] From phone number: ${phoneNumber}`)
      logger.info(`[MESSAGES API] For workspace: ${workspaceId}`)

      // Detect language of the incoming message
      const detectedLanguage = detectLanguage(message)
      logger.info(
        `[MESSAGES API] Detected language for message: ${detectedLanguage}`
      )

      // 🔐 NEW: CHECK USER REGISTRATION STATUS FIRST
      logger.info(`[MESSAGES API] 🔍 Checking user registration status...`)
      const isUserRegistered = await this.checkUserRegistration(
        phoneNumber,
        workspaceId
      )
      logger.info(`[MESSAGES API] 🔍 User registered: ${isUserRegistered}`)

      if (!isUserRegistered) {
        logger.info(
          `[MESSAGES API] 🔍 User NOT registered, checking if greeting...`
        )
        const isGreeting = this.isGreetingMessage(message)
        logger.info(`[MESSAGES API] 🔍 Is greeting: ${isGreeting}`)

        if (isGreeting) {
          logger.info(
            `[MESSAGES API] 👋 Unregistered user sent greeting: "${message}"`
          )

          // Send welcome message with registration link
          const welcomeResponse = await this.sendWelcomeMessageWithRegistration(
            phoneNumber,
            workspaceId,
            message,
            detectedLanguage
          )

          res.status(200).json({
            success: true,
            data: {
              originalMessage: message,
              processedMessage: welcomeResponse.fullMessage,
              phoneNumber: phoneNumber,
              workspaceId: workspaceId,
              timestamp: new Date().toISOString(),
              metadata: {
                agentName: "WELCOME_SYSTEM",
                messageType: "welcome_registration",
                userRegistrationStatus: "unregistered",
                registrationUrl: welcomeResponse.registrationUrl,
                token: welcomeResponse.token,
              },
              detectedLanguage: detectedLanguage,
              sessionId: sessionId,
              customerId: `unregistered-${phoneNumber.replace("+", "")}`,
              customerLanguage: detectedLanguage,
            },
          })
          return
        } else {
          logger.info(
            `[MESSAGES API] ❌ Unregistered user sent non-greeting message - requiring registration`
          )
          res.status(200).json({
            success: false,
            data: {
              originalMessage: message,
              processedMessage:
                "Per utilizzare questo servizio devi prima registrarti. Scrivi 'ciao' per ricevere il link di registrazione.",
              phoneNumber: phoneNumber,
              workspaceId: workspaceId,
              timestamp: new Date().toISOString(),
              metadata: {
                agentName: "REGISTRATION_REQUIRED",
                messageType: "registration_required",
                userRegistrationStatus: "unregistered",
              },
              detectedLanguage: detectedLanguage,
              sessionId: sessionId,
              customerId: `unregistered-${phoneNumber.replace("+", "")}`,
              customerLanguage: detectedLanguage,
            },
          })
          return
        }
      }

      logger.info(
        `[MESSAGES API] ✅ User is registered - proceeding with normal N8N flow`
      )

      // Process the message with base MessageService (security only)
      // N8N will handle the business logic through webhooks
      const response = await this.messageService.processMessage(
        message,
        phoneNumber,
        workspaceId
      )

      // 🚨 NO HARDCODE: If N8N fails, return proper error response
      if (response === null) {
        logger.error(`[MESSAGES API] ❌ N8N workflow failed - system cannot process message`)
        res.status(500).json({
          success: false,
          error: "N8N workflow failed - message cannot be processed",
          details: "The N8N workflow is not responding correctly. Please check N8N status."
        })
        return
      }

      // Return the processed message with metadata
      res.status(200).json({
        success: true,
        data: {
          originalMessage: message,
          processedMessage: response,
          phoneNumber: phoneNumber,
          workspaceId: workspaceId,
          timestamp: new Date().toISOString(),
          metadata: { agentName: "N8N Workflow" },
          detectedLanguage: detectedLanguage,
          sessionId: sessionId,
          customerId: `customer-${phoneNumber.replace("+", "")}`,
          customerLanguage: detectedLanguage,
        },
      })
    } catch (error) {
      logger.error("[MESSAGES API] Error processing message:", error)
      res.status(500).json({
        success: false,
        error: "Failed to process message",
      })
    }
  }

  /**
   * 🔍 CHECK USER REGISTRATION STATUS
   * Verifies if user exists in Customers table (phone number present = registered)
   */
  private async checkUserRegistration(
    phoneNumber: string,
    workspaceId: string
  ): Promise<boolean> {
    try {
      logger.info(
        `[REGISTRATION-CHECK] 🔍 Checking registration for phone: ${phoneNumber}, workspace: ${workspaceId}`
      )

      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId,
          isActive: true,
        },
      })

      const isRegistered = !!customer
      logger.info(
        `[REGISTRATION-CHECK] 📋 Query result: ${customer ? `Found customer ID: ${customer.id}` : "No customer found"}`
      )
      logger.info(
        `[REGISTRATION-CHECK] ✅ User ${phoneNumber} registration status: ${isRegistered ? "REGISTERED" : "NOT_REGISTERED"}`
      )

      return isRegistered
    } catch (error) {
      logger.error(
        `[REGISTRATION-CHECK] ❌ Error checking registration for ${phoneNumber}:`,
        error
      )
      return false // Default to not registered on error
    }
  }

  /**
   * 👋 CHECK IF MESSAGE IS A GREETING
   * Recognizes common greetings: "ciao", "hola", "hello" (case insensitive)
   */
  private isGreetingMessage(message: string): boolean {
    const normalizedMessage = message.toLowerCase().trim()
    const greetings = [
      "ciao",
      "hola",
      "hello",
      "hi",
      "buongiorno",
      "buona sera",
      "buondì",
    ]

    const isGreeting = greetings.some(
      (greeting) =>
        normalizedMessage === greeting ||
        normalizedMessage.startsWith(greeting + " ") ||
        normalizedMessage.startsWith(greeting + "!")
    )

    logger.info(
      `[GREETING-CHECK] Message "${message}" is greeting: ${isGreeting}`
    )
    return isGreeting
  }

  /**
   * 💌 SEND WELCOME MESSAGE WITH REGISTRATION LINK
   * Sends welcome message to unregistered users with registration link
   */
  private async sendWelcomeMessageWithRegistration(
    phoneNumber: string,
    workspaceId: string,
    originalMessage: string,
    detectedLanguage: string
  ): Promise<{ fullMessage: string; registrationUrl: string; token: string }> {
    try {
      logger.info(
        `[WELCOME-MESSAGE] 🚀 Starting welcome message process for ${phoneNumber}`
      )

      // Get workspace settings for welcome message and URL
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
          welcomeMessages: true,
          url: true,
          name: true,
        },
      })

      if (!workspace) {
        logger.error(`[WELCOME-MESSAGE] ❌ Workspace ${workspaceId} not found`)
        throw new Error(`Workspace ${workspaceId} not found`)
      }

      logger.info(`[WELCOME-MESSAGE] 📋 Workspace found: ${workspace.name}`)
      logger.info(
        `[WELCOME-MESSAGE] 📋 Welcome messages config:`,
        workspace.welcomeMessages
      )

      // 🔥 STEP 1: Create customer placeholder if not exists
      logger.info(`[WELCOME-MESSAGE] 👤 Creating customer placeholder...`)
      await this.createCustomerPlaceholder(
        phoneNumber,
        workspaceId,
        detectedLanguage
      )
      logger.info(`[WELCOME-MESSAGE] ✅ Customer placeholder created/verified`)

      // Get welcome message based on detected language
      let welcomeMessage = "Ciao! Benvenuto nel nostro servizio WhatsApp."

      if (
        workspace.welcomeMessages &&
        typeof workspace.welcomeMessages === "object"
      ) {
        const messages = workspace.welcomeMessages as any
        // Try detected language first, then Italian, then English, then first available
        welcomeMessage =
          messages[detectedLanguage] ||
          messages.it ||
          messages.en ||
          messages[Object.keys(messages)[0]] ||
          welcomeMessage
      }

      logger.info(
        `[WELCOME-MESSAGE] 📝 Welcome message selected: "${welcomeMessage}"`
      )

      // Generate registration token and link
      const token = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`
      const baseUrl =
        workspace.url || process.env.FRONTEND_URL || "https://app.example.com"
      const registrationUrl = `${baseUrl}/register?phone=${encodeURIComponent(phoneNumber)}&workspace=${workspaceId}&token=${token}&lang=${detectedLanguage}`

      // Create complete message with registration link
      const registrationText = this.getRegistrationText(detectedLanguage)
      const fullMessage = `${welcomeMessage}\n\n🔗 ${registrationText}:\n${registrationUrl}`

      logger.info(
        `[WELCOME-MESSAGE] 🔗 Registration URL generated: ${registrationUrl}`
      )
      logger.info(`[WELCOME-MESSAGE] 📨 Full message: "${fullMessage}"`)

      // Save registration token (use the correct table)
      logger.info(`[WELCOME-MESSAGE] 💾 Saving registration token...`)
      await prisma.registrationToken.create({
        data: {
          token,
          phoneNumber,
          workspaceId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          usedAt: null,
        },
      })
      logger.info(`[WELCOME-MESSAGE] ✅ Registration token saved: ${token}`)

      // Save welcome message to chat history
      logger.info(`[WELCOME-MESSAGE] 💾 Saving to chat history...`)
      await this.saveWelcomeMessageToHistory(
        phoneNumber,
        workspaceId,
        originalMessage,
        fullMessage
      )
      logger.info(`[WELCOME-MESSAGE] ✅ Chat history saved`)

      return { fullMessage, registrationUrl, token }
    } catch (error) {
      logger.error(
        `[WELCOME-MESSAGE] ❌ Error sending welcome message to ${phoneNumber}:`,
        error
      )
      throw error
    }
  }

  /**
   * 💾 SAVE WELCOME MESSAGE TO CHAT HISTORY
   * Saves both incoming greeting and outgoing welcome message to chat history
   */
  private async saveWelcomeMessageToHistory(
    phoneNumber: string,
    workspaceId: string,
    incomingMessage: string,
    welcomeMessage: string
  ): Promise<void> {
    try {
      // Create customer placeholder if doesn't exist (for chat history tracking)
      let customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId,
        },
      })

      if (!customer) {
        customer = await prisma.customers.create({
          data: {
            name: `Unregistered User ${phoneNumber}`,
            email: `${phoneNumber.replace(/[^0-9]/g, "")}@temp.unregistered`,
            phone: phoneNumber,
            workspaceId,
            isActive: false, // Mark as inactive until registration
            language: "Italian",
          },
        })
        logger.info(
          `[WELCOME-HISTORY] ✅ Created placeholder customer: ${customer.id}`
        )
      }

      // Find or create chat session
      let chatSession = await prisma.chatSession.findFirst({
        where: {
          customerId: customer.id,
          workspaceId,
        },
      })

      if (!chatSession) {
        chatSession = await prisma.chatSession.create({
          data: {
            customerId: customer.id,
            workspaceId,
            status: "pending_registration",
            context: {},
          },
        })
        logger.info(
          `[WELCOME-HISTORY] ✅ Created chat session: ${chatSession.id}`
        )
      }

      // Save incoming greeting message
      await prisma.message.create({
        data: {
          content: incomingMessage,
          direction: "INBOUND",
          chatSessionId: chatSession.id,
          metadata: {
            messageType: "greeting",
            userRegistrationStatus: "unregistered",
          },
        },
      })

      // Save outgoing welcome message
      await prisma.message.create({
        data: {
          content: welcomeMessage,
          direction: "OUTBOUND",
          chatSessionId: chatSession.id,
          metadata: {
            agentSelected: "WELCOME_SYSTEM",
            messageType: "welcome_registration",
            userRegistrationStatus: "unregistered",
          },
        },
      })

      logger.info(
        `[WELCOME-HISTORY] ✅ Messages saved to chat history for ${phoneNumber}`
      )
    } catch (error) {
      logger.error(
        `[WELCOME-HISTORY] ❌ Error saving welcome messages to history:`,
        error
      )
    }
  }

  /**
   * 👤 CREATE CUSTOMER PLACEHOLDER
   * Creates a placeholder customer for unregistered users
   */
  private async createCustomerPlaceholder(
    phoneNumber: string,
    workspaceId: string,
    language: string
  ): Promise<void> {
    try {
      logger.info(
        `[CUSTOMER-PLACEHOLDER] 👤 Creating placeholder for ${phoneNumber}`
      )

      // Check if customer already exists
      const existingCustomer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId,
        },
      })

      if (existingCustomer) {
        logger.info(
          `[CUSTOMER-PLACEHOLDER] ✅ Customer already exists: ${existingCustomer.id}`
        )
        return
      }

      // Create placeholder customer
      const customer = await prisma.customers.create({
        data: {
          phone: phoneNumber,
          workspaceId,
          name: `WhatsApp User ${phoneNumber.slice(-4)}`, // Placeholder name with last 4 digits
          email: "", // Empty email until registration
          language: language || "it",
          isActive: true,
          isBlacklisted: false,
          activeChatbot: true,
          discount: 0,
          currency: "EUR",
          address: "",
          company: "",
        },
      })

      logger.info(
        `[CUSTOMER-PLACEHOLDER] ✅ Created placeholder customer: ${customer.id}`
      )
    } catch (error) {
      logger.error(
        `[CUSTOMER-PLACEHOLDER] ❌ Error creating placeholder for ${phoneNumber}:`,
        error
      )
      throw error
    }
  }

  /**
   * 🔗 GET REGISTRATION TEXT
   * Returns the registration text in the appropriate language
   */
  private getRegistrationText(language: string): string {
    const registrationTexts = {
      it: "Per registrarti e accedere ai nostri servizi, clicca qui",
      es: "Para registrarte y acceder a nuestros servicios, haz clic aquí",
      en: "To register and access our services, click here",
      fr: "Pour vous inscrire et accéder à nos services, cliquez ici",
      de: "Um sich zu registrieren und auf unsere Dienste zuzugreifen, klicken Sie hier",
      pt: "Para se registrar e acessar nossos serviços, clique aqui",
    }

    return registrationTexts[language] || registrationTexts["it"]
  }
}
