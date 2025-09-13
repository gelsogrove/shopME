import { NextFunction, Request, Response } from 'express';
import { RegistrationService } from '../../../application/services/registration.service';
import { SecureTokenService } from '../../../application/services/secure-token.service';
import { WelcomeService } from '../../../application/services/welcome.service';
import { prisma } from '../../../lib/prisma';
import logger from '../../../utils/logger';

/**
 * RegistrationController class
 * Handles HTTP requests related to customer registration
 */
export class RegistrationController {
  private secureTokenService: SecureTokenService;
  private welcomeService: WelcomeService;
  private registrationService: RegistrationService;
  
  constructor() {
    this.secureTokenService = new SecureTokenService();
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
      
      // Use SecureTokenService for unified token validation
      const validation = await this.secureTokenService.validateToken(token);
      
      if (!validation.valid) {
        return res.status(404).json({ error: 'Invalid or expired token' });
      }
      
      const tokenData = validation.data;
      
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
        email,
        phone,
        workspace_id,
        language,
        currency,
        gdpr_consent,
        push_notifications_consent
      } = req.body;
      
      // Validate required fields
      if (!token || !first_name || !last_name || !company || !email || !phone || !workspace_id || !gdpr_consent) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Use SecureTokenService for unified token validation
      const validation = await this.secureTokenService.validateToken(token);
      
      if (!validation.valid) {
        return res.status(401).json({ error: 'Invalid or expired registration token' });
      }
      
      const tokenData = validation.data;
      
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

      // Check if email already exists for another customer in the same workspace
      const existingEmailCustomer = await prisma.customers.findFirst({
        where: {
          email: email,
          workspaceId: workspace_id,
          id: { not: existingCustomer?.id } // Exclude current customer if updating
        }
      });

      if (existingEmailCustomer) {
        return res.status(409).json({ 
          error: 'Email already registered', 
          message: 'This email address is already registered in our system' 
        });
      }
      
      let customer;
      
      if (existingCustomer) {
        // Update existing customer and ACTIVATE them
        customer = await prisma.customers.update({
          where: {
            id: existingCustomer.id
          },
          data: {
            name: `${first_name} ${last_name}`,
            email: email, // Use the email provided by the user
            company,
            language: language || 'ENG',
            currency: currency || 'EUR',
            last_privacy_version_accepted: '1.0.0', // Current privacy policy version
            privacy_accepted_at: new Date(),
            push_notifications_consent: push_notifications_consent || false,
            push_notifications_consent_at: push_notifications_consent ? new Date() : null,
            isActive: true, // CRITICAL: Activate the customer after registration!
            isBlacklisted: true, // New users are blocked by default
            activeChatbot: false // New users have chatbot disabled by default
          }
        });
      } else {
        // Create new customer with provided email
        customer = await prisma.customers.create({
          data: {
            name: `${first_name} ${last_name}`,
            email: email, // Use the email provided by the user
            phone,
            company,
            workspaceId: workspace_id,
            language: language || 'ENG',
            currency: currency || 'EUR',
            last_privacy_version_accepted: '1.0.0', // Current privacy policy version
            privacy_accepted_at: new Date(),
            push_notifications_consent: push_notifications_consent || false,
            push_notifications_consent_at: push_notifications_consent ? new Date() : null,
            isActive: true,
            isBlacklisted: true, // New users are blocked by default
            activeChatbot: false // New users have chatbot disabled by default
          }
        });
      }
      
      // Mark token as used using SecureTokenService
      await this.secureTokenService.markTokenAsUsed(token);
      
      // Clear registration attempts since user successfully registered
      const { RegistrationAttemptsService } = await import('../../../application/services/registration-attempts.service');
      const registrationAttemptsService = new RegistrationAttemptsService(prisma);
      await registrationAttemptsService.clearAttempts(phone, workspace_id);
      
      // Track registration cost (1€)
      await this.trackRegistrationCost(workspace_id, customer.id);
      
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

  /**
   * Send registration confirmation message to user
   */
  private async sendRegistrationConfirmationMessage(
    phoneNumber: string, 
    workspaceId: string, 
    language: string, 
    customerName: string
  ): Promise<void> {
    try {
      // Get workspace settings for after-registration messages
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { afterRegistrationMessages: true }
      });

      if (!workspace?.afterRegistrationMessages) {
        logger.warn(`[REGISTRATION_CONFIRMATION] No after-registration messages configured for workspace ${workspaceId}`);
        return;
      }

      const messages = workspace.afterRegistrationMessages as any;
      let confirmationMessage = messages[language] || messages['en'] || messages['it'];

      if (!confirmationMessage) {
        logger.warn(`[REGISTRATION_CONFIRMATION] No message found for language ${language} in workspace ${workspaceId}`);
        return;
      }

      // Replace [nome] placeholder with actual customer name
      confirmationMessage = confirmationMessage.replace(/\[nome\]/g, customerName);

      // TODO: Send message via WhatsApp API
      // For now, just log the message
      logger.info(`[REGISTRATION_CONFIRMATION] Would send to ${phoneNumber}: ${confirmationMessage}`);
      
      // In a real implementation, you would send this via WhatsApp API
      // await whatsappService.sendMessage(phoneNumber, confirmationMessage, workspaceId);
      
    } catch (error) {
      logger.error(`[REGISTRATION_CONFIRMATION] Error sending confirmation message to ${phoneNumber}:`, error);
    }
  }

  /**
   * Track registration cost (1€) in usage table
   */
  private async trackRegistrationCost(workspaceId: string, customerId: string): Promise<void> {
    try {
      await prisma.usage.create({
        data: {
          workspaceId: workspaceId,
          clientId: customerId,
          price: 1.00 // 1€
        }
      });

      logger.info(`[REGISTRATION_COST] Tracked 1€ registration cost for customer ${customerId} in workspace ${workspaceId}`);
    } catch (error) {
      logger.error(`[REGISTRATION_COST] Error tracking registration cost for customer ${customerId}:`, error);
    }
  }
} 