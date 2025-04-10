import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import { errorMiddleware } from "./interfaces/http/middlewares/error.middleware"
import { loggingMiddleware } from "./middlewares/logging.middleware"
import apiRouter from "./routes"

// Initialize Express app
const app = express()

// Logging middleware should be first
app.use(loggingMiddleware)

// Other middleware
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
      ? [process.env.FRONTEND_URL || "http://localhost:3000"] 
      : ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"], // Allow specific origins in development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-workspace-id"],
  })
)

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

// Routes
app.use("/api", apiRouter)

// Error handling should be last
app.use(errorMiddleware)

export default app
