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
   * Process a message and return a response
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
      logger.info(`Processing message: ${message}`);
      logger.info(`From phone number: ${phoneNumber}`);
      logger.info(`For workspace: ${workspaceId}`);
      
      // Detect language of the incoming message
      const detectedLanguage = detectLanguage(message);
      logger.info(`Detected language for message: ${detectedLanguage}`);
      
      // Process the message using the service
      const response = await this.messageService.processMessage(
        message,
        phoneNumber,
        workspaceId
      );
      
      // Get the last message which should include the metadata
      const messageRepository = this.messageService.getMessageRepository();
      const recentMessages = await messageRepository.getLatesttMessages(phoneNumber, 1);
      const lastMessage = recentMessages[0];
      const metadata = lastMessage?.metadata || {};
      
      // Find the customer to get the updated language preference
      const customer = await messageRepository.findCustomerByPhone(phoneNumber, workspaceId);
      
      // Return the processed message with metadata
      res.status(200).json({
        success: true,
        data: {
          originalMessage: message,
          processedMessage: response,
          phoneNumber: phoneNumber,
          workspaceId: workspaceId,
          timestamp: new Date().toISOString(),
          metadata: metadata,
          detectedLanguage: detectedLanguage,
          sessionId: lastMessage?.chatSessionId || sessionId,
          customerId: customer?.id,
          customerLanguage: customer?.language
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