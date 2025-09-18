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

      // Step 3: If CF was called, use CF result. Otherwise REGOLA 2: salva LLM e chiama SearchRag
      if (cfResult?.success === true) {
        console.log(`🎯 DualLLM: CF was called (success=true), using CF result`)
        console.log(`🎯 DualLLM: CF functionCalls:`, JSON.stringify(cfResult.functionCalls, null, 2))
        finalResult = cfResult
        functionCalls = cfResult.functionCalls
      } else {
        console.log(`🔍 DualLLM: No CF called (success=false) - REGOLA 2: Salva LLM response e chiama SearchRag`)
        
        // REGOLA 2: Prima genera e salva la risposta dell'LLM (con storico)
        const llmResponse = await this.generateLLMResponse(translatedQuery, request.workspaceId, request.phone)
        console.log(`🤖 DualLLM: LLM response saved: ${llmResponse.substring(0, 100)}...`)
        
        // Poi chiama SearchRag con la risposta LLM salvata
        const searchRagResult = await this.executeSearchRagFallback(request, translatedQuery, { response: llmResponse })
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
      console.log(`🚨🚨🚨 DualLLM: executeCallingFunctions STARTED for: ${translatedQuery}`)
      console.error(`🚨🚨🚨 ERROR LOG: executeCallingFunctions STARTED - SHOULD BE VISIBLE`)
      
      // Step 1: Use function router to decide which CF to call
      const messageRepository = new MessageRepository()
      const functionResult = await messageRepository.callFunctionRouter(translatedQuery)
      
      console.log(`🚨 DualLLM: Function router result:`, JSON.stringify(functionResult, null, 2))
      console.log(`🚨 DualLLM: Function name detected: "${functionResult?.function_call?.name}"`)
      
      // Step 2: If a function was selected, execute it
      if (functionResult?.function_call?.name && functionResult.function_call.name !== 'get_generic_response') {
        console.log(`🚨 DualLLM: Executing CF: ${functionResult.function_call.name}`)
        
        // Get customer info
        const customer = await messageRepository.findCustomerByPhone(request.phone, request.workspaceId)
        
        let cfExecutionResult
        
        // Execute the specific CF based on function name
        console.log(`🔍 DEBUG: Function name received: "${functionResult.function_call.name}"`)
        console.log(`🔍 DEBUG: Function name length: ${functionResult.function_call.name.length}`)
        console.log(`🔍 DEBUG: Function name charCodes: ${Array.from(String(functionResult.function_call.name)).map(c => c.charCodeAt(0))}`)
        
        // PRIORITY CHECK: get_all_categories FIRST - FIX CONFRONTO
        const functionName = String(functionResult.function_call.name).trim().toLowerCase()
        console.log(`🔧 DEBUG: Cleaned function name: "${functionName}"`)
        console.log(`🔧 DEBUG: Checking if "${functionName}" === "get_all_categories": ${functionName === 'get_all_categories'}`)
        console.log(`🔧 DEBUG: Checking if "${functionName}" === "get_categories": ${functionName === 'get_categories'}`)
        console.error(`🚨🚨🚨 BEFORE IF CONDITION - SHOULD ALWAYS BE VISIBLE`)
        if (functionName === 'get_all_categories' || functionName === 'get_categories' || functionName === 'getallcategories') {
          console.log(`🚨🚨🚨 DualLLM: PRIORITY - EXECUTING get_all_categories directly`)
          console.log(`🚨🚨🚨 DualLLM: THIS MESSAGE SHOULD APPEAR IN LOGS IF CODE IS EXECUTED`)
          console.error(`🚨🚨🚨 ERROR LOG: EXECUTING get_all_categories - SHOULD BE VISIBLE`)
          // Handle get_all_categories directly
          const { PrismaClient } = require('@prisma/client')
          const prisma = new PrismaClient()
          
          try {
            const categories = await prisma.categories.findMany({
              where: {
                workspaceId: request.workspaceId,
                isActive: true
              },
              select: {
                id: true,
                name: true,
                description: true
              }
            })
            
            await prisma.$disconnect()
            
            const categoryList = categories.map(cat => `- ${cat.name}`).join('\n')
            cfExecutionResult = {
              success: true,
              response: `Ecco le nostre categorie disponibili:\n\n${categoryList}\n\nPosso aiutarti a trovare prodotti specifici in una di queste categorie!`,
              data: categories
            }
          } catch (error) {
            await prisma.$disconnect()
            cfExecutionResult = {
              success: false,
              response: "Mi dispiace, al momento non riesco a recuperare le categorie. Riprova più tardi.",
              error: error.message
            }
          }
        } else if (functionResult.function_call.name === 'search_specific_product') {
          const { SearchSpecificProduct } = await import('../chatbot/calling-functions/SearchSpecificProduct')
          cfExecutionResult = await SearchSpecificProduct({
            phoneNumber: request.phone,
            workspaceId: request.workspaceId,
            customerId: customer?.id || '',
            productName: functionResult.function_call.arguments.message || '',
            message: functionResult.function_call.arguments.message || '',
            language: 'it'
          })
        } else if (functionResult.function_call.name === 'get_all_products') {
          const { GetAllProducts } = await import('../chatbot/calling-functions/GetAllProducts')
          cfExecutionResult = await GetAllProducts({
            phoneNumber: request.phone,
            workspaceId: request.workspaceId,
            customerId: customer?.id || '',
            message: translatedQuery,
            language: 'it'
          })
        } else {
          console.log(`🔧 DualLLM: Using FunctionHandlerService for function: ${functionResult.function_call.name}`)
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
        console.log(`🚨 DualLLM: No specific CF selected - REGOLA 2: Salvare risposta LLM`)
        
        // REGOLA 2: Salvare risposta LLM quando non chiama funzioni
        const llmResponse = await this.generateLLMResponse(translatedQuery, request.workspaceId)
        
        return {
          success: false, // No CF called
          response: llmResponse,
          functionCalls: [],
          llmGeneratedResponse: llmResponse
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
      
      let faqAnswer = searchRagResult.data.results.faqs?.[0]?.answer || "Ciao! Come posso aiutarti oggi?"
      
      // REGOLA 10: Replace variabili PRIMA di inviare al modello
      if (faqAnswer.includes('[') && faqAnswer.includes(']')) {
        console.log(`🔧 DualLLM: REGOLA 10 - Replace variabili in FAQ: ${faqAnswer.substring(0, 100)}...`)
        
        try {
          const { ReplaceLinkWithToken } = await import('../chatbot/calling-functions/ReplaceLinkWithToken')
          const replaceResult = await ReplaceLinkWithToken(
            { response: faqAnswer },
            request.customerid || "",
            request.workspaceId
          )
          
          if (replaceResult.success && replaceResult.response) {
            faqAnswer = replaceResult.response
            console.log(`✅ DualLLM: Variables replaced: ${faqAnswer.substring(0, 100)}...`)
          }
        } catch (error) {
          console.error('❌ Error replacing variables in FAQ:', error)
        }
      }

      return {
        success: true,
        response: faqAnswer,
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
      
      // REGOLA 9: Ottenere sconto cliente per il formatter
      let customerDiscount = 0
      if (request.customerid) {
        try {
          const messageRepository = new MessageRepository()
          const customer = await messageRepository.findCustomerByPhone(request.phone, request.workspaceId)
          customerDiscount = customer?.discount || 0
          console.log(`💰 DualLLM: Customer discount found: ${customerDiscount}%`)
        } catch (error) {
          console.error('❌ Error getting customer discount:', error)
          customerDiscount = 0
        }
      }
      
      // Formatter receives: language, discount, question, workspaceId, customerId
      // Fix: Ensure response is a string for formatter
      let responseForFormatter = result.response
      if (typeof responseForFormatter !== 'string') {
        responseForFormatter = typeof responseForFormatter === 'object' 
          ? JSON.stringify(responseForFormatter) 
          : String(responseForFormatter || '')
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

  private detectLanguageFromMessage(message: string, phoneNumber?: string): string {
    // Let the CF handle language detection
    return "it" // Default fallback
  }

  private async generateLLMResponse(query: string, workspaceId: string, phoneNumber?: string): Promise<string> {
    try {
      console.log(`🤖 DualLLM: Generating LLM response for: ${query}`)
      
      // Get agent prompt from database
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient()
      
      const prompt = await prisma.prompts.findFirst({
        where: {
          workspaceId: workspaceId,
          name: 'SofIA - Gusto Italiano Assistant'
        },
        select: {
          content: true
        }
      })
      
      // REGOLA 19: LLM ha lo storico - get conversation history
      let conversationHistory = []
      if (phoneNumber) {
        const customer = await prisma.customers.findFirst({
          where: { phone: phoneNumber, workspaceId: workspaceId }
        })
        
        if (customer) {
          const recentMessages = await prisma.message.findMany({
            where: {
              chatSession: {
                customerId: customer.id,
                workspaceId: workspaceId
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10, // Last 10 messages as per memory
            include: {
              chatSession: true
            }
          })
          
          // Convert to conversation format (reverse to chronological order)
          conversationHistory = recentMessages.reverse().map(msg => ({
            role: msg.direction === 'INBOUND' ? 'user' : 'assistant',
            content: msg.content
          }))
        }
      }
      
      await prisma.$disconnect()
      const agentPrompt = prompt?.content
      
      // Build messages with history
      const messages = [
        {
          role: 'system',
          content: agentPrompt || 'You are SofIA, an Italian e-commerce assistant. Respond naturally and helpfully in Italian.'
        },
        ...conversationHistory,
        {
          role: 'user',
          content: query
        }
      ]
      
      console.log(`🧠 DualLLM: Using ${conversationHistory.length} messages from conversation history`)
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'ShopMe LLM Response'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: messages,
          temperature: 0.3,
          max_tokens: 150
        })
      })
      
      const data = await response.json()
      const llmResponse = data.choices?.[0]?.message?.content || 'Ciao! Come posso aiutarti oggi?'
      
      console.log(`✅ DualLLM: LLM response generated: ${llmResponse}`)
      return llmResponse
      
    } catch (error) {
      console.error('❌ Error generating LLM response:', error)
      return 'Ciao! Come posso aiutarti oggi?'
    }
  }
}