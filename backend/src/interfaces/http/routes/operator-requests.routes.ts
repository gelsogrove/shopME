import { NextFunction, Request, Response, Router } from 'express';
import { OperatorRequestsController } from '../controllers/operator-requests.controller';
import logger from '../../../utils/logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     OperatorRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Request ID
 *         workspaceId:
 *           type: string
 *           description: Workspace ID
 *         chatId:
 *           type: string
 *           description: Chat session ID
 *         phoneNumber:
 *           type: string
 *           description: Customer phone number
 *         message:
 *           type: string
 *           description: Customer message
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Request timestamp
 *         status:
 *           type: string
 *           description: Request status
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export const operatorRequestsRouter = (): Router => {
  const router = Router();
  const controller = new OperatorRequestsController();
  
  logger.info('Setting up operator requests routes');

  /**
   * @swagger
   * /api/workspaces/{workspaceId}/operator-requests:
   *   get:
   *     summary: Get all operator requests for workspace
   *     description: Returns all pending operator requests for the workspace
   *     tags: [Operator Requests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: The workspace ID
   *     responses:
   *       200:
   *         description: List of operator requests
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 operatorRequests:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/OperatorRequest'
   *                 count:
   *                   type: integer
   *       400:
   *         description: Missing workspace ID
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:workspaceId/operator-requests', (req: Request, res: Response, next: NextFunction): void => {
    controller.getAll(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/workspaces/{workspaceId}/operator-requests/{id}:
   *   delete:
   *     summary: Delete operator request
   *     description: Deletes an operator request when operator takes control
   *     tags: [Operator Requests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: The workspace ID
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The operator request ID
   *     responses:
   *       200:
   *         description: Operator request deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 deletedId:
   *                   type: string
   *       400:
   *         description: Missing required parameters
   *       404:
   *         description: Operator request not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete('/:workspaceId/operator-requests/:id', (req: Request, res: Response, next: NextFunction): void => {
    // Add workspaceId to query for validation
    req.query.workspaceId = req.params.workspaceId;
    controller.deleteById(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/workspaces/{workspaceId}/operator-requests/by-chat/{chatId}:
   *   get:
   *     summary: Get operator request by chat ID
   *     description: Checks if a specific chat has pending operator requests
   *     tags: [Operator Requests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: The workspace ID
   *       - in: path
   *         name: chatId
   *         schema:
   *           type: string
   *         required: true
   *         description: The chat session ID
   *     responses:
   *       200:
   *         description: Operator request status for chat
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 hasOperatorRequest:
   *                   type: boolean
   *                 operatorRequest:
   *                   $ref: '#/components/schemas/OperatorRequest'
   *       400:
   *         description: Missing required parameters
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get('/:workspaceId/operator-requests/by-chat/:chatId', (req: Request, res: Response, next: NextFunction): void => {
    // Add workspaceId to query for validation
    req.query.workspaceId = req.params.workspaceId;
    controller.getByChatId(req, res).catch(next);
  });

  return router;
};