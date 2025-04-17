import { Request, Response } from 'express';
import { MessageRepository } from '../../../infrastructure/repositories/message.repository';
import logger from '../../../utils/logger';

export class ChatController {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  /**
   * Get all recent chats with unread counts
   */
  async getRecentChats(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      
      const chats = await this.messageRepository.getChatSessionsWithUnreadCounts(limit);
      
      res.status(200).json({
        success: true,
        data: chats
      });
    } catch (error) {
      logger.error('Error getting recent chats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get recent chats'
      });
    }
  }

  /**
   * Get messages for a specific chat session
   */
  async getChatMessages(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
        return;
      }
      
      const messages = await this.messageRepository.getChatSessionMessages(sessionId);
      
      // Mark messages as read when they are viewed
      await this.messageRepository.markMessagesAsRead(sessionId);
      
      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (error) {
      logger.error('Error getting chat messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get chat messages'
      });
    }
  }

  /**
   * Mark messages in a chat session as read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
        return;
      }
      
      const success = await this.messageRepository.markMessagesAsRead(sessionId);
      
      res.status(200).json({
        success,
        message: success ? 'Messages marked as read' : 'Failed to mark messages as read'
      });
    } catch (error) {
      logger.error('Error marking messages as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark messages as read'
      });
    }
  }
} 