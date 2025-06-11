import { NextFunction, Request, Response } from 'express';
import { prisma } from '../../../lib/prisma';
import logger from '../../../utils/logger';

/**
 * Middleware to validate that a workspace ID is present in the request
 * This can be in the URL params, headers, or user context
 */
export const workspaceValidationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for workspace ID in different locations
    const workspaceId = 
      req.params.workspaceId || 
      req.headers['x-workspace-id'] as string || 
      (req.user as any)?.workspaceId;

    logger.debug('Workspace validation - checking ID:', {
      fromParams: req.params.workspaceId,
      fromHeaders: req.headers['x-workspace-id'],
      fromUser: (req.user as any)?.workspaceId,
      finalWorkspaceId: workspaceId
    });

    // If no workspace ID found, return error
    if (!workspaceId) {
      logger.warn('Workspace ID missing in request');
      return res.status(400).json({
        success: false,
        error: 'Workspace ID is required'
      });
    }

    // Validate that the workspace exists
    const workspaceExists = await validateWorkspaceId(workspaceId);
    
    if (!workspaceExists) {
      logger.warn(`Invalid workspace ID: ${workspaceId}`);
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    // Add workspace ID to request for downstream handlers
    (req as any).workspaceId = workspaceId;
    
    // Log successful validation
    logger.debug(`Workspace validated: ${workspaceId}`);
    
    next();
  } catch (error) {
    logger.error('Error validating workspace:', error);
    return res.status(500).json({
      success: false,
      error: 'Error validating workspace'
    });
  }
};

/**
 * Helper function to validate if a workspace ID exists
 */
export async function validateWorkspaceId(workspaceId: string): Promise<boolean> {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true }
    });
    
    return !!workspace;
  } catch (error) {
    logger.error(`Error validating workspace ID ${workspaceId}:`, error);
    throw error;
  }
} 