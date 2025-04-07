import cors from "cors"
import { Express } from "express"
import helmet from "helmet"
import config from "../../../config"

export function setupSecurity(app: Express): void {
  // Configure CORS
  const corsOptions = {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-request-id",
      "x-workspace-id",
    ],
    exposedHeaders: ["x-request-id"],
  }
  app.use(cors(corsOptions))

  // Configure Helmet security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", ...config.cors.origin],
          fontSrc: ["'self'", "https:", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Required for Swagger UI
      crossOriginResourcePolicy: { policy: "cross-origin" }, // Required for external resources
    })
  )

  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff")
    res.setHeader("X-Frame-Options", "DENY")
    res.setHeader("X-XSS-Protection", "1; mode=block")
    next()
  })

  // Disable X-Powered-By header
  app.disable("x-powered-by")
}
