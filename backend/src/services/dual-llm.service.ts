import * as fs from 'fs'
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
    console.log("🚨🚨🚨 DUAL-LLM SEMPLIFICATO - SOLO GetActiveOffers 🚨🚨🚨")
    
    try {
      // Step 1: Translate to English
      const translatedQuery = await this.translationService.translateToEnglish(request.chatInput)
      console.log(`🌐 Translated: ${request.chatInput} → ${translatedQuery}`)

      // Step 2: Check if it's about offers
      const isOffersQuery = this.isAboutOffers(translatedQuery)
      console.log(`🔍 Is about offers: ${isOffersQuery}`)

      if (isOffersQuery) {
        // Call GetActiveOffers directly
        console.log("�� Calling GetActiveOffers...")
        const result = await this.callingFunctionsService.getActiveOffers({
          customerId: request.customerid || "",
          workspaceId: request.workspaceId,
        })
        
        console.log("🚨🚨🚨 ANDREA: GetActiveOffers result:", JSON.stringify(result, null, 2))
        console.log("🚨🚨🚨 ANDREA: GetActiveOffers result.message:", result.message)
        console.log("🚨🚨🚨 ANDREA: GetActiveOffers result.success:", result.success)
        
        // Log to file for MCP
        const logMessage = `[${new Date().toISOString()}] 🚨🚨🚨 ANDREA: GetActiveOffers result: ${JSON.stringify(result, null, 2)}\n`
        fs.appendFileSync('/tmp/shopme-server.log', logMessage)

        if (result.success) {
          // Step 3: Format the response with FormatterService LLM
          console.log("🎨 Formatting GetActiveOffers response with FormatterService LLM...")
          const formattedMessage = await this.executeFormatter(request, result, "GetActiveOffers")

          return {
          success: true,
            output: formattedMessage || "Offerte trovate!",
            translatedQuery,
            functionCalls: [{
              name: "GetActiveOffers",
              functionName: "GetActiveOffers", 
              success: result.success,
              result: result,
              source: "GetActiveOffers"
            }],
            debugInfo: {
              stage: "getActiveOffers",
            success: true,
              functionCalled: "GetActiveOffers"
            }
          }
        }
      }

      // Step 2b: Check if user wants to contact operator (PRIORITÀ ALTA!)
      const isOperatorQuery = this.isAboutOperator(translatedQuery)
      console.log(`🔍 Is about operator: ${isOperatorQuery}`)

      if (isOperatorQuery) {
        // Call ContactOperator directly
        console.log("📞 Calling ContactOperator...")
        const result = await this.callingFunctionsService.contactOperator({
          customerId: request.customerid || "",
          workspaceId: request.workspaceId,
          phoneNumber: request.phone || ""
        })
        
        console.log("🚨🚨🚨 ANDREA: ContactOperator result:", JSON.stringify(result, null, 2))
        
        // Log to file for MCP
        const logMessage6 = `[${new Date().toISOString()}] 🚨🚨🚨 ANDREA: ContactOperator result: ${JSON.stringify(result, null, 2)}\n`
        fs.appendFileSync('/tmp/shopme-server.log', logMessage6)

        return {
          success: true,
          output: result.message || "Certo, verrà contattato il prima possibile dal nostro operatore.",
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

      // Step 2c: Check if it's about categories list (PRIMA DI category specifiche!)
      const isCategoriesQuery = this.isAboutCategories(translatedQuery)
      console.log(`🔍 Is about categories: ${isCategoriesQuery}`)

      if (isCategoriesQuery) {
        // Call GetAllCategories directly
        console.log("📂 Calling GetAllCategories...")
        const result = await this.callingFunctionsService.getAllCategories({
          customerId: request.customerid || "",
          workspaceId: request.workspaceId,
        })
        
        console.log("🚨🚨🚨 ANDREA: GetAllCategories result:", JSON.stringify(result, null, 2))
        
        // Log to file for MCP
        const logMessage5 = `[${new Date().toISOString()}] 🚨🚨🚨 ANDREA: GetAllCategories result: ${JSON.stringify(result, null, 2)}\n`
        fs.appendFileSync('/tmp/shopme-server.log', logMessage5)

        if (result.success) {
          // Step 3: Format the response with FormatterService LLM
          console.log("🎨 Formatting GetAllCategories response with FormatterService LLM...")
          const formattedMessage = await this.executeFormatter(request, result, "GetAllCategories")

              return {
                success: true,
            output: formattedMessage || "Categorie trovate!",
                translatedQuery,
            functionCalls: [{
              name: "GetAllCategories",
              functionName: "GetAllCategories",
              success: result.success,
              result: result,
              source: "GetAllCategories"
            }],
                debugInfo: {
              stage: "getAllCategories",
              success: true,
              functionCalled: "GetAllCategories"
            }
          }
        }
      }

      // Step 2c: Check if it's about specific category products (DOPO categories generali!)
      const isCategoryQuery = this.isAboutCategory(translatedQuery)
      console.log(`🔍 Is about category: ${isCategoryQuery}`)

      if (isCategoryQuery) {
        // Call GetProductsByCategory directly
        console.log("📦 Calling GetProductsByCategory...")
        
        // Extract category from query (simplified approach)
        const categoryName = this.extractCategoryFromQuery(translatedQuery)
        console.log(`🏷️ Extracted category: ${categoryName}`)
        
        const result = await this.callingFunctionsService.getProductsByCategory({
          customerId: request.customerid || "",
          workspaceId: request.workspaceId,
          categoryName: categoryName
        })
        
        console.log("🚨🚨🚨 ANDREA: GetProductsByCategory result:", JSON.stringify(result, null, 2))
        
        // Log to file for MCP
        const logMessage3 = `[${new Date().toISOString()}] 🚨🚨🚨 ANDREA: GetProductsByCategory result: ${JSON.stringify(result, null, 2)}\n`
        fs.appendFileSync('/tmp/shopme-server.log', logMessage3)

        if (result.success) {
          // Step 3: Format the response with FormatterService LLM
          console.log("🎨 Formatting GetProductsByCategory response with FormatterService LLM...")
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

      // Step 2c: Check if it's about products (DOPO category specifiche!)
      const isProductsQuery = this.isAboutProducts(translatedQuery)
      console.log(`🔍 Is about products: ${isProductsQuery}`)

      // CRITICAL TRIGGERS FORCING - Memory Bank Rule
      const criticalProductTriggers = ["cosa vendete", "che prodotti avete", "what do you sell", "what products do you have"]
      const isCriticalProductTrigger = criticalProductTriggers.some(trigger => 
        translatedQuery.toLowerCase().includes(trigger.toLowerCase())
      )
      
      if (isCriticalProductTrigger) {
        console.log(`🚨 CRITICAL PRODUCT TRIGGER DETECTED: "${translatedQuery}" - Forcing GetAllProducts() call`)
      }

      if (isProductsQuery || isCriticalProductTrigger) {
        // Call GetAllProducts directly
        console.log("🛍️ Calling GetAllProducts...")
        const result = await this.callingFunctionsService.getAllProducts({
          customerId: request.customerid || "",
          workspaceId: request.workspaceId,
        })
        
        console.log("🚨🚨🚨 ANDREA: GetAllProducts result:", JSON.stringify(result, null, 2))
        
        // Log to file for MCP
        const logMessage2 = `[${new Date().toISOString()}] 🚨🚨🚨 ANDREA: GetAllProducts result: ${JSON.stringify(result, null, 2)}\n`
        fs.appendFileSync('/tmp/shopme-server.log', logMessage2)

        if (result.success) {
          // Step 3: Format the response with FormatterService LLM
          console.log("🎨 Formatting GetAllProducts response with FormatterService LLM...")
          const formattedMessage = await this.executeFormatter(request, result, "GetAllProducts")
      
      return {
            success: true,
            output: formattedMessage || "Prodotti trovati!",
            translatedQuery,
            functionCalls: [{
              name: "GetAllProducts",
              functionName: "GetAllProducts",
              success: result.success,
              result: result,
              source: "GetAllProducts"
            }],
            debugInfo: {
              stage: "getAllProducts",
              success: true,
              functionCalled: "GetAllProducts"
            }
          }
        }
      }

      // Fallback: executeSearchRagFallback
      console.log("❌ No CF called - Trying SearchRag fallback...")
      
      // Log to file for MCP
      const logFallback = `[${new Date().toISOString()}] 🚨🚨🚨 ANDREA: Trying SearchRag fallback for query: "${translatedQuery}"\n`
      fs.appendFileSync('/tmp/shopme-server.log', logFallback)
      
      const searchRagResult = await this.executeSearchRagFallback(request, translatedQuery)
      
      // Check if SearchRag actually found meaningful results
      const hasRealResults = searchRagResult.success && 
                            searchRagResult.functionCalls && 
                            searchRagResult.functionCalls.length > 0
      
      console.log(`🔍 SearchRag check - success: ${searchRagResult.success}, hasFunctionCalls: ${searchRagResult.functionCalls?.length > 0}, hasRealResults: ${hasRealResults}`)
      
      // Log to file for MCP
      const logCheck = `[${new Date().toISOString()}] 🚨🚨🚨 ANDREA: SearchRag check - success: ${searchRagResult.success}, hasFunctionCalls: ${searchRagResult.functionCalls?.length > 0}, hasRealResults: ${hasRealResults}\n`
      fs.appendFileSync('/tmp/shopme-server.log', logCheck)
      
      if (hasRealResults) {
        console.log("✅ SearchRag fallback found results")
        return searchRagResult
      }

      // Final fallback: generic response
      console.log("❌ SearchRag fallback found nothing - Generic response")
      
      // Check if it's a bot identity query
      const isBotIdentityQuery = this.isAboutBotIdentity(translatedQuery)
      let genericOutput = "Ciao! Come posso aiutarti oggi? 😊"
      
      if (isBotIdentityQuery) {
        // Detect user language from original message
        const originalMessage = request.chatInput || ""
        const language = this.detectLanguageFromMessage(originalMessage)
        genericOutput = this.getBotIdentityResponse(language)
        console.log(`🤖 Bot identity query detected - Language: ${language}`)
      }

      return {
        success: true,
        output: genericOutput,
        translatedQuery,
        functionCalls: [],
        debugInfo: {
          stage: "generic",
          success: true,
          reason: isBotIdentityQuery ? "bot_identity_response" : "no_cf_called_and_no_searchrag_results"
        }
      }

    } catch (error) {
      console.error("❌ DualLLM Error:", error)
      return {
        success: false,
        output: "Mi dispiace, si è verificato un errore.",
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

  private isAboutOffers(query: string): boolean {
    const offersTriggers = [
      "offers", "ofertas", "offerte", "sconti", "discounts", 
      "promociones", "promozioni", "promotions", "saldi", 
      "sales", "deals", "show me offers"
    ]
    
    const lowerQuery = query.toLowerCase()
    return offersTriggers.some(trigger => lowerQuery.includes(trigger.toLowerCase()))
  }

  private isAboutProducts(query: string): boolean {
    const productsTriggers = [
      "products", "productos", "prodotti", "produits", "what do you have", 
      "che prodotti", "que productos", "what products", "show me products",
      "catalog", "catalogo", "catálogo", "catalogue", "inventory", "inventario"
    ]
    
    const lowerQuery = query.toLowerCase()
    return productsTriggers.some(trigger => lowerQuery.includes(trigger.toLowerCase()))
  }

  private isAboutCategories(query: string): boolean {
    const categoriesTriggers = [
      "categories", "categorias", "categorie", "catégories",
      "che categorie", "quali categorie", "tipi di prodotti", "che tipi di prodotti",
      "categorie disponibili", "categorie prodotti", "lista categorie",
      "fammi vedere le categorie", "mostrami le categorie", "dammi le categorie",
      "show me categories", "what categories", "product categories",
      "categorías disponibles", "qué categorías tienen", "mostrar categorías"
    ]
    
    const lowerQuery = query.toLowerCase()
    return categoriesTriggers.some(trigger => lowerQuery.includes(trigger.toLowerCase()))
  }

  private isAboutCategory(query: string): boolean {
    const categoryTriggers = [
      "cheese", "cheeses", "dairy", "formaggi", "latticini", "mozzarella", "burrata",
      "frozen", "surgelati", "gelati", "dolci", "ice cream", "congelati",
      "sauces", "salse", "conserve", "preserves", "condimenti", "miele", "honey",
      "spices", "spezie", "herbs", "erbe", "seasoning", "condiments", "varie",
      "category", "categoria", "categorie", "categories"
    ]
    
    const lowerQuery = query.toLowerCase()
    return categoryTriggers.some(trigger => lowerQuery.includes(trigger.toLowerCase()))
  }

  private extractCategoryFromQuery(query: string): string {
    const lowerQuery = query.toLowerCase()
    
    // Map keywords to category names
    if (lowerQuery.includes("cheese") || lowerQuery.includes("formaggi") || lowerQuery.includes("dairy") || 
        lowerQuery.includes("latticini") || lowerQuery.includes("mozzarella") || lowerQuery.includes("burrata")) {
      return "Cheeses & Dairy"
    }
    
    if (lowerQuery.includes("frozen") || lowerQuery.includes("surgelati") || lowerQuery.includes("gelati") || 
        lowerQuery.includes("ice cream") || lowerQuery.includes("congelati") || lowerQuery.includes("dolci")) {
      return "Frozen Products"
    }
    
    if (lowerQuery.includes("sauce") || lowerQuery.includes("salse") || lowerQuery.includes("conserve") || 
        lowerQuery.includes("preserve") || lowerQuery.includes("miele") || lowerQuery.includes("honey")) {
      return "Sauces & Preserves"
    }
    
    if (lowerQuery.includes("spice") || lowerQuery.includes("spezie") || lowerQuery.includes("herb") || 
        lowerQuery.includes("erbe") || lowerQuery.includes("seasoning") || lowerQuery.includes("varie")) {
      return "Various & Spices"
    }
    
    // Default fallback
    return "Cheeses & Dairy"
  }

  private isAboutBotIdentity(query: string): boolean {
    const identityTriggers = [
      "chi sei", "who are you", "quién eres", "quem você é",
      "what are you", "cosa sei", "qué eres", "o que você é",
      "tell me about yourself", "dimmi di te", "háblame de ti", "fale sobre você"
    ]
    return identityTriggers.some(trigger =>
      query.toLowerCase().includes(trigger.toLowerCase())
    )
  }


  private detectLanguageFromMessage(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes("chi sei") || lowerMessage.includes("cosa sei") || lowerMessage.includes("dimmi di te")) {
      return "it"
    } else if (lowerMessage.includes("quién eres") || lowerMessage.includes("qué eres") || lowerMessage.includes("háblame de ti")) {
      return "es"  
    } else if (lowerMessage.includes("quem você é") || lowerMessage.includes("o que você é") || lowerMessage.includes("fale sobre")) {
      return "pt"
    } else if (lowerMessage.includes("who are you") || lowerMessage.includes("what are you") || lowerMessage.includes("tell me about")) {
      return "en"
    }
    
    return "it" // Default to Italian
  }

  private getBotIdentityResponse(language: string): string {
    const responses = {
      it: "Ciao! 👋 Sono l'assistente virtuale di L'Altra Italia, il tuo negozio specializzato in prodotti italiani di alta qualità! 🇮🇹\n\nSono qui per aiutarti a:\n• 🛍️ Scoprire i nostri prodotti\n• 🎉 Trovare le migliori offerte\n• 📦 Gestire i tuoi ordini\n• ❓ Rispondere alle tue domande\n\nCome posso aiutarti oggi? 😊",
      en: "Hello! 👋 I'm the virtual assistant for L'Altra Italia, your shop specialized in high-quality Italian products! 🇮🇹\n\nI'm here to help you:\n• 🛍️ Discover our products\n• 🎉 Find the best offers\n• 📦 Manage your orders\n• ❓ Answer your questions\n\nHow can I help you today? 😊",
      es: "¡Hola! 👋 Soy el asistente virtual de L'Altra Italia, tu tienda especializada en productos italianos de alta calidad! 🇮🇹\n\nEstoy aquí para ayudarte a:\n• 🛍️ Descubrir nuestros productos\n• 🎉 Encontrar las mejores ofertas\n• 📦 Gestionar tus pedidos\n• ❓ Responder tus preguntas\n\n¿Cómo puedo ayudarte hoy? 😊",
      pt: "Olá! 👋 Sou o assistente virtual da L'Altra Italia, sua loja especializada em produtos italianos de alta qualidade! 🇮🇹\n\nEstou aqui para ajudá-lo a:\n• 🛍️ Descobrir nossos produtos\n• 🎉 Encontrar as melhores ofertas\n• 📦 Gerenciar seus pedidos\n• ❓ Responder suas perguntas\n\nComo posso ajudá-lo hoje? 😊"
    }
    
    return responses[language] || responses.it
  }

  private async executeFormatter(request: LLMRequest, ragResult: any, functionName: string = "GetActiveOffers"): Promise<string> {
    try {
      console.log("🎨 Stage 2: Formatter - Natural Response Generation")
      console.log(`🌍 User language: ${request.language || "it"} (detected from request)`)
      
      const axios = require('axios')
      const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
      const openRouterApiKey = process.env.OPENROUTER_API_KEY

      // Build formatter system message based on user language
      const userLanguage = request.language || "it"
      const languageMap = {
        "it": { name: "Italian", lang: "Italian" },
        "en": { name: "English", lang: "English" },
        "es": { name: "Spanish", lang: "Spanish" },
        "pt": { name: "Portuguese", lang: "Portuguese" }
      }
      const langInfo = languageMap[userLanguage] || languageMap["it"]

      // Build context-specific formatting rules
      let formatRules = ""
      
      if (functionName === "GetAllProducts") {
        formatRules = `FORMATTING RULES FOR PRODUCTS:
- Use friendly, professional ${langInfo.lang}
- Include relevant emoji (🛍️ for products, 🧀 for categories, 📦 for inventory)
- Show product categories clearly with icons and product counts
- Format as: • 🧀 Category Name (X products)
- Always ask which category interests them
- Make the response engaging and helpful

When showing product categories, format them clearly and ask for user preference.`
      } else if (functionName === "GetProductsByCategory") {
        formatRules = `FORMATTING RULES FOR CATEGORY PRODUCTS:
- Use friendly, professional ${langInfo.lang}
- Include relevant emoji (🛍️ for products, 📦 for items, 💰 for prices)
- Show ALL products in the category with ProductCode, name, format and price
- Format as: • [CODE] - Product Name (Format) - €price
- NEVER summarize or abbreviate the product list
- Show EVERY SINGLE product with complete details
- Make the response comprehensive and detailed

When showing category products, display the complete list without omissions.`
      } else if (functionName === "GetAllCategories") {
        formatRules = `FORMATTING RULES FOR CATEGORIES:
- Use friendly, professional ${langInfo.lang}
- Include relevant emoji (📂 for categories, 🧀 🧊 🍯 🌿 from data)
- Show ALL categories with name and description
- Format as: • 🧀 Category Name - Description
- Include product counts if available
- Make the response engaging and informative
- End with question asking which category interests them

When showing categories, make them sound appealing and highlight their unique characteristics.`
      } else {
        formatRules = `FORMATTING RULES FOR OFFERS:
- Use friendly, professional ${langInfo.lang}
- Include relevant emoji (🎉 for offers, 💰 for discounts, 📅 for dates)
- Format offers clearly with name, discount percentage, and validity
- Make the response engaging and encourage action

If showing offers, format each offer appropriately for ${langInfo.lang} speakers.`
      }

      const systemMessage = `You are a helpful ${langInfo.name} e-commerce assistant for ShopMe. 
Format the following data into a natural, conversational response in ${langInfo.lang}.

${formatRules}

End with an encouraging call to action in ${langInfo.lang}.`

      // Build user message with the data
      const userMessage = `User asked: "${request.chatInput}"
User language: ${userLanguage}
Function called: ${functionName}
Result data: ${JSON.stringify(ragResult, null, 2)}

Format this into a natural ${langInfo.lang} response for the user.`

      const response = await axios.post(
        openRouterUrl,
        {
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        },
        {
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3001",
            "X-Title": "ShopMe Formatter",
          },
          timeout: 30000,
        }
      )

      const formattedResponse = response.data.choices[0]?.message?.content?.trim()
      console.log("✅ Formatted response:", formattedResponse?.substring(0, 100) + "...")
      
      return formattedResponse || "Offerte trovate!"

      } catch (error) {
      console.error("❌ Formatter error:", error)
      return "Offerte trovate!"
    }
  }

  private async executeSearchRagFallback(request: LLMRequest, translatedQuery: string): Promise<LLMResponse> {
    console.log("🔍 Executing SearchRag fallback...")
    
    try {
      // Call SearchRag service
      const ragResult = await this.callingFunctionsService.SearchRag({
        query: translatedQuery,
        workspaceId: request.workspaceId,
        customerId: request.customerid,
        messages: request.messages || [],
        useCartData: false,
        generateCartLink: false
      })

      console.log("🔍 SearchRag result:", JSON.stringify(ragResult, null, 2))
      
      // Log to file for MCP - ALWAYS log SearchRag result
      const logSearchRag = `[${new Date().toISOString()}] 🚨🚨🚨 ANDREA: SearchRag raw result: ${JSON.stringify(ragResult, null, 2)}\n`
      fs.appendFileSync('/tmp/shopme-server.log', logSearchRag)

      if (ragResult.success && ragResult.results && (ragResult.results as any).results && (ragResult.results as any).results.total > 0) {
        // Log to file for MCP
        const logMessage4 = `[${new Date().toISOString()}] 🚨🚨🚨 ANDREA: SearchRag result: ${JSON.stringify(ragResult, null, 2)}\n`
        fs.appendFileSync('/tmp/shopme-server.log', logMessage4)

        // Extract the most relevant FAQ content
        let formattedOutput = "Ho trovato queste informazioni per te."
        
        if ((ragResult.results as any).results.faqs && (ragResult.results as any).results.faqs.length > 0) {
          const topFaq = (ragResult.results as any).results.faqs[0]
          const content = topFaq.content
          
          // Extract the answer part (after "Answer: ")
          const answerMatch = content.match(/Answer:\s*(.+)$/)
          if (answerMatch) {
            formattedOutput = answerMatch[1].trim()
          }
          
          console.log(`🎯 SearchRag formatted output: "${formattedOutput}"`)
        }

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

      // SearchRag found nothing
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
}
