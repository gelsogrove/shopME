import { Router } from "express";
import logger from "../../../utils/logger";
import { CustomersController } from "../controllers/customers.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const customersRouter = (controller: CustomersController): Router => {
  const router = Router();

  // Add a special debug endpoint without auth requirement
  // @ts-ignore
  router.get("/:workspaceId/unknown-customers/debug-no-auth", (req, res) => {
    logger.info(`🛠️ No-auth debug endpoint accessed for workspace: ${req.params.workspaceId}`);
    return res.json({ count: 99, debug: true, auth: false });
  });

  // All routes below require authentication
  router.use(authMiddleware);
  
  logger.info("Setting up customers routes");

  // Routes for customers - remove "/workspaces" prefix since we're already mounted on that path
  router.get("/:workspaceId/customers", controller.getCustomersForWorkspace.bind(controller));
  router.post("/:workspaceId/customers", controller.createCustomer.bind(controller));
  router.get("/:workspaceId/customers/:id", controller.getCustomerById.bind(controller));
  router.put("/:workspaceId/customers/:id", controller.updateCustomer.bind(controller));
  router.delete("/:workspaceId/customers/:id", controller.deleteCustomer.bind(controller));
  
  // Route for counting unknown customers - explicitly defined with extra logging
  router.get("/:workspaceId/unknown-customers/count", (req, res, next) => {
    logger.info(`💡 Processing request for unknown-customers count with workspace: ${req.params.workspaceId}`);
    
    // Call the controller method
    return controller.countUnknownCustomers(req, res, next);
  });
  
  // Additional debugging endpoint that returns hardcoded count
  // @ts-ignore
  router.get("/:workspaceId/unknown-customers/count-debug", (req, res) => {
    logger.info(`🔍 Debug count endpoint accessed for workspace: ${req.params.workspaceId}`);
    return res.json({ count: 42, debug: true });
  });
  
  logger.info("Registered route: GET /:workspaceId/unknown-customers/count");
  logger.info("Registered route: GET /:workspaceId/unknown-customers/count-debug");
  logger.info("Registered route: GET /:workspaceId/unknown-customers/debug-no-auth (no auth required)");

  logger.info("Customers routes setup complete");
  return router;
};