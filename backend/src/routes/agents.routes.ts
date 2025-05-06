import { Router } from "express"
import { agentsController } from "../controllers/agents.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import { wrapController } from "../utils/controller-wrapper"

const router = Router()

// Apply auth middleware to all routes
router.use(wrapController(authMiddleware))

// Get all agents for a workspace
router.get("/", wrapController(agentsController.getAllForWorkspace))

// Get a specific agent
router.get("/:id", wrapController(agentsController.getById))

// Create a new agent
router.post("/", wrapController(agentsController.create))

// Update an agent
router.put("/:id", wrapController(agentsController.update))

// Delete an agent
router.delete("/:id", wrapController(agentsController.delete))

export default router 