// @ts-nocheck - Ignora errori di tipo in questo file
import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { config } from "../../../config"
import { AppError } from "../middlewares/error.middleware"

interface JwtPayload {
  id?: string     // Per token nuovi
  userId?: string // Per token legacy
  email: string
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
  console.log("Cookies:", req.cookies);
  console.log("Auth header:", req.headers.authorization);
  
  // Check for token in cookies
  const token = req.cookies.auth_token;
  
  // Fallback to Authorization header for backward compatibility
  if (!token) {
    console.log("No token in cookies, checking headers");
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No token in headers either");
      throw new AppError(401, "No token provided")
    }
    const headerToken = authHeader.split(" ")[1]
    try {
      console.log("Using token from Authorization header");
      const decoded = jwt.verify(headerToken, config.jwt.secret) as JwtPayload
      console.log("Token decoded successfully:", decoded);
      req.user = decoded;
      return next();
    } catch (error) {
      console.log("Token verification failed:", error);
      throw new AppError(401, "Invalid token")
    }
  }

  try {
    console.log("Using token from cookies");
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload
    console.log("Token decoded successfully:", decoded);
    req.user = decoded;
    next()
  } catch (error) {
    console.log("Token verification failed:", error);
    throw new AppError(401, "Invalid token")
  }
}
