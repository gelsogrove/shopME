import { NextFunction, Request, Response } from "express"
import logger from "../../../utils/logger"

export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now()

  // Log request
  logger.info("Incoming request", {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    query: req.query,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? "[REDACTED]" : undefined,
    },
    ip: req.ip,
  })

  // Capture response
  const originalSend = res.send
  res.send = function (body) {
    const responseTime = Date.now() - startTime

    // Log response
    logger.info("Outgoing response", {
      requestId: req.requestId,
      statusCode: res.statusCode,
      responseTime,
      size: Buffer.byteLength(body),
    })

    return originalSend.call(this, body)
  }

  next()
}
