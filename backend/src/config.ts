import { Secret } from "jsonwebtoken"

export interface Config {
  port: number
  jwt: {
    secret: Secret
    expiresIn: string
  }
  jwtSecret: string
  database: {
    url: string
  }
  cors: {
    origin: string
  }
  frontendUrl: string
  dhlTrackingBaseUrl: string
  llm: {
    defaultPrice: number
  }
  pushMessaging: {
    price: number
  }
}

export const config: Config = {
  port: parseInt(process.env.PORT || "3001", 10),
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: "1d",
  },
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  database: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/shop_db",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
  frontendUrl:
    process.env.FRONTEND_URL ||
    process.env.CORS_ORIGIN ||
    "http://localhost:3000",
  dhlTrackingBaseUrl:
    process.env.DHL_TRACKING_BASE_URL ||
    "https://www.dhl.com/global-en/home/tracking/tracking-express.html",
  llm: {
    defaultPrice: parseFloat(process.env.DEFAULT_LLM_PRICE || "0.005"),
  },
  pushMessaging: {
    price: parseFloat(process.env.PUSH_MESSAGE_PRICE || "0.50"),
  },
}

export const buildDhlTrackingUrl = (
  trackingNumber?: string | null
): string | null => {
  if (!trackingNumber) return null
  const base = config.dhlTrackingBaseUrl
  const sep = base.includes("?") ? "&" : "?"
  return `${base}${sep}tracking-id=${encodeURIComponent(trackingNumber)}`
}
