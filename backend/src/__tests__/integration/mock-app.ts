// @ts-nocheck
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import apiRouter from '../../routes';

// Mock Express app for testing
const app = express();

// Apply middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-workspace-id"],
    exposedHeaders: ["set-cookie"],
  })
);

app.use(express.json());
app.use(cookieParser());

// Mock authentication middleware for tests
app.use((req, res, next) => {
  // Check for authentication token in cookies or Authorization header
  const token = req.cookies?.auth_token || 
                (req.headers.authorization?.startsWith('Bearer ') ? 
                 req.headers.authorization.substring(7) : null);
  
  if (token) {
    try {
      // For tests, we don't need to verify the token, just mock a user
      req.user = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'ADMIN'
      };
    } catch (error) {
      // Let the request proceed with no user object
    }
  }
  
  next();
});

// Mount API router
app.use('/api', apiRouter);

// Simple health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: 'test', 
    timestamp: new Date().toISOString() 
  });
});

export default app; 