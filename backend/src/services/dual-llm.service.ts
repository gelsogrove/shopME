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

  constructor() {
    this.toolDescriptionsService = new ToolDescriptionsService();
    this.callingFunctionsService = new CallingFunctionsService();
    this.translationService = new TranslationService();
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
    this.openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
  }

  public async processMessage(request: LLMRequest): Promise<LLMResponse> {
    try {
      console.log('🚀 DUAL LLM: Starting message processing');
      console.log('📝 Input:', request.chatInput);

      // Stage 1: Function Calling (RAG Processor)
      const ragResult = await this.executeRAGProcessor(request);
      console.log('✅ Stage 1 completed:', ragResult);

      // Stage 2: Formatter
      const formattedResponse = await this.executeFormatter(request, ragResult);
      console.log('✅ Stage 2 completed:', formattedResponse);

      return {
        output: formattedResponse,
        success: true,
        functionCalls: ragResult.functionResults || []
      };

    } catch (error) {
      console.error('❌ DUAL LLM Error:', error);
      return {
        output: 'Mi dispiace, si è verificato un errore. Riprova più tardi.',
        success: false
      };
    }
  }

  private async executeRAGProcessor(request: LLMRequest): Promise<any> {
    try {
      console.log('🔧 Stage 1: RAG Processor - Function Calling');

      // Translate query to English for better semantic search
      const translatedQuery = await this.translationService.translateToEnglish(request.chatInput);
      console.log('🌐 Translated query:', translatedQuery);

      const functionDefinitions = this.getRAGProcessorFunctionDefinitions();
      
      const response = await axios.post(this.openRouterUrl, {
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'system',
            content: this.buildRAGProcessorSystemMessage()
          },
          {
            role: 'user',
            content: translatedQuery
          }
        ],
        tools: functionDefinitions,
        tool_choice: 'auto',
        temperature: 0.0,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'ShopMe RAG Processor'
        },
        timeout: 30000
      });

      const toolCalls = response.data.choices[0]?.message?.tool_calls || [];
      console.log('🔧 Tool calls detected:', toolCalls.length);

      if (toolCalls.length === 0) {
        console.log('⚠️ No tool calls detected, using ragSearch as fallback');
        return await this.executeFallbackRAGSearch(request, translatedQuery);
      }

      const functionResults = await this.executeToolCalls(toolCalls, request);
      console.log('✅ Function results:', functionResults);

      return {
        functionResults: functionResults,
        success: true
      };

    } catch (error) {
      console.error('❌ RAG Processor Error:', error);
      return await this.executeFallbackRAGSearch(request, request.chatInput);
    }
  }

  private async executeFallbackRAGSearch(request: LLMRequest, query: string): Promise<any> {
    console.log('🔄 Fallback: Using ragSearch');
    try {
      const result = await this.callingFunctionsService.ragSearch({
        query: query,
        workspaceId: request.workspaceId,
        customerId: request.customerid,
        messages: request.messages
      });

      return {
        functionResults: [{
          functionName: 'ragSearch',
          arguments: { query },
          result: result
        }],
        success: true
      };
    } catch (error) {
      console.error('❌ Fallback RAG Search Error:', error);
      return {
        functionResults: [],
        success: false
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

RULES:
1. ALWAYS call a function - never respond with text
2. Use getAllProducts() for product catalog requests
3. Use getServices() for service catalog requests  
4. Use getOrdersListLink() for order history requests
5. Use ragSearch() for general questions and searches
6. Use contactOperator() for human assistance requests

EXAMPLES:
- "dammi i prodotti" → CALL getAllProducts()
- "che servizi avete" → CALL getServices()
- "i miei ordini" → CALL getOrdersListLink()
- "quanto costa la spedizione" → CALL ragSearch()
- "voglio parlare con qualcuno" → CALL contactOperator()

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
6. Always respond in the user's language (Italian)

LINK FORMATTING FOR WHATSAPP:
- Use plain URLs: https://example.com
- Don't use markdown [text](url) format
- Include token in URL if provided

EXAMPLES:
- Products: "Ecco i nostri prodotti: 🧀 Mozzarella €7.99"
- Services: "I nostri servizi: 🚚 Consegna rapida €5.99"
- Orders: "Ecco il link per i tuoi ordini: https://example.com/orders?token=xyz"

RESPOND IN NATURAL LANGUAGE ONLY.`;
  }

  private buildFormatterUserMessage(request: LLMRequest, ragResult: any): string {
    let orderLink = null;
    let orderCode = null;
    let products = null;
    let services = null;
    
    if (ragResult.functionResults && ragResult.functionResults.length > 0) {
      for (const result of ragResult.functionResults) {
        if (result.functionName === 'getOrdersListLink' && result.result?.linkUrl) {
          orderLink = result.result.linkUrl;
          orderCode = result.arguments?.orderCode || null;
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
    
    if (orderLink && orderCode) {
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
    
    return `${dataDescription}\n\nCONVERSATION HISTORY:\n${JSON.stringify(request.messages, null, 2)}\n\nCreate a natural, helpful response for the user's request. If you have a link, include it properly formatted.\n\n🚨 REMEMBER:\n- Respond conversationally, not in JSON\n- Use the link provided above if available\n- Be friendly and helpful\n- Format links as plain URLs`;
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
            messages: { type: 'array', description: 'Conversation history for context' }
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
          case 'getAllProducts':
            result = await this.callingFunctionsService.getAllProducts({
              workspaceId: request.workspaceId,
              customerId: request.customerid
            });
            break;
          case 'getServices':
            result = await this.callingFunctionsService.getServices({
              workspaceId: request.workspaceId,
              customerId: request.customerid
            });
            break;
          case 'getOrdersListLink':
            result = await this.callingFunctionsService.getOrdersListLink({
              customerId: request.customerid,
              workspaceId: request.workspaceId,
              orderCode: arguments_.orderCode
            });
            break;
          case 'getCustomerProfileLink':
            result = await this.callingFunctionsService.getCustomerProfileLink({
              customerId: request.customerid,
              workspaceId: request.workspaceId
            });
            break;
          case 'getAllCategories':
            result = await this.callingFunctionsService.getAllCategories({
              workspaceId: request.workspaceId,
              customerId: request.customerid
            });
            break;
          case 'getActiveOffers':
            result = await this.callingFunctionsService.getActiveOffers({
              workspaceId: request.workspaceId,
              customerId: request.customerid
            });
            break;
          case 'contactOperator':
            result = await this.callingFunctionsService.contactOperator({
              workspaceId: request.workspaceId,
              customerId: request.customerid
            });
            break;
          case 'confirmOrderFromConversation':
            result = await this.callingFunctionsService.confirmOrderFromConversation({
              query: request.chatInput,
              workspaceId: request.workspaceId,
              customerId: request.customerid,
              messages: request.messages
            });
            break;
          case 'ragSearch':
            result = await this.callingFunctionsService.ragSearch({
              query: arguments_.query || request.chatInput,
              workspaceId: request.workspaceId,
              customerId: request.customerid,
              messages: request.messages
            });
            break;
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
