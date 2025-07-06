import { NextFunction, Request, Response } from 'express';
import { RegistrationService } from '../../../application/services/registration.service';
import { TokenService } from '../../../application/services/token.service';
import { WelcomeService } from '../../../application/services/welcome.service';
import { prisma } from '../../../lib/prisma';
import logger from '../../../utils/logger';

/**
 * RegistrationController class
 * Handles HTTP requests related to customer registration
 */
export class RegistrationController {
  private tokenService: TokenService;
  private welcomeService: WelcomeService;
  private registrationService: RegistrationService;
  
  constructor() {
    this.tokenService = new TokenService();
    this.welcomeService = new WelcomeService();
    this.registrationService = new RegistrationService();
  }
  
  /**
   * Validate registration token
   */
  async validateToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }
      
      let tokenData = null;
      
      try {
        // Try TokenService first
        tokenData = await this.tokenService.validateToken(token);
      } catch (error) {
        // If TokenService fails, try simple token validation
        logger.info(`[VALIDATE-TOKEN] TokenService validation failed, trying simple token validation for: ${token.substring(0, 10)}...`);
        
        tokenData = await prisma.registrationToken.findFirst({
          where: {
            token,
            expiresAt: {
              gt: new Date(), // Token expiration time must be in the future
            },
            usedAt: null, // Token must not have been used yet
          },
        });
        
        if (tokenData) {
          logger.info(`[VALIDATE-TOKEN] Simple token validation successful for: ${token.substring(0, 10)}...`);
        }
      }
      
      if (!tokenData) {
        return res.status(404).json({ error: 'Invalid or expired token' });
      }
      
      res.status(200).json({
        valid: true,
        phoneNumber: tokenData.phoneNumber,
        workspaceId: tokenData.workspaceId,
        expiresAt: tokenData.expiresAt
      });
    } catch (error) {
      logger.error('Error validating token:', error);
      next(error);
    }
  }
  
  /**
   * Register a new customer
   */
  async register(req: Request, res: Response, next: NextFunction) {
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
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Validate the registration token (support both TokenService and simple tokens)
      let tokenData = null;
      
      try {
        // Try TokenService first
        tokenData = await this.tokenService.validateToken(token);
      } catch (error) {
        // If TokenService fails, try simple token validation
        logger.info(`[REGISTRATION] TokenService validation failed, trying simple token validation for: ${token.substring(0, 10)}...`);
        
        tokenData = await prisma.registrationToken.findFirst({
          where: {
            token,
            expiresAt: {
              gt: new Date(), // Token expiration time must be in the future
            },
            usedAt: null, // Token must not have been used yet
          },
        });
        
        if (tokenData) {
          logger.info(`[REGISTRATION] Simple token validation successful for: ${token.substring(0, 10)}...`);
        }
      }
      
      if (!tokenData || tokenData.phoneNumber !== phone || tokenData.workspaceId !== workspace_id) {
        logger.error(`[REGISTRATION] Token validation failed. TokenData:`, tokenData ? 
          { phoneNumber: tokenData.phoneNumber, workspaceId: tokenData.workspaceId, phone, workspace_id } : 
          'No token data');
        return res.status(401).json({ error: 'Invalid or expired registration token' });
      }
      
      // Check if workspace exists
      const workspace = await prisma.workspace.findUnique({
        where: {
          id: workspace_id
        }
      });
      
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
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
        // Update existing customer and ACTIVATE them
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
            push_notifications_consent_at: push_notifications_consent ? new Date() : null,
            isActive: true // CRITICAL: Activate the customer after registration!
          }
        });
      } else {
        // Create new customer with placeholder email
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
            push_notifications_consent_at: push_notifications_consent ? new Date() : null,
            isActive: true
          }
        });
      }
      
      // Mark token as used (support both TokenService and simple tokens)
      try {
        await this.tokenService.markTokenAsUsed(token);
      } catch (error) {
        // If TokenService fails, try simple token marking
        logger.info(`[REGISTRATION] TokenService markAsUsed failed, trying simple token marking for: ${token.substring(0, 10)}...`);
        
        await prisma.registrationToken.update({
          where: {
            token,
          },
          data: {
            usedAt: new Date(),
          },
        });
        
        logger.info(`[REGISTRATION] Simple token marked as used: ${token.substring(0, 10)}...`);
      }
      
      // Send welcome message asynchronously
      this.welcomeService.sendWelcomeMessage(customer.id)
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
      
      // Send after-registration message asynchronously
      this.registrationService.sendAfterRegistrationMessage(customer.id)
        .then(success => {
          if (success) {
            logger.info(`After-registration message sent successfully to customer ${customer.id}`);
          } else {
            logger.error(`Failed to send after-registration message to customer ${customer.id}`);
          }
        })
        .catch(error => {
          logger.error('Error sending after-registration message:', error);
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
      next(error);
    }
  }
  
  /**
   * Get data protection information
   */
  async getDataProtectionInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { lang } = req.query;
      
      // Default language is English
      const language = lang?.toString() || 'en';
      
      // This would ideally come from a database or translation files
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
      next(error);
    }
  }
} 