import { PrismaClient } from "@prisma/client"
import cookieParser from "cookie-parser"
import express from "express"
import { UserService } from "./application/services/user.service"
import { CreateWorkspaceUseCase } from "./application/use-cases/workspace/create-workspace.use-case"
import { DeleteWorkspaceUseCase } from "./application/use-cases/workspace/delete-workspace.use-case"
import { GetWorkspaceUseCase } from "./application/use-cases/workspace/get-workspace.use-case"
import { ListWorkspacesUseCase } from "./application/use-cases/workspace/list-workspaces.use-case"
import { UpdateWorkspaceUseCase } from "./application/use-cases/workspace/update-workspace.use-case"
import { WorkspaceRepository } from "./infrastructure/repositories/workspace.repository"
import { AuthController } from "./interfaces/http/controllers/auth.controller"
import { HealthController } from "./interfaces/http/controllers/health.controller"
import { WorkspaceController } from "./interfaces/http/controllers/workspace.controller"
import { errorMiddleware } from "./interfaces/http/middlewares/error.middleware"
import { loggingMiddleware } from "./interfaces/http/middlewares/logging.middleware"
import { requestIdMiddleware } from "./interfaces/http/middlewares/request-id.middleware"
import { setupSecurity } from "./interfaces/http/middlewares/security.middleware"
import { authRouter } from "./interfaces/http/routes/auth.routes"
import { healthRouter } from "./interfaces/http/routes/health.routes"
import { workspaceRouter } from "./interfaces/http/routes/workspace.routes"
import logger from "./utils/logger"

const app = express()

// Setup security middleware (CORS and Helmet)
setupSecurity(app)

// Request tracking and logging middleware
// @ts-ignore
app.use(requestIdMiddleware)
// @ts-ignore
app.use(loggingMiddleware)

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// @ts-ignore
app.use(cookieParser())

// Initialize services
const prisma = new PrismaClient()
const userService = new UserService(prisma)

// Initialize repositories
const workspaceRepository = new WorkspaceRepository(prisma)

// Initialize use cases
const createWorkspaceUseCase = new CreateWorkspaceUseCase(workspaceRepository)
const getWorkspaceUseCase = new GetWorkspaceUseCase(workspaceRepository)
const listWorkspacesUseCase = new ListWorkspacesUseCase(workspaceRepository)
const updateWorkspaceUseCase = new UpdateWorkspaceUseCase(workspaceRepository)
const deleteWorkspaceUseCase = new DeleteWorkspaceUseCase(workspaceRepository)

// Initialize controllers
const authController = new AuthController(userService)
const healthController = new HealthController(prisma)
const workspaceController = new WorkspaceController({
  createWorkspaceUseCase,
  getWorkspaceUseCase,
  listWorkspacesUseCase,
  updateWorkspaceUseCase,
  deleteWorkspaceUseCase,
})

// Routes
app.use("/api/auth", authRouter(authController))
app.use("/health", healthRouter(healthController))
app.use("/api/workspaces", workspaceRouter(workspaceController))

// Error handling middleware
app.use(errorMiddleware)

// Unhandled error logging
process.on("unhandledRejection", (reason: Error) => {
  logger.error("Unhandled Rejection", reason)
  // Don't exit the process in development
  if (process.env.NODE_ENV === "production") {
    process.exit(1)
  }
})

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", error)
  // Don't exit the process in development
  if (process.env.NODE_ENV === "production") {
    process.exit(1)
  }
})

export default app
