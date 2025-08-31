import { PrismaClient } from "@prisma/client"
import { NextFunction, Request, Response, Router } from "express"
import { OtpService } from "../application/services/otp.service"
import { PasswordResetService } from "../application/services/password-reset.service"
import { UserService } from "../application/services/user.service"
import { AuthController } from "../interfaces/http/controllers/auth.controller"
import { CategoryController } from "../interfaces/http/controllers/category.controller"
import { ChatController } from "../interfaces/http/controllers/chat.controller"
import { CustomersController } from "../interfaces/http/controllers/customers.controller"
import logger from "../utils/logger"

import { FaqController } from "../interfaces/http/controllers/faq.controller"
// Removed MessageController import
import { ProductController } from "../interfaces/http/controllers/product.controller"
import { ServicesController } from "../interfaces/http/controllers/services.controller"

import { UserController } from "../interfaces/http/controllers/user.controller"
// Removed WhatsAppController import
import { createAgentRouter } from "../interfaces/http/routes/agent.routes"
import { authRouter } from "../interfaces/http/routes/auth.routes"
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
// Import internal API routes for N8N integration
import { internalApiRoutes } from "../interfaces/http/routes/internal-api.routes"
// Import analytics routes
import analyticsRoutes from "./analytics.routes"

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
import { MessageRepository } from '../repositories/message.repository'
import { DualLLMService } from '../services/dual-llm.service'
import { LLMRequest } from '../types/whatsapp.types'

// Public WhatsApp webhook routes (NO AUTHENTICATION)
router.post("/whatsapp/webhook", async (req, res) => {
  try {
    console.log('🚨🚨🚨 WHATSAPP WEBHOOK - DUAL LLM SYSTEM!!! 🚨🚨🚨');
    
    // Initialize services
    const dualLLMService = new DualLLMService();
    const messageRepository = new MessageRepository();
    
    // For GET requests (verification)
    if (req.method === "GET") {
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
      return
    }

    // For POST requests (incoming messages)
    const data = req.body
    console.log("WhatsApp webhook received", { data })

    // 🔍 DETECT FORMAT: WhatsApp vs Test Format
    let phoneNumber, messageContent, workspaceId, customerId, customer = null;
    
    // Check if it's WhatsApp format
    if (data.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from) {
      console.log("📱 WhatsApp format detected");
      phoneNumber = data.entry[0].changes[0].value.messages[0].from;
      messageContent = data.entry[0].changes[0].value.messages[0].text?.body;
      workspaceId = process.env.WHATSAPP_WORKSPACE_ID || "cm9hjgq9v00014qk8fsdy4ujv";
      
      // Find customer by phone number
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        customer = await prisma.customers.findFirst({
          where: {
            phone: phoneNumber,
            workspaceId: workspaceId,
            isActive: true
          },
          select: {
            id: true,
            name: true,
            phone: true,
            discount: true,
            language: true
          }
        });

        if (customer) {
          customerId = customer.id;
          console.log(`✅ Customer found: ${customer.name} (${customer.id})`);
        } else {
          console.log(`⚠️ No customer found for phone: ${phoneNumber}`);
          customerId = "test-customer-123";
        }
      } catch (error) {
        console.error('❌ Error finding customer:', error);
        customerId = "test-customer-123";
      }
    }
    // Check if it's test format
    else if (data.chatInput && data.customerid && data.workspaceId) {
      console.log("🧪 Test format detected");
      phoneNumber = "test-phone-123";
      messageContent = data.chatInput;
      workspaceId = data.workspaceId;
      customerId = data.customerid;
    }
    // Invalid format
    else {
      console.log("❌ Invalid format - no valid message found");
      res.status(200).send("OK")
      return
    }

    console.log(`📱 Processing message: "${messageContent}" from ${customerId}`)

    // 🔍 CHECK IF CHAT SESSION IS DISABLED (OPERATOR ESCALATION) - PRIMA DI TUTTO
    let isSessionDisabled = false;
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const activeSession = await prisma.chatSession.findFirst({
        where: {
          customerId: customerId,
          workspaceId: workspaceId,
          status: 'operator_escalated'
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      if (activeSession) {
        isSessionDisabled = true;
        console.log(`🚨 CHAT SESSION DISABLED: Session ${activeSession.id} is in 'operator_escalated' status`);
      }
      
      await prisma.$disconnect();
    } catch (sessionError) {
      console.error('❌ Error checking session status:', sessionError);
      // Continue with normal processing if check fails
    }

    let result;
    let llmRequest: LLMRequest | null = null;
    
    if (isSessionDisabled) {
      // 🚨 SESSION DISABLED - SEND OPERATOR MESSAGE IMMEDIATELY
      console.log('🚨 SESSION DISABLED - Sending operator escalation message immediately');
      result = {
        success: true,
        output: "Un operatore ti contatterà al più presto. Nel frattempo, il chatbot è temporaneamente disabilitato per questa conversazione. Grazie per la tua pazienza! 🤝"
      };
    } else {
      // ✅ SESSION ACTIVE - SETUP DUAL LLM SYSTEM
      console.log('✅ SESSION ACTIVE - Setting up dual LLM system');
      
      // Get agent config with prompt from database
      let agentPrompt = "WhatsApp conversation"; // fallback
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const agentConfig = await prisma.agentConfig.findFirst({
          where: { workspaceId: workspaceId }
        });
        if (agentConfig && agentConfig.prompt) {
          agentPrompt = agentConfig.prompt;
          console.log('✅ Using prompt from database');
        } else {
          console.log('⚠️ No agent config found, using fallback prompt');
        }
      } catch (error) {
        console.error('❌ Error getting agent config:', error);
      }
      
      llmRequest = {
        chatInput: messageContent,
        workspaceId: workspaceId,
        customerid: customerId,
        phone: phoneNumber,
        language: "it",
        sessionId: "webhook-session",
        temperature: 0.0,
        maxTokens: 3500,
        model: "gpt-4o",
        messages: data.messages || [],
        prompt: agentPrompt,
        customer: customer // 🔧 Pass customer data for prompt personalization
      };
      
      // ✅ SESSION ACTIVE - PROCESS WITH DUAL LLM
      console.log('🚀 CALLING DUAL LLM SERVICE!!!');
      result = await dualLLMService.processMessage(llmRequest);
      console.log('✅ DUAL LLM RESULT:', result);
    }
    
    // 💾 SAVE MESSAGE AND TRACK USAGE (Critical fix for missing history/analytics)
    if (result.success && result.output) {
      try {
        console.log('💾 Saving message to database with usage tracking...');
        await messageRepository.saveMessage({
          workspaceId: workspaceId,
          phoneNumber: phoneNumber,
          message: messageContent,
          response: result.output,
          direction: "INBOUND",
          agentSelected: "CHATBOT_DUAL_LLM",
          // 🔧 Debug data persistence
          translatedQuery: result.translatedQuery,
          functionCallsDebug: result.functionCalls,
          processingSource: result.functionCalls?.[0]?.source || 'unknown'
        });
        console.log('✅ Message saved successfully with usage tracking');
      } catch (saveError) {
        console.error('❌ Failed to save message:', saveError);
        // Continue - don't fail the whole request if save fails
      }
    }
    
    // TODO: Send response back to WhatsApp
    console.log('📤 Response to send:', result.output);
    console.log('🔧 DEBUG: processedPrompt in result:', result.processedPrompt);
    console.log('🔧 DEBUG: result keys:', Object.keys(result));
    
    res.json({ 
      success: true, 
      message: result.output,
      data: {
        processedMessage: result.output,
        processedPrompt: result.processedPrompt, // 🔧 Add processedPrompt to response
        functionCalls: result.functionCalls,
        translatedQuery: result.translatedQuery
      },
      debug: { result }
    });
  } catch (error) {
    console.error('❌ WHATSAPP WEBHOOK ERROR:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

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
});

logger.info("Registered WhatsApp webhook routes FIRST (public, no authentication)")

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

// Public routes
router.use("/auth", authRouter(authController))
router.use("/registration", createRegistrationRouter())
router.use("/chat", chatRouter(chatController))
// Removed messages route
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

// Mount internal API routes for N8N integration
router.use("/internal", internalApiRoutes)
logger.info("Registered internal API routes for N8N integration")

// Mount analytics routes
router.use("/analytics", analyticsRoutes)
logger.info("Registered analytics routes for dashboard metrics")

// Mount checkout routes (public - no auth required)
router.use("/checkout", checkoutRouter)
logger.info("Registered checkout routes for order processing")

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
