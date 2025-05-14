import { PrismaClient } from '@prisma/client';
import { MessageRepository } from '../../repositories/message.repository';
import logger from '../../utils/logger';

/**
 * Service for handling registration-related functionality
 */
export class RegistrationService {
  private prisma: PrismaClient;
  private messageRepository: MessageRepository;
  
  constructor() {
    this.prisma = new PrismaClient();
    this.messageRepository = new MessageRepository();
  }
  
  /**
   * Send an after-registration message to a newly registered customer
   * 
   * @param customerId The customer ID
   * @returns True if message was sent successfully
   */
  async sendAfterRegistrationMessage(customerId: string): Promise<boolean> {
    try {
      // Get customer data
      const customer = await this.prisma.customers.findUnique({
        where: {
          id: customerId
        },
        include: {
          workspace: true
        }
      });
      
      if (!customer) {
        logger.error(`Customer with ID ${customerId} not found`);
        return false;
      }
      
      // Get customer language
      const customerLanguage = customer.language || 'English';
      
      // Extract first name
      const firstName = customer.name.split(' ')[0];
      
      // Get workspace settings
      const workspaceSettings = await this.messageRepository.getWorkspaceSettings(customer.workspaceId);
      if (!workspaceSettings) {
        logger.error(`Workspace settings not found for workspace ${customer.workspaceId}`);
        return false;
      }
      
      // Get the after-registration message from workspace settings
      const afterRegistrationMessages = (workspaceSettings as any).afterRegistrationMessages as Record<string, string> || {};
      
      // Normalize the language code for lookup
      const normalizedLanguage = this.normalizeLanguageCode(customerLanguage);
      
      // Get message in customer's language or fall back to English
      let afterRegistrationMessage = afterRegistrationMessages[normalizedLanguage] || afterRegistrationMessages['en'];
      
      // If no message found in workspace settings, use default
      if (!afterRegistrationMessage) {
        afterRegistrationMessage = this.getDefaultAfterRegistrationMessage(normalizedLanguage);
      }
      
      // Replace placeholders
      afterRegistrationMessage = afterRegistrationMessage.replace(/\[nome\]/gi, firstName);
      
      // Send the message
      if (customer.phone) {
        try {
          // Use the message repository to save the outgoing message
          await this.messageRepository.saveMessage({
            workspaceId: customer.workspaceId,
            phoneNumber: customer.phone,
            message: '', // No incoming message
            response: afterRegistrationMessage,
            direction: 'OUTBOUND',
            agentSelected: 'Registration' // Mark this message as coming from the Registration agent
          });
          
          logger.info(`After-registration message sent to customer ${customerId}`);
          return true;
        } catch (error) {
          logger.error('Error saving after-registration message:', error);
          return false;
        }
      } else {
        logger.error(`Customer ${customerId} has no phone number`);
        return false;
      }
    } catch (error) {
      logger.error('Error sending after-registration message:', error);
      return false;
    }
  }
  
  /**
   * Normalize language code for consistent lookup
   */
  private normalizeLanguageCode(language: string): string {
    const lowerCaseLanguage = language.toLowerCase();
    
    if (lowerCaseLanguage.includes('ital')) return 'it';
    if (lowerCaseLanguage.includes('engl') || lowerCaseLanguage.includes('ing')) return 'en';
    if (lowerCaseLanguage.includes('span') || lowerCaseLanguage.includes('esp')) return 'es';
    if (lowerCaseLanguage.includes('fran') || lowerCaseLanguage.includes('fr')) return 'fr';
    if (lowerCaseLanguage.includes('deut') || lowerCaseLanguage.includes('germ')) return 'de';
    if (lowerCaseLanguage.includes('port') || lowerCaseLanguage.includes('portu')) return 'pt';
    
    // Default to English if no match
    return 'en';
  }
  
  /**
   * Get default after-registration message in the specified language
   */
  private getDefaultAfterRegistrationMessage(languageCode: string): string {
    switch (languageCode) {
      case 'it':
        return "Registrazione eseguita con successo. Ciao [nome], in cosa posso esserti utile oggi?";
      case 'es':
        return "Registro completado con éxito. Hola [nome], ¿en qué puedo ayudarte hoy?";
      case 'fr':
        return "Enregistrement effectué avec succès. Bonjour [nome], en quoi puis-je vous aider aujourd'hui ?";
      case 'de':
        return "Registrierung erfolgreich abgeschlossen. Hallo [nome], wie kann ich Ihnen heute helfen?";
      case 'pt':
        return "Registro concluído com sucesso. Olá [nome], em que posso ajudá-lo hoje?";
      default: // English
        return "Registration completed successfully. Hello [nome], how can I help you today?";
    }
  }
} 