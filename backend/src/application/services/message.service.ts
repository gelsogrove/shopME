import { MessageRepository } from '../../infrastructure/repositories/message.repository';

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

    let response = ""; 

    try {   

        // Check if WhatsApp channel is active for this workspace
        const workspaceSettings = await this.messageRepository.getWorkspaceSettings(workspaceId);
        if (!workspaceSettings?.isActive) {
            return workspaceSettings?.wipMessage ? workspaceSettings.wipMessage : 'WhatsApp channel is inactive';
        }


        // Check if customer exists
        const customer = await this.messageRepository.findCustomerByPhone(phoneNumber);
        if (!customer) {
            response = 'LINK TO THE NEW USER FORM';
            return response;
        } else {
            // GetData
            const routerAgentPromp = await this.messageRepository.getRouterAgent(); //get router agent prompt
            const products = await this.messageRepository.getProducts(); //get products
            const chatHistory = await this.messageRepository.getLatesttMessages(phoneNumber, 30); //get chat history latest 30 messages
            const agentSelectedPrompt =await this.messageRepository.getResponseFromLLM(routerAgentPromp,message); //get agent selected prompt
            const systemPrompt =await this.messageRepository.getResponseFromRag(agentSelectedPrompt,message,products,chatHistory); //get system prompt


            //conversional 
            const promptToConvert = "convert this prompt to a conversation message related to the history of the conversation: " + systemPrompt;
            response = await this.messageRepository.getConversationResponse(chatHistory,message,promptToConvert);
        

        }
           
        

        // Return message
        return response;
        
    } catch (error) {
      return "Sorry, WhatsApp channel is inactive,please try later.";
    }finally{
     // Save both the user message and our response in one call
     await this.messageRepository.saveMessage({
        workspaceId,
        phoneNumber,
        message,
        response
    });
    }
  }
  
} 