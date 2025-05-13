import { NextFunction, Request, Response } from 'express';
import { WorkspaceContextDTO } from '../../../application/dtos/workspace-context.dto';
import logger from '../../../utils/logger';

// Extend Express Request interface to include workspaceContext
declare global {
  namespace Express {
    interface Request {
      workspaceContext?: WorkspaceContextDTO;
    }
  }
}

/**
 * Middleware to extract and validate workspace context from request
 * This middleware checks for workspace ID in request parameters, query, body, or headers
 */
export const workspaceContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract workspace context from request using the DTO factory method
    const workspaceContext = WorkspaceContextDTO.fromRequest(req);

    if (!workspaceContext || !workspaceContext.isValid()) {
      logger.warn(
        `Invalid workspace context: ${JSON.stringify(req.params)} or ${req.headers["x-workspace-id"]}`
      );
      return res.status(400).json({ error: "Invalid workspace ID format" });
    }

    // Attach workspace context to request for downstream use
    req.workspaceContext = workspaceContext;
    next();
  } catch (error) {
    logger.error(`Error in workspace context middleware: ${error}`);
    return res.status(500).json({ error: "Internal server error" });
  }
}; 