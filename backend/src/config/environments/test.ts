export default {
  env: "test",
  port: process.env.PORT || 3002,
  database: {
    url:
      process.env.TEST_DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/shop_test",
  },
  redis: {
    url: process.env.TEST_REDIS_URL || "redis://localhost:6379/1",
    password: process.env.TEST_REDIS_PASSWORD || "test_redis_password",
  },
  jwt: {
    secret: "test-secret",
    expiresIn: "1h",
  },
  cors: {
    origin: ["http://localhost:3000"],
    credentials: true,
  },
  logging: {
    level: "error",
    pretty: false,
  },
}
