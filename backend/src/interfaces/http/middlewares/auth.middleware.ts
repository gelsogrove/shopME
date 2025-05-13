// @ts-nocheck - Ignora errori di tipo in questo file
import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { config } from "../../../config"
import { AppError } from "../middlewares/error.middleware"

interface JwtPayload {
  id?: string     // Per token nuovi
  userId?: string // Per token legacy
  email?: string
  role: string
  iat?: number
  exp?: number
  workspaces?: any // Per supportare i token esistenti
}

// @ts-ignore - Adattamento all'interfaccia JwtPayload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

// Funzioni di log condizionali per ridurre l'output durante i test
const isTestEnvironment = process.env.NODE_ENV === 'test';
const logInfo = (_message: string, ..._args: any[]) => {
  // Function intentionally left empty to avoid logs
};

const logError = (message: string, ...args: any[]) => {
  if (!isTestEnvironment) {
    console.error(message, ...args);
  }
};

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  logInfo("Auth middleware invoked for path:", req.path);
  logInfo("Method:", req.method);
  logInfo("Query params:", req.query);
  logInfo("Cookies:", req.cookies);
  logInfo("Auth header:", req.headers.authorization);
  logInfo("Request URL:", req.originalUrl);
  
  try {
    // Check for token in cookies
    let token = req.cookies.auth_token;
    
    // Fallback to Authorization header for backward compatibility
    if (!token) {
      logInfo("No token in cookies, checking headers");
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        logInfo("No authorization header");
        throw new AppError(401, "Authentication required");
      }
      
      if (!authHeader.startsWith("Bearer ")) {
        logInfo("Authorization header doesn't start with 'Bearer '");
        throw new AppError(401, "Invalid authorization format");
      }
      
      token = authHeader.split(" ")[1];
      
      // Check if token is empty after 'Bearer '
      if (!token || token.trim() === '') {
        logInfo("Empty token in authorization header");
        throw new AppError(401, "Empty authorization token");
      }
    }
    
    if (!token) {
      logInfo("No token found in cookies or headers");
      throw new AppError(401, "Authentication required");
    }
    
    try {
      logInfo("Using token:", token.substring(0, 20) + "...");
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      logInfo("Token decoded successfully:", decoded);
      
      // Make sure we have a userId
      if (!decoded.userId && !decoded.id) {
        logInfo("Token doesn't have userId or id field");
        throw new AppError(401, "Invalid token format");
      }
      
      // Normalize userId field
      if (!decoded.userId && decoded.id) {
        decoded.userId = decoded.id;
      }
      
      req.user = decoded;
      return next();
    } catch (error) {
      logInfo("Token verification failed:", error);
      throw new AppError(401, "Invalid token");
    }
  } catch (error) {
    logError("Auth middleware error:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, "Authentication failed");
  }
}
