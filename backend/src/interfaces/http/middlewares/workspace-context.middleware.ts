import { NextFunction, Request, Response } from 'express';
import { WorkspaceContextDTO } from '../../../application/dtos/workspace-context.dto';
import logger from '../../../utils/logger';

/**
 * Middleware to validate and extract workspace context from request
 * Can be used in any route that requires workspace identification
 */
export const workspaceContextMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract workspace context from request using our standardized DTO
    const workspaceContext = WorkspaceContextDTO.fromRequest(req);

    // If no workspace ID is found, return 400 Bad Request
    if (!workspaceContext) {
      logger.error('Missing workspace ID in request', {
        path: req.path,
        method: req.method,
        params: req.params,
        query: req.query,
        headers: req.headers['x-workspace-id']
      });
      
      res.status(400).json({ error: 'Workspace ID is required' });
      return;
    }

    // If workspace ID is not valid, return 400 Bad Request
    if (!workspaceContext.isValid()) {
      logger.error('Invalid workspace ID format', {
        workspaceId: workspaceContext.workspaceId
      });
      
      res.status(400).json({ error: 'Invalid workspace ID format' });
      return;
    }

    // Add workspaceContext to request for use in controllers
    (req as any).workspaceContext = workspaceContext;
    
    // Log successful workspace context extraction
    logger.debug(`Workspace context extracted: ${workspaceContext.workspaceId}`, {
      path: req.path,
      method: req.method
    });

    next();
  } catch (error) {
    logger.error('Error processing workspace context', error);
    res.status(500).json({ error: 'Server error processing workspace context' });
    return;
  }
}; 