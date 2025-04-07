import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  async verifyCredentials(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return null
    }

    return user
  }
}
