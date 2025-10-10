import { Router } from "express"
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

export { router as shortUrlRoutes }
