import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import rateLimit from "express-rate-limit"
import { OtpService } from "../../../application/services/otp.service"
import { PasswordResetService } from "../../../application/services/password-reset.service"
import { UserService } from "../../../application/services/user.service"
import { AuthController } from "../controllers/auth.controller"
import { asyncHandler } from "../middlewares/async.middleware"
import {
  validateForgotPassword,
  validateResetPassword,
} from "../middlewares/validation.middleware"

const router = Router()

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

// Initialize services and controller
const prisma = new PrismaClient()
const userService = new UserService(prisma)
const otpService = new OtpService(prisma)
const passwordResetService = new PasswordResetService(prisma)
const authController = new AuthController(
  userService,
  otpService,
  passwordResetService
)

// Routes
router.post("/login", asyncHandler(authController.login.bind(authController)))

router.post(
  "/register",
  registerLimiter,
  asyncHandler(authController.register.bind(authController))
)

router.post(
  "/forgot-password",
  validateForgotPassword,
  asyncHandler(authController.forgotPassword.bind(authController))
)

router.post(
  "/reset-password",
  validateResetPassword,
  asyncHandler(authController.resetPassword.bind(authController))
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

export { router as authRouter }
