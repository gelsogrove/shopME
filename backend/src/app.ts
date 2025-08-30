import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import OpenAI from "openai"
import path from "path"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger"

import { errorMiddleware } from "./interfaces/http/middlewares/error.middleware"
import { jsonFixMiddleware } from "./interfaces/http/middlewares/json-fix.middleware"
import { loggingMiddleware } from "./middlewares/logging.middleware"
import apiRouter from "./routes"
import { DualLLMService } from './services/dual-llm.service'
import { LLMRequest } from './types/whatsapp.types'
import logger from "./utils/logger"

// Extend Request interface to include rawBody
declare global {
  namespace Express {
    interface Request {
      rawBody?: string
    }
  }
}

// Initialize Express app
const app = express()

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

// WhatsApp webhook routes are now handled in routes/index.ts (before authentication)

// API versioning
const apiVersions = {
  v1: apiRouter,
  // v2: apiRouterV2, // For future versions
}

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
    customSiteTitle: "ShopMe API Documentation"
  })
)

// Log that we're about to mount the API router
logger.info("Mounting API router at /api prefix")

// Mount internal API routes directly to avoid middleware conflicts
import { internalApiRoutes } from "./interfaces/http/routes/internal-api.routes"
app.use("/api/internal", internalApiRoutes)
logger.info("Mounted internal API routes directly at /api/internal")



// Hotfix solo per gli ambienti non di test
if (process.env.NODE_ENV !== "test") {
  // Endpoint di catch-all specifico per bloccare clienti
  // HOTFIX: Risolve il problema del 404 su block customer
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
}

// Agent routes are now handled by the modular router system

// ANDREA TEST: Endpoint per testare DualLLMService direttamente (PRIMA del routing API per evitare auth)
app.post("/api/test/dual-llm", async (req, res) => {
  try {
    console.error('🚨🚨🚨 ANDREA TEST: DUAL LLM DIRECT TEST!!! 🚨🚨🚨');
    
    const dualLLMService = new DualLLMService();
    
    const llmRequest: LLMRequest = {
      chatInput: req.body.messageContent || req.body.message || "che servizi avete",
      workspaceId: req.body.workspaceId || "cm9hjgq9v00014qk8fsdy4ujv", 
      customerid: req.body.customerId || "test-customer",
      phone: "+1234567890",
      language: "it",
      sessionId: "test-session",
      temperature: 0.0,
      maxTokens: 3500,
      model: "gpt-4o",
      messages: [],
      prompt: "Test prompt"
    };
    
    console.error('🚨🚨🚨 CALLING DUAL LLM SERVICE!!! 🚨🚨🚨');
    const result = await dualLLMService.processMessage(llmRequest);
    console.error('🚨🚨🚨 DUAL LLM RESULT!!! 🚨🚨🚨');
    
    res.json({ 
      success: true, 
      message: result.output,
      debug: { llmRequest, result }
    });
  } catch (error) {
    console.error('❌ DUAL LLM TEST ERROR:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
})

// Versioned routes
app.use("/api/v1", apiRouter)

// Default version route (current version)
app.use("/api", apiRouter)



// Mount workspace routes directly at root for legacy compatibility
import workspaceRoutesRoot from "./routes/workspace.routes"
app.use("/workspaces", workspaceRoutesRoot)

// ANDREA TEST: Endpoint per testare DualLLMService direttamente (PRIMA del routing API per evitare auth)
app.post("/test/dual-llm", async (req, res) => {
  try {
    console.error('🚨🚨🚨 ANDREA TEST: DUAL LLM DIRECT TEST!!! 🚨🚨🚨');
    
    const dualLLMService = new DualLLMService();
    
    const llmRequest: LLMRequest = {
      chatInput: req.body.query || req.body.messageContent || req.body.message || "che servizi avete",
      workspaceId: req.body.workspaceId || "cm9hjgq9v00014qk8fsdy4ujv", 
      customerid: req.body.customerId || "test-customer",
      phone: "+1234567890",
      language: "it",
      sessionId: "test-session",
      temperature: 0.0,
      maxTokens: 3500,
      model: "gpt-4o",
      messages: [],
      prompt: "Test prompt"
    };
    
    console.error('🚨🚨🚨 CALLING DUAL LLM SERVICE!!! 🚨🚨🚨');
    const result = await dualLLMService.processMessage(llmRequest);
    console.error('🚨🚨🚨 DUAL LLM RESULT!!! 🚨🚨🚨');
    
    res.json({ 
      success: true, 
      message: result.output,
      debug: { llmRequest, result }
    });
  } catch (error) {
    console.error('❌ DUAL LLM TEST ERROR:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
})

// Endpoint di test per OpenAI
app.get("/api/test/openai", async (req, res) => {
  try {
    // Check if OpenAI is properly configured
    const apiKey = process.env.OPENAI_API_KEY
    const isConfigured =
      apiKey && apiKey.length > 10 && apiKey !== "your-api-key-here"

    if (!isConfigured) {
      logger.error("OpenAI API key not configured properly for test")
      return res.status(500).json({
        status: "error",
        message: "OpenAI API key not properly configured",
      })
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://laltroitalia.shop",
        "X-Title": "L'Altra Italia Shop",
        "Content-Type": "application/json",
      },
    })

    // Make a simple request to test the connection
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: "Hello! This is a test message." }],
      max_tokens: 5,
    })

    logger.info(
      `Test OpenAI successful - model: ${completion.model}, response: ${completion.choices[0]?.message?.content}`
    )

    // Return success response with completion info
    return res.status(200).json({
      status: "ok",
      message: "OpenAI API connection successful",
      model: completion.model,
      response: completion.choices[0]?.message?.content,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + "..." : "missing",
    })
  } catch (error) {
    logger.error("OpenAI API connection error:", error)

    // Prepare detailed error response
    const errorResponse = {
      status: "error",
      message: "Failed to connect to OpenAI API",
      error: {
        name: error.name,
        message: error.message,
        status: error.status || "unknown",
      },
    }

    return res.status(500).json(errorResponse)
  }
})

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

// Debug: Print all registered routes at startup
if (process.env.NODE_ENV !== "test") {
  logger.info("🔍 DEBUG: Printing all registered routes:")

  function printRoutes(stack, basePath = "") {
    stack.forEach((middleware) => {
      if (middleware.route) {
        // Route
        const methods = Object.keys(middleware.route.methods)
          .filter((method) => middleware.route.methods[method])
          .join(", ")
        logger.info(
          `🛣️  ${methods.toUpperCase()} ${basePath}${middleware.route.path}`
        )
      } else if (middleware.name === "router") {
        // Router middleware
        const newBase =
          basePath +
          (middleware.regexp
            ? middleware.regexp
                .toString()
                .replace("/^", "")
                .replace("/(?=\\/|$)/i", "")
            : "")
        printRoutes(middleware.handle.stack, newBase)
      }
    })
  }

  // Print main app routes
  printRoutes(app._router.stack)
}

export default app
