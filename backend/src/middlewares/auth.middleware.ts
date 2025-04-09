import { NextFunction, Request, Response } from "express"
import * as jwt from "jsonwebtoken"

interface JwtPayload {
  userId: string
  email: string
  workspaces: Array<{
    id: string
    role: string
  }>
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
      workspaceId?: string
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as JwtPayload
    req.user = decoded

    // Get workspaceId from query params or headers
    const workspaceId = req.query.workspaceId as string || req.headers["x-workspace-id"] as string

    // Verify if user has access to this workspace
    if (workspaceId && !decoded.workspaces.some(w => w.id === workspaceId)) {
      return res.status(403).json({ error: "Access denied to this workspace" })
    }

    req.workspaceId = workspaceId
    next()
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" })
  }
} 