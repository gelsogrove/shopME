import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import request from "supertest"
import app from "../app"
import { PasswordResetService } from "../application/services/password-reset.service"
import { UserService } from "../application/services/user.service"

const prisma = new PrismaClient()
const userService = new UserService(prisma)
const passwordResetService = new PasswordResetService(prisma)

describe("Authentication Endpoints", () => {
  let testUser: any
  let authToken: string

  beforeAll(async () => {
    // Create a test user
    const password = "Test123!@#"
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    testUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        passwordHash,
        firstName: "Test",
        lastName: "User",
        status: "ACTIVE",
      },
    })
  })

  afterAll(async () => {
    // Cleanup test data
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "Test123!@#",
      })

      expect(res.status).toBe(200)
      expect(res.body.message).toBe("Login successful")
      expect(res.body.user).toHaveProperty("id")
      expect(res.body.user.email).toBe("test@example.com")
      expect(res.headers["set-cookie"]).toBeDefined()

      // Save token for protected routes
      authToken = res.headers["set-cookie"][0]
        .split(";")[0]
        .replace("token=", "")
    })

    it("should fail with invalid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      })

      expect(res.status).toBe(401)
      expect(res.body.message).toBe("Invalid credentials")
    })
  })

  describe("GET /api/auth/me", () => {
    it("should get current user details with valid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body.email).toBe("test@example.com")
      expect(res.body.firstName).toBe("Test")
      expect(res.body.lastName).toBe("User")
    })

    it("should fail with invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token")

      expect(res.status).toBe(401)
      expect(res.body.message).toBe("Invalid token")
    })
  })

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "newuser@example.com",
        password: "NewUser123!@#",
        firstName: "New",
        lastName: "User",
      })

      expect(res.status).toBe(201)
      expect(res.body.message).toBe("User registered successfully")
      expect(res.body.user).toHaveProperty("id")
      expect(res.body.user.email).toBe("newuser@example.com")
      expect(res.headers["set-cookie"]).toBeDefined()
    })

    it("should fail with duplicate email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "Test123!@#",
        firstName: "Test",
        lastName: "User",
      })

      expect(res.status).toBe(409)
      expect(res.body.message).toBe("Email already registered")
    })
  })

  describe("POST /api/auth/forgot-password", () => {
    it("should send reset token for existing email", async () => {
      const res = await request(app).post("/api/auth/forgot-password").send({
        email: "test@example.com",
      })

      expect(res.status).toBe(200)
      expect(res.body.message).toBe("Password reset instructions sent")
      expect(res.body.token).toBeDefined() // Remove in production
    })

    it("should not expose email existence", async () => {
      const res = await request(app).post("/api/auth/forgot-password").send({
        email: "nonexistent@example.com",
      })

      expect(res.status).toBe(200)
      expect(res.body.message).toBe(
        "If the email exists, password reset instructions will be sent"
      )
    })
  })

  describe("POST /api/auth/reset-password", () => {
    let resetToken: string

    beforeAll(async () => {
      resetToken =
        await passwordResetService.generateResetToken("test@example.com")
    })

    it("should reset password with valid token", async () => {
      const res = await request(app).post("/api/auth/reset-password").send({
        token: resetToken,
        newPassword: "NewPassword123!@#",
      })

      expect(res.status).toBe(200)
      expect(res.body.message).toBe("Password reset successful")
    })

    it("should fail with invalid token", async () => {
      const res = await request(app).post("/api/auth/reset-password").send({
        token: "invalid-token",
        newPassword: "NewPassword123!@#",
      })

      expect(res.status).toBe(400)
      expect(res.body.message).toBe("Invalid or expired reset token")
    })
  })
})
