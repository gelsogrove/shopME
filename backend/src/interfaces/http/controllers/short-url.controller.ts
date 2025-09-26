import { Request, Response } from "express"
import { urlShortenerService } from "../../../application/services/url-shortener.service"
import logger from "../../../utils/logger"

/**
 * Short URL Controller
 * Handles redirection from short URLs to original URLs
 */
export class ShortUrlController {
  /**
   * Redirect from short URL to original URL
   * GET /s/:shortCode
   */
  async redirect(req: Request, res: Response): Promise<void> {
    try {
      const { shortCode } = req.params

      if (!shortCode) {
        res.status(400).json({
          success: false,
          error: "Short code is required",
        })
        return
      }

      // Auto-cleanup old URLs (>1 hour) on each request
      // This runs asynchronously without blocking the redirect
      urlShortenerService.cleanupOldUrls().catch((error) => {
        logger.error("❌ Error in background cleanup:", error)
      })

      logger.info(`📎 Resolving short URL: /s/${shortCode}`)

      const result = await urlShortenerService.resolveShortUrl(shortCode)

      if (!result.success) {
        if (result.notFound) {
          res.status(404).json({
            success: false,
            error: "Short URL not found",
          })
        } else if (result.expired) {
          res.status(410).json({
            success: false,
            error: "Short URL has expired",
          })
        } else {
          res.status(500).json({
            success: false,
            error: "Failed to resolve short URL",
          })
        }
        return
      }

      // Redirect to original URL
      logger.info(`📎 Redirecting to: ${result.originalUrl}`)
      res.redirect(302, result.originalUrl!)
    } catch (error) {
      logger.error("❌ Error in short URL redirect:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error",
      })
    }
  }

  /**
   * Get short URL statistics
   * GET /api/short-urls/:shortCode/stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { shortCode } = req.params

      if (!shortCode) {
        res.status(400).json({
          success: false,
          error: "Short code is required",
        })
        return
      }

      const stats = await urlShortenerService.getShortUrlStats(shortCode)

      if (!stats) {
        res.status(404).json({
          success: false,
          error: "Short URL not found",
        })
        return
      }

      res.json({
        success: true,
        stats,
      })
    } catch (error) {
      logger.error("❌ Error getting short URL stats:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error",
      })
    }
  }
}

export const shortUrlController = new ShortUrlController()
