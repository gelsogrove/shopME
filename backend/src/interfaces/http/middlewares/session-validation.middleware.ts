import { NextFunction, Request, Response } from "express"
import { adminSessionService } from "../../../application/services/admin-session.service"
import logger from "../../../utils/logger"

/**
 * Middleware di validazione SessionID
 *
 * POLICY:
 * - Estrae sessionId da header 'X-Session-Id'
 * - Verifica esistenza e validità (non scaduto, isActive)
 * - Aggiorna lastActivityAt automaticamente
 * - Allega session a req.session
 *
 * ECCEZIONI (non applicare middleware):
 * - /api/auth/login
 * - /api/auth/forgot-password
 * - /api/auth/reset-password
 * - /api/auth/register
 * - /api/health
 * - /api/session/validate (loop infinito!)
 * - /api/whatsapp/webhook (pubblico)
 * - /api/internal/* (JWT token-based)
 */
export const sessionValidationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info(`🔍 [SESSION MIDDLEWARE] Checking ${req.method} ${req.url}`)

    // Estrai sessionId da header
    const sessionId = req.headers["x-session-id"] as string
    logger.info(
      `🔍 [SESSION MIDDLEWARE] SessionID from header: ${sessionId ? sessionId.substring(0, 8) + "..." : "MISSING"}`
    )

    if (!sessionId || sessionId.trim() === "") {
      logger.warn(`⚠️ SessionID missing for ${req.method} ${req.url}`)
      res.status(400).json({
        error: "SessionID is required",
        message: "Missing X-Session-Id header",
      })
      return
    }

    logger.info(
      `🔍 [SESSION MIDDLEWARE] Calling adminSessionService.validateSession...`
    )

    // Valida sessione
    const validation = await adminSessionService.validateSession(sessionId)

    logger.info(
      `🔍 [SESSION MIDDLEWARE] Validation result: ${JSON.stringify(validation)}`
    )

    if (!validation.valid) {
      logger.warn(
        `⚠️ Invalid session for ${req.method} ${req.url}: ${validation.error}`
      )
      res.status(401).json({
        error: "Invalid session",
        message: validation.error,
      })
      return
    }

    // Allega session a request
    const validatedSession = validation.session
    const validatedUser = validatedSession?.user

    if (!validatedSession || !validatedUser) {
      logger.error("❌ Session data is malformed:", {
        validatedSession,
        validatedUser,
      })
      res.status(500).json({
        error: "Session validation failed",
        message: "Session data is malformed",
      })
      return
    }

    // Attach session data to request
    ;(req as any).session = validatedSession
    ;(req as any).sessionUser = validatedUser

    logger.info(
      `✅ Session valid for user ${validatedUser.email} on ${req.method} ${req.url}`
    )

    next()
  } catch (error) {
    logger.error("❌ Session validation middleware CRASH:", error)
    logger.error("❌ Error stack:", (error as Error).stack)
    res.status(500).json({
      error: "Session validation failed",
      message: error instanceof Error ? error.message : "Internal server error",
    })
  }
}
