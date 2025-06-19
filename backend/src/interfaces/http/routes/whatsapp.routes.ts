import express, { Router } from 'express';
 
import { WhatsAppController } from '../controllers/whatsapp.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: WhatsApp
 *   description: WhatsApp webhook integration (Security Gateway Only)
 */
export const whatsappRouter = (whatsappController: WhatsAppController): Router => {
  const router = express.Router();

  /**
   * @swagger
   * /api/whatsapp/webhook:
   *   post:
   *     summary: Webhook for incoming messages from WhatsApp
   *     tags: [WhatsApp]
   *     description: Webhook endpoint for Meta API to send incoming WhatsApp messages. Processed through Security Gateway and forwarded to N8N.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Webhook received successfully
   *   get:
   *     summary: Webhook verification for Meta API
   *     tags: [WhatsApp]
   *     description: Endpoint for Meta API webhook verification
   *     parameters:
   *       - in: query
   *         name: hub.mode
   *         schema:
   *           type: string
   *       - in: query
   *         name: hub.verify_token
   *         schema:
   *           type: string
   *       - in: query
   *         name: hub.challenge
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Webhook verified successfully
   *       403:
   *         description: Verification failed
   */
  // Public webhook endpoint (no authentication required)
  router.all('/webhook', asyncHandler(whatsappController.handleWebhook.bind(whatsappController)));

  /**
   * @swagger
   * /api/whatsapp/send-operator-message:
   *   post:
   *     summary: Send manual message from operator to customer
   *     tags: [WhatsApp]
   *     security:
   *       - bearerAuth: []
   *     description: Allows operators to send manual messages to customers when they have taken control of the chat (activeChatbot = false)
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - phoneNumber
   *               - message
   *               - workspaceId
   *             properties:
   *               phoneNumber:
   *                 type: string
   *                 description: Customer's phone number
   *               message:
   *                 type: string
   *                 description: Message content to send
   *               workspaceId:
   *                 type: string
   *                 description: Workspace ID
   *     responses:
   *       200:
   *         description: Message sent successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 sentMessage:
   *                   type: string
   *                 phoneNumber:
   *                   type: string
   *                 timestamp:
   *                   type: string
   *       400:
   *         description: Missing required parameters
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  // Authenticated endpoint for operator messages
  router.post('/send-operator-message', authMiddleware, asyncHandler(whatsappController.sendOperatorMessage.bind(whatsappController)));

  return router;
}; 