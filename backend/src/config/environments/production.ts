export default {
  env: "production",
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || "production-secret-CHANGE-ME",
    expiresIn: "7d",
  },
  cors: {
    origin: [process.env.FRONTEND_URL || "http://localhost:3000"], // Production frontend URL with fallback
    credentials: true,
  },
  logging: {
    level: "info",
    pretty: false,
  },
}
