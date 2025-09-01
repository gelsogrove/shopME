import axios from "axios"
import { LLMRequest, LLMResponse } from "../types/whatsapp.types"
import { CallingFunctionsService } from "./calling-functions.service"
import { EmbeddingService } from "./embeddingService"
import { PromptTemplateService } from "./prompt-template.service"
import { ToolDescriptionsService } from "./tool-descriptions.service"
import { TranslationService } from "./translation.service"

export class DualLLMService {
  private toolDescriptionsService: ToolDescriptionsService
  private callingFunctionsService: CallingFunctionsService
  private translationService: TranslationService
  private embeddingService: EmbeddingService
  private openRouterApiKey: string
  private openRouterUrl: string
  private backendUrl: string
  private lastTranslatedQuery: string = ""
  private lastProcessedPrompt: string = ""

  constructor() {
    this.toolDescriptionsService = new ToolDescriptionsService()
    this.callingFunctionsService = new CallingFunctionsService()
    this.translationService = new TranslationService()
    this.embeddingService = new EmbeddingService()
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY || ""
    this.openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
    this.backendUrl = process.env.BACKEND_URL || "http://localhost:3001"
  }

  public async processMessage(request: LLMRequest): Promise<LLMResponse> {
    console.log("🚀🚀🚀 DUAL LLM PROCESSING STARTED 🚀🚀🚀")
    console.log("📥 Request received:", JSON.stringify(request, null, 2))

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

      // Update request with prompt for downstream processing
      requestWithPrompt = { ...request, prompt: agentPrompt }

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

    try {
      // Translate query
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

      // STAGE 1A: USA IL PROMPT DELL'AGENT DAL DB + personalizzazione cliente
      let systemMessage
      if (!request.prompt) {
        throw new Error(
          "❌ CRITICAL: No agent prompt provided in request. System must halt."
        )
      }

      if (request.customer) {
        // Usa prompt dell'agent personalizzato con dati cliente
        systemMessage = PromptTemplateService.processPromptTemplate(
          request.prompt,
          request.customer
        )
        this.lastProcessedPrompt = systemMessage
        console.log(
          "🔧 Cloud Functions: Using personalized agent prompt from DB"
        )
      } else {
        // Usa prompt dell'agent dal DB senza personalizzazione
        systemMessage = request.prompt
        this.lastProcessedPrompt = systemMessage
        console.log("🔧 Cloud Functions: Using agent prompt from DB")
      }

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
        await this.translationService.translateForSearchRag(request.chatInput)
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
${this.toolDescriptionsService
  .getToolDescriptions()
  .map((tool) => `- ${tool.name}: ${tool.description}`)
  .join("\n")}

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

      // FORMATTER USA IL SUO PROMPT MA RISPETTA LA LINGUA DEL CLIENTE
      const customerLanguage = request.customer?.language;
      console.log(`🔧 DEBUG: request.customer:`, request.customer);
      console.log(`🔧 DEBUG: customerLanguage extracted:`, customerLanguage);
      
      const systemMessage = this.buildFormatterSystemMessage(customerLanguage);
      console.log(`🌍 Formatter using language: ${customerLanguage || 'default (Italian)'}`);
      console.log(`🔧 DEBUG: Formatter system message:`, systemMessage.substring(0, 200) + '...');

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

  private buildFormatterSystemMessage(customerLanguage?: string): string {
    // Determina la lingua da usare con istruzioni MOLTO ESPLICITE
    let languageInstruction = "Use Italian language";
    if (customerLanguage) {
      switch (customerLanguage.toLowerCase()) {
        case 'en':
        case 'english':
          languageInstruction = "⚠️ CRITICAL: RESPOND ONLY IN ENGLISH. Do NOT use Italian. Every word must be in English. Do NOT mention this language rule in your response.";
          break;
        case 'es':
        case 'spanish':
          languageInstruction = "⚠️ CRITICAL: RESPOND ONLY IN SPANISH. Do NOT use Italian. Every word must be in Spanish. Do NOT mention this language rule in your response.";
          break;
        case 'fr':
        case 'french':
          languageInstruction = "⚠️ CRITICAL: RESPOND ONLY IN FRENCH. Do NOT use Italian. Every word must be in French. Do NOT mention this language rule in your response.";
          break;
        case 'de':
        case 'german':
          languageInstruction = "⚠️ CRITICAL: RESPOND ONLY IN GERMAN. Do NOT use Italian. Every word must be in German. Do NOT mention this language rule in your response.";
          break;
        default:
          languageInstruction = "Use Italian language";
      }
    }

    return `You are a helpful WhatsApp assistant for L'Altra Italia e-commerce.

MISSION: Create natural, friendly responses based on the data provided.

⚠️ LANGUAGE RULE - HIGHEST PRIORITY:
${languageInstruction}
This language rule overrides ALL other instructions.

STYLE:
- Be conversational and warm
- Keep responses concise but informative
- Use emojis appropriately
- Always be helpful and professional

CONTEXT: You receive data from either Cloud Functions or SearchRag.
- Cloud Functions: Structured data (orders, offers, contacts)
- SearchRag: Semantic search results about products/services
- No data: When no specific information is found, provide helpful guidance

IMPORTANT: When no data is found, don't just say "no data" - instead:
1. Acknowledge the user's request politely
2. Offer to help with common requests (orders, products, contact)
3. Suggest specific actions they can try
4. Include relevant emojis

Format the response naturally based on the data type and user's request.`;
  }

  private buildFormatterUserMessage(
    request: LLMRequest,
    ragResult: any
  ): string {
    const userQuery = request.chatInput
    const dataSource = ragResult.source || "unknown"
    const functionResults = ragResult.functionResults || []

    let dataContext = ""
    if (functionResults.length > 0) {
      dataContext = `Data from ${dataSource}:\n${JSON.stringify(functionResults, null, 2)}`
    } else {
      dataContext = `No specific data found for this request. 

Please provide a helpful response that:
1. Acknowledges what the user asked
2. Explains that you don't have specific information for this request
3. Offers alternative help like:
   - "i miei ordini" to see order history
   - "cosa vendete" to browse products
   - "contatti" to speak with an operator
4. Maintains a warm, helpful tone`
    }

    return `User asked: "${userQuery}"

${dataContext}

Please create a natural, helpful response in Italian.`
  }

  private buildFallbackResponse(request: LLMRequest, ragResult: any): string {
    const userQuery = request.chatInput

    if (ragResult.functionResults && ragResult.functionResults.length > 0) {
      return `Ho trovato alcune informazioni per la tua richiesta "${userQuery}". Tuttavia, si è verificato un errore nella formattazione della risposta. Ti prego di riprovare.`
    }

    return `Mi dispiace, non sono riuscito a trovare informazioni specifiche per "${userQuery}". Puoi essere più specifico o provare con una domanda diversa?`
  }

  private getRAGProcessorFunctionDefinitions(): any[] {
    return [
      {
        type: "function",
        function: {
          name: "GetOrdersListLink",
          description:
            "Get a direct link to view customer orders. Use this for any order-related requests. If user specifies an order code/number, include it in orderCode parameter.",
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
            'Get shipment tracking link for order delivery status. Use when user asks about order location, delivery status, or shipment tracking. If no orderCode provided, ask user to specify which order. Triggers: "dove è il mio ordine", "dov\'è il mio ordine", "tracking spedizione", "stato spedizione", "where is my order", "track my order".',
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
            'Get link to customer profile page for modifying personal information, address, or account details. Use when user wants to change/modify their profile, address, email, or personal data. Triggers: "modificare profilo", "cambiare indirizzo", "vedere mail", "mia mail", "change profile", "update address".',
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
          description: "Get current active offers and promotions.",
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
          description: "Get contact information and support details.",
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
            'Get all product categories overview. Use when user asks what you sell, what categories you have, or wants to see available product types. Triggers: "cosa vendete", "COS VENDETE", "che categorie avete", "what do you sell", "categories", case insensitive.',
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
            'Get complete detailed product catalog with all products, descriptions and prices. Use when user wants full product details, complete catalog, or specific product information. Triggers: "catalogo completo", "tutti i prodotti", "lista prodotti dettagliata".',
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
          description: "Get all available services.",
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
}
