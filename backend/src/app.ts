import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import { config } from "./config"
import { errorMiddleware } from "./interfaces/http/middlewares/error.middleware"
import { authRouter } from "./interfaces/http/routes/auth.routes"

// Initialize Express app
const app = express()

// Middleware
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
)
app.use(helmet())
app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/api/auth", authRouter)

// Error handling
app.use(errorMiddleware)

export default app
