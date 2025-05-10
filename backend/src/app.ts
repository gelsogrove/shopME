import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import OpenAI from 'openai'
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger"
import { errorMiddleware } from "./interfaces/http/middlewares/error.middleware"
import { loggingMiddleware } from "./middlewares/logging.middleware"
import apiRouter from "./routes"
import agentRoutes from "./routes/agent.routes"
import logger from "./utils/logger"

// Initialize Express app
const app = express()

// Logging middleware should be first
app.use(loggingMiddleware)

// Other middleware
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
      ? [process.env.FRONTEND_URL || "http://localhost:3000"] 
      : ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-workspace-id"],
    exposedHeaders: ["set-cookie"],
  })
)

// Enable pre-flight requests for all routes
app.options('*', cors())

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

app.use(express.json())
app.use(cookieParser())

// Swagger documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: ""
}))

// Log that we're about to mount the API router
logger.info("Mounting API router at /api prefix")

// Routes
app.use("/api", apiRouter)

// Mount agent routes directly at root level for legacy support
app.use("/workspaces/:workspaceId/agent", agentRoutes)
logger.info("Mounted agent routes directly at /workspaces/:workspaceId/agent for legacy support")

// Endpoint di test per OpenAI
// @ts-ignore
app.get("/api/test/openai", async (req, res) => {
  try {
    // Check if OpenAI is properly configured
    const apiKey = process.env.OPENAI_API_KEY;
    const isConfigured = apiKey && apiKey.length > 10 && apiKey !== 'your-api-key-here';
    
    if (!isConfigured) {
      logger.error('OpenAI API key not configured properly for test');
      return res.status(500).json({ 
        status: "error", 
        message: "OpenAI API key not properly configured" 
      });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://laltroitalia.shop",
        "X-Title": "L'Altra Italia Shop",
        "Content-Type": "application/json"
      },
    });

    // Make a simple request to test the connection
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: "Hello! This is a test message." }],
      max_tokens: 5
    });

    logger.info(`Test OpenAI successful - model: ${completion.model}, response: ${completion.choices[0]?.message?.content}`);

    // Return success response with completion info
    return res.status(200).json({ 
      status: "ok", 
      message: "OpenAI API connection successful",
      model: completion.model,
      response: completion.choices[0]?.message?.content,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + "..." : "missing"
    });
  } catch (error) {
    logger.error("OpenAI API connection error:", error);
    
    // Prepare detailed error response
    const errorResponse = {
      status: "error",
      message: "Failed to connect to OpenAI API",
      error: {
        name: error.name,
        message: error.message,
        status: error.status || "unknown"
      }
    };
    
    return res.status(500).json(errorResponse);
  }
});

// Error handling should be last
app.use(errorMiddleware)

// Add diagnostics endpoint for direct access
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app
