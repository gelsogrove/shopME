import { Router } from "express"
import { workspaceController } from "../controllers/workspace.controller"

const router = Router()

router.get("/", workspaceController.getAll)
router.get("/:id", workspaceController.getById)
router.post("/", workspaceController.create)
router.put("/:id", workspaceController.update)
router.delete("/:id", workspaceController.delete)

export default router
