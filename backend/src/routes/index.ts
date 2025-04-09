import { Router } from "express"
import authRoutes from "./auth"
import languagesRoutes from "./languages"
import promptsRoutes from "./prompts.routes"
import userRoutes from "./user.routes"
import workspaceRoutes from "./workspace.routes"

const router = Router()

router.use("/auth", authRoutes)
router.use("/workspaces", workspaceRoutes)
router.use("/languages", languagesRoutes)
router.use("/users", userRoutes)
router.use(promptsRoutes)

export default router
