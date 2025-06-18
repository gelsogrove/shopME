import { NextFunction, Request, Response } from 'express';

/**
 * Middleware to authenticate N8N internal API calls
 * Validates the internal API secret for secure N8N communication
 */
export const n8nAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const internalSecret = process.env.INTERNAL_API_SECRET;

  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Authorization header required for internal API access' 
    });
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!internalSecret || token !== internalSecret) {
    return res.status(403).json({ 
      error: 'Invalid internal API secret' 
    });
  }

  next();
}; 