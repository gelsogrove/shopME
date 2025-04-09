import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { config } from "../../../config"
import { AppError } from "../middlewares/error.middleware"

interface JwtPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

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
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(401, "No token provided")
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
    next()
  } catch (error) {
    throw new AppError(401, "Invalid token")
  }
}
