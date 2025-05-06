import { NextFunction, Request, Response, Router } from "express"
import { CategoriesController } from "../interfaces/http/controllers/categories.controller"
import { CustomersController } from "../interfaces/http/controllers/customers.controller"
import { ServicesController } from "../interfaces/http/controllers/services.controller"
import { authRouter } from "../interfaces/http/routes/auth.routes"
import { categoriesRouter } from "../interfaces/http/routes/categories.routes"
import { chatRouter } from "../interfaces/http/routes/chat.routes"
import { customersRouter } from "../interfaces/http/routes/customers.routes"
import { messagesRouter } from "../interfaces/http/routes/messages.routes"
import { servicesRouter } from "../interfaces/http/routes/services.routes"
import logger from "../utils/logger"
import agentsRoutes from "./agents.routes"
import languagesRoutes from "./languages"
import productsRouter from './products.routes'
import promptsRoutes from "./prompts.routes"
// Commentato per evitare conflitti con la route /unknown-customers/count
// import unknownCustomersRoutes from "./unknown-customers.routes"
import registrationApiRoutes from '../presentation/routes/api.routes'
import uploadRoutes from "./upload.routes"
import userRoutes from "./user.routes"
import whatsappSettingsRoutes from "./whatsapp-settings.routes"
import workspaceRoutes from "./workspace.routes"

// Simple logging middleware
const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Request: ${req.method} ${req.originalUrl}`);
  
  // Track the original end method
  const originalEnd = res.end;
  
  // Override the end method to log the response
  res.end = function() {
    logger.info(`Response for ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
    
    // Call the original end method
    return originalEnd.apply(this, arguments);
  };
  
  next();
};

const router = Router()

// Add logging middleware
router.use(loggingMiddleware);

// Log router setup
logger.info("Setting up API routes")

// Public routes
router.use("/auth", authRouter)
router.use("/registration", registrationApiRoutes)

// Create customer controller first to use before workspaces
const customersController = new CustomersController()

// Protected routes - the auth middleware is applied in each router
router.use("/chat", chatRouter())
router.use("/messages", messagesRouter())
router.use("/users", userRoutes)

// REGISTER CUSTOMER ROUTER - include anche il count degli unknown customers
router.use("/workspaces", customersRouter(customersController))
logger.info("Registered customers router with controller on /workspaces path")

// Rimosso unknownCustomersRoutes per evitare conflitti con la route già definita in customersRouter
// router.use("/workspaces", unknownCustomersRoutes())
// logger.info("Registered unknown customers routes on /workspaces path")

// Register workspace routes and other workspace-related routes
router.use("/workspaces", workspaceRoutes)

// Mount both direct routes and workspace-specific routes for agents
router.use("/agents", agentsRoutes)
router.use("/workspaces/:workspaceId/agents", agentsRoutes)
logger.info("Registered agents routes on both /agents and /workspaces/:workspaceId/agents paths")

// Mount products router (contains workspaces/:workspaceId/products routes)
router.use(productsRouter)
logger.info("Registered products router with workspace routes")

// Mount services router only on the workspace-specific path
router.use("/workspaces/:workspaceId/services", servicesRouter(new ServicesController()))
logger.info("Registered services router")

// Register other routes
router.use("/prompts", promptsRoutes)
router.use("/upload", uploadRoutes)
router.use("/whatsapp-settings", whatsappSettingsRoutes)
router.use("/languages", languagesRoutes)
router.use(categoriesRouter(new CategoriesController()))

// Debug endpoint for direct products and services access
router.get("/products", function(req: Request, res: Response) {
  logger.info("Direct /products endpoint accessed");
  return res.json({ 
    success: true, 
    message: "Products API endpoint is working", 
    documentation: "Use /workspaces/:workspaceId/products for workspace-specific products"
  });
})

router.get("/services", function(req: Request, res: Response) {
  logger.info("Direct /services endpoint accessed");
  return res.json({ 
    success: true, 
    message: "Services API endpoint is working", 
    documentation: "Use /workspaces/:workspaceId/services for workspace-specific services"
  });
})

// Debug endpoint for direct chat access
router.get("/chat-debug/:sessionId", function(req: Request, res: Response) {
  logger.info("Direct /chat-debug endpoint accessed for sessionId:", req.params.sessionId);
  return res.json({ 
    success: true, 
    message: "Chat debug endpoint is working", 
    sessionId: req.params.sessionId,
    timestamp: new Date().toISOString()
  });
})

logger.info("API routes setup complete")

export default router
