import { Router } from "express"
import { CategoriesController } from "../interfaces/http/controllers/categories.controller"
import { CustomersController } from "../interfaces/http/controllers/customers.controller"
import { ServicesController } from "../interfaces/http/controllers/services.controller"
import { authRouter } from "../interfaces/http/routes/auth.routes"
import { categoriesRouter } from "../interfaces/http/routes/categories.routes"
import { chatRouter } from "../interfaces/http/routes/chat.routes"
import { customersRouter } from "../interfaces/http/routes/customers.routes"
import { messagesRouter } from "../interfaces/http/routes/messages.routes"
import { servicesRouter } from "../interfaces/http/routes/services.routes"
import agentsRoutes from "./agents.routes"
import languagesRoutes from "./languages"
import { productsRouter } from './products.routes'
import promptsRoutes from "./prompts.routes"
import uploadRoutes from "./upload.routes"
import userRoutes from "./user.routes"
import workspaceRoutes from "./workspace.routes"

const router = Router()

// Public routes
router.use("/auth", authRouter)
router.use("/messages", messagesRouter())

// Protected routes - the auth middleware is applied in each router
router.use("/chat", chatRouter())
router.use("/workspaces", workspaceRoutes)
router.use("/languages", languagesRoutes)
router.use("/users", userRoutes)
router.use(promptsRoutes)
router.use(agentsRoutes)
router.use(productsRouter())
router.use(uploadRoutes)
router.use(servicesRouter(new ServicesController()))
router.use(categoriesRouter(new CategoriesController()))
router.use(customersRouter(new CustomersController()))

export default router
