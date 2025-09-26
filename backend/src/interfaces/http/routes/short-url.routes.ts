import { Router } from "express"
import { shortUrlTestController } from "../controllers/short-url-test.controller"
import { shortUrlController } from "../controllers/short-url.controller"

const router = Router()

/**
 * Short URL Routes
 * Handle URL shortening and redirection
 */

// Redirect from short URL (public route)
router.get("/s/:shortCode", shortUrlController.redirect)

// Get short URL statistics (API route)
router.get("/api/short-urls/:shortCode/stats", shortUrlController.getStats)

// Test endpoints (development only)
router.get("/api/test/short-urls", shortUrlTestController.testShortUrls)
router.post(
  "/api/test/short-urls/cleanup",
  shortUrlTestController.triggerCleanup
)

export { router as shortUrlRoutes }
