import axios from "axios"
import { LLMRequest, LLMResponse } from "../types/whatsapp.types"
import { CallingFunctionsService } from "./calling-functions.service"
import { EmbeddingService } from "./embeddingService"
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
  private openRouterApiKey: string
  private openRouterUrl: string
  private backendUrl: string
  private lastTranslatedQuery: string = ""
  private lastProcessedPrompt: string = ""

  constructor() {
    this.callingFunctionsService = new CallingFunctionsService()
    this.translationService = new TranslationService()
    this.embeddingService = new EmbeddingService()
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

    let requestWithPrompt = request // Initialize with original request

    try {
      // 🔧 GET AGENT CONFIG AND PROMPT FROM DATABASE IF NOT PROVIDED
      let agentPrompt = request.prompt
      if (!agentPrompt) {
        console.log("📝 No prompt in request, fetching from database...")
        const agentConfig = await this.getAgentConfig(request.workspaceId)
        agentPrompt = agentConfig.prompt
        console.log("✅ Agent prompt fetched from database")
      }

      // � NO MORE VARIABLE REPLACEMENT - ALREADY DONE IN WEBHOOK!
      console.log("� WEBHOOK HAS ALREADY PROCESSED VARIABLES - Using prompt as-is")
      
      // Use the prompt directly from webhook (already processed)
      if (request.prompt) {
        agentPrompt = request.prompt
        console.log("✅ Using pre-processed prompt from webhook")
      }

      // 🌐 UPDATE REQUEST WITH USER'S LANGUAGE FROM PROFILE
      requestWithPrompt = { 
        ...request, 
        prompt: agentPrompt,
        language: request.language || 'it'  // 🔥 USE LANGUAGE FROM WEBHOOK
      }
      console.log(`🌐 Using language from webhook: ${request.language || 'it'}`)

      // 🔧 STORE PROCESSED PROMPT FOR DEBUG
      this.lastProcessedPrompt = agentPrompt

      // Stage 1: TRY CLOUD FUNCTIONS FIRST (NEW STRATEGY)
      console.log("🔧 Stage 1A: Trying Cloud Functions First")
      const functionResult = await this.tryCloudFunctions(requestWithPrompt)

      let ragResult
      if (functionResult.success) {
        console.log("✅ Cloud Functions succeeded, using CF result")
        ragResult = functionResult
      } else {
        console.log("⚠️ Cloud Functions failed, falling back to SearchRag")
        // Stage 1B: FALLBACK TO SEARCHRAG IF CF FAILS
        ragResult = await this.executeSearchRagFallback(requestWithPrompt)
      }

      console.log("✅ Final RAG Result:", JSON.stringify(ragResult, null, 2))

      // Stage 2: FORMATTER - SEMPRE USA IL FORMATTER (anche se SearchRag è vuoto)
      console.log(
        "🔧 Stage 2: Formatter (handles all cases - with or without results)"
      )

      const formattedResponse = await this.executeFormatter(
        requestWithPrompt,
        ragResult
      )
      console.log(
        "✅ Formatted Response:",
        JSON.stringify(formattedResponse, null, 2)
      )

      console.log('🎯 DUAL LLM SUCCESS RESULT:', {
        translatedQuery: this.lastTranslatedQuery,
        hasProcessedPrompt: !!this.lastProcessedPrompt,
        outputLength: formattedResponse?.length || 0
      });

      return {
        output: formattedResponse,
        success: true,
        functionCalls: ragResult.functionResults || [],
        translatedQuery: this.lastTranslatedQuery,
        processedPrompt: this.lastProcessedPrompt,
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
    console.log("🔧 Input request:", { chatInput: request.chatInput, language: request.language })

    try {
      // Translate query
      console.log("🌐 About to call translation service for:", request.chatInput)
      const translatedQuery = await this.translationService.translateToEnglish(
        request.chatInput
      )
      this.lastTranslatedQuery = translatedQuery // Store for debug
      console.log("🔧 Translated query:", translatedQuery)

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
      console.log("🔧 Cloud Functions: Using agent prompt from DB")

      const openRouterPayload = {
        model: agentConfig.model || "openai/gpt-4o",
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
        tool_choice: "auto", // Changed to auto to allow non-function responses
        temperature: agentConfig.temperature || 0.0,
        max_tokens: agentConfig.maxTokens || 1000,
      }

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

      console.log("🔧 Tool calls found:", toolCalls.length)

      if (toolCalls.length > 0) {
        // Execute tool calls
        console.log("🔧 Executing tool calls...")
        const results = await this.executeToolCalls(toolCalls, request)
        console.log("✅ Tool call results:", JSON.stringify(results, null, 2))

        return {
          functionResults: results,
          success: true,
          source: "cloud_functions",
        }
      } else {
        console.log(
          "⚠️ No tool calls detected - Cloud Functions cannot handle this request"
        )
        return {
          functionResults: [],
          success: false,
          source: "cloud_functions",
        }
      }
    } catch (error) {
      console.error("❌ Cloud Functions Error:", error)
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
      const translatedQuery =
        await this.translationService.translateToEnglish(request.chatInput)
      this.lastTranslatedQuery = translatedQuery // Store for debug

      // Use SearchRag for semantic search - try multiple sources
      const [productResults, serviceResults, faqResults] = await Promise.all([
        this.embeddingService.searchProducts(
          translatedQuery,
          request.workspaceId,
          2
        ),
        this.embeddingService.searchServices(
          translatedQuery,
          request.workspaceId,
          2
        ),
        this.embeddingService.searchFAQs(
          translatedQuery,
          request.workspaceId,
          2
        ),
      ])

      const allResults = [
        ...productResults.map((r) => ({ ...r, type: "product" })),
        ...serviceResults.map((r) => ({ ...r, type: "service" })),
        ...faqResults.map((r) => ({ ...r, type: "faq" })),
      ]

      console.log("🔧 SearchRag results:", JSON.stringify(allResults, null, 2))

      if (allResults.length === 0) {
        console.log("⚠️ No SearchRag results found")
        return {
          functionResults: [],
          success: false,
          source: "searchrag",
        }
      }

      // Format SearchRag results
      const formattedResults = allResults.map((result) => ({
        type: "searchrag_result",
        data: result,
        source: "searchrag",
      }))

      return {
        functionResults: formattedResults,
        success: true,
        source: "searchrag",
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

  private buildCloudFunctionsSystemMessage(): string {
    return `You are a Function Calling Agent for ShopMe WhatsApp Bot.

MISSION: You MUST call functions for specific requests, otherwise decline politely.

AVAILABLE FUNCTIONS:
- GetOrdersListLink: Get link to customer orders page
- GetShipmentTrackingLink: Get link to track order shipment
- GetCustomerProfileLink: Get link to customer profile management
- GetActiveOffers: Get current active offers and promotions
- GetContactInfo: Get company contact information
- getAllCategories: Get complete list of product categories
- getAllProducts: Get complete product catalog with details
- getServices: Get list of all available services

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

PRIORITY: Cloud Functions take precedence. If uncertain, don't call functions.`
  }

  private async executeFormatter(
    request: LLMRequest,
    ragResult: any
  ): Promise<string> {
    try {
      console.log("🎨 Stage 2: Formatter - Natural Response Generation")

      // FORMATTER USA IL PROMPT LOCALIZZATO BASATO SULLA LINGUA DELL'UTENTE
      const systemMessage = this.buildFormatterSystemMessage(request.language || 'it')

      const response = await axios.post(
        this.openRouterUrl,
        {
          model: "anthropic/claude-3-5-sonnet-20241022",
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
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3001",
            "X-Title": "ShopMe Formatter",
          },
          timeout: 30000,
        }
      )

      const formattedResponse =
        response.data.choices[0]?.message?.content?.trim()
      console.log("✅ Formatted response:", formattedResponse)

      return (
        formattedResponse ||
        "Mi dispiace, non sono riuscito a generare una risposta."
      )
    } catch (error) {
      console.error("❌ Formatter Error:", error)
      return this.buildFallbackResponse(request, ragResult)
    }
  }

  private buildFormatterSystemMessage(language: string = 'it'): string {
    const languageConfig = {
      'it': {
        name: 'Italian',
        languageName: 'italiano',
        instructions: {
          style: '- Usa la lingua italiana',
          noData: {
            acknowledge: '1. Riconosci cortesemente la richiesta dell\'utente',
            offer: '2. Offri aiuto con richieste comuni (ordini, prodotti, contatti)',
            suggest: '3. Suggerisci azioni specifiche che possono provare',
            emojis: '4. Includi emoji appropriate'
          }
        }
      },
      'en': {
        name: 'English',
        languageName: 'English',
        instructions: {
          style: '- Use English language',
          noData: {
            acknowledge: '1. Acknowledge the user\'s request politely',
            offer: '2. Offer to help with common requests (orders, products, contact)',
            suggest: '3. Suggest specific actions they can try',
            emojis: '4. Include relevant emojis'
          }
        }
      },
      'es': {
        name: 'Spanish',
        languageName: 'español',
        instructions: {
          style: '- Usa el idioma español',
          noData: {
            acknowledge: '1. Reconoce cortésmente la solicitud del usuario',
            offer: '2. Ofrece ayuda con solicitudes comunes (pedidos, productos, contacto)',
            suggest: '3. Sugiere acciones específicas que pueden intentar',
            emojis: '4. Incluye emojis relevantes'
          }
        }
      },
      'pt': {
        name: 'Portuguese',
        languageName: 'português',
        instructions: {
          style: '- Use a língua portuguesa',
          noData: {
            acknowledge: '1. Reconheça cortesmente a solicitação do usuário',
            offer: '2. Ofereça ajuda com solicitações comuns (pedidos, produtos, contato)',
            suggest: '3. Sugira ações específicas que podem tentar',
            emojis: '4. Inclua emojis relevantes'
          }
        }
      }
    }

    const config = languageConfig[language as keyof typeof languageConfig] || languageConfig['it']

    return `You are SofIA, a helpful WhatsApp assistant for L'Altra Italia e-commerce.

MISSION: Create natural, friendly responses based on the data provided.

STYLE:
${config.instructions.style}
- Be conversational and warm
- Keep responses concise but informative
- Use emojis appropriately
- Always be helpful and professional

CONTEXT: You receive data from either Cloud Functions or SearchRag.
- Cloud Functions: Structured data (orders, offers, contacts)
- SearchRag: Semantic search results about products/services
- No data: When no specific information is found, provide helpful guidance

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
    const language = request.language || 'it'

    const languageNames = {
      'it': 'Italian',
      'en': 'English', 
      'es': 'Spanish',
      'pt': 'Portuguese'
    }

    const suggestionExamples = {
      'it': {
        orders: '"i miei ordini" per vedere lo storico',
        products: '"cosa vendete" per sfogliare i prodotti',
        contact: '"contatti" per parlare con un operatore'
      },
      'en': {
        orders: '"my orders" to see order history',
        products: '"what do you sell" to browse products', 
        contact: '"contact" to speak with an operator'
      },
      'es': {
        orders: '"mis pedidos" para ver el historial',
        products: '"qué venden" para explorar productos',
        contact: '"contacto" para hablar con un operador'
      },
      'pt': {
        orders: '"meus pedidos" para ver o histórico',
        products: '"o que vendem" para navegar pelos produtos',
        contact: '"contato" para falar com um operador'
      }
    }

    const suggestions = suggestionExamples[language as keyof typeof suggestionExamples] || suggestionExamples['it']
    const languageName = languageNames[language as keyof typeof languageNames] || 'Italian'

    let dataContext = ""
    if (functionResults.length > 0) {
      dataContext = `Data from ${dataSource}:\n${JSON.stringify(functionResults, null, 2)}`
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

    return `User asked: "${userQuery}"

${dataContext}

Please create a natural, helpful response in ${languageName}.`
  }

  private buildFallbackResponse(request: LLMRequest, ragResult: any): string {
    const userQuery = request.chatInput
    const language = request.language || 'it'

    const fallbackMessages = {
      'it': {
        found: `Ho trovato alcune informazioni per la tua richiesta "${userQuery}". Tuttavia, si è verificato un errore nella formattazione della risposta. Ti prego di riprovare.`,
        notFound: `Mi dispiace, non sono riuscito a trovare informazioni specifiche per "${userQuery}". Puoi essere più specifico o provare con una domanda diversa?`
      },
      'en': {
        found: `I found some information for your request "${userQuery}". However, there was an error formatting the response. Please try again.`,
        notFound: `Sorry, I couldn't find specific information for "${userQuery}". Can you be more specific or try with a different question?`
      },
      'es': {
        found: `Encontré información para tu solicitud "${userQuery}". Sin embargo, hubo un error al formatear la respuesta. Por favor, inténtalo de nuevo.`,
        notFound: `Lo siento, no pude encontrar información específica para "${userQuery}". ¿Puedes ser más específico o probar con una pregunta diferente?`
      },
      'pt': {
        found: `Encontrei informações para sua solicitação "${userQuery}". No entanto, houve um erro na formatação da resposta. Por favor, tente novamente.`,
        notFound: `Desculpe, não consegui encontrar informações específicas para "${userQuery}". Você pode ser mais específico ou tentar com uma pergunta diferente?`
      }
    }

    const messages = fallbackMessages[language as keyof typeof fallbackMessages] || fallbackMessages['it']

    if (ragResult.functionResults && ragResult.functionResults.length > 0) {
      return messages.found
    }

    return messages.notFound
  }

  private getRAGProcessorFunctionDefinitions(): any[] {
    return [
      {
        type: "function",
        function: {
          name: "GetOrdersListLink",
          description:
            "Get a direct link to view customer orders. Use this for any order-related requests. Examples: 'dammi la lista degli ordini', 'voglio vedere i miei ordini', 'show me my orders', 'i miei ordini', 'lista ordini', 'storico ordini'. If user specifies an order code/number, include it in orderCode parameter.",
          parameters: {
            type: "object",
            properties: {
              orderCode: {
                type: "string",
                description:
                  'Optional order code/number when user requests a specific order (e.g., "TRACKING-TEST-001", "20007", etc.)',
              },
            },
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "GetShipmentTrackingLink",
          description:
            'Get shipment tracking link for order delivery status. Examples: "dove è il mio ordine", "dov\'è il mio ordine", "tracking spedizione", "stato spedizione", "dove è la merce", "where is my order", "track my order", "delivery status". Use when user asks about order location, delivery status, or shipment tracking. If no orderCode provided, ask user to specify which order.',
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
          name: "GetCustomerProfileLink",
          description:
            'Get link to customer profile page for modifying personal information, address, or account details. Examples: "modificare profilo", "cambiare indirizzo", "vedere mail", "mia mail", "mio profilo", "dati personali", "change profile", "update address", "voglio cambiare indirizzo". Use when user wants to change/modify their profile, address, email, or personal data.',
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
          description: "Get current active offers and promotions. Examples: 'che offerte avete', 'sconti disponibili', 'promozioni', 'show me offers', 'any deals', 'discounts'.",
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
          name: "GetContactInfo",
          description: "Get contact information and support details. Examples: 'voglio parlare con un operatore', 'aiuto umano', 'assistenza umana', 'human operator', 'speak with someone'.",
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
          name: "getAllCategories",
          description:
            'Get all product categories overview. Examples: "cosa vendete", "che categorie avete", "tipi di prodotti", "categorie disponibili", "what do you sell", "show me categories", "product categories". Use when user asks what you sell, what categories you have, or wants to see available product types.',
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
          name: "getAllProducts",
          description:
            'Get complete detailed product catalog with all products, descriptions and prices. Examples: "dammi la lista dei prodotti", "che prodotti avete", "catalogo", "show me products", "catalogo completo", "tutti i prodotti", "lista prodotti dettagliata". Use when user wants full product details, complete catalog, or specific product information.',
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
          name: "getServices",
          description:
            'Get detailed list of all available services offered by the company. Examples: "che servizi offrite", "servizi disponibili", "quali servizi avete", "lista servizi", "what services do you offer", "servizi della ditta". Use when user asks about company services, service availability, or service details.',
          parameters: {
            type: "object",
            properties: {},
            required: [],
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

          case "GetContactInfo":
            result = await this.callingFunctionsService.contactOperator({
              customerId: request.customerid || "",
              workspaceId: request.workspaceId,
            })
            break

          case "getAllCategories":
            result = await this.callingFunctionsService.getAllCategories({
              customerId: request.customerid || "",
              workspaceId: request.workspaceId,
            })
            break

          case "getAllProducts":
            result = await this.callingFunctionsService.getAllProducts({
              customerId: request.customerid || "",
              workspaceId: request.workspaceId,
            })
            break

          case "getServices":
            result = await this.callingFunctionsService.getServices({
              customerId: request.customerid || "",
              workspaceId: request.workspaceId,
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
  private async getPromptVariables(request: LLMRequest): Promise<PromptVariables> {
    console.log("🚨🚨🚨 GET PROMPT VARIABLES CALLED! 🚨🚨🚨")
    console.log("Request customerid:", request.customerid)
    
    const { PrismaClient } = require('@prisma/client')
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
      let customer = null;
      
      // Try by Customer ID first (if it's a valid UUID)
      if (request.customerid && request.customerid.length > 10 && !request.customerid.includes("test-customer")) {
        console.log("🔍 Searching by Customer ID...")
        customer = await prisma.customers.findFirst({
          where: {
            id: request.customerid,
            workspaceId: request.workspaceId,
            isActive: true
          },
          select: {
            id: true,
            name: true,
            company: true,
            discount: true,
            language: true  // 🔥 RECUPERA LINGUA DAL PROFILO UTENTE
          }
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
            isActive: true
          },
          select: {
            id: true,
            name: true,
            company: true,
            discount: true,
            language: true  // 🔥 RECUPERA LINGUA DAL PROFILO UTENTE
          }
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
          workspaceId: request.workspaceId
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          orderCode: true,
          createdAt: true,
          total: true
        }
      })

      if (lastOrder) {
        const orderDate = new Date(lastOrder.createdAt).toLocaleDateString('it-IT')
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
        languageUser
      }

      console.log("📋 Prompt variables collected:", variables)
      console.log("🔄 About to replace variables in prompt...")
      console.log("🔧 Original prompt length:", prompt.length)
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
        languageUser: "it"
      }
    }
  }

  /**
   * Replace variables in prompt template
   */
  private replacePromptVariables(prompt: string, variables: PromptVariables): string {
    console.log("🔄 REPLACE PROMPT VARIABLES STARTED")
    console.log("🔧 Variables to replace:", variables)
    console.log("🔧 Prompt before replacement (first 500 chars):", prompt.substring(0, 500))
    
    let processedPrompt = prompt

    // Replace each variable
    processedPrompt = processedPrompt.replace(/\{\{nameUser\}\}/g, variables.nameUser)
    processedPrompt = processedPrompt.replace(/\{\{discountUser\}\}/g, variables.discountUser)
    processedPrompt = processedPrompt.replace(/\{\{companyName\}\}/g, variables.companyName)
    processedPrompt = processedPrompt.replace(/\{\{lastorder\}\}/g, variables.lastorder)
    processedPrompt = processedPrompt.replace(/\{\{lastordercode\}\}/g, variables.lastordercode)
    processedPrompt = processedPrompt.replace(/\{\{languageUser\}\}/g, variables.languageUser)

    console.log("🔄 Prompt variables replaced")
    console.log("🔧 Prompt after replacement (last 500 chars):", processedPrompt.substring(processedPrompt.length - 500))
    return processedPrompt
  }
}
