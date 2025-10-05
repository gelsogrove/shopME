import { Router } from "express"
import { wrapController } from "../../../utils/controller-wrapper"
import { PromptsController } from "../controllers/prompts.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

export const createPromptsRouter = (
  promptsController: PromptsController
): Router => {
  const router = Router()

  // Apply auth middleware to all routes
  router.use(wrapController(authMiddleware))

  // Add your routes here using promptsController
  router.get(
    "/",
    wrapController(promptsController.getAllPrompts.bind(promptsController))
  )
  router.post(
    "/",
    wrapController(promptsController.createPrompt.bind(promptsController))
  )
  router.get(
    "/:id",
    wrapController(promptsController.getPromptById.bind(promptsController))
  )
  router.put(
    "/:id",
    wrapController(promptsController.updatePrompt.bind(promptsController))
  )
  router.delete(
    "/:id",
    wrapController(promptsController.deletePrompt.bind(promptsController))
  )

  return router
}

export default createPromptsRouter
