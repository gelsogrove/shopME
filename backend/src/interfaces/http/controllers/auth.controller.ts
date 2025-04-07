import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { UserService } from "../../../application/services/user.service"
import logger from "../../../utils/logger"

export class AuthController {
  constructor(private readonly userService: UserService) {}

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" })
      return
    }

    try {
      const user = await this.userService.verifyCredentials(email, password)

      if (!user) {
        res.status(401).json({ message: "Invalid credentials" })
        return
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      )

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000, // 1 hour
      })

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      })
    } catch (error) {
      logger.error("Login error:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  }
}
