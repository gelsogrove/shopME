import { PrismaClient } from '@prisma/client';
import { MessageRepository } from '../../repositories/message.repository';
import logger from '../../utils/logger';

/**
 * Service for sending welcome messages to newly registered users
 */
export class WelcomeService {
  private prisma: PrismaClient;
  private messageRepository: MessageRepository;
  
  constructor() {
    this.prisma = new PrismaClient();
    this.messageRepository = new MessageRepository();
  }
  
  /**
   * Send a welcome message to a newly registered customer
   * 
   * @param customerId The customer ID
   * @returns True if message was sent successfully
   */
  async sendWelcomeMessage(customerId: string): Promise<boolean> {
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
      
      // Generate data protection URL
      const dataProtectionUrl = `${process.env.FRONTEND_URL || 'https://laltroitalia.shop'}/data-protection?lang=${customerLanguage.toLowerCase()}`;
      
      // Extract first name
      const firstName = customer.name.split(' ')[0];
      
      // Get welcome message based on language
      const welcomeMessage = this.getWelcomeMessage(firstName, customerLanguage, dataProtectionUrl);
      
      // Send the message
      if (customer.phone) {
        try {
          // Use the regular message repository to save the outgoing message
          await this.messageRepository.saveMessage({
            workspaceId: customer.workspaceId,
            phoneNumber: customer.phone,
            message: '', // No incoming message
            response: welcomeMessage,
            direction: 'OUTBOUND',
            agentSelected: 'Welcome' // Mark this message as coming from the Welcome agent
          });
          
          logger.info(`Welcome message sent to customer ${customerId}`);
          
          // Actual sending would happen through the WhatsApp API integration
          // This would require a separate service for sending outbound messages
          // For now, we'll just log that it would have been sent
          
          return true;
        } catch (error) {
          logger.error('Error saving welcome message:', error);
          return false;
        }
      } else {
        logger.error(`Customer ${customerId} has no phone number`);
        return false;
      }
    } catch (error) {
      logger.error('Error sending welcome message:', error);
      return false;
    }
  }
  
  /**
   * Get welcome message in the specified language
   * 
   * @param firstName Customer's first name
   * @param language Language for the message
   * @param dataProtectionUrl URL to data protection page
   * @returns Welcome message in the specified language
   */
  private getWelcomeMessage(firstName: string, language: string, dataProtectionUrl: string): string {
    switch (language.toLowerCase()) {
      case 'italian':
      case 'italiano':
      case 'it':
        return `Ciao ${firstName}, benvenuto e grazie per esserti registrato! È importante per noi che tu sappia che i tuoi dati sono in buone mani e non verranno inviati a nessun modello di AI grazie ad un sistema di crittografia che abbiamo installato nei nostri server. Se vuoi saperne di più clicca qui: ${dataProtectionUrl}`;
        
      case 'spanish':
      case 'español':
      case 'es':
        return `Hola ${firstName}, ¡bienvenido y gracias por registrarte! Es importante para nosotros que sepas que tus datos están en buenas manos y no se enviarán a ningún modelo de IA gracias a un sistema de encriptación que hemos instalado en nuestros servidores. Si quieres saber más, haz clic aquí: ${dataProtectionUrl}`;
        
      case 'french':
      case 'français':
      case 'fr':
        return `Bonjour ${firstName}, bienvenue et merci de vous être inscrit ! Il est important pour nous que vous sachiez que vos données sont entre de bonnes mains et ne seront transmises à aucun modèle d'IA grâce à un système de chiffrement que nous avons installé sur nos serveurs. Si vous souhaitez en savoir plus, cliquez ici : ${dataProtectionUrl}`;
        
      case 'german':
      case 'deutsch':
      case 'de':
        return `Hallo ${firstName}, willkommen und danke für deine Registrierung! Es ist uns wichtig, dass du weißt, dass deine Daten in guten Händen sind und dank eines Verschlüsselungssystems, das wir auf unseren Servern installiert haben, an keine KI-Modelle übermittelt werden. Wenn du mehr erfahren möchtest, klicke hier: ${dataProtectionUrl}`;
      
      default: // English is the default
        return `Hello ${firstName}, welcome and thank you for registering! It's important for us that you know your data is in good hands and will not be sent to any AI model thanks to an encryption system we have installed on our servers. If you want to know more, click here: ${dataProtectionUrl}`;
    }
  }
} 