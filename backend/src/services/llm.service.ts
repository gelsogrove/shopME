import { MessageRepository } from "../repositories/message.repository"
import { LLMRequest } from "../types/whatsapp.types"
import { CallingFunctionsService } from "./calling-functions.service"
import { PromptProcessorService } from "./prompt-processor.service"

export class LLMService {
  private callingFunctionsService: CallingFunctionsService
  private promptProcessorService: PromptProcessorService

  constructor() {
    this.callingFunctionsService = new CallingFunctionsService()
    this.promptProcessorService = new PromptProcessorService()
  }

  async handleMessage(
    llmRequest: LLMRequest,
    customerData?: any
  ): Promise<any> {
    try {
      console.log(`🔄 LLM: Processing message: ${llmRequest.chatInput}`)

      const translatedQuery = llmRequest.chatInput

      const cfResult = await this.executeCallingFunctions(
        llmRequest,
        translatedQuery
      )

      let finalResult
      let functionCalls = []

      if (cfResult?.success === true) {
        console.log(`🎯 LLM: CF was called (success=true), using CF result`)
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

      let directResponse = finalResult.response
      if (typeof directResponse !== "string") {
        directResponse =
          typeof directResponse === "object"
            ? JSON.stringify(directResponse)
            : String(directResponse)
      }

      // Post-processing della risposta
      const processedOutput =
        await this.promptProcessorService.postProcessResponse(
          directResponse,
          llmRequest.customerid,
          llmRequest.workspaceId
        )

      return {
        success: true,
        output: processedOutput,
        translatedQuery,
        functionCalls: functionCalls,
        debugInfo: {
          stage: finalResult === cfResult ? "CF" : "LLM_Only",
          success: true,
          functionCalled: finalResult === cfResult ? "CF" : "LLM_Only",
          cfResult: cfResult,
          finalResult: finalResult,
        },
      }
    } catch (error) {
      console.error("❌ LLMService error:", error)
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

  private async generateLLMResponse(
    query: string,
    workspaceId: string,
    phoneNumber?: string
  ): Promise<string> {
    try {
      console.log(`🤖 LLM: Generating LLM response for: ${query}`)

      const { PrismaClient } = require("@prisma/client")
      const prisma = new PrismaClient()

      // Recupera i dati del cliente per il pre-processing
      let customer = null
      if (phoneNumber) {
        customer = await prisma.customers.findFirst({
          where: { phone: phoneNumber, workspaceId: workspaceId },
        })
      }

      const prompt = await prisma.prompts.findFirst({
        where: {
          workspaceId: workspaceId,
          name: "SofIA - Gusto Italiano Assistant",
        },
        select: {
          content: true,
        },
      })

      // DEBUG: Se il prompt non viene trovato nel DB, carica dal file
      let promptContent = prompt?.content || ""
      if (!promptContent) {
        console.log("🔧 DEBUG: Prompt non trovato nel DB, carico da file...")
        const fs = require('fs')
        const path = require('path')
        const promptPath = path.join(process.cwd(), '..', 'docs', 'other', 'prompt_agent.md')
        try {
          promptContent = fs.readFileSync(promptPath, 'utf8')
          console.log("🔧 DEBUG: Prompt caricato da file con successo")
        } catch (error) {
          console.error("🔧 DEBUG: Errore nel caricare il prompt da file:", error.message)
        }
      }

      // Pre-processa il prompt
      const processedPromptContent =
        await this.promptProcessorService.preProcessPrompt(
          promptContent,
          workspaceId,
          customer // Passa i dati del cliente per il pre-processing
        )

      let conversationHistory = []
      if (customer) {
        const recentMessages = await prisma.message.findMany({
          where: {
            chatSession: {
              customerId: customer.id,
              workspaceId: workspaceId,
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            chatSession: true,
          },
        })

        conversationHistory = recentMessages.reverse().map((msg) => ({
          role: msg.direction === "INBOUND" ? "user" : "assistant",
          content: msg.content,
        }))
      }

      await prisma.$disconnect()

      const messages = [
        {
          role: "system",
          content:
            processedPromptContent ||
            "You are SofIA, an Italian e-commerce assistant. Respond naturally and helpfully in Italian. Use emoji 😊 and *bold text* when appropriate.",
        },
        ...conversationHistory,
        {
          role: "user",
          content: query,
        },
      ]

      console.log(
        `🧠 LLM: Using ${conversationHistory.length} messages from conversation history`
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

      console.log(`✅ LLM: LLM response generated: ${llmResponse}`)
      return llmResponse
    } catch (error) {
      console.error("❌ Error generating LLM response:", error)
      return "Ciao! Come posso aiutarti oggi?"
    }
  }
}
