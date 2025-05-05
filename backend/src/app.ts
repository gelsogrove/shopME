import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import { errorMiddleware } from "./interfaces/http/middlewares/error.middleware"
import { loggingMiddleware } from "./middlewares/logging.middleware"
import apiRouter from "./routes"
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

// Log that we're about to mount the API router
logger.info("Mounting API router at /api prefix")

// Routes
app.use("/api", apiRouter)

// Error handling should be last
app.use(errorMiddleware)

// Add diagnostics endpoint for direct access
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app
