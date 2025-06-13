import { NextFunction, Request, Response } from 'express';
import logger from '../../../utils/logger';

/**
 * Middleware to extract workspace ID from URL path and add it to request params
 * This handles cases where the workspace ID is in the URL but not in req.params
 */
export const workspaceExtractionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    console.log('🔥🔥🔥 WORKSPACE EXTRACTION MIDDLEWARE CALLED 🔥🔥🔥');
    console.log('=== WORKSPACE EXTRACTION MIDDLEWARE ===');
    console.log('Prima estrazione:', req.params.workspaceId, (req as any).workspaceId, req.originalUrl);
    // If workspaceId is already in params, we're good
    if (req.params.workspaceId) {
      logger.debug(`Workspace ID already in params: ${req.params.workspaceId}`);
      console.log('WorkspaceId già presente in params:', req.params.workspaceId);
      return next();
    }

    // Extract workspace ID from URL path using regex
    const urlPath = req.originalUrl.split('?')[0]; // Remove query params
    const match = urlPath.match(/\/workspaces\/([^\/]+)/);
    
    if (match && match[1]) {
      const workspaceId = match[1];
      logger.debug(`Extracted workspace ID from URL: ${workspaceId}`);
      req.params.workspaceId = workspaceId;
      (req as any).workspaceId = workspaceId;
      console.log('Estratto workspaceId:', workspaceId);
    }
    console.log('Dopo estrazione:', req.params.workspaceId, (req as any).workspaceId);
    next();
  } catch (error) {
    logger.error('Error in workspace extraction middleware:', error);
    next(); // Continue even if extraction fails
  }
}; 