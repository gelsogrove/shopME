import { Router } from "express"
import { HealthController } from "../controllers/health.controller"

export const healthRouter = (controller: HealthController): Router => {
  const router = Router()

  router.get("/", controller.check.bind(controller))

  return router
}
