import * as bcrypt from "bcrypt"
import { Request, Response } from "express"
import * as jwt from "jsonwebtoken"
import { prisma } from "../lib/prisma"

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        workspaces: {
          include: {
            workspace: true
          }
        }
      }
    })

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate JWT token with consistent field names
    const token = jwt.sign(
      { 
        id: user.id, // This will be used as userId in the middleware
        email: user.email,
        role: user.role,
        workspaces: user.workspaces.map(w => ({
          id: w.workspace.id,
          role: w.role
        }))
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    )

    // Set the token as an HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return user data (without token in body)
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        workspaces: user.workspaces.map(w => ({
          id: w.workspace.id,
          name: w.workspace.name,
          role: w.role
        }))
      }
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
} 