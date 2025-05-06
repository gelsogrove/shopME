import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { TokenService } from '../../application/services/token.service';
import { WelcomeService } from '../../application/services/welcome.service';
import logger from '../../utils/logger';

const prisma = new PrismaClient();
const tokenService = new TokenService();
const welcomeService = new WelcomeService();

/**
 * Registration controller
 */
export class RegistrationController {
  /**
   * Validate registration token
   * @param req Request
   * @param res Response
   */
  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      
      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }
      
      const tokenData = await tokenService.validateToken(token);
      
      if (!tokenData) {
        res.status(404).json({ error: 'Invalid or expired token' });
        return;
      }
      
      res.status(200).json({
        valid: true,
        phoneNumber: tokenData.phoneNumber,
        workspaceId: tokenData.workspaceId,
        expiresAt: tokenData.expiresAt
      });
    } catch (error) {
      logger.error('Error validating token:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Register a new customer
   * @param req Request
   * @param res Response
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const {
        token,
        first_name,
        last_name,
        company,
        phone,
        workspace_id,
        language,
        currency,
        gdpr_consent,
        push_notifications_consent
      } = req.body;
      
      // Validate required fields
      if (!token || !first_name || !last_name || !company || !phone || !workspace_id || !gdpr_consent) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      
      // Validate the registration token
      const tokenData = await tokenService.validateToken(token);
      
      if (!tokenData || tokenData.phoneNumber !== phone || tokenData.workspaceId !== workspace_id) {
        res.status(401).json({ error: 'Invalid or expired registration token' });
        return;
      }
      
      // Check if workspace exists
      const workspace = await prisma.workspace.findUnique({
        where: {
          id: workspace_id
        }
      });
      
      if (!workspace) {
        res.status(404).json({ error: 'Workspace not found' });
        return;
      }
      
      // Check if customer exists by phone number
      const existingCustomer = await prisma.customers.findFirst({
        where: {
          phone,
          workspaceId: workspace_id
        }
      });
      
      let customer;
      
      if (existingCustomer) {
        // Update existing customer
        customer = await prisma.customers.update({
          where: {
            id: existingCustomer.id
          },
          data: {
            name: `${first_name} ${last_name}`,
            email: existingCustomer.email, // Keep existing email
            company,
            language: language || 'English',
            currency: currency || 'EUR',
            last_privacy_version_accepted: '1.0.0', // Current privacy policy version
            privacy_accepted_at: new Date(),
            push_notifications_consent: push_notifications_consent || false,
            push_notifications_consent_at: push_notifications_consent ? new Date() : null
          }
        });
      } else {
        // Create new customer
        customer = await prisma.customers.create({
          data: {
            name: `${first_name} ${last_name}`,
            email: `${phone.replace(/[^0-9]/g, '')}@placeholder.com`, // Placeholder email
            phone,
            company,
            workspaceId: workspace_id,
            language: language || 'English',
            currency: currency || 'EUR',
            last_privacy_version_accepted: '1.0.0', // Current privacy policy version
            privacy_accepted_at: new Date(),
            push_notifications_consent: push_notifications_consent || false,
            push_notifications_consent_at: push_notifications_consent ? new Date() : null
          }
        });
      }
      
      // Mark token as used
      await tokenService.markTokenAsUsed(token);
      
      // Send welcome message asynchronously
      // We don't await here so we can return a response to the user quickly
      welcomeService.sendWelcomeMessage(customer.id)
        .then(success => {
          if (success) {
            logger.info(`Welcome message sent successfully to customer ${customer.id}`);
          } else {
            logger.error(`Failed to send welcome message to customer ${customer.id}`);
          }
        })
        .catch(error => {
          logger.error('Error sending welcome message:', error);
        });
      
      res.status(200).json({
        success: true,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone
        },
        message: 'Registration successful'
      });
    } catch (error) {
      logger.error('Error registering customer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Get data protection and encryption info
   * @param req Request
   * @param res Response
   */
  async getDataProtectionInfo(req: Request, res: Response): Promise<void> {
    try {
      const { lang } = req.query;
      
      // Default language is English
      const language = lang?.toString() || 'en';
      
      // This would ideally come from a database or translation files
      // For now, we'll use a simple switch statement
      let content;
      
      switch (language.toLowerCase()) {
        case 'it':
          content = {
            title: 'Come proteggiamo i tuoi dati',
            content: 'Il nostro sistema utilizza tecniche avanzate di tokenizzazione per proteggere i tuoi dati personali. Quando invii un messaggio, i tuoi dati personali vengono sostituiti con token casuali prima di essere elaborati dai nostri modelli di intelligenza artificiale. Questi token vengono poi sostituiti con i dati originali solo quando il messaggio viene inviato a te.',
            sections: [
              {
                title: 'Il nostro processo di sicurezza',
                content: 'Ogni dato sensibile viene criptato e protetto secondo gli standard più elevati.'
              },
              {
                title: 'Conformità GDPR',
                content: 'Siamo pienamente conformi alle normative GDPR per la protezione dei dati personali.'
              }
            ]
          };
          break;
        default: // English as default
          content = {
            title: 'How we protect your data',
            content: 'Our system uses advanced tokenization techniques to protect your personal data. When you send a message, your personal data is replaced with random tokens before being processed by our AI models. These tokens are then replaced with the original data only when the message is sent back to you.',
            sections: [
              {
                title: 'Our security process',
                content: 'Every sensitive piece of data is encrypted and protected according to the highest standards.'
              },
              {
                title: 'GDPR compliance',
                content: 'We are fully compliant with GDPR regulations for the protection of personal data.'
              }
            ]
          };
      }
      
      res.status(200).json(content);
    } catch (error) {
      logger.error('Error getting data protection info:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 