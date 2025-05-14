import { NextFunction, Request, Response } from "express";
import logger from "../../../utils/logger";

// Estendere l'interfaccia Request per includere rawBody
declare global {
  namespace Express {
    interface Request {
      rawBody?: string;
    }
  }
}

/**
 * Middleware to fix malformed JSON requests with incorrect escaping
 */
export const jsonFixMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Only process POST, PUT and PATCH requests with content-type application/json
  const contentType = req.headers['content-type'];
  
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && 
      contentType && contentType.includes('application/json') &&
      req.rawBody) {
    
    try {
      // Try parsing the body first to check if it's valid JSON
      JSON.parse(req.body);
      // If it parses successfully, do nothing and proceed
    } catch (err) {
      // If parsing fails, try to fix the JSON
      try {
        // First attempt: try with the raw body we stored
        if (req.rawBody) {
          req.body = JSON.parse(req.rawBody);
          logger.info('Fixed JSON request body using rawBody');
        } 
        // Second attempt: try unescaping common escape sequences
        else {
          const rawBody = JSON.stringify(req.body);
          const fixedJson = rawBody
            .replace(/\\"/g, '"')  // Replace escaped quotes
            .replace(/\\\\/g, '\\'); // Replace double backslashes
          
          const parsedBody = JSON.parse(fixedJson);
          req.body = parsedBody;
          logger.info('Fixed JSON request body by removing escape characters');
        }
      } catch (fixError) {
        logger.error('Failed to fix malformed JSON:', fixError);
        // Don't modify the body if we can't fix it
      }
    }
  }
  
  next();
}; 