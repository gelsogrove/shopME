import { MessageRepository } from '../repositories/message.repository'
import { LLMRequest } from '../types/whatsapp.types'
import { CallingFunctionsService } from './calling-functions.service'
import { FormatterService } from './formatter.service'
import { TranslationService } from './translation.service'

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

      // Step 1: Translate to English for processing
      const translatedQuery = await this.translationService.translateToEnglish(request.chatInput)

      // Step 2: LLM decides what to do - calls CF if needed
      const cfResult = await this.executeCallingFunctions(request, translatedQuery)

      let finalResult
      let functionCalls = []

      // Step 3: If CF was called, use CF result. Otherwise use SearchRag
      if (cfResult?.functionCalls && cfResult.functionCalls.length > 0) {
        console.log(`🎯 DualLLM: CF was called, using CF result`)
        finalResult = cfResult
        functionCalls = cfResult.functionCalls
      } else {
        console.log(`🔍 DualLLM: No CF called, using SearchRag`)
        const searchRagResult = await this.executeSearchRagFallback(request, translatedQuery, cfResult)
        finalResult = searchRagResult
        functionCalls = searchRagResult.functionCalls || []
      }

      // Step 4: Formatter receives: language, discount, question, workspaceId, customerId
      const language = this.detectLanguageFromMessage(request.chatInput, request.phone)
      const formattedResponse = await this.executeFormatter(request, finalResult, finalResult === cfResult ? "CF" : "SearchRag")
      
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
          finalResult: finalResult
        }
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
          error: error instanceof Error ? error.message : "Unknown error"
        }
      }
    }
  }

  private async executeCallingFunctions(request: LLMRequest, translatedQuery: string): Promise<any> {
    try {
      console.log(`🚨 DualLLM: executeCallingFunctions STARTED for: ${translatedQuery}`)
      
      // Step 1: Use function router to decide which CF to call
      const messageRepository = new MessageRepository()
      const functionResult = await messageRepository.callFunctionRouter(translatedQuery)
      
      console.log(`🚨 DualLLM: Function router result:`, JSON.stringify(functionResult, null, 2))
      
      // Step 2: If a function was selected, execute it
      if (functionResult?.function_call?.name && functionResult.function_call.name !== 'get_generic_response') {
        console.log(`🚨 DualLLM: Executing CF: ${functionResult.function_call.name}`)
        
        // Get customer info
        const customer = await messageRepository.findCustomerByPhone(request.phone, request.workspaceId)
        
        let cfExecutionResult
        
        // Execute the specific CF based on function name
        if (functionResult.function_call.name === 'search_specific_product') {
          const { SearchSpecificProduct } = await import('../chatbot/calling-functions/SearchSpecificProduct')
          cfExecutionResult = await SearchSpecificProduct({
            phoneNumber: request.phone,
            workspaceId: request.workspaceId,
            customerId: customer?.id || '',
            productName: functionResult.function_call.arguments.message || '',
            message: functionResult.function_call.arguments.message || '',
            language: 'it'
          })
          } else {
          // For other functions, use FunctionHandlerService
          const { FunctionHandlerService } = await import('../application/services/function-handler.service')
          const functionHandler = new FunctionHandlerService()
          cfExecutionResult = await functionHandler.handleFunctionCall(
            functionResult.function_call.name,
            functionResult.function_call.arguments,
            customer,
            request.workspaceId,
            request.phone
          )
        }
        
        console.log(`🚨 DualLLM: CF execution result:`, JSON.stringify(cfExecutionResult, null, 2))

        return {
          success: true,
          response: cfExecutionResult.response || cfExecutionResult.data || "CF executed successfully",
          functionCalls: [functionResult],
          cfExecutionResult: cfExecutionResult
        }
      } else {
        console.log(`🚨 DualLLM: No specific CF selected, using generic response`)
      return {
          success: false,
          response: "No specific function called",
          functionCalls: []
        }
      }

    } catch (error) {
      console.error("❌ Calling Functions error:", error)
      return {
        success: false,
        response: "Ciao! Come posso aiutarti oggi?",
        functionCalls: []
      }
    }
  }

  private async executeSearchRagFallback(request: LLMRequest, translatedQuery: string, cfResult?: any): Promise<any> {
    try {
      console.log(`🔍 DualLLM: Executing SearchRag for: ${translatedQuery}`)
      
      const searchRagResult = await this.callingFunctionsService.SearchRag({
        customerId: request.customerid || "",
        workspaceId: request.workspaceId,
        query: translatedQuery,
        messages: []
      })

      console.log(`🔍 DualLLM: SearchRag result:`, searchRagResult)

      // If SearchRag is empty, use saved response from CF
      if (!searchRagResult.success || !searchRagResult.data || searchRagResult.data.results.total === 0) {
        console.log(`🔍 DualLLM: SearchRag empty, using saved response from CF`)
        return {
          success: true,
          response: cfResult?.response || "Ciao! Come posso aiutarti oggi?",
          functionCalls: cfResult?.functionCalls || []
        }
      }

      // If SearchRag has results, return FAQ response
      console.log(`🔍 DualLLM: SearchRag has results, using FAQ response`)
      return {
        success: true,
        response: searchRagResult.data.results.faqs?.[0]?.answer || "Ciao! Come posso aiutarti oggi?",
        functionCalls: [{
          name: "SearchRag",
          functionName: "SearchRag",
          success: searchRagResult.success,
          result: searchRagResult,
          source: "SearchRag"
        }]
      }

    } catch (error) {
      console.error("❌ SearchRag error:", error)
      return {
        success: true,
        response: "Ciao! Come posso aiutarti oggi?",
        functionCalls: []
      }
    }
  }

  private async executeFormatter(request: LLMRequest, result: any, functionName: string): Promise<string> {
    try {
      console.log(`🎨 DualLLM: Executing formatter for ${functionName}`)
      
      const language = this.detectLanguageFromMessage(request.chatInput, request.phone)
      
      // Formatter receives: language, discount, question, workspaceId, customerId
      const formattedResponse = await FormatterService.formatResponse(
        result.response || JSON.stringify(result),
        language,
        undefined, // formatRules
        request.customerid || "",
        request.workspaceId,
        request.chatInput // originalQuestion
      )

      console.log(`✅ DualLLM: Formatter completed for ${functionName}`)
      return formattedResponse

    } catch (error) {
      console.error(`❌ Formatter error for ${functionName}:`, error)
      return result.response || "Errore nella formattazione della risposta."
    }
  }

  private detectLanguageFromMessage(message: string, phoneNumber?: string): string {
    // Let the CF handle language detection
    return "it" // Default fallback
  }

   
}