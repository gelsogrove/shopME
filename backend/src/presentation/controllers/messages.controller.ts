import { Request, Response } from 'express';
import { MessageService } from '../../application/services/message.service';
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
      const { message, phoneNumber, workspaceId } = req.body;
      
      if (!message || !phoneNumber || !workspaceId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      
      const response = await this.messageService.processMessage(message, phoneNumber, workspaceId);
      res.status(200).json({ response });
    } catch (error) {
      logger.error('Error handling message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 