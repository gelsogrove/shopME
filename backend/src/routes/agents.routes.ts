import { Router } from "express"
import { agentsController } from "../controllers/agents.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

const router = Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

// Get all agents for a workspace
router.get("/", agentsController.getAllForWorkspace)

// Get a specific agent
router.get("/:id", agentsController.getById)

// Create a new agent
router.post("/", agentsController.create)

// Update an agent
router.put("/:id", agentsController.update)

// Delete an agent
router.delete("/:id", agentsController.delete)

// Duplicate an agent
router.post("/:id/duplicate", agentsController.duplicate)

export default router 