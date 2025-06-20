import { NextFunction, Request, Response } from 'express';

/**
 * Middleware to authenticate N8N internal API calls
 * Supports both Bearer Token and Basic Auth for N8N compatibility
 */
export const n8nAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Authorization header required for internal API access' 
    });
  }

  // Support Bearer Token authentication
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const internalSecret = process.env.INTERNAL_API_SECRET;
    
    if (internalSecret && token === internalSecret) {
      return next();
    }
  }

  // Support Basic Auth authentication (for N8N workflow compatibility)
  if (authHeader.startsWith('Basic ')) {
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    // Allow admin:admin for N8N workflow calls
    if (username === 'admin' && password === 'admin') {
      return next();
    }
  }

  return res.status(403).json({ 
    error: 'Invalid internal API credentials' 
  });
}; 