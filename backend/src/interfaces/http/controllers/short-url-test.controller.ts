import { Request, Response } from "express"
import { urlShortenerService } from "../../../application/services/url-shortener.service"
import logger from "../../../utils/logger"

/**
 * Short URL Test Controller
 * For testing and debugging the URL shortener system
 */
export class ShortUrlTestController {
  /**
   * Test short URL creation and redirection
   * GET /api/test/short-urls
   */
  async testShortUrls(req: Request, res: Response): Promise<void> {
    try {
      // Test data
      const testUrls = [
        "http://localhost:3000/checkout?token=test123456",
        "http://localhost:3000/orders-public?token=test789",
        "http://localhost:3000/customer-profile?token=testProfile",
      ]
      const workspaceId = "test-workspace"

      const results = []

      for (const originalUrl of testUrls) {
        try {
          const { shortCode, shortUrl } =
            await urlShortenerService.createShortUrl(originalUrl, workspaceId)

          results.push({
            originalUrl,
            shortCode,
            shortUrl: `http://localhost:3000${shortUrl}`,
            status: "success",
          })
        } catch (error) {
          results.push({
            originalUrl,
            error: error instanceof Error ? error.message : "Unknown error",
            status: "error",
          })
        }
      }

      res.json({
        success: true,
        message: "Short URL test completed",
        results,
      })
    } catch (error) {
      logger.error("❌ Error in short URL test:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error",
      })
    }
  }

  /**
   * Manually trigger cleanup
   * POST /api/test/short-urls/cleanup
   */
  async triggerCleanup(req: Request, res: Response): Promise<void> {
    try {
      const deletedCount = await urlShortenerService.cleanupOldUrls()

      res.json({
        success: true,
        message: `Cleanup completed: ${deletedCount} expired URLs removed`,
        deletedCount,
      })
    } catch (error) {
      logger.error("❌ Error in manual cleanup:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error",
      })
    }
  }
}

export const shortUrlTestController = new ShortUrlTestController()
