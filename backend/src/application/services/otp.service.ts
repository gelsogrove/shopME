import { PrismaClient } from "@prisma/client"
import crypto from "crypto"
import * as qrcode from "qrcode"
import * as speakeasy from "speakeasy"
import { AppError } from "../../interfaces/http/middlewares/error.middleware"

export class OtpService {
  constructor(private readonly prisma: PrismaClient) {}

  async setupTwoFactor(userId: string): Promise<string> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: "Shop App",
      issuer: "Shop App",
    })

    // Save secret to user
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    })

    // Generate QR code
    const otpauthUrl = secret.otpauth_url
    if (!otpauthUrl) {
      throw new AppError(500, "Failed to generate OTP auth URL")
    }

    try {
      const qrCodeUrl = await qrcode.toDataURL(otpauthUrl)
      return qrCodeUrl
    } catch (error) {
      throw new AppError(500, "Failed to generate QR code")
    }
  }

  async verifyTwoFactor(userId: string, token: string): Promise<boolean> {
    // Get user's secret
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    })

    if (!user?.twoFactorSecret) {
      throw new AppError(400, "2FA not set up for this user")
    }

    // Verify token
    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 1, // Allow 1 step before/after for time drift
    })
  }

  async generateOtp(userId: string): Promise<string> {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Hash the OTP before storing
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex")

    // Store the OTP
    await this.prisma.otpToken.create({
      data: {
        userId,
        otpHash,
        expiresAt,
      },
    })

    return otp
  }

  async verifyOtp(userId: string, otp: string): Promise<boolean> {
    // Hash the provided OTP
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex")

    // Find valid OTP
    const validOtp = await this.prisma.otpToken.findFirst({
      where: {
        userId,
        otpHash,
        expiresAt: {
          gt: new Date(),
        },
        usedAt: null,
      },
    })

    if (!validOtp) {
      return false
    }

    // Mark OTP as used
    await this.prisma.otpToken.update({
      where: { id: validOtp.id },
      data: { usedAt: new Date() },
    })

    return true
  }

  async cleanupExpiredOtps(): Promise<void> {
    await this.prisma.otpToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
      },
    })
  }
}
