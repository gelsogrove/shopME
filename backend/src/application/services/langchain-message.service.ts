import { ChatOpenAI } from '@langchain/openai'
import { MessageRepository } from '../../repositories/message.repository'
import { embeddingService } from '../../services/embeddingService'
import { ApiLimitService } from './api-limit.service'
import { CheckoutService } from './checkout.service'
import { TokenService } from './token.service'

/**
 * LangChain-powered WhatsApp Message Service with Dual-LLM Architecture
 * 
 * Architecture:
 * 1. Router LLM: Analyzes message and decides which function to call
 * 2. Formatter LLM: Formats response with conversation history and professional tone
 */
export class LangChainMessageService {
  private conversationMemories: Map<string, any[]> = new Map()

  constructor(
    private messageRepository: MessageRepository,
    private tokenService: TokenService,
    private checkoutService: CheckoutService,
    private apiLimitService: ApiLimitService
  ) {
    // NOTE: Both Router LLM and Formatter LLM are now created dynamically from database config
    // Router LLM uses environment variables for decision-making (low temperature, focused)
    // Formatter LLM uses database agent config for response formatting (higher temperature, creative)
  }

  /**
   * Main message processing method with LangChain dual-LLM flow
   */
  async processMessage(
    message: string,
    phoneNumber: string,
    workspaceId: string
  ): Promise<string | null> {
    try {
      console.log(`[LANGCHAIN] Starting message processing for ${phoneNumber}`)

      // Detect language from message
      const { detectLanguage } = require('../../utils/language-detector');
      const detectedLanguage = detectLanguage(message);
      console.log(`[LANGCHAIN] Detected language: ${detectedLanguage}`)

      // STEP 1-5: Pre-processing checks (non-LLM)
      const preProcessResult = await this.runPreProcessingChecks(message, phoneNumber, workspaceId)
      if (preProcessResult === 'BLOCK') {
        return null // Block processing
      }
      if (preProcessResult !== null && preProcessResult !== 'CONTINUE') {
        return preProcessResult // Return specific message (WIP, operator control, etc.)
      }

      // Get customer and workspace context
      const customer = await this.messageRepository.findCustomerByPhone(phoneNumber, workspaceId)
      const workspace = await this.messageRepository.getWorkspaceSettings(workspaceId)

      if (!workspace) {
        console.log(`[LANGCHAIN] Workspace not found: ${workspaceId}`)
        return null
      }

      // STEP 6-8: Router LLM Decision
      const routerResult = await this.runRouterLLM(message, customer, workspace, phoneNumber)
      
      let rawResponse: string
      let agentSelected: string
      
      if (!routerResult) {
        // NO_FUNCTION case - agent responds directly with identity
        console.log(`[LANGCHAIN] NO_FUNCTION - agent will respond directly`)
        rawResponse = message // Pass original message to formatter
        agentSelected = 'Direct Agent Response (Identity)'
      } else {
        // Function was called - execute it
        console.log(`[LANGCHAIN] Executing function: ${routerResult.agentSelected}`)
        rawResponse = await this.executeFunctionFromRouter(
          routerResult.agentSelected,
          customer,
          workspace.id,
          message,
          phoneNumber
        )
        agentSelected = routerResult.agentSelected
      }

      // STEP 9: Formatter LLM Response
      const finalResponse = await this.runFormatterLLM(
        rawResponse,
        customer,
        workspace,
        phoneNumber,
        detectedLanguage
      )

      // Save message and response using correct signature
      await this.messageRepository.saveMessage({
        workspaceId,
        phoneNumber,
        message,
        response: finalResponse,
        agentSelected: agentSelected || 'LangChain Agent'
      })

      // Increment API usage
      await this.apiLimitService.incrementApiUsage(workspaceId, 'whatsapp_message')

      console.log(`[LANGCHAIN] Message processed successfully`)
      return finalResponse

    } catch (error) {
      console.error(`[LANGCHAIN] Error processing message:`, error)
      
      // Fallback error message
      const errorMessage = await this.messageRepository.getErrorMessage(workspaceId, 'en')
      return errorMessage || 'Sorry, I\'m having technical difficulties. Please try again later.'
    }
  }

  /**
   * STEP 1-5: Pre-processing checks (API limits, spam, workspace, chatbot, blacklist)
   * Returns: 'BLOCK' to block, 'CONTINUE' to continue, or specific message to return
   */
  private async runPreProcessingChecks(
    message: string,
    phoneNumber: string,
    workspaceId: string
  ): Promise<string | null> {
    
    // STEP 1: API Limit Check
    const apiLimit = await this.apiLimitService.checkApiLimit(workspaceId)
    if (apiLimit.exceeded) {
      console.log(`[LANGCHAIN] STEP 1: API limit exceeded for workspace ${workspaceId}`)
      return 'BLOCK'
    }

    // STEP 2: Spam Detection
    const spamCheck = await this.checkSpamBehavior(phoneNumber, workspaceId)
    if (spamCheck.isSpam) {
      console.log(`[LANGCHAIN] STEP 2: Spam detected for ${phoneNumber}`)
      await this.addToAutoBlacklist(phoneNumber, workspaceId, 'AUTO_SPAM')
      return 'BLOCK'
    }

    // STEP 3: Workspace Active Check
    const workspace = await this.messageRepository.getWorkspaceSettings(workspaceId)
    if (!workspace?.isActive) {
      console.log(`[LANGCHAIN] STEP 3: Workspace inactive ${workspaceId}`)
      return 'BLOCK'
    }

    // STEP 4: Chatbot Active Check
    const customer = await this.messageRepository.findCustomerByPhone(phoneNumber, workspaceId)
    if (customer && !customer.activeChatbot) {
      console.log(`[LANGCHAIN] STEP 4: Chatbot disabled for customer ${customer.id}`)
      await this.messageRepository.saveMessage({
        workspaceId,
        phoneNumber,
        message,
        response: '',
        agentSelected: 'Manual Operator Control'
      })
      return '' // Empty string indicates operator control
    }

    // STEP 5: Blacklist Check
    const isBlacklisted = await this.messageRepository.isCustomerBlacklisted(phoneNumber, workspaceId)
    if (isBlacklisted) {
      console.log(`[LANGCHAIN] STEP 5: Customer blacklisted ${phoneNumber}`)
      return 'BLOCK'
    }

    // STEP 6: WIP Check
    if (workspace.challengeStatus) {
      console.log(`[LANGCHAIN] STEP 6: Workspace in WIP mode ${workspaceId}`)
      const wipMessage = await this.messageRepository.getWipMessage(workspaceId, 'en')
      await this.apiLimitService.incrementApiUsage(workspaceId, 'whatsapp_message')
      return wipMessage
    }

    return 'CONTINUE' // Continue to LLM processing
  }

  /**
   * STEP 7: Router LLM - Decide which function to call
   */
  private async runRouterLLM(
    message: string,
    customer: any,
    workspace: any,
    phoneNumber: string
  ): Promise<{ rawResponse: string; agentSelected: string } | null> {
    
    console.log(`[LANGCHAIN] Starting Router LLM for message: "${message}"`)

    try {
      // GET ROUTER PROMPT FROM DATABASE - NO HARDCODE!
      const routerPrompt = await this.messageRepository.getPromptByName(workspace.id, "Router LLM")
      
      if (!routerPrompt) {
        console.error(`[LANGCHAIN] Router prompt not found in database for workspace ${workspace.id}`)
        throw new Error('Router prompt not found in database')
      }

      // Replace {message} placeholder with actual message
      const finalPrompt = routerPrompt.content.replace('{message}', message)

      console.log(`[LANGCHAIN] Router prompt loaded from database:`)
      console.log(finalPrompt)
      console.log(`[LANGCHAIN] Calling OpenRouter...`)

      // Create Router LLM dynamically (uses environment config for decision-making)
      const routerLLM = new ChatOpenAI({
        modelName: process.env.ROUTER_LLM_MODEL || 'openai/gpt-4o-mini',
        temperature: parseFloat(process.env.ROUTER_LLM_TEMPERATURE || '0.1'),
        maxTokens: parseInt(process.env.ROUTER_LLM_MAX_TOKENS || '500'),
        openAIApiKey: process.env.OPENROUTER_API_KEY,
        configuration: {
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
            'HTTP-Referer': process.env.OPENROUTER_REFERER || 'http://localhost:3000',
            'X-Title': process.env.OPENROUTER_TITLE || 'ShopMe WhatsApp Bot'
          }
        }
      })

      console.log(`[LANGCHAIN] Router LLM configured, making API call...`)

      // Execute router LLM
      const routerResponse = await routerLLM.invoke([{ role: 'user', content: finalPrompt }])
      
      console.log(`[LANGCHAIN] Router LLM raw response:`, routerResponse.content)
      console.log(`[LANGCHAIN] Router response type:`, typeof routerResponse.content)
      console.log(`[LANGCHAIN] Router response length:`, (routerResponse.content as string)?.length)

      // Parse the router response to get the function name
      const functionName = (routerResponse.content as string).trim()
      console.log(`[LANGCHAIN] Router selected function: "${functionName}"`)

      // Handle NO_FUNCTION case - let the agent respond directly
      if (functionName === 'NO_FUNCTION') {
        console.log(`[LANGCHAIN] NO_FUNCTION selected - agent will respond directly`)
        return null // This will trigger direct agent response
      }

      return {
        rawResponse: routerResponse.content as string,
        agentSelected: functionName
      }

    } catch (error) {
      console.error(`[LANGCHAIN] Router LLM error:`, error)
      
      // Fallback to rag_search if router fails
      console.log(`[LANGCHAIN] Router failed, falling back to rag_search`)
      
      try {
        const fallbackResult = await this.executeFunctionFromRouter(
          'rag_search',
          customer,
          workspace.id,
          message,
          phoneNumber
        )
        
        return {
          rawResponse: fallbackResult,
          agentSelected: 'LangChain Fallback (rag_search)'
        }
      } catch (fallbackError) {
        console.error(`[LANGCHAIN] Fallback also failed:`, fallbackError)
        return null
      }
    }
  }

  /**
   * STEP 8: Execute function selected by Router LLM
   */
  private async executeFunctionFromRouter(
    functionName: string,
    customer: any,
    workspaceId: string,
    message: string,
    phoneNumber: string
  ): Promise<string> {
    
    console.log(`[LANGCHAIN] Executing function: ${functionName}`)

    try {
      switch (functionName) {
        case 'checkout_intent':
          const checkoutResult = await this.checkoutService.generateCheckoutIntent(customer.id, workspaceId)
          return checkoutResult

        case 'welcome_back_user':
          // FLOW COMPLIANCE: Rispetto esatto del flow.md
          const { detectLanguage } = require('../../utils/language-detector');
          const detectedLanguage = detectLanguage(message);
          const userLanguage = detectedLanguage || customer?.language || 'en';
          
          // UTENTE NON REGISTRATO + SALUTO → Welcome message + link registrazione (flow.md)
          // Un utente è considerato "non registrato" se:
          // 1. Non esiste nel database, OR
          // 2. Non ha completato la registrazione (manca company, privacy acceptance, etc.)
          const isUserRegistered = customer && 
                                    customer.company && 
                                    customer.last_privacy_version_accepted && 
                                    customer.privacy_accepted_at &&
                                    customer.name !== 'Unknown Customer';
          
          if (!isUserRegistered) {
            console.log(`[LANGCHAIN] FLOW: Unregistered user with greeting - welcome message + registration link`);
            
            const token = await this.tokenService.createRegistrationToken(phoneNumber, workspaceId);
            const workspaceUrl = await this.messageRepository.getWorkspaceUrl(workspaceId);
            const registrationUrl = `${workspaceUrl}/register?phone=${encodeURIComponent(phoneNumber)}&workspace=${workspaceId}&token=${token}`;
            
            // FLOW.MD: Messaggio welcome nella lingua detectata + link
            const welcomeMessages = {
              'it': `Ciao! Per assicurarti un buon servizio e garantire la privacy, ti chiedo di inserire qui i tuoi dati:\n\n🔗 ${registrationUrl}\n\nQuesto link è sicuro e scade tra 1 ora.`,
              'es': `¡Hola! Para asegurarte un buen servicio y garantizar tu privacidad, te pido que introduzcas tus datos aquí:\n\n🔗 ${registrationUrl}\n\nEste enlace es seguro y caduca en 1 hora.`,
              'en': `Hello! To ensure you get good service and guarantee your privacy, please enter your details here:\n\n🔗 ${registrationUrl}\n\nThis link is secure and expires in 1 hour.`
            };
            
            return welcomeMessages[userLanguage] || welcomeMessages['en'];
          }
          
          // UTENTE REGISTRATO + SALUTO → Welcome back message (flow.md)
          console.log(`[LANGCHAIN] FLOW: Registered customer greeting - welcome back message`);
          
          const welcomeBackMessages = {
            'it': `Ciao ${customer.name}! Bentornato! 😊\nCome posso aiutarti oggi?`,
            'es': `¡Hola ${customer.name}! ¡Bienvenido de vuelta! 😊\n¿Cómo puedo ayudarte hoy?`,
            'en': `Hello ${customer.name}! Welcome back! 😊\nHow can I help you today?`
          };
          
          return welcomeBackMessages[userLanguage] || welcomeBackMessages['en'];

        case 'rag_search':
          return await this.getUnifiedSearchResults(workspaceId, message)

        default:
          // Fallback to unified RAG search for unknown functions
          console.log(`[LANGCHAIN] Unknown function ${functionName}, falling back to unified RAG search`)
          return await this.getUnifiedSearchResults(workspaceId, message)
      }

    } catch (error) {
      console.error(`[LANGCHAIN] Function execution error:`, error)
      
      // Fallback to unified RAG search
      try {
        console.log(`[LANGCHAIN] Function execution failed, falling back to unified RAG search`)
        return await this.getUnifiedSearchResults(workspaceId, message)
      } catch (fallbackError) {
        console.error(`[LANGCHAIN] Fallback unified RAG error:`, fallbackError)
      }
      
      return 'I apologize, but I cannot process your request right now.'
    }
  }

  /**
   * Get services for customer
   */
  private async getServicesForCustomer(workspaceId: string, category?: string, limit: number = 10): Promise<string> {
    try {
      const services = await this.messageRepository.findServices(workspaceId, {
        category,
        limit,
        isActive: true
      })

      if (services.length === 0) {
        return 'No services available at the moment.'
      }

      const servicesList = services.map(service => 
        `• **${service.name}** - €${service.price} (${service.duration} min)\n  ${service.description}`
      ).join('\n\n')

      return `Here are our available services:\n\n${servicesList}\n\nWould you like more information about any of these services?`
    } catch (error) {
      console.error('[LANGCHAIN] Error getting services:', error)
      return 'Sorry, I cannot retrieve our services list right now.'
    }
  }

  /**
   * Get products for customer using semantic search
   */
  private async getProductsForCustomer(workspaceId: string, query?: string, limit: number = 5): Promise<string> {
    try {
      console.log(`[LANGCHAIN] Searching products with query: "${query}" in workspace: ${workspaceId}`)
      
      if (!query || query.trim() === '') {
        // If no specific query, get general products list
        const products = await this.messageRepository.findProducts(workspaceId, {
          limit: limit,
          isActive: true
        })

        if (products.length === 0) {
          return 'No products available at the moment.'
        }

        const productsList = products.map(product => 
          `• **${product.name}** - €${product.price}\n  ${product.description}\n  Category: ${product.category?.name || 'General'}\n  Stock: ${product.stock} units`
        ).join('\n\n')

        return `Here are our available products:\n\n${productsList}\n\nWould you like more information about any specific product?`
      }

      // Use semantic search for specific product queries
      const searchResults = await embeddingService.searchProducts(query, workspaceId, limit)
      
      if (searchResults.length === 0) {
        return `Sorry, I couldn't find any products matching "${query}". Would you like to see our full product catalog?`
      }

      // Get full product details for found products
      const productIds = [...new Set(searchResults.map(result => result.id))] // Remove duplicates
      const products = await this.messageRepository.findProducts(workspaceId, {
        productIds: productIds,
        limit: limit,
        isActive: true
      })

      if (products.length === 0) {
        return `Sorry, the products matching "${query}" are currently not available.`
      }

      // Filter only products with stock > 0 (availability check as requested by Andrea)
      const availableProducts = products.filter(product => product.stock > 0)
      
      if (availableProducts.length === 0) {
        return `Sorry, the products matching "${query}" are currently out of stock. Please check back later or contact us for availability updates.`
      }

      const productsList = availableProducts.map(product => 
        `• **${product.name}** - €${product.price}\n  ${product.description}\n  Category: ${product.category?.name || 'General'}\n  Stock: ${product.stock} units available`
      ).join('\n\n')

      return `Here are the products I found for "${query}":\n\n${productsList}\n\nWould you like to add any of these to your cart or need more information?`
      
    } catch (error) {
      console.error('[LANGCHAIN] Error getting products:', error)
      return 'Sorry, I cannot retrieve our products list right now. Please try again later.'
    }
  }

  /**
   * Get FAQs for customer
   */
  private async getFaqsForCustomer(workspaceId: string, topic?: string, limit: number = 5): Promise<string> {
    try {
      const faqs = await this.messageRepository.findFAQs(workspaceId, {
        topic,
        limit,
        isActive: true
      })

      if (faqs.length === 0) {
        return topic 
          ? `No FAQs found related to "${topic}". Please ask me a specific question.`
          : 'No FAQs available at the moment.'
      }

      const faqsList = faqs.map(faq => 
        `**Q: ${faq.question}**\nA: ${faq.answer}`
      ).join('\n\n')

      return `Here are some frequently asked questions:\n\n${faqsList}\n\nDo you have any other questions?`
    } catch (error) {
      console.error('[LANGCHAIN] Error getting FAQs:', error)
      return 'Sorry, I cannot retrieve FAQs right now.'
    }
  }

  /**
   * Create order for customer
   */
  private async createOrderForCustomer(customerId: string, workspaceId: string, items: any[]): Promise<string> {
    try {
      if (!items || items.length === 0) {
        return 'Please specify which items you would like to order.'
      }

      // For now, return a simple message
      return 'Thank you for your order! Our team will contact you shortly to confirm the details.'
    } catch (error) {
      console.error('[LANGCHAIN] Error creating order:', error)
      return 'Sorry, I cannot create your order right now. Please try again later.'
    }
  }

  /**
   * Check item availability
   */
  private async checkItemAvailability(workspaceId: string, itemId: string, itemType: 'product' | 'service'): Promise<string> {
    try {
      return 'Item availability check is not implemented yet.'
    } catch (error) {
      console.error('[LANGCHAIN] Error checking availability:', error)
      return 'Sorry, I cannot check availability right now.'
    }
  }

  /**
   * Get active offers
   */
  private async getActiveOffers(workspaceId: string, category?: string): Promise<string> {
    try {
      return 'No active offers at the moment. Check back soon for great deals!'
    } catch (error) {
      console.error('[LANGCHAIN] Error getting offers:', error)
      return 'Sorry, I cannot retrieve current offers right now.'
    }
  }

  /**
   * STEP 9: Formatter LLM for response formatting - FLOW.MD COMPLIANCE
   */
  private async runFormatterLLM(
    rawResponse: string,
    customer: any,
    workspace: any,
    phoneNumber: string,
    detectedLanguage: string
  ): Promise<string> {
    
    console.log(`[LANGCHAIN] STEP 9: Running Formatter LLM`)
    
    // FLOW.MD: Se la risposta contiene link di registrazione o checkout, NON formattare
    if (rawResponse.includes('🔗') || rawResponse.includes('register?') || rawResponse.includes('checkout?')) {
      console.log(`[LANGCHAIN] FLOW: Response contains link - skipping formatter`)
      return rawResponse
    }
    
    // FLOW.MD: Per chat libera RAG, usa LLM FORMATTER per risposta discorsiva
    console.log(`[LANGCHAIN] FLOW: Free chat detected - using LLM formatter for conversational response`)
    
    try {
      // Get Formatter LLM configuration from database (NO HARDCODE!)
      const agentConfig = await this.messageRepository.getAgentConfig(workspace.id)
      
      if (!agentConfig) {
        console.log(`[LANGCHAIN] No agent config found for workspace ${workspace.id}, returning raw response`)
        return rawResponse
      }

      // Create Formatter LLM dynamically with database configuration
      const formatterLLM = new ChatOpenAI({
        modelName: agentConfig.model || 'openai/gpt-4o-mini',
        temperature: agentConfig.temperature || 0.7,
        maxTokens: agentConfig.maxTokens || 1000,
        openAIApiKey: process.env.OPENROUTER_API_KEY,
        configuration: {
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
            'HTTP-Referer': process.env.OPENROUTER_REFERER || 'http://localhost:3000',
            'X-Title': process.env.OPENROUTER_TITLE || 'ShopMe WhatsApp Bot'
          }
        }
      })

      // Get conversation history
      const memoryKey = `${workspace.id}:${phoneNumber}`
      let history = this.conversationMemories.get(memoryKey) || []
      
      // Limit history to last 5 messages for better context
      if (history.length > 5) {
        history = history.slice(-5)
      }

      // Create formatter prompt using agent config prompt as base
      const historyText = history.map(h => `${h.role}: ${h.content}`).join('\n')
      
      // Language mapping for better LLM understanding
      const languageNames = {
        'it': 'Italian',
        'en': 'English', 
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'pt': 'Portuguese'
      }
      const languageName = languageNames[detectedLanguage] || 'English'
      
      const formatterPrompt = `${agentConfig.prompt}

You are formatting a response for WhatsApp customer service.
Customer: ${customer?.name || 'Customer'} 
Detected Language: ${languageName} (${detectedLanguage})
Workspace: ${workspace.name || 'ShopMe'}

Previous conversation:
${historyText}

Raw response to format: ${rawResponse}

CRITICAL: Format this response with:
- Professional and friendly tone
- MUST respond in ${languageName} language (${detectedLanguage})
- Personalized with customer name when appropriate  
- WhatsApp-friendly formatting (emojis, line breaks)
- Keep it conversational and natural
- Maintain the core information from raw response
- DO NOT translate product names or technical terms

Formatted Response in ${languageName}:`

      // Execute formatter LLM with database configuration
      const formattedResponse = await formatterLLM.invoke([{ role: 'user', content: formatterPrompt }])
      
      console.log(`[LANGCHAIN] Formatter LLM result:`, formattedResponse.content)

      // Update conversation memory
      history.push(
        { role: 'user', content: rawResponse },
        { role: 'assistant', content: formattedResponse.content as string }
      )
      this.conversationMemories.set(memoryKey, history)

      return formattedResponse.content as string || rawResponse

    } catch (error) {
      console.error(`[LANGCHAIN] Formatter LLM error:`, error)
      
      // Return raw response if formatting fails
      return rawResponse
    }
  }

  /**
   * Helper methods for spam and blacklist
   */
  private async checkSpamBehavior(phoneNumber: string, workspaceId: string): Promise<{ isSpam: boolean; messageCount: number }> {
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000)
    const messageCount = await this.messageRepository.countRecentMessages(phoneNumber, workspaceId, thirtySecondsAgo)
    
    return {
      isSpam: messageCount >= 10,
      messageCount
    }
  }

  private async addToAutoBlacklist(phoneNumber: string, workspaceId: string, reason: string): Promise<void> {
    const customer = await this.messageRepository.findCustomerByPhone(phoneNumber, workspaceId)
    if (customer) {
      await this.messageRepository.updateCustomerBlacklist(customer.id, workspaceId, true)
    }
    await this.messageRepository.addToWorkspaceBlocklist(phoneNumber, workspaceId)
  }

  /**
   * UNIFIED RAG SEARCH - Versione migliorata con riconoscimento dell'intento
   */
  private async getUnifiedSearchResults(workspaceId: string, query: string): Promise<string> {
    try {
      console.log(`🔥🔥🔥 [UNIFIED RAG] STARTING SEARCH FOR: "${query}" in workspace: ${workspaceId} 🔥🔥🔥`)
      console.log(`[UNIFIED RAG] Searching for: "${query}" in workspace: ${workspaceId}`)
      
      // Analizza l'intento della query per prioritizzare il tipo di contenuto
      const queryLower = query.toLowerCase()
      const isServiceQuery = queryLower.includes('servizi') || queryLower.includes('service') || 
                            queryLower.includes('spedizione') || queryLower.includes('shipping') ||
                            queryLower.includes('consegna') || queryLower.includes('delivery')
      const isProductQuery = queryLower.includes('prodotti') || queryLower.includes('product') ||
                            queryLower.includes('cosa avete') || queryLower.includes('what do you have') ||
                            queryLower.includes('cosa vendete') || queryLower.includes('what do you sell')
      
      let unifiedResults = ''

      // STRATEGIA BASATA SULL'INTENTO
      if (isServiceQuery) {
        // 1. PRIORITÀ AI SERVIZI per domande sui servizi
        unifiedResults += await this.searchServicesContent(workspaceId, query)
        // 2. Poi FAQ se non trova servizi specifici
        if (!unifiedResults.trim()) {
          unifiedResults += await this.searchFAQContent(workspaceId, query)
        }
      } else if (isProductQuery) {
        // 1. PRIORITÀ AI PRODOTTI per domande sui prodotti
        unifiedResults += await this.searchProductsContent(workspaceId, query)
        // 2. Poi FAQ se non trova prodotti specifici
        if (!unifiedResults.trim()) {
          unifiedResults += await this.searchFAQContent(workspaceId, query)
        }
      } else {
        // Per query specifiche (es. "mozzarella"), cerca in tutti i contenuti
        console.log(`🎯 [UNIFIED RAG] Taking ELSE path - searching ALL content types for: "${query}"`);
        unifiedResults += await this.searchProductsContent(workspaceId, query)
        unifiedResults += await this.searchFAQContent(workspaceId, query)
        unifiedResults += await this.searchServicesContent(workspaceId, query)
      }

      // GESTIONE RISULTATI VUOTI
      if (!unifiedResults.trim()) {
        console.log('[UNIFIED RAG] No specific results found for query:', query)
        return `Mi dispiace, non ho trovato informazioni specifiche per "${query}". Puoi essere più specifico o chiedere informazioni su altri argomenti?`
      }

      return unifiedResults
      
    } catch (error) {
      console.error('[UNIFIED RAG] Error:', error)
      return 'Mi dispiace, ho avuto un problema nel cercare le informazioni. Puoi ripetere la domanda?'
    }
  }

  /**
   * Cerca contenuti nei prodotti
   */
  private async searchProductsContent(workspaceId: string, query: string): Promise<string> {
    try {
      console.log(`[UNIFIED RAG] Calling embeddingService.searchProducts for query: "${query}"`);
      const productResults = await embeddingService.searchProducts(query, workspaceId, 5)
      console.log(`[UNIFIED RAG] Product search returned ${productResults.length} results`);
      if (productResults.length > 0) {
        const productIds = productResults.map(r => r.id)
        const products = await this.messageRepository.findProducts(workspaceId, {
          productIds,
          limit: 5,
          isActive: true
        })
        
        if (products.length > 0) {
          let result = '🛍️ PRODOTTI DISPONIBILI:\n\n'
          products.forEach(product => {
            result += `• ${product.name} - €${product.price}\n`
            if (product.description) result += `${product.description}\n`
            result += `📦 Stock: ${product.stock} unità\n`
            if (product.category) result += `🧀 Categoria: ${product.category.name}\n`
            result += '\n'
          })
          return result
        }
      }
      return ''
    } catch (error) {
      console.log('[UNIFIED RAG] Product search error:', error)
      return ''
    }
  }

  /**
   * Cerca contenuti nelle FAQ
   */
  private async searchFAQContent(workspaceId: string, query: string): Promise<string> {
    try {
      const faqResults = await embeddingService.searchFAQs(query, workspaceId, 3)
      if (faqResults.length > 0) {
        let result = '❓ INFORMAZIONI UTILI:\n\n'
        faqResults.forEach(faq => {
          result += `• ${faq.content}\n\n`
        })
        return result
      }
      return ''
    } catch (error) {
      console.log('[UNIFIED RAG] FAQ search error:', error)
      return ''
    }
  }

  /**
   * Cerca contenuti nei servizi
   */
  private async searchServicesContent(workspaceId: string, query: string): Promise<string> {
    try {
      // Prima prova la ricerca semantica
      const serviceResults = await embeddingService.searchServices(query, workspaceId, 3)
      if (serviceResults.length > 0) {
        const services = await this.messageRepository.getServices(workspaceId)
        const relevantServices = services.filter(s => 
          serviceResults.some(sr => sr.sourceName.includes(s.name.toLowerCase()))
        )
        
        if (relevantServices.length > 0) {
          let result = '🚚 SERVIZI DISPONIBILI:\n\n'
          relevantServices.forEach(service => {
            result += `• ${service.name}\n`
            if (service.description) result += `${service.description}\n`
            if (service.price) result += `💰 Costo: €${service.price}\n`
            if (service.duration) result += `⏱️ Durata: ${service.duration} minuti\n`
            result += '\n'
          })
          return result
        }
      }
      
      // Se la ricerca semantica non trova nulla, per domande generiche sui servizi
      // restituisci tutti i servizi attivi
      const queryLower = query.toLowerCase()
      if (queryLower.includes('servizi') || queryLower.includes('service')) {
        const allServices = await this.messageRepository.getServices(workspaceId)
        if (allServices.length > 0) {
          let result = '🚚 I NOSTRI SERVIZI:\n\n'
          allServices.forEach(service => {
            result += `• ${service.name}\n`
            if (service.description) result += `${service.description}\n`
            if (service.price) result += `💰 Costo: €${service.price}\n`
            if (service.duration) result += `⏱️ Durata: ${service.duration} minuti\n`
            result += '\n'
          })
          return result
        }
      }
      
      return ''
    } catch (error) {
      console.log('[UNIFIED RAG] Service search error:', error)
      return ''
    }
  }
}