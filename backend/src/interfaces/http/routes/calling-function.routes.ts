import { NextFunction, Request, Response, Router } from 'express';
import { CallingFunctionController } from '../controllers/calling-function.controller';
import { tokenValidationMiddleware } from '../middlewares/token-validation.middleware';
import logger from '../../../utils/logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     CFProduct:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Product ID
 *         name:
 *           type: string
 *           description: Product name
 *         description:
 *           type: string
 *           description: Product description
 *         price:
 *           type: number
 *           description: Product price
 *         stock:
 *           type: integer
 *           description: Available stock
 *         isActive:
 *           type: boolean
 *           description: Whether the product is active
 *         categoryId:
 *           type: string
 *           description: Category ID
 *         categoryName:
 *           type: string
 *           description: Category name
 *         workspaceId:
 *           type: string
 *           description: Workspace ID
 *     CFService:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Service ID
 *         name:
 *           type: string
 *           description: Service name
 *         description:
 *           type: string
 *           description: Service description
 *         price:
 *           type: number
 *           description: Service price
 *         currency:
 *           type: string
 *           description: Currency
 *         duration:
 *           type: integer
 *           description: Duration in minutes
 *         isActive:
 *           type: boolean
 *           description: Whether the service is active
 *         workspaceId:
 *           type: string
 *           description: Workspace ID
 */

export const callingFunctionRouter = (): Router => {
  const router = Router();
  const controller = new CallingFunctionController();
  
  logger.info('Setting up calling function routes');

  // All CF routes require token validation
  router.use(tokenValidationMiddleware);

  /**
   * @swagger
   * /api/cf/products:
   *   get:
   *     summary: Get all products with active categories for calling function
   *     description: Returns products where product.isActive=true, category.isActive=true, and stock > 1. Requires valid token.
   *     tags: [Calling Function]
   *     security:
   *       - tokenAuth: []
   *     parameters:
   *       - in: query
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: The workspace ID
   *       - in: query
   *         name: categoryId
   *         schema:
   *           type: string
   *         description: Filter by specific category ID
   *     responses:
   *       200:
   *         description: List of products with active categories ordered by category name
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 products:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/CFProduct'
   *                 count:
   *                   type: integer
   *                 workspaceId:
   *                   type: string
   *       400:
   *         description: Missing required parameters
   *       401:
   *         description: Invalid or missing token
   *       403:
   *         description: Token not active
   */
  router.get('/products', (req: Request, res: Response, next: NextFunction): void => {
    controller.getProducts(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/cf/services:
   *   get:
   *     summary: Get all services for calling function
   *     description: Returns all active services for the workspace. Requires valid token.
   *     tags: [Calling Function]
   *     security:
   *       - tokenAuth: []
   *     parameters:
   *       - in: query
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: The workspace ID
   *     responses:
   *       200:
   *         description: List of services
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 services:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/CFService'
   *                 count:
   *                   type: integer
   *                 workspaceId:
   *                   type: string
   *       400:
   *         description: Missing required parameters
   *       401:
   *         description: Invalid or missing token
   *       403:
   *         description: Token not active
   */
  router.get('/services', (req: Request, res: Response, next: NextFunction): void => {
    controller.getServices(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/cf/callOperator:
   *   post:
   *     summary: Request human operator assistance
   *     description: Creates a request for human operator assistance in chat
   *     tags: [Calling Function]
   *     security:
   *       - tokenAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [workspaceId, phoneNumber, chatId, timestamp, message]
   *             properties:
   *               workspaceId:
   *                 type: string
   *                 description: The workspace ID
   *                 example: "ws-123456"
   *               phoneNumber:
   *                 type: string
   *                 description: Customer phone number
   *                 example: "+393331234567"
   *               chatId:
   *                 type: string
   *                 description: Chat session ID
   *                 example: "chat-789"
   *               timestamp:
   *                 type: string
   *                 format: date-time
   *                 description: Timestamp of the request
   *                 example: "2024-12-19T08:30:00Z"
   *               message:
   *                 type: string
   *                 description: Customer message requesting operator
   *                 example: "Voglio parlare con un operatore"
   *     responses:
   *       201:
   *         description: Operator request created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 requestId:
   *                   type: string
   *                   example: "req-123456"
   *                 status:
   *                   type: string
   *                   example: "PENDING"
   *                 message:
   *                   type: string
   *                   example: "Richiesta inviata. Un operatore ti contatterà presto."
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       400:
   *         description: Missing required fields
   *       401:
   *         description: Missing or invalid token
   *       403:
   *         description: Token expired or invalid
   *       500:
   *         description: Internal server error
   */
  router.post('/callOperator', (req: Request, res: Response, next: NextFunction): void => {
    controller.callOperator(req, res).catch(next);
  });

  return router;
};