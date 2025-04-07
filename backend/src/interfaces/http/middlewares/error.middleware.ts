import { NextFunction, Request, Response } from "express"
import logger from "../../../utils/logger"

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string
  ) {
    super(message)
    this.name = "AppError"
  }
}

export const errorMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error("Error:", error)

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      code: error.code,
    })
    return
  }

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  })
}
