import axios from 'axios';
import { LLMRequest, LLMResponse } from '../types/whatsapp.types';
import { CallingFunctionsService } from './calling-functions.service';
import { ToolDescriptionsService } from './tool-descriptions.service';
import { TranslationService } from './translation.service';
import { EmbeddingService } from './embeddingService';
import { PromptTemplateService } from './prompt-template.service';

export class DualLLMService {
  private toolDescriptionsService: ToolDescriptionsService;
  private callingFunctionsService: CallingFunctionsService;
  private translationService: TranslationService;
  private embeddingService: EmbeddingService;
  private openRouterApiKey: string;
  private openRouterUrl: string;
  private backendUrl: string;
  private lastTranslatedQuery: string = '';
  private lastProcessedPrompt: string = '';

  constructor() {
    this.toolDescriptionsService = new ToolDescriptionsService();
    this.callingFunctionsService = new CallingFunctionsService();
    this.translationService = new TranslationService();
    this.embeddingService = new EmbeddingService();
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
    this.openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  }

  public async processMessage(request: LLMRequest): Promise<LLMResponse> {
    console.log('🚀🚀🚀 DUAL LLM PROCESSING STARTED 🚀🚀🚀');
    console.log('📥 Request received:', JSON.stringify(request, null, 2));
    
    try {
      // Stage 1: TRY CLOUD FUNCTIONS FIRST (NEW STRATEGY)
      console.log('🔧 Stage 1A: Trying Cloud Functions First');
      const functionResult = await this.tryCloudFunctions(request);
      
      let ragResult;
      if (functionResult.success) {
        console.log('✅ Cloud Functions succeeded, using CF result');
        ragResult = functionResult;
      } else {
        console.log('⚠️ Cloud Functions failed, falling back to SearchRag');
        // Stage 1B: FALLBACK TO SEARCHRAG IF CF FAILS
        ragResult = await this.executeSearchRagFallback(request);
      }
      
      console.log('✅ Final RAG Result:', JSON.stringify(ragResult, null, 2));
      
      if (!ragResult.success) {
        console.log('⚠️ Both processors failed, using generic fallback response');
        // STAGE 3: GENERIC FALLBACK - Never return error, always provide helpful response
        // Set a default translated query for generic fallback
        if (!this.lastTranslatedQuery) {
          this.lastTranslatedQuery = await this.translationService.translateForSearchRag(request.chatInput);
        }
        
        // 🔧 Process prompt even for generic fallback
        if (request.prompt && request.customer) {
          const processedPrompt = PromptTemplateService.processPromptTemplate(request.prompt, request.customer);
          this.lastProcessedPrompt = processedPrompt;
          console.log('🔧 Generic fallback: Prompt processed with customer data');
        }
        
        const genericResponse = await this.executeGenericFallback(request);
        return {
          output: genericResponse,
          success: true,
          functionCalls: [{
            type: 'generic_fallback',
            source: 'generic',
            functionName: 'Generic Fallback',
            result: 'No specific function or SearchRag results found, providing generic helpful response'
          }],
          translatedQuery: this.lastTranslatedQuery,
          processedPrompt: this.lastProcessedPrompt // 🔧 Include processedPrompt in generic fallback too
        };
      }
      
      // Stage 2: Formatter
      console.log('🔧 Stage 2: Formatter');
      const formattedResponse = await this.executeFormatter(request, ragResult);
      console.log('✅ Formatted Response:', JSON.stringify(formattedResponse, null, 2));
      
      return {
        output: formattedResponse,
        success: true,
        functionCalls: ragResult.functionResults || [],
        translatedQuery: this.lastTranslatedQuery,
        processedPrompt: this.lastProcessedPrompt
      };
      
    } catch (error) {
      console.error('❌❌❌ DUAL LLM ERROR:', error);
      console.error('❌ Error stack:', error.stack);
      return {
        output: 'Mi dispiace, si è verificato un errore. Riprova più tardi.',
        success: false,
        translatedQuery: this.lastTranslatedQuery || request.chatInput,
        processedPrompt: this.lastProcessedPrompt
      };
    }
  }

  private async tryCloudFunctions(request: LLMRequest): Promise<any> {
    console.log('🔧🔧🔧 TRY CLOUD FUNCTIONS STARTED 🔧🔧🔧');
    
    try {
      // Translate query
      const translatedQuery = await this.translationService.translateToEnglish(request.chatInput);
      this.lastTranslatedQuery = translatedQuery; // Store for debug
      console.log('🔧 Translated query:', translatedQuery);
      
      // Get function definitions
      const functionDefinitions = this.getRAGProcessorFunctionDefinitions();
      console.log('🔧 Function definitions:', JSON.stringify(functionDefinitions, null, 2));
      
      // Get agent config from database
      const agentConfig = await this.getAgentConfig(request.workspaceId);
      console.log('🔧 Agent config from DB:', agentConfig);
      
      const openRouterPayload = {
        model: agentConfig.model || 'openai/gpt-4o',
        messages: [
          {
            role: 'system',
            content: this.buildCloudFunctionsSystemMessage()
          },
          {
            role: 'user',
            content: translatedQuery
          }
        ],
        tools: functionDefinitions,
        tool_choice: 'auto',  // Changed to auto to allow non-function responses
        temperature: agentConfig.temperature || 0.0,
        max_tokens: agentConfig.maxTokens || 1000
      };
      
      console.log('🚀 CLOUD FUNCTIONS PAYLOAD:', JSON.stringify(openRouterPayload, null, 2));
      
      const response = await axios.post(this.openRouterUrl, openRouterPayload, {
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.backendUrl,
          'X-Title': 'ShopMe Cloud Functions'
        },
        timeout: 30000
      });
      
      console.log('✅ Cloud Functions Response:', JSON.stringify(response.data, null, 2));
      
      const message = response.data.choices[0].message;
      const toolCalls = message.tool_calls || [];
      
      console.log('🔧 Tool calls found:', toolCalls.length);
      
      if (toolCalls.length > 0) {
        // Execute tool calls
        console.log('🔧 Executing tool calls...');
        const results = await this.executeToolCalls(toolCalls, request);
        console.log('✅ Tool call results:', JSON.stringify(results, null, 2));
        
        return {
          functionResults: results,
          success: true,
          source: 'cloud_functions'
        };
      } else {
        console.log('⚠️ No tool calls detected - Cloud Functions cannot handle this request');
        return {
          functionResults: [],
          success: false,
          source: 'cloud_functions'
        };
      }
      
    } catch (error) {
      console.error('❌ Cloud Functions Error:', error);
      return {
        functionResults: [],
        success: false,
        source: 'cloud_functions',
        error: error.message
      };
    }
  }

  private async executeSearchRagFallback(request: LLMRequest): Promise<any> {
    console.log('🔧🔧🔧 SEARCHRAG FALLBACK STARTED 🔧🔧🔧');
    
    try {
      // Translate query specifically for SearchRag with language detection
      const translatedQuery = await this.translationService.translateForSearchRag(request.chatInput);
      this.lastTranslatedQuery = translatedQuery; // Store for debug

      // Use SearchRag for semantic search - try multiple sources
      const [productResults, serviceResults, faqResults] = await Promise.all([
        this.embeddingService.searchProducts(translatedQuery, request.workspaceId, 2),
        this.embeddingService.searchServices(translatedQuery, request.workspaceId, 2),
        this.embeddingService.searchFAQs(translatedQuery, request.workspaceId, 2)
      ]);
      
      const allResults = [
        ...productResults.map(r => ({ ...r, type: 'product' })),
        ...serviceResults.map(r => ({ ...r, type: 'service' })),
        ...faqResults.map(r => ({ ...r, type: 'faq' }))
      ];
      
      console.log('🔧 SearchRag results:', JSON.stringify(allResults, null, 2));
      
      if (allResults.length === 0) {
        console.log('⚠️ No SearchRag results found');
        return {
          functionResults: [],
          success: false,
          source: 'searchrag'
        };
      }
      
      // Format SearchRag results
      const formattedResults = allResults.map(result => ({
        type: 'searchrag_result',
        data: result,
        source: 'searchrag'
      }));
      
      return {
        functionResults: formattedResults,
        success: true,
        source: 'searchrag'
      };
      
    } catch (error) {
      console.error('❌ SearchRag Fallback Error:', error);
      return {
        functionResults: [],
        success: false,
        source: 'searchrag',
        error: error.message
      };
    }
  }

  private buildCloudFunctionsSystemMessage(): string {
    return `You are a Function Calling Agent for ShopMe WhatsApp Bot.

MISSION: You MUST call functions for specific requests, otherwise decline politely.

AVAILABLE FUNCTIONS:
${this.toolDescriptionsService.getToolDescriptions().map(tool => 
  `- ${tool.name}: ${tool.description}`
).join('\n')}

CRITICAL RULES:
1. For order-related requests → CALL GetOrdersListLink()
   - If user specifies order code/number (e.g., "ordine TRACKING-TEST-001"), include orderCode parameter
   - For general orders list, call without orderCode parameter
2. For shipment tracking requests → CALL GetShipmentTrackingLink()
   - REQUIRES orderCode parameter: "dove è il mio ordine", "dov'è ordine X", "tracking ordine Y"
3. For active offers requests → CALL GetActiveOffers()
4. For contact/support requests → CALL GetContactInfo()
5. For "what do you sell" requests (cosa vendete) → CALL getAllCategories()
6. For complete product catalog requests → CALL getAllProducts()
7. For services → CALL getServices()
8. For profile/address changes → CALL GetCustomerProfileLink()
9. If request doesn't match any function → respond "NO_FUNCTION_NEEDED"

PRIORITY: Cloud Functions take precedence. If uncertain, don't call functions.`;
  }

  private async executeFormatter(request: LLMRequest, ragResult: any): Promise<string> {
    try {
      console.log('🎨 Stage 2: Formatter - Natural Response Generation');

      // Use personalized prompt from request or fallback to default
      const systemMessage = request.prompt && request.customer 
        ? this.buildFormatterSystemMessageWithCustomer(request.prompt, request.customer)
        : this.buildFormatterSystemMessage();

      const response = await axios.post(this.openRouterUrl, {
        model: 'anthropic/claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'system',
            content: systemMessage
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

  private buildFormatterSystemMessage(): string {
    return `You are a helpful WhatsApp assistant for ShopMe.

MISSION: Create natural, friendly responses based on the data provided.

STYLE:
- Use Italian language
- Be conversational and warm
- Keep responses concise but informative
- Use emojis appropriately
- Always be helpful and professional

CONTEXT: You receive data from either Cloud Functions or SearchRag.
- Cloud Functions: Structured data (orders, offers, contacts)
- SearchRag: Semantic search results about products/services

Format the response naturally based on the data type and user's request.`;
  }

  /**
   * Build formatter system message with customer personalization
   */
  private buildFormatterSystemMessageWithCustomer(agentPrompt: string, customer: any): string {
    if (!customer) {
      this.lastProcessedPrompt = agentPrompt;
      return agentPrompt;
    }

    // Process template with customer data
    const processedPrompt = PromptTemplateService.processPromptTemplate(agentPrompt, customer);
    this.lastProcessedPrompt = processedPrompt;
    
    console.log('🔧 Prompt processed with customer data');
    console.log('🔧 Customer info:', {
      name: customer.name,
      discount: customer.discount,
      language: customer.language,
      phone: customer.phone
    });
    
    return processedPrompt;
  }

  private buildFormatterUserMessage(request: LLMRequest, ragResult: any): string {
    const userQuery = request.chatInput;
    const dataSource = ragResult.source || 'unknown';
    const functionResults = ragResult.functionResults || [];
    
    let dataContext = '';
    if (functionResults.length > 0) {
      dataContext = `Data from ${dataSource}:\n${JSON.stringify(functionResults, null, 2)}`;
    } else {
      dataContext = 'No data found for this request.';
    }
    
    return `User asked: "${userQuery}"

${dataContext}

Please create a natural, helpful response in Italian based on this data.`;
  }

  private buildFallbackResponse(request: LLMRequest, ragResult: any): string {
    const userQuery = request.chatInput;
    
    if (ragResult.functionResults && ragResult.functionResults.length > 0) {
      return `Ho trovato alcune informazioni per la tua richiesta "${userQuery}". Tuttavia, si è verificato un errore nella formattazione della risposta. Ti prego di riprovare.`;
    }
    
    return `Mi dispiace, non sono riuscito a trovare informazioni specifiche per "${userQuery}". Puoi essere più specifico o provare con una domanda diversa?`;
  }

  private getRAGProcessorFunctionDefinitions(): any[] {
    return [
      {
        type: 'function',
        function: {
          name: 'GetOrdersListLink',
          description: 'Get a direct link to view customer orders. Use this for any order-related requests. If user specifies an order code/number, include it in orderCode parameter.',
          parameters: {
            type: 'object',
            properties: {
              orderCode: {
                type: 'string',
                description: 'Optional order code/number when user requests a specific order (e.g., "TRACKING-TEST-001", "20007", etc.)'
              }
            },
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'GetShipmentTrackingLink',
          description: 'Get shipment tracking link for order delivery status. Use when user asks about order location, delivery status, or shipment tracking. If no orderCode provided, ask user to specify which order. Triggers: "dove è il mio ordine", "dov\'è il mio ordine", "tracking spedizione", "stato spedizione", "where is my order", "track my order".',
          parameters: {
            type: 'object',
            properties: {
              orderCode: {
                type: 'string',
                description: 'Order code/number for tracking. If not provided, function will return message asking user to specify order code.'
              }
            },
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'GetCustomerProfileLink',
          description: 'Get link to customer profile page for modifying personal information, address, or account details. Use when user wants to change/modify their profile, address, email, or personal data. Triggers: "modificare profilo", "cambiare indirizzo", "vedere mail", "mia mail", "change profile", "update address".',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'GetActiveOffers',
          description: 'Get current active offers and promotions.',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'GetContactInfo',
          description: 'Get contact information and support details.',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'getAllCategories',
          description: 'Get all product categories overview. Use when user asks what you sell, what categories you have, or wants to see available product types. Triggers: "cosa vendete", "COS VENDETE", "che categorie avete", "what do you sell", "categories", case insensitive.',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'getAllProducts',
          description: 'Get complete detailed product catalog with all products, descriptions and prices. Use when user wants full product details, complete catalog, or specific product information. Triggers: "catalogo completo", "tutti i prodotti", "lista prodotti dettagliata".',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'getServices',
          description: 'Get all available services.',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      }
    ];
  }

  private async executeToolCalls(toolCalls: any[], request: LLMRequest): Promise<any[]> {
    const results = [];
    
    for (const toolCall of toolCalls) {
      try {
        console.log('🔧 Executing tool call:', toolCall.function.name);
        
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments || '{}');
        
        let result;
        
        // Call the appropriate function based on the function name
        switch (functionName) {
          case 'GetOrdersListLink':
            result = await this.callingFunctionsService.getOrdersListLink({
              customerId: request.customerid || '',
              workspaceId: request.workspaceId,
              orderCode: args.orderCode
            });
            break;
          
          case 'GetActiveOffers':
            result = await this.callingFunctionsService.getActiveOffers({
              customerId: request.customerid || '',
              workspaceId: request.workspaceId
            });
            break;
          
          case 'GetShipmentTrackingLink':
            result = await this.callingFunctionsService.getShipmentTrackingLink({
              customerId: request.customerid || '',
              workspaceId: request.workspaceId,
              orderCode: args.orderCode
            });
            break;
          
          case 'GetCustomerProfileLink':
            result = await this.callingFunctionsService.getCustomerProfileLink({
              customerId: request.customerid || '',
              workspaceId: request.workspaceId
            });
            break;
          
          case 'GetContactInfo':
            result = await this.callingFunctionsService.contactOperator({
              customerId: request.customerid || '',
              workspaceId: request.workspaceId
            });
            break;
          
          case 'getAllCategories':
            result = await this.callingFunctionsService.getAllCategories({
              customerId: request.customerid || '',
              workspaceId: request.workspaceId
            });
            break;
          
          case 'getAllProducts':
            result = await this.callingFunctionsService.getAllProducts({
              customerId: request.customerid || '',
              workspaceId: request.workspaceId
            });
            break;
          
          case 'getServices':
            result = await this.callingFunctionsService.getServices({
              customerId: request.customerid || '',
              workspaceId: request.workspaceId
            });
            break;
          
          default:
            throw new Error(`Unknown function: ${functionName}`);
        }
        
        results.push({
          toolCall: toolCall,
          result: result,
          functionName: functionName
        });
        
      } catch (error) {
        console.error(`❌ Error executing ${toolCall.function.name}:`, error);
        results.push({
          toolCall: toolCall,
          error: error.message,
          functionName: toolCall.function.name
        });
      }
    }
    
    return results;
  }

  private async getAgentConfig(workspaceId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.backendUrl}/api/agents/workspace/${workspaceId}/config`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching agent config:', error);
      return {
        prompt: 'You are a helpful assistant.',
        model: 'openai/gpt-4o',
        temperature: 0.0,
        maxTokens: 1000
      };
    }
  }

  private async executeGenericFallback(request: LLMRequest): Promise<string> {
    console.log('🔧 Stage 3: Generic Fallback - Providing helpful response');
    
    try {
      // 🔧 Use personalized prompt with customer data if available
      const systemMessage = request.prompt && request.customer 
        ? this.lastProcessedPrompt || PromptTemplateService.processPromptTemplate(request.prompt, request.customer)
        : `You are SofIA, a friendly Italian food e-commerce assistant for L'Altra Italia. 
            
            When you don't understand a request or can't find specific information, provide a helpful, friendly response that:
            1. Acknowledges the user's message politely
            2. Offers to help with common requests (orders, products, contact)
            3. Uses a warm, professional Italian tone
            4. Includes relevant emojis
            5. Suggests specific actions they can try
            
            Keep responses concise but helpful. Always try to be useful even when you don't understand exactly what they want.`;

      console.log('🔧 Generic Fallback using system message:', systemMessage.substring(0, 200) + '...');

      const response = await axios.post(this.openRouterUrl, {
        model: 'anthropic/claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: request.chatInput
          }
        ],
        temperature: 0.3,
        max_tokens: 400
      }, {
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
      
    } catch (error) {
      console.error('❌ Generic fallback failed:', error);
      
      // Ultimate fallback - static helpful message
      return `Ciao! 👋 Sono SofIA, il tuo assistente per L'Altra Italia.

Mi dispiace, non ho capito bene la tua richiesta. Posso aiutarti con:

🛒 **Ordini**: Scrivi "i miei ordini" per vedere il tuo storico
📦 **Prodotti**: Scrivi "cosa vendete" per le nostre categorie  
📞 **Assistenza**: Scrivi "contatti" per parlare con un operatore

Cosa posso fare per te? 😊`;
    }
  }

  private isAccountRelatedRequest(input: string): boolean {
    const lowerInput = input.toLowerCase();
    const accountKeywords = [
      'mail', 'email', 'profilo', 'profile', 'account', 'password', 
      'modificare', 'cambiare', 'vedere', 'visualizzare', 'mia mail',
      'mio profilo', 'dati personali', 'informazioni personali'
    ];
    
    return accountKeywords.some(keyword => lowerInput.includes(keyword));
  }
}
