import { Router } from "express";
import logger from "../../../utils/logger";
import { SettingsController } from "../controllers/settings.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { workspaceAuthMiddleware } from "../middlewares/workspace-auth.middleware";

/**
 * Creates and configures routes for whatsapp settings
 */
export const settingsRouter = (controller: SettingsController): Router => {
  const router = Router();
  
  logger.info("Setting up settings routes");
  
  // Apply auth middleware first (but it will be skipped in test environment)
  // This ensures all routes have authentication in production
  if (process.env.NODE_ENV === 'production') {
    router.use(authMiddleware);
  } else {
    // In non-production environments, still use auth but allow test bypasses
    router.use(authMiddleware);
  }
  
  // Routes for GDPR content
  router.get("/:workspaceId/gdpr", workspaceAuthMiddleware, controller.getGdprContent.bind(controller));
  router.put("/:workspaceId/gdpr", workspaceAuthMiddleware, controller.updateGdprContent.bind(controller));
  router.get("/default-gdpr", controller.getDefaultGdprContent.bind(controller));
  
  // Routes for general settings
  router.get("/:workspaceId", workspaceAuthMiddleware, controller.getSettings.bind(controller));
  router.put("/:workspaceId", workspaceAuthMiddleware, controller.updateSettings.bind(controller));
  router.delete("/:workspaceId", workspaceAuthMiddleware, controller.deleteSettings.bind(controller));
  
  logger.info("Settings routes setup complete");
  return router;
};

/**
 * Creates a route instance with settings controller
 */
export default function createSettingsRouter(): Router {
  return settingsRouter(new SettingsController());
} 