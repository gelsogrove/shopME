import { PrismaClient } from "@prisma/client"
import { NextFunction, Request, Response, Router } from "express"
import { OtpService } from "../application/services/otp.service"
import { PasswordResetService } from "../application/services/password-reset.service"
import { UserService } from "../application/services/user.service"
import { AuthController } from "../interfaces/http/controllers/auth.controller"
import { CategoryController } from "../interfaces/http/controllers/category.controller"
import { ChatController } from "../interfaces/http/controllers/chat.controller"
import { CustomersController } from "../interfaces/http/controllers/customers.controller"
import { EventsController } from "../interfaces/http/controllers/events.controller"
import { FaqController } from "../interfaces/http/controllers/faq.controller"
import { MessageController } from "../interfaces/http/controllers/message.controller"
import { ProductController } from "../interfaces/http/controllers/product.controller"
import { ServicesController } from "../interfaces/http/controllers/services.controller"
import { SuppliersController } from "../interfaces/http/controllers/suppliers.controller"
import { UserController } from "../interfaces/http/controllers/user.controller"
import { createAgentRouter } from "../interfaces/http/routes/agent.routes"
import { authRouter } from "../interfaces/http/routes/auth.routes"
import { categoriesRouter } from "../interfaces/http/routes/categories.routes"
import { chatRouter } from "../interfaces/http/routes/chat.routes"
import { customersRouter } from "../interfaces/http/routes/customers.routes"
import { eventsRouter } from "../interfaces/http/routes/events.routes"
import { faqsRouter } from "../interfaces/http/routes/faqs.routes"
import { createLanguagesRouter } from "../interfaces/http/routes/languages.routes"
import { messagesRouter } from "../interfaces/http/routes/messages.routes"
import { offersRouter } from "../interfaces/http/routes/offers.routes"
import setupProductRoutes from "../interfaces/http/routes/products.routes"
import createRegistrationRouter from "../interfaces/http/routes/registration.routes"
import { servicesRouter } from "../interfaces/http/routes/services.routes"
import createSettingsRouter from "../interfaces/http/routes/settings.routes"
import { suppliersRouter } from "../interfaces/http/routes/suppliers.routes"
import { createUploadRouter } from "../interfaces/http/routes/upload.routes"
import { createUserRouter } from "../interfaces/http/routes/user.routes"
import { workspaceRoutes } from "../interfaces/http/routes/workspace.routes"
import logger from "../utils/logger"
// Add these imports for backward compatibility during migration
import { PromptsController } from "../controllers/prompts.controller"
import createPromptsRouter from "./prompts.routes"

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

// Initialize Prisma client
const prisma = new PrismaClient()

// Initialize services
const userService = new UserService(prisma)
const otpService = new OtpService(prisma)
const passwordResetService = new PasswordResetService(prisma)

// Create controllers in advance
const customersController = new CustomersController()
const servicesController = new ServicesController()
const eventsController = new EventsController()
const categoryController = new CategoryController()
const suppliersController = new SuppliersController()
const chatController = new ChatController()
const messageController = new MessageController()
const productController = new ProductController()
const userController = new UserController(userService)
const authController = new AuthController(userService, otpService, passwordResetService)
const promptsController = new PromptsController()
const faqController = new FaqController()

// Public routes
router.use("/auth", authRouter(authController))
router.use("/registration", createRegistrationRouter())
router.use("/chat", chatRouter(chatController))
router.use("/messages", messagesRouter(messageController))
router.use("/users", createUserRouter())
router.use("/workspaces", customersRouter(customersController))
router.use("/workspaces", workspaceRoutes)
router.use("/agent", createAgentRouter())
router.use("/workspaces/:workspaceId/agent", createAgentRouter())

// For backward compatibility during migration
router.use("/prompts", createPromptsRouter(promptsController))

// Mount products routes (new DDD standardized version)
const productsRouterInstance = setupProductRoutes()
router.use("/", productsRouterInstance)
logger.info("Registered products router with new DDD architecture")

// Mount categories routes
const categoriesRouterInstance = categoriesRouter()
router.use("/workspaces/:workspaceId/categories", categoriesRouterInstance)
router.use("/categories", categoriesRouterInstance)
logger.info("Registered categories router with workspace routes")

// Mount services routes
const servicesRouterInstance = servicesRouter(servicesController)
router.use("/workspaces/:workspaceId/services", servicesRouterInstance)
router.use("/services", servicesRouterInstance)
logger.info("Registered services router with workspace routes")

router.use("/workspaces/:workspaceId/events", eventsRouter(eventsController))

// Mount FAQs router
const faqsRouterInstance = faqsRouter();
router.use("/workspaces/:workspaceId/faqs", faqsRouterInstance);
router.use("/faqs", faqsRouterInstance);
logger.info("Registered FAQs router with workspace routes");

router.use("/upload", createUploadRouter())
router.use("/settings", createSettingsRouter())
router.use("/languages", createLanguagesRouter())
router.use("/", suppliersRouter(suppliersController))

// Mount offers routes
const offersRouterInstance = offersRouter()
router.use("/workspaces/:workspaceId/offers", offersRouterInstance)
router.use("/offers", offersRouterInstance)
logger.info("Registered offers router with workspace routes")

// Mount Swagger documentation
router.get('/docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(require('../config/swagger').swaggerSpec)
})

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

logger.info("API routes setup complete")

export default router
