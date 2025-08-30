import axios from 'axios';
import { LLMRequest, LLMResponse } from '../types/whatsapp.types';
import { CallingFunctionsService } from './calling-functions.service';
import { ToolDescriptionsService } from './tool-descriptions.service';
import { TranslationService } from './translation.service';

/*
CRITICAL RULES:
1. Call specific functions ONLY when the request clearly matches
2. For product lists/catalogs → CALL getAllProducts()
3. For services lists → CALL getServices()
4. For orders/order history → CALL getOrdersListLink()
5. For address/profile/email changes → CALL getCustomerProfileLink()
6. For offers/discounts → CALL getActiveOffers()
7. For categories → CALL getAllCategories()
8. For human assistance → CALL contactOperator()
9. For tracking SPECIFIC orders with order code → CALL getShipmentTrackingLink()
10. If request doesn't clearly match any function → DON'T call anything (fallback will handle)

EXAMPLES:
- "dammi la lista dei prodotti" → CALL getAllProducts()
- "voglio cambiare indirizzo" → CALL getCustomerProfileLink()
- "modificare email" → CALL getCustomerProfileLink()
- "voglio modificare la mia mail" → CALL getCustomerProfileLink()
*/

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
        tool_choice: 'auto',
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
      
      // STRATEGIA SearchRag-FIRST: Prova sempre SearchRag per primo
      console.log('� ALWAYS trying SearchRag first with translated query');
      
      const searchRagResult = await this.callingFunctionsService.SearchRag({
        query: translatedQuery,
        workspaceId: request.workspaceId,
        customerId: request.customerid,
        messages: request.messages
      });
      
      console.log('🔍 SearchRag result:', JSON.stringify(searchRagResult, null, 2));
      
      // Check if SearchRag found useful results with HIGHER THRESHOLD
      const ragResults: any = searchRagResult?.results || {};
      const hasProducts = ragResults.products && ragResults.products.length > 0;
      const hasFAQs = ragResults.faqs && ragResults.faqs.length > 0;
      const hasDocuments = ragResults.documents && ragResults.documents.length > 0;
      const hasServices = ragResults.services && ragResults.services.length > 0;
      
      // MUCH HIGHER THRESHOLD: Be very selective about what counts as "significant"
      const hasRelevantProducts = ragResults.products && ragResults.products.length >= 4; // At least 4 products
      const hasRelevantFAQs = ragResults.faqs && ragResults.faqs.length >= 2; // At least 2 FAQs
      const hasRelevantServices = ragResults.services && ragResults.services.length >= 3; // At least 3 services
      
      // Documents should almost NEVER be considered relevant - they are usually generic legal docs
      const hasRelevantDocuments = ragResults.documents && ragResults.documents.length >= 100 && 
                                   !hasProducts && !hasFAQs && !hasServices;
      
      const hasSignificantResults = hasRelevantProducts || hasRelevantFAQs || hasRelevantServices || hasRelevantDocuments;
      
      console.log('🔍 SearchRag relevance analysis:', {
        products: `${ragResults.products?.length || 0} (relevant: ${hasRelevantProducts})`,
        faqs: `${ragResults.faqs?.length || 0} (relevant: ${hasRelevantFAQs})`,
        services: `${ragResults.services?.length || 0} (relevant: ${hasRelevantServices})`,
        documents: `${ragResults.documents?.length || 0} (relevant: ${hasRelevantDocuments})`,
        hasSignificantResults
      });
      
      if (hasSignificantResults) {
        console.log('✅ SearchRag found SIGNIFICANT results - using SearchRag response');
        
        const searchResults = [{
          functionName: 'SearchRag',
          arguments: { query: translatedQuery },
          result: searchRagResult
        }];
        
        return {
          functionResults: searchResults,
          success: true
        };
      }
      
      // If SearchRag found nothing significant BUT we have tool calls, execute them
      console.log('⚠️ SearchRag found insufficient results - checking tool calls');
      if (toolCalls.length > 0) {
        console.log('🔧 Executing tool calls because SearchRag results were not significant enough');
        const toolResults = await this.executeToolCalls(toolCalls, request);
        console.log('✅ Tool call results:', JSON.stringify(toolResults, null, 2));
        
        return {
          functionResults: toolResults,
          success: true
        };
      }
      
      // If SearchRag found SOME significant results (not just documents) AND no tool calls, show SearchRag results
      if ((hasProducts || hasFAQs || hasServices || hasRelevantDocuments) && toolCalls.length === 0) {
        console.log('📋 SearchRag found SOME meaningful results and no tool calls - showing SearchRag results anyway');
        
        const searchResults = [{
          functionName: 'SearchRag',
          arguments: { query: translatedQuery },
          result: searchRagResult
        }];
        
        return {
          functionResults: searchResults,
          success: true
        };
      }
      
      // Fallback: return SearchRag result anyway
      console.log('⚠️ No significant SearchRag results and no tool calls - returning basic SearchRag result');
      
      const fallbackResults = [{
        functionName: 'SearchRag',
        arguments: { query: translatedQuery },
        result: searchRagResult
      }];
      
      return {
        functionResults: fallbackResults,
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

MISSION: You MUST call functions for specific requests. If no specific function matches, let the fallback system handle it.

AVAILABLE FUNCTIONS:
${this.toolDescriptionsService.getToolDescriptions().map(tool => 
  `- ${tool.name}: ${tool.description}`
).join('\n')}

CRITICAL RULES:
1. Call specific functions ONLY when the request clearly matches
2. For product lists/catalogs → CALL getAllProducts()
3. For services lists → CALL getServices()
4. For orders/order history → CALL getOrdersListLink()
5. For address/profile changes → CALL getCustomerProfileLink()
6. For offers/discounts → CALL getActiveOffers()
7. For categories → CALL getAllCategories()
8. For human assistance → CALL contactOperator()
9. For tracking SPECIFIC orders with order code → CALL getShipmentTrackingLink()
10. If request doesn't clearly match any function → DON'T call anything (fallback will handle)

EXAMPLES:
- "dammi la lista dei prodotti" → CALL getAllProducts()
- "che prodotti avete" → CALL getAllProducts()
- "catalogo" → CALL getAllProducts()
- "dammi link ordini" → CALL getOrdersListLink()
- "dammi link 20006" → CALL getOrdersListLink() with orderCode: "20006"
- "voglio cambiare indirizzo" → CALL getCustomerProfileLink()
- "modificare email" → CALL getCustomerProfileLink()
- "voglio modificare la mia mail" → CALL getCustomerProfileLink()
- "cambiare dati personali" → CALL getCustomerProfileLink()
- "voglio parlare con un operatore" → CALL contactOperator()
- "traccia ordine 12345" → CALL getShipmentTrackingLink() with orderCode: "12345"
- "tracking del mio ordine ABC123" → CALL getShipmentTrackingLink() with orderCode: "ABC123"
- "quanto ci vuole per la consegna" → NO FUNCTION (let fallback handle)
- "in quanto tempo arriva la merce" → NO FUNCTION (let fallback handle)
- "tempi di consegna" → NO FUNCTION (let fallback handle)
- "dimmi di più sulla mozzarella" → NO FUNCTION (let fallback handle)

IMPORTANT: Only call functions for clear, specific requests. Unclear requests will be handled by fallback search.

RESPOND ONLY WITH FUNCTION CALLS OR NO CALLS.`;
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
8. CRITICAL: NEVER modify numbers, prices, delivery times, or dates from the provided data. Use EXACTLY the numbers as given. If data says "3-5 business days" write "3-5 giorni lavorativi" (or "3-5 business days" in English). DO NOT change "3-5" to "2-3" or "24-48 hours".

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
    let profileLink = null;
    let products = null;
    let services = null;
    let offers = null;
    let categories = null;
    let operatorEscalation = null;
    let ragFAQs = null;
    let ragDocuments = null;
    
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
        else if (result.functionName === 'getAllProducts' && result.result?.data?.categories) {
          products = result.result.data.categories;
        }
        else if (result.functionName === 'getServices' && result.result?.data?.services) {
          services = result.result.data.services;
        }
        else if (result.functionName === 'getCustomerProfileLink' && result.result?.linkUrl) {
          profileLink = result.result.linkUrl;
        }
        else if (result.functionName === 'getActiveOffers' && result.result?.data?.offers) {
          offers = result.result.data.offers;
        }
        else if (result.functionName === 'getAllCategories' && result.result?.data?.categories) {
          categories = result.result.data.categories;
        }
        else if (result.functionName === 'contactOperator' && result.result?.data) {
          operatorEscalation = result.result.data;
        }
        else if (result.functionName === 'SearchRag' && result.result?.results) {
          // SearchRag returns products, faqs, services, documents
          const ragResults = result.result.results;
          
          if (ragResults.products && ragResults.products.length > 0) {
            products = ragResults.products;
          }
          if (ragResults.services && ragResults.services.length > 0) {
            services = ragResults.services;
          }
          if (ragResults.faqs && ragResults.faqs.length > 0) {
            ragFAQs = ragResults.faqs;
          }
          if (ragResults.documents && ragResults.documents.length > 0) {
            ragDocuments = ragResults.documents;
          }
        }
      }
    }
    
    let dataDescription = `User asked: "${request.chatInput}"`;
    
    // Handle SearchRag FAQ and document results
    if (ragFAQs && ragFAQs.length > 0) {
      dataDescription += `\n\nI found ${ragFAQs.length} relevant FAQ answers:`;
      ragFAQs.slice(0, 3).forEach((faq: any) => {
        dataDescription += `\n- Q: ${faq.question}`;
        dataDescription += `\n  A: ${faq.answer}`;
      });
    }
    if (ragDocuments && ragDocuments.length > 0) {
      dataDescription += `\n\nI found ${ragDocuments.length} relevant documents:`;
      ragDocuments.slice(0, 2).forEach((doc: any) => {
        dataDescription += `\n- ${doc.title}: ${doc.content.substring(0, 200)}...`;
      });
    }
    
    // If SearchRag was used but found nothing
    if (ragResult.functionResults && ragResult.functionResults.length > 0) {
      const searchRagUsed = ragResult.functionResults.some(r => r.functionName === 'SearchRag');
      if (searchRagUsed && !products && !services && !ragFAQs && !ragDocuments) {
        dataDescription += `\n\nI searched our database but couldn't find specific information about "${request.chatInput}". Provide a helpful general response or suggest contacting support.`;
      }
    }
    
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
    
    if (profileLink) {
      dataDescription += `\n\nI have generated a secure link for profile management: ${profileLink}`;
    }
    
    if (products && products.length > 0) {
      const totalProducts = products.reduce((sum: number, category: any) => sum + category.products.length, 0);
      dataDescription += `\n\nI have found ${totalProducts} products available organized in ${products.length} categories:`;
      
      products.forEach((category: any) => {
        dataDescription += `\n\n**${category.categoryName}** (${category.products.length} products):`;
        category.products.slice(0, 5).forEach((product: any) => {
          dataDescription += `\n- ${product.code} - ${product.name} - €${product.price}/${product.unit}`;
          if (product.description && product.description.length > 0) {
            dataDescription += ` (${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''})`;
          }
        });
        if (category.products.length > 5) {
          dataDescription += `\n... and ${category.products.length - 5} more products in this category`;
        }
      });
    }
    
    if (services && services.length > 0) {
      dataDescription += `\n\nI have found ${services.length} services available:`;
      services.slice(0, 5).forEach((service: any) => {
        dataDescription += `\n- ${service.code} - ${service.name} - €${service.price}/${service.unit}`;
        if (service.description && service.description.length > 0) {
          dataDescription += ` (${service.description.substring(0, 60)}${service.description.length > 60 ? '...' : ''})`;
        }
      });
    }
    
    if (offers && offers.length > 0) {
      dataDescription += `\n\nI have found ${offers.length} active offers and promotions:`;
      offers.forEach((offer: any) => {
        dataDescription += `\n- 🎯 ${offer.name} - ${offer.discountPercent}% OFF`;
        if (offer.description && offer.description.length > 0) {
          dataDescription += ` (${offer.description.substring(0, 80)}${offer.description.length > 80 ? '...' : ''})`;
        }
        if (offer.category) {
          dataDescription += ` [Category: ${offer.category.name}]`;
        }
        const endDate = new Date(offer.endDate);
        dataDescription += ` [Valid until: ${endDate.toLocaleDateString()}]`;
      });
    }
    
    if (categories && categories.length > 0) {
      dataDescription += `\n\nI have found ${categories.length} product categories available:`;
      categories.forEach((category: any) => {
        dataDescription += `\n- 📂 ${category.name}`;
        if (category.description && category.description.length > 0) {
          dataDescription += ` (${category.description.substring(0, 80)}${category.description.length > 80 ? '...' : ''})`;
        }
      });
    }
    
    if (operatorEscalation) {
      dataDescription += `\n\n🚨 OPERATOR ESCALATION: Customer has requested human assistance.`;
      dataDescription += `\nEscalation Details:`;
      dataDescription += `\n- Message: ${operatorEscalation.message}`;
      dataDescription += `\n- Estimated Response Time: ${operatorEscalation.estimatedResponseTime}`;
      dataDescription += `\n- Customer ID: ${operatorEscalation.customerInfo?.customerId}`;
      dataDescription += `\n- Workspace ID: ${operatorEscalation.customerInfo?.workspaceId}`;
      dataDescription += `\n- Reason: ${operatorEscalation.escalationReason}`;
    }
    
    return `${dataDescription}\n\nCONVERSATION HISTORY:\n${JSON.stringify(request.messages, null, 2)}\n\nCreate a natural, helpful response for the user's request. If there's an error, explain it clearly and suggest what the user can do. If you have a valid link, include it properly formatted.\n\n🚨 REMEMBER:\n- If there's an order error, explain the problem and suggest solutions\n- If operator escalation is requested, provide a professional and reassuring response\n- Respond conversationally, not in JSON\n- Use the link provided above if available\n- Be friendly and helpful\n- Format links as plain URLs`;
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
          case 'getShipmentTrackingLink':
            result = await this.callingFunctionsService.getShipmentTrackingLink({
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
          case 'SearchRag':
            result = await this.callingFunctionsService.SearchRag({
              query: arguments_.query || request.chatInput,
              workspaceId: request.workspaceId,
              customerId: request.customerid,
              messages: request.messages
            });
            break;
          // case 'confirmOrderFromConversation':
          //   result = await this.callingFunctionsService.confirmOrderFromConversation({
          //     query: request.chatInput,
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
      
      if (result.functionName === 'SearchRag' && result.result?.results) {
        const searchResults = result.result.results;
        let response = '';
        
        // Handle products
        if (searchResults.products && searchResults.products.length > 0) {
          response += '🧀 Ecco i prodotti che abbiamo trovato:\n\n';
          searchResults.products.slice(0, 5).forEach((product: any) => {
            response += `📦 **${product.name}** - €${product.finalPrice}\n`;
            if (product.description) {
              response += `   ${product.description.substring(0, 100)}...\n`;
            }
            response += '\n';
          });
          return response;
        }
        
        // Handle FAQs
        if (searchResults.faqs && searchResults.faqs.length > 0) {
          response += '❓ Ecco le informazioni che ho trovato:\n\n';
          searchResults.faqs.slice(0, 3).forEach((faq: any) => {
            response += `**${faq.question}**\n${faq.answer}\n\n`;
          });
          return response;
        }
        
        // Handle services
        if (searchResults.services && searchResults.services.length > 0) {
          response += '🔧 Ecco i servizi disponibili:\n\n';
          searchResults.services.slice(0, 3).forEach((service: any) => {
            response += `**${service.name}** - €${service.price}\n`;
            if (service.description) {
              response += `   ${service.description}\n`;
            }
            response += '\n';
          });
          return response;
        }
      }
      
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
