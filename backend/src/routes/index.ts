import { Router } from "express"
import { authRouter } from "../interfaces/http/routes/auth.routes"
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

export default router
