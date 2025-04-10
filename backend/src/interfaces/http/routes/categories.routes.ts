import { Router } from "express";
import { CategoriesController } from "../controllers/categories.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const categoriesRouter = (controller: CategoriesController): Router => {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);

  // Routes for categories
  router.get("/workspaces/:workspaceId/categories", controller.getCategoriesForWorkspace.bind(controller));
  router.post("/workspaces/:workspaceId/categories", controller.createCategory.bind(controller));
  router.get("/categories/:id", controller.getCategoryById.bind(controller));
  router.put("/categories/:id", controller.updateCategory.bind(controller));
  router.delete("/categories/:id", controller.deleteCategory.bind(controller));

  return router;
}; 