import { NextFunction, Request, Response } from "express"
import { logError } from "../../../utils/logger"

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
) => {
  if (err instanceof AppError) {
    logError(err.message, err, {
      requestId: req.requestId,
      statusCode: err.statusCode,
      isOperational: err.isOperational,
    })

    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    })
  }

  // Log unexpected errors
  logError("Unexpected error occurred", err, {
    requestId: req.requestId,
    url: req.url,
    method: req.method,
  })

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}
