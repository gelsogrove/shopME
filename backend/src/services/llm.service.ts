import { ReplaceLinkWithToken } from "../chatbot/calling-functions/ReplaceLinkWithToken"
import { MessageRepository } from "../repositories/message.repository"
import { LLMRequest } from "../types/whatsapp.types"
import { CallingFunctionsService } from "./calling-functions.service"

export class LLMService {
  private callingFunctionsService: CallingFunctionsService

  constructor() {
    this.callingFunctionsService = new CallingFunctionsService()
  }

  async handleMessage(
    llmRequest: LLMRequest,
    customerData?: any
  ): Promise<any> {
    try {
      console.log(`🔄 LLM: Processing message: ${llmRequest.chatInput}`)

      // Step 1: LLM decides what to do - calls CF if needed (usa query originale)
      // 🚫 TRANSLATION DISABILITATO - usa query originale
      const translatedQuery = llmRequest.chatInput // Era: await this.translationService.translateToEnglish(request.chatInput)

      const cfResult = await this.executeCallingFunctions(
        llmRequest,
        translatedQuery
      )

      let finalResult
      let functionCalls = []

      // Step 2: If CF was called, use CF result
      if (cfResult?.success === true) {
        console.log(`🎯 LLM: CF was called (success=true), using CF result`)
        console.log(
          `🎯 LLM: CF functionCalls:`,
          JSON.stringify(cfResult.functionCalls, null, 2)
        )
        finalResult = cfResult
        functionCalls = cfResult.functionCalls
      } else {
        console.log(`🔍 LLM: No CF called. Generating direct LLM response.`)

        const llmResponse = await this.generateLLMResponse(
          translatedQuery,
          llmRequest.workspaceId,
          llmRequest.phone
        )
        finalResult = {
          success: true,
          response: llmResponse,
          functionCalls: [],
        }
        functionCalls = finalResult.functionCalls || []
      }

      // REGOLA 28, 56: Ottenere lingua dal database cliente
      const language = await this.detectLanguageFromMessage(
        llmRequest.chatInput,
        llmRequest.phone,
        llmRequest.workspaceId
      )

      // Estrai direttamente la risposta senza formatter
      let directResponse = finalResult.response
      if (typeof directResponse !== "string") {
        directResponse =
          typeof directResponse === "object"
            ? JSON.stringify(directResponse)
            : String(directResponse)
      }

      // 🔧 SOSTITUZIONE VARIABILI - Prima del return per evitare {{nameUser}} non sostituiti
      if (customerData) {
        directResponse = this.replaceVariables(directResponse, customerData)
      }

      // 🔗 SOSTITUZIONE LINK TOKEN
      if (llmRequest.customerid && llmRequest.workspaceId) {
        const linkResult = await ReplaceLinkWithToken(
          { response: directResponse },
          llmRequest.customerid,
          llmRequest.workspaceId
        )
        if (linkResult.success && linkResult.response) {
          directResponse = linkResult.response
        }
      }

      return {
        success: true,
        output: directResponse, // Era formattedResponse
        translatedQuery,
        functionCalls: functionCalls,
        debugInfo: {
          stage: finalResult === cfResult ? "CF" : "LLM_Only", // Era SearchRag
          success: true,
          functionCalled: finalResult === cfResult ? "CF" : "LLM_Only", // Era SearchRag
          cfResult: cfResult,
          finalResult: finalResult,
        },
      }
    } catch (error) {
      console.error("❌ DualLLMService error:", error)
      return {
        success: false,
        output: "Mi dispiace, si è verificato un errore. Riprova più tardi.",
        translatedQuery: llmRequest.chatInput,
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
        if (false) {
          // SearchSpecificProduct removed - all functions use FunctionHandlerService
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
          `🚨 DualLLM: No specific CF selected - Returning LLM response directly`
        )

        // REGOLA 2: Salvare risposta LLM quando non chiama funzioni
        const llmResponse = await this.generateLLMResponse(
          translatedQuery,
          request.workspaceId
        )

        // 🚫 SearchRag DISABILITATO - ritorna solo la risposta LLM
        return {
          success: true,
          response: llmResponse,
          functionCalls: [
            {
              name: "LLM_Only", // Era SearchRag
              arguments: { query: translatedQuery },
              result: { success: true, response: llmResponse },
            },
          ],
          llmGeneratedResponse: llmResponse,
          // searchRagResult: null, // DISABILITATO
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

    // Rilevamento italiano - parole più comuni
    if (
      lowerText.includes("ciao") ||
      lowerText.includes("grazie") ||
      lowerText.includes("per favore") ||
      lowerText.includes("prego") ||
      lowerText.includes("voglio") ||
      lowerText.includes("fare") ||
      lowerText.includes("ordine") ||
      lowerText.includes("prodotti") ||
      lowerText.includes("cosa") ||
      lowerText.includes("come") ||
      lowerText.includes("quanto") ||
      lowerText.includes("quando") ||
      lowerText.includes("dove") ||
      lowerText.includes("che") ||
      lowerText.includes("della") ||
      lowerText.includes("del") ||
      lowerText.includes("con") ||
      lowerText.includes("sono") ||
      lowerText.includes("ho") ||
      lowerText.includes("hai") ||
      lowerText.includes("può") ||
      lowerText.includes("puoi")
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
                workspaceId: workspaceId, // Using parameter workspaceId instead of request.workspaceId
              },
            },
            orderBy: { createdAt: "desc" },
            take: 5, // Last 5 messages for optimized performance
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
            model: "openai/gpt-4-mini",
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

  private replaceVariables(response: string, customerData: any): string {
    if (!response || !customerData) return response

    return response
      .replace(/\{\{nameUser\}\}/g, customerData.nameUser || "Cliente")
      .replace(
        /\{\{discountUser\}\}/g,
        customerData.discountUser || "Nessuno sconto attivo"
      )
      .replace(
        /\{\{companyName\}\}/g,
        customerData.companyName || "L'Altra Italia"
      )
      .replace(/\{\{lastordercode\}\}/g, customerData.lastordercode || "N/A")
      .replace(/\{\{languageUser\}\}/g, customerData.languageUser || "it")
  }
}
