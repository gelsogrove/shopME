import { NextFunction, Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"

declare global {
  namespace Express {
    interface Request {
      requestId: string
    }
  }
}

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = (req.headers["x-request-id"] as string) || uuidv4()
  req.requestId = requestId
  res.setHeader("x-request-id", requestId)
  next()
}
