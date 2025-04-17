import { MessageRepository } from '../../infrastructure/repositories/message.repository';
import logger from '../../utils/logger';

/**
 * Service for processing messages
 */
export class MessageService {
  private messageRepository: MessageRepository;
  
  constructor() {
    this.messageRepository = new MessageRepository();
  }
  
  /**
   * Process a message and return a response
   * 
   * @param message The message to process
   * @param phoneNumber The phone number of the sender
   * @param workspaceId The ID of the workspace
   * @returns The processed message
   */
  async processMessage(message: string, phoneNumber: string, workspaceId: string): Promise<string> {
    try {   
        let response = ""; 
        const customer = await this.messageRepository.findCustomerByPhone(phoneNumber);
        logger.info('Ncustomer: ' + customer);
       
        if (!customer) {
            logger.info('New customer with phone number: ' + phoneNumber);
            response = 'LINK TO THE NEW USER FORM';
            return response;
        } else {
            logger.info('Returning customer: ' + customer.id);
            response = message.toUpperCase();
            
        }
           
        // Save both the user message and our response in one call
        await this.messageRepository.saveMessage({
            workspaceId,
            phoneNumber,
            message,
            response
        });
      

        return response;
    } catch (error) {
      logger.error('MessageService: Error processing message', error);
      return "Sorry, we couldn't process your message. Please try again later.";
    }
  }
  
} 