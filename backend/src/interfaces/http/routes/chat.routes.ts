import express from 'express';
import { ChatController } from '../controllers/chat.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

export const chatRouter = (): express.Router => {
  const router = express.Router();
  const chatController = new ChatController();

  // Apply auth middleware to all chat routes
  router.use(authMiddleware);

  /**
   * @route GET /api/chat/recent
   * @desc Get all recent chats with unread counts
   * @access Private
   */
  router.get('/recent', asyncHandler(chatController.getRecentChats.bind(chatController)));

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

  return router;
}; 