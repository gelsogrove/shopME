import { Router } from "express"
import { workspaceController } from "../controllers/workspaceController"
import { authMiddleware } from "../middlewares/authMiddleware"

const router = Router()

// Public routes
router.get("/", workspaceController.getAll)
router.get("/:id", workspaceController.getOne)

// Protected routes
router.post("/", authMiddleware, workspaceController.create)
router.put("/:id", authMiddleware, workspaceController.update)
router.delete("/:id", authMiddleware, workspaceController.delete)

export default router
