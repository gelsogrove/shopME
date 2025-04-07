import { Router } from "express"
import { WorkspaceController } from "../controllers/workspace.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import {
  validateCreateWorkspace,
  validateUpdateWorkspace,
} from "../middlewares/workspace.validation"

export const workspaceRouter = (controller: WorkspaceController): Router => {
  const router = Router()

  // Public routes
  router.get("/", controller.listWorkspaces.bind(controller))
  router.get("/:id", controller.getWorkspace.bind(controller))

  // Protected routes
  router.use(authMiddleware)
  router.post(
    "/",
    validateCreateWorkspace,
    controller.createWorkspace.bind(controller)
  )
  router.put(
    "/:id",
    validateUpdateWorkspace,
    controller.updateWorkspace.bind(controller)
  )
  router.delete("/:id", controller.deleteWorkspace.bind(controller))

  return router
}
