import { PrismaClient } from "@prisma/client"
import { NextFunction, Request, Response, Router } from "express"
import { linkGeneratorService } from "../application/services/link-generator.service"
import { OtpService } from "../application/services/otp.service"
import { PasswordResetService } from "../application/services/password-reset.service"
import { RegistrationAttemptsService } from "../application/services/registration-attempts.service"
import { SecureTokenService } from "../application/services/secure-token.service"
import { SpamDetectionService } from "../application/services/spam-detection.service"
import { UserService } from "../application/services/user.service"
import { config } from "../config"
import { AuthController } from "../interfaces/http/controllers/auth.controller"
import { CategoryController } from "../interfaces/http/controllers/category.controller"
import { ChatController } from "../interfaces/http/controllers/chat.controller"
import { CustomersController } from "../interfaces/http/controllers/customers.controller"
import { MessageRepository } from "../repositories/message.repository"
import { usageService } from "../services/usage.service"
import logger from "../utils/logger"

/**
 * 🔒 BLACKLIST CHECK HELPER
 * Checks if a customer is blacklisted and returns appropriate response
 */
async function checkCustomerBlacklist(
  phoneNumber: string,
  workspaceId: string,
  res: Response,
  format: "WHATSAPP" | "TEST" = "WHATSAPP"
): Promise<boolean> {
  try {
    const customer = await prisma.customers.findFirst({
      where: {
        phone: phoneNumber.replace(/\s+/g, ""),
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        language: true,
        isBlacklisted: true,
      },
    })

    // ✅ BLACKLIST CHECK ENABLED - Check customer blacklist status
    console.log(`🚫 ${format}: Checking blacklist status for ${phoneNumber}`)

    if (customer?.isBlacklisted) {
      console.log(
        `🚫 ${format}: Customer ${phoneNumber} is blacklisted - IGNORING MESSAGE`
      )
      res.status(200).json({
        success: true,
        data: {
          sessionId: null,
          message: "EVENT_RECEIVED_CUSTOMER_BLACKLISTED",
        },
      })
      return true
    }

    return false
  } catch (error) {
    logger.error(
      `[BLACKLIST_CHECK] Error checking blacklist for ${phoneNumber}:`,
      error
    )
    return false
  }
}

/**
 * 🆕 NEW USER WELCOME FLOW HELPER
 * Handles new user detection, registration attempts tracking, and welcome message sending
 * @param phoneNumber - User phone number
 * @param workspaceId - Workspace ID
 * @param messageContent - User message content
 * @param res - Express response object
 * @param format - Format type for logging ('WHATSAPP' or 'TEST')
 * @returns Promise<boolean> - true if handled (response sent), false if should continue normal flow
 */
function getRegistrationText(language: string): {
  link: string
  validity: string
} {
  switch (language.toLowerCase()) {
    case "en":
      return {
        link: "To continue, register here",
        validity: "Link valid for 1 hour",
      }
    case "es":
      return {
        link: "Para continuar, regístrate aquí",
        validity: "Enlace válido por 1 hora",
      }
    case "pt":
      return {
        link: "Para continuar, registre-se aqui",
        validity: "Link válido por 1 hora",
      }
    case "it":
    default:
      return {
        link: "Per continuare, registrati qui",
        validity: "Link valido per 1 ora",
      }
  }
}

async function handleNewUserWelcomeFlow(
  phoneNumber: string,
  workspaceId: string,
  messageContent: string,
  res: Response,
  format: "WHATSAPP" | "TEST" = "WHATSAPP"
): Promise<boolean> {
  try {
    // Initialize services
    const secureTokenService = new SecureTokenService()
    const messageRepository = new MessageRepository()
    const registrationAttemptsService = new RegistrationAttemptsService(prisma)

    // Check if user is blocked due to too many registration attempts
    const isBlocked = await registrationAttemptsService.isBlocked(
      phoneNumber,
      workspaceId
    )
    if (isBlocked) {
      // ✅ REGISTRATION ATTEMPTS CHECK ENABLED - Block users with too many attempts
      console.log(
        `🚫 ${format}: User ${phoneNumber} is blocked due to too many registration attempts - IGNORING MESSAGE`
      )
      res.status(200).json({
        success: true,
        data: {
          sessionId: null,
          message: "EVENT_RECEIVED_CUSTOMER_BLACKLISTED",
        },
      })
      return true
    }

    // Record this registration attempt
    const attempt = await registrationAttemptsService.recordAttempt(
      phoneNumber,
      workspaceId
    )
    console.log(
      `📊 ${format}: Registration attempt ${attempt.attemptCount}/3 for ${phoneNumber}`
    )

    // If user is now blocked after this attempt, ignore completely (blacklist totale)
    if (attempt.isBlocked) {
      // ✅ REGISTRATION ATTEMPTS CHECK ENABLED - Block users after too many attempts
      console.log(
        `🚫 ${format}: User ${phoneNumber} blocked after ${attempt.attemptCount} attempts - IGNORING MESSAGE`
      )
      res.status(200).json({
        success: true,
        data: {
          sessionId: null,
          message: "EVENT_RECEIVED_CUSTOMER_BLACKLISTED",
        },
      })
      return true
    }

    // Detect language from message content
    let detectedLanguage = "it" // Default to Italian
    if (messageContent) {
      const lowerMessage = messageContent.toLowerCase()

      // Italian detection - FIXED: Added Italian words for proper language detection
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
        "aggiungere",
        "carrello",
        "comprare",
        "acquistare",
        "ordine",
        "prezzo",
        "costo",
        "quanto",
        "consegna",
        "spedizione",
        "prodotto",
        "prodotti",
        "aiuto",
        "informazioni",
        "riguardo",
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

      // English detection - more comprehensive
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
        "add",
        "cart",
        "buy",
        "purchase",
        "order",
        "price",
        "cost",
        "how much",
        "delivery",
        "shipping",
        "product",
        "products",
        "help",
        "information",
        "about",
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
        "añadir",
        "carrito",
        "comprar",
        "precio",
        "costo",
        "cuánto",
        "entrega",
        "envío",
        "producto",
        "productos",
        "ayuda",
        "información",
        "sobre",
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
        "adicionar",
        "carrinho",
        "comprar",
        "preço",
        "custo",
        "quanto",
        "entrega",
        "envio",
        "produto",
        "produtos",
        "ajuda",
        "informação",
        "sobre",
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
        detectedLanguage = "it"
      } else if (
        englishMatches > italianMatches &&
        englishMatches > spanishMatches &&
        englishMatches > portugueseMatches
      ) {
        detectedLanguage = "en"
      } else if (
        spanishMatches > italianMatches &&
        spanishMatches > englishMatches &&
        spanishMatches > portugueseMatches
      ) {
        detectedLanguage = "es"
      } else if (
        portugueseMatches > italianMatches &&
        portugueseMatches > englishMatches &&
        portugueseMatches > spanishMatches
      ) {
        detectedLanguage = "pt"
      }
    }

    // Get welcome message from database
    const welcomeMessage = await messageRepository.getWelcomeMessage(
      workspaceId,
      detectedLanguage
    )
    if (!welcomeMessage) {
      console.error(
        `❌ ${format}: No welcome message found for language ${detectedLanguage} in workspace ${workspaceId}`
      )
      res.status(500).send("ERROR")
      return true
    }

    // Generate secure registration token
    const registrationToken = await secureTokenService.createToken(
      "registration",
      workspaceId,
      { phone: phoneNumber, language: detectedLanguage },
      "1h",
      undefined,
      phoneNumber
    ) // 1 hour expiry

    // Create short registration URL using LinkGeneratorService
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
    const longUrl = `${frontendUrl}/register?token=${registrationToken}&phone=${encodeURIComponent(phoneNumber)}&workspace=${workspaceId}`
    const registrationUrl = await linkGeneratorService.generateShortLink(
      longUrl,
      workspaceId,
      "registration"
    )

    // Send complete welcome message with registration link in customer's language
    const registrationText = getRegistrationText(detectedLanguage)
    const completeMessage = `${welcomeMessage}\n\n🔗 **${registrationText.link}:**\n${registrationUrl}\n\n⏰ ${registrationText.validity}`

    // 💾 SAVE MESSAGE TO HISTORY - Save both user message and welcome response
    try {
      await messageRepository.saveMessage({
        workspaceId: workspaceId,
        phoneNumber: phoneNumber,
        message: messageContent,
        response: completeMessage,
        direction: "INBOUND", // ✅ CORRECT: User message is INBOUND, system response is OUTBOUND
        agentSelected: "CHATBOT", // ✅ ADD: Set agentSelected to CHATBOT for green styling
        functionCallsDebug: [],
        processingSource: "new_user_welcome",
        debugInfo: JSON.stringify({
          isNewUser: true,
          detectedLanguage: detectedLanguage,
          registrationUrl: registrationUrl,
          attemptCount: attempt.attemptCount,
        }),
      })
      console.log(
        `💾 ${format}: New user welcome message saved to history for ${phoneNumber}`
      )
    } catch (saveError) {
      console.error(
        `❌ ${format}: Failed to save new user welcome message:`,
        saveError
      )
      // Continue - don't fail the whole request if save fails
    }

    console.log(
      `✅ ${format}: New user welcome message sent to ${phoneNumber} in ${detectedLanguage}`
    )
    res.status(200).json({
      success: true,
      data: {
        sessionId: null, // New users don't have a session yet
        message: completeMessage,
      },
    })

    return true // Handled successfully
  } catch (error) {
    console.error(
      `❌ ${format}: Error handling new user welcome flow for ${phoneNumber}:`,
      error
    )
    res.status(500).send("ERROR")
    return true // Error handled
  }
}

import { FaqController } from "../interfaces/http/controllers/faq.controller"
// Removed MessageController import
import { ProductController } from "../interfaces/http/controllers/product.controller"
import { ServicesController } from "../interfaces/http/controllers/services.controller"

import { UserController } from "../interfaces/http/controllers/user.controller"
// Removed WhatsAppController import
import { createAgentRouter } from "../interfaces/http/routes/agent.routes"
import { authRouter } from "../interfaces/http/routes/auth.routes"
import { cartRouter } from "../interfaces/http/routes/cart.routes"
import { categoriesRouter } from "../interfaces/http/routes/categories.routes"
import { chatRouter } from "../interfaces/http/routes/chat.routes"
import {
  customersRouter,
  workspaceCustomersRouter,
} from "../interfaces/http/routes/customers.routes"

import { faqsRouter } from "../interfaces/http/routes/faqs.routes"
import { createLanguagesRouter } from "../interfaces/http/routes/languages.routes"
// Removed messagesRouter import
import { offersRouter } from "../interfaces/http/routes/offers.routes"
import { createOrderRouter } from "../interfaces/http/routes/order.routes"
import createRegistrationRouter from "../interfaces/http/routes/registration.routes"
import { servicesRouter } from "../interfaces/http/routes/services.routes"
import createSettingsRouter from "../interfaces/http/routes/settings.routes"
import { createPushMessagingRouter } from "./push-messaging.router"
import { createPushTestingRouter } from "./push-testing.router"

import { checkoutRouter } from "../interfaces/http/routes/checkout.routes"
// Removed whatsappRouter import
import { workspaceRoutes } from "../interfaces/http/routes/workspace.routes"
// Import the legacy workspace routes that has the /current endpoint
import workspaceRoutesLegacy from "./workspace.routes"
// Add these imports for backward compatibility during migration
import { PromptsController } from "../controllers/prompts.controller"
import { SettingsController } from "../interfaces/http/controllers/settings.controller"
import { authMiddleware } from "../interfaces/http/middlewares/auth.middleware"
import { createUserRouter } from "../interfaces/http/routes/user.routes"
import createPromptsRouter from "./prompts.routes"
// Import document routes
import documentRoutes from "./documentRoutes"
// Import analytics routes
import analyticsRoutes from "./analytics.routes"
// Import internal API routes
import internalApiRoutes from "./internal-api.routes"

// Simple logging middleware
const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Request: ${req.method} ${req.originalUrl}`)

  // Track the original end method
  const originalEnd = res.end

  // Override the end method to log the response
  res.end = function () {
    logger.info(
      `Response for ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`
    )

    // Call the original end method
    return originalEnd.apply(this, arguments)
  }

  next()
}

// Log router setup
logger.info("Setting up API routes")

// Create a router instance
const router = Router()

// Add logging middleware
router.use(loggingMiddleware)

// WhatsApp webhook routes (must be FIRST, before any authentication middleware)
import { LLMService } from "../services/llm.service"
import { LLMRequest } from "../types/whatsapp.types"

// 🔧 FIX: /api/chat endpoint for WhatsApp compatibility (NO AUTHENTICATION)
router.post("/chat", async (req, res) => {
  console.log(
    "🔧 COMPATIBILITY: /api/chat called - forwarding to WhatsApp webhook logic"
  )

  // Forward to the same webhook logic
  try {
    // Initialize services
    const llmService = new LLMService()
    const messageRepository = new MessageRepository()

    // Check if this is a verification request
    if (req.query["hub.mode"] && req.query["hub.verify_token"]) {
      const mode = req.query["hub.mode"]
      const token = req.query["hub.verify_token"]
      const challenge = req.query["hub.challenge"]

      const verifyToken =
        process.env.WHATSAPP_VERIFY_TOKEN || "test-verify-token"
      if (mode === "subscribe" && token === verifyToken) {
        console.log("WhatsApp webhook verified via /api/chat")
        res.status(200).send(challenge)
        return
      }

      res.status(403).send("Verification failed")
      return
    }

    // Process as WhatsApp message - extract message from body
    const body = req.body
    console.log("🔧 /api/chat: Processing body:", JSON.stringify(body, null, 2))

    // Handle direct message format: {message: "text", phoneNumber: "+123", workspaceId: "xyz"}
    if (body?.message && body?.phoneNumber && body?.workspaceId) {
      try {
        const workspaceId = body.workspaceId
        const phoneNumber = body.phoneNumber
        const language = body.language || "it"

        // 🔧 FIX: Get customer data and process variables like webhook does
        let variables = {
          nameUser: "Cliente",
          discountUser: "Nessuno sconto attivo",
          companyName: "L'Altra Italia",
          lastorder: "Nessun ordine recente",
          lastordercode: "N/A",
          languageUser: language,
        }

        // Get customer data by phone number
        const customer = await prisma.customers.findFirst({
          where: {
            phone: phoneNumber,
            workspaceId: workspaceId,
          },
          include: {
            orders: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        })

        if (customer) {
          const lastOrder = customer.orders[0]
          variables = {
            nameUser: customer?.name || "Unknown Customer",
            discountUser: customer?.discount
              ? `${customer.discount}% di sconto attivo`
              : "Nessuno sconto attivo",
            companyName: customer?.company || "L'Altra Italia",
            lastorder: lastOrder
              ? lastOrder.createdAt.toLocaleDateString()
              : "Nessun ordine recente",
            lastordercode: lastOrder?.orderCode || "N/A",
            languageUser: customer?.language || language,
          }
        }

        // Get agent config with prompt from database
        let agentPrompt = "WhatsApp conversation" // fallback
        let agentModel = "anthropic/claude-3.5-sonnet" // fallback to Claude
        let agentMaxTokens = 5000 // fallback
        try {
          const agentConfig = await prisma.agentConfig.findFirst({
            where: { workspaceId },
          })
          if (agentConfig?.prompt) {
            agentPrompt = agentConfig.prompt
          }
          if (agentConfig?.model) {
            agentModel = agentConfig.model
          }
          if (agentConfig?.maxTokens) {
            agentMaxTokens = agentConfig.maxTokens
          }
          console.log(`🔧 /api/chat: Using agent model: ${agentModel}, maxTokens: ${agentMaxTokens}`)
        } catch (error) {
          console.error("❌ Error fetching agent config:", error)
        }

        // 🔧 CRITICAL FIX: Replace variables in prompt like webhook does
        agentPrompt = agentPrompt
          .replace(/\{\{nameUser\}\}/g, variables.nameUser)
          .replace(/\{\{discountUser\}\}/g, variables.discountUser)
          .replace(/\{\{companyName\}\}/g, variables.companyName)
          .replace(/\{\{lastorder\}\}/g, variables.lastorder)
          .replace(/\{\{lastordercode\}\}/g, variables.lastordercode)
          .replace(/\{\{languageUser\}\}/g, variables.languageUser)

        // 🔧 CRITICAL FIX: Get conversation history like webhook does
        let chatHistory: any[] = []
        try {
          if (customer?.id && workspaceId) {
            // Get recent messages for this customer (last 10 messages)
            const recentMessages = await messageRepository.getLatesttMessages(
              body.phoneNumber,
              10,
              workspaceId
            )

            chatHistory = recentMessages.map((msg) => ({
              role: msg.direction === "INBOUND" ? "user" : "assistant",
              content: msg.content,
            }))

            console.log(
              `🔍 /api/chat: Loaded ${chatHistory.length} messages from history for customer ${customer.id}`
            )
          }
        } catch (historyError) {
          console.error("❌ Error loading chat history:", historyError)
          // Continue without history if error occurs
        }

        const llmRequest: LLMRequest = {
          chatInput: body.message,
          workspaceId: body.workspaceId,
          customerid: customer?.id || "", // Use actual customer ID if found
          phone: body.phoneNumber,
          language: variables.languageUser, // Use customer's language
          sessionId: "chat-session",
          maxTokens: agentMaxTokens,
          model: agentModel, // Use agent config model instead of hardcoded
          messages: chatHistory, // 🔧 NOW INCLUDES REAL CHAT HISTORY like webhook
          prompt: agentPrompt, // 🔧 Now includes processed prompt with variables
        }

        console.log(
          `🔧 /api/chat: LLM Request customerid: "${customer?.id || ""}" for customer: ${customer?.name || "Unknown"}`
        )
        console.log(
          `🔧 /api/chat: LLM Request workspaceId: "${body.workspaceId}"`
        )

        const response = await llmService.handleMessage(llmRequest, variables)

        // Check if customer is blocked - if IGNORE is returned, stop processing completely
        if (response === "IGNORE") {
          console.log(
            "🚫 /api/chat: Customer blocked - ignoring message completely"
          )
          res.status(200).json({
            success: false,
            message: "Customer interaction not allowed",
          })
          return
        }

        // 🔧 CRITICAL FIX: Save message to database like webhook does
        try {
          if (customer?.id && workspaceId && response.success) {
            await messageRepository.saveMessage({
              workspaceId: workspaceId,
              phoneNumber: body.phoneNumber,
              message: body.message,
              response: response.output || "No response",
              direction: "INBOUND",
              processingSource: "api-chat-endpoint",
            })
            console.log(
              "💾 /api/chat: Message saved to database for conversation history"
            )
          }
        } catch (saveError) {
          console.error("❌ /api/chat: Failed to save message:", saveError)
          // Continue - don't fail the whole request if save fails
        }

        return res.json({
          ...response,
          debug: response.debugInfo, // 🔧 FIX: Map debugInfo to debug for frontend compatibility
        })
      } catch (error) {
        console.error("❌ Error in /api/chat endpoint:", error)
        return res.status(500).json({
          status: "error",
          message: "Internal server error processing chat request",
        })
      }
    }

    // If we get here, return error
    res.status(400).json({
      status: "error",
      message:
        "Invalid request format for /api/chat endpoint. Expected: {message, phoneNumber, workspaceId}",
    })
  } catch (error) {
    console.error("🔧 Error in /api/chat endpoint:", error)
    res.status(500).json({
      status: "error",
      message:
        "Sorry, there was an error processing your message. Please try again later.",
    })
  }
})

// Public WhatsApp webhook routes (NO AUTHENTICATION)
router.post("/whatsapp/webhook", async (req, res) => {
  console.log("🔥 WEBHOOK POST RECEIVED", new Date().toISOString()) // 🔧 FIRST LOG
  console.log("📨 Request body:", JSON.stringify(req.body, null, 2)) // 🔧 DEBUG BODY
  console.log("📨 Request headers:", JSON.stringify(req.headers, null, 2)) // 🔧 DEBUG HEADERS

  // 🔧 WRITE TO DEBUG FILE
  const fs = require("fs")
  const debugData = {
    timestamp: new Date().toISOString(),
    body: req.body,
    headers: req.headers,
    userAgent: req.headers["user-agent"],
  }
  fs.appendFileSync(
    "/tmp/webhook-debug.log",
    JSON.stringify(debugData, null, 2) + "\n---\n"
  )

  try {
    console.log("🚨🚨🚨 WEBHOOK: INITIALIZING LLM SERVICE")
    // Initialize services
    const llmService = new LLMService()
    const messageRepository = new MessageRepository()
    console.log("🚨🚨🚨 WEBHOOK: LLM SERVICE INITIALIZED")

    // For GET requests (verification)
    if (req.method === "GET") {
      const mode = req.query["hub.mode"]
      const token = req.query["hub.verify_token"]
      const challenge = req.query["hub.challenge"]

      const verifyToken =
        process.env.WHATSAPP_VERIFY_TOKEN || "test-verify-token"
      if (mode === "subscribe" && token === verifyToken) {
        console.log("WhatsApp webhook verified")
        res.status(200).send(challenge)
        return
      }

      res.status(403).send("Verification failed")
      return
    }

    // For POST requests (incoming messages)
    const data = req.body

    // 🔍 DETECT FORMAT: WhatsApp vs Test Format
    let phoneNumber, messageContent, workspaceId, customerId

    // Check if it's WhatsApp format
    console.log(
      "🔍 CHECKING FORMAT - WhatsApp condition:",
      !!data.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from
    )
    if (data.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from) {
      console.log("📱 USING WHATSAPP FORMAT")
      phoneNumber = data.entry[0].changes[0].value.messages[0].from
      messageContent = data.entry[0].changes[0].value.messages[0].text?.body
      workspaceId =
        process.env.WHATSAPP_WORKSPACE_ID || "cm9hjgq9v00014qk8fsdy4ujv"

      // Find customer by phone number with ALL needed data in ONE query
      try {
        console.log(
          `🔍 WHATSAPP: Looking for customer with phone="${phoneNumber}" (normalized: "${phoneNumber.replace(/\s+/g, "")}")`
        )

        const customer = await prisma.customers.findFirst({
          where: {
            phone: phoneNumber.replace(/\s+/g, ""),
            workspaceId: workspaceId,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            phone: true,
            company: true,
            discount: true,
            language: true,
          },
        })

        if (customer) {
          // ✅ BLACKLIST CHECK ENABLED - Check customer blacklist status
          const isBlacklisted = await checkCustomerBlacklist(
            phoneNumber,
            workspaceId,
            res,
            "WHATSAPP"
          )
          if (isBlacklisted) {
            return // Response already sent
          }

          customerId = customer.id
          console.log(
            `✅ WHATSAPP: Customer found: ${customer.name} (${customer.phone})`
          )
        } else {
          // 🆕 NEW USER DETECTED - Use handleNewUserWelcomeFlow for consistency
          console.log(`🆕 New user detected for phone: ${phoneNumber}`)

          // Handle new user welcome flow using the centralized function
          const handled = await handleNewUserWelcomeFlow(
            phoneNumber,
            workspaceId,
            messageContent,
            res,
            "WHATSAPP"
          )
          if (handled) {
            return // Response already sent
          }
        }

        // Store customer data for later use (avoid double query)
        if (customer) {
          ;(req as any).customerData = customer
        }
      } catch (error) {
        console.error("❌ Error finding customer:", error)
        res.status(500).send("ERROR")
        return
      }
    }
    // Check if it's frontend format (message, phoneNumber, workspaceId, isNewConversation)
    else if (data.message && data.phoneNumber && data.workspaceId) {
      messageContent = data.message
      phoneNumber = data.phoneNumber
      workspaceId = data.workspaceId

      console.log(
        `🖥️ FRONTEND FORMAT: Processing message from ${phoneNumber}: "${messageContent}"`
      )

      // Get full customer data (including language) for frontend format
      try {
        console.log(
          `🔍 FRONTEND FORMAT: Searching for customer with phone="${phoneNumber}" (normalized: "${phoneNumber.replace(/\s+/g, "")}"), workspaceId="${workspaceId}"`
        )
        const customer = await prisma.customers.findFirst({
          where: {
            phone: phoneNumber.replace(/\s+/g, ""),
            workspaceId: workspaceId,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            phone: true,
            company: true,
            discount: true,
            language: true,
            isBlacklisted: true,
          },
        })

        console.log(
          `🔍 FRONTEND FORMAT: Customer found:`,
          customer ? `${customer.name} (${customer.phone})` : "NONE"
        )

        if (customer) {
          // ✅ BLACKLIST CHECK ENABLED - Check customer blacklist status
          if (customer.isBlacklisted) {
            console.log(
              `🚫 FRONTEND FORMAT: Customer ${phoneNumber} is blacklisted - IGNORING MESSAGE`
            )
            res.status(200).json({
              success: true,
              data: {
                sessionId: null,
                message: "EVENT_RECEIVED_CUSTOMER_BLACKLISTED",
              },
            })
            return
          }

          customerId = customer.id
          console.log(
            `✅ FRONTEND FORMAT: Customer found: ${customer.name} (${customer.phone})`
          )
        } else {
          // New user - handle welcome flow
          console.log(`🆕 FRONTEND FORMAT: New user detected: ${phoneNumber}`)

          // Handle new user welcome flow (includes blocking logic)
          const handled = await handleNewUserWelcomeFlow(
            phoneNumber,
            workspaceId,
            messageContent,
            res,
            "TEST"
          )
          if (handled) {
            return // Response already sent
          }
        }
      } catch (error) {
        console.error(
          "❌ Error getting customer data in frontend format:",
          error
        )
        res.status(500).send("ERROR")
        return
      }
    }
    // Check if it's test format
    else if (data.chatInput && data.workspaceId) {
      messageContent = data.chatInput
      workspaceId = data.workspaceId

      // For test format, use phone number if provided, otherwise use test phone
      phoneNumber = data.phone || "test-phone-123"

      // Get full customer data (including language) for test format
      try {
        // console.log(`🔍 TEST FORMAT: Looking for customer with phone: "${phoneNumber}" in workspace: "${workspaceId}"`);

        const customer = await prisma.customers.findFirst({
          where: {
            phone: phoneNumber.replace(/\s+/g, ""),
            workspaceId: workspaceId,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            phone: true,
            company: true,
            discount: true,
            language: true,
          },
        })

        // console.log(`🔍 TEST FORMAT: Customer search result:`, customer);

        if (customer) {
          // ✅ BLACKLIST CHECK ENABLED - Check customer blacklist status
          const isBlacklisted = await checkCustomerBlacklist(
            phoneNumber,
            workspaceId,
            res,
            "TEST"
          )
          if (isBlacklisted) {
            return // Response already sent
          }

          phoneNumber = customer.phone || "test-phone-123"
          console.log(
            `✅ TEST: Customer found: ${customer.name} (${customer.phone}) - Language: ${customer.language}`
          )

          // Store customer data for later use
          ;(req as any).customerData = customer
        } else {
          // 🆕 NEW USER DETECTED IN TEST FORMAT - Use handleNewUserWelcomeFlow for consistency
          console.log(
            `🆕 TEST FORMAT: New user detected for phone: ${phoneNumber}`
          )

          // Handle new user welcome flow using the centralized function
          const handled = await handleNewUserWelcomeFlow(
            phoneNumber,
            workspaceId,
            messageContent,
            res,
            "TEST"
          )
          if (handled) {
            return // Response already sent
          }
        }
      } catch (error) {
        console.error("❌ Error getting customer data in test format:", error)
        res.status(500).send("ERROR")
        return
      }
    }
    // Invalid format
    else {
      res.status(200).send("OK")
      return
    }

    // 🔧 DECLARE CHAT SESSION FOR GLOBAL SCOPE (used throughout the webhook)
    let chatSession: any = null

    // 🚨 SPAM DETECTION - Check for spam behavior (50 messages in 60 seconds)
    try {
      const spamDetectionService = new SpamDetectionService()
      const spamResult = await spamDetectionService.checkSpamBehavior(
        phoneNumber,
        workspaceId
      )

      if (spamResult.isSpam) {
        console.log(
          `🚨 SPAM DETECTED: ${phoneNumber} sent ${spamResult.messageCount} messages in ${spamResult.timeWindow} seconds`
        )

        // Block the spam user
        await spamDetectionService.blockSpamUser(
          phoneNumber,
          workspaceId,
          spamResult.reason || "Spam behavior detected"
        )

        // 🚨 SPAM DETECTION ENABLED - Block spam users
        res.status(200).json({
          success: true,
          data: {
            sessionId: null,
            message: "EVENT_RECEIVED_CUSTOMER_BLACKLISTED",
          },
        })
        return
      }
    } catch (spamError) {
      console.error("❌ Error in spam detection:", spamError)
      // Continue processing if spam detection fails
    }

    // Check if chat session is disabled (operator escalation)
    let isSessionDisabled = false
    try {
      const activeSession = await prisma.chatSession.findFirst({
        where: {
          customerId: customerId,
          workspaceId: workspaceId,
          status: "operator_escalated",
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      if (activeSession) {
        isSessionDisabled = true
      }
    } catch (sessionError) {
      console.error("❌ Error checking session status:", sessionError)
      // Continue with normal processing if check fails
    }

    let result
    let llmRequest: LLMRequest | null = null

    if (isSessionDisabled) {
      // Session disabled - send operator message
      result = {
        success: true,
        output:
          "Un operatore ti contatterà al più presto. Nel frattempo, il chatbot è temporaneamente disabilitato per questa conversazione. Grazie per la tua pazienza! 🤝",
      }
    } else {
      // Session active - setup LLM system

      // Initialize variables with defaults
      let variables = {
        nameUser: "Cliente",
        discountUser: "Nessuno sconto attivo",
        companyName: "L'Altra Italia",
        lastorder: "Nessun ordine recente",
        lastordercode: "N/A",
        languageUser: "it",
      }

      // Get agent config with prompt from database
      let agentPrompt = "WhatsApp conversation" // fallback
      let welcomeBackMessage = null // 🎯 TASK: Declare welcome back message variable
      let agentModel = "anthropic/claude-3.5-sonnet" // fallback to Claude
      let agentMaxTokens = 5000 // fallback
      try {
        const agentConfig = await prisma.agentConfig.findFirst({
          where: { workspaceId: workspaceId },
        })
        if (agentConfig && agentConfig.prompt) {
          agentPrompt = agentConfig.prompt
        }
        if (agentConfig?.model) {
          agentModel = agentConfig.model
        }
        if (agentConfig?.maxTokens) {
          agentMaxTokens = agentConfig.maxTokens
        }
        console.log(`🔧 WEBHOOK: Using agent model: ${agentModel}, maxTokens: ${agentMaxTokens}`)

        // Use customer data from first query (avoid double query)
        const customer = (req as any).customerData
        // console.log('🔍 Customer data for variables:', customer);

        // Get last order
        const lastOrder = await prisma.orders.findFirst({
          where: {
            customerId: customerId,
            workspaceId: workspaceId,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            orderCode: true,
            createdAt: true,
          },
        })

        // Prepare variables for replacement
        variables = {
          nameUser: customer?.name || "Unknown Customer",
          discountUser: customer?.discount
            ? `${customer.discount}% di sconto attivo`
            : "Nessuno sconto attivo",
          companyName: customer?.company || "L'Altra Italia",
          lastorder: lastOrder
            ? lastOrder.createdAt.toLocaleDateString()
            : "Nessun ordine recente",
          lastordercode: lastOrder?.orderCode || "N/A",
          languageUser: customer?.language || "it",
        }

        // 🎯 TASK: Check if customer has recent activity for "Bentornato {NOME}" functionality
        try {
          const messageRepository = new MessageRepository()
          const hasRecentActivity = await messageRepository.hasRecentActivity(
            customerId,
            2,
            workspaceId
          )

          if (!hasRecentActivity) {
            // Customer hasn't been active in last 2 hours - show welcome back message
            welcomeBackMessage = await messageRepository.getWelcomeBackMessage(
              workspaceId,
              customer?.name || "Cliente",
              customer?.language || "it"
            )
            console.log(
              `👋 WELCOME BACK: Customer ${customer?.name} returning after >2 hours - message: ${welcomeBackMessage}`
            )
          } else {
            console.log(
              `👋 WELCOME BACK: Customer ${customer?.name} has recent activity - no welcome back needed`
            )
          }
        } catch (welcomeBackError) {
          console.error(
            "❌ Error checking welcome back status:",
            welcomeBackError
          )
          // Continue without welcome back message if error occurs
        }

        // console.log('✅ Variables prepared:', variables);
        // console.log(`🌐 WEBHOOK DEBUG: Customer language is "${customer?.language}", setting languageUser to "${variables.languageUser}"`);

        // Replace variables in prompt
        agentPrompt = agentPrompt
          .replace(/\{\{nameUser\}\}/g, variables.nameUser)
          .replace(/\{\{discountUser\}\}/g, variables.discountUser)
          .replace(/\{\{companyName\}\}/g, variables.companyName)
          .replace(/\{\{lastorder\}\}/g, variables.lastorder)
          .replace(/\{\{lastordercode\}\}/g, variables.lastordercode)
          .replace(/\{\{languageUser\}\}/g, variables.languageUser)

        // console.log(`🌐 WEBHOOK DEBUG: Prompt after language substitution contains: ${agentPrompt.includes('languageUser: en') ? 'YES' : 'NO'} "languageUser: en"`);
      } catch (error) {
        console.error("❌ Error processing customer data:", error)
      }

      // console.log(`🔍 STARTING CHAT HISTORY RETRIEVAL - Customer: ${customerId}, Workspace: ${workspaceId}`); // 🔧 MOVED OUTSIDE TRY-CATCH

      //  RETRIEVE CHAT HISTORY FOR CONTEXT
      let chatHistory: any[] = []
      try {
        // console.log(`🔍 SEARCHING FOR CHAT SESSION - Customer: ${customerId}, Workspace: ${workspaceId}`); // 🔧 DEBUG

        // Find or create chat session
        chatSession = await prisma.chatSession.findFirst({
          where: {
            customerId: customerId,
            workspaceId: workspaceId,
            status: "active", // 🔧 FIX: Only find active sessions
          },
          include: {
            messages: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Only messages from last 24 hours
                },
              },
              orderBy: {
                createdAt: "asc",
              },
              take: 10, // Last 10 messages for context
            },
          },
        })

        // 🔧 CREATE CHAT SESSION IF NOT EXISTS
        if (!chatSession) {
          // console.log('🔧 Creating new chat session for customer:', customerId);
          chatSession = await prisma.chatSession.create({
            data: {
              customerId: customerId,
              workspaceId: workspaceId,
              status: "ACTIVE",
              startedAt: new Date(),
            },
            include: {
              messages: {
                orderBy: {
                  createdAt: "asc",
                },
                take: 10,
              },
            },
          })
        }

        if (chatSession && chatSession.messages.length > 0) {
          // Convert messages to OpenAI format
          chatHistory = chatSession.messages.map((msg) => ({
            role: msg.direction === "INBOUND" ? "user" : "assistant",
            content: msg.content,
          }))
          // console.log(`🗨️ WEBHOOK: Retrieved ${chatHistory.length} messages from chat history (last 24h only)`);
          // console.log(`🗨️ WEBHOOK: Chat history preview:`, chatHistory.slice(-3)); // Last 3 messages
          // console.log(`⏰ WEBHOOK: Time filter applied - excluding messages older than 24 hours`);
          // console.log(`🔍 WEBHOOK: Full chat history:`, JSON.stringify(chatHistory, null, 2)); // 🔧 FULL DEBUG
        } else {
          // console.log('🗨️ WEBHOOK: No chat history found, starting fresh conversation');
          // console.log(`🗨️ WEBHOOK: Customer ID: ${customerId}, Workspace ID: ${workspaceId}`);
          // console.log(`🔍 WEBHOOK: ChatSession exists: ${!!chatSession}, Messages count: ${chatSession?.messages?.length || 0}`); // 🔧 DEBUG
        }

        // 💾 NOTE: User message will be saved AFTER LLM processing by messageRepository.saveMessage()
        // This avoids duplicate message saving in the database
        console.log(
          "� WEBHOOK: Skipping immediate user message save to avoid duplication"
        )
        console.log(
          "� WEBHOOK: User message will be saved by messageRepository.saveMessage() after LLM processing"
        )
      } catch (historyError) {
        console.error("❌ Error retrieving chat history:", historyError)
        // Continue without history if error occurs
      }

      llmRequest = {
        chatInput: messageContent,
        workspaceId: workspaceId,
        customerid: customerId,
        phone: phoneNumber.replace(/\s+/g, ""),
        language: variables.languageUser,
        sessionId: "webhook-session",
        temperature: 0.0, // Zero temperature for webhook responses - no variations
        maxTokens: agentMaxTokens, // Use agent config maxTokens instead of hardcoded
        model: agentModel, // Use agent config model instead of hardcoded
        messages: chatHistory, // 🔥 NOW INCLUDES REAL CHAT HISTORY
        prompt: agentPrompt,
        welcomeBackMessage: welcomeBackMessage || null, // 🎯 TASK: Pass welcome back message to LLM
      }

      console.log(
        `🔧 WEBHOOK: LLM Request customerid: "${customerId}" workspaceId: "${workspaceId}"`
      )

      // Process with LLM service
      console.log(
        "🚀 WEBHOOK: About to call LLM service with input:",
        messageContent
      )
      result = await llmService.handleMessage(llmRequest, variables)

      // Check if customer is blocked - if IGNORE is returned, save user message but don't process response
      if (result === "IGNORE") {
        console.log(
          "🚫 WEBHOOK: Customer blocked - saving user message only, no bot response"
        )

        // Save ONLY the user message to keep conversation history
        await messageRepository.saveMessage({
          workspaceId: workspaceId,
          phoneNumber: phoneNumber,
          message: messageContent,
          response: null, // No bot response when blocked
          direction: "INBOUND",
          agentSelected: "CUSTOMER_BLOCKED",
          processingSource: "blocked-customer-no-response",
        })

        console.log(
          "💾 WEBHOOK: User message saved, waiting for human operator response"
        )

        // Check if this is a frontend call (has isNewConversation or workspaceId)
        if (data.message && data.phoneNumber && data.workspaceId) {
          // Frontend call - return success but no message displayed (customer waits for operator)
          const blockedResponse = {
            success: true,
            message: "Message received, waiting for operator",
            data: {
              message: "", // Empty message so frontend doesn't show anything
              output: "", // Empty output
              isWaitingForOperator: true,
              customerId: customerId,
              sessionId: `session-${Date.now()}`,
            },
          }

          console.log(
            "🚫 WEBHOOK: Sending blocked customer response:",
            JSON.stringify(blockedResponse, null, 2)
          )
          res.status(200).json(blockedResponse)
        } else {
          // WhatsApp webhook - return plain OK (no message sent back)
          res.status(200).send("OK")
        }
        return
      }

      console.log("🚀 WEBHOOK: LLM result received:", {
        success: result.success,
        hasOutput: !!result.output,
        translatedQuery: result.translatedQuery,
        outputLength: result.output?.length || 0,
        functionCallsCount: result.functionCalls?.length || 0,
        functionCallsContent: JSON.stringify(result.functionCalls, null, 2),
        debugInfo: result.debugInfo,
      })
    }

    // Save message and track usage
    if (result.success && result.output) {
      try {
        // 💰 Calculate LLM cost for this response
        const llmCost = config.llm.defaultPrice // €0.50 per LLM response

        // Get current total usage for this workspace
        const usageSummary = await usageService.getUsageSummary(workspaceId, 30)
        const currentTotalUsage = usageSummary.totalCost
        const newTotalUsage = currentTotalUsage + llmCost

        await messageRepository.saveMessage({
          workspaceId: workspaceId,
          phoneNumber: phoneNumber,
          message: messageContent,
          response: result.output,
          direction: "INBOUND",
          agentSelected: "CHATBOT_LLM",
          // 🔧 Debug data persistence
          translatedQuery: result.translatedQuery,
          processedPrompt: result.processedPrompt,
          functionCallsDebug: result.functionCalls,
          processingSource: result.functionCalls?.[0]?.source || "unknown",
          debugInfo: JSON.stringify({
            ...(result.debugInfo || {}),
            // 💰 Cost tracking info
            currentCallCost: llmCost,
            previousTotalUsage: currentTotalUsage,
            newTotalUsage: newTotalUsage,
            costTimestamp: new Date().toISOString(),
          }),
        })

        // 💰 Track usage for registered customers only
        if (customerId && customerId !== "unknown") {
          await usageService.trackUsage({
            workspaceId: workspaceId,
            clientId: customerId,
            price: llmCost,
          })
          console.log(
            `💰 Usage tracked: €${llmCost} for customer ${customerId} (Total: €${newTotalUsage.toFixed(2)})`
          )
        } else {
          console.log(
            `💰 Usage not tracked: customer not registered (Cost would be: €${llmCost})`
          )
        }

        // 💾 SAVE MESSAGE RESPONSE - handled by messageRepository.saveMessage() above
        // Assistant response is already saved by messageRepository.saveMessage()
        console.log(
          "💾 Message and assistant response saved by messageRepository.saveMessage()"
        )
      } catch (saveError) {
        console.error("❌ Failed to save message:", saveError)
        // Continue - don't fail the whole request if save fails
      }
    }

    // TODO: Send response back to WhatsApp

    res.json({
      success: true,
      data: {
        sessionId: chatSession?.id || null,
        message: result.output,
      },
      debug: {
        translatedQuery: result.translatedQuery,
        processedPrompt: result.processedPrompt,
        functionCalls: result.functionCalls || [],
        // Unisco tutte le proprietà di debugInfo (model, effectiveParams, ecc)
        ...(result.debugInfo && typeof result.debugInfo === "object"
          ? result.debugInfo
          : {}),
        // 💰 Cost tracking info
        costInfo:
          result.success && result.output
            ? {
                currentCallCost: config.llm.defaultPrice,
                previousTotalUsage: result.debugInfo?.previousTotalUsage || 0,
                newTotalUsage:
                  result.debugInfo?.newTotalUsage || config.llm.defaultPrice,
                costTimestamp: new Date().toISOString(),
              }
            : null,
      },
    })
  } catch (error) {
    console.error("❌ WHATSAPP WEBHOOK ERROR:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
})

router.get("/whatsapp/webhook", async (req, res) => {
  // Same logic as POST for verification
  const mode = req.query["hub.mode"]
  const token = req.query["hub.verify_token"]
  const challenge = req.query["hub.challenge"]

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "test-verify-token"
  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp webhook verified")
    res.status(200).send(challenge)
    return
  }

  res.status(403).send("Verification failed")
})

logger.info(
  "Registered WhatsApp webhook routes FIRST (public, no authentication)"
)

// Mount internal API routes (for N8N calling functions) - NO AUTHENTICATION REQUIRED
router.use("/internal", internalApiRoutes)
logger.info("Registered internal API routes for N8N integration (public)")

// Debug middleware removed - TypeScript errors fixed

// Initialize Prisma client
const prisma = new PrismaClient()

// Initialize services
const userService = new UserService(prisma)
const otpService = new OtpService(prisma)
const passwordResetService = new PasswordResetService(prisma)

// Create controllers in advance
const customersController = new CustomersController()
const servicesController = new ServicesController()

const categoryController = new CategoryController()

const chatController = new ChatController()
// Removed messageController
const productController = new ProductController()
const userController = new UserController(userService)
const authController = new AuthController(
  userService,
  otpService,
  passwordResetService
)
const promptsController = new PromptsController()
const faqController = new FaqController()
// Removed whatsappController

// Initialize Settings controller for GDPR routes
const settingsController = new SettingsController()

// Public routes (MUST BE BEFORE AUTH ROUTES)
router.use("/checkout", checkoutRouter)
logger.info("Registered checkout routes for order processing")

router.use("/cart", cartRouter)
logger.info("Registered cart routes for shopping cart operations")

router.use("/auth", authRouter(authController))
router.use("/registration", createRegistrationRouter())
router.use("/chat", chatRouter(chatController))
// Removed messages route
router.use("/push", createPushMessagingRouter())
logger.info(
  "Registered push messaging routes for centralized push notifications"
)
router.use("/admin", createPushTestingRouter())
logger.info("Registered push testing routes for admin dashboard")
router.use("/users", createUserRouter())
// Mount customer routes on both legacy and workspace paths to ensure backward compatibility
router.use("/", customersRouter(customersController))
// Utilizziamo il router specifico per workspaces
router.use("/workspaces", workspaceCustomersRouter(customersController))
// Mount workspace routes (includes the /current endpoint) with authentication FIRST
router.use("/workspaces", authMiddleware, workspaceRoutesLegacy)
router.use("/workspaces", workspaceRoutes)
// Mount agent routes with workspace parameter properly configured
router.use(
  "/workspaces/:workspaceId/agent",
  (req, res, next) => {
    // Ensure workspaceId is available in params
    if (req.params.workspaceId) {
      logger.debug(
        `Agent route: workspaceId from params: ${req.params.workspaceId}`
      )
    }
    next()
  },
  createAgentRouter()
)
logger.info("Registered agent router with workspace routes only")

// Add a simple test route to debug workspace ID extraction
router.get("/workspaces/:workspaceId/test", authMiddleware, (req, res) => {
  res.json({
    success: true,
    workspaceId: req.params.workspaceId,
    originalUrl: req.originalUrl,
    params: req.params,
    user: req.user ? { userId: (req.user as any).userId } : null,
  })
})

// For backward compatibility during migration
router.use("/prompts", createPromptsRouter(promptsController))

// Mount products routes with workspace context
import productsRouter from "../interfaces/http/routes/products.routes"
const productsRouterInstance = productsRouter()
router.use("/workspaces/:workspaceId/products", productsRouterInstance)
logger.info("Registered products router with workspace routes")

// Mount categories routes
const categoriesRouterInstance = categoriesRouter()
router.use("/workspaces/:workspaceId/categories", categoriesRouterInstance)
router.use("/categories", categoriesRouterInstance)
logger.info("Registered categories router with workspace routes")

// Mount services routes
const servicesRouterInstance = servicesRouter(servicesController)
router.use("/workspaces/:workspaceId/services", servicesRouterInstance)
// router.use("/services", servicesRouterInstance) // REMOVED: legacy route, now only workspace scoped
logger.info("Registered services router with workspace routes")

// Mount FAQs router
const faqsRouterInstance = faqsRouter()
router.use("/workspaces/:workspaceId/faqs", faqsRouterInstance)
router.use("/faqs", faqsRouterInstance)
logger.info("Registered FAQs router with workspace routes")

router.use("/settings", createSettingsRouter())
router.use("/languages", createLanguagesRouter())

// Mount offers routes
const offersRouterInstance = offersRouter()
router.use("/workspaces/:workspaceId/offers", offersRouterInstance)
router.use("/offers", offersRouterInstance)
logger.info("Registered offers router with workspace routes")

// Mount orders routes
const ordersRouterInstance = createOrderRouter()
router.use("/workspaces/:workspaceId/orders", ordersRouterInstance)
router.use("/orders", ordersRouterInstance)
logger.info("Registered orders router with workspace routes")

// Mount public orders routes (JWT-based)
import ordersPublicRoutes from "../interfaces/http/routes/orders.routes"
router.use("/orders", ordersPublicRoutes)
logger.info("Registered public orders routes with JWT authentication")

// Mount document routes with debug middleware
router.use(
  "/workspaces/:workspaceId/documents",
  (req, res, next) => {
    logger.info("=== DOCUMENT ROUTES DEBUG ===")
    logger.info("URL:", req.originalUrl)
    logger.info("Method:", req.method)
    logger.info("Params:", req.params)
    logger.info("WorkspaceId:", req.params.workspaceId)
    next()
  },
  documentRoutes
)
logger.info("Registered document router with workspace and upload endpoints")

// Mount analytics routes
router.use("/analytics", analyticsRoutes)
logger.info("Registered analytics routes for dashboard metrics")

// Add special route for GDPR default content (to handle frontend request to /gdpr/default)
router.get(
  "/gdpr/default",
  authMiddleware,
  settingsController.getDefaultGdprContent.bind(settingsController)
)
logger.info("Registered /gdpr/default route for backward compatibility")

// Mount Swagger documentation
router.get("/docs/swagger.json", (req, res) => {
  try {
    const { swaggerSpec } = require("../config/swagger")
    res.setHeader("Content-Type", "application/json")
    res.json(swaggerSpec)
  } catch (error) {
    logger.error("Error serving swagger.json:", error)
    res.status(500).json({ error: "Failed to load swagger documentation" })
  }
})

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    apiVersion: "v1",
  })
})

// Simple test route for workspace agent debugging
router.get("/workspaces/:workspaceId/agent-test", (req, res) => {
  res.json({
    success: true,
    message: "Test route working",
    workspaceId: req.params.workspaceId,
    originalUrl: req.originalUrl,
    params: req.params,
  })
})

logger.info("API routes setup complete")

export default router
