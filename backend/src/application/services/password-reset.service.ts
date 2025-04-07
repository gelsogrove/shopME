import { PrismaClient } from "@prisma/client"
import crypto from "crypto"
import { AppError } from "../../interfaces/http/middlewares/error.middleware"

export class PasswordResetService {
  private readonly tokenExpirationTime = 3600000 // 1 hour in milliseconds

  constructor(private readonly prisma: PrismaClient) {}

  async generateResetToken(email: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new AppError(404, "User not found")
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + this.tokenExpirationTime)

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    return token
  }

  async verifyResetToken(token: string): Promise<string> {
    const resetRecord = await this.prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
        usedAt: null,
      },
    })

    if (!resetRecord) {
      throw new AppError(400, "Invalid or expired reset token")
    }

    return resetRecord.userId
  }

  async markTokenAsUsed(token: string): Promise<void> {
    await this.prisma.passwordReset.update({
      where: { token },
      data: { usedAt: new Date() },
    })
  }
}
