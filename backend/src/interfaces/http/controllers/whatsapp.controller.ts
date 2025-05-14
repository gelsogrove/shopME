import { Request, Response } from 'express';
//import { WhatsAppService } from '../../../application/services/whatsapp.service';
import { WhatsAppService } from '../../../application/services/whatsapp.service';
import logger from '../../../utils/logger';

/**
 * Controller for WhatsApp integration
 */
export class WhatsAppController {
  private whatsappService: WhatsAppService;
  
  constructor() {
    this.whatsappService = new WhatsAppService();
  }
  
  /**
   * Handle webhook requests from Meta API
   * This endpoint is public and doesn't require authentication
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      // For GET requests (verification)
      if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        
        // Verify the webhook - in test environment, accept "test-verify-token"
        const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'test-verify-token';
        if (mode === 'subscribe' && token === verifyToken) {
          logger.info('WhatsApp webhook verified');
          res.status(200).send(challenge);
          return;
        }
        
        res.status(403).send('Verification failed');
        return;
      }
      
      // For POST requests (incoming messages)
      const data = req.body;
      logger.info('WhatsApp webhook received', { data });
      
      // Process webhook data
      await this.whatsappService.processWebhook(data);
      
      // Acknowledge receipt of the event
      res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      logger.error('Error handling WhatsApp webhook:', error);
      res.status(500).send('ERROR');
    }
  }
  
  /**
   * Get WhatsApp settings for a workspace
   */
  async getSettings(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.query.workspace_id as string;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Workspace ID is required' 
        });
      }
      
      const settings = await this.whatsappService.getSettings(workspaceId);
      
      if (!settings) {
        return res.status(404).json({ 
          success: false, 
          message: 'WhatsApp settings not found for this workspace' 
        });
      }
      
      return res.status(200).json(settings);
    } catch (error) {
      logger.error('Error getting WhatsApp settings:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to get WhatsApp settings', 
        error: error.message 
      });
    }
  }
  
  /**
   * Update WhatsApp settings for a workspace
   */
  async updateSettings(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.query.workspace_id as string;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Workspace ID is required' 
        });
      }
      
      const settings = await this.whatsappService.updateSettings(workspaceId, req.body);
      
      return res.status(200).json(settings);
    } catch (error) {
      logger.error('Error updating WhatsApp settings:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update WhatsApp settings', 
        error: error.message 
      });
    }
  }
  
  /**
   * Check WhatsApp connection status
   */
  async getStatus(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceId = req.query.workspace_id as string;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Workspace ID is required' 
        });
      }
      
      const status = await this.whatsappService.getConnectionStatus(workspaceId);
      
      return res.status(200).json({ 
        success: true, 
        status 
      });
    } catch (error) {
      logger.error('Error checking WhatsApp connection status:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to check connection status', 
        error: error.message 
      });
    }
  }
  
  /**
   * Send WhatsApp message
   */
  async sendMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { customer_id, phoneNumber, message, workspaceId } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message content is required" });
      }

      if (!workspaceId) {
        return res.status(400).json({ message: "Workspace ID is required" });
      }

      if (!customer_id && !phoneNumber) {
        return res.status(400).json({ message: "Either customer ID or phone number is required" });
      }
      
      const result = await this.whatsappService.sendMessage({
        customerId: customer_id,
        phoneNumber,
        message,
        workspaceId
      });
      
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error sending WhatsApp message:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send WhatsApp message', 
        error: error.message 
      });
    }
  }
} 