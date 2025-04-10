import { Router } from "express"
import { ServicesController } from "../controllers/services.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

export const servicesRouter = (controller: ServicesController): Router => {
  const router = Router()

  // All routes require authentication
  router.use(authMiddleware)

  // Routes for services
  router.get("/workspaces/:workspaceId/services", controller.getServicesForWorkspace.bind(controller))
  router.post("/workspaces/:workspaceId/services", controller.createService.bind(controller))
  router.get("/services/:id", controller.getServiceById.bind(controller))
  router.put("/services/:id", controller.updateService.bind(controller))
  router.delete("/services/:id", controller.deleteService.bind(controller))

  return router
} 