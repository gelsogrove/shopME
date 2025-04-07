import { UserRole } from "@prisma/client"
import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { config } from "../../../config"
import { AppError } from "./error.middleware"

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string
        email: string
        role: UserRole
      }
    }
  }
}

interface JwtPayload {
  id: string
  email: string
  role: UserRole
}

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(401, "No token provided")
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    }
    next()
  } catch (error) {
    throw new AppError(401, "Invalid token")
  }
}
