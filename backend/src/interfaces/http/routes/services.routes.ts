import { Router } from "express"
import { ServicesController } from "../controllers/services.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

export const servicesRouter = (controller: ServicesController): Router => {
  const router = Router()

  // All routes require authentication
  router.use(authMiddleware)

  // Routes for services - using relative paths
  router.get("/", controller.getServicesForWorkspace.bind(controller))
  router.post("/", controller.createService.bind(controller))
  router.get("/:id", controller.getServiceById.bind(controller))
  router.put("/:id", controller.updateService.bind(controller))
  router.delete("/:id", controller.deleteService.bind(controller))

  return router
} 