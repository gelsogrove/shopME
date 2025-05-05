import { Router } from "express";
import { UnknownCustomersController } from "../controllers/unknown-customers.controller";
import { authMiddleware } from "../interfaces/http/middlewares/auth.middleware";
import logger from "../utils/logger";

export default function unknownCustomersRoutes(): Router {
  const router = Router();
  const controller = new UnknownCustomersController();

  // All routes require authentication
  router.use(authMiddleware);

  logger.info("Setting up unknown customers routes");
  
  // Route for counting unknown customers - this path is relative to the mounting point (/workspaces)
  router.get("/:workspaceId/unknown-customers/count", controller.countUnknownCustomers.bind(controller));
  
  // Registriamo esplicitamente questa route con un log per facilità di debug
  logger.info("Registered route: GET /:workspaceId/unknown-customers/count");
  
  logger.info("Unknown customers routes setup complete");

  return router;
} 