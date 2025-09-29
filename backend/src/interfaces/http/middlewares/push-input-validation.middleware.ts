/**
 * 🛡️ PUSH MESSAGING INPUT VALIDATION MIDDLEWARE
 *
 * Validazione e sanitizzazione degli input per push messages
 * Previene injection attacks e garantisce data integrity
 */

import { NextFunction, Request, Response } from "express"
import logger from "../../../utils/logger"
import { AppError } from "./error.middleware"

// UUID regex for validation
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Phone regex for validation
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/

// Allowed message types
const ALLOWED_MESSAGE_TYPES = [
  "USER_REGISTERED",
  "DISCOUNT_UPDATED",
  "NEW_OFFER",
  "CHATBOT_REACTIVATED",
  "ORDER_CONFIRMED",
]

/**
 * Sanitize string input - remove dangerous characters
 */
function sanitizeString(input: string): string {
  if (typeof input !== "string") return ""

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, "") // Remove quotes that could break SQL
    .substring(0, 500) // Limit length
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  return typeof uuid === "string" && UUID_REGEX.test(uuid)
}

/**
 * Validate phone number format
 */
function isValidPhone(phone: string): boolean {
  return typeof phone === "string" && PHONE_REGEX.test(phone)
}

export const pushInputValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { customerId, workspaceId, customerPhone, type, templateData } =
      req.body

    logger.info(`[SECURITY] Validating push input for endpoint ${req.path}`, {
      customerId,
      workspaceId,
      hasPhone: !!customerPhone,
      type,
    })

    // Validate required fields
    if (!customerId || !workspaceId) {
      throw new AppError(400, "customerId and workspaceId are required")
    }

    // Validate UUIDs
    if (!isValidUUID(customerId)) {
      throw new AppError(400, "Invalid customerId format")
    }

    if (!isValidUUID(workspaceId)) {
      throw new AppError(400, "Invalid workspaceId format")
    }

    // Validate phone if provided
    if (customerPhone && !isValidPhone(customerPhone)) {
      throw new AppError(400, "Invalid phone number format")
    }

    // Validate message type if provided
    if (type && !ALLOWED_MESSAGE_TYPES.includes(type)) {
      throw new AppError(
        400,
        `Invalid message type. Allowed: ${ALLOWED_MESSAGE_TYPES.join(", ")}`
      )
    }

    // Sanitize templateData if provided
    if (templateData && typeof templateData === "object") {
      const sanitizedTemplateData: Record<string, any> = {}

      for (const [key, value] of Object.entries(templateData)) {
        if (typeof value === "string") {
          sanitizedTemplateData[key] = sanitizeString(value)
        } else if (typeof value === "number" && isFinite(value)) {
          sanitizedTemplateData[key] = Math.max(0, Math.min(1000, value)) // Clamp numbers
        } else if (typeof value === "boolean") {
          sanitizedTemplateData[key] = value
        }
        // Skip other types for security
      }

      req.body.templateData = sanitizedTemplateData
    }

    // Sanitize other string fields
    if (req.body.reason) {
      req.body.reason = sanitizeString(req.body.reason)
    }

    if (req.body.categoryName) {
      req.body.categoryName = sanitizeString(req.body.categoryName)
    }

    logger.info(`[SECURITY] Push input validation passed`, {
      customerId,
      workspaceId,
      sanitizedFields: Object.keys(req.body),
    })

    next()
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`[SECURITY] Push input validation failed: ${error.message}`, {
        body: req.body,
        path: req.path,
      })
      throw error
    }
    logger.error("[SECURITY] Push input validation middleware error:", error)
    throw new AppError(500, "Input validation error")
  }
}
