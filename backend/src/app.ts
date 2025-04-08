import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import { errorMiddleware } from "./interfaces/http/middlewares/error.middleware"
import { authRouter } from "./interfaces/http/routes/auth.routes"
import workspaceRoutes from "./routes/workspace.routes"

// Initialize Express app
const app = express()

// Middleware
app.use(
  cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

app.use(helmet())
app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/api/auth", authRouter)
app.use("/api/workspaces", workspaceRoutes)

// Error handling
app.use(errorMiddleware)

export default app
