import { Router } from "express"
import { agentsController } from "../controllers/agents.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

const router = Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

// Get all agents for a workspace
router.get("/workspaces/:workspaceId/agents", agentsController.getAllForWorkspace)

// Get a specific agent
router.get("/agents/:id", agentsController.getById)

// Create a new agent
router.post("/workspaces/:workspaceId/agents", agentsController.create)

// Update an agent
router.put("/agents/:id", agentsController.update)

// Delete an agent
router.delete("/agents/:id", agentsController.delete)

// Duplicate an agent
router.post("/agents/:id/duplicate", agentsController.duplicate)

export default router 