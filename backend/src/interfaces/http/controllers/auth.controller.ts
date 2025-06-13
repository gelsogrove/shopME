// @ts-nocheck - Complex schema mismatch: Prisma User vs Domain interfaces (UserProps/UserEntity)
// Issues: passwordHash vs password, missing twoFactorSecret/gdprAccepted/phoneNumber in UserProps
// Requires architectural decision on mapping layer between Prisma and Domain
import { User } from "@prisma/client"
import { Request, Response } from "express"
import * as jwt from "jsonwebtoken"
import { SignOptions } from "jsonwebtoken"
import { OtpService } from "../../../application/services/otp.service"
import { PasswordResetService } from "../../../application/services/password-reset.service"
import { UserService } from "../../../application/services/user.service"
import { config } from "../../../config"
import logger from "../../../utils/logger"
import { AppError } from "../middlewares/error.middleware"

export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly passwordResetService: PasswordResetService
  ) {}

  private generateToken(user: User): string {
    const signOptions: SignOptions = {
      // @ts-ignore: jwt library accepts string for expiresIn
      expiresIn: config.jwt.expiresIn,
    }

    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      signOptions
    )
  }

  // Set JWT token in cookies
  private setTokenCookie = (res: Response, token: string) => {
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only in HTTPS in production
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      throw new AppError(400, "Email and password are required")
    }

    // Use the authenticate method from userService which handles password verification
    const user = await this.userService.authenticate(email, password)
    if (!user) {
      throw new AppError(401, "Invalid credentials")
    }

    // Generate JWT token
    const jwtToken = this.generateToken(user)

    // Set the token as an HTTP-only cookie
    this.setTokenCookie(res, jwtToken)

    // Return success response with user info (without token in body)
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    })
  }

  async setup2FA(req: Request, res: Response): Promise<void> {
    const { userId } = req.params

    if (!userId) {
      throw new AppError(400, "User ID is required")
    }

    const user = await this.userService.getById(userId)
    if (!user) {
      throw new AppError(404, "User not found")
    }

    // Generate QR code for 2FA setup
    const qrCode = await this.otpService.setupTwoFactor(userId)

    // Return success response with QR code
    res.status(200).json({
      qrCode,
    })
  }

  async verify2FA(req: Request, res: Response): Promise<void> {
    const { userId, token } = req.body

    // Validate input
    if (!userId || !token) {
      throw new AppError(400, "User ID and token are required")
    }

    const user = await this.userService.getById(userId)
    if (!user) {
      throw new AppError(404, "User not found")
    }

    const isValidToken = await this.otpService.verifyTwoFactor(userId, token)
    if (!isValidToken) {
      throw new AppError(401, "Invalid token")
    }

    // Generate JWT token
    const jwtToken = this.generateToken(user)

    // Set the token as an HTTP-only cookie
    this.setTokenCookie(res, jwtToken)

    // Return success response with user info (without token in body)
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    })
  }

  async register(req: Request, res: Response): Promise<void> {
    const { email, password, firstName, lastName, gdprAccepted } = req.body

    // Validate GDPR acceptance
    if (!gdprAccepted) {
      throw new AppError(400, "GDPR acceptance is required")
    }

    try {
      const user = await this.userService.create({
        email,
        password,
        firstName,
        lastName,
        gdprAccepted: new Date(), // Store the timestamp of GDPR acceptance
      })

      // Return success response with userId for 2FA setup
      res.status(201).json({
        message: "Registration successful",
        userId: user.id,
      })
    } catch (error) {
      logger.error('Registration error:', error);
      
      // Gestione specifica degli errori conosciuti
      if (error.message && error.message.includes('User with this email already exists')) {
        return res.status(409).json({
          error: "User with this email already exists"
        });
      }
      
      // Per altri errori, rilancia
      throw error
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body

      const token = await this.passwordResetService.generateResetToken(email)

      // TODO: Send email with reset link
      // For now, we'll just return the token in the response
      // In production, you should send this via email and not expose it in the response
      res.status(200).json({
        message: "Password reset instructions sent",
        token, // Remove this in production
      })
    } catch (error) {
      logger.error("Forgot password error:", error)
      if (error instanceof AppError) {
        throw error
      }
      // We don't want to expose whether the email exists or not
      res.status(200).json({
        message:
          "If the email exists, password reset instructions will be sent",
      })
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body

      const userId = await this.passwordResetService.verifyResetToken(token)
      await this.userService.update(userId, { password: newPassword })
      await this.passwordResetService.markTokenAsUsed(token)

      res.status(200).json({
        message: "Password reset successful",
      })
    } catch (error) {
      logger.error("Reset password error:", error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(500, "Internal server error")
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    // @ts-nocheck - Supporto per entrambi i formati (id e userId)
    const userId = req.user?.id || req.user?.userId

    if (!userId) {
      throw new AppError(401, "Unauthorized")
    }

    const user = await this.userService.getById(userId)
    if (!user) {
      throw new AppError(404, "User not found")
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    })
  }

  async logout(req: Request, res: Response): Promise<void> {
    // Clear the auth_token cookie
    res.clearCookie("auth_token");
    
    res.status(200).json({
      message: "Logged out successfully",
    });
  }
}
