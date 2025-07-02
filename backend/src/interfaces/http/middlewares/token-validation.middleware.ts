import { NextFunction, Request, Response } from 'express';
import { prisma } from '../../../lib/prisma';
import logger from '../../../utils/logger';

/**
 * Middleware to validate tokens for calling function endpoints
 * Checks if the token exists and is active
 */
export const tokenValidationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header or query parameter
    let token: string | undefined;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.query.token && typeof req.query.token === 'string') {
      token = req.query.token;
    }

    if (!token) {
      logger.warn('Token missing in calling function request');
      res.status(401).json({
        success: false,
        message: 'Token is required',
        error: 'Missing token in Authorization header or query parameter'
      });
      return;
    }

    // Check if token exists and is active in database
    const secureToken = await prisma.secureToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date() // Token not expired
        },
        usedAt: null // Token not used yet (if applicable)
      }
    });

    if (!secureToken) {
      logger.warn(`Invalid or expired token used in calling function: ${token.substring(0, 10)}...`);
      res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
        error: 'Token not found, expired, or already used'
      });
      return;
    }

    // Add token info to request for use in controllers
    (req as any).tokenInfo = {
      tokenId: secureToken.id,
      workspaceId: secureToken.workspaceId,
      type: secureToken.type,
      payload: secureToken.payload
    };

    logger.info(`Valid token used for calling function: ${token.substring(0, 10)}... for workspace: ${secureToken.workspaceId}`);
    next();

  } catch (error) {
    logger.error('Error in token validation middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token validation',
      error: (error as Error).message
    });
  }
};