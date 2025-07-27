import { NextFunction, Request, Response } from 'express';
import logger from '../../../utils/logger';

/**
 * 🚨 CRITICAL SECURITY MIDDLEWARE - WORKSPACE ISOLATION ENFORCEMENT
 * 
 * This middleware ensures that all API calls include proper workspaceId validation
 * and prevents cross-workspace data access at the middleware level.
 */

interface WorkspaceSecurityOptions {
  requireWorkspaceId: boolean;
  allowedSources: ('params' | 'body' | 'query' | 'headers')[];
  logViolations: boolean;
}

/**
 * Middleware to enforce workspace security across all endpoints
 */
export const workspaceSecurityMiddleware = (options: Partial<WorkspaceSecurityOptions> = {}) => {
  const config: WorkspaceSecurityOptions = {
    requireWorkspaceId: true,
    allowedSources: ['params', 'body', 'query', 'headers'],
    logViolations: true,
    ...options
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Extract workspaceId from various sources
      const workspaceIds = extractWorkspaceIds(req, config.allowedSources);
      
      // Security check: ensure only one unique workspaceId
      const uniqueWorkspaceIds = [...new Set(workspaceIds.filter(id => id))];
      
      if (config.requireWorkspaceId && uniqueWorkspaceIds.length === 0) {
        if (config.logViolations) {
          logger.error('🚨 SECURITY VIOLATION: Missing workspaceId', {
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            params: req.params,
            body: sanitizeBody(req.body),
            query: req.query,
            headers: sanitizeHeaders(req.headers)
          });
        }
        
        res.status(400).json({
          error: 'Missing workspaceId',
          code: 'WORKSPACE_ID_REQUIRED',
          message: 'This endpoint requires a valid workspaceId for security'
        });
        return;
      }
      
      if (uniqueWorkspaceIds.length > 1) {
        if (config.logViolations) {
          logger.error('🚨 SECURITY VIOLATION: Multiple conflicting workspaceIds', {
            url: req.originalUrl,
            method: req.method,
            conflictingWorkspaceIds: uniqueWorkspaceIds,
            sources: workspaceIds,
            ip: req.ip
          });
        }
        
        res.status(400).json({
          error: 'Conflicting workspaceIds',
          code: 'WORKSPACE_ID_CONFLICT',
          message: 'Multiple different workspaceIds detected in request',
          details: {
            foundWorkspaceIds: uniqueWorkspaceIds,
            count: uniqueWorkspaceIds.length
          }
        });
        return;
      }
      
      // Store the validated workspaceId in request
      if (uniqueWorkspaceIds.length === 1) {
        (req as any).secureWorkspaceId = uniqueWorkspaceIds[0];
        
        if (config.logViolations) {
          logger.info('✅ Workspace security validated', {
            workspaceId: uniqueWorkspaceIds[0],
            url: req.originalUrl,
            method: req.method
          });
        }
      }
      
      next();
    } catch (error) {
      if (config.logViolations) {
        logger.error('🚨 SECURITY MIDDLEWARE ERROR:', error, {
          url: req.originalUrl,
          method: req.method
        });
      }
      
      res.status(500).json({
        error: 'Workspace security validation failed',
        code: 'WORKSPACE_SECURITY_ERROR'
      });
    }
  };
};

/**
 * Extract workspaceIds from different sources in the request
 */
function extractWorkspaceIds(req: Request, sources: string[]): string[] {
  const workspaceIds: string[] = [];
  
  if (sources.includes('params') && req.params.workspaceId) {
    workspaceIds.push(req.params.workspaceId);
  }
  
  if (sources.includes('body') && req.body?.workspaceId) {
    workspaceIds.push(req.body.workspaceId);
  }
  
  if (sources.includes('query') && req.query.workspaceId) {
    workspaceIds.push(req.query.workspaceId as string);
  }
  
  if (sources.includes('headers')) {
    const headerWorkspaceId = req.headers['x-workspace-id'] as string;
    if (headerWorkspaceId) {
      workspaceIds.push(headerWorkspaceId);
    }
  }
  
  return workspaceIds;
}

/**
 * Sanitize request body for logging (remove sensitive data)
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'sessionToken'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Sanitize headers for logging (remove sensitive data)
 */
function sanitizeHeaders(headers: any): any {
  if (!headers || typeof headers !== 'object') return headers;
  
  const sanitized = { ...headers };
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Strict workspace security middleware that requires workspaceId and logs all violations
 */
export const strictWorkspaceSecurity = workspaceSecurityMiddleware({
  requireWorkspaceId: true,
  allowedSources: ['params', 'body', 'query', 'headers'],
  logViolations: true
});

/**
 * Lenient workspace security middleware for endpoints that may not always need workspaceId
 */
export const lenientWorkspaceSecurity = workspaceSecurityMiddleware({
  requireWorkspaceId: false,
  allowedSources: ['params', 'body', 'query', 'headers'],
  logViolations: true
});

/**
 * Helper function to get the validated workspaceId from request
 */
export function getSecureWorkspaceId(req: Request): string | undefined {
  return (req as any).secureWorkspaceId;
}

/**
 * Decorator for ensuring workspaceId is passed to service methods
 */
export function requireWorkspaceId(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    // Check if the first argument has workspaceId
    if (args.length > 0 && args[0] && typeof args[0] === 'object') {
      if (!args[0].workspaceId) {
        logger.error(`🚨 SECURITY: Method ${propertyName} called without workspaceId`, {
          method: propertyName,
          args: args.length,
          hasRequest: !!args[0].req
        });
        throw new Error(`Method ${propertyName} requires workspaceId for security`);
      }
    }
    
    return method.apply(this, args);
  };
  
  return descriptor;
}