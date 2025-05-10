export default {
  env: "test",
  port: process.env.PORT || 3002,
  database: {
    url:
      process.env.TEST_DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/shop_test",
  },
  jwt: {
    secret: "test-secret",
    expiresIn: "1h",
  },
  cors: {
    origin: [
      "http://localhost:3000", // Frontend
    ],
    credentials: true,
  },
  logging: {
    level: "error",
    pretty: false,
  },
}
