import { Router } from "express"
import { CartTokenController } from "../controllers/cart-token.controller"

/**
 * Routes for cart token management
 * Used by support interface to generate/validate tokens for customer cart access
 */
export const createCartTokenRouter = (): Router => {
  const router = Router()
  const cartTokenController = new CartTokenController()

  // POST /api/cart-tokens - Generate or retrieve cart token
  router.post("/", (req, res) => cartTokenController.getCartToken(req, res))

  // GET /api/cart-tokens/:token/validate - Validate cart token (optional for debugging)
  router.get("/:token/validate", (req, res) =>
    cartTokenController.validateCartToken(req, res)
  )

  return router
}
