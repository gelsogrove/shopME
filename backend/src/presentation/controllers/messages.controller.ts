import { Request, Response } from 'express';
import { MessageService } from '../../application/services/message.service';
import { detectLanguage } from '../../utils/language-detector';
import logger from '../../utils/logger';

/**
 * Controller for handling messages
 */
export class MessagesController {
  private messageService: MessageService;
  
  constructor() {
    this.messageService = new MessageService();
  }
  
  /**
   * Handle incoming message
   * @param req Request
   * @param res Response
   */
  async handleMessage(req: Request, res: Response): Promise<void> {
    try {
      const { message, phoneNumber, workspaceId, sessionId, isNewConversation } = req.body;
      
      if (!message || !phoneNumber || !workspaceId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      
      // Detect language of the incoming message
      const detectedLanguage = detectLanguage(message);
      logger.info(`Detected language for message: ${detectedLanguage}`);
      
      // Process the message
      const response = await this.messageService.processMessage(message, phoneNumber, workspaceId);
      
      // Get the message repository to find customer info
      const messageRepository = this.messageService.getMessageRepository();
      const customer = await messageRepository.findCustomerByPhone(phoneNumber, workspaceId);
      
      // Return response with language information
      res.status(200).json({ 
        success: true,
        data: {
          processedMessage: response,
          detectedLanguage,
          sessionId: sessionId || null,
          customerId: customer?.id,
          isNewConversation: isNewConversation || false
        }
      });
    } catch (error) {
      logger.error('Error handling message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 