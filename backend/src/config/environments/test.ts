/**
 * Test environment configuration
 */
export default {
  // Server configuration
  port: process.env.PORT || 3002,
  nodeEnv: 'test',
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL_TEST || 'postgresql://postgres:postgres@localhost:5433/shop_test'
  },
  
  // Auth configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'test_jwt_secret',
    expiresIn: '1h'
  },
  
  // Cookie configuration
  cookie: {
    secret: process.env.COOKIE_SECRET || 'test_cookie_secret',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // OpenAI API configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'mock-api-key',
    baseUrl: 'https://api.openai.com/v1'
  },
  
  // CORS configuration
  cors: {
    origins: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
  },
  
  // Logging configuration
  logging: {
    level: 'error'
  }
}; 