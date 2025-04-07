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
}
