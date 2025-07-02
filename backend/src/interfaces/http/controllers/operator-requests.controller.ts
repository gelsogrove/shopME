import { Request, Response } from 'express';
import logger from '../../../utils/logger';

export class OperatorRequestsController {

  /**
   * Get all operator requests for a workspace
   * Used by frontend to display icons in chat history
   */
  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { workspaceId } = req.params;
      
      if (!workspaceId) {
        logger.error('WorkspaceId mancante nella richiesta getAll operator requests');
        return res.status(400).json({
          success: false,
          message: 'WorkspaceId is required'
        });
      }

      const { prisma } = await import('../../../lib/prisma');
      
      const operatorRequests = await prisma.operatorRequests.findMany({
        where: {
          workspaceId,
          status: 'PENDING'
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      logger.info(`Retrieved ${operatorRequests.length} operator requests for workspace ${workspaceId}`);

      return res.status(200).json({
        success: true,
        operatorRequests,
        count: operatorRequests.length
      });

    } catch (error) {
      logger.error('Error getting operator requests:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get operator requests',
        error: (error as Error).message
      });
    }
  };

  /**
   * Delete operator request by ID
   * Used when operator takes control of the chat
   */
  deleteById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { workspaceId } = req.query;
      
      if (!id || !workspaceId) {
        logger.error('ID o WorkspaceId mancante nella richiesta delete operator request');
        return res.status(400).json({
          success: false,
          message: 'ID and workspaceId are required'
        });
      }

      const { prisma } = await import('../../../lib/prisma');
      
      // Verify the request belongs to the workspace before deleting
      const operatorRequest = await prisma.operatorRequests.findFirst({
        where: {
          id,
          workspaceId: workspaceId as string
        }
      });

      if (!operatorRequest) {
        logger.error(`Operator request ${id} not found in workspace ${workspaceId}`);
        return res.status(404).json({
          success: false,
          message: 'Operator request not found'
        });
      }

      await prisma.operatorRequests.delete({
        where: { id }
      });

      logger.info(`Deleted operator request ${id} from workspace ${workspaceId}`);

      return res.status(200).json({
        success: true,
        message: 'Operator request deleted successfully',
        deletedId: id
      });

    } catch (error) {
      logger.error('Error deleting operator request:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete operator request',
        error: (error as Error).message
      });
    }
  };

  /**
   * Get operator requests by chatId
   * Used to check if a specific chat has pending operator requests
   */
  getByChatId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { chatId } = req.params;
      const { workspaceId } = req.query;
      
      if (!chatId || !workspaceId) {
        logger.error('ChatId o WorkspaceId mancante nella richiesta getByChatId');
        return res.status(400).json({
          success: false,
          message: 'ChatId and workspaceId are required'
        });
      }

      const { prisma } = await import('../../../lib/prisma');
      
      const operatorRequest = await prisma.operatorRequests.findFirst({
        where: {
          chatId,
          workspaceId: workspaceId as string,
          status: 'PENDING'
        }
      });

      return res.status(200).json({
        success: true,
        hasOperatorRequest: !!operatorRequest,
        operatorRequest: operatorRequest || null
      });

    } catch (error) {
      logger.error('Error getting operator request by chatId:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get operator request',
        error: (error as Error).message
      });
    }
  };
}