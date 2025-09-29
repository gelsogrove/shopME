/**
 * 🛡️ WORKSPACE ACCESS CONTROL MIDDLEWARE
 * 
 * Verifica che l'utente abbia accesso al workspace richiesto
 * e che il customer appartenga a quel workspace
 */

import { Request, Response, NextFunction } from "express"
import { AppError } from "./error.middleware"
import { prisma } from "../../../lib/prisma"
import logger from "../../../utils/logger"

export const workspaceAccessMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || req.user?.userId
    const userRole = req.user?.role
    
    if (!userId) {
      throw new AppError(401, "Authentication required")
    }

    // Get workspaceId from body or params
    const workspaceId = req.body.workspaceId || req.params.workspaceId || req.query.workspaceId
    
    if (!workspaceId) {
      throw new AppError(400, "workspaceId is required")
    }

    // ADMIN users can access any workspace (super admin)
    if (userRole === 'ADMIN') {
      logger.info(`Admin user ${userId} accessing workspace ${workspaceId}`)
      return next()
    }

    // Check if user has access to this workspace
    const userWorkspace = await prisma.userWorkspace.findFirst({
      where: {
        userId: userId,
        workspaceId: workspaceId
      }
    })

    if (!userWorkspace) {
      logger.warn(`User ${userId} attempted to access workspace ${workspaceId} without permission`)
      throw new AppError(403, "Access denied: You don't have permission to access this workspace")
    }

    // If there's a customerId in the request, verify it belongs to the workspace
    const customerId = req.body.customerId || req.params.customerId || req.query.customerId
    
    if (customerId) {
      const customer = await prisma.customers.findFirst({
        where: {
          id: customerId,
          workspaceId: workspaceId
        }
      })

      if (!customer) {
        logger.warn(`User ${userId} attempted to access customer ${customerId} not in their workspace ${workspaceId}`)
        throw new AppError(404, "Customer not found or not accessible")
      }
    }

    logger.info(`Workspace access granted for user ${userId} to workspace ${workspaceId}`, {
      userId,
      workspaceId,
      customerId,
      userRole
    })

    next()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    logger.error("Workspace access middleware error:", error)
    throw new AppError(500, "Internal error during workspace validation")
  }
}