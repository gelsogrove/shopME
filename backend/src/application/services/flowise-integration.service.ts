import axios from 'axios';
import logger from '../../utils/logger';

export interface FlowiseInput {
  message: string;
  phoneNumber: string;
  workspaceId: string;
  customerData?: any;
  workspaceSettings?: any;
  chatHistory?: any[];
}

export interface FlowiseOutput {
  response: string | null;
  action: 'WELCOME' | 'RAG_SEARCH' | 'CHECKOUT' | 'BLOCKED' | 'OPERATOR_CONTROL' | 'WIP';
  metadata?: {
    checkoutLink?: string;
    registrationLink?: string;
    blockedReason?: string;
  };
}

/**
 * 🤖 Flowise Integration Service
 * 
 * Integrates with Flowise 3.0 visual flow engine to handle WhatsApp message processing.
 * This service replaces the complex conditional logic with visual flows.
 */
export class FlowiseIntegrationService {
  private readonly flowiseUrl: string;
  private readonly flowiseApiKey: string;
  private readonly flowId: string; // Will be configured after creating the flow

  constructor() {
    this.flowiseUrl = process.env.FLOWISE_URL || 'http://localhost:3003';
    this.flowiseApiKey = process.env.FLOWISE_API_KEY || 'shopme-api-key';
    this.flowId = process.env.FLOWISE_FLOW_ID || 'whatsapp-main-flow';
  }

  /**
   * 🎯 Main entry point: Process WhatsApp message through Flowise visual flow
   */
  async processWhatsAppMessage(input: FlowiseInput): Promise<FlowiseOutput> {
    try {
      logger.info(`[FLOWISE] Processing message through visual flow: "${input.message}" from ${input.phoneNumber}`);

      // Prepare payload for Flowise
      const payload = {
        question: input.message,
        overrideConfig: {
          // Pass all context data to the flow
          phoneNumber: input.phoneNumber,
          workspaceId: input.workspaceId,
          customerData: input.customerData,
          workspaceSettings: input.workspaceSettings,
          chatHistory: input.chatHistory || []
        }
      };

      // Call Flowise API
      const response = await axios.post(
        `${this.flowiseUrl}/api/v1/prediction/${this.flowId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.flowiseApiKey}`
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      // Parse Flowise response
      const flowiseResult = response.data;
      logger.info(`[FLOWISE] Flow completed with result: ${JSON.stringify(flowiseResult)}`);

      // Extract structured output from Flowise response
      return this.parseFlowiseResponse(flowiseResult);

    } catch (error) {
      logger.error(`[FLOWISE] Error processing message through visual flow:`, error);
      
      // Fallback to basic response
      return {
        response: 'Sorry, our system is temporarily unavailable. Please try again later.',
        action: 'BLOCKED',
        metadata: {
          blockedReason: 'FLOWISE_ERROR'
        }
      };
    }
  }

  /**
   * 📊 Parse Flowise response into structured output
   */
  private parseFlowiseResponse(flowiseResult: any): FlowiseOutput {
    try {
      // Flowise returns structured JSON with action and response
      if (flowiseResult.action && flowiseResult.response) {
        return {
          response: flowiseResult.response,
          action: flowiseResult.action,
          metadata: flowiseResult.metadata || {}
        };
      }

      // If Flowise returns plain text, try to parse it
      if (typeof flowiseResult === 'string') {
        try {
          const parsed = JSON.parse(flowiseResult);
          return {
            response: parsed.response || flowiseResult,
            action: parsed.action || 'RAG_SEARCH',
            metadata: parsed.metadata || {}
          };
        } catch {
          // Plain text response - assume it's a RAG search result
          return {
            response: flowiseResult,
            action: 'RAG_SEARCH'
          };
        }
      }

      // Default response
      return {
        response: flowiseResult.text || flowiseResult.answer || 'I\'m here to help you!',
        action: 'RAG_SEARCH'
      };

    } catch (error) {
      logger.error(`[FLOWISE] Error parsing response:`, error);
      return {
        response: 'I apologize, but I encountered an error processing your request.',
        action: 'BLOCKED',
        metadata: {
          blockedReason: 'PARSE_ERROR'
        }
      };
    }
  }

  /**
   * 🔧 Health check for Flowise service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.flowiseUrl}/api/v1/ping`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      logger.error(`[FLOWISE] Health check failed:`, error);
      return false;
    }
  }

  /**
   * 📋 Get available flows from Flowise
   */
  async getAvailableFlows(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.flowiseUrl}/api/v1/chatflows`, {
        headers: {
          'Authorization': `Bearer ${this.flowiseApiKey}`
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      logger.error(`[FLOWISE] Error fetching flows:`, error);
      return [];
    }
  }

  /**
   * 🔄 Create or update the WhatsApp flow in Flowise
   */
  async setupWhatsAppFlow(): Promise<string | null> {
    try {
      // This will contain the visual flow definition
      const flowDefinition = this.getWhatsAppFlowDefinition();
      
      const response = await axios.post(
        `${this.flowiseUrl}/api/v1/chatflows`,
        flowDefinition,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.flowiseApiKey}`
          }
        }
      );

      const flowId = response.data.id;
      logger.info(`[FLOWISE] WhatsApp flow created with ID: ${flowId}`);
      return flowId;

    } catch (error) {
      logger.error(`[FLOWISE] Error setting up WhatsApp flow:`, error);
      return null;
    }
  }

  /**
   * 🎨 Define the visual flow structure for WhatsApp processing
   */
  private getWhatsAppFlowDefinition() {
    return {
      name: 'WhatsApp Message Processing Flow',
      description: 'Visual flow for processing WhatsApp messages with all business logic',
      nodes: [
        // Start Node
        {
          id: 'start',
          type: 'chatInput',
          position: { x: 100, y: 100 },
          data: {
            label: '📱 WhatsApp Input',
            inputs: ['message', 'phoneNumber', 'workspaceId']
          }
        },
        // API Limit Check
        {
          id: 'apiLimit',
          type: 'conditionalNode',
          position: { x: 300, y: 100 },
          data: {
            label: '🚨 API Limit Check',
            condition: 'checkApiLimit(workspaceId)',
            trueOutput: 'spamCheck',
            falseOutput: 'blocked'
          }
        },
        // Spam Detection
        {
          id: 'spamCheck',
          type: 'conditionalNode',
          position: { x: 500, y: 100 },
          data: {
            label: '🚨 Spam Detection',
            condition: 'checkSpamBehavior(phoneNumber, workspaceId)',
            trueOutput: 'blocked',
            falseOutput: 'channelActive'
          }
        },
        // Channel Active Check
        {
          id: 'channelActive',
          type: 'conditionalNode',
          position: { x: 700, y: 100 },
          data: {
            label: '✅ Channel Active',
            condition: 'workspace.isActive',
            trueOutput: 'chatbotActive',
            falseOutput: 'blocked'
          }
        },
        // Chatbot Active Check
        {
          id: 'chatbotActive',
          type: 'conditionalNode',
          position: { x: 900, y: 100 },
          data: {
            label: '🤖 Chatbot Active',
            condition: 'workspace.activeChatbot',
            trueOutput: 'blacklistCheck',
            falseOutput: 'operatorControl'
          }
        },
        // Blacklist Check
        {
          id: 'blacklistCheck',
          type: 'conditionalNode',
          position: { x: 1100, y: 100 },
          data: {
            label: '🚫 Blacklist Check',
            condition: 'isBlacklisted(phoneNumber, workspaceId)',
            trueOutput: 'blocked',
            falseOutput: 'wipCheck'
          }
        },
        // WIP Check
        {
          id: 'wipCheck',
          type: 'conditionalNode',
          position: { x: 300, y: 300 },
          data: {
            label: '⚠️ WIP Check',
            condition: 'customer.hasOrderInProgress',
            trueOutput: 'wipMessage',
            falseOutput: 'userFlow'
          }
        },
        // User Flow Detection
        {
          id: 'userFlow',
          type: 'conditionalNode',
          position: { x: 500, y: 300 },
          data: {
            label: '👤 User Flow',
            condition: 'isNewUser(phoneNumber, workspaceId)',
            trueOutput: 'welcomeNew',
            falseOutput: 'checkExisting'
          }
        },
        // RAG Search
        {
          id: 'ragSearch',
          type: 'ragNode',
          position: { x: 700, y: 500 },
          data: {
            label: '🔍 RAG Search',
            searchTypes: ['products', 'faqs', 'services', 'documents'],
            llmFormatter: true
          }
        },
        // Output Nodes
        {
          id: 'response',
          type: 'chatOutput',
          position: { x: 900, y: 500 },
          data: {
            label: '💬 Final Response'
          }
        }
      ],
      edges: [
        // Define connections between nodes
        { source: 'start', target: 'apiLimit' },
        { source: 'apiLimit', target: 'spamCheck', condition: 'passed' },
        { source: 'spamCheck', target: 'channelActive', condition: 'passed' },
        // ... more edges
      ]
    };
  }
} 