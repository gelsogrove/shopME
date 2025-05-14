import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { MessageRepository } from '../../../repositories/message.repository';
import logger from '../../../utils/logger';

export class ChatController {
  private messageRepository: MessageRepository;
  private prisma: PrismaClient;

  constructor() {
    this.messageRepository = new MessageRepository();
    this.prisma = new PrismaClient();
    logger.info('ChatController initialized');
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
   * Get details for a specific chat session
   */
  async getChatSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      logger.info(`Getting chat session details for sessionId: ${sessionId}`);
      
      if (!sessionId) {
        logger.warn('Session ID is missing in request');
        res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
        return;
      }
      
      // Get chat session details including workspace information
      const chatSession = await this.prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          customer: true,
          workspace: {
            select: {
              id: true,
              name: true,
              isActive: true
            }
          }
        }
      });
      
      if (!chatSession) {
        logger.warn(`Chat session not found for sessionId: ${sessionId}`);
        res.status(404).json({
          success: false,
          error: 'Chat session not found'
        });
        return;
      }
      
      logger.info(`Found chat session: ${JSON.stringify({
        id: chatSession.id,
        customerId: chatSession.customerId,
        workspaceId: chatSession.workspaceId,
        customerName: chatSession.customer?.name || 'Unknown Customer'
      })}`);
      
      res.status(200).json({
        success: true,
        data: chatSession
      });
    } catch (error) {
      logger.error(`Error getting chat session details for ${req.params.sessionId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to get chat session details'
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

  /**
   * Delete a chat session and all associated messages
   */
  async deleteChat(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
        return;
      }
      
      // Delete the chat session and all its messages
      const success = await this.messageRepository.deleteChat(sessionId);
      
      if (success) {
        res.status(200).json({
          success: true,
          message: 'Chat deleted successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to delete chat'
        });
      }
    } catch (error) {
      logger.error(`Error deleting chat session ${req.params.sessionId}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete chat'
      });
    }
  }
} 