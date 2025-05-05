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
   * Formats text for WhatsApp applying proper formatting for product lists and special elements
   * @param text Text to format
   * @returns Text formatted for WhatsApp
   */
  private formatListForWhatsApp(text: string): string {
    try {
      // Convert double asterisks to single (WhatsApp uses single asterisks for bold)
      let formattedText = text.replace(/\*\*([^*]+)\*\*/g, '*$1*');
      
      // Split text into lines for processing
      const lines = formattedText.split('\n');
      const processedLines = [];
      
      // Process lines for product list formatting
      let i = 0;
      while (i < lines.length) {
        const line = lines[i];
        
        // Check if this is a numbered list item (product) with price
        // Match formats like: "1. Product Name - €10.99" or "1. Product Name - 10.99€"
        const productMatch = line.match(/^(\d+\.)\s*(.*?)(\s*[-–—]\s*(?:€\s*\d+[\.,]?\d*|\d+[\.,]?\d*\s*€))$/);
        
        if (productMatch) {
          const [_, number, name, price] = productMatch;
          
          // Make product name bold if not already
          const formattedName = name.includes('*') ? name.trim() : `*${name.trim()}*`;
          
          // Format price consistently 
          const cleanPrice = price.replace(/\s+/g, ' ').trim();
          
          // Combine number, name and price on one line
          let formattedProduct = `${number} ${formattedName} ${cleanPrice}`;
          
          // Look ahead for category and description lines
          let details = [];
          let j = i + 1;
          
          // Collect category and description lines
          while (j < lines.length && (
            lines[j].trim().startsWith('Categoria:') || 
            lines[j].trim().startsWith('Descrizione:') ||
            lines[j].trim().startsWith('-') ||
            lines[j].trim().startsWith('•')
          )) {
            // Format with bullet points and italics for categories
            let detailLine = lines[j]
              .replace(/^\s*[-–•]\s*/, '   • ')
              .replace(/Categoria:/, '_Categoria:_')
              .replace(/Descrizione:/, '_Descrizione:_');
            
            details.push(detailLine);
            j++;
          }
          
          // Add the formatted product with its details
          if (details.length > 0) {
            formattedProduct += '\n' + details.join('\n');
          }
          
          processedLines.push(formattedProduct);
          
          // Skip the lines we've processed
          i = j;
        } else {
          // Check if this is a section header (all caps or ends with :)
          const isSectionHeader = line.trim().toUpperCase() === line.trim() && line.trim().length > 3;
          const isLabelLine = /:\s*$/.test(line.trim());
          
          if (isSectionHeader) {
            // Format section headers with bold
            processedLines.push(`*${line.trim()}*`); 
          } else if (isLabelLine) {
            // Format labels with emphasis
            processedLines.push(`_${line.trim()}_`);
          } else {
            // Regular line - ensure consistent bullet point formatting
            processedLines.push(line.replace(/^[•-]\s*/, '• '));
          }
          i++;
        }
      }
      
      // Rejoin the lines
      formattedText = processedLines.join('\n');
      
      // Ensure no double blank lines
      formattedText = formattedText.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      logger.info('WhatsApp formatting completed with enhanced product list support');
      return formattedText;
    } catch (error) {
      logger.error('Error formatting WhatsApp message:', error);
      return text; // Return original text in case of error
    }
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

        // Check if customer exists - simplified binary check
        const customer = await this.messageRepository.findCustomerByPhone(phoneNumber);
        
        // If customer doesn't exist, send registration link
        if (!customer) {
            logger.info("New user detected - sending registration link");
            const registrationUrl = `${process.env.FRONTEND_URL || 'https://laltroitalia.shop'}/register?phone=${encodeURIComponent(phoneNumber)}&workspace=${workspaceId}`;
            response = `Benvenuto! Per procedere con la chat, registrati qui: ${registrationUrl}`;
            
            // Create temporary customer record
            const tempCustomer = await this.messageRepository.findOrCreateCustomerByPhone(workspaceId, phoneNumber);
            logger.info(`Created temporary customer record: ${tempCustomer.id}`);
            
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
                
                // 1. Seleziona l'agente appropriato con il router
                const agentSelected = await this.messageRepository.getResponseFromAgentRouter(routerAgentPrompt, message);
                logger.info(`AGENT SELECTED: "${agentSelected.name}"`);
                
                // 2. Genera il prompt arricchito con il contesto dei prodotti e servizi
                const systemPrompt = await this.messageRepository.getResponseFromRag(agentSelected, message, products, services, chatHistory, customer);
                logger.info(`SYSTEM PROMT: "${systemPrompt}"`);

                // 3. converte il systemPrompt in prompt per il conversazione
                response = await this.messageRepository.getConversationResponse(chatHistory, message, systemPrompt);
                logger.info(`FINAL PROMT: "${response}"`);
  
                // 4. Formatta la risposta e aggiungi info sul chatbot
                response = this.formatListForWhatsApp(response);
                
                // Aggiungi l'informazione sul chatbot che ha risposto
                if (agentSelected && agentSelected.name) {
                  const agentName = agentSelected.name;
                  if (!response.includes("Messaggio generato da:")) {
                    response += `\n\n_Agente: ${agentName}_`;
                  }
                }
            
            } catch (apiError) {
                
                response = apiError;
               
            }
            return response;
        } catch (processingError) {
            return "Error processing customer message:" + processingError;
        }
        
    } catch (error) {
      logger.error("Error processing message:", error);
      return "Sorry, there was an error processing your message. Please try again later.";
    } finally {
      // Save both the user message and our response in one call
      try {
        await this.messageRepository.saveMessage({
          workspaceId,
          phoneNumber,
          message,
          response
        });
        logger.info("Message saved successfully");
      } catch (saveError) {
        logger.error("Error saving message:", saveError);
      }
    }
  }
  
} 