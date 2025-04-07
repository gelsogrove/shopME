import { PrismaClient, User, UserRole } from "@prisma/client"
import bcrypt from "bcrypt"
import { AppError } from "../../interfaces/http/middlewares/error.middleware"

export interface CreateUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: UserRole
  gdprAccepted: Date
}

export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  async getUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    })
  }

  async verifyCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
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

  async getUserWithWorkspaces(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        workspaces: {
          include: {
            workspace: true,
          },
        },
      },
    })
  }

  async createUser(data: CreateUserData): Promise<User> {
    const { email, password, firstName, lastName, gdprAccepted } = data

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new AppError(400, "User already exists")
    }

    const passwordHash = await bcrypt.hash(password, 10)

    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        gdprAccepted,
        role: data.role || UserRole.MEMBER,
      },
    })
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new AppError(404, "User not found")
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    })
  }
}
