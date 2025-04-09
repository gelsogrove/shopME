import { Router } from "express"
import authRoutes from "./auth"
import languagesRoutes from "./languages"
import workspaceRoutes from "./workspace.routes"

const router = Router()

router.use("/auth", authRoutes)
router.use("/workspaces", workspaceRoutes)
router.use("/languages", languagesRoutes)

export default router
