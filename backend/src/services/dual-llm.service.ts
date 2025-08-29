import axios from 'axios';
import { LLMRequest, LLMResponse } from '../types/whatsapp.types';
import { CallingFunctionsService } from './calling-functions.service';
import { ToolDescriptionsService } from './tool-descriptions.service';
import { TranslationService } from './translation.service';

export class DualLLMService {
  private toolDescriptionsService: ToolDescriptionsService;
  private callingFunctionsService: CallingFunctionsService;
  private translationService: TranslationService;
  private openRouterApiKey: string;
  private openRouterUrl: string;
  private backendUrl: string;

  constructor() {
    this.toolDescriptionsService = new ToolDescriptionsService();
    this.callingFunctionsService = new CallingFunctionsService();
    this.translationService = new TranslationService();
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
    this.openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  }

  public async processMessage(request: LLMRequest): Promise<LLMResponse> {
    console.log('🚀🚀🚀 DUAL LLM PROCESSING STARTED 🚀🚀🚀');
    console.log('📥 Request received:', JSON.stringify(request, null, 2));
    
    try {
      // Stage 1: RAG Processor with Function Calling
      console.log('🔧 Stage 1: RAG Processor with Function Calling');
      const ragResult = await this.executeRAGProcessor(request);
      console.log('✅ RAG Result:', JSON.stringify(ragResult, null, 2));
      
      if (!ragResult.success) {
        console.log('❌ RAG Processor failed, returning error');
        return {
          output: 'Mi dispiace, si è verificato un errore. Riprova più tardi.',
          success: false
        };
      }
      
      // Stage 2: Formatter
      console.log('🔧 Stage 2: Formatter');
      const formattedResponse = await this.executeFormatter(request, ragResult);
      console.log('✅ Formatted Response:', JSON.stringify(formattedResponse, null, 2));
      
      return {
        output: formattedResponse,
        success: true,
        functionCalls: ragResult.functionResults || []
      };
      
    } catch (error) {
      console.error('❌❌❌ DUAL LLM ERROR:', error);
      console.error('❌ Error stack:', error.stack);
      return {
        output: 'Mi dispiace, si è verificato un errore. Riprova più tardi.',
        success: false
      };
    }
  }

  private async executeRAGProcessor(request: LLMRequest): Promise<any> {
    console.log('🔧🔧🔧 EXECUTE RAG PROCESSOR STARTED 🔧🔧🔧');
    
    try {
      // Translate query
      const translatedQuery = await this.translationService.translateToEnglish(request.chatInput);
      console.log('🔧 Translated query:', translatedQuery);
      
      // Get function definitions
      const functionDefinitions = this.getRAGProcessorFunctionDefinitions();
      console.log('🔧 Function definitions:', JSON.stringify(functionDefinitions, null, 2));
      console.log('🔧 Function definitions length:', functionDefinitions.length);
      console.log('🔧 First function name:', functionDefinitions[0]?.function?.name);
      console.log('🔧 First function parameters:', JSON.stringify(functionDefinitions[0]?.function?.parameters, null, 2));
      
      // Get agent config from database
      const agentConfig = await this.getAgentConfig(request.workspaceId);
      console.log('🔧 Agent config from DB:', agentConfig);
      
      const openRouterPayload = {
        model: agentConfig.model || 'openai/gpt-4o',
        messages: [
          {
            role: 'system',
            content: agentConfig.prompt
          },
          {
            role: 'user',
            content: translatedQuery
          }
        ],
        tools: functionDefinitions,
        tool_choice: 'required',
        temperature: agentConfig.temperature || 0.0,
        max_tokens: agentConfig.maxTokens || 1000
      };
      
      console.log('🚀 OPENROUTER PAYLOAD:', JSON.stringify(openRouterPayload, null, 2));
      console.log('🚀 SYSTEM MESSAGE CONTENT:', openRouterPayload.messages[0].content);
      console.log('🚀 USER MESSAGE CONTENT:', openRouterPayload.messages[1].content);
      console.log('🚀 TOOLS:', JSON.stringify(openRouterPayload.tools, null, 2));
      
      const response = await axios.post(this.openRouterUrl, openRouterPayload, {
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.backendUrl,
          'X-Title': 'ShopMe RAG Processor'
        },
        timeout: 30000
      });
      
      console.log('✅ OpenRouter Response:', JSON.stringify(response.data, null, 2));
      
      const message = response.data.choices[0].message;
      const toolCalls = message.tool_calls || [];
      
      console.log('🔧 Tool calls found:', toolCalls.length);
      
      if (toolCalls.length === 0) {
        console.log('⚠️ No tool calls detected - forcing error');
        throw new Error('No tool calls detected - LLM must call GetOrdersListLink for order requests');
      }
      
      // Execute tool calls
      console.log('🔧 Executing tool calls...');
      const results = await this.executeToolCalls(toolCalls, request);
      console.log('✅ Tool call results:', JSON.stringify(results, null, 2));
      
      return {
        functionResults: results,
        success: true
      };
      
    } catch (error) {
      console.error('❌ RAG Processor Error:', error);
      return {
        functionResults: [],
        success: false,
        error: error.message
      };
    }
  }

  private async executeFormatter(request: LLMRequest, ragResult: any): Promise<string> {
    try {
      console.log('🎨 Stage 2: Formatter - Natural Response Generation');

      const response = await axios.post(this.openRouterUrl, {
        model: 'anthropic/claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'system',
            content: this.buildFormatterSystemMessage()
          },
          {
            role: 'user',
            content: this.buildFormatterUserMessage(request, ragResult)
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'ShopMe Formatter'
        },
        timeout: 30000
      });

      const formattedResponse = response.data.choices[0]?.message?.content?.trim();
      console.log('✅ Formatted response:', formattedResponse);

      return formattedResponse || 'Mi dispiace, non sono riuscito a generare una risposta.';

    } catch (error) {
      console.error('❌ Formatter Error:', error);
      return this.buildFallbackResponse(request, ragResult);
    }
  }

  private buildRAGProcessorSystemMessage(): string {
    return `You are a Function Calling Agent for ShopMe WhatsApp Bot.

MISSION: You MUST call functions to get real data. NEVER respond with text.

AVAILABLE FUNCTIONS:
${this.toolDescriptionsService.getToolDescriptions().map(tool => 
  `- ${tool.name}: ${tool.description}`
).join('\n')}

CRITICAL RULES:
1. ALWAYS call a function - NEVER respond with text
2. For ANY product-related request → CALL getAllProducts()
3. For ANY service-related request → CALL getServices()
4. For ANY order-related request → CALL getOrdersListLink()
5. For ANY profile/address change → CALL getCustomerProfileLink()
6. For ANY general questions → CALL ragSearch()
7. For ANY human assistance → CALL contactOperator()

EXAMPLES:
- "dammi la lista dei prodotti" → CALL getAllProducts()
- "che prodotti avete" → CALL getAllProducts()
- "dammi prodotti" → CALL getAllProducts()
- "catalogo" → CALL getAllProducts()
- "dammi link ordini" → CALL getOrdersListLink()
- "dammi link 20006" → CALL getOrdersListLink() with orderCode: "20006"
- "voglio cambiare indirizzo" → CALL getCustomerProfileLink()
- "voglio parlare con un operatore" → CALL contactOperator()

IMPORTANT: "dammi prodotti" MUST call getAllProducts(), NOT ragSearch()

RESPOND ONLY WITH FUNCTION CALLS.`;
  }

  private buildFormatterSystemMessage(): string {
    return `You are a WhatsApp Response Formatter for ShopMe.

MISSION: Format data into natural, helpful WhatsApp messages.

RULES:
1. NEVER call functions - only format existing data
2. Be conversational and friendly
3. Use emojis appropriately
4. Format links as plain URLs (WhatsApp doesn't support markdown)
5. Keep responses concise but informative
6. LANGUAGE RULE: Respond in the SAME language as the user's input. If user writes in English, respond in English. If user writes in Italian, respond in Italian. If user writes in Spanish, respond in Spanish, etc.
7. If user asks for a "tabella" or "table", create a formatted table using ASCII characters

LINK FORMATTING FOR WHATSAPP:
- Use plain URLs: https://example.com
- Don't use markdown [text](url) format
- Include token in URL if provided

TABLE FORMATTING FOR WHATSAPP:
- Use ASCII characters: | - + 
- Create clear headers and separators
- Align columns properly
- Example:
┌─────────────┬─────────────┬─────────┐
│ Prodotto    │ Codice      │ Prezzo  │
├─────────────┼─────────────┼─────────┤
│ Mozzarella  │ MOZ001      │ €9.99   │
│ Parmigiano  │ PROD002     │ €15.50  │
└─────────────┴─────────────┴─────────┘

EXAMPLES:
- Products: "Ecco i nostri prodotti: 🧀 Mozzarella €7.99"
- Services: "I nostri servizi: 🚚 Consegna rapida €5.99"
- Orders: "Ecco il link per i tuoi ordini: https://example.com/orders?token=xyz"
- Tables: Create ASCII tables when requested

RESPOND IN NATURAL LANGUAGE ONLY.`;
  }

  private async getAgentConfig(workspaceId: string): Promise<any> {
    try {
      console.log('🔧 Getting agent config for workspace:', workspaceId);
      console.log('🔧 Calling URL:', `${this.backendUrl}/api/internal/agent-config/${workspaceId}`);
      
      const response = await axios.get(`${this.backendUrl}/api/internal/agent-config/${workspaceId}`);
      console.log('✅ Agent config response:', response.data);
      return response.data.agentConfig; // FIX: Use agentConfig object
    } catch (error) {
      console.error('❌ Error getting agent config:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      console.error('❌ Using fallback config');
      // Fallback to default config
      return {
        model: 'openai/gpt-4o',
        prompt: this.buildRAGProcessorSystemMessage(),
        temperature: 0.0,
        maxTokens: 1000
      };
    }
  }

  private buildFormatterUserMessage(request: LLMRequest, ragResult: any): string {
    let orderLink = null;
    let orderCode = null;
    let orderError = null;
    let trackingLink = null;
    let trackingError = null;
    let products = null;
    let services = null;
    
    if (ragResult.functionResults && ragResult.functionResults.length > 0) {
      for (const result of ragResult.functionResults) {
        if (result.functionName === 'getOrdersListLink') {
          if (result.result?.success === false) {
            // Handle order not found error
            orderError = result.result.message || result.result.error;
            orderCode = result.arguments?.orderCode || null;
          } else if (result.result?.linkUrl) {
            orderLink = result.result.linkUrl;
            orderCode = result.arguments?.orderCode || null;
          }
        }
        else if (result.functionName === 'getShipmentTrackingLink') {
          if (result.result?.success === false) {
            // Handle tracking order not found error
            trackingError = result.result.message || result.result.error;
            orderCode = result.arguments?.orderCode || null;
          } else if (result.result?.linkUrl) {
            trackingLink = result.result.linkUrl;
            orderCode = result.arguments?.orderCode || null;
          }
        }
        else if (result.functionName === 'getAllProducts' && result.result?.products) {
          products = result.result.products;
        }
        else if (result.functionName === 'getServices' && result.result?.services) {
          services = result.result.services;
        }
      }
    }
    
    let dataDescription = `User asked: "${request.chatInput}"`;
    
    if (orderError) {
      dataDescription += `\n\nERROR: ${orderError}`;
      if (orderCode) {
        dataDescription += `\nThe order ${orderCode} was not found in the system.`;
      }
    } else if (trackingError) {
      dataDescription += `\n\nTRACKING ERROR: ${trackingError}`;
      if (orderCode) {
        if (trackingError.includes('tracking-id')) {
          dataDescription += `\nThe order ${orderCode} exists but has no tracking number in the system.`;
        } else {
          dataDescription += `\nThe order ${orderCode} was not found for tracking.`;
        }
      }
    } else if (trackingLink && orderCode) {
      dataDescription += `\n\nI have generated a tracking link for order ${orderCode}: ${trackingLink}`;
    } else if (orderLink && orderCode) {
      dataDescription += `\n\nI have generated a secure link for order ${orderCode}: ${orderLink}`;
    } else if (orderLink) {
      dataDescription += `\n\nI have generated a secure link for order history: ${orderLink}`;
    }
    
    if (products && products.length > 0) {
      dataDescription += `\n\nI have found ${products.length} products available:`;
      products.slice(0, 10).forEach((product: any) => {
        dataDescription += `\n- ${product.name} (${product.ProductCode}) - ${product.formatted}`;
      });
      if (products.length > 10) {
        dataDescription += `\n... and ${products.length - 10} more products`;
      }
    }
    
    if (services && services.length > 0) {
      dataDescription += `\n\nI have found ${services.length} services available:`;
      services.slice(0, 5).forEach((service: any) => {
        dataDescription += `\n- ${service.name} - ${service.description}`;
      });
    }
    
    return `${dataDescription}\n\nCONVERSATION HISTORY:\n${JSON.stringify(request.messages, null, 2)}\n\nCreate a natural, helpful response for the user's request. If there's an error, explain it clearly and suggest what the user can do. If you have a valid link, include it properly formatted.\n\n🚨 REMEMBER:\n- If there's an order error, explain the problem and suggest solutions\n- Respond conversationally, not in JSON\n- Use the link provided above if available\n- Be friendly and helpful\n- Format links as plain URLs`;
  }

  private getRAGProcessorFunctionDefinitions(): any[] {
    const toolDescriptions = this.toolDescriptionsService.getToolDescriptions();
    
    return toolDescriptions.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string', description: 'The workspace ID' },
            customerId: { type: 'string', description: 'The customer ID' },
            query: { type: 'string', description: 'Search query for ragSearch' },
            orderCode: { type: 'string', description: 'Order code for specific order requests' },
            messages: { 
              type: 'array', 
              description: 'Conversation history for context',
              items: {
                type: 'object',
                properties: {
                  role: { type: 'string' },
                  content: { type: 'string' }
                }
              }
            }
          },
          required: ['workspaceId', 'customerId']
        }
      }
    }));
  }

  private async executeToolCalls(toolCalls: any[], request: LLMRequest): Promise<any[]> {
    const results = [];

    for (const toolCall of toolCalls) {
      try {
        const functionName = toolCall.function.name;
        const arguments_ = JSON.parse(toolCall.function.arguments);
        
        console.log(`🔧 Executing ${functionName} with args:`, arguments_);

        let result;
        switch (functionName) {
          // case 'getAllProducts':
          //   result = await this.callingFunctionsService.getAllProducts({
          //     workspaceId: request.workspaceId,
          //     customerId: request.customerid
          //   });
          //   break;
          // case 'getServices':
          //   result = await this.callingFunctionsService.getServices({
          //     workspaceId: request.workspaceId,
          //     customerId: request.customerid
          //   });
          //   break;
          case 'getOrdersListLink':
            result = await this.callingFunctionsService.getOrdersListLink({
              customerId: request.customerid,
              workspaceId: request.workspaceId,
              orderCode: arguments_.orderCode
            });
            break;
          case 'getShipmentTrackingLink':
            result = await this.callingFunctionsService.getShipmentTrackingLink({
              customerId: request.customerid,
              workspaceId: request.workspaceId,
              orderCode: arguments_.orderCode
            });
            break;
          // case 'getCustomerProfileLink':
          //   result = await this.callingFunctionsService.getCustomerProfileLink({
          //     customerId: request.customerid,
          //     workspaceId: request.workspaceId
          //   });
          //   break;
          // case 'getAllCategories':
          //   result = await this.callingFunctionsService.getAllCategories({
          //     workspaceId: request.workspaceId,
          //     customerId: request.customerid
          //   });
          //   break;
          // case 'getActiveOffers':
          //   result = await this.callingFunctionsService.getActiveOffers({
          //     workspaceId: request.workspaceId,
          //     customerId: request.customerid
          //   });
          //   break;
          // case 'contactOperator':
          //   result = await this.callingFunctionsService.contactOperator({
          //     workspaceId: request.workspaceId,
          //     customerId: request.customerid
          //   });
          //   break;
          // case 'confirmOrderFromConversation':
          //   result = await this.callingFunctionsService.confirmOrderFromConversation({
          //     query: request.chatInput,
          //     workspaceId: request.workspaceId,
          //     customerId: request.customerid,
          //     messages: request.messages
          //   });
          //   break;
          // case 'ragSearch':
          //   result = await this.callingFunctionsService.ragSearch({
          //     query: arguments_.query || request.chatInput,
          //     workspaceId: request.workspaceId,
          //     customerId: request.customerid,
          //     messages: request.messages
          //   });
          //   break;
          default:
            console.warn(`⚠️ Unknown function: ${functionName}`);
            result = { success: false, error: 'Unknown function' };
        }

        results.push({
          functionName: functionName,
          arguments: arguments_,
          result: result
        });

        console.log(`✅ ${functionName} result:`, result);

      } catch (error) {
        console.error(`❌ Error executing ${toolCall.function.name}:`, error);
        results.push({
          functionName: toolCall.function.name,
          arguments: toolCall.function.arguments,
          result: { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    }

    return results;
  }

  private buildFallbackResponse(request: LLMRequest, ragResult: any): string {
    console.log('🔄 Building fallback response');
    
    if (ragResult.functionResults && ragResult.functionResults.length > 0) {
      const result = ragResult.functionResults[0];
      
      if (result.functionName === 'getServices' && result.result?.services) {
        const services = result.result.services;
        let response = 'Ecco i nostri servizi:\n\n';
        services.slice(0, 5).forEach((service: any) => {
          response += `🔧 ${service.name} - ${service.description}\n`;
        });
        return response;
      }
      
      if (result.functionName === 'getAllProducts' && result.result?.products) {
        const products = result.result.products;
        let response = 'Ecco i nostri prodotti:\n\n';
        products.slice(0, 5).forEach((product: any) => {
          response += `📦 ${product.name} (${product.ProductCode}) - ${product.formatted}\n`;
        });
        return response;
      }
      
      if (result.functionName === 'getOrdersListLink' && result.result?.linkUrl) {
        return `Ecco il link per visualizzare i tuoi ordini: ${result.result.linkUrl}`;
      }
    }
    
    return 'Mi dispiace, non sono riuscito a processare la tua richiesta. Riprova più tardi.';
  }
}
