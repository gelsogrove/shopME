import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import config from "../../../config"
import { AppError } from "./error.middleware"

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        workspaceId: string
      }
    }
  }
}

interface JwtPayload {
  id: string
  workspaceId: string
}

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    throw new AppError(401, "No authorization header")
  }

  const [type, token] = authHeader.split(" ")
  if (type !== "Bearer") {
    throw new AppError(401, "Invalid authorization type")
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload
    req.user = decoded
    next()
  } catch (error) {
    throw new AppError(401, "Invalid token")
  }
}
