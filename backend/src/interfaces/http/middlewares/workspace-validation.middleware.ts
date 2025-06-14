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
): Promise<void> => {
  try {
    console.log('=== WORKSPACE VALIDATION DEBUG ===');
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    console.log('Request params:', req.params);
    console.log('Request query:', req.query);
    console.log('Request headers workspace-related:', {
      'x-workspace-id': req.headers['x-workspace-id'],
      'workspace-id': req.headers['workspace-id']
    });

    // Extract workspace ID from various sources
    let workspaceIdFromParams = req.params.workspaceId;
    const workspaceIdFromQuery = req.query.workspaceId as string;
    const workspaceIdFromHeaders = req.headers['x-workspace-id'] as string;
    
    // CRITICAL FIX: If workspaceId is not in params, extract it from URL manually
    if (!workspaceIdFromParams) {
      // Try to match /workspaces/{workspaceId} pattern
      let urlMatch = req.originalUrl.match(/\/workspaces\/([^\/\?]+)/);
      if (urlMatch && urlMatch[1]) {
        workspaceIdFromParams = urlMatch[1];
        console.log('🔧 EXTRACTED workspaceId from /workspaces/ pattern:', workspaceIdFromParams);
        // Also set it in params for downstream middleware
        req.params.workspaceId = workspaceIdFromParams;
      } else {
        // Try to match /settings/{workspaceId}/gdpr pattern (frontend uses this)
        urlMatch = req.originalUrl.match(/\/settings\/([^\/\?]+)\/gdpr/);
        if (urlMatch && urlMatch[1]) {
          workspaceIdFromParams = urlMatch[1];
          console.log('🔧 EXTRACTED workspaceId from /settings/{workspaceId}/gdpr pattern:', workspaceIdFromParams);
          // Also set it in params for downstream middleware
          req.params.workspaceId = workspaceIdFromParams;
        }
      }
    }
    
    console.log('Workspace ID sources:', {
      fromParams: workspaceIdFromParams,
      fromQuery: workspaceIdFromQuery,
      fromHeaders: workspaceIdFromHeaders
    });

    const workspaceId = workspaceIdFromParams || workspaceIdFromQuery || workspaceIdFromHeaders;
    
    console.log('Final workspaceId:', workspaceId);

    if (!workspaceId || workspaceId.trim() === '') {
      console.log('❌ Workspace ID is missing or empty');
      
      // Create debug response with all the information
      const debugResponse = {
        message: "Workspace ID is required",
        debug: {
          url: req.originalUrl,
          method: req.method,
          params: req.params,
          query: req.query,
          headers: {
            'x-workspace-id': req.headers['x-workspace-id'],
            'workspace-id': req.headers['workspace-id']
          },
          workspaceIdSources: {
            fromParams: workspaceIdFromParams,
            fromQuery: workspaceIdFromQuery,
            fromHeaders: workspaceIdFromHeaders
          },
          finalWorkspaceId: workspaceId
        },
        sqlQuery: "No SQL query executed - workspace ID missing"
      };
      
      res.status(400).json(debugResponse);
      return;
    }

    console.log('✅ Workspace ID found:', workspaceId);

    // Check if workspace exists in database
    console.log('Checking workspace in database...');
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true, isActive: true, isDelete: true }
    });

    const sqlQuery = `SELECT id, name, isActive, isDelete FROM workspace WHERE id = '${workspaceId}'`;
    console.log('SQL Query executed:', sqlQuery);
    console.log('Workspace found:', workspace);

    if (!workspace) {
      console.log('❌ Workspace not found in database');
      
      const debugResponse = {
        message: "Workspace not found",
        debug: {
          workspaceId,
          url: req.originalUrl,
          method: req.method
        },
        sqlQuery
      };
      
      res.status(404).json(debugResponse);
      return;
    }

    if (workspace.isDelete || !workspace.isActive) {
      console.log('❌ Workspace is deleted or inactive');
      
      const debugResponse = {
        message: "Workspace is not available",
        debug: {
          workspaceId,
          workspace,
          url: req.originalUrl,
          method: req.method
        },
        sqlQuery
      };
      
      res.status(403).json(debugResponse);
      return;
    }

    console.log('✅ Workspace validation passed');
    
    // Store workspace info in request
    (req as any).workspace = workspace;
    (req as any).workspaceId = workspaceId;
    
    next();
  } catch (error) {
    console.error('Workspace validation error:', error);
    logger.error('Workspace validation middleware error:', error);
    
    const debugResponse = {
      message: "Workspace validation failed",
      debug: {
        error: (error as Error).message,
        stack: (error as Error).stack,
        url: req.originalUrl,
        method: req.method
      },
      sqlQuery: "Error occurred before SQL execution"
    };
    
    res.status(500).json(debugResponse);
    return;
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