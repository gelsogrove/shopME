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
  dhlTrackingBaseUrl: string
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
  dhlTrackingBaseUrl:
    process.env.DHL_TRACKING_BASE_URL ||
    "https://www.dhl.com/global-en/home/tracking/tracking-express.html",
}

export const buildDhlTrackingUrl = (trackingNumber?: string | null): string | null => {
  if (!trackingNumber) return null
  const base = config.dhlTrackingBaseUrl
  const sep = base.includes("?") ? "&" : "?"
  return `${base}${sep}tracking-id=${encodeURIComponent(trackingNumber)}`
}
