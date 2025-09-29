/**
 * 🛡️ PUSH MESSAGING RATE LIMITING MIDDLEWARE
 *
 * Previene abusi costosi del sistema push messaging
 * Limits: 10 push messages per utente per minuto
 */

import { NextFunction, Request, Response } from "express"
import logger from "../../../utils/logger"
import { AppError } from "./error.middleware"

// In-memory rate limit storage (in production use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS: 10, // Max push messages per window
  WINDOW_MS: 60 * 1000, // 1 minute window
  ADMIN_MAX_REQUESTS: 50, // Higher limit for admins
}

export const pushRateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id || req.user?.userId
    const userRole = req.user?.role

    if (!userId) {
      throw new AppError(401, "Authentication required for rate limiting")
    }

    const now = Date.now()
    const key = `push_rate_limit:${userId}`
    const userLimit = rateLimitStore.get(key)

    // Determine rate limit based on user role
    const maxRequests =
      userRole === "ADMIN" || userRole === "OWNER"
        ? RATE_LIMIT_CONFIG.ADMIN_MAX_REQUESTS
        : RATE_LIMIT_CONFIG.MAX_REQUESTS

    // Reset counter if window has expired
    if (!userLimit || now > userLimit.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + RATE_LIMIT_CONFIG.WINDOW_MS,
      })

      logger.info(`Push rate limit initialized for user ${userId}`, {
        userId,
        userRole,
        maxRequests,
        currentCount: 1,
      })

      return next()
    }

    // Increment counter
    userLimit.count++
    rateLimitStore.set(key, userLimit)

    // Check if limit exceeded
    if (userLimit.count > maxRequests) {
      const resetInSeconds = Math.ceil((userLimit.resetTime - now) / 1000)

      logger.warn(`Push rate limit exceeded for user ${userId}`, {
        userId,
        userRole,
        currentCount: userLimit.count,
        maxRequests,
        resetInSeconds,
      })

      res.status(429).json({
        success: false,
        error: "Push messaging rate limit exceeded",
        details: {
          currentCount: userLimit.count,
          maxRequests,
          resetInSeconds,
          message: `Too many push messages. Limit: ${maxRequests} per minute. Try again in ${resetInSeconds} seconds.`,
        },
      })
      return
    }

    logger.info(`Push rate limit check passed for user ${userId}`, {
      userId,
      userRole,
      currentCount: userLimit.count,
      maxRequests,
    })

    next()
  } catch (error) {
    logger.error("Push rate limit middleware error:", error)
    next(error)
  }
}

// Cleanup old entries periodically
setInterval(
  () => {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  },
  5 * 60 * 1000
) // Clean up every 5 minutes
