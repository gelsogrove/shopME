import bcrypt from "bcrypt"
import { Request, Response } from "express"
import { UserService } from "../../../application/services/user.service"
import logger from "../../../utils/logger"
import { AppError } from "../middlewares/error.middleware"

export class UserController {
  constructor(private readonly userService: UserService) {}

  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId

    if (!userId) {
      throw new AppError(401, "Unauthorized")
    }

    const user = await this.userService.getUserById(userId)
    if (!user) {
      throw new AppError(404, "User not found")
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    })
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId
    const { firstName, lastName, email, phoneNumber } = req.body

    if (!userId) {
      throw new AppError(401, "Unauthorized")
    }

    // If email is changed, check if it's already in use
    if (email) {
      const existingUser = await this.userService.getUserByEmail(email)
      if (existingUser && existingUser.id !== userId) {
        throw new AppError(400, "Email already in use")
      }
    }

    const updatedUser = await this.userService.updateUser(userId, {
      firstName,
      lastName,
      email,
      phoneNumber,
    })

    res.status(200).json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
      },
    })
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId
    const { currentPassword, newPassword } = req.body

    if (!userId) {
      throw new AppError(401, "Unauthorized")
    }

    if (!currentPassword || !newPassword) {
      throw new AppError(400, "Current password and new password are required")
    }

    const user = await this.userService.getUserById(userId)
    if (!user) {
      throw new AppError(404, "User not found")
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    )
    if (!isValidPassword) {
      throw new AppError(401, "Invalid current password")
    }

    // Update password
    try {
      await this.userService.updatePassword(userId, newPassword)
      res.status(200).json({ message: "Password updated successfully" })
    } catch (error) {
      logger.error("Error changing password:", error)
      throw new AppError(500, "Failed to update password")
    }
  }
} 