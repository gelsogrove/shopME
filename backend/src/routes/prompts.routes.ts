import { Router } from "express"
import { promptsController } from "../controllers/prompts.controller"

const router = Router()

// GET all prompts for a workspace
router.get("/workspaces/:workspaceId/prompts", promptsController.getAllForWorkspace)

// GET a specific prompt
router.get("/prompts/:id", promptsController.getById)

// CREATE a new prompt for a workspace
router.post("/workspaces/:workspaceId/prompts", promptsController.create)

// UPDATE a prompt
router.put("/prompts/:id", promptsController.update)

// DELETE a prompt
router.delete("/prompts/:id", promptsController.delete)

// ACTIVATE a prompt (and deactivate all others)
router.post("/prompts/:id/activate", promptsController.activate)

export default router 