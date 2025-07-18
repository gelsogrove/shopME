import { Router } from "express"
import rateLimit from "express-rate-limit"
import { AuthController } from "../controllers/auth.controller"
import { asyncHandler } from "../middlewares/async.middleware"
import { authMiddleware } from "../middlewares/auth.middleware"
import { validateForgotPassword, validateResetPassword } from "../middlewares/validation.middleware"

// Rate limiters
const twoFactorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    error: "Too many 2FA verification attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: { error: "Too many registration attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
})

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 password reset requests per windowMs
  message: { error: "Too many password reset attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
})

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router()

  // Routes
  router.post("/login", asyncHandler(authController.login.bind(authController)))

  router.get("/me", authMiddleware, asyncHandler(authController.me.bind(authController)))

  router.post("/logout", authMiddleware, asyncHandler(authController.logout.bind(authController)))

  router.post(
    "/register",
    registerLimiter,
    asyncHandler(authController.register.bind(authController))
  )

  // 2FA routes
  router.get(
    "/2fa/setup/:userId",
    twoFactorLimiter,
    asyncHandler(authController.setup2FA.bind(authController))
  )

  router.post(
    "/2fa/verify",
    twoFactorLimiter,
    asyncHandler(authController.verify2FA.bind(authController))
  )

  // Password reset routes
  router.post(
    "/forgot-password",
    passwordResetLimiter,
    validateForgotPassword,
    asyncHandler(authController.forgotPassword.bind(authController))
  )

  router.post(
    "/reset-password",
    passwordResetLimiter,
    validateResetPassword,
    asyncHandler(authController.resetPassword.bind(authController))
  )

  return router
}

export { createAuthRouter as authRouter }
