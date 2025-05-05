import express from 'express';
import { ChatController } from '../controllers/chat.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

export const chatRouter = (): express.Router => {
  const router = express.Router();
  const chatController = new ChatController();

  /**
   * @route GET /api/chat/debug/:sessionId
   * @desc Debug endpoint to get chat session details without auth (for testing only)
   * @access Public
   */
  router.get('/debug/:sessionId', asyncHandler(chatController.getChatSession.bind(chatController)));

  // Apply auth middleware to all remaining chat routes
  router.use(authMiddleware);

  /**
   * @route GET /api/chat/recent
   * @desc Get all recent chats with unread counts
   * @access Private
   */
  router.get('/recent', asyncHandler(chatController.getRecentChats.bind(chatController)));

  /**
   * @route GET /api/chat/:sessionId
   * @desc Get details for a specific chat session
   * @access Private
   */
  router.get('/:sessionId', asyncHandler(chatController.getChatSession.bind(chatController)));

  /**
   * @route GET /api/chat/:sessionId/messages
   * @desc Get messages for a specific chat session
   * @access Private
   */
  router.get('/:sessionId/messages', asyncHandler(chatController.getChatMessages.bind(chatController)));

  /**
   * @route POST /api/chat/:sessionId/mark-read
   * @desc Mark messages in a chat session as read
   * @access Private
   */
  router.post('/:sessionId/mark-read', asyncHandler(chatController.markAsRead.bind(chatController)));

  /**
   * @route DELETE /api/chat/:sessionId
   * @desc Delete a chat session and all its messages
   * @access Private
   */
  router.delete('/:sessionId', asyncHandler(chatController.deleteChat.bind(chatController)));

  /**
   * @route DELETE /api/chat/test/:sessionId
   * @desc Test endpoint for deleting a chat session (no auth required)
   * @access Public
   */
  router.delete('/test/:sessionId', asyncHandler(chatController.deleteChat.bind(chatController)));

  return router;
}; 