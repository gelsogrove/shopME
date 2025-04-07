import { NextFunction, Request, Response } from "express"
import logger from "../../utils/logger"

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(err.message, { stack: err.stack })

  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  })
}
