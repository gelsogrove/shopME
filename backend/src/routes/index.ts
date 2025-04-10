import { Router } from "express"
import { ServicesController } from "../interfaces/http/controllers/services.controller"
import { authRouter } from "../interfaces/http/routes/auth.routes"
import { servicesRouter } from "../interfaces/http/routes/services.routes"
import languagesRoutes from "./languages"
import promptsRoutes from "./prompts.routes"
import userRoutes from "./user.routes"
import workspaceRoutes from "./workspace.routes"

const router = Router()

router.use("/auth", authRouter)
router.use("/workspaces", workspaceRoutes)
router.use("/languages", languagesRoutes)
router.use("/users", userRoutes)
router.use(promptsRoutes)
router.use(servicesRouter(new ServicesController()))

export default router
