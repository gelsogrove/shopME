import { Router } from "express";
import { CustomersController } from "../controllers/customers.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const customersRouter = (controller: CustomersController): Router => {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);

  // Routes for customers
  router.get("/workspaces/:workspaceId/customers", controller.getCustomersForWorkspace.bind(controller));
  router.post("/workspaces/:workspaceId/customers", controller.createCustomer.bind(controller));
  router.get("/workspaces/:workspaceId/customers/:id", controller.getCustomerById.bind(controller));
  router.put("/workspaces/:workspaceId/customers/:id", controller.updateCustomer.bind(controller));
  router.delete("/workspaces/:workspaceId/customers/:id", controller.deleteCustomer.bind(controller));
  
  // Route for counting unknown customers
  router.get("/workspaces/:workspaceId/unknown-customers/count", controller.countUnknownCustomers.bind(controller));

  return router;
}; 