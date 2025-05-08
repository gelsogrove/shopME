import { MessageRepository } from '../../infrastructure/repositories/message.repository';
import logger from '../../utils/logger';
import { TokenService } from './token.service';

// Customer interface che include activeChatbot
interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  discount?: number;
  language?: string;
  currency?: string;
  notes?: string;
  isActive: boolean;
  activeChatbot?: boolean;  // Flag per il controllo manuale dell'operatore
  // Altri campi che potrebbero essere necessari...
  createdAt: Date;
  updatedAt: Date;
  push_notifications_consent_at?: Date;
}

/**
 * Service for processing messages
 */
export class MessageService {
  private messageRepository: MessageRepository;
  private tokenService: TokenService;
  
  constructor() {
    this.messageRepository = new MessageRepository();
    this.tokenService = new TokenService();
  }
  
  /**
   * Get the message repository instance
   * @returns MessageRepository instance
   */
  getMessageRepository(): MessageRepository {
    return this.messageRepository;
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

    let response = ""; 
    let agentSelected = ""; // Variable to track the selected agent

    try {   
        logger.info(`Processing message: "${message}" from ${phoneNumber} for workspace ${workspaceId}`);
  
        // Check if workspace exists and is active
        const workspaceSettings = await this.messageRepository.getWorkspaceSettings(workspaceId);
        
        if (!workspaceSettings) {
            logger.error(`Workspace with ID ${workspaceId} not found in database`);
            return 'Workspace not found. Please contact support.';
        }

        if (!workspaceSettings.isActive) {
            logger.warn(`Workspace ${workspaceId} exists but is inactive`);
            return workspaceSettings.wipMessage ? workspaceSettings.wipMessage : 'WhatsApp channel is inactive';
        }
        
        // Check if customer is in blacklist
        const isBlacklisted = await this.messageRepository.isCustomerBlacklisted(phoneNumber);
        if (isBlacklisted) {
            logger.warn(`Phone number ${phoneNumber} is blacklisted. Message rejected.`);
            // Silently ignore the message without responding
            return '';
        }

        // Check if customer exists - simplified binary check
        const customer = await this.messageRepository.findCustomerByPhone(phoneNumber, workspaceId);
        
        // Check if the chatbot is active for this customer
        if (customer && (customer as Customer).activeChatbot === false) {
            logger.info(`Operator manual control active for ${phoneNumber} (${customer.name}). Chatbot response skipped.`);
            // Save the message without response (only store the user message)
            await this.messageRepository.saveMessage({
                workspaceId,
                phoneNumber,
                message,
                response: '',
                agentSelected: 'Manual Operator Control'
            });
            // Return empty string to indicate no bot response should be sent
            return '';
        }
        
        // If customer doesn't exist, send registration link with secure token
        if (!customer) {
            logger.info("New user detected - sending registration link with secure token");
            
            // Generate secure registration token
            const token = await this.tokenService.createRegistrationToken(phoneNumber, workspaceId);
            
            // Usa workspaceSettings.url se presente, altrimenti fallback
            const baseUrl = workspaceSettings.url || process.env.FRONTEND_URL || 'https://laltroitalia.shop';
            const registrationUrl = `${baseUrl}/register?phone=${encodeURIComponent(phoneNumber)}&workspace=${workspaceId}&token=${token}`;
            
            // Get workspace name for personalized message if available
            let workspaceName = "our service";
            if (workspaceSettings.name) {
                workspaceName = workspaceSettings.name;
            }
            
            // Create a welcome message
            response = `Welcome to ${workspaceName}! To continue with our service, please complete your registration here: ${registrationUrl}`;
            
            // Create temporary customer record
            let tempCustomer = await this.messageRepository.findCustomerByPhone(phoneNumber, workspaceId);
            if (!tempCustomer) {
              tempCustomer = await this.messageRepository.createCustomer({
                name: 'Unknown Customer',
                email: `customer-${Date.now()}@example.com`,
                phone: phoneNumber,
                workspaceId,
              });
              logger.info(`Created temporary customer record: ${tempCustomer.id}`);
            }
            
            agentSelected = "Registration"; // Set the agent used as "Registration"
            return response;
        } 
        
        // Check if customer is registered (has completed registration)
        // Consider customer unregistered if name is "Unknown Customer" - this is the default name for new customers
        if (customer.name === 'Unknown Customer') {
            logger.info(`User with phone ${phoneNumber} is still unregistered - showing registration link again`);
            
            // Generate secure registration token
            const token = await this.tokenService.createRegistrationToken(phoneNumber, workspaceId);
            
            // Usa workspaceSettings.url se presente, altrimenti fallback
            const baseUrl = workspaceSettings.url || process.env.FRONTEND_URL || 'https://laltroitalia.shop';
            const registrationUrl = `${baseUrl}/register?phone=${encodeURIComponent(phoneNumber)}&workspace=${workspaceId}&token=${token}`;
            
            // Create reminder message
            response = `Per favore completa la registrazione prima di continuare: ${registrationUrl}`;
            
            agentSelected = "Registration"; // Set the agent used as "Registration"
            return response;
        }
        
        // Process message for existing customer
        logger.info("Processing existing customer message");
        try {
            const routerAgentPrompt = await this.messageRepository.getRouterAgent();
            const products = await this.messageRepository.getProducts();
            const services = await this.messageRepository.getServices();
            const chatHistory = await this.messageRepository.getLatesttMessages(phoneNumber, 30);
            
            try {
                logger.info(`=== MESSAGE PROCESSING START ===`);
                logger.info(`USER MESSAGE: "${message}"`);
                
                // 1. Select the appropriate agent with the router
                const selectedAgent = await this.messageRepository.getResponseFromAgentRouter(routerAgentPrompt, message);
                logger.info(`AGENT SELECTED: "${selectedAgent.name}"`);
                
                // Save the name of the selected agent
                agentSelected = selectedAgent.name || "Unknown";
                
                // Process agent prompt to replace variables like {customerLanguage}
                if (selectedAgent.content && customer) {
                    // Replace customerLanguage placeholder with actual customer language
                    const customerLanguage = customer.language || 'Italian';
                    selectedAgent._replacedPrompt = selectedAgent.content.replace(/\{customerLanguage\}/g, customerLanguage);
                }
                
                // 2. Generate the prompt enriched with product and service context
                const systemPrompt = await this.messageRepository.getResponseFromRag(
                  selectedAgent, 
                  message, 
                  products, 
                  services, 
                  chatHistory, 
                  customer
                );
                logger.info(`SYSTEM PROMPT: "${systemPrompt}"`);

                // 3. Convert systemPrompt to conversation prompt
                response = await this.messageRepository.getConversationResponse(chatHistory, message, systemPrompt);
                logger.info(`FINAL PROMPT: "${response}"`);
  
                // The agent info will be added by the frontend which will read the agentSelected field from the database
            
            } catch (apiError) {
                agentSelected = "Error";
                response = apiError.toString();
            }
            return response;
        } catch (processingError) {
            agentSelected = "Error";
            return "Error processing customer message:" + processingError;
        }
        
    } catch (error) {
      logger.error("Error processing message:", error);
      agentSelected = "System";
      return "Sorry, there was an error processing your message. Please try again later.";
    } finally {
      // Save both the user message and our response in one call
      try {
        await this.messageRepository.saveMessage({
          workspaceId,
          phoneNumber,
          message,
          response,
          agentSelected // Pass the selected agent to the repository
        });
        logger.info("Message saved successfully");
      } catch (saveError) {
        logger.error("Error saving message:", saveError);
      }
    }
  }
} 