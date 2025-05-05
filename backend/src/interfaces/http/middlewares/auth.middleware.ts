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

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  console.log("Auth middleware invoked for path:", req.path);
  console.log("Method:", req.method);
  console.log("Query params:", req.query);
  console.log("Cookies:", req.cookies);
  console.log("Auth header:", req.headers.authorization);
  console.log("Request URL:", req.originalUrl);
  
  try {
    // Check for token in cookies
    let token = req.cookies.auth_token;
    
    // Fallback to Authorization header for backward compatibility
    if (!token) {
      console.log("No token in cookies, checking headers");
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        console.log("No authorization header");
        throw new AppError(401, "Authentication required");
      }
      
      if (!authHeader.startsWith("Bearer ")) {
        console.log("Authorization header doesn't start with 'Bearer '");
        throw new AppError(401, "Invalid authorization format");
      }
      
      token = authHeader.split(" ")[1];
      
      // Check if token is empty after 'Bearer '
      if (!token || token.trim() === '') {
        console.log("Empty token in authorization header");
        throw new AppError(401, "Empty authorization token");
      }
    }
    
    if (!token) {
      console.log("No token found in cookies or headers");
      throw new AppError(401, "Authentication required");
    }
    
    try {
      console.log("Using token:", token.substring(0, 20) + "...");
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      console.log("Token decoded successfully:", decoded);
      
      // Make sure we have a userId
      if (!decoded.userId && !decoded.id) {
        console.log("Token doesn't have userId or id field");
        throw new AppError(401, "Invalid token format");
      }
      
      // Normalize userId field
      if (!decoded.userId && decoded.id) {
        decoded.userId = decoded.id;
      }
      
      req.user = decoded;
      return next();
    } catch (error) {
      console.log("Token verification failed:", error);
      throw new AppError(401, "Invalid token");
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, "Authentication failed");
  }
}
