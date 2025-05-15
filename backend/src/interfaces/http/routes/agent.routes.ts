import { Router } from 'express';
import logger from '../../../utils/logger';
import { AgentController } from '../controllers/agent.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { workspaceValidationMiddleware } from '../middlewares/workspace-validation.middleware';

/**
 * @swagger
 * components:
 *   schemas:
 *     Agent:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - workspaceId
 *       properties:
 *         id:
 *           type: string
 *           description: Unique ID of the agent
 *         name:
 *           type: string
 *           description: Name of the agent
 *         content:
 *           type: string
 *           description: Content/description of the agent
 *         isActive:
 *           type: boolean
 *           description: Whether the agent is active
 *         isRouter:
 *           type: boolean
 *           description: Whether the agent is a router
 *         department:
 *           type: string
 *           description: Department of the agent
 *         workspaceId:
 *           type: string
 *           description: ID of the workspace the agent belongs to
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the agent was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the agent was last updated
 */

export const createAgentRouter = (): Router => {
  const router = Router();
  const agentController = new AgentController();
  
  logger.info('Setting up agent routes');

  // Apply auth middleware to all routes
  router.use(authMiddleware);
  
  // Apply workspace validation middleware to all routes
  router.use(workspaceValidationMiddleware);

  /**
   * @swagger
   * /api/agent:
   *   get:
   *     summary: Get all agents for a workspace
   *     tags: [Agent]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: header
   *         name: x-workspace-id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the workspace
   *     responses:
   *       200:
   *         description: List of agents
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Agent'
   */
  router.get('/', asyncHandler(agentController.getAllForWorkspace));

  /**
   * @swagger
   * /api/agent/{id}:
   *   get:
   *     summary: Get a specific agent
   *     tags: [Agent]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the agent
   *       - in: header
   *         name: x-workspace-id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the workspace
   *     responses:
   *       200:
   *         description: Agent details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Agent'
   *       404:
   *         description: Agent not found
   */
  router.get('/:id', asyncHandler(agentController.getById));

  /**
   * @swagger
   * /api/agent:
   *   post:
   *     summary: Create a new agent
   *     tags: [Agent]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: header
   *         name: x-workspace-id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the workspace
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 description: Name of the agent
   *               content:
   *                 type: string
   *                 description: Content of the agent
   *               isActive:
   *                 type: boolean
   *                 description: Whether the agent is active
   *                 default: true
   *               isRouter:
   *                 type: boolean
   *                 description: Whether the agent is a router
   *                 default: false
   *               department:
   *                 type: string
   *                 description: Department of the agent
   *     responses:
   *       201:
   *         description: Agent created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Agent'
   */
  router.post('/', asyncHandler(agentController.create));

  /**
   * @swagger
   * /api/agent/{id}:
   *   put:
   *     summary: Update an existing agent
   *     tags: [Agent]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the agent
   *       - in: header
   *         name: x-workspace-id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the workspace
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Name of the agent
   *               content:
   *                 type: string
   *                 description: Content of the agent
   *               isActive:
   *                 type: boolean
   *                 description: Whether the agent is active
   *               department:
   *                 type: string
   *                 description: Department of the agent
   *     responses:
   *       200:
   *         description: Agent updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Agent'
   *       404:
   *         description: Agent not found
   */
  router.put('/:id', asyncHandler(agentController.update));

  /**
   * @swagger
   * /api/agent/{id}:
   *   delete:
   *     summary: Delete an agent
   *     tags: [Agent]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the agent
   *       - in: header
   *         name: x-workspace-id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the workspace
   *     responses:
   *       204:
   *         description: Agent deleted successfully
   *       404:
   *         description: Agent not found
   */
  router.delete('/:id', asyncHandler(agentController.delete));
  
  logger.info('Agent routes setup complete');
  
  return router;
}; 