import { LLMRequest, LLMResponse } from "../types/whatsapp.types"
import { CallingFunctionsService } from "./calling-functions.service"
import { FormatterService } from "./formatter.service"
import { TranslationService } from "./translation.service"

export class DualLLMService {
  private callingFunctionsService: CallingFunctionsService
  private translationService: TranslationService
  private formatterService: FormatterService

  constructor() {
    this.callingFunctionsService = new CallingFunctionsService()
    this.translationService = new TranslationService()
    this.formatterService = new FormatterService()
  }

  async processMessage(request: LLMRequest): Promise<LLMResponse> {
    try {
      // Step 1: Translate to English
      const translatedQuery = await this.translationService.translateToEnglish(request.chatInput)




      // Step 2c: Check if it's about a specific category
      const isCategoryQuery = this.isAboutCategory(translatedQuery)

      if (isCategoryQuery) {
        const categoryName = this.extractCategoryFromQuery(translatedQuery)
        
        const result = await this.callingFunctionsService.getProductsByCategory({
          customerId: request.customerid || "",
          workspaceId: request.workspaceId,
          categoryName: categoryName
        })

        if (result.success) {
          const formattedMessage = await this.executeFormatter(request, result, "GetProductsByCategory")
      
      return {
        success: true,
            output: formattedMessage || "Prodotti della categoria trovati!",
            translatedQuery,
            functionCalls: [{
              name: "GetProductsByCategory",
              functionName: "GetProductsByCategory",
              success: result.success,
              result: result,
              source: "GetProductsByCategory"
            }],
            debugInfo: {
              stage: "getProductsByCategory",
              success: true,
              functionCalled: "GetProductsByCategory"
            }
          }
        }
      }

      // Step 2d: Check if it's about operator contact
      const isOperatorQuery = this.isAboutOperator(translatedQuery)

      if (isOperatorQuery) {
        // Get customer phone number from database
        let phoneNumber = "+390212345678" // Default fallback
        try {
          const { PrismaClient } = require('@prisma/client')
          const prisma = new PrismaClient()
          
          const customer = await prisma.customers.findFirst({
            where: {
              id: request.customerid,
              workspaceId: request.workspaceId
            },
            select: {
              phoneNumber: true
            }
          })
          
          if (customer && customer.phoneNumber) {
            phoneNumber = customer.phoneNumber
          }
          
          await prisma.$disconnect()
        } catch (error) {
          console.error("❌ Error getting customer phone:", error)
        }

        const result = await this.callingFunctionsService.contactOperator({
          customerId: request.customerid || "",
          workspaceId: request.workspaceId,
          phoneNumber: phoneNumber
        })

        if (result.success) {
          const formattedMessage = await this.executeFormatter(request, result, "ContactOperator")
        
        return {
            success: true,
            output: formattedMessage || "Operatore contattato!",
            translatedQuery,
            functionCalls: [{
              name: "ContactOperator",
              functionName: "ContactOperator",
              success: result.success,
              result: result,
              source: "ContactOperator"
            }],
          debugInfo: {
              stage: "contactOperator",
              success: true,
              functionCalled: "ContactOperator"
            }
          }
        }
      }

      // Step 2e: Check if it's a cart request
      const isCartRequest = this.isCartRequest(translatedQuery)

      if (isCartRequest) {
        const result = await this.callingFunctionsService.getCartLink({
          customerId: request.customerid || "",
          workspaceId: request.workspaceId
        })

        if (result.success) {
          const formattedMessage = await this.executeFormatter(request, result, "GetCartLink")
          
          return {
            success: true,
            output: formattedMessage || "Link carrello generato!",
            translatedQuery,
            functionCalls: [{
              name: "GetCartLink",
              functionName: "GetCartLink",
              success: result.success,
              result: result,
              source: "GetCartLink"
            }],
            debugInfo: {
              stage: "getCartLink",
              success: true,
              functionCalled: "GetCartLink"
            }
          }
        }
      }

      // Step 2f: Check if it's a formatting example message
      const isFormattingExample = this.isFormattingExample(translatedQuery)

      if (isFormattingExample) {
        const language = this.detectLanguageFromMessage(request.chatInput)
        const formattingResponse = this.getFormattingExampleResponse(language)
        
        return {
          success: true,
          output: formattingResponse,
          translatedQuery,
          functionCalls: [],
          debugInfo: {
            stage: "formattingExample",
            success: true,
            reason: "formatting_example_detected"
          }
        }
      }

      // Step 2f: Check if it's about order tracking
      const isTrackingQuery = this.isAboutOrderTracking(translatedQuery)

      if (isTrackingQuery) {
        const orderCode = this.extractOrderCodeFromQuery(translatedQuery)

        const result = await this.callingFunctionsService.getShipmentTrackingLink({
          customerId: request.customerid || "",
          workspaceId: request.workspaceId,
          orderCode: orderCode || ""
        })

        if (result.success) {
          const formattedMessage = await this.executeFormatter(request, result, "GetShipmentTrackingLink")

              return {
                success: true,
            output: formattedMessage || "Link di tracking generato!",
                translatedQuery,
            functionCalls: [{
              name: "GetShipmentTrackingLink",
              functionName: "GetShipmentTrackingLink",
              success: result.success,
              result: result,
              source: "GetShipmentTrackingLink"
            }],
                debugInfo: {
              stage: "getShipmentTrackingLink",
              success: true,
              functionCalled: "GetShipmentTrackingLink"
            }
          }
        }
      }

      // Fallback: executeSearchRagFallback
      const searchRagResult = await this.executeSearchRagFallback(request, translatedQuery)

      const hasRealResults = searchRagResult.success && 
                            searchRagResult.functionCalls && 
                            searchRagResult.functionCalls.length > 0

      if (hasRealResults) {
        return searchRagResult
      }

      // Final fallback: generic response
      const language = this.detectLanguageFromMessage(request.chatInput)
      const genericOutput = this.getGenericResponse(language)

        return {
          success: true,
        output: genericOutput,
        translatedQuery,
        functionCalls: [],
        debugInfo: {
          stage: "genericResponse",
          success: true,
          reason: "no_specific_function_matched"
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

  private async executeFormatter(request: LLMRequest, result: any, functionName: string): Promise<string> {
    try {
      const language = this.detectLanguageFromMessage(request.chatInput)
      
      let formatRules = ""
      const langInfo = this.getLanguageInfo(language)

      if (functionName === "GetProductsByCategory") {
        formatRules = `FORMATTING RULES FOR CATEGORY PRODUCTS:
        - Use friendly, professional ${langInfo.lang}
        - Include relevant emoji based on category (🧀 for cheese, 🍝 for pasta, etc.)
        - List products clearly with names and prices
        - Make the response helpful and specific to the category
        - Use phrases like "Ecco i prodotti della categoria" or "Here are the category products"`
      } else if (functionName === "ContactOperator") {
        formatRules = `FORMATTING RULES FOR OPERATOR CONTACT:
        - Use friendly, professional ${langInfo.lang}
        - Include relevant emoji (👨‍💼 for operator, 📞 for contact)
        - Explain that an operator will be contacted
        - Make the response reassuring and helpful
        - Use phrases like "Un operatore ti contatterà" or "An operator will contact you"`
      } else if (functionName === "GetShipmentTrackingLink") {
        formatRules = `FORMATTING RULES FOR ORDER TRACKING:
        - Use friendly, professional ${langInfo.lang}
        - Include relevant emoji (📦 for tracking, 🔗 for links, ✅ for status)
        - Explain that the tracking link has been generated
        - Make the response helpful and reassuring
        - Use phrases like "Here's your tracking link" or "You can track your order here"`
      }

      const formattedResponse = await FormatterService.formatResponse(
        result.message || JSON.stringify(result),
        language,
        formatRules
      )

      return formattedResponse
    } catch (error) {
      console.error("❌ Formatter error:", error)
      return result.message || "Risposta formattata"
    }
  }

  private async executeSearchRagFallback(request: LLMRequest, translatedQuery: string): Promise<LLMResponse> {
    try {
      const ragResult = await this.callingFunctionsService.SearchRag({
        query: translatedQuery,
        workspaceId: request.workspaceId,
        customerId: request.customerid,
        messages: request.messages || [],
        useCartData: false,
      })

      if (ragResult.success && ragResult.results && (ragResult.results as any).results && (ragResult.results as any).results.total > 0) {
        let rawResponse = "Ho trovato queste informazioni per te."
        
        if ((ragResult.results as any).results.faqs && (ragResult.results as any).results.faqs.length > 0) {
          const topFaq = (ragResult.results as any).results.faqs[0]
          const content = topFaq.content
          
          const answerMatch = content.match(/Answer:\s*(.+)/)
          if (answerMatch) {
            rawResponse = answerMatch[1].trim()
          }
        }
        
        let formattedOutput = await FormatterService.formatResponse(
          rawResponse, 
          request.language || "it", 
          undefined, 
          request.customerid, 
          request.workspaceId, 
          request.chatInput,
          request.messages || []
        )
        

      return {
        success: true,
          output: formattedOutput,
          translatedQuery,
          functionCalls: [{
            name: "SearchRag",
            functionName: "SearchRag",
            success: ragResult.success,
            result: ragResult,
            source: "SearchRag"
          }],
          debugInfo: {
            stage: "searchRagFallback",
            success: true,
            functionCalled: "SearchRag"
          }
        }
      }

      return {
        success: false,
        output: "",
        translatedQuery,
        functionCalls: [],
        debugInfo: {
          stage: "searchRagFallback",
          success: false,
          reason: "no_results_found"
        }
      }

    } catch (error) {
      console.error("❌ SearchRag fallback error:", error)
      return {
        success: false,
        output: "",
        translatedQuery,
        functionCalls: [],
        debugInfo: {
          stage: "searchRagFallback",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      }
    }
  }




  private isAboutCategory(query: string): boolean {
    const categoryTriggers = [
      "cheese", "cheeses", "dairy", "formaggi", "latticini", "mozzarella", "burrata",
      "frozen", "surgelati", "gelati", "dolci", "ice cream", "congelati",
      "sauces", "salse", "conserve", "preserves", "condimenti", "miele", "honey",
      "spices", "spezie", "herbs", "erbe", "seasoning", "condiments", "varie"
    ]
    
    // Exclude questions about categories - these should go to SearchRag
    const categoryQuestions = [
      "che categorie", "what categories", "qué categorías", "que categorias",
      "categorie avete", "categories do you have", "categorías tienen", "categorias vocês têm"
    ]
    
    const lowerQuery = query.toLowerCase()
    
    // If it's a question about categories, don't treat it as a category request
    if (categoryQuestions.some(question => lowerQuery.includes(question.toLowerCase()))) {
      return false
    }
    
    return categoryTriggers.some(trigger => lowerQuery.includes(trigger.toLowerCase()))
  }

  private extractCategoryFromQuery(query: string): string {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes("cheese") || lowerQuery.includes("formaggi") || lowerQuery.includes("dairy") || 
        lowerQuery.includes("latticini") || lowerQuery.includes("mozzarella") || lowerQuery.includes("burrata")) {
      return "Cheeses & Dairy"
    }
    
    if (lowerQuery.includes("frozen") || lowerQuery.includes("surgelati") || lowerQuery.includes("gelati") || 
        lowerQuery.includes("ice cream") || lowerQuery.includes("congelati") || lowerQuery.includes("dolci")) {
      return "Frozen Products"
    }
    
    if (lowerQuery.includes("sauces") || lowerQuery.includes("salse") || lowerQuery.includes("conserve") || 
        lowerQuery.includes("preserves") || lowerQuery.includes("condimenti") || lowerQuery.includes("miele")) {
      return "Sauces & Preserves"
    }
    
    if (lowerQuery.includes("spices") || lowerQuery.includes("spezie") || lowerQuery.includes("herbs") || 
        lowerQuery.includes("erbe") || lowerQuery.includes("seasoning") || lowerQuery.includes("varie")) {
      return "Various & Spices"
    }
    
    return "Cheeses & Dairy" // Default fallback
  }

  private isAboutOperator(query: string): boolean {
    const operatorTriggers = [
      "operator", "operatore", "operador", "operador",
      "human", "umano", "humano", "humano",
      "assistance", "assistenza", "asistencia", "assistência",
      "help", "aiuto", "ayuda", "ajuda",
      "support", "supporto", "soporte", "suporte",
      "contact", "contatta", "contacta", "contata",
      "speak to", "parla con", "habla con", "fala com",
      "talk to", "parlare con", "hablar con", "falar com"
    ]
    
    const lowerQuery = query.toLowerCase()
    return operatorTriggers.some(trigger => lowerQuery.includes(trigger.toLowerCase()))
  }

  private isCartRequest(query: string): boolean {
    const cartTriggers = [
      "show cart", "mostra carrello", "ver carrito", "mostrar carrinho",
      "cart", "carrello", "carrito", "carrinho",
      "shopping cart", "carrello della spesa", "carrito de compras", "carrinho de compras",
      "view cart", "vedi carrello", "ver carrito", "ver carrinho",
      "my cart", "il mio carrello", "mi carrito", "meu carrinho"
    ]
    
    const lowerQuery = query.toLowerCase()
    return cartTriggers.some(trigger => lowerQuery.includes(trigger.toLowerCase()))
  }

  private isFormattingExample(query: string): boolean {
    const formattingTriggers = [
      "bold text", "italic text", "strikethrough", "monospace",
      "testo grassetto", "testo corsivo", "testo barrato", "monospazio",
      "texto en negrita", "texto en cursiva", "texto tachado", "monoespacio",
      "texto em negrito", "texto em itálico", "texto riscado", "monoespaço",
      "**bold**", "*italic*", "~~strikethrough~~", "`monospace`",
      "formattazione", "formatting", "formato", "formatação",
      "esempi", "examples", "ejemplos", "exemplos"
    ]
    
    const lowerQuery = query.toLowerCase()
    
    // Check if it contains multiple formatting examples
    const hasMultipleFormatting = formattingTriggers.filter(trigger => 
      lowerQuery.includes(trigger.toLowerCase())
    ).length >= 2
    
    // Check if it's clearly a formatting example (contains "offriamo" + formatting terms)
    const isServiceExample = lowerQuery.includes("offriamo") && 
                            lowerQuery.includes("servizi") && 
                            hasMultipleFormatting
    
    return isServiceExample || hasMultipleFormatting
  }

  private isAboutOrderTracking(query: string): boolean {
    const trackingTriggers = [
      "dove è il mio ordine", "where is my order", "dónde está mi pedido", "onde está meu pedido",
      "tracking ordine", "order tracking", "seguimiento pedido", "rastreamento pedido",
      "stato ordine", "order status", "estado pedido", "status pedido",
      "dove si trova il mio ordine", "where is my order located", "dónde se encuentra mi pedido", "onde está localizado meu pedido",
      "tracciamento ordine", "track my order", "rastrear pedido", "rastrear pedido",
      "track ordine", "track order", "rastrear pedido", "rastrear pedido"
    ]
    return trackingTriggers.some(trigger =>
      query.toLowerCase().includes(trigger.toLowerCase())
    )
  }

  private extractOrderCodeFromQuery(query: string): string {
    const patterns = [
      /ORD-\d+-\d+/gi,
      /ordine\s+(\d+)/gi,
      /order\s+(\d+)/gi,
      /(\d{8,})/g,
      /(\d{4,})/g
    ]

    for (const pattern of patterns) {
      const match = query.match(pattern)
      if (match) {
        return match[0].trim()
      }
    }

    return ""
  }

  private detectLanguageFromMessage(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    // Enhanced Italian keywords including common question words and verbs
    const italianKeywords = [
      "ciao", "grazie", "prego", "buongiorno", "buonasera", "arrivederci", "per favore", "scusi", "mi dispiace",
      "come", "dove", "quando", "perché", "che", "quale", "quanto", "chi", "cosa", "quali", "quante",
      "avete", "avete", "offrite", "gestite", "politica", "res", "sconto", "prodotti", "servizi", "categorie",
      "ordine", "ordini", "carrello", "fattura", "catalogo", "mozzarella", "operatore", "parlare"
    ]
    const englishKeywords = ["hello", "hi", "thanks", "thank you", "please", "good morning", "good evening", "goodbye", "how", "where", "when", "why", "what", "which", "how much", "who", "have", "offer", "manage", "policy", "return", "discount", "products", "services", "categories", "order", "orders", "cart", "invoice", "catalog", "mozzarella", "operator", "speak"]
    const spanishKeywords = ["hola", "gracias", "por favor", "buenos días", "buenas tardes", "adiós", "cómo", "dónde", "cuándo", "por qué", "qué", "cuál", "cuánto", "quién", "tienen", "ofrecen", "gestionan", "política", "devolución", "descuento", "productos", "servicios", "categorías", "pedido", "pedidos", "carrito", "factura", "catálogo", "mozzarella", "operador", "hablar"]
    const portugueseKeywords = ["olá", "obrigado", "obrigada", "por favor", "bom dia", "boa tarde", "tchau", "como", "onde", "quando", "por que", "o que", "qual", "quanto", "quem", "têm", "oferecem", "gerenciam", "política", "devolução", "desconto", "produtos", "serviços", "categorias", "pedido", "pedidos", "carrinho", "fatura", "catálogo", "mozzarella", "operador", "falar"]
    
    // Count matches for each language
    const italianMatches = italianKeywords.filter(keyword => lowerMessage.includes(keyword)).length
    const englishMatches = englishKeywords.filter(keyword => lowerMessage.includes(keyword)).length
    const spanishMatches = spanishKeywords.filter(keyword => lowerMessage.includes(keyword)).length
    const portugueseMatches = portugueseKeywords.filter(keyword => lowerMessage.includes(keyword)).length
    
    // Return language with most matches, default to Italian if no clear winner
    const maxMatches = Math.max(italianMatches, englishMatches, spanishMatches, portugueseMatches)
    
    if (maxMatches === 0) return "it" // Default to Italian
    
    if (italianMatches === maxMatches) return "it"
    if (englishMatches === maxMatches) return "en"
    if (spanishMatches === maxMatches) return "es"
    if (portugueseMatches === maxMatches) return "pt"
    
    return "it" // Default to Italian
  }

  private getFormattingExampleResponse(language: string): string {
    const responses = {
      it: "Perfetto! Ecco come funziona la formattazione WhatsApp:\n\n*Testo grassetto* per informazioni importanti\n_Testo corsivo_ per enfasi\n~Testo barrato~ per prezzi scontati\n`Monospace` per codici/ID\n\n🛒✨",
      en: "Perfect! Here's how WhatsApp formatting works:\n\n*Bold text* for important information\n_Italic text_ for emphasis\n~Strikethrough~ for discounted prices\n`Monospace` for codes/IDs\n\n🛒✨",
      es: "¡Perfecto! Así funciona el formato de WhatsApp:\n\n*Texto en negrita* para información importante\n_Texto en cursiva_ para énfasis\n~Texto tachado~ para precios con descuento\n`Monospace` para códigos/IDs\n\n🛒✨",
      pt: "Perfeito! Assim funciona a formatação do WhatsApp:\n\n*Texto em negrito* para informações importantes\n_Texto em itálico_ para ênfase\n~Texto riscado~ para preços com desconto\n`Monospace` para códigos/IDs\n\n🛒✨"
    }
    return responses[language] || responses.it
  }

  private getGenericResponse(language: string): string {
    const responses = {
      it: "Ciao! Non ho trovato questa informazione, posso aiutarti con qualcosa d'altro?",
      en: "Hello! I couldn't find this information, can I help you with something else?",
      es: "¡Hola! No pude encontrar esta información, ¿puedo ayudarte con algo más?",
      pt: "Olá! Não consegui encontrar esta informação, posso ajudá-lo com algo mais?"
    }
    return responses[language] || responses.it
  }

  private getLanguageInfo(language: string): { lang: string, name: string } {
    const langMap = {
      "it": { lang: "Italian", name: "italiano" },
      "en": { lang: "English", name: "english" },
      "es": { lang: "Spanish", name: "español" },
      "pt": { lang: "Portuguese", name: "português" }
    }
    return langMap[language] || langMap["it"]
  }
}