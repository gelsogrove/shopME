import express from 'express';
import { MessageController } from '../controllers/message.controller';
import { asyncHandler } from '../middlewares/async.middleware';

export const messagesRouter = (): express.Router => {
  const router = express.Router();
  const messageController = new MessageController();

  /**
   * @route POST /api/messages
   * @desc Process a message and return a response
   * @access Public
   */
  router.post('/', asyncHandler(messageController.processMessage.bind(messageController)));

  return router;
}; 