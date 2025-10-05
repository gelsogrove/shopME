import { Router } from "express"
import { PushMessagingController } from "../controllers/push-messaging.controller"
import { asyncHandler } from "../middlewares/async.middleware"
import { authMiddleware } from "../middlewares/auth.middleware"
import { pushInputValidationMiddleware } from "../middlewares/push-input-validation.middleware"
import { pushRateLimitMiddleware } from "../middlewares/push-rate-limit.middleware"
import { workspaceAccessMiddleware } from "../middlewares/workspace-access.middleware"

export function createPushMessagingRouter(): Router {
  const router = Router()
  const pushMessagingController = new PushMessagingController()

  // 🔒 SECURITY: Multi-layer protection
  router.use(authMiddleware) // 1. Authentication required
  router.use(pushRateLimitMiddleware) // 2. Rate limiting (10/min user, 50/min admin)
  router.use(workspaceAccessMiddleware) // 3. Workspace access validation
  router.use(pushInputValidationMiddleware) // 4. Input sanitization & validation

  /**
   * 📱 PUSH MESSAGING ROUTES - FULLY SECURED
   *
   * 🔒 SECURITY LAYERS:
   * 1. Authentication: Only authenticated users can access
   * 2. Rate Limiting: 10 push/min (users), 50 push/min (admins)
   * 3. Workspace Validation: Users can only push to their customers
   * 4. Input Validation: All inputs sanitized in controllers
   * 5. Cost Tracking: €0.5 per push logged and monitored
   */

  // POST /push/welcome - Invia messaggio di benvenuto
  router.post(
    "/welcome",
    asyncHandler(
      pushMessagingController.sendUserWelcome.bind(pushMessagingController)
    )
  )

  // POST /push/discount - Invia aggiornamento sconto
  router.post(
    "/discount",
    asyncHandler(
      pushMessagingController.sendDiscountUpdate.bind(pushMessagingController)
    )
  )

  // POST /push/offer - Invia nuova offerta
  router.post(
    "/offer",
    asyncHandler(
      pushMessagingController.sendNewOffer.bind(pushMessagingController)
    )
  )

  // POST /push/chatbot-reactivated - Invia notifica chatbot riattivato
  router.post(
    "/chatbot-reactivated",
    asyncHandler(
      pushMessagingController.sendChatbotReactivated.bind(
        pushMessagingController
      )
    )
  )

  // POST /push/test - Test push messaging
  router.post(
    "/test",
    asyncHandler(
      pushMessagingController.testPushMessage.bind(pushMessagingController)
    )
  )

  return router
}
