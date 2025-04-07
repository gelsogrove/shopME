import { Router } from "express"
import { AuthController } from "../controllers/auth.controller"

export const authRouter = (authController: AuthController): Router => {
  const router = Router()

  router.post("/login", (req, res) => authController.login(req, res))

  return router
}
