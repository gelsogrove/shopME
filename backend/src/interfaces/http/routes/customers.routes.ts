import { Router } from "express";
import logger from "../../../utils/logger";
import { CustomersController } from "../controllers/customers.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

// Router per il mounting principale
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

  // Routes for customers - adjust paths to work with the router mounting
  router.get("/:workspaceId/customers", controller.getCustomersForWorkspace.bind(controller));
  router.post("/:workspaceId/customers", controller.createCustomer.bind(controller));
  router.get("/:workspaceId/customers/:id", controller.getCustomerById.bind(controller));
  router.put("/:workspaceId/customers/:id", controller.updateCustomer.bind(controller));
  router.delete("/:workspaceId/customers/:id", controller.deleteCustomer.bind(controller));
  router.post("/:workspaceId/customers/:id/block", controller.blockCustomer.bind(controller));
  
  // Endpoint alternativo che supporta anche 'bloc' (senza 'k')
  router.post("/:workspaceId/customers/:id/bloc", controller.blockCustomer.bind(controller));
  
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
  logger.info("Registered route: POST /:workspaceId/customers/:id/block");

  logger.info("Customers routes setup complete");
  return router;
};

// Router specifico per quando è montato su /workspaces
export const workspaceCustomersRouter = (controller: CustomersController): Router => {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);
  
  logger.info("Setting up workspace customers routes");

  // Routes for customers under workspaces path - prefix è già /workspaces
  router.get("/:workspaceId/customers", controller.getCustomersForWorkspace.bind(controller));
  router.post("/:workspaceId/customers", controller.createCustomer.bind(controller));
  router.get("/:workspaceId/customers/:id", controller.getCustomerById.bind(controller));
  router.put("/:workspaceId/customers/:id", controller.updateCustomer.bind(controller));
  router.delete("/:workspaceId/customers/:id", controller.deleteCustomer.bind(controller));
  router.post("/:workspaceId/customers/:id/block", controller.blockCustomer.bind(controller));
  
  // Endpoint alternativo che supporta anche 'bloc' (senza 'k')
  router.post("/:workspaceId/customers/:id/bloc", controller.blockCustomer.bind(controller));
  
  // Route for counting unknown customers (workspace specific)
  router.get("/:workspaceId/unknown-customers/count", controller.countUnknownCustomers.bind(controller));
  
  logger.info("Workspace customers routes setup complete");
  return router;
};