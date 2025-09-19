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
          `🔍 DualLLM: No CF called - FLUSSO CORRETTO: SearchRag SOLO con traduzione inglese`
        )

        // FLUSSO CORRETTO: SearchRag SOLO con traduzione inglese
        let searchRagResult = await this.executeSearchRagFallback(
          request,
          translatedQuery,
          { response: "" }
        )

        // Se SearchRag non trova nulla nemmeno in traduzione, genera LLM response
        if (
          !searchRagResult.success ||
          !searchRagResult.response ||
          searchRagResult.response.trim() === ""
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
      const language = this.detectLanguageFromMessage(
        request.chatInput,
        request.phone
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
          cfExecutionResult = await SearchSpecificProduct({
            phoneNumber: request.phone,
            workspaceId: request.workspaceId,
            customerId: customer?.id || "",
            productName: functionResult.function_call.arguments.message || "",
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

      const searchRagResult = await this.callingFunctionsService.SearchRag({
        customerId: request.customerid || "",
        workspaceId: request.workspaceId,
        query: translatedQuery,
        messages: [],
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

      // Compare similarity scores to decide between FAQ vs Products
      const topFAQScore = hasFAQs
        ? searchRagResult.results.faqs[0]?.similarity || 0
        : 0
      const topProductScore = hasProducts
        ? searchRagResult.results.products[0]?.similarity || 0
        : 0

      console.log(
        `🔍 DualLLM: Scores - FAQ: ${topFAQScore}, Products: ${topProductScore}`
      )

      // If products have higher similarity score, format products like a list
      if (hasProducts && topProductScore > topFAQScore) {
        console.log(
          `🔍 DualLLM: Products have higher score, formatting product list`
        )

        const products = searchRagResult.results.products.slice(0, 10) // Max 10 products
        let productList = "Ecco le mozzarelle disponibili:\n\n"

        products.forEach((product) => {
          const code =
            product.content.match(/ProductCode: ([^\n]+)/)?.[1] || "N/A"
          const name =
            product.content.match(/Product: ([^\n]+)/)?.[1] ||
            product.sourceName
          const format = product.content.match(/Format: ([^\n]+)/)?.[1] || ""
          const price = product.price || "N/A"
          const originalPrice = product.originalPrice || price
          const hasDiscount = product.hasDiscount

          const formatText = format ? ` (${format})` : ""
          const priceText = hasDiscount
            ? `€${originalPrice} ~~€${price}~~`
            : `€${price}`

          productList += `• [${code}] **${name}**${formatText} - ${priceText}\n`

          // Add description if available
          const description = product.content.match(
            /Description: ([^\n]+)/
          )?.[1]
          if (description) {
            productList += `  _${description}_\n`
          }
          productList += "\n"
        })

        productList += `📦 Totale trovati: ${products.length}`

        return {
          success: true,
          response: productList,
          functionCalls: [{ name: "SearchRag", functionName: "SearchRag" }],
        }
      }

      // Otherwise use FAQ response
      console.log(`🔍 DualLLM: Using FAQ response (score: ${topFAQScore})`)

      let faqAnswer =
        searchRagResult.results.faqs[0]?.content ||
        "Ciao! Come posso aiutarti oggi?"

      // Extract answer from FAQ content (format: "Question: ...\nAnswer: ...")
      if (faqAnswer.includes("Answer: ")) {
        faqAnswer = faqAnswer.split("Answer: ")[1] || faqAnswer
      }

      // REGOLA 10: Replace variabili PRIMA di inviare al modello
      if (faqAnswer.includes("[") && faqAnswer.includes("]")) {
        console.log(
          `🔧 DualLLM: REGOLA 10 - Replace variabili in FAQ: ${faqAnswer.substring(0, 100)}...`
        )

        try {
          const { ReplaceLinkWithToken } = await import(
            "../chatbot/calling-functions/ReplaceLinkWithToken"
          )
          const replaceResult = await ReplaceLinkWithToken(
            { response: faqAnswer },
            request.customerid || "",
            request.workspaceId
          )

          if (replaceResult.success && replaceResult.response) {
            faqAnswer = replaceResult.response
            console.log(
              `✅ DualLLM: Variables replaced: ${faqAnswer.substring(0, 100)}...`
            )
          }
        } catch (error) {
          console.error("❌ Error replacing variables in FAQ:", error)
        }
      }

      return {
        success: true,
        response: faqAnswer,
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

      const language = this.detectLanguageFromMessage(
        request.chatInput,
        request.phone
      )

      // REGOLA 9: Ottenere sconto cliente per il formatter
      let customerDiscount = 0
      if (request.customerid) {
        try {
          const messageRepository = new MessageRepository()
          const customer = await messageRepository.findCustomerByPhone(
            request.phone,
            request.workspaceId
          )
          customerDiscount = customer?.discount || 0
          console.log(
            `💰 DualLLM: Customer discount found: ${customerDiscount}%`
          )
        } catch (error) {
          console.error("❌ Error getting customer discount:", error)
          customerDiscount = 0
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

      const formattedResponse = await FormatterService.formatResponse(
        responseForFormatter,
        language,
        undefined, // formatRules
        request.customerid || "",
        request.workspaceId,
        request.chatInput, // originalQuestion
        customerDiscount // REGOLA 9: Sconto cliente
      )

      console.log(`✅ DualLLM: Formatter completed for ${functionName}`)
      return formattedResponse
    } catch (error) {
      console.error(`❌ Formatter error for ${functionName}:`, error)
      return result.response || "Errore nella formattazione della risposta."
    }
  }

  private detectLanguageFromMessage(
    message: string,
    phoneNumber?: string
  ): string {
    // Let the CF handle language detection
    return "it" // Default fallback
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
            "You are SofIA, an Italian e-commerce assistant. Respond naturally and helpfully in Italian.",
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
            max_tokens: 150,
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
