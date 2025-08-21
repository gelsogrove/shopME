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
import { MessageController } from "../interfaces/http/controllers/message.controller"
import { ProductController } from "../interfaces/http/controllers/product.controller"
import { ServicesController } from "../interfaces/http/controllers/services.controller"

import { UserController } from "../interfaces/http/controllers/user.controller"
import { WhatsAppController } from "../interfaces/http/controllers/whatsapp.controller"
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
import { messagesRouter } from "../interfaces/http/routes/messages.routes"
import { offersRouter } from "../interfaces/http/routes/offers.routes"
import { createOrderRouter } from "../interfaces/http/routes/order.routes"
import createRegistrationRouter from "../interfaces/http/routes/registration.routes"
import { servicesRouter } from "../interfaces/http/routes/services.routes"
import createSettingsRouter from "../interfaces/http/routes/settings.routes"

import { checkoutRouter } from "../interfaces/http/routes/checkout.routes"
import { whatsappRouter } from "../interfaces/http/routes/whatsapp.routes"
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
const messageController = new MessageController()
const productController = new ProductController()
const userController = new UserController(userService)
const authController = new AuthController(
  userService,
  otpService,
  passwordResetService
)
const promptsController = new PromptsController()
const faqController = new FaqController()
const whatsappController = new WhatsAppController()

// Initialize Settings controller for GDPR routes
const settingsController = new SettingsController()

// Public routes
router.use("/auth", authRouter(authController))
router.use("/registration", createRegistrationRouter())
router.use("/chat", chatRouter(chatController))
router.use("/messages", messagesRouter(messageController))
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

// Mount WhatsApp router
const whatsappInstance = whatsappRouter(whatsappController)
// Mount all whatsapp routes (webhook routes are now defined in app.ts)
router.use("/whatsapp", whatsappInstance)
logger.info("Registered WhatsApp router with auth-protected endpoints")



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
