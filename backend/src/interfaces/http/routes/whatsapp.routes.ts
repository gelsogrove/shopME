import express, { Router } from 'express';
 
import { WhatsAppController } from '../controllers/whatsapp.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: WhatsApp
 *   description: WhatsApp integration management
 */
export const whatsappRouter = (whatsappController: WhatsAppController): Router => {
  const router = express.Router();

  /**
   * @swagger
   * /api/whatsapp/webhook:
   *   post:
   *     summary: Webhook for incoming messages from WhatsApp
   *     tags: [WhatsApp]
   *     description: Webhook endpoint for Meta API to send incoming WhatsApp messages
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Webhook received successfully
   */
  // Note: webhook routes are now defined in the root router for public access without authentication

  // Apply authentication middleware to all routes
  router.use(authMiddleware);

  /**
   * @swagger
   * /api/whatsapp/settings:
   *   get:
   *     summary: Get WhatsApp settings
   *     tags: [WhatsApp]
   *     security:
   *       - cookieAuth: []
   *     parameters:
   *       - in: query
   *         name: workspace_id
   *         schema:
   *           type: string
   *         required: true
   *         description: Workspace ID
   *     responses:
   *       200:
   *         description: WhatsApp settings
   *       404:
   *         description: Settings not found
   */
  router.get('/settings', asyncHandler(whatsappController.getSettings.bind(whatsappController)));

  /**
   * @swagger
   * /api/whatsapp/settings:
   *   put:
   *     summary: Update WhatsApp settings
   *     tags: [WhatsApp]
   *     security:
   *       - cookieAuth: []
   *     parameters:
   *       - in: query
   *         name: workspace_id
   *         schema:
   *           type: string
   *         required: true
   *         description: Workspace ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               apiKey:
   *                 type: string
   *               phoneNumber:
   *                 type: string
   *               settings:
   *                 type: object
   *     responses:
   *       200:
   *         description: Settings updated
   *       400:
   *         description: Invalid input
   */
  router.put('/settings', asyncHandler(whatsappController.updateSettings.bind(whatsappController)));

  /**
   * @swagger
   * /api/whatsapp/status:
   *   get:
   *     summary: Check WhatsApp connection status
   *     tags: [WhatsApp]
   *     security:
   *       - cookieAuth: []
   *     parameters:
   *       - in: query
   *         name: workspace_id
   *         schema:
   *           type: string
   *         required: true
   *         description: Workspace ID
   *     responses:
   *       200:
   *         description: Connection status
   */
  router.get('/status', asyncHandler(whatsappController.getStatus.bind(whatsappController)));

  /**
   * @swagger
   * /api/whatsapp/send:
   *   post:
   *     summary: Send WhatsApp message
   *     tags: [WhatsApp]
   *     security:
   *       - cookieAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               customer_id:
   *                 type: string
   *               message:
   *                 type: string
   *               workspaceId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Message sent
   *       400:
   *         description: Invalid input
   */
  router.post('/send', asyncHandler(whatsappController.sendMessage.bind(whatsappController)));

  return router;
}; 