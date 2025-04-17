import { Request, Response } from 'express';
import { MessageService } from '../../../application/services/message.service';
import logger from '../../../utils/logger';

export class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  /**
   * Process a message and return a response
   * @route POST /api/messages
   */
  async processMessage(req: Request, res: Response): Promise<void> {
    try {
      const { message, phoneNumber, workspaceId } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Message is required and must be a string'
        });
        return;
      }

      // Log the request details
      logger.info(`Processing message: ${message}`);
      if (phoneNumber) {
        logger.info(`From phone number: ${phoneNumber}`);
      }
      if (workspaceId) {
        logger.info(`For workspace: ${workspaceId}`);
      }
      
      // Process the message using the service
      const response = await this.messageService.processMessage(
        message,
        phoneNumber,
        workspaceId
      );
      
      // Return the processed message
      res.status(200).json({
        success: true,
        data: {
          originalMessage: message,
          processedMessage: response,
          phoneNumber: phoneNumber || null,
          workspaceId: workspaceId || null,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error processing message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process message'
      });
    }
  }
} 