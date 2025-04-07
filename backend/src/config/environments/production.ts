export default {
  env: "production",
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || "production-secret-CHANGE-ME",
    expiresIn: "7d",
  },
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000", // Frontend
      process.env.N8N_URL || "http://localhost:5678", // n8n
    ],
    credentials: true,
  },
  logging: {
    level: "info",
    pretty: false,
  },
}
