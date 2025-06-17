import { Router } from 'express';
import { asyncMiddleware } from '../../../middlewares/async.middleware';
import { FlowiseController } from '../controllers/flowise.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const flowiseController = new FlowiseController();

/**
 * 🤖 Flowise Integration Routes
 * 
 * Manages visual flow integration for WhatsApp message processing
 */

/**
 * @swagger
 * /api/flowise/health:
 *   get:
 *     summary: Check Flowise service health
 *     tags: [Flowise]
 *     responses:
 *       200:
 *         description: Flowise health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     flowise:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [healthy, unhealthy]
 *                         url:
 *                           type: string
 *                         timestamp:
 *                           type: string
 */
router.get('/health', 
  asyncMiddleware(flowiseController.healthCheck.bind(flowiseController))
);

/**
 * @swagger
 * /api/flowise/flows:
 *   get:
 *     summary: Get available Flowise flows
 *     tags: [Flowise]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available flows
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     flows:
 *                       type: array
 *                       items:
 *                         type: object
 *                     count:
 *                       type: number
 */
router.get('/flows', 
  authMiddleware,
  asyncMiddleware(flowiseController.getFlows.bind(flowiseController))
);

/**
 * @swagger
 * /api/flowise/setup:
 *   post:
 *     summary: Setup WhatsApp flow in Flowise
 *     tags: [Flowise]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: WhatsApp flow created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     flowId:
 *                       type: string
 *                     message:
 *                       type: string
 *                     url:
 *                       type: string
 */
router.post('/setup', 
  authMiddleware,
  asyncMiddleware(flowiseController.setupWhatsAppFlow.bind(flowiseController))
);

/**
 * @swagger
 * /api/flowise/test:
 *   post:
 *     summary: Test message processing with Flowise
 *     tags: [Flowise]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - phoneNumber
 *               - workspaceId
 *             properties:
 *               message:
 *                 type: string
 *                 description: Test message to process
 *                 example: "Ciao, avete mozzarella?"
 *               phoneNumber:
 *                 type: string
 *                 description: Test phone number
 *                 example: "+393331234567"
 *               workspaceId:
 *                 type: string
 *                 description: Workspace ID for testing
 *                 example: "cm9hjgq9v00014qk8fsdy4ujv"
 *     responses:
 *       200:
 *         description: Message processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     input:
 *                       type: object
 *                     output:
 *                       type: object
 *                       properties:
 *                         response:
 *                           type: string
 *                         processingTime:
 *                           type: string
 *                     metadata:
 *                       type: object
 */
router.post('/test', 
  authMiddleware,
  asyncMiddleware(flowiseController.testMessage.bind(flowiseController))
);

/**
 * @swagger
 * /api/flowise/compare:
 *   post:
 *     summary: Compare traditional vs Flowise processing
 *     tags: [Flowise]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - phoneNumber
 *               - workspaceId
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message to process with both methods
 *                 example: "Ciao, avete mozzarella?"
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number for testing
 *                 example: "+393331234567"
 *               workspaceId:
 *                 type: string
 *                 description: Workspace ID for testing
 *                 example: "cm9hjgq9v00014qk8fsdy4ujv"
 *     responses:
 *       200:
 *         description: Comparison results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     input:
 *                       type: object
 *                     comparison:
 *                       type: object
 *                       properties:
 *                         traditional:
 *                           type: object
 *                         flowise:
 *                           type: object
 *                         performance:
 *                           type: object
 */
router.post('/compare', 
  authMiddleware,
  asyncMiddleware(flowiseController.compareProcessing.bind(flowiseController))
);

/**
 * @swagger
 * /api/flowise/config:
 *   get:
 *     summary: Get Flowise configuration
 *     tags: [Flowise]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Flowise configuration details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     configuration:
 *                       type: object
 *                     integration:
 *                       type: object
 *                     endpoints:
 *                       type: object
 */
router.get('/config', 
  authMiddleware,
  asyncMiddleware(flowiseController.getConfiguration.bind(flowiseController))
);

export default router; 