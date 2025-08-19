import { apiLimitService } from '../application/services/api-limit.service';
import logger from '../utils/logger';

/**
 * Main Chatbot Entry Point
 * 
 * Questo è il punto di ingresso principale per tutto il flusso WhatsApp.
 * Gestisce la sequenza completa secondo docs/flow.md:
 * 
 * API Limit → Spam Detection → Channel Active → Chatbot Active → Blacklist → WIP → User Flow
 */

export interface ChatbotRequest {
  message: string;
  phoneNumber: string;
  workspaceId: string;
  sessionId?: string;
  isNewConversation?: boolean;
}

export interface ChatbotResponse {
  response: string | null;
  metadata: {
    agentSelected: string;
    flowStep: string;
    blocked?: boolean;
    limitExceeded?: boolean;
  };
}

export class ChatbotMain {
  
  /**
   * Processo principale del chatbot
   * Segue esattamente la sequenza del flow.md
   */
  async processMessage(request: ChatbotRequest): Promise<ChatbotResponse> {
    const { message, phoneNumber, workspaceId } = request;
    
    logger.info(`[CHATBOT] Starting flow for ${phoneNumber} in workspace ${workspaceId}`);
    
    try {
      // STEP 1: API Limit Check
      const apiLimitResult = await apiLimitService.checkApiLimit(workspaceId);
      if (apiLimitResult.exceeded) {
        logger.warn(`[CHATBOT] API limit exceeded for workspace ${workspaceId}: ${apiLimitResult.currentUsage}/${apiLimitResult.limit}`);
        return {
          response: null,
          metadata: {
            agentSelected: 'API_LIMIT',
            flowStep: 'API_LIMIT_EXCEEDED',
            limitExceeded: true
          }
        };
      }
      
      logger.info(`[CHATBOT] API limit OK for workspace ${workspaceId}: ${apiLimitResult.currentUsage}/${apiLimitResult.limit}`);
      
      // STEP 2: Spam Detection (già implementato in MessageService)
      // TODO: Integrare spam detection qui
      
      // STEP 3: Channel Active Check
      const channelActiveResult = await this.checkChannelActive(workspaceId);
      if (!channelActiveResult.isActive) {
        logger.info(`[CHATBOT] Channel inactive for workspace ${workspaceId}`);
        return {
          response: null,
          metadata: {
            agentSelected: 'CHANNEL_INACTIVE',
            flowStep: 'CHANNEL_INACTIVE'
          }
        };
      }
      
      // STEP 4: Chatbot Active Check
      const chatbotActiveResult = await this.checkChatbotActive(phoneNumber, workspaceId);
      if (!chatbotActiveResult.isActive) {
        logger.info(`[CHATBOT] Manual operator control for ${phoneNumber}`);
        // Salva messaggio ma non genera risposta AI
        await this.saveMessageForOperator(request);
        return {
          response: "",
          metadata: {
            agentSelected: 'MANUAL_OPERATOR',
            flowStep: 'OPERATOR_CONTROL'
          }
        };
      }
      
      // STEP 5: Blacklist Check
      const blacklistResult = await this.checkBlacklist(phoneNumber, workspaceId);
      if (blacklistResult.isBlacklisted) {
        logger.info(`[CHATBOT] User ${phoneNumber} is blacklisted`);
        return {
          response: null,
          metadata: {
            agentSelected: 'BLACKLIST',
            flowStep: 'BLACKLISTED',
            blocked: true
          }
        };
      }
      
      // STEP 6: WIP Check
      const wipResult = await this.checkWIP(workspaceId);
      if (wipResult.isWIP) {
        logger.info(`[CHATBOT] Workspace ${workspaceId} is in WIP mode`);
        // WIP message ma continua il flow (non blocca)
        const wipMessage = wipResult.message;
        // TODO: Continuare con user flow dopo WIP message
      }
      
      // STEP 7: User Flow (nuovo/esistente)
      const userFlowResult = await this.processUserFlow(request);
      
      // Incrementa contatore API usage dopo elaborazione riuscita
      await apiLimitService.incrementApiUsage(workspaceId, 'whatsapp_message');
      
      return userFlowResult;
      
    } catch (error) {
      logger.error(`[CHATBOT] Error in main flow:`, error);
      return {
        response: "Sorry, an error occurred. Please try again later.",
        metadata: {
          agentSelected: 'ERROR',
          flowStep: 'ERROR'
        }
      };
    }
  }
  
  /**
   * STEP 3: Controllo canale attivo
   */
  private async checkChannelActive(workspaceId: string): Promise<{isActive: boolean}> {
    // TODO: Implementare controllo workspace.isActive
    logger.info(`[CHATBOT] Checking channel active for workspace ${workspaceId}`);
    return { isActive: true };
  }
  
  /**
   * STEP 4: Controllo chatbot attivo
   */
  private async checkChatbotActive(phoneNumber: string, workspaceId: string): Promise<{isActive: boolean}> {
    // TODO: Implementare controllo customer.activeChatbot
    logger.info(`[CHATBOT] Checking chatbot active for ${phoneNumber}`);
    return { isActive: true };
  }
  
  /**
   * STEP 5: Controllo blacklist
   */
  private async checkBlacklist(phoneNumber: string, workspaceId: string): Promise<{isBlacklisted: boolean}> {
    // TODO: Implementare controllo blacklist (già esistente in MessageService)
    logger.info(`[CHATBOT] Checking blacklist for ${phoneNumber}`);
    return { isBlacklisted: false };
  }
  
  /**
   * STEP 6: Controllo WIP
   */
  private async checkWIP(workspaceId: string): Promise<{isWIP: boolean, message?: string}> {
    // TODO: Implementare controllo WIP
    logger.info(`[CHATBOT] Checking WIP for workspace ${workspaceId}`);
    return { isWIP: false };
  }
  
  /**
   * Salva messaggio per operatore (quando chatbot disattivo)
   */
  private async saveMessageForOperator(request: ChatbotRequest): Promise<void> {
    // TODO: Implementare salvataggio messaggio per operatore
    logger.info(`[CHATBOT] Saving message for operator: ${request.phoneNumber}`);
  }
  
  /**
   * STEP 7: Processo user flow (nuovo/esistente)
   */
  private async processUserFlow(request: ChatbotRequest): Promise<ChatbotResponse> {
    // TODO: Implementare user flow con calling functions
    logger.info(`[CHATBOT] Processing user flow for ${request.phoneNumber}`);
    
    return {
      response: "Ciao! Sono il chatbot di ShopME. Come posso aiutarti?",
      metadata: {
        agentSelected: 'CHATBOT',
        flowStep: 'USER_FLOW'
      }
    };
  }
}

// Export singleton instance
export const chatbotMain = new ChatbotMain(); 