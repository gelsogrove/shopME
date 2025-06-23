import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import { MessageService } from "../../../application/services/message.service"
import { SessionTokenService } from "../../../application/services/session-token.service"
import logger from "../../../utils/logger"
import { N8nPayloadBuilder } from "../../../utils/n8n-payload-builder"

const prisma = new PrismaClient()

/**
 * Controller for WhatsApp integration (Security Gateway Only)
 * Business logic is handled by N8N with Andrea's Session Token Architecture
 */
export class WhatsAppController {
  private messageService: MessageService
  private sessionTokenService: SessionTokenService

  constructor() {
    this.messageService = new MessageService()
    this.sessionTokenService = new SessionTokenService()
  }

  /**
   * 🔍 DETERMINE WORKSPACE ID FROM WHATSAPP PHONE NUMBER
   * Automatically finds the correct workspace based on the WhatsApp phone number
   * that received the message (business phone number)
   */
  private async determineWorkspaceFromWhatsApp(
    webhookData: any
  ): Promise<string> {
    try {
      // Extract the business phone number that received the message
      const businessPhoneNumber =
        webhookData.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id
      const displayPhoneNumber =
        webhookData.entry?.[0]?.changes?.[0]?.value?.metadata
          ?.display_phone_number

      logger.info(
        `[WORKSPACE-DETECTION] 🔍 Determining workspace for business phone: ${displayPhoneNumber} (ID: ${businessPhoneNumber})`
      )

      if (displayPhoneNumber) {
        // Look up workspace by WhatsApp phone number
        const workspace = await prisma.workspace.findFirst({
          where: {
            whatsappPhoneNumber: displayPhoneNumber,
            isActive: true,
            isDelete: false,
          },
          select: {
            id: true,
            name: true,
            whatsappPhoneNumber: true,
          },
        })

        if (workspace) {
          logger.info(
            `[WORKSPACE-DETECTION] ✅ Found workspace: ${workspace.name} (${workspace.id}) for phone ${displayPhoneNumber}`
          )
          return workspace.id
        }

        logger.warn(
          `[WORKSPACE-DETECTION] ⚠️ No workspace found for phone ${displayPhoneNumber}`
        )
      }

      // Fallback to environment variable or default
      const fallbackWorkspaceId =
        process.env.WHATSAPP_WORKSPACE_ID || "cm9hjgq9v00014qk8fsdy4ujv"
      logger.info(
        `[WORKSPACE-DETECTION] 🔄 Using fallback workspace: ${fallbackWorkspaceId}`
      )

      return fallbackWorkspaceId
    } catch (error) {
      logger.error(
        "[WORKSPACE-DETECTION] ❌ Error determining workspace:",
        error
      )

      // Fallback to environment variable or default
      const fallbackWorkspaceId =
        process.env.WHATSAPP_WORKSPACE_ID || "cm9hjgq9v00014qk8fsdy4ujv"
      logger.info(
        `[WORKSPACE-DETECTION] 🔄 Error fallback to workspace: ${fallbackWorkspaceId}`
      )

      return fallbackWorkspaceId
    }
  }

  /**
   * Handle webhook requests from Meta API
   * This endpoint is public and doesn't require authentication
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      // For GET requests (verification)
      if (req.method === "GET") {
        const mode = req.query["hub.mode"]
        const token = req.query["hub.verify_token"]
        const challenge = req.query["hub.challenge"]

        // Verify the webhook - in test environment, accept "test-verify-token"
        const verifyToken =
          process.env.WHATSAPP_VERIFY_TOKEN || "test-verify-token"
        if (mode === "subscribe" && token === verifyToken) {
          logger.info("WhatsApp webhook verified")
          res.status(200).send(challenge)
          return
        }

        res.status(403).send("Verification failed")
        return
      }

      // For POST requests (incoming messages)
      const data = req.body
      logger.info("WhatsApp webhook received", { data })

      // Extract required data for MessageService
      const phoneNumber =
        data.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from
      const messageContent =
        data.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body

      // 🚀 ANDREA'S ENHANCEMENT: Automatically determine workspace from WhatsApp phone number
      const workspaceId = await this.determineWorkspaceFromWhatsApp(data)

      if (phoneNumber && messageContent) {
        logger.info(
          `[WHATSAPP-DEBUG] 🔍 Processing message from ${phoneNumber}: "${messageContent}"`
        )
        logger.info(`[WHATSAPP-DEBUG] 🔍 Workspace ID: ${workspaceId}`)

        // STEP 1: 🔐 CHECK USER REGISTRATION STATUS
        logger.info(`[WHATSAPP-DEBUG] 🔍 Checking user registration status...`)
        const isUserRegistered = await this.checkUserRegistration(
          phoneNumber,
          workspaceId
        )
        logger.info(`[WHATSAPP-DEBUG] 🔍 User registered: ${isUserRegistered}`)

        if (!isUserRegistered) {
          logger.info(
            `[WHATSAPP-DEBUG] 🔍 User NOT registered, checking if greeting...`
          )
          // STEP 1A: Check if message is a greeting
          const isGreeting = this.isGreetingMessage(messageContent)
          logger.info(`[WHATSAPP-DEBUG] 🔍 Is greeting: ${isGreeting}`)

          if (isGreeting) {
            logger.info(
              `[UNREGISTERED-GREETING] 👋 Unregistered user ${phoneNumber} sent greeting: "${messageContent}"`
            )

            // Send welcome message with registration link
            await this.sendWelcomeMessageWithRegistration(
              phoneNumber,
              workspaceId,
              messageContent
            )

            logger.info(
              `[WHATSAPP-DEBUG] ✅ Welcome message sent, returning early`
            )
            // Acknowledge and exit - NO N8N forwarding for unregistered users
            res.status(200).send("WELCOME_MESSAGE_SENT")
            return
          } else {
            logger.info(
              `[UNREGISTERED-NON-GREETING] ❌ Unregistered user ${phoneNumber} sent non-greeting message - ignoring`
            )
            res.status(200).send("USER_NOT_REGISTERED")
            return
          }
        }

        logger.info(
          `[REGISTERED-USER] ✅ User ${phoneNumber} is registered - proceeding with normal flow`
        )

        // STEP 2: Security Gateway processing (for registered users only)
        await this.messageService.processMessage(
          phoneNumber,
          messageContent,
          workspaceId
        )

        // STEP 2: 🚨 ANDREA'S OPERATOR CONTROL CHECK
        const operatorControlResult = await this.checkOperatorControl(
          phoneNumber,
          messageContent,
          workspaceId
        )

        if (operatorControlResult.isOperatorControl) {
          logger.info(
            `[OPERATOR-CONTROL] 👨‍💼 Customer ${phoneNumber} is under manual operator control - saving message but NOT forwarding to N8N`
          )

          // ✅ Save the incoming message for operator review
          await this.saveIncomingMessageForOperator(
            phoneNumber,
            messageContent,
            workspaceId
          )

          // ❌ DO NOT forward to N8N when operator has control
          res.status(200).send("EVENT_RECEIVED_OPERATOR_CONTROL")
          return
        }

        // STEP 3: 🔑 ANDREA'S SESSION TOKEN GENERATION
        // Generate or renew session token for EVERY WhatsApp message
        const sessionToken = await this.generateSessionTokenForMessage(
          phoneNumber,
          workspaceId
        )

        // STEP 4: 🚀 Forward to N8N with session token AND workspace ID
        logger.info(
          `[CHATBOT-ACTIVE] 🤖 Customer ${phoneNumber} chatbot is active - forwarding to N8N with session token`
        )

        try {
          logger.info(`[N8N-CALL] 🚀 STARTING N8N call for ${phoneNumber}...`)

          const n8nResponse = await this.forwardToN8N(
            data,
            sessionToken,
            workspaceId
          )

          logger.info(`[N8N-CALL] ✅ N8N call completed for ${phoneNumber}`)
          logger.info(
            `[N8N-RESPONSE] ✅ Received response from N8N:`,
            n8nResponse
          )

          // Parse N8N response - it returns an array with json.message format
          let messageToSend = null
          if (
            Array.isArray(n8nResponse) &&
            n8nResponse.length > 0 &&
            n8nResponse[0].json &&
            n8nResponse[0].json.message
          ) {
            messageToSend = n8nResponse[0].json.message
            logger.info(
              `[N8N-PARSE] 📝 Found message in array format: ${messageToSend}`
            )
          } else if (n8nResponse && n8nResponse.message) {
            messageToSend = n8nResponse.message
            logger.info(
              `[N8N-PARSE] 📝 Found message in direct format: ${messageToSend}`
            )
          } else {
            logger.warn(
              `[N8N-PARSE] ⚠️ No message found in response format:`,
              n8nResponse
            )
          }

          if (messageToSend) {
            logger.info(
              `[WHATSAPP-SEND] 📱 ATTEMPTING to send message to ${phoneNumber}: ${messageToSend}`
            )

            await this.sendWhatsAppMessage(
              phoneNumber,
              messageToSend,
              workspaceId
            )

            logger.info(
              `[WHATSAPP-SEND] ✅ Message sent successfully to ${phoneNumber}: ${messageToSend}`
            )
          } else {
            logger.warn(
              `[N8N-RESPONSE] ⚠️ No message found in N8N response:`,
              n8nResponse
            )

            logger.info(
              `[WHATSAPP-SEND] 📱 SENDING fallback message to ${phoneNumber}`
            )

            await this.sendWhatsAppMessage(
              phoneNumber,
              "Ho ricevuto la tua richiesta ma non sono riuscito a generare una risposta. Riprova più tardi.",
              workspaceId
            )

            logger.info(
              `[WHATSAPP-SEND] ✅ Fallback message sent to ${phoneNumber}`
            )
          }
        } catch (error) {
          logger.error(
            `[N8N-ERROR] ❌ Error with N8N processing for ${phoneNumber}:`,
            error
          )

          // Send error message to user in chat (with full error details for debugging)
          const errorMessage = `❌ Si è verificato un errore durante l'elaborazione del messaggio.\n\n🔍 Dettagli tecnici:\n${error.message}\n\nRiprova più tardi o contatta il supporto.`

          logger.info(
            `[ERROR-SEND] 📱 SENDING error message to ${phoneNumber}: ${errorMessage}`
          )

          await this.sendWhatsAppMessage(phoneNumber, errorMessage, workspaceId)

          logger.info(
            `[ERROR-SENT] ✅ Error message sent successfully to user: ${phoneNumber}`
          )
        }
      }

      // Acknowledge receipt of the event
      res.status(200).send("EVENT_RECEIVED")
    } catch (error) {
      logger.error("Error handling WhatsApp webhook:", error)
      res.status(500).send("ERROR")
    }
  }

  /**
   * 🔑  SESSION TOKEN GENERATION
   * Generate session token for EVERY WhatsApp message to ensure secure tracking
   */
  private async generateSessionTokenForMessage(
    phoneNumber: string,
    workspaceId: string
  ): Promise<string> {
    try {
      logger.info(
        `[SESSION-TOKEN] 🔑 Generating session token for ${phoneNumber} in workspace ${workspaceId}`
      )

      // Find or create customer
      let customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
          isActive: true,
        },
      })

      if (!customer) {
        // Create customer if not exists (for new WhatsApp contacts)
        customer = await prisma.customers.create({
          data: {
            name: `WhatsApp User ${phoneNumber}`,
            email: `${phoneNumber.replace(/[^0-9]/g, "")}@whatsapp.placeholder`,
            phone: phoneNumber,
            workspaceId: workspaceId,
            language: "Italian",
            currency: "EUR",
            isActive: true,
            activeChatbot: true, // Default to chatbot active
          },
        })
        logger.info(
          `[SESSION-TOKEN] Created new customer ${customer.id} for phone ${phoneNumber}`
        )
      }

      // Generate or renew session token
      const sessionToken =
        await this.sessionTokenService.createOrRenewSessionToken(
          workspaceId,
          customer.id,
          phoneNumber,
          `conv_${Date.now()}_${customer.id}`
        )

      logger.info(
        `[SESSION-TOKEN] ✅ Session token generated: ${sessionToken.substring(0, 12)}... for customer ${customer.id}`
      )

      return sessionToken
    } catch (error) {
      logger.error(
        `[SESSION-TOKEN] ❌ Error generating session token for ${phoneNumber}:`,
        error
      )
      throw new Error("Failed to generate session token")
    }
  }

  /**
   * 👨‍💼 ANDREA'S OPERATOR CONTROL CHECK
   * Verifies if customer has activeChatbot = false (operator control)
   */
  private async checkOperatorControl(
    phoneNumber: string,
    message: string,
    workspaceId: string
  ): Promise<{ isOperatorControl: boolean; customer?: any }> {
    try {
      logger.info(
        `[OPERATOR-CONTROL] Checking operator control for ${phoneNumber} in workspace ${workspaceId}`
      )

      // Find customer by phone number
      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
          isActive: true,
        },
      })

      if (!customer) {
        logger.info(
          `[OPERATOR-CONTROL] Customer ${phoneNumber} not found - allowing chatbot processing`
        )
        return { isOperatorControl: false }
      }

      // Check activeChatbot flag
      const isOperatorControl = customer.activeChatbot === false

      logger.info(
        `[OPERATOR-CONTROL] Customer ${phoneNumber}: activeChatbot=${customer.activeChatbot}, isOperatorControl=${isOperatorControl}`
      )

      return {
        isOperatorControl,
        customer,
      }
    } catch (error) {
      logger.error(
        `[OPERATOR-CONTROL] Error checking operator control for ${phoneNumber}:`,
        error
      )
      // On error, allow chatbot processing (fail-safe)
      return { isOperatorControl: false }
    }
  }

  /**
   * 💾 SAVE INCOMING MESSAGE FOR OPERATOR REVIEW
   * Saves customer message when operator has control with special flags
   */
  private async saveIncomingMessageForOperator(
    phoneNumber: string,
    message: string,
    workspaceId: string
  ): Promise<void> {
    try {
      logger.info(
        `[OPERATOR-CONTROL] Saving incoming message for operator review: ${phoneNumber}`
      )

      // Find customer by phone number
      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
          isActive: true,
        },
      })

      if (!customer) {
        logger.error(
          `[OPERATOR-CONTROL] Customer ${phoneNumber} not found - cannot save message`
        )
        return
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
            status: "active",
            context: {},
          },
        })
      }

      // Save the incoming message with OPERATOR CONTROL flags
      await prisma.message.create({
        data: {
          content: message,
          direction: "INBOUND",
          chatSessionId: chatSession.id,
          metadata: {
            agentSelected: "MANUAL_OPERATOR_CONTROL",
            isOperatorControl: true,
            operatorControlActive: true,
            timestamp: new Date().toISOString(),
          },
        },
      })

      logger.info(
        `[OPERATOR-CONTROL] ✅ Message saved for operator review: ${phoneNumber}`
      )
      console.log("🚨 DEBUG: SALVATO (OPERATOR MESSAGE)")
    } catch (error) {
      logger.error(
        `[OPERATOR-CONTROL] ❌ Error saving message for operator:`,
        error
      )
    }
  }

  /**
   * 🚀 FORWARD TO N8N (Andrea's OPTIMIZED Architecture with Simplified Payload)
   * Uses centralized N8nPayloadBuilder for consistent payload structure
   */
  private async forwardToN8N(
    webhookData: any,
    sessionToken: string,
    workspaceId: string
  ): Promise<any> {
    try {
      // 🚨 FIXED N8N URL - hardcoded for now
      const n8nWebhookUrl = "http://localhost:5678/webhook/webhook-start"

      // 📋 EXTRACT KEY DATA FOR OPTIMIZATION
      const phoneNumber =
        webhookData.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from
      const messageContent =
        webhookData.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body

      logger.info(
        `[N8N] 🚀 Forwarding SIMPLIFIED webhook to N8N: ${n8nWebhookUrl}`
      )
      logger.info(`[N8N] 📱 Phone: ${phoneNumber}`)
      logger.info(`[N8N] 💬 Message: ${messageContent}`)
      logger.info(`[N8N] 🔑 Session Token: ${sessionToken.substring(0, 12)}...`)

      // 🎯 BUILD SIMPLIFIED PAYLOAD using centralized builder
      const simplifiedPayload = await N8nPayloadBuilder.buildSimplifiedPayload(
        workspaceId,
        phoneNumber,
        messageContent,
        sessionToken,
        "whatsapp"
      )

      // � SEND TO N8N using centralized method
      const n8nResponse = await N8nPayloadBuilder.sendToN8N(
        simplifiedPayload,
        n8nWebhookUrl,
        "WhatsApp Controller"
      )

      logger.info(
        `[N8N] ✅ Successfully forwarded SIMPLIFIED data to N8N with session token: ${sessionToken.substring(0, 12)}...`
      )

      return n8nResponse
    } catch (error) {
      logger.error(`[N8N] ❌ Error forwarding to N8N:`, error)
      throw error
    }
  }

  /**
   *  GET RECENT CONVERSATION HISTORY
   * Retrieves recent conversation for context (replaces N8N API call)
   */
  private async getRecentConversationHistory(
    workspaceId: string,
    phoneNumber: string,
    limit: number = 10
  ) {
    try {
      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
          isActive: true,
        },
      })

      if (!customer) {
        return []
      }

      const chatSession = await prisma.chatSession.findFirst({
        where: {
          customerId: customer.id,
          workspaceId,
        },
      })

      if (!chatSession) {
        return []
      }

      const messages = await prisma.message.findMany({
        where: {
          chatSessionId: chatSession.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        select: {
          id: true,
          content: true,
          direction: true,
          createdAt: true,
          metadata: true,
        },
      })

      return messages.reverse() // Return in chronological order
    } catch (error) {
      logger.error(
        `[CONVERSATION-HISTORY] Error getting conversation history:`,
        error
      )
      return []
    }
  }

  /**
   * 📤 SEND OPERATOR MESSAGE TO CUSTOMER
   * Endpoint for operators to send manual messages
   */
  async sendOperatorMessage(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, message, workspaceId } = req.body

      if (!phoneNumber || !message || !workspaceId) {
        res.status(400).json({
          error: "phoneNumber, message, and workspaceId are required",
        })
        return
      }

      logger.info(
        `[OPERATOR-MESSAGE] 👨‍💼 Operator sending message to ${phoneNumber}: ${message}`
      )

      // Save operator's outbound message with special flags
      await this.saveOperatorOutboundMessage(phoneNumber, message, workspaceId)

      // TODO: Implement actual WhatsApp API call to send message
      // For now, just log the action
      logger.info(
        `[OPERATOR-MESSAGE] ✅ Message would be sent via WhatsApp API: ${message}`
      )

      res.json({
        success: true,
        message: "Operator message sent successfully",
        sentMessage: message,
        phoneNumber,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logger.error(
        "[OPERATOR-MESSAGE] ❌ Error sending operator message:",
        error
      )
      res.status(500).json({
        error: "Failed to send operator message",
        message: (error as Error).message,
      })
    }
  }

  /**
   * 💾 SAVE OPERATOR OUTBOUND MESSAGE
   * Saves operator's outbound message with special flags for UI distinction
   */
  private async saveOperatorOutboundMessage(
    phoneNumber: string,
    message: string,
    workspaceId: string
  ): Promise<void> {
    try {
      // Find customer by phone number
      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
          isActive: true,
        },
      })

      if (!customer) {
        logger.error(
          `[OPERATOR-MESSAGE] Customer ${phoneNumber} not found - cannot save message`
        )
        return
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
            status: "active",
            context: {},
          },
        })
      }

      // Save operator's outbound message with OPERATOR flags
      await prisma.message.create({
        data: {
          content: message,
          direction: "OUTBOUND",
          chatSessionId: chatSession.id,
          metadata: {
            agentSelected: "MANUAL_OPERATOR",
            isOperatorMessage: true, // ✅ Flag for UI to show operator badge
            operatorId: "manual_operator",
            sentBy: "HUMAN_OPERATOR",
            timestamp: new Date().toISOString(),
          },
        },
      })

      logger.info(
        `[OPERATOR-MESSAGE] ✅ Operator message saved to DB: ${phoneNumber}`
      )
      console.log("🚨 DEBUG: SALVATO (OPERATOR OUTBOUND MESSAGE)")
    } catch (error) {
      logger.error(
        `[OPERATOR-MESSAGE] ❌ Error saving operator message:`,
        error
      )
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
   * 🌍 DETECT LANGUAGE FROM MESSAGE
   * Detects the language of the greeting message
   */
  private detectLanguageFromMessage(message: string): string {
    const normalizedMessage = message.toLowerCase().trim()

    // Language detection patterns
    const languagePatterns = {
      es: ["hola", "buenas", "buenos días", "perdona", "perdón", "gracias"],
      en: [
        "hello",
        "hi",
        "hey",
        "good morning",
        "good afternoon",
        "thanks",
        "thank you",
      ],
      it: [
        "ciao",
        "salve",
        "buongiorno",
        "buona sera",
        "buondì",
        "grazie",
        "scusa",
      ],
      fr: ["bonjour", "salut", "bonsoir", "merci", "pardon", "excuse"],
      de: ["hallo", "guten tag", "guten morgen", "danke", "entschuldigung"],
      pt: ["olá", "oi", "bom dia", "boa tarde", "obrigado", "desculpa"],
    }

    // Check each language pattern
    for (const [lang, patterns] of Object.entries(languagePatterns)) {
      for (const pattern of patterns) {
        if (
          normalizedMessage === pattern ||
          normalizedMessage.startsWith(pattern + " ") ||
          normalizedMessage.startsWith(pattern + "!") ||
          normalizedMessage.includes(" " + pattern + " ") ||
          normalizedMessage.endsWith(" " + pattern)
        ) {
          logger.info(
            `[LANGUAGE-DETECT] 🌍 Detected "${lang}" from pattern "${pattern}" in message "${message}"`
          )
          return lang
        }
      }
    }

    // Default to Italian if no pattern matches
    logger.info(
      `[LANGUAGE-DETECT] 🌍 No specific language detected, defaulting to Italian for message "${message}"`
    )
    return "it"
  }

  /**
   * 💌 SEND WELCOME MESSAGE WITH REGISTRATION LINK
   * Sends welcome message to unregistered users with registration link
   */
  private async sendWelcomeMessageWithRegistration(
    phoneNumber: string,
    workspaceId: string,
    originalMessage: string
  ): Promise<void> {
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
        return
      }

      logger.info(`[WELCOME-MESSAGE] 📋 Workspace found: ${workspace.name}`)
      logger.info(
        `[WELCOME-MESSAGE] 📋 Welcome messages config:`,
        workspace.welcomeMessages
      )

      // Detect language from the original message
      const detectedLang = this.detectLanguageFromMessage(originalMessage)
      logger.info(`[WELCOME-MESSAGE] 🌍 Detected language: ${detectedLang}`)

      // 🔥 STEP 1: Create customer placeholder if not exists
      logger.info(`[WELCOME-MESSAGE] 👤 Creating customer placeholder...`)
      await this.createCustomerPlaceholder(
        phoneNumber,
        workspaceId,
        detectedLang
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
          messages[detectedLang] ||
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
      const registrationUrl = `${baseUrl}/register?phone=${encodeURIComponent(phoneNumber)}&workspace=${workspaceId}&token=${token}&lang=${detectedLang}`

      // Create complete message with registration link
      const registrationText = this.getRegistrationText(detectedLang)
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
      console.log("🚨 DEBUG: SALVATO (WELCOME MESSAGE)")

      // TODO: Send actual WhatsApp message (requires WhatsApp Business API setup)
      logger.info(
        `[WELCOME-MESSAGE] 🚨 TODO: Implement actual WhatsApp message sending`
      )
      logger.info(
        `[WELCOME-MESSAGE] 📱 Message prepared for ${phoneNumber}: ${fullMessage}`
      )
    } catch (error) {
      logger.error(
        `[WELCOME-MESSAGE] ❌ Error sending welcome message to ${phoneNumber}:`,
        error
      )
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
        `[WELCOME-HISTORY] Messages saved to chat history for ${phoneNumber}`
      )
      console.log("🚨 DEBUG: SALVATO (WELCOME HISTORY MESSAGES)")
    } catch (error) {
      logger.error(
        `[WELCOME-HISTORY] Error saving welcome messages to history:`,
        error
      )
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
   * 📱 SEND WHATSAPP MESSAGE
   * Sends a message via WhatsApp API
   */
  private async sendWhatsAppMessage(
    phoneNumber: string,
    message: string,
    workspaceId: string
  ): Promise<void> {
    try {
      logger.info(
        `[WHATSAPP-SEND] 📱 Sending message to ${phoneNumber}: "${message}"`
      )

      // Get workspace WhatsApp settings
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
          whatsappApiKey: true,
          whatsappPhoneNumber: true,
        },
      })

      if (!workspace || !workspace.whatsappApiKey) {
        throw new Error(
          `WhatsApp settings not found for workspace ${workspaceId}`
        )
      }

      // Send message via WhatsApp Business API
      const whatsappApiUrl = `https://graph.facebook.com/v18.0/${workspace.whatsappPhoneNumber}/messages`

      const whatsappPayload = {
        messaging_product: "whatsapp",
        to: phoneNumber.replace("+", ""),
        type: "text",
        text: {
          body: message,
        },
      }

      const response = await fetch(whatsappApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${workspace.whatsappApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(whatsappPayload),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(
          `WhatsApp API error: ${response.status} ${response.statusText} - ${errorData}`
        )
      }

      const responseData = await response.json()
      logger.info(`[WHATSAPP-SEND] ✅ Message sent successfully:`, responseData)

      // Save the outbound message to chat history
      await this.saveOutboundMessageToHistory(phoneNumber, workspaceId, message)
    } catch (error) {
      logger.error(`[WHATSAPP-SEND] ❌ Error sending WhatsApp message:`, error)
      throw error
    }
  }

  /**
   * 💾 SAVE OUTBOUND MESSAGE TO HISTORY
   * Saves outbound message to chat history
   */
  private async saveOutboundMessageToHistory(
    phoneNumber: string,
    workspaceId: string,
    message: string
  ): Promise<void> {
    try {
      // Find the customer by phone number
      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
        },
      })

      if (!customer) {
        logger.warn(
          `[HISTORY] Customer not found for phone ${phoneNumber}, skipping history save`
        )
        return
      }

      // Find or create active chat session
      let chatSession = await prisma.chatSession.findFirst({
        where: {
          customerId: customer.id,
          workspaceId: workspaceId,
          status: "active",
        },
      })

      if (!chatSession) {
        chatSession = await prisma.chatSession.create({
          data: {
            customerId: customer.id,
            workspaceId: workspaceId,
            status: "active",
          },
        })
      }

      // Save the message
      await prisma.message.create({
        data: {
          chatSessionId: chatSession.id,
          direction: "OUTBOUND",
          content: message,
          status: "sent",
        },
      })

      logger.info(
        `[HISTORY] ✅ Outbound message saved to history for ${phoneNumber}`
      )
    } catch (error) {
      logger.error(
        `[HISTORY] ❌ Error saving outbound message to history:`,
        error
      )
    }
  }
}
