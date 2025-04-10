import { Router } from 'express'
import { promptsController } from '../controllers/prompts.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

// Apply auth middleware
router.use(authMiddleware)

// Routes that require workspaceId
router.get('/workspaces/:workspaceId/prompts', promptsController.getAllForWorkspace)
router.post('/workspaces/:workspaceId/prompts', promptsController.create)

// Routes that operate on a specific prompt
router.get('/prompts/:id', promptsController.getById)
router.put('/prompts/:id', promptsController.update)
router.delete('/prompts/:id', promptsController.delete)
router.post('/prompts/:id/activate', promptsController.activate)
router.post('/prompts/:id/duplicate', promptsController.duplicate)

export default router 