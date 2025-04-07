export default {
  env: "development",
  port: process.env.PORT || 3001,
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || "development-secret",
    expiresIn: "1d",
  },
  cors: {
    origin: [
      "http://localhost:3000", // Frontend
      "http://localhost:5678", // n8n
    ],
    credentials: true,
  },
  logging: {
    level: "debug",
    pretty: true,
  },
}
