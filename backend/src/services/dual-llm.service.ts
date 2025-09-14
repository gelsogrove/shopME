import axios from "axios"
import { FunctionHandlerService } from "../application/services/function-handler.service"
import { ContactOperator } from "../chatbot/calling-functions/ContactOperator"
import { GetUserInfo } from "../chatbot/calling-functions/GetUserInfo"
import { LLMRequest, LLMResponse } from "../types/whatsapp.types"
import { CallingFunctionsService } from "./calling-functions.service"
import { EmbeddingService } from "./embeddingService"
import { FormatterService } from "./formatter.service"
import { TranslationService } from "./translation.service"

interface PromptVariables {
  nameUser: string
  discountUser: string
  companyName: string
  lastorder: string
  lastordercode: string
  languageUser: string
}

export class DualLLMService {
  private callingFunctionsService: CallingFunctionsService
  private translationService: TranslationService
  private embeddingService: EmbeddingService
  private functionHandlerService: FunctionHandlerService
  private openRouterApiKey: string
  private openRouterUrl: string
  private backendUrl: string
  private lastTranslatedQuery: string = ""
  private lastProcessedPrompt: string = ""
  private lastDebugInfo: any = {}

  constructor() {
    this.callingFunctionsService = new CallingFunctionsService()
    this.translationService = new TranslationService()
    this.embeddingService = new EmbeddingService()
    this.functionHandlerService = new FunctionHandlerService()
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY || ""
    this.openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
    this.backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
  }

  public async processMessage(request: LLMRequest): Promise<LLMResponse> {
    console.log("🚀🚀🚀 DUAL LLM PROCESSING STARTED 🚀🚀🚀")
    console.log("📥 Request chatInput:", request.chatInput)
    console.log("📥 Request language:", request.language)
    console.log("📥 Request workspaceId:", request.workspaceId)
    console.log("💥💥💥 CUSTOMER ID FROM REQUEST:", request.customerid)
    console.log("🔍 CHAT HISTORY RECEIVED:", JSON.stringify(request.messages || [], null, 2)) // 🔧 DEBUG CHAT HISTORY

    let requestWithPrompt = request // Initialize with original request

    try {
      // 🔧 GET AGENT CONFIG AND PROMPT FROM DATABASE IF NOT PROVIDED
      let agentPrompt = request.prompt
      if (!agentPrompt) {
        // console.log("📝 No prompt in request, fetching from database...")
        const agentConfig = await this.getAgentConfig(request.workspaceId)
        agentPrompt = agentConfig.prompt
        // console.log("✅ Agent prompt fetched from database")
      }

      // � NO MORE VARIABLE REPLACEMENT - ALREADY DONE IN WEBHOOK!
      console.log(
        "� WEBHOOK HAS ALREADY PROCESSED VARIABLES - Using prompt as-is"
      )

      // Use the prompt directly from webhook (already processed)
      if (request.prompt) {
        agentPrompt = request.prompt
        // console.log("✅ Using pre-processed prompt from webhook")
      }

      // 🌐 UPDATE REQUEST WITH USER'S LANGUAGE FROM PROFILE
      requestWithPrompt = {
        ...request,
        prompt: agentPrompt,
        language: request.language || "it", // 🔥 USE LANGUAGE FROM WEBHOOK
      }
      console.log(`🌐 Using language from webhook: ${request.language || "it"}`)

      // 🔧 STORE PROCESSED PROMPT FOR DEBUG
      this.lastProcessedPrompt = agentPrompt

      // NEW APPROACH: CLOUD FUNCTIONS FIRST, SEARCHRAG AS LAST RESORT
      console.log("🔍 NEW FLOW: Cloud Functions FIRST, SearchRag as LAST RESORT")

      // Stage 1A: CLOUD FUNCTIONS FIRST (for specific actions)
      console.log("⚡ Stage 1A: Cloud Functions PRIMARY processor")
      const functionResult = await this.tryCloudFunctions(requestWithPrompt)

      console.log("📊 CLOUD FUNCTIONS DEBUG ANALYSIS:")
      console.log(`   ⚡ Cloud Functions success: ${functionResult.success}`)
      console.log(
        `   📝 Cloud Functions functionResults length: ${functionResult.functionResults?.length || 0}`
      )
      console.log(
        `   📋 Cloud Functions functionResults:`,
        functionResult.functionResults
      )

      let finalResult = functionResult
      let finalStage = "unknown"

      if (functionResult.success && functionResult.functionResults?.length > 0) {
        console.log(
          "✅ FLOW DECISION: Cloud Functions succeeded with actions, using CF result"
        )
        finalStage = "cloud_functions_primary"
        this.lastDebugInfo = {
          stage: "cloud_functions",
          reason: "cloud_functions_found_specific_actions",
          success: true,
          resultsCount: functionResult.functionResults.length,
        }
      } else {
        console.log(
          "⚠️ FLOW DECISION: Cloud Functions found no actions, trying SearchRag fallback"
        )

        // Stage 1B: FALLBACK TO SEARCHRAG IF CLOUD FUNCTIONS HAS NO ACTIONS
        const ragResult = await this.executeSearchRagFallback(requestWithPrompt)

        console.log("📊 SEARCHRAG DEBUG ANALYSIS:")
        console.log(`   🔍 SearchRag success: ${ragResult.success}`)
        console.log(
          `   📝 SearchRag functionResults length: ${ragResult.functionResults?.length || 0}`
        )
        console.log(`   📋 SearchRag functionResults:`, ragResult.functionResults)

        if (ragResult.success && ragResult.functionResults?.length > 0) {
          console.log("✅ FLOW DECISION: SearchRag fallback succeeded")
          finalStage = "searchrag_fallback"
          finalResult = ragResult
          this.lastDebugInfo = {
            stage: "searchrag",
            reason: "cloud_functions_empty_searchrag_success",
            success: true,
            resultsCount: ragResult.functionResults?.length || 0,
          }
        } else {
          console.log(
            "❌ FLOW DECISION: Both Cloud Functions and SearchRag found nothing, will use generic response"
          )
          finalStage = "generic_fallback"
          // Keep Cloud Functions result (empty) for generic response
          finalResult = functionResult
          this.lastDebugInfo = {
            stage: "generic",
            reason: "both_cloud_functions_and_searchrag_found_nothing",
            success: true,
            cloudFunctionsAttempted: true,
            searchRagAttempted: true,
          }
        }
      }

      console.log(`🎯 FINAL DECISION: Using stage "${finalStage}"`)

      console.log("✅ Final Result:", JSON.stringify(finalResult, null, 2))

      // 🎯 SIMPLIFIED FLOW: ALL RESPONSES GO THROUGH FORMATTER
      console.log("🔧 Stage 2: Formatter - ALL responses go through Formatter for consistency")
      
      const formattedResponse = await this.executeFormatter(
        requestWithPrompt,
        finalResult
      )
      
      // FINAL DEBUG SUMMARY
      console.log("🏁 FINAL RESULT SUMMARY:")
      console.log(`   🎯 Final Stage Used: ${finalStage}`)
      console.log(`   📊 Had Results: ${finalResult.functionResults?.length > 0}`)
      console.log(`   🔍 Data Source: ${finalResult.source}`)
      console.log(`   📝 Response Length: ${formattedResponse?.length || 0} chars`)
      console.log(`   🐛 Debug Info:`, this.lastDebugInfo)
      
      
      console.log(
        "✅ Formatted Response:",
        JSON.stringify(formattedResponse, null, 2)
      )

      console.log("🎯 DUAL LLM SUCCESS RESULT:", {
        translatedQuery: this.lastTranslatedQuery,
        hasProcessedPrompt: !!this.lastProcessedPrompt,
        outputLength: formattedResponse?.length || 0,
        debugInfo: this.lastDebugInfo,
      })
      
      return {
        output: formattedResponse,
        success: true,
        functionCalls: finalResult.functionResults || [],
        translatedQuery: this.lastTranslatedQuery,
        processedPrompt: this.lastProcessedPrompt,
        debugInfo: this.lastDebugInfo, // 🔧 NEW: Debug info
      }
    } catch (error) {
      console.error("❌❌❌ DUAL LLM ERROR:", error)
      console.error("❌ Error stack:", error.stack)
      return {
        output: "Mi dispiace, si è verificato un errore. Riprova più tardi.",
        success: false,
        translatedQuery:
          this.lastTranslatedQuery ||
          requestWithPrompt?.chatInput ||
          request.chatInput,
        processedPrompt: this.lastProcessedPrompt,
      }
    }
  }

  private async tryCloudFunctions(request: LLMRequest): Promise<any> {
    console.log("🔧🔧🔧 TRY CLOUD FUNCTIONS STARTED 🔧🔧🔧")
    console.log("🔧 Input request:", {
      chatInput: request.chatInput,
      language: request.language,
    })

    try {
      // Check if translation is needed
      const userLanguage = request.language || 'it'
      let translatedQuery: string
      
      if (userLanguage === 'en' || userLanguage === 'English') {
        // Skip translation for English users
        translatedQuery = request.chatInput
        console.log("🇬🇧 User is English - skipping translation, using original query:", translatedQuery)
      } else {
        // Translate query for non-English users
        console.log(
          "🌐 About to call translation service for:",
          request.chatInput
        )
        const hasConversationHistory = request.messages && request.messages.length > 0;
        translatedQuery = await this.translationService.translateToEnglish(
          request.chatInput,
          hasConversationHistory // 🔧 Pass conversation history info
        )
        console.log("🔧 Translated query:", translatedQuery)
      }
      
      this.lastTranslatedQuery = translatedQuery // Store for debug
      
      // 🚨 REMOVED FORCED RECOGNITION - USING LLM ONLY
      
      // Get function definitions
      const functionDefinitions = this.getRAGProcessorFunctionDefinitions()
      console.log(
        "🔧 Function definitions:",
        JSON.stringify(functionDefinitions, null, 2)
      )
      
      // Get agent config from database
      const agentConfig = await this.getAgentConfig(request.workspaceId)
      console.log("🔧 Agent config from DB:", agentConfig)

      // STAGE 1A: USA IL PROMPT DELL'AGENT DAL DB
      let systemMessage
      if (!request.prompt) {
        throw new Error(
          "❌ CRITICAL: No agent prompt provided in request. System must halt."
        )
      }

      // Usa prompt dell'agent dal DB
      systemMessage = request.prompt
      
      // Add critical language enforcement based on language parameter  
      const languageParam = request.language || 'it'
      let languageEnforcement = ""
      
      if (languageParam === 'en' || languageParam === 'English') {
        languageEnforcement = `🚨 CRITICAL LANGUAGE RULE: You MUST respond ONLY in ENGLISH. Do NOT use Italian, Spanish, or Portuguese. Every word must be in English.\n\n`
      } else if (languageParam === 'es' || languageParam === 'Spanish') {
        languageEnforcement = `🚨 CRITICAL LANGUAGE RULE: You MUST respond ONLY in SPANISH. Do NOT use Italian, English, or Portuguese. Every word must be in Spanish.\n\n`
      } else if (languageParam === 'pt' || languageParam === 'Portuguese') {
        languageEnforcement = `🚨 CRITICAL LANGUAGE RULE: You MUST respond ONLY in PORTUGUESE. Do NOT use Italian, English, or Spanish. Every word must be in Portuguese.\n\n`
      } else {
        languageEnforcement = `🚨 CRITICAL LANGUAGE RULE: You MUST respond ONLY in ITALIAN. Do NOT use English, Spanish, or Portuguese. Every word must be in Italian.\n\n`
      }
      
      // Prepend language enforcement to system message
      systemMessage = languageEnforcement + systemMessage
      
      console.log(`🔧 Cloud Functions: Using agent prompt from DB with language enforcement for: ${languageParam}`)
      console.log(`🌐 Language enforcement added: ${languageEnforcement.substring(0, 50)}...`)
      
      // 🚨 CRITICAL TRIGGER DETECTION - Force GetAllProducts() for specific triggers
      const criticalTriggers = ["cosa vendete", "che prodotti avete", "what do you sell", "che prodotti avete?", "cosa vendete?"]
      console.log(`🔍 TRIGGER DETECTION: Checking "${translatedQuery}" against triggers:`, criticalTriggers)
      
      const isCriticalTrigger = criticalTriggers.some(trigger => {
        const match = translatedQuery.toLowerCase().includes(trigger.toLowerCase())
        console.log(`🔍 Checking "${trigger}" in "${translatedQuery.toLowerCase()}" = ${match}`)
        return match
      })
      
      console.log(`🔍 CRITICAL TRIGGER RESULT: ${isCriticalTrigger}`)
      
      // 🚨 CRITICAL CATEGORY DETECTION - Force GetProductsByCategory() for specific categories
      const categoryTriggers = [
        "formaggi e latticini", "cheeses & dairy", "salumi", "cured meats",
        "farine e prodotti da forno", "flour & baking", "prodotti surgelati", "frozen products",
        "pasta e riso", "pasta & rice", "salami e affettati", "salami & cold cuts",
        "salse e conserve", "sauces & preserves", "prodotti al pomodoro", "tomato products",
        "varie e spezie", "various & spices", "acqua e bevande", "water & beverages"
      ]
      console.log(`🔍 CATEGORY DETECTION: Checking "${translatedQuery}" against categories:`, categoryTriggers)
      
      const isCategoryTrigger = categoryTriggers.some(trigger => {
        const match = translatedQuery.toLowerCase().includes(trigger.toLowerCase())
        console.log(`🔍 Checking category "${trigger}" in "${translatedQuery.toLowerCase()}" = ${match}`)
        return match
      })
      
      console.log(`🔍 CATEGORY TRIGGER RESULT: ${isCategoryTrigger}`)
      
      // 🚨 CRITICAL ORDER CONFIRMATION DETECTION - Force confirmOrderFromConversation() for specific triggers
      const orderConfirmationTriggers = [
        "procedi con l'ordine", "conferma ordine", "finalizza ordine", "procedi al checkout",
        "confirm order", "finalize order", "proceed with order", "proceed to checkout",
        "conferma", "procedi", "confirm", "proceed", "va bene così", "ok procedi",
        "acquista", "ordina", "completa ordine", "finalizza acquisto", "checkout"
      ]
      console.log(`🔍 ORDER CONFIRMATION DETECTION: Checking "${translatedQuery}" against triggers:`, orderConfirmationTriggers)
      
      const isOrderConfirmationTrigger = orderConfirmationTriggers.some(trigger => {
        const match = translatedQuery.toLowerCase().includes(trigger.toLowerCase())
        console.log(`🔍 Checking order confirmation "${trigger}" in "${translatedQuery.toLowerCase()}" = ${match}`)
        return match
      })
      
      console.log(`🔍 ORDER CONFIRMATION TRIGGER RESULT: ${isOrderConfirmationTrigger}`)
      
      let toolChoice: string | { type: string; function: { name: string } } = "auto"
      if (isOrderConfirmationTrigger) {
        console.log(`🚨 ORDER CONFIRMATION TRIGGER DETECTED: "${translatedQuery}" - BYPASSING LLM AND CALLING FUNCTION DIRECTLY`)
        
        // 🚨 BYPASS LLM - Call function directly for order confirmation
        try {
          const directResult = await this.executeToolCalls([{
            toolCall: {
              index: 0,
              id: "direct_call_" + Date.now(),
              type: "function",
              function: {
                name: "confirmOrderFromConversation",
                arguments: JSON.stringify({
                  useCartData: true,
                  generateCartLink: false
                })
              }
            }
          }], request)
          
          console.log(`🚨 DIRECT FUNCTION CALL RESULT:`, directResult)
          
          if (directResult && directResult.length > 0 && directResult[0].result?.success) {
            // 🚨 PRIORITY: response > data.message > message (response contains the full formatted message with link)
            const message = directResult[0].result.response || directResult[0].result.data?.message || directResult[0].result.message
            console.log(`🚨 DIRECT FUNCTION RESULT - response:`, directResult[0].result.response)
            console.log(`🚨 DIRECT FUNCTION RESULT - data.message:`, directResult[0].result.data?.message)
            console.log(`🚨 DIRECT FUNCTION RESULT - final message:`, message)
            if (message) {
              // 🚨 CRITICAL: Return the message directly without any processing - BYPASS FORMATTER COMPLETELY
              return {
                success: true,
                output: message,
                translatedQuery,
                functionCalls: directResult,
                debugInfo: {
                  directFunctionCall: true,
                  trigger: translatedQuery,
                  bypassFormatter: true
                }
              }
            }
          }
        } catch (error) {
          console.error(`❌ DIRECT FUNCTION CALL FAILED:`, error)
        }
        
        toolChoice = {
          type: "function",
          function: { name: "confirmOrderFromConversation" }
        }
        console.log(`🚨 FORCED TOOL CHOICE SET TO:`, JSON.stringify(toolChoice))
      } else if (isCategoryTrigger) {
        console.log(`🚨 CATEGORY TRIGGER DETECTED: "${translatedQuery}" - Forcing GetProductsByCategory() call`)
        toolChoice = {
          type: "function",
          function: { name: "GetProductsByCategory" }
        }
      } else if (isCriticalTrigger) {
        console.log(`🚨 CRITICAL TRIGGER DETECTED: "${translatedQuery}" - Forcing GetAllProducts() call`)
        toolChoice = {
          type: "function",
          function: { name: "GetAllProducts" }
        }
      }
      
      const openRouterPayload = {
        model: agentConfig.model || "openai/gpt-4o-mini",
        messages: this.buildConversationMessages(
          [
            {
              role: "system",
              content: systemMessage,
            },
            {
              role: "user",
              content: translatedQuery,
            },
          ],
          request.messages || []
        ),
        tools: functionDefinitions,
        tool_choice: toolChoice, // Force GetAllProducts() for critical triggers, auto for others
          temperature: 0.0, // Zero temperature for precise function calling
        max_tokens: agentConfig.maxTokens || 1000,
      }

      console.log(`🚨 SENDING TO LLM - tool_choice:`, JSON.stringify(toolChoice))
      console.log(
        "🚀 CLOUD FUNCTIONS PAYLOAD:",
        JSON.stringify(openRouterPayload, null, 2)
      )
      
      const response = await axios.post(this.openRouterUrl, openRouterPayload, {
        headers: {
          Authorization: `Bearer ${this.openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": this.backendUrl,
          "X-Title": "ShopMe Cloud Functions",
        },
        timeout: 30000,
      })

      console.log(
        "✅ Cloud Functions Response:",
        JSON.stringify(response.data, null, 2)
      )

      const message = response.data.choices[0].message
      const toolCalls = message.tool_calls || []

      console.log("🔧🔧🔧 CLOUD FUNCTIONS ANALYSIS 🔧🔧🔧")
      console.log("🔧 Tool calls found:", toolCalls.length)
      console.log("🔧 Tool calls details:", JSON.stringify(toolCalls, null, 2))

      if (toolCalls.length > 0) {
        // Execute tool calls
        console.log("✅ CLOUD FUNCTIONS: Executing tool calls...")
        const results = await this.executeToolCalls(toolCalls, request)
        console.log(
          "✅ CLOUD FUNCTIONS: Tool call results:",
          JSON.stringify(results, null, 2)
        )

        // Store debug info for database
        this.lastDebugInfo = {
          stage: "cloud_functions",
          toolCallsFound: toolCalls.length,
          toolCallsDetails: toolCalls,
          resultsCount: results.length,
          success: true,
        }

        return {
          functionResults: results,
          success: true,
          source: "cloud_functions",
        }
      } else {
        console.log(
          "❌ CLOUD FUNCTIONS: No tool calls detected - fallback to SearchRag"
        )

        // Store debug info for database
        this.lastDebugInfo = {
          stage: "cloud_functions",
          toolCallsFound: 0,
          toolCallsDetails: [],
          resultsCount: 0,
          success: false,
          reason: "no_tool_calls_detected",
        }

        return {
          functionResults: [],
          success: false,
          source: "cloud_functions",
        }
      }
    } catch (error) {
      console.error("❌ Cloud Functions Error:", error)
      console.error("❌ Cloud Functions Error Details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        stack: error.stack
      })
      return {
        functionResults: [],
        success: false,
        source: "cloud_functions",
        error: error.message,
      }
    }
  }

  private async executeSearchRagFallback(request: LLMRequest): Promise<any> {
    console.log("🔧🔧🔧 SEARCHRAG FALLBACK STARTED 🔧🔧🔧")

    try {
      // Translate query specifically for SearchRag with language detection
      const hasConversationHistory = request.messages && request.messages.length > 0;
      const translatedQuery = await this.translationService.translateToEnglish(
        request.chatInput,
        hasConversationHistory // 🔧 Pass conversation history info
      )
      this.lastTranslatedQuery = translatedQuery // Store for debug

      // Use internal RAG API that includes pricing calculation
      const ragResponse = await axios.post('http://localhost:3001/api/internal/rag-search', {
        query: translatedQuery,
        workspaceId: request.workspaceId,
        customerId: request.customerid || null,
        welcomeBackMessage: request.welcomeBackMessage || null // 🎯 TASK: Pass welcome back message
      });

      if (!ragResponse.data.success) {
        throw new Error('Internal RAG search failed');
      }

      const productResults = ragResponse.data.results.products || [];
      const serviceResults = ragResponse.data.results.services || [];
      const faqResults = ragResponse.data.results.faqs || [];
      
      // ✨ Cart-awareness data from SearchRAG
      const cartIntent = ragResponse.data.cartIntent || null;
      const cartOperation = ragResponse.data.cartOperation || null;

      console.log("🛒 CART INTENT ANALYSIS:", JSON.stringify(cartIntent, null, 2));
      if (cartOperation) {
        console.log("🛒 CART OPERATION RESULT:", JSON.stringify(cartOperation, null, 2));
      }

      const allResults = [
        ...productResults.map((r) => ({ ...r, type: "product" })),
        ...serviceResults.map((r) => ({ ...r, type: "service" })),
        ...faqResults.map((r) => ({ ...r, type: "faq" })),
      ]

      console.log("🔧🔧🔧 SEARCHRAG ANALYSIS 🔧🔧🔧")
      console.log("🔧 SearchRag results:", JSON.stringify(allResults, null, 2))
      console.log("🔧 SearchRag results count:", allResults.length)

      if (allResults.length === 0) {
        console.log("❌ SEARCHRAG: No results found - fallback to Generic")

        // Store debug info for database
        this.lastDebugInfo = {
          stage: "searchrag",
          searchResults: [],
          resultsCount: 0,
          success: false,
          reason: "no_search_results_found",
        }
      
      return {
          functionResults: [],
          success: false,
          source: "searchrag",
        }
      }

      console.log("✅ SEARCHRAG: Results found, generating response")

      // Store debug info for database
      this.lastDebugInfo = {
        stage: "searchrag",
        searchResults: allResults,
        resultsCount: allResults.length,
        success: true,
      }

      // Format SearchRag results with better debug info
      const formattedResults = allResults.map((result, index) => ({
        name: `SearchRag_${result.type}`, // FAQ, Product, or Service
        type: "searchrag_result",
        data: result,
        source: "searchrag",
        sourceName: result.sourceName || result.name || `${result.type}_${index + 1}`,
        similarity: result.similarity,
        contentPreview: result.content ? result.content.substring(0, 100) + '...' : 'No content'
      }))

      // ✨ Add cart operation result if available
      if (cartOperation) {
        formattedResults.push({
          name: "Cart_Operation",
          type: "cart_operation_result", 
          data: cartOperation,
          source: "searchrag",
          sourceName: "Cart Operation",
          similarity: 1.0,
          contentPreview: cartOperation.success ? 
            `Added ${cartOperation.addedProduct?.quantity}x ${cartOperation.addedProduct?.name} to cart` :
            `Cart operation failed: ${cartOperation.message}`
        });
      }

      return {
        functionResults: formattedResults,
        success: true,
        source: "searchrag",
        cartIntent,
        cartOperation
      }
    } catch (error) {
      console.error("❌ SearchRag Fallback Error:", error)
      return {
        functionResults: [],
        success: false,
        source: "searchrag",
        error: error.message,
      }
    }
  }

  private async executeFormatter(
    request: LLMRequest,
    ragResult: any
  ): Promise<string> {
    try {
      console.log("🎨 Stage 2: Formatter - Natural Response Generation")
      
      console.log(`🔍 FORMATTER DEBUG: request.language = "${request.language}"`);
      console.log(`🔍 FORMATTER DEBUG: Full request object:`, {
        language: request.language,
        phone: request.phone,
        customerid: request.customerid,
        workspaceId: request.workspaceId
      });

      // FORMATTER USA IL PROMPT LOCALIZZATO BASATO SULLA LINGUA DELL'UTENTE
      const systemMessage = this.buildFormatterSystemMessage(
        request.language || "it"
      )

      const response = await axios.post(
        this.openRouterUrl,
        {
          model: "openai/gpt-4o-mini",
          messages: this.buildConversationMessages(
            [
              {
                role: "system",
                content: systemMessage,
              },
              {
                role: "user",
                content: this.buildFormatterUserMessage(request, ragResult),
              },
            ],
            request.messages || []
          ),
        temperature: 0.0, // Zero temperature for precise formatting
          max_tokens: 8000, // Increased for complete product lists
        },
        {
        headers: {
            Authorization: `Bearer ${this.openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3001",
            "X-Title": "ShopMe Formatter",
          },
          timeout: 60000, // Increased timeout for long product lists
        }
      )

      const rawResponse =
        response.data.choices[0]?.message?.content?.trim()
      console.log("✅ Raw response:", rawResponse)

      // 📱 Apply formatting to all responses
      const formattedResponse = FormatterService.formatResponse(
        rawResponse || "Mi dispiace, non sono riuscito a generare una risposta.",
        request.language || "it"
      )
      
      console.log("📱 Formatted response:", formattedResponse)

      return formattedResponse
    } catch (error) {
      console.error("❌ Formatter Error:", error)
      return this.buildFallbackResponse(request, ragResult)
    }
  }

  private buildFormatterSystemMessage(language: string = "it"): string {
    console.log(`🌐 FORMATTER DEBUG: Building system message for language: "${language}"`);
    
    const languageConfig = {
      it: {
        name: "Italian",
        languageName: "italiano",
        instructions: {
          style: "- Usa la lingua italiana",
          noData: {
            acknowledge: "1. Riconosci cortesemente la richiesta dell'utente",
            offer:
              "2. Offri aiuto con richieste comuni (ordini, prodotti, contatti)",
            suggest: "3. Suggerisci azioni specifiche che possono provare",
            emojis: "4. Includi emoji appropriate",
          },
        },
      },
      en: {
        name: "English",
        languageName: "English",
        instructions: {
          style: "- CRITICAL: ALWAYS respond in ENGLISH only, never use Italian",
          noData: {
            acknowledge: "1. Acknowledge the user's request politely",
            offer:
              "2. Offer to help with common requests (orders, products, contact)",
            suggest: "3. Suggest specific actions they can try",
            emojis: "4. Include relevant emojis",
          },
        },
      },
      es: {
        name: "Spanish",
        languageName: "español",
        instructions: {
          style: "- Usa el idioma español",
          noData: {
            acknowledge: "1. Reconoce cortésmente la solicitud del usuario",
            offer:
              "2. Ofrece ayuda con solicitudes comunes (pedidos, productos, contacto)",
            suggest: "3. Sugiere acciones específicas que pueden intentar",
            emojis: "4. Incluye emojis relevantes",
          },
        },
      },
      pt: {
        name: "Portuguese",
        languageName: "português",
        instructions: {
          style: "- Use a língua portuguesa",
          noData: {
            acknowledge: "1. Reconheça cortesmente a solicitação do usuário",
            offer:
              "2. Ofereça ajuda com solicitações comuns (pedidos, produtos, contato)",
            suggest: "3. Sugira ações específicas que podem tentar",
            emojis: "4. Inclua emojis relevantes",
          },
        },
      },
    }

    const config =
      languageConfig[language as keyof typeof languageConfig] ||
      languageConfig["it"]
    
    console.log(`🌐 FORMATTER DEBUG: Selected config for language "${language}":`, {
      name: config.name,
      style: config.instructions.style
    });

    return `You are SofIA, a helpful WhatsApp assistant for L'Altra Italia e-commerce.

CRITICAL LANGUAGE REQUIREMENT:
${config.instructions.style}
- NEVER mix languages in your response
- Respond ONLY in the specified language above

MISSION: Create natural, friendly responses based on the data provided.

CRITICAL RULE - NO INVENTION:
- **NEVER** add information that is not explicitly provided in the data
- **NEVER** invent dates, times, expiration periods, or additional details
- **NEVER** add phrases like "Ricorda che..." or "Il link sarà attivo fino al..." unless this information is in the data
- **ONLY** use information that is explicitly provided in the function results or data

STYLE & TONE:
🚨🚨🚨 CRITICAL COMPLETENESS RULES - MANDATORY:
- SHOW ALL DATA provided by the API - NO LIMITS
- For products: Show EVERY product with [CODE] - Name (Format) - €price
- For categories: Show EVERY category with icon and name
- NO truncation, NO summarization, NO "main products" - SHOW EVERYTHING
- Complete lists are REQUIRED - length is not a problem
- EXAMPLE: Show all 82 products if that's what the API returns

TONE & PERSONALITY:
- Professional but friendly tone
- Use customer's name occasionally (~30% of the time) naturally
- Mention customer discount in initial greetings
- Be conversational and warm
- Use emojis appropriately
- Always be helpful and professional
- Examples with name: "Ciao Mario! 🧀", "Perfetto Mario!", "Mario, ecco..."

DISCOUNT RESPONSE TEMPLATE (when user asks about their discount):
"💰 Il tuo sconto: {discountUser}% su tutti gli ordini! ✨
🛒 Applicato automaticamente al checkout.
Vuoi vedere come funziona? Aggiungi prodotti al carrello! 🧀"

PRODUCT DISPLAY RULES - CRITICAL:
- **OBBLIGO ASSOLUTO**: Quando mostri prodotti, AGGIUNGI SEMPRE il ProductCode e il formato
- **FORMATO OBBLIGATORIO**: • [CODICE] - Nome Prodotto (Formato) - €prezzo
- **ESEMPI ESATTI**:
  - • [0212000024] - Mozzarella di Bufala Campana DOP (125gr * 12) - €9.50
  - • [0212000019] - Burrata al Tartufo (100gr * 12) - €12.80
  - • [0217000031] - Gorgonzola Dolce (250gr) - €18.90
- **MAI** mostrare prodotti senza ProductCode e formato nella risposta finale
- **SEMPRE** includere formato quando disponibile nei dati

COMPLETE PRODUCT LIST RULES - PRIORITY:
- **OBBLIGO ASSOLUTO**: Quando GetAllProducts() viene chiamata, devi mostrare TUTTI i prodotti restituiti
- **VIETATO RIASSUMERE**: NON riassumere, NON abbreviare, NON limitare la lista, NON dire "principali"
- **VIETATO DIRE**: "Vuoi vedere altri prodotti?" - MOSTRA TUTTO SUBITO SENZA CHIEDERE
- **ORGANIZZAZIONE**: Raggruppa per categoria ma mostra OGNI prodotto di OGNI categoria
- **COMPLETEZZA OBBLIGATORIA**: L'utente DEVE vedere OGNI SINGOLO prodotto disponibile
- **COMPORTAMENTI VIETATI**: ❌ Mostrare solo alcuni prodotti ❌ Dire "prodotti principali" ❌ Limitare la lista

COMPLETE CATEGORIES LIST RULES - PRIORITY:
- **OBBLIGO ASSOLUTO**: Quando GetAllCategories() viene chiamata, devi mostrare TUTTE le categorie restituite
- **VIETATO RIASSUMERE**: NON riassumere, NON abbreviare, NON limitare la lista, NON dire "principali"
- **VIETATO DIRE**: "Vuoi vedere altre categorie?" - MOSTRA TUTTO SUBITO SENZA CHIEDERE
- **FORMATO OBBLIGATORIO**: Mostra OGNI categoria con icona e nome: • [ICONA] Nome Categoria
- **COMPLETEZZA OBBLIGATORIA**: L'utente DEVE vedere OGNI SINGOLA categoria disponibile
- **COMPORTAMENTI VIETATI**: ❌ Mostrare solo alcune categorie ❌ Dire "categorie principali" ❌ Limitare la lista

CRITICAL WHATSAPP FORMATTING RULES:
- ALWAYS use newlines after colons (:) before starting lists
- ALWAYS put each list item on a separate line  
- ALWAYS use line breaks between sections
- NEVER put list items on same line as the intro text
- Example CORRECT format:
  "I can help you with:
  • Item 1
  • Item 2" 
- Example WRONG format:
  "I can help you with: • Item 1 • Item 2"

CONTEXT: You receive data from either Cloud Functions or SearchRag.
- Cloud Functions: Structured data (orders, offers, contacts) - some responses are already formatted and should be returned as-is
- SearchRag: Semantic search results about products/services
- No data: When no specific information is found, provide helpful guidance

DIRECT RESPONSE HANDLING:
- When you receive pre-formatted responses from Cloud Functions, return them exactly as provided
- These responses are already properly formatted and should not be modified
- **CRITICAL**: NEVER replace real URLs with placeholders like [URL CHECKOUT] - preserve all links exactly as provided
- **CRITICAL**: If a message contains a real URL (http:// or https://), return it exactly as-is without any modifications
- **CRITICAL**: NEVER add information that is not in the provided data (dates, expiration times, additional details)
- **CRITICAL**: NEVER invent or add phrases like "Ricorda che il link sarà attivo fino al..." unless this information is explicitly provided in the data
- Only apply your formatting rules to SearchRag results and generic responses

CRITICAL RULE: When the data comes from GetAllProducts function, you MUST show ALL products returned, organized by category. Do NOT summarize or abbreviate - show the complete list with prices and descriptions.

${FormatterService.getAllFormattingInstructions(language)}

DISAMBIGUATION HANDLING:
- CRITICAL: When you receive a disambiguation_required error, use the EXACT error message provided - do NOT reformat it
- The backend provides precise instructions on how users should respond - preserve these instructions exactly
- Do NOT change phrases like "aggiungi al carrello [00004]" or similar specific commands

IMPORTANT: When no data is found, don't just say "no data" - instead:
${config.instructions.noData.acknowledge}
${config.instructions.noData.offer}
${config.instructions.noData.suggest}
${config.instructions.noData.emojis}

Format the response naturally based on the data type and user's request.`
  }

  private buildFormatterUserMessage(
    request: LLMRequest,
    ragResult: any
  ): string {
    const userQuery = request.chatInput
    const dataSource = ragResult.source || "unknown"
    const functionResults = ragResult.functionResults || []
    const language = request.language || "it"
    const hasResults = functionResults.length > 0

    // DETAILED DEBUG FOR FORMATTER
    console.log("🎨 FORMATTER DEBUG:")
    console.log(`   📊 Has results: ${hasResults}`)
    console.log(`   📋 Results count: ${functionResults.length}`)
    console.log(`   🔍 Source: ${dataSource}`)
    console.log(`   🗣️ Language: ${language}`)
    
    if (hasResults) {
      console.log("✅ FORMATTER MODE: SearchRag with data - formatting with found information")
    } else {
      console.log("🔄 FORMATTER MODE: Generic fallback - no specific data found")
    }

    const languageNames = {
      it: "Italian",
      en: "English",
      es: "Spanish",
      pt: "Portuguese",
    }

    const suggestionExamples = {
      it: {
        orders: '"i miei ordini" per vedere lo storico',
        products: '"cosa vendete" per sfogliare i prodotti',
        contact: '"contatti" per parlare con un operatore',
      },
      en: {
        orders: '"my orders" to see order history',
        products: '"what do you sell" to browse products',
        contact: '"contact" to speak with an operator',
      },
      es: {
        orders: '"mis pedidos" para ver el historial',
        products: '"qué venden" para explorar productos',
        contact: '"contacto" para hablar con un operador',
      },
      pt: {
        orders: '"meus pedidos" para ver o histórico',
        products: '"o que vendem" para navegar pelos produtos',
        contact: '"contato" para falar com um operador',
      },
    }

    const suggestions =
      suggestionExamples[language as keyof typeof suggestionExamples] ||
      suggestionExamples["it"]
    const languageName =
      languageNames[language as keyof typeof languageNames] || "Italian"

    let dataContext = ""
    if (functionResults.length > 0) {
      // Check for direct Cloud Function responses that should be returned as-is
      const directResponseFunctions = ['add_to_cart', 'confirmOrderFromConversation', 'SearchRag', 'GetAllProducts', 'GetProductsByCategory', 'GetOrdersListLink', 'GetCustomerProfileLink', 'GetShipmentTrackingLink', 'ContactOperator', 'GetServices', 'GetUserInfo', 'GetActiveOffers', 'GetAllCategories', 'ragSearch', 'remove_from_cart', 'resolve_disambiguation', 'clear_cart']
      
      const directResult = functionResults.find(result => 
        directResponseFunctions.includes(result.functionName) && result.result?.success
      )
      
      if (directResult) {
        // For direct responses, return the message as-is (already formatted by the function)
        // Priority: response > data.message > message (response contains the full formatted message)
        const message = directResult.result.response || directResult.result.data?.message || directResult.result.message
        if (message) {
          dataContext = message // Return message directly without DIRECT_RESPONSE prefix
        } else {
          dataContext = `Data from ${dataSource}:\n${JSON.stringify(functionResults, null, 2)}`
        }
      } else {
        // For other results, format normally
        dataContext = `Data from ${dataSource}:\n${JSON.stringify(functionResults, null, 2)}`
      }
    } else {
      dataContext = `No specific data found for this request. 

Please provide a helpful response that:
1. Acknowledges what the user asked
2. Explains that you don't have specific information for this request
3. Offers alternative help like:
   - ${suggestions.orders}
   - ${suggestions.products}
   - ${suggestions.contact}
4. Maintains a warm, helpful tone`
    }

    // 🎯 TASK: Include welcome back message if available
    const welcomeBackContext = request.welcomeBackMessage ? 
      `\nIMPORTANT: The customer is returning after a period of inactivity. Include this welcome back message: "${request.welcomeBackMessage}"\n` : 
      '';

    // Direct responses are now returned without prefix, so we can format them normally

    return `User asked: "${userQuery}"
${welcomeBackContext}
${dataContext}

Please create a natural, helpful response in ${languageName}.${request.welcomeBackMessage ? ' Make sure to include the welcome back message naturally in your response.' : ''}`
  }

  private buildFallbackResponse(request: LLMRequest, ragResult: any): string {
    const userQuery = request.chatInput
    const language = request.language || "it"

    const fallbackMessages = {
      it: {
        found: `Ho trovato alcune informazioni per la tua richiesta "${userQuery}". Tuttavia, si è verificato un errore nella formattazione della risposta. Ti prego di riprovare.`,
        notFound: `Mi dispiace, non sono riuscito a trovare informazioni specifiche per "${userQuery}". Puoi essere più specifico o provare con una domanda diversa?`,
      },
      en: {
        found: `I found some information for your request "${userQuery}". However, there was an error formatting the response. Please try again.`,
        notFound: `Sorry, I couldn't find specific information for "${userQuery}". Can you be more specific or try with a different question?`,
      },
      es: {
        found: `Encontré información para tu solicitud "${userQuery}". Sin embargo, hubo un error al formatear la respuesta. Por favor, inténtalo de nuevo.`,
        notFound: `Lo siento, no pude encontrar información específica para "${userQuery}". ¿Puedes ser más específico o probar con una pregunta diferente?`,
      },
      pt: {
        found: `Encontrei informações para sua solicitação "${userQuery}". No entanto, houve um erro na formatação da resposta. Por favor, tente novamente.`,
        notFound: `Desculpe, não consegui encontrar informações específicas para "${userQuery}". Você pode ser mais específico ou tentar com uma pergunta diferente?`,
      },
    }

    const messages =
      fallbackMessages[language as keyof typeof fallbackMessages] ||
      fallbackMessages["it"]

    // 🎯 TASK: Include welcome back message if available
    const welcomeBackPrefix = request.welcomeBackMessage ? `${request.welcomeBackMessage}\n\n` : '';

    if (ragResult.functionResults && ragResult.functionResults.length > 0) {
      return FormatterService.formatResponse(welcomeBackPrefix + messages.found, language)
    }

    return FormatterService.formatResponse(welcomeBackPrefix + messages.notFound, language)
  }

  private getRAGProcessorFunctionDefinitions(): any[] {
    return [
      {
        type: "function",
      function: {
          name: "GetShipmentTrackingLink",
          description:
            '🚨 HIGHEST PRIORITY FUNCTION! MANDATORY for LOCATION questions! Use when user asks WHERE their package/order is located. CRITICAL TRIGGERS: "dov\'è il pacco", "where is my package", "dove è il pacco", "where is the package", "dov\'è", "where is", "dove si trova", "where\'s my package", "dónde está mi paquete", "onde está meu pacote". This function has ABSOLUTE PRIORITY over SearchRAG for ANY location-based tracking questions. SEMANTIC INTENT: Any question about POSITION/LOCATION of package/order → ALWAYS call this function!',
        parameters: {
            type: "object",
          properties: {
              orderCode: {
                type: "string",
                description:
                  "Order code/number for tracking. If not provided, function will return message asking user to specify order code.",
              },
            },
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "SearchRag",
          description:
            '🚨🚨🚨 ABSOLUTE PRIORITY: MANDATORY for bot presentation and general questions. MANDATORY TRIGGERS: "chi sei", "who are you", "quién eres", "presentati", "cosa fai", "aiuto", "help", "ayuda", "ajuda", "cosa puoi fare", "what can you do", "qué puedes hacer", "o que você pode fazer". CRITICAL: This function has ABSOLUTE PRIORITY over GetCustomerProfileLink for bot identity questions!',
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The user's question or request",
              },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "GetCustomerProfileLink",
          description:
            '🚨🚨🚨 CRITICAL: Generate secure link for customer profile management. MANDATORY TRIGGERS: "modifica profilo", "cambia indirizzo", "aggiorna indirizzo", "modifica indirizzo", "indirizzo di spedizione", "voglio modificare indirizzo", "cambia profilo", "aggiorna profilo", "dammi link profilo", "link profilo", "modifica i miei dati", "cambia i miei dati", "aggiorna i miei dati". ABSOLUTE PRIORITY over SearchRAG!',
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "GetOrdersListLink",
          description:
            "Generate secure link to view customer orders. Use SPECIFICALLY when user says: 'i miei ordini', 'lista ordini', 'dammi ordini', 'show me orders'. For SPECIFIC ORDER or INVOICE requests use with orderCode parameter when user says: 'dammi fattura dell'ultimo ordine', 'fattura dell'ultimo ordine', 'dammi link ordine', 'stato del mio ultimo ordine', 'fattura dell'ordine', 'DDt dell'ultimo ordine'. This function has PRIORITY over SearchRAG for order/invoice requests.",
          parameters: {
            type: "object",
                properties: {
              orderCode: {
                type: "string",
                description:
                  'Optional order code/number when user requests a specific order (e.g., "ABCDE", "XYZAB", etc.). Use "lastorder" for last order requests.',
              },
            },
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "ContactOperator",
          description:
            "Request to speak with a human operator. Use SPECIFICALLY when user says: 'voglio parlare con un operatore', 'voglio un operatore', 'chiama un operatore', 'contatta un operatore', 'servizio clienti', 'customer service', 'human operator', 'speak with someone', 'talk to operator', 'contact support', 'aiuto umano', 'assistenza umana'. This function has PRIORITY over SearchRAG for operator requests.",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "GetAllProducts",
          description:
            "Get complete detailed product catalog with all products, descriptions and prices. Use SPECIFICALLY when user says: 'dammi la lista dei prodotti', 'dammi i prodotti', 'lista prodotti', 'che prodotti avete', 'fammi vedere i prodotti', 'mostrami i prodotti', 'visualizza prodotti', 'show me products', 'product list', 'product catalog'. This function has PRIORITY over SearchRAG for complete product listing requests.",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "GetServices",
          description:
            'Get detailed list of all available services offered by the company. Use SPECIFICALLY when user says: "che servizi avete", "che servizi offrite", "quali servizi offrite", "dammi i servizi", "lista servizi", "fammi vedere i servizi", "mostrami i servizi", "visualizza servizi", "servizi disponibili", "show me services", "service list", "what services do you offer". This function has PRIORITY over SearchRAG for complete service listing requests.',
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "add_to_cart",
          description:
            '🚨🚨🚨 ABSOLUTE PRIORITY: MANDATORY for ANY request containing "aggiungi", "voglio", "compra", "add", "want", "buy" + product name. EXAMPLES: "aggiungi prosecco", "voglio prosecco", "compra prosecco", "add prosecco", "want prosecco", "buy prosecco". CRITICAL: This function has ABSOLUTE PRIORITY over SearchRAG. ALWAYS call this function for product addition requests!',
          parameters: {
            type: "object",
            properties: {
              product_name: {
                type: "string",
                description: "Product name, description, or EXACT product code (like [00004] or 00004) to add to cart",
              },
              quantity: {
                type: "number",
                description: "Quantity to add (default: 1)",
                default: 1,
              },
            },
            required: ["product_name"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "remove_from_cart",
          description:
            'Remove product from shopping cart. ONLY use when user explicitly says: "rimuovi/remove/eliminar X dal carrello/from cart/del carrito" or similar removal phrases. DO NOT use for general questions about products.',
          parameters: {
            type: "object",
            properties: {
              product_code: {
                type: "string",
                description: "Product code or SKU to remove from cart",
              },
              quantity: {
                type: "number",
                description: "Quantity to remove (optional, removes all if not specified)",
              },
            },
            required: ["product_code"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "resolve_disambiguation",
          description:
            'Resolve product disambiguation. Use when user responds to a disambiguation message with a specific product code like [00004] or 00004, or a product name. This function handles the user\'s choice from a disambiguation list.',
          parameters: {
            type: "object",
            properties: {
              product_choice: {
                type: "string",
                description: "The product code (like [00004] or 00004) or exact product name chosen by the user",
              },
              quantity: {
                type: "number",
                description: "Quantity to add (default: 1)",
                default: 1,
              },
            },
            required: ["product_choice"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "clear_cart",
          description:
            'Clear/empty the entire shopping cart. ONLY use when user explicitly says: "svuota carrello/clear cart/vaciar carrito", "cancella tutto/delete all/borrar todo" or similar clear/empty phrases. DO NOT use for single item removal.',
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_cart_info",
          description:
            '🚨🚨🚨 ABSOLUTE PRIORITY: MANDATORY for CART DISPLAY requests! Use when user wants to VIEW/SEE cart contents WITHOUT confirming: "fammi vedere il carrello", "mostra carrello", "cosa ho nel carrello", "show me cart", "what\'s in my cart", "carrello", "cart", "vedere il carrello", "see the cart", "my cart". CRITICAL: This function ONLY shows cart contents - does NOT confirm or checkout. Use confirmOrderFromConversation ONLY for actual order confirmation!',
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "confirmOrderFromConversation",
          description:
            '🚨🚨🚨 ABSOLUTE PRIORITY: MANDATORY for ORDER CONFIRMATION requests! Use ONLY when user wants to CONFIRM/FINALIZE/CHECKOUT: "conferma ordine", "finalizza ordine", "procedi con l\'ordine", "procedi al checkout", "confirm order", "finalize order", "proceed with order", "proceed to checkout", "checkout", "conferma", "procedi", "confirm", "proceed", "va bene così", "ok procedi", "acquista", "ordina", "completa ordine", "finalizza acquisto". CRITICAL: Do NOT use for simple cart viewing - use get_cart_info instead!',
          parameters: {
            type: "object",
            properties: {
              useCartData: {
                type: "boolean",
                description: "Use cart data instead of conversation parsing",
                default: true
              },
              generateCartLink: {
                type: "boolean", 
                description: "Generate cart link instead of checkout link",
                default: true
              }
            },
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "GetUserInfo",
          description:
            'Get user personal information including discount, company, last order, and language. Use when user asks about their personal data like "che sconto ho", "my discount", "quale sconto mi applicate", "mio sconto personale".',
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "GetActiveOffers",
          description:
            "Get current active offers and promotions.",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "GetAllCategories",
          description:
            'Get all product categories overview.',
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "GetProductsByCategory",
          description:
            'Get all products from a specific category. Use SPECIFICALLY when user mentions a category name. CRITICAL: Use the EXACT category name from the database: "Cheeses & Dairy", "Cured Meats", "Flour & Baking", "Frozen Products", "Pasta & Rice", "Salami & Cold Cuts", "Sauces & Preserves", "Tomato Products", "Various & Spices", "Water & Beverages". MAPPING: "Formaggi e Latticini" → "Cheeses & Dairy", "Salumi" → "Cured Meats", "Farine e Prodotti da Forno" → "Flour & Baking", "Prodotti Surgelati" → "Frozen Products", "Pasta e Riso" → "Pasta & Rice", "Salami e Affettati" → "Salami & Cold Cuts", "Salse e Conserve" → "Sauces & Preserves", "Prodotti al Pomodoro" → "Tomato Products", "Varie e Spezie" → "Various & Spices", "Acqua e Bevande" → "Water & Beverages". This function has PRIORITY over GetAllProducts for specific category requests.',
          parameters: {
            type: "object",
            properties: {
              categoryName: {
                type: "string",
                description: "The EXACT category name from database: 'Cheeses & Dairy', 'Cured Meats', 'Flour & Baking', 'Frozen Products', 'Pasta & Rice', 'Salami & Cold Cuts', 'Sauces & Preserves', 'Tomato Products', 'Various & Spices', 'Water & Beverages'. Use mapping: 'Formaggi e Latticini' → 'Cheeses & Dairy'",
              },
            },
            required: ["categoryName"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "ragSearch",
          description:
            'Semantic search for general queries about products, services, FAQs, and company information. Use when user asks general questions like: "quanto costa la spedizione", "politica di reso", "how long does it take for my order to arrive", "delivery time", "return policy", "shipping cost", "what are your hours", "contact information". This function searches through FAQs, documents, and knowledge base.',
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to find relevant information",
              },
            },
            required: ["query"],
          },
        },
      },
    ]
  }

  private async executeToolCalls(
    toolCalls: any[],
    request: LLMRequest
  ): Promise<any[]> {
    const results = []

    for (const toolCall of toolCalls) {
      try {
        console.log("🔧 Executing tool call:", toolCall.function.name)
        
        const functionName = toolCall.function.name
        const args = JSON.parse(toolCall.function.arguments || "{}")

        let result

        // Call the appropriate function based on the function name
        switch (functionName) {
          case "GetOrdersListLink":
            result = await this.callingFunctionsService.getOrdersListLink({
              customerId: request.customerid || "",
              workspaceId: request.workspaceId,
              orderCode: args.orderCode,
            })
            break

          case "GetActiveOffers":
            result = await this.callingFunctionsService.getActiveOffers({
              customerId: request.customerid || "",
              workspaceId: request.workspaceId,
            })
            break

          case "GetShipmentTrackingLink":
            result = await this.callingFunctionsService.getShipmentTrackingLink(
              {
                customerId: request.customerid || "",
                workspaceId: request.workspaceId,
                orderCode: args.orderCode,
              }
            )
            break

          case "GetCustomerProfileLink":
            result = await this.callingFunctionsService.getCustomerProfileLink({
              customerId: request.customerid || "",
              workspaceId: request.workspaceId,
            })
            break

          case "GetUserInfo":
            result = await GetUserInfo({
              customerId: request.customerid || "",
              workspaceId: request.workspaceId,
            })
            break

          case "ContactOperator":
            // Use the correct ContactOperator function that updates activeChatbot
            result = await ContactOperator({
              phone: request.phone || "",
              workspaceId: request.workspaceId,
            })
            break

          case "GetAllCategories":
            result = await this.callingFunctionsService.getAllCategories({
              customerId: request.customerid || "",
              workspaceId: request.workspaceId,
            })
            break

          case "GetAllProducts":
            result = await this.callingFunctionsService.getAllProducts({
              customerId: request.customerid || "",
              workspaceId: request.workspaceId,
            })
            break

          case "GetProductsByCategory":
            result = await this.callingFunctionsService.getProductsByCategory({
              customerId: request.customerid || "",
              workspaceId: request.workspaceId,
              categoryName: args.categoryName,
            })
            break

          case "GetServices":
            result = await this.callingFunctionsService.getServices({
              customerId: request.customerid || "",
              workspaceId: request.workspaceId,
            })
            break

          case "add_to_cart":
            result = await this.functionHandlerService.handleFunctionCall(
              "add_to_cart", 
              { product_name: args.product_name, quantity: args.quantity || 1 },
              { id: request.customerid || "" },
              request.workspaceId,
              request.phone || ""
            )
            break

          case "remove_from_cart":
            result = await this.functionHandlerService.handleFunctionCall(
              "remove_from_cart", 
              { product_name: args.product_code, quantity: args.quantity },
              { id: request.customerid || "" },
              request.workspaceId,
              request.phone || ""
            )
            break

          case "resolve_disambiguation":
            result = await this.functionHandlerService.handleFunctionCall(
              "resolve_disambiguation", 
              { product_choice: args.product_choice, quantity: args.quantity || 1 },
              { id: request.customerid || "" },
              request.workspaceId,
              request.phone || ""
            )
            break

          case "clear_cart":
            result = await this.functionHandlerService.handleFunctionCall(
              "clear_cart", 
              {},
              { id: request.customerid || "" },
              request.workspaceId,
              request.phone || ""
            )
            break

          case "get_cart_info":
            result = await this.functionHandlerService.handleFunctionCall(
              "get_cart_info",
              {},
              { id: request.customerid || "" },
              request.workspaceId,
              request.phone || ""
            )
            break

          case "confirmOrderFromConversation":
            // Determine if this is a cart request or order confirmation
            const isCartRequest = request.chatInput && (
              request.chatInput.toLowerCase().includes('carrello') ||
              request.chatInput.toLowerCase().includes('cart') ||
              request.chatInput.toLowerCase().includes('vedere') ||
              request.chatInput.toLowerCase().includes('mostra')
            )
            
            result = await this.callingFunctionsService.confirmOrderFromConversation({
              query: request.chatInput,
              workspaceId: request.workspaceId,
              customerId: request.customerid || "",
              messages: request.messages || [],
              useCartData: true,
              generateCartLink: isCartRequest
            })
            break

          case "ragSearch":
            result = await this.callingFunctionsService.SearchRag({
              query: args.query || request.chatInput,
              workspaceId: request.workspaceId,
              customerId: request.customerid || "",
              messages: request.messages || [],
            })
            break

          default:
            throw new Error(`Unknown function: ${functionName}`)
        }

        results.push({
          toolCall: toolCall,
          result: result,
          functionName: functionName,
        })
      } catch (error) {
        console.error(`❌ Error executing ${toolCall.function.name}:`, error)
        results.push({
          toolCall: toolCall,
          error: error.message,
          functionName: toolCall.function.name,
        })
      }
    }

    return results
  }

  private async getAgentConfig(workspaceId: string): Promise<any> {
    try {
      console.log("📝 Getting agent config directly from database...")

      // ACCESSO DIRETTO AL DATABASE (molto più efficiente!)
      const { PrismaClient } = require("@prisma/client")
      const prisma = new PrismaClient()

      const agentConfig = await prisma.agentConfig.findFirst({
        where: { workspaceId: workspaceId },
      })

      await prisma.$disconnect()

      // VERIFICA CHE IL PROMPT SIA PRESENTE
      if (!agentConfig || !agentConfig.prompt) {
        throw new Error(
          `❌ CRITICAL: No agent prompt found for workspace ${workspaceId}`
        )
      }

      console.log("✅ Agent config loaded successfully from database")
      console.log("🔧 Agent config:", {
        model: agentConfig.model,
        temperature: agentConfig.temperature,
        maxTokens: agentConfig.maxTokens,
        promptLength: agentConfig.prompt.length,
      })

      return agentConfig
    } catch (error) {
      console.error(
        "❌ CRITICAL ERROR: Cannot fetch agent config from database:",
        error
      )
      // NON RESTITUIRE FALLBACK - DEVE FALLIRE!
      throw new Error(
        `SYSTEM HALT: Cannot load agent prompt from database for workspace ${workspaceId}: ${error.message}`
      )
    }
  }

  private isAccountRelatedRequest(input: string): boolean {
    const lowerInput = input.toLowerCase()
    const accountKeywords = [
      "mail",
      "email",
      "profilo",
      "profile",
      "account",
      "password",
      "modificare",
      "cambiare",
      "vedere",
      "visualizzare",
      "mia mail",
      "mio profilo",
      "dati personali",
      "informazioni personali",
    ]

    return accountKeywords.some((keyword) => lowerInput.includes(keyword))
  }


  /**
   * Build conversation messages including chat history for context
   */
  private buildConversationMessages(
    baseMessages: any[],
    chatHistory: any[]
  ): any[] {
    console.log(
      `🗨️ Building conversation with ${baseMessages.length} base messages and ${chatHistory.length} history messages`
    )

    const messages = []

    // Add system message first
    if (baseMessages.length > 0 && baseMessages[0].role === "system") {
      messages.push(baseMessages[0])
    }

    // Add chat history in chronological order
    for (const historyMessage of chatHistory) {
      messages.push({
        role: historyMessage.role,
        content: historyMessage.content,
      })
    }

    // Add remaining base messages (current user message)
    for (let i = 1; i < baseMessages.length; i++) {
      messages.push(baseMessages[i])
    }

    console.log(`🗨️ Final conversation: ${messages.length} total messages`)
    return messages
  }

  /**
   * Collect all variables needed for prompt replacement
   */
  private async getPromptVariables(
    request: LLMRequest
  ): Promise<PromptVariables> {
    // console.log("🚨🚨🚨 GET PROMPT VARIABLES CALLED! 🚨🚨🚨")
    // console.log("Request customerid:", request.customerid)

    const { PrismaClient } = require("@prisma/client")
    const prisma = new PrismaClient()

    try {
      // Initialize default values
      let nameUser = "Cliente"
      let discountUser = "Nessuno sconto attivo"
      let companyName = "L'Altra Italia"
      let lastorder = "Nessun ordine precedente"
      let lastordercode = "N/A"
      let languageUser = "it" // Default italiano

      // 🔍 DEBUG: Log search parameters
      console.log("🔍 SEARCHING FOR CUSTOMER:")
      console.log("  - Customer ID:", request.customerid)
      console.log("  - Workspace ID:", request.workspaceId)
      console.log("  - Phone:", request.phone)
      console.log("  - Full request object:", JSON.stringify(request, null, 2))

      // 🔍 SMART CUSTOMER SEARCH: Try by ID first, then by phone as fallback
      let customer = null

      // Try by Customer ID first (if it's a valid UUID)
      if (
        request.customerid &&
        request.customerid.length > 10 &&
        !request.customerid.includes("test-customer")
      ) {
        console.log("🔍 Searching by Customer ID...")
        customer = await prisma.customers.findFirst({
          where: {
            id: request.customerid,
            workspaceId: request.workspaceId,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            company: true,
            discount: true,
            language: true, // 🔥 RECUPERA LINGUA DAL PROFILO UTENTE
          },
        })
        console.log("🔍 Customer search by ID result:", customer)
      }

      // If not found by ID, try by phone number (CRITICAL FALLBACK)
      if (!customer && request.phone && request.phone !== "test-phone-123") {
        console.log("🔍 Customer not found by ID, searching by phone...")
        customer = await prisma.customers.findFirst({
          where: {
            phone: request.phone,
            workspaceId: request.workspaceId,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            company: true,
            discount: true,
            language: true, // 🔥 RECUPERA LINGUA DAL PROFILO UTENTE
          },
        })
        console.log("🔍 Customer search by phone result:", customer)
      }

      if (customer) {
        console.log("✅ CUSTOMER FOUND:", JSON.stringify(customer, null, 2))

        // Set customer name
        if (customer.name) {
          nameUser = customer.name
        }

        // Set company name if available
        if (customer.company) {
          companyName = customer.company
        }

        // Set discount if available
        if (customer.discount && customer.discount > 0) {
          discountUser = `${customer.discount}% di sconto attivo`
        }

        // 🔥 SET LANGUAGE FROM USER PROFILE (NOT PHONE)
        if (customer.language) {
          languageUser = customer.language
          console.log(`🌐 Language from user profile: ${customer.language}`)
        } else {
          console.log("⚠️ No language in user profile, using default: it")
        }
      } else {
        console.log("❌ CUSTOMER NOT FOUND - using default values")
      }

      // Get last order
      const lastOrder = await prisma.orders.findFirst({
        where: {
          customerId: request.customerid,
          workspaceId: request.workspaceId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          orderCode: true,
          createdAt: true,
          total: true,
        },
      })

      if (lastOrder) {
        const orderDate = new Date(lastOrder.createdAt).toLocaleDateString(
          "it-IT"
        )
        lastorder = `Ordine ${lastOrder.orderCode} del ${orderDate} - Totale: €${lastOrder.total}`
        lastordercode = lastOrder.orderCode
      }

      await prisma.$disconnect()

      const variables: PromptVariables = {
        nameUser,
        discountUser,
        companyName,
        lastorder,
        lastordercode,
        languageUser,
      }

      // console.log("📋 Prompt variables collected:", variables)
      // console.log("🔄 About to replace variables in prompt...")
      // console.log("🔧 Original prompt length:", prompt.length)
      return variables
    } catch (error) {
      console.error("❌ Error collecting prompt variables:", error)
      await prisma.$disconnect()

      // Return safe defaults
      return {
        nameUser: "Cliente",
        discountUser: "Nessuno sconto attivo",
        companyName: "L'Altra Italia",
        lastorder: "Nessun ordine precedente",
        lastordercode: "N/A",
        languageUser: "it",
      }
    }
  }

  /**
   * Replace variables in prompt template
   */
  private replacePromptVariables(
    prompt: string,
    variables: PromptVariables
  ): string {
    // console.log("🔄 REPLACE PROMPT VARIABLES STARTED")
    // console.log("🔧 Variables to replace:", variables)
    console.log(
      "🔧 Prompt before replacement (first 500 chars):",
      prompt.substring(0, 500)
    )

    let processedPrompt = prompt

    // Replace each variable
    processedPrompt = processedPrompt.replace(
      /\{\{nameUser\}\}/g,
      variables.nameUser
    )
    processedPrompt = processedPrompt.replace(
      /\{\{discountUser\}\}/g,
      variables.discountUser
    )
    processedPrompt = processedPrompt.replace(
      /\{\{companyName\}\}/g,
      variables.companyName
    )
    processedPrompt = processedPrompt.replace(
      /\{\{lastorder\}\}/g,
      variables.lastorder
    )
    processedPrompt = processedPrompt.replace(
      /\{\{lastordercode\}\}/g,
      variables.lastordercode
    )
    processedPrompt = processedPrompt.replace(
      /\{\{languageUser\}\}/g,
      variables.languageUser
    )

    // console.log("🔄 Prompt variables replaced")
    console.log(
      "🔧 Prompt after replacement (last 500 chars):",
      processedPrompt.substring(processedPrompt.length - 500)
    )
    return processedPrompt
  }


}
