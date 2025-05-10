export default {
  env: "production",
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || "production-secret-CHANGE-ME",
    expiresIn: "1h",
  },
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000", // Frontend
      process.env.WEBHOOK_URL || "http://localhost:5678", // webhook URL
    ],
    credentials: true,
  },
  logging: {
    level: "info",
    pretty: false,
  },
}
