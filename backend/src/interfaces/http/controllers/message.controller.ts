import { Request, Response } from 'express';
import { MessageService } from '../../../application/services/message.service';
import { detectLanguage } from '../../../utils/language-detector';
import logger from '../../../utils/logger';

export class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  /**
   * Process a message and return a response (N8N will handle the business logic)
   * @route POST /api/messages
   */
  async processMessage(req: Request, res: Response): Promise<void> {
    try {
      const { message, phoneNumber, workspaceId, sessionId, isNewConversation } = req.body;

      // Validate required fields
      if (!message || typeof message !== 'string') {
        logger.warn('Invalid request: Message is required and must be a string');
        res.status(400).json({
          success: false,
          error: 'Message is required and must be a string'
        });
        return;
      }

      if (!phoneNumber || typeof phoneNumber !== 'string') {
        logger.warn('Invalid request: Phone number is required and must be a string');
        res.status(400).json({
          success: false,
          error: 'Phone number is required and must be a string'
        });
        return;
      }

      if (!workspaceId || typeof workspaceId !== 'string') {
        logger.warn('Invalid request: Workspace ID is required and must be a string');
        res.status(400).json({
          success: false,
          error: 'Workspace ID is required and must be a string'
        });
        return;
      }

      // Log the request details
      logger.info(`[MESSAGES API] Processing message: ${message}`);
      logger.info(`[MESSAGES API] From phone number: ${phoneNumber}`);
      logger.info(`[MESSAGES API] For workspace: ${workspaceId}`);
      
      // Detect language of the incoming message
      const detectedLanguage = detectLanguage(message);
      logger.info(`[MESSAGES API] Detected language for message: ${detectedLanguage}`);
      
      // Process the message with base MessageService (security only)
      // N8N will handle the business logic through webhooks
      const response = await this.messageService.processMessage(
        message,
        phoneNumber,
        workspaceId
      );
      
      // Return the processed message with metadata
      res.status(200).json({
        success: true,
        data: {
          originalMessage: message,
          processedMessage: response || "Message processed - N8N workflow will handle response",
          phoneNumber: phoneNumber,
          workspaceId: workspaceId,
          timestamp: new Date().toISOString(),
          metadata: { agentName: "N8N Workflow" },
          detectedLanguage: detectedLanguage,
          sessionId: sessionId,
          customerId: `customer-${phoneNumber.replace('+', '')}`,
          customerLanguage: detectedLanguage
        }
      });
    } catch (error) {
      logger.error('[MESSAGES API] Error processing message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process message'
      });
    }
  }
} 