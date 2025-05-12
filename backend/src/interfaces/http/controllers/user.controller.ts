import { NextFunction, Request, Response } from "express"
import { UserService } from "../../../application/services/user.service"
import logger from "../../../utils/logger"

export class UserController {
  private userService: UserService

  constructor(userService?: UserService) {
    this.userService = userService || new UserService()
  }

  /**
   * Get the currently authenticated user
   */
  getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" })
      }
      
      const user = await this.userService.getById(userId)
      
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }
      
      // Don't return the password
      const userWithoutPassword = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        workspaceId: user.workspaceId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin
      }
      
      return res.json(userWithoutPassword)
    } catch (error) {
      logger.error('Error fetching current user:', error)
      return next(error)
    }
  }

  /**
   * Get all users
   */
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if we need to filter by workspace
      const workspaceId = req.query.workspaceId as string
      
      let users
      if (workspaceId) {
        users = await this.userService.getUsersByWorkspace(workspaceId)
      } else {
        users = await this.userService.getAllUsers()
      }
      
      // Don't return passwords
      const usersWithoutPasswords = users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        workspaceId: user.workspaceId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin
      }))
      
      return res.json(usersWithoutPasswords)
    } catch (error) {
      logger.error('Error fetching users:', error)
      return next(error)
    }
  }

  /**
   * Get a specific user by ID
   */
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      
      const user = await this.userService.getById(id)
      
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }
      
      // Don't return the password
      const userWithoutPassword = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        workspaceId: user.workspaceId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin
      }
      
      return res.json(userWithoutPassword)
    } catch (error) {
      logger.error(`Error fetching user ${req.params.id}:`, error)
      return next(error)
    }
  }

  /**
   * Create a new user
   */
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body
      
      const user = await this.userService.create(userData)
      
      // Don't return the password
      const userWithoutPassword = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        workspaceId: user.workspaceId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin
      }
      
      return res.status(201).json(userWithoutPassword)
    } catch (error) {
      logger.error('Error creating user:', error)
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({ message: error.message })
      }
      return next(error)
    }
  }

  /**
   * Update a user
   */
  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userData = req.body
      
      const user = await this.userService.update(id, userData)
      
    } catch (error) {
      logger.error(`Error updating user ${req.params.id}:`, error)
      return next(error)
    }
  }

  /**
   * Delete a user
   */
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      
      const result = await this.userService.delete(id)
      
      if (!result) {
        return res.status(404).json({ message: "User not found" })
      }
      
      return res.status(204).send()
    } catch (error) {
      logger.error(`Error deleting user ${req.params.id}:`, error)
      return next(error)
    }
  }
} 