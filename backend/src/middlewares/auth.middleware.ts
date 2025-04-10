import { NextFunction, Request, Response } from "express"
import * as jwt from "jsonwebtoken"
import { config } from "../config"

// Define our payload type to match what's generated in auth.controller.ts
interface JwtPayload {
  userId: string
  email: string
}

// Declare custom properties for the Request object
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      workspaceId?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // First check for token in cookies
    const cookieToken = req.cookies.auth_token
    
    // Fallback to Authorization header if no cookie
    const headerToken = req.headers.authorization?.split(" ")[1]
    
    const token = cookieToken || headerToken
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required" })
    }
    
    // Verify the token using the secret from config
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload
    
    // Store the decoded information in the request object
    req.user = decoded
    
    // Get workspaceId from query params or headers
    const workspaceId = req.query.workspaceId as string || req.headers["x-workspace-id"] as string
    
    // Store the workspaceId
    req.workspaceId = workspaceId
    
    // TODO: Implement workspace access verification if needed
    
    next()
  } catch (error) {
    console.error("Authentication error:", error)
    return res.status(401).json({ error: "Invalid token" })
  }
} 