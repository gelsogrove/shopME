import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import path from "path"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger"

import { errorMiddleware } from "./interfaces/http/middlewares/error.middleware"
import { jsonFixMiddleware } from "./interfaces/http/middlewares/json-fix.middleware"
import { loggingMiddleware } from "./middlewares/logging.middleware"
import apiRouter from "./routes"
import logger from "./utils/logger"

// Extend Request interface to include rawBody
declare global {
  namespace Express {
    interface Request {
      rawBody?: string
    }
  }
}

// Import scheduler service
import { SchedulerService } from "./services/scheduler.service"

// Initialize Express app
const app = express()

// Initialize and start scheduler service
const schedulerService = new SchedulerService()
schedulerService.startScheduledTasks()

// Logging middleware should be first
app.use(loggingMiddleware)

// Other middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL || "http://localhost:3000"]
        : [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
          ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-workspace-id"],
    exposedHeaders: ["set-cookie"],
  })
)

// Enable pre-flight requests for all routes
app.options("*", cors())

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
)

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, "../uploads")
app.use("/uploads", express.static(uploadsPath))
logger.info(`Serving static files from: ${uploadsPath}`)

// Custom JSON parser middleware to handle potentially escaped JSON
app.use(
  express.json({
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        const request = req as any // Cast to any to add rawBody property
        try {
          // Store the raw body for debugging purposes
          request.rawBody = buf.toString((encoding as BufferEncoding) || "utf8")

          // Test if we can parse the body
          JSON.parse(request.rawBody)
        } catch (e: any) {
          // If parsing fails, try to un-escape the string and parse again
          logger.warn(
            `JSON parse error: ${e.message}. Attempting to fix escaped JSON.`
          )
          try {
            const unescaped = request.rawBody
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, "\\")
            JSON.parse(unescaped)
            // If successful, replace the raw body with unescaped version
            request.rawBody = unescaped
          } catch (e2: any) {
            logger.error(`Failed to fix JSON: ${e2.message}`)
          }
        }
      }
    },
  })
)

// Add json-fix middleware after JSON parsing
app.use(jsonFixMiddleware)

app.use(cookieParser())

// Add test endpoint for JSON parsing
app.post("/api/test/json-parser", (req, res) => {
  logger.info("JSON parser test received body:", req.body)
  res.json({
    success: true,
    receivedBody: req.body,
    rawBodyExists: !!req.rawBody,
  })
})

// Swagger JSON endpoint (must be before Swagger UI)
app.get("/api/docs/swagger.json", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json")
    res.json(swaggerSpec)
  } catch (error) {
    logger.error("Error serving swagger.json:", error)
    res.status(500).json({ error: "Failed to load swagger documentation" })
  }
})

// Swagger documentation
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "ShopMe API Documentation",
  })
)

// Endpoint di catch-all specifico per bloccare clienti
app.post("/api/workspaces/:workspaceId/customers/:id/block", (req, res) => {
  const { id, workspaceId } = req.params
  logger.info(
    `🔥 HOTFIX: Block customer catch-all endpoint chiamato per workspace ${workspaceId}, customer ${id}`
  )
  logger.info(
    `⚠️ Questo è un hotfix temporaneo per risolvere il problema del 404 su questo endpoint.`
  )

  // Import customerService on-demand
  const {
    default: customerService,
  } = require("./application/services/customer.service")

  // Try to block the customer
  customerService
    .blockCustomer(id, workspaceId)
    .then((customer) => {
      return res.status(200).json({
        message: "Customer blocked successfully via HOTFIX",
        customer,
      })
    })
    .catch((error) => {
      logger.error("Error in HOTFIX route:", error)
      return res.status(404).json({
        message: error.message || "Failed to block customer",
        error: true,
      })
    })
})

// Short URL routes (must be before API routes to handle /s/:shortCode)
import { shortUrlRoutes } from "./interfaces/http/routes/short-url.routes"
app.use("/", shortUrlRoutes)

// Versioned routes
app.use("/api/v1", apiRouter)

// Default version route (current version)
app.use("/api", apiRouter)

// Mount workspace routes directly at root for legacy compatibility
import { workspaceRoutes as workspaceRoutesRoot } from "./interfaces/http/routes/workspace.routes"
app.use("/workspaces", workspaceRoutesRoot)

// Error handling should be last
app.use(errorMiddleware)

// Add diagnostics endpoint for direct access
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    apiVersion: "v1",
  })
})

export default app
