import express from 'express';
import { ChatController } from '../controllers/chat.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatSession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique ID of the chat session
 *         name:
 *           type: string
 *           description: Name of the chat session
 *         lastMessageAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the last message
 *         unreadCount:
 *           type: integer
 *           description: Number of unread messages
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the chat session was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the chat session was last updated
 *     
 *     ChatMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique ID of the message
 *         sessionId:
 *           type: string
 *           description: ID of the chat session this message belongs to
 *         content:
 *           type: string
 *           description: Content of the message
 *         sender:
 *           type: string
 *           description: Sender of the message (user or system)
 *         isRead:
 *           type: boolean
 *           description: Whether the message has been read
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the message was created
 */

export const chatRouter = (): express.Router => {
  const router = express.Router();
  const chatController = new ChatController();

  /**
   * @swagger
   * /api/chat/debug/{sessionId}:
   *   get:
   *     summary: Debug endpoint to get chat session details without auth (for testing only)
   *     tags: [Chat]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the chat session
   *     responses:
   *       200:
   *         description: Chat session details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ChatSession'
   *       500:
   *         description: Server error
   */
  router.get('/debug/:sessionId', asyncHandler(chatController.getChatSession.bind(chatController)));

  // Apply auth middleware to all remaining chat routes
  router.use(authMiddleware);

  /**
   * @swagger
   * /api/chat/recent:
   *   get:
   *     summary: Get all recent chats with unread counts
   *     tags: [Chat]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Maximum number of chats to return (default 20)
   *     responses:
   *       200:
   *         description: List of recent chat sessions with unread counts
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ChatSession'
   *       500:
   *         description: Server error
   */
  router.get('/recent', asyncHandler(chatController.getRecentChats.bind(chatController)));

  /**
   * @swagger
   * /api/chat/{sessionId}:
   *   get:
   *     summary: Get details for a specific chat session
   *     tags: [Chat]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the chat session
   *     responses:
   *       200:
   *         description: Chat session details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/ChatSession'
   *       400:
   *         description: Session ID is required
   *       500:
   *         description: Server error
   */
  router.get('/:sessionId', asyncHandler(chatController.getChatSession.bind(chatController)));

  /**
   * @swagger
   * /api/chat/{sessionId}/messages:
   *   get:
   *     summary: Get messages for a specific chat session
   *     tags: [Chat]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the chat session
   *     responses:
   *       200:
   *         description: List of chat messages
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ChatMessage'
   *       400:
   *         description: Session ID is required
   *       500:
   *         description: Server error
   */
  router.get('/:sessionId/messages', asyncHandler(chatController.getChatMessages.bind(chatController)));

  /**
   * @swagger
   * /api/chat/{sessionId}/mark-read:
   *   post:
   *     summary: Mark messages in a chat session as read
   *     tags: [Chat]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the chat session
   *     responses:
   *       200:
   *         description: Messages marked as read
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
   *                     count:
   *                       type: integer
   *                       description: Number of messages marked as read
   *       400:
   *         description: Session ID is required
   *       500:
   *         description: Server error
   */
  router.post('/:sessionId/mark-read', asyncHandler(chatController.markAsRead.bind(chatController)));

  /**
   * @swagger
   * /api/chat/{sessionId}:
   *   delete:
   *     summary: Delete a chat session and all its messages
   *     tags: [Chat]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the chat session
   *     responses:
   *       200:
   *         description: Chat session deleted successfully
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
   *                     deleted:
   *                       type: boolean
   *       400:
   *         description: Session ID is required
   *       500:
   *         description: Server error
   */
  router.delete('/:sessionId', asyncHandler(chatController.deleteChat.bind(chatController)));

  /**
   * @swagger
   * /api/chat/test/{sessionId}:
   *   delete:
   *     summary: Test endpoint for deleting a chat session (no auth required)
   *     tags: [Chat]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the chat session
   *     responses:
   *       200:
   *         description: Chat session deleted successfully
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
   *                     deleted:
   *                       type: boolean
   *       400:
   *         description: Session ID is required
   *       500:
   *         description: Server error
   */
  router.delete('/test/:sessionId', asyncHandler(chatController.deleteChat.bind(chatController)));

  return router;
}; 