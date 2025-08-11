import { Request, Response, NextFunction } from "express"
import logger from "../../../utils/logger"

interface JWTPayload {
  clientId: string
  workspaceId: string
  scope: string
  orderCode?: string
  iat?: number
  exp?: number
}

export const jwtAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.query.token as string || req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      res.status(401).json({
        success: false,
        error: "Token is required"
      })
      return
    }

    // TODO: Implement actual JWT verification
    // For now, we'll use a mock verification for testing
    const payload = await verifyJWTToken(token)
    
    if (!payload) {
      res.status(401).json({
        success: false,
        error: "Invalid or expired token"
      })
      return
    }

    // Add payload to request for use in controllers
    ;(req as any).jwtPayload = payload
    
    next()
  } catch (error) {
    logger.error("[JWT-AUTH] Middleware error:", error)
    res.status(500).json({
      success: false,
      error: "Authentication error"
    })
  }
}

/**
 * Verify JWT token and extract payload
 * TODO: Implement actual JWT verification with proper library
 */
async function verifyJWTToken(token: string): Promise<JWTPayload | null> {
  try {
    // TODO: Replace with actual JWT verification
    // For now, handle base64 encoded payloads and mock tokens
    
    // Handle base64 encoded JWT payloads
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const payload = JSON.parse(decoded)
      
      // Check if token is expired
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null
      }
      
      return payload
    } catch (error) {
      // Not a base64 token, try mock tokens
    }
    
    // Mock tokens for testing
    if (token === "mock-token") {
      return {
        clientId: "mock-customer-id",
        workspaceId: "mock-workspace-id",
        scope: "orders:list"
      }
    }
    
    // For testing with order detail scope
    if (token === "mock-token-detail") {
      return {
        clientId: "mock-customer-id",
        workspaceId: "mock-workspace-id",
        scope: "orders:detail"
      }
    }
    
    // For testing with specific workspace
    if (token.startsWith("mock-token-workspace-")) {
      const workspaceId = token.replace("mock-token-workspace-", "")
      return {
        clientId: "mock-customer-id",
        workspaceId: workspaceId,
        scope: "orders:list"
      }
    }
    
    return null
  } catch (error) {
    logger.error("[JWT-AUTH] Token verification error:", error)
    return null
  }
}
