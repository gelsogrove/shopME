import { NextFunction, Request, Response, Router } from "express"
import offerRoutes from '../controllers/offer.controller'
import { CategoriesController } from "../interfaces/http/controllers/categories.controller"
import { CustomersController } from "../interfaces/http/controllers/customers.controller"
import { EventsController } from "../interfaces/http/controllers/events.controller"
import { ServicesController } from "../interfaces/http/controllers/services.controller"
import { authRouter } from "../interfaces/http/routes/auth.routes"
import { categoriesRouter } from "../interfaces/http/routes/categories.routes"
import { chatRouter } from "../interfaces/http/routes/chat.routes"
import { customersRouter } from "../interfaces/http/routes/customers.routes"
import { eventsRouter } from "../interfaces/http/routes/events.routes"
import { messagesRouter } from "../interfaces/http/routes/messages.routes"
import { servicesRouter } from "../interfaces/http/routes/services.routes"
import registrationApiRoutes from "../presentation/routes/api.routes"
import logger from "../utils/logger"
import agentRoutes from "./agent.routes"
import faqRoutes from "./faq.routes"
import languagesRoutes from "./languages"
import productsRouter from "./products.routes"
import promptsRoutes from "./prompts.routes"
import uploadRoutes from "./upload.routes"
import userRoutes from "./user.routes"
import whatsappSettingsRoutes from "./whatsapp-settings.routes"
import workspaceRoutes from "./workspace.routes"

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

// Create controllers in advance
const customersController = new CustomersController()
const servicesController = new ServicesController()
const eventsController = new EventsController()
const categoriesController = new CategoriesController()

// Public routes
router.use("/auth", authRouter)
router.use("/registration", registrationApiRoutes)

// Protected routes - the auth middleware is applied in each router
router.use("/chat", chatRouter())
router.use("/messages", messagesRouter())
router.use("/users", userRoutes)

// REGISTER CUSTOMER ROUTER - include anche il count degli unknown customers
router.use("/workspaces", customersRouter(customersController))
logger.info("Registered customers router with controller on /workspaces path")

// Register workspace routes and other workspace-related routes
router.use("/workspaces", workspaceRoutes)

// Mount both direct routes and workspace-specific routes for agent
router.use("/agent", agentRoutes)
router.use("/workspaces/:workspaceId/agent", agentRoutes)
logger.info(
  "Registered agent routes on both /agent and /workspaces/:workspaceId/agent paths"
)

// Mount products router (contains workspaces/:workspaceId/products routes)
router.use("/", productsRouter)
logger.info("Registered products router with workspace routes")

// Mount categories router
router.use("/", categoriesRouter(categoriesController))
logger.info("Registered categories router with workspace routes")

// Mount services router only on the workspace-specific path
const servicesRouterInstance = servicesRouter(servicesController)
router.use("/workspaces/:workspaceId/services", servicesRouterInstance)
logger.info("Registered services router")

// Mount events router only on the workspace-specific path
const eventsRouterInstance = eventsRouter(eventsController)
router.use("/workspaces/:workspaceId/events", eventsRouterInstance)
logger.info("Registered events router")

// Mount FAQ router only on the workspace-specific path
router.use("/workspaces/:workspaceId/faqs", faqRoutes)
logger.info("Registered FAQ router")

// Register other routes
router.use("/prompts", promptsRoutes)
router.use("/upload", uploadRoutes)
router.use("/whatsapp-settings", whatsappSettingsRoutes)
router.use("/languages", languagesRoutes)
router.use("/offers", offerRoutes)

logger.info("API routes setup complete")

export default router
