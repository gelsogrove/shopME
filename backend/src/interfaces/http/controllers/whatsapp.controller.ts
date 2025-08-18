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
              `[UNREGISTERED-NON-GREETING] ❌ Unregistered user ${phoneNumber} sent non-greeting message - sending registration required message`
            )

            // Detect language from the message and send registration required message
            const detectedLang = this.detectLanguageFromMessage(messageContent)
            const registrationRequiredMessage =
              this.getRegistrationRequiredMessage(detectedLang)

            try {
              await this.sendWhatsAppMessage(
                phoneNumber,
                registrationRequiredMessage,
                workspaceId
              )
              logger.info(
                `[REGISTRATION-REQUIRED] ✅ Registration required message sent to ${phoneNumber}`
              )
            } catch (error) {
              logger.error(
                `[REGISTRATION-REQUIRED] ❌ Error sending registration required message to ${phoneNumber}:`,
                error
              )
            }

            res.status(200).send("USER_NOT_REGISTERED")
            return
          }
        }

        logger.info(
          `[REGISTERED-USER] ✅ User ${phoneNumber} is registered - proceeding with normal flow`
        )

        // STEP 1.5: 🏢 CHECK WORKSPACE ACTIVE STATUS
        const workspaceActiveResult =
          await this.checkWorkspaceActive(workspaceId)

        if (!workspaceActiveResult.isActive) {
          logger.info(
            `[WORKSPACE-INACTIVE] ❌ Workspace ${workspaceId} is INACTIVE - sending WIP message`
          )

          // Detect user language
          const userLanguage = await this.detectUserLanguage(
            phoneNumber,
            messageContent,
            workspaceId
          )

          // Get WIP message in user's language
          const wipMessage = this.getWipMessage(
            workspaceActiveResult.wipMessages,
            userLanguage
          )

          if (wipMessage) {
            try {
              // Send WIP message to user
              await this.sendWhatsAppMessage(
                phoneNumber,
                wipMessage,
                workspaceId
              )
              logger.info(
                `[WORKSPACE-INACTIVE] ✅ WIP message sent to ${phoneNumber}`
              )

              // Save the interaction for audit trail
              await this.saveWorkspaceInactiveMessage(
                phoneNumber,
                messageContent,
                wipMessage,
                workspaceId
              )
            } catch (error) {
              logger.error(
                `[WORKSPACE-INACTIVE] ❌ Error sending WIP message to ${phoneNumber}:`,
                error
              )
            }
          }

          res.status(200).send("WORKSPACE_INACTIVE_WIP_SENT")
          return
        }

        // STEP 2: Security Gateway processing (for registered users only)
        await this.messageService.processMessage(
          phoneNumber,
          messageContent,
          workspaceId
        )

        // STEP 3: 🚨 TASK #23 - CUSTOMER STATUS CHECKS (isActive & isBlacklisted)
        const customerStatusResult = await this.checkCustomerStatus(
          phoneNumber,
          workspaceId
        )

        // Always save the message regardless of customer status (for audit trail)
        await this.saveIncomingMessageForStatus(
          phoneNumber,
          messageContent,
          workspaceId,
          customerStatusResult
        )

        if (
          !customerStatusResult.isActive ||
          customerStatusResult.isBlacklisted
        ) {
          logger.info(
            `[CUSTOMER-STATUS] ❌ Customer ${phoneNumber} is ${!customerStatusResult.isActive ? "INACTIVE" : "BLACKLISTED"} - message saved but NOT forwarding to N8N`
          )

          // ❌ DO NOT forward to N8N when customer is inactive or blacklisted
          res.status(200).send("EVENT_RECEIVED_CUSTOMER_INACTIVE")
          return
        }

        // STEP 4: 🚨 ANDREA'S OPERATOR CONTROL CHECK
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

        // STEP 5: 🔑 ANDREA'S SESSION TOKEN GENERATION
        // Generate or renew session token for EVERY WhatsApp message
        const sessionToken = await this.generateSessionTokenForMessage(
          phoneNumber,
          workspaceId
        )

        // STEP 6: 🚀 Forward to N8N with session token AND workspace ID
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

          // Parse N8N response - it returns an array with message format
          let messageToSend = null
          if (
            Array.isArray(n8nResponse) &&
            n8nResponse.length > 0 &&
            n8nResponse[0].message
          ) {
            messageToSend = n8nResponse[0].message
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

            try {
              // Save the successful message to chat history BEFORE sending
              const { MessageRepository } = await import(
                "../../../repositories/message.repository"
              )
              const messageRepository = new MessageRepository()
              await messageRepository.saveMessage({
                workspaceId,
                phoneNumber,
                message: messageContent,
                response: messageToSend,
                agentSelected: "CHATBOT",
              })
              logger.info(
                `[SUCCESS-HISTORY] ✅ Successful message saved to chat history for ${phoneNumber}`
              )

              // Then send the WhatsApp message
              await this.sendWhatsAppMessage(
                phoneNumber,
                messageToSend,
                workspaceId
              )

              logger.info(
                `[WHATSAPP-SEND] ✅ Message sent successfully to ${phoneNumber}: ${messageToSend}`
              )
            } catch (saveError) {
              logger.error(
                `[SUCCESS-HISTORY] ❌ Failed to save successful message to history: ${saveError}`
              )

              // Still try to send the message even if saving fails
              try {
                await this.sendWhatsAppMessage(
                  phoneNumber,
                  messageToSend,
                  workspaceId
                )
                logger.info(
                  `[WHATSAPP-SEND] ✅ Message sent (without history): ${phoneNumber}`
                )
              } catch (sendError) {
                logger.error(
                  `[WHATSAPP-SEND] ❌ Failed to send message: ${sendError}`
                )
              }
            }
          } else {
            logger.warn(
              `[N8N-RESPONSE] ⚠️ No message found in N8N response:`,
              n8nResponse
            )

            const fallbackMessage =
              "Ho ricevuto la tua richiesta ma non sono riuscito a generare una risposta. Riprova più tardi."

            logger.info(
              `[WHATSAPP-SEND] 📱 SENDING fallback message to ${phoneNumber}`
            )

            try {
              // Save the fallback message to chat history BEFORE sending
              const { MessageRepository } = await import(
                "../../../repositories/message.repository"
              )
              const messageRepository = new MessageRepository()
              await messageRepository.saveMessage({
                workspaceId,
                phoneNumber,
                message: messageContent,
                response: fallbackMessage,
                agentSelected: "N8N_FALLBACK",
              })
              logger.info(
                `[FALLBACK-HISTORY] ✅ Fallback message saved to chat history for ${phoneNumber}`
              )

              // Then send the WhatsApp message
              await this.sendWhatsAppMessage(
                phoneNumber,
                fallbackMessage,
                workspaceId
              )

              logger.info(
                `[WHATSAPP-SEND] ✅ Fallback message sent to ${phoneNumber}`
              )
            } catch (saveError) {
              logger.error(
                `[FALLBACK-HISTORY] ❌ Failed to save fallback message to history: ${saveError}`
              )

              // Still try to send the message even if saving fails
              try {
                await this.sendWhatsAppMessage(
                  phoneNumber,
                  fallbackMessage,
                  workspaceId
                )
                logger.info(
                  `[WHATSAPP-SEND] ✅ Fallback message sent (without history): ${phoneNumber}`
                )
              } catch (sendError) {
                logger.error(
                  `[WHATSAPP-SEND] ❌ Failed to send fallback message: ${sendError}`
                )
              }
            }
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

          try {
            // Save the error message to chat history BEFORE sending
            const { MessageRepository } = await import(
              "../../../repositories/message.repository"
            )
            const messageRepository = new MessageRepository()
            await messageRepository.saveMessage({
              workspaceId,
              phoneNumber,
              message: messageContent,
              response: errorMessage,
              agentSelected: "N8N_ERROR",
            })
            logger.info(
              `[ERROR-HISTORY] ✅ Error message saved to chat history for ${phoneNumber}`
            )

            // Then send the WhatsApp message
            await this.sendWhatsAppMessage(
              phoneNumber,
              errorMessage,
              workspaceId
            )

            logger.info(
              `[ERROR-SENT] ✅ Error message sent successfully to user: ${phoneNumber}`
            )
          } catch (saveError) {
            logger.error(
              `[ERROR-HISTORY] ❌ Failed to save error message to history: ${saveError}`
            )

            // Still try to send the message even if saving fails
            try {
              await this.sendWhatsAppMessage(
                phoneNumber,
                errorMessage,
                workspaceId
              )
              logger.info(
                `[ERROR-SENT] ✅ Error message sent (without history): ${phoneNumber}`
              )
            } catch (sendError) {
              logger.error(
                `[ERROR-SEND] ❌ Failed to send error message: ${sendError}`
              )
            }
          }
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

      // Use MessageRepository to handle customer creation
      const { MessageRepository } = await import(
        "../../../repositories/message.repository"
      )
      const messageRepository = new MessageRepository()

      // Find or create customer by triggering saveMessage
      await messageRepository.saveMessage({
        workspaceId,
        phoneNumber,
        message: "system_session_init",
        response: "session_initialized",
        agentSelected: "SESSION_TOKEN_SERVICE",
      })

      // Now get the customer that was created
      const customer = await messageRepository.findCustomerByPhone(
        phoneNumber,
        workspaceId
      )

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
   * 🏢 CHECK WORKSPACE ACTIVE STATUS
   * Verifies if workspace is active and gets WIP messages
   */
  private async checkWorkspaceActive(workspaceId: string): Promise<{
    isActive: boolean
    wipMessages?: Record<string, string> | null
    workspace?: any
  }> {
    try {
      logger.info(
        `[WORKSPACE-CHECK] Checking workspace active status for ${workspaceId}`
      )

      // Find workspace and get WIP messages
      const workspace = await prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
        select: {
          id: true,
          name: true,
          isActive: true,
          wipMessages: true,
        },
      })

      if (!workspace) {
        logger.warn(
          `[WORKSPACE-CHECK] Workspace ${workspaceId} not found - treating as inactive`
        )
        return {
          isActive: false,
        }
      }

      // Check workspace status
      const isActive = workspace.isActive === true

      logger.info(
        `[WORKSPACE-CHECK] Workspace ${workspaceId}: isActive=${isActive}`
      )

      return {
        isActive,
        wipMessages: workspace.wipMessages as Record<string, string> | null,
        workspace,
      }
    } catch (error) {
      logger.error(
        `[WORKSPACE-CHECK] Error checking workspace ${workspaceId}:`,
        error
      )
      // On error, treat as inactive for safety
      return {
        isActive: false,
      }
    }
  }

  /**
   * � TASK #23 - CUSTOMER STATUS CHECK
   * Verifies if customer is active and not blacklisted
   */
  private async checkCustomerStatus(
    phoneNumber: string,
    workspaceId: string
  ): Promise<{
    isActive: boolean
    isBlacklisted: boolean
    customer?: any
  }> {
    try {
      logger.info(
        `[CUSTOMER-STATUS] Checking status for ${phoneNumber} in workspace ${workspaceId}`
      )

      // Find customer by phone number
      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
        },
      })

      if (!customer) {
        logger.info(
          `[CUSTOMER-STATUS] Customer ${phoneNumber} not found - treating as inactive`
        )
        return {
          isActive: false,
          isBlacklisted: false,
        }
      }

      // Check customer status
      const isActive = customer.isActive === true
      const isBlacklisted = customer.isBlacklisted === true

      logger.info(
        `[CUSTOMER-STATUS] Customer ${phoneNumber}: isActive=${isActive}, isBlacklisted=${isBlacklisted}`
      )

      return {
        isActive,
        isBlacklisted,
        customer,
      }
    } catch (error) {
      logger.error(
        `[CUSTOMER-STATUS] Error checking status for ${phoneNumber}:`,
        error
      )
      // On error, treat as inactive for safety
      return {
        isActive: false,
        isBlacklisted: false,
      }
    }
  }

  /**
   * 🌍 DETECT USER LANGUAGE
   * Detects user language from customer record or message content
   */
  private async detectUserLanguage(
    phoneNumber: string,
    messageContent: string,
    workspaceId: string
  ): Promise<string> {
    try {
      // First try to get language from customer record
      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
        },
        select: {
          language: true,
        },
      })

      if (customer?.language) {
        logger.info(
          `[LANGUAGE-DETECT] Customer ${phoneNumber} has language: ${customer.language}`
        )
        return customer.language.toLowerCase()
      }

      // Fallback to message detection
      const detectedLang = this.detectLanguageFromMessage(messageContent)
      logger.info(
        `[LANGUAGE-DETECT] Detected language from message: ${detectedLang}`
      )

      return detectedLang
    } catch (error) {
      logger.error(
        `[LANGUAGE-DETECT] Error detecting language for ${phoneNumber}:`,
        error
      )
      return "en" // Default to English
    }
  }

  /**
   * 📝 GET WIP MESSAGE IN USER LANGUAGE
   * Gets the WIP message in the user's preferred language
   */
  private getWipMessage(
    wipMessages: Record<string, string> | null | undefined,
    userLanguage: string
  ): string | null {
    try {
      if (!wipMessages) {
        logger.warn("[WIP-MESSAGE] No WIP messages configured")
        return null
      }

      // Normalize language code
      const langCode = userLanguage.toLowerCase()

      // Try exact match first
      if (wipMessages[langCode]) {
        logger.info(`[WIP-MESSAGE] Found WIP message for language: ${langCode}`)
        return wipMessages[langCode]
      }

      // Try common language mappings
      const languageMappings: Record<string, string> = {
        es: "es",
        spanish: "es",
        it: "it",
        italian: "it",
        pt: "pt",
        portuguese: "pt",
        en: "en",
        english: "en",
      }

      const mappedLang = languageMappings[langCode]
      if (mappedLang && wipMessages[mappedLang]) {
        logger.info(
          `[WIP-MESSAGE] Found WIP message for mapped language: ${mappedLang}`
        )
        return wipMessages[mappedLang]
      }

      // Fallback to English, then Italian, then first available
      const fallbackOrder = ["en", "it", "es", "pt"]
      for (const fallbackLang of fallbackOrder) {
        if (wipMessages[fallbackLang]) {
          logger.info(`[WIP-MESSAGE] Using fallback language: ${fallbackLang}`)
          return wipMessages[fallbackLang]
        }
      }

      // If nothing found, return first available message
      const firstMessage = Object.values(wipMessages)[0]
      if (firstMessage) {
        logger.info("[WIP-MESSAGE] Using first available WIP message")
        return firstMessage
      }

      logger.warn("[WIP-MESSAGE] No WIP message found in any language")
      return null
    } catch (error) {
      logger.error("[WIP-MESSAGE] Error getting WIP message:", error)
      return null
    }
  }

  /**
   * 💾 SAVE WORKSPACE INACTIVE MESSAGE
   * Saves the interaction when workspace is inactive
   */
  private async saveWorkspaceInactiveMessage(
    phoneNumber: string,
    userMessage: string,
    wipResponse: string,
    workspaceId: string
  ): Promise<void> {
    try {
      logger.info(`[WORKSPACE-INACTIVE] Saving interaction for ${phoneNumber}`)

      const { MessageRepository } = await import(
        "../../../repositories/message.repository"
      )
      const messageRepository = new MessageRepository()

      await messageRepository.saveMessage({
        workspaceId,
        phoneNumber,
        message: userMessage,
        response: wipResponse,
        agentSelected: "WORKSPACE_INACTIVE",
        direction: "BOTH",
      })

      logger.info(
        `[WORKSPACE-INACTIVE] ✅ Interaction saved for ${phoneNumber}`
      )
    } catch (error) {
      logger.error(
        `[WORKSPACE-INACTIVE] ❌ Error saving interaction for ${phoneNumber}:`,
        error
      )
    }
  }

  /**
   * �👨‍💼 ANDREA'S OPERATOR CONTROL CHECK
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

      // Find customer by phone number (search any customer regardless of isActive)
      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
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
   * 💾 SAVE INCOMING MESSAGE FOR STATUS FILTERING
   * Saves customer message when filtered by isActive/isBlacklisted status
   */
  private async saveIncomingMessageForStatus(
    phoneNumber: string,
    message: string,
    workspaceId: string,
    statusResult: { isActive: boolean; isBlacklisted: boolean; customer?: any }
  ): Promise<void> {
    try {
      const reason = !statusResult.isActive
        ? "CUSTOMER_INACTIVE"
        : statusResult.isBlacklisted
          ? "CUSTOMER_BLACKLISTED"
          : "UNKNOWN"

      logger.info(
        `[CUSTOMER-STATUS] Saving incoming message for status filtering: ${phoneNumber} - ${reason}`
      )

      // Always save message for audit trail, regardless of customer status
      const { MessageRepository } = await import(
        "../../../repositories/message.repository"
      )
      const messageRepository = new MessageRepository()

      await messageRepository.saveMessage({
        workspaceId,
        phoneNumber,
        message: message,
        response: "", // No response for filtered customers
        agentSelected: reason,
        direction: "INBOUND",
      })

      logger.info(
        `[CUSTOMER-STATUS] ✅ Message saved with agent: ${reason} for ${phoneNumber}`
      )
    } catch (error) {
      logger.error(
        `[CUSTOMER-STATUS] ❌ Error saving message for ${phoneNumber}:`,
        error
      )
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

      // Find customer by phone number (search any customer regardless of isActive)
      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
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
      logger.info("🚨 DEBUG: SALVATO (OPERATOR MESSAGE)")
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
      // 🚨 FIXED N8N URL - corrected to production webhook
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

      // 🎯 SEND TO N8N using centralized method
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

      // ✅ TASK #34: Send actual WhatsApp message
      try {
        await this.sendWhatsAppMessage(phoneNumber, message, workspaceId)
        logger.info(
          `[OPERATOR-MESSAGE] ✅ WhatsApp message sent successfully to ${phoneNumber}`
        )
      } catch (whatsappError) {
        logger.error(
          `[OPERATOR-MESSAGE] ❌ Error sending WhatsApp message to ${phoneNumber}:`,
          whatsappError
        )
        // Still return success since message was saved to DB
        // Operator can retry if needed
      }

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
      logger.info("🚨 DEBUG: SALVATO (OPERATOR OUTBOUND MESSAGE)")
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
      logger.info("🚨 DEBUG: SALVATO (WELCOME MESSAGE)")

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
      // Use MessageRepository to handle customer and chat session creation
      const { MessageRepository } = await import(
        "../../../repositories/message.repository"
      )
      const messageRepository = new MessageRepository()
      await messageRepository.saveMessage({
        workspaceId,
        phoneNumber,
        message: incomingMessage,
        response: welcomeMessage,
        agentSelected: "WELCOME_SYSTEM",
      })

      logger.info(
        `[WELCOME-HISTORY] Messages saved to chat history for ${phoneNumber}`
      )
      logger.info("🚨 DEBUG: SALVATO (WELCOME HISTORY MESSAGES)")
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
   * 📝 GET REGISTRATION REQUIRED MESSAGE
   * Returns the "registration required" message in the appropriate language
   */
  private getRegistrationRequiredMessage(language: string): string {
    const registrationRequiredMessages = {
      it: "Per utilizzare questo servizio devi prima registrarti. Scrivi 'ciao' per ricevere il link di registrazione.",
      es: "Para usar este servicio primero debes registrarte. Escribe 'hola' para recibir el enlace de registro.",
      en: "To use this service you must first register. Write 'hello' to receive the registration link.",
      fr: "Pour utiliser ce service, vous devez d'abord vous inscrire. Écrivez 'bonjour' pour recevoir le lien d'inscription.",
      de: "Um diesen Service zu nutzen, müssen Sie sich zuerst registrieren. Schreiben Sie 'hallo', um den Registrierungslink zu erhalten.",
      pt: "Para usar este serviço você deve primeiro se registrar. Escreva 'olá' para receber o link de registro.",
    }

    return (
      registrationRequiredMessages[language] ||
      registrationRequiredMessages["it"]
    )
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
        `[CUSTOMER-PLACEHOLDER] 👤 Creating placeholder for ${phoneNumber} with language: ${language}`
      )

      // Check if customer already exists first
      const existingCustomer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
        },
      })

      if (existingCustomer) {
        logger.info(
          `[CUSTOMER-PLACEHOLDER] ✅ Customer already exists: ${existingCustomer.id}`
        )

        // Update language if it's different from detected one
        if (existingCustomer.language !== language) {
          await prisma.customers.update({
            where: { id: existingCustomer.id },
            data: { language: language },
          })
          logger.info(
            `[CUSTOMER-PLACEHOLDER] 🌍 Updated customer language to: ${language}`
          )
        }
        return
      }

      // Create new customer with the detected language
      const newCustomer = await prisma.customers.create({
        data: {
          phone: phoneNumber,
          workspaceId: workspaceId,
          name: `Unregistered User ${phoneNumber.slice(-4)}`,
          email: `unregistered_${phoneNumber.replace(/[^0-9]/g, "")}@placeholder.com`,
          language: language,
          isActive: false, // Unregistered users are inactive
          activeChatbot: true,
        },
      })

      logger.info(
        `[CUSTOMER-PLACEHOLDER] ✅ Customer created: ${newCustomer.id} with language: ${language}`
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
      // Use MessageRepository to handle customer and chat session creation
      const { MessageRepository } = await import(
        "../../../repositories/message.repository"
      )
      const messageRepository = new MessageRepository()
      await messageRepository.saveMessage({
        workspaceId,
        phoneNumber,
        message: "system_outbound",
        response: message,
        direction: "OUTBOUND",
        agentSelected: "WHATSAPP_OUTBOUND",
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

  // REMOVED: findOrCreateCustomer - Now using MessageRepository.saveMessage() for all operations
}
