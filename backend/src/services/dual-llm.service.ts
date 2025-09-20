import { MessageRepository } from "../repositories/message.repository"
import { LLMRequest } from "../types/whatsapp.types"
import { CallingFunctionsService } from "./calling-functions.service"
import { FormatterService } from "./formatter.service"
import { TranslationService } from "./translation.service"

export class DualLLMService {
  private translationService: TranslationService
  private formatterService: FormatterService
  private callingFunctionsService: CallingFunctionsService

  constructor() {
    this.translationService = new TranslationService()
    this.formatterService = new FormatterService()
    this.callingFunctionsService = new CallingFunctionsService()
  }

  async handleMessage(request: LLMRequest): Promise<any> {
    try {
      console.log(`🔄 DualLLM: Processing message: ${request.chatInput}`)

      // Step 1: LLM decides what to do - calls CF if needed (use translated query for CF detection)
      const translatedQuery = await this.translationService.translateToEnglish(
        request.chatInput
      )
      const cfResult = await this.executeCallingFunctions(
        request,
        translatedQuery
      )

      let finalResult
      let functionCalls = []

      // Step 2: If CF was called, use CF result
      if (cfResult?.success === true) {
        console.log(`🎯 DualLLM: CF was called (success=true), using CF result`)
        console.log(
          `🎯 DualLLM: CF functionCalls:`,
          JSON.stringify(cfResult.functionCalls, null, 2)
        )
        finalResult = cfResult
        functionCalls = cfResult.functionCalls
      } else {
        console.log(
          `🔍 DualLLM: No CF called - FLUSSO CORRETTO: Salvare genericReply e poi SearchRag`
        )

        // REGOLA 1: Salvare genericReply quando LLM non chiama CF
        console.log("💾 DualLLM: Generando e salvando genericReply...")
        const genericReply = await this.generateLLMResponse(
          translatedQuery,
          request.workspaceId,
          request.language || "it"
        )
        console.log(
          "✅ DualLLM: genericReply salvata:",
          genericReply.substring(0, 100) + "..."
        )

        // REGOLA 2: Eseguire SearchRag
        let searchRagResult = await this.executeSearchRagFallback(
          request,
          translatedQuery,
          { response: genericReply } // Passare la genericReply salvata
        )

        // Se SearchRag non trova nulla nemmeno in traduzione, genera LLM response
        const isEmptyResponse = (r: any) => {
          if (r == null) return true
          if (typeof r === "string") return r.trim() === ""
          // If it's an object (e.g. searchRagResult returned the whole object),
          // consider it non-empty (we will let the formatter decide how to render)
          return false
        }

        if (
          !searchRagResult.success ||
          isEmptyResponse(searchRagResult.response)
        ) {
          console.log(
            `🤖 DualLLM: SearchRag vuoto anche in traduzione, generating LLM fallback`
          )
          const llmResponse = await this.generateLLMResponse(
            translatedQuery,
            request.workspaceId,
            request.phone
          )
          finalResult = {
            success: true,
            response: llmResponse,
            functionCalls: [],
          }
        } else {
          finalResult = searchRagResult
        }

        functionCalls = finalResult.functionCalls || []
      }

      // Step 4: Formatter receives: language, discount, question, workspaceId, customerId
      // REGOLA 28, 56: Ottenere lingua dal database cliente
      const language = await this.detectLanguageFromMessage(
        request.chatInput,
        request.phone,
        request.workspaceId
      )
      const formattedResponse = await this.executeFormatter(
        request,
        finalResult,
        finalResult === cfResult ? "CF" : "SearchRag"
      )

      return {
        success: true,
        output: formattedResponse,
        translatedQuery,
        functionCalls: functionCalls,
        debugInfo: {
          stage: finalResult === cfResult ? "CF" : "SearchRag",
          success: true,
          functionCalled: finalResult === cfResult ? "CF" : "SearchRag",
          cfResult: cfResult,
          finalResult: finalResult,
        },
      }
    } catch (error) {
      console.error("❌ DualLLMService error:", error)
      return {
        success: false,
        output: "Mi dispiace, si è verificato un errore. Riprova più tardi.",
        translatedQuery: request.chatInput,
        functionCalls: [],
        debugInfo: {
          stage: "error",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }
    }
  }

  private async executeCallingFunctions(
    request: LLMRequest,
    translatedQuery: string
  ): Promise<any> {
    try {
      console.log(
        `🚨🚨🚨 DualLLM: executeCallingFunctions STARTED for: ${translatedQuery}`
      )
      console.error(
        `🚨🚨🚨 ERROR LOG: executeCallingFunctions STARTED - SHOULD BE VISIBLE`
      )

      // Step 1: Use function router to decide which CF to call
      const messageRepository = new MessageRepository()
      const functionResult =
        await messageRepository.callFunctionRouter(translatedQuery)

      console.log(
        `🚨 DualLLM: Function router result:`,
        JSON.stringify(functionResult, null, 2)
      )
      console.log(
        `🚨 DualLLM: Function name detected: "${functionResult?.function_call?.name}"`
      )

      // Step 2: If a function was selected, execute it
      if (
        functionResult?.function_call?.name &&
        functionResult.function_call.name !== "get_generic_response"
      ) {
        console.log(
          `🚨 DualLLM: Executing CF: ${functionResult.function_call.name}`
        )

        // Get customer info
        const customer = await messageRepository.findCustomerByPhone(
          request.phone,
          request.workspaceId
        )

        let cfExecutionResult

        // Execute the specific CF based on function name
        console.log(
          `🔍 DEBUG: Function name received: "${functionResult.function_call.name}"`
        )
        console.log(
          `🔍 DEBUG: Function name length: ${functionResult.function_call.name.length}`
        )
        console.log(
          `🔍 DEBUG: Function name charCodes: ${Array.from(String(functionResult.function_call.name)).map((c) => c.charCodeAt(0))}`
        )

        // Execute the specific CF based on function name
        if (functionResult.function_call.name === "search_specific_product") {
          const { SearchSpecificProduct } = await import(
            "../chatbot/calling-functions/SearchSpecificProduct"
          )

          // Sanitize product name extracted from the LLM function_call arguments.
          // Sometimes the LLM returns a full sentence like:
          // "L'utente ha richiesto informazioni su 'mozzarella'"
          // We want to extract the core product term (e.g. mozzarella) before searching.
          const rawArg =
            (functionResult.function_call.arguments &&
              (functionResult.function_call.arguments.message ||
                functionResult.function_call.arguments.productName)) ||
            ""

          const sanitizeProductName = (input: string) => {
            if (!input) return input
            let s = input.trim()

            // If there is a quoted term, prefer the quoted content
            const singleQuoteMatch =
              s.match(/'([^']+)'/) || s.match(/’([^’]+)’/)
            if (singleQuoteMatch && singleQuoteMatch[1])
              return singleQuoteMatch[1].trim()
            const doubleQuoteMatch = s.match(/"([^"]+)"/)
            if (doubleQuoteMatch && doubleQuoteMatch[1])
              return doubleQuoteMatch[1].trim()

            // Remove common verbose prefixes (Italian and English)
            const prefixes = [
              "l'utente ha richiesto informazioni su",
              "l'utente ha chiesto",
              "l'utente ha richiesto",
              "the user asked for",
              "the user requested",
              "user asked for",
              "user requested",
              "do you have",
              "do you have",
              "avete",
              "ho bisogno di",
              "sto cercando",
              "i'm looking for",
            ]

            const lower = s.toLowerCase()
            for (const p of prefixes) {
              if (lower.startsWith(p)) {
                s = s.substring(p.length).trim()
                break
              }
            }

            // Remove leading punctuation and question words
            s = s.replace(/^[:\-\s"'«»“”]+/, "")
            // If still long, take last 3 words as a heuristic
            const words = s.split(/\s+/).filter(Boolean)
            if (words.length > 4) {
              return words.slice(-3).join(" ")
            }

            return s
          }

          const cleaned = sanitizeProductName(String(rawArg))

          cfExecutionResult = await SearchSpecificProduct({
            phoneNumber: request.phone,
            workspaceId: request.workspaceId,
            customerId: customer?.id || "",
            productName:
              cleaned || functionResult.function_call.arguments.message || "",
            message: functionResult.function_call.arguments.message || "",
            language: "it",
          })
        } else {
          console.log(
            `🔧 DualLLM: Using FunctionHandlerService for function: ${functionResult.function_call.name}`
          )
          // For other functions, use FunctionHandlerService
          const { FunctionHandlerService } = await import(
            "../application/services/function-handler.service"
          )
          const functionHandler = new FunctionHandlerService()
          cfExecutionResult = await functionHandler.handleFunctionCall(
            functionResult.function_call.name,
            functionResult.function_call.arguments,
            customer,
            request.workspaceId,
            request.phone
          )
        }

        console.log(
          `🚨 DualLLM: CF execution result:`,
          JSON.stringify(cfExecutionResult, null, 2)
        )

        // CF può essere restituito in due forme:
        // 1) direttamente come oggetto/primitive (es. SearchSpecificProduct)
        // 2) incapsulato in { data: ... } quando passato tramite FunctionHandlerService
        const data = cfExecutionResult.data || cfExecutionResult

        // attach cfExecutionResult to functionResult for better debugging downstream
        const enrichedFunctionCall = {
          ...functionResult,
          result: cfExecutionResult,
        }

        // DO NOT build human-readable text here. Instead return the structured
        // data object as the `response` so the Formatter can generate the final
        // natural-language output (single source of presentation logic).
        return {
          success: true,
          response: data,
          functionCalls: [enrichedFunctionCall],
          cfExecutionResult: cfExecutionResult,
        }
      } else {
        console.log(
          `🚨 DualLLM: No specific CF selected - REGOLA 2: Salvare risposta LLM`
        )

        // REGOLA 2: Salvare risposta LLM quando non chiama funzioni
        const llmResponse = await this.generateLLMResponse(
          translatedQuery,
          request.workspaceId
        )

        return {
          success: false, // No CF called
          response: llmResponse,
          functionCalls: [],
          llmGeneratedResponse: llmResponse,
        }
      }
    } catch (error) {
      console.error("❌ Calling Functions error:", error)
      return {
        success: false,
        response: "Ciao! Come posso aiutarti oggi?",
        functionCalls: [],
      }
    }
  }

  private async executeSearchRagFallback(
    request: LLMRequest,
    translatedQuery: string,
    cfResult?: any
  ): Promise<any> {
    try {
      console.log(`🔍 DualLLM: Executing SearchRag for: ${translatedQuery}`)

      // Adaptive tuning for short queries: increase top_k and lower similarity threshold
      // Use the translatedQuery for RAG search (reverted to previous behavior)
      const isShortQuery = (str: string) => {
        if (!str) return false
        const wordCount = str.trim().split(/\s+/).length
        return wordCount <= 2 || str.trim().length <= 20
      }

      // Increase default top_k to allow more results to flow through (no hard 10 limit)
      const defaultTopK = 100
      const defaultThreshold = 0.35

      const shortQueryTopK = 200
      const shortQueryThreshold = 0.25

      const top_k = isShortQuery(translatedQuery) ? shortQueryTopK : defaultTopK
      const similarityThreshold = isShortQuery(translatedQuery)
        ? shortQueryThreshold
        : defaultThreshold

      const searchRagResult = await this.callingFunctionsService.SearchRag({
        customerId: request.customerid || "",
        workspaceId: request.workspaceId,
        // send translatedQuery (reverted)
        query: translatedQuery,
        messages: [],
        top_k,
        similarityThreshold,
      })

      console.log(`🔍 DualLLM: SearchRag result:`, searchRagResult)

      // Check what SearchRag found
      const hasFAQs =
        searchRagResult.success &&
        searchRagResult.results &&
        searchRagResult.results.faqs &&
        searchRagResult.results.faqs.length > 0

      const hasProducts =
        searchRagResult.success &&
        searchRagResult.results &&
        searchRagResult.results.products &&
        searchRagResult.results.products.length > 0

      if (!hasFAQs && !hasProducts) {
        console.log(`🔍 DualLLM: SearchRag empty, using saved response from CF`)
        return {
          success: true,
          response: cfResult?.response || "Ciao! Come posso aiutarti oggi?",
          functionCalls: cfResult?.functionCalls || [],
        }
      }

      // Per le regole architetturali: se SearchRag produce risultati (FAQ o
      // prodotti), non effettuiamo qui logica di selezione; passiamo invece
      // l'intero `searchRagResult` al Formatter, che deciderà come presentare
      // i risultati nella lingua dell'utente. Questo mantiene il Formatter
      // come unica fonte di presentazione (no branching server-side).
      return {
        success: true,
        response: searchRagResult,
        functionCalls: [
          {
            name: "SearchRag",
            functionName: "SearchRag",
            success: searchRagResult.success,
            result: searchRagResult,
            source: "SearchRag",
          },
        ],
      }
    } catch (error) {
      console.error("❌ SearchRag error:", error)
      return {
        success: true,
        response: "Ciao! Come posso aiutarti oggi?",
        functionCalls: [],
      }
    }
  }

  private async executeFormatter(
    request: LLMRequest,
    result: any,
    functionName: string
  ): Promise<string> {
    try {
      console.log(`🎨 DualLLM: Executing formatter for ${functionName}`)

      // REGOLA 28, 56: Ottenere lingua dal database cliente
      const language = await this.detectLanguageFromMessage(
        request.chatInput,
        request.phone,
        request.workspaceId
      )

      // REGOLA 9: Ottenere sconto cliente e nome per il formatter
      let customerDiscount = 0
      let customerName = "Utente"
      if (request.customerid) {
        try {
          const messageRepository = new MessageRepository()
          const customer = await messageRepository.findCustomerByPhone(
            request.phone,
            request.workspaceId
          )
          customerDiscount = customer?.discount || 0
          customerName = customer?.name || "Utente"
          console.log(
            `💰 DualLLM: Customer found: ${customerName} with ${customerDiscount}% discount`
          )
        } catch (error) {
          console.error("❌ Error getting customer info:", error)
          customerDiscount = 0
          customerName = "Utente"
        }
      }

      // Formatter receives: language, discount, question, workspaceId, customerId
      // Fix: Ensure response is a string for formatter
      let responseForFormatter = result.response
      if (typeof responseForFormatter !== "string") {
        responseForFormatter =
          typeof responseForFormatter === "object"
            ? JSON.stringify(responseForFormatter)
            : String(responseForFormatter || "")
      }

      const formattedResponse = await FormatterService.formatToMarkdown(
        responseForFormatter,
        request.chatInput || "", // question
        customerName || "Utente", // nameUser
        customerDiscount || 0, // discount
        request.customerid || "", // customerId
        request.workspaceId, // workspaceId
        language // language
      )

      console.log(`✅ DualLLM: Formatter completed for ${functionName}`)
      return formattedResponse
    } catch (error) {
      console.error(`❌ Formatter error for ${functionName}:`, error)
      return result.response || "Errore nella formattazione della risposta."
    }
  }

  private async detectLanguageFromMessage(
    message: string,
    phoneNumber?: string,
    workspaceId?: string
  ): Promise<string> {
    try {
      if (!phoneNumber || !workspaceId) {
        return "it" // Default fallback
      }

      // REGOLA 28, 56: Ottenere lingua dal database cliente
      const messageRepository = new MessageRepository()
      const customer = await messageRepository.findCustomerByPhone(
        phoneNumber,
        workspaceId
      )

      if (customer?.language) {
        console.log(
          `🌍 DualLLM: Customer language from DB: ${customer.language}`
        )
        return customer.language
      }

      // Fallback: rilevamento automatico dal messaggio
      const detectedLanguage = this.detectLanguageFromText(message)
      console.log(`🌍 DualLLM: Auto-detected language: ${detectedLanguage}`)
      return detectedLanguage
    } catch (error) {
      console.error("❌ Error detecting language:", error)
      return "it" // Default fallback
    }
  }

  private detectLanguageFromText(text: string): string {
    const lowerText = text.toLowerCase()

    // Rilevamento italiano
    if (
      lowerText.includes("ciao") ||
      lowerText.includes("grazie") ||
      lowerText.includes("per favore") ||
      lowerText.includes("prego")
    ) {
      return "it"
    }

    // Rilevamento inglese
    if (
      lowerText.includes("hello") ||
      lowerText.includes("thank you") ||
      lowerText.includes("please") ||
      lowerText.includes("hi")
    ) {
      return "en"
    }

    // Rilevamento spagnolo
    if (
      lowerText.includes("hola") ||
      lowerText.includes("gracias") ||
      lowerText.includes("por favor") ||
      lowerText.includes("adiós")
    ) {
      return "es"
    }

    // Rilevamento portoghese
    if (
      lowerText.includes("olá") ||
      lowerText.includes("obrigado") ||
      lowerText.includes("por favor") ||
      lowerText.includes("tchau")
    ) {
      return "pt"
    }

    return "it" // Default italiano
  }

  private async generateLLMResponse(
    query: string,
    workspaceId: string,
    phoneNumber?: string
  ): Promise<string> {
    try {
      console.log(`🤖 DualLLM: Generating LLM response for: ${query}`)

      // Get agent prompt from database
      const { PrismaClient } = require("@prisma/client")
      const prisma = new PrismaClient()

      const prompt = await prisma.prompts.findFirst({
        where: {
          workspaceId: workspaceId,
          name: "SofIA - Gusto Italiano Assistant",
        },
        select: {
          content: true,
        },
      })

      // REGOLA 19: LLM ha lo storico - get conversation history
      let conversationHistory = []
      if (phoneNumber) {
        const customer = await prisma.customers.findFirst({
          where: { phone: phoneNumber, workspaceId: workspaceId },
        })

        if (customer) {
          const recentMessages = await prisma.message.findMany({
            where: {
              chatSession: {
                customerId: customer.id,
                workspaceId: workspaceId,
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10, // Last 10 messages as per memory
            include: {
              chatSession: true,
            },
          })

          // Convert to conversation format (reverse to chronological order)
          conversationHistory = recentMessages.reverse().map((msg) => ({
            role: msg.direction === "INBOUND" ? "user" : "assistant",
            content: msg.content,
          }))
        }
      }

      await prisma.$disconnect()
      const agentPrompt = prompt?.content

      // Build messages with history
      const messages = [
        {
          role: "system",
          content:
            agentPrompt ||
            "You are SofIA, an Italian e-commerce assistant. Respond naturally and helpfully in Italian. Use emoji 😊 and *bold text* when appropriate.",
        },
        ...conversationHistory,
        {
          role: "user",
          content: query,
        },
      ]

      console.log(
        `🧠 DualLLM: Using ${conversationHistory.length} messages from conversation history`
      )

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3001",
            "X-Title": "ShopMe LLM Response",
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo",
            messages: messages,
            temperature: 0.3,
            max_tokens: 1500,
          }),
        }
      )

      const data = await response.json()
      const llmResponse =
        data.choices?.[0]?.message?.content || "Ciao! Come posso aiutarti oggi?"

      console.log(`✅ DualLLM: LLM response generated: ${llmResponse}`)
      return llmResponse
    } catch (error) {
      console.error("❌ Error generating LLM response:", error)
      return "Ciao! Come posso aiutarti oggi?"
    }
  }
}
