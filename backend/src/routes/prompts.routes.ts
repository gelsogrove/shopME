import { Router } from "express"
import { promptsController } from "../controllers/prompts.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import { wrapController } from "../utils/controller-wrapper"

const router = Router()

// Apply auth middleware to all routes
router.use(wrapController(authMiddleware))

// Routes that require workspaceId
router.get('/workspaces/:workspaceId/prompts', wrapController(promptsController.getAllForWorkspace))
router.post('/workspaces/:workspaceId/prompts', wrapController(promptsController.create))

// Get all prompts
router.get("/", wrapController(promptsController.getAllForWorkspace))

// Get a specific prompt
router.get('/prompts/:id', wrapController(promptsController.getById))
router.put('/prompts/:id', wrapController(promptsController.update))
router.delete('/prompts/:id', wrapController(promptsController.delete))
router.post('/prompts/:id/activate', wrapController(promptsController.activate))
router.post('/prompts/:id/duplicate', wrapController(promptsController.duplicate))

export default router 