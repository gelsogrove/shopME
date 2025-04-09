import { Router } from "express"
import authRoutes from "./auth"
import languagesRoutes from "./languages"
import userRoutes from "./user.routes"
import workspaceRoutes from "./workspace.routes"

const router = Router()

router.use("/auth", authRoutes)
router.use("/workspaces", workspaceRoutes)
router.use("/languages", languagesRoutes)
router.use("/users", userRoutes)

export default router
