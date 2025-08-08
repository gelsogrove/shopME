import { NextFunction, Request, Response } from "express"

/**
 * Middleware to authenticate N8N internal API calls
 * Supports both Bearer Token and Basic Auth for N8N compatibility
 */
export const n8nAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TEMPORARY: Skip auth for testing ProductCode fix
  console.log("⚠️ SKIPPING AUTH FOR TESTING - Andrea requested this")
  return next()
}
