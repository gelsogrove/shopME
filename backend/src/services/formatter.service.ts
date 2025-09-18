/**
 * Formatter Service
 * 
 * Centralizes all response formatting rules for ShopME chatbot.
 * Handles cart display, product formatting, and system response styling.
 * Supports multiple languages: IT, EN, ES, PT
 * 
 * 🎭 PERSONALITÀ E STILE:
 * - Tono: Professionale ma caldo e accogliente, tipicamente italiano
 * - Multilingua: Adatta automaticamente la lingua all'utente
 * - Proattivo: Suggerisce prodotti correlati e ricette abbinate
 * - Esperto: Condivide conoscenze sui prodotti italiani e la loro origine
 * 
 * 📋 BEST PRACTICES:
 * 1. Sempre contestualizza le risposte con le informazioni dell'utente
 * 2. Suggerisce abbinamenti quando possibile (ricette + prodotti)
 * 3. È specifico sui dettagli dei prodotti (origine, caratteristiche)
 * 4. Offre alternative se un prodotto non è disponibile
 * 5. Facilita il contatto con l'operatore quando necessario
 */

export class FormatterService {
  private static async replaceAllVariables(response: string, customerId?: string, workspaceId?: string, language?: string, customerDiscount?: number): Promise<string> {
    console.log('🔧 Formatter: replaceAllVariables called with:', response.substring(0, 100))
    
    // 🚨 EXCEPTION HANDLING: Parameter validation
    if (!workspaceId) {
      throw new Error("workspaceId is required for variable replacement")
    }
    
    // Handle [LIST_CATEGORIES] VARIABLE
    if (response.includes('[LIST_CATEGORIES]')) {
      console.log('🔧 Formatter: Found [LIST_CATEGORIES] VARIABLE!')
      
      try {
        // ✅ USE EXISTING SERVICE: CategoryService
        const { CategoryService } = require('../application/services/category.service')
        const categoryService = new CategoryService()
        
        const categories = await categoryService.getAllForWorkspace(workspaceId)
        
        if (categories && categories.length > 0) {
          const categoriesList = categories.map(category => {
            const emoji = this.getCategoryEmoji(category.name)
            return `- ${emoji} *${category.name}*`
          }).join('\n')
          
          response = response.replace('[LIST_CATEGORIES]', categoriesList)
        } else {
          // 🚨 GRACEFUL HANDLING: Empty database
          response = response.replace('[LIST_CATEGORIES]', 'Al momento non abbiamo categorie disponibili 🙏')
        }
      } catch (error) {
        // 🚨 EXCEPTION HANDLING: Database query failure
        throw new Error(`Database query failed for [LIST_CATEGORIES]: ${error.message}`)
      }
    }

    // Handle [USER_DISCOUNT] VARIABLE
    if (response.includes('[USER_DISCOUNT]')) {
      console.log('🔧 Formatter: Found [USER_DISCOUNT] VARIABLE!')
      
      // 🚨 EXCEPTION HANDLING: Parameter validation
      if (!customerId) {
        throw new Error("customerId is required for [USER_DISCOUNT] variable replacement")
      }
      
      try {
        // ✅ USE EXISTING SERVICE: PriceCalculationService
        const { PriceCalculationService } = require('../application/services/price-calculation.service')
        const { PrismaClient } = require('@prisma/client')
        const prisma = new PrismaClient()
        const priceService = new PriceCalculationService(prisma)
        
        const discounts = await priceService.getAvailableDiscounts(workspaceId, customerId)
        
        await prisma.$disconnect()
        
        if (discounts.customerDiscount > 0) {
          response = response.replace('[USER_DISCOUNT]', `${discounts.customerDiscount}%`)
        } else {
          // 🚨 GRACEFUL HANDLING: No discount
          response = response.replace('[USER_DISCOUNT]', 'Nessuno sconto attivo al momento 🙏')
        }
      } catch (error) {
        // 🚨 EXCEPTION HANDLING: Database query failure
        throw new Error(`Database query failed for [USER_DISCOUNT]: ${error.message}`)
      }
    }

    // Handle [LINK_ORDERS_WITH_TOKEN] VARIABLE
    if (response.includes('[LINK_ORDERS_WITH_TOKEN]')) {
      console.log('🔧 Formatter: Found [LINK_ORDERS_WITH_TOKEN] VARIABLE!')
      
      // 🚨 EXCEPTION HANDLING: Parameter validation
      if (!customerId) {
        throw new Error("customerId is required for [LINK_ORDERS_WITH_TOKEN] variable replacement")
      }
      
      try {
        // ✅ USE EXISTING SERVICE: SecureTokenService
        const { SecureTokenService } = require('../application/services/secure-token.service')
        const secureTokenService = new SecureTokenService()
        
        const ordersToken = await secureTokenService.createToken(
          'orders',
          workspaceId,
          { customerId, workspaceId },
          '1h',
          undefined,
          undefined,
          undefined,
          customerId
        )
        
        const ordersLink = `http://localhost:3000/orders-public?token=${ordersToken}`
        response = response.replace('[LINK_ORDERS_WITH_TOKEN]', ordersLink)
      } catch (error) {
        // 🚨 EXCEPTION HANDLING: Token generation failure
        throw new Error(`Token generation failed for [LINK_ORDERS_WITH_TOKEN]: ${error.message}`)
      }
    }

    // Handle other tokens using existing ReplaceLinkWithToken function
    const hasListAllProducts = response.includes('[LIST_ALL_PRODUCTS]')
    const hasListServices = response.includes('[LIST_SERVICES]')
    const hasListOffers = response.includes('[LIST_OFFERS]')
    const hasListActiveOffers = response.includes('[LIST_ACTIVE_OFFERS]')
    const hasLinkProfile = response.includes('[LINK_PROFILE_WITH_TOKEN]')
    const hasLinkCart = response.includes('[LINK_CART_WITH_TOKEN]')
    const hasLinkTracking = response.includes('[LINK_TRACKING_WITH_TOKEN]')
    const hasLinkCheckout = response.includes('[LINK_CHECKOUT_WITH_TOKEN]')
    const hasLinkLastOrderInvoice = response.includes('[LINK_LAST_ORDER_INVOICE_WITH_TOKEN]')
    
    console.log('🔧 Formatter: Token detection:', {
      hasListAllProducts,
      hasListServices,
      hasListOffers,
      hasListActiveOffers,
      hasLinkProfile,
      hasLinkCart,
      hasLinkTracking,
      hasLinkCheckout,
      hasLinkLastOrderInvoice,
      response: response.substring(0, 100)
    })
    
    // Handle [LIST_ALL_PRODUCTS] token with GetAllProducts function
    if (hasListAllProducts) {
      console.log('🔧 Formatter: Found [LIST_ALL_PRODUCTS] token, calling GetAllProducts')
      
      try {
        const { GetAllProducts } = require('../chatbot/calling-functions/GetAllProducts')
        
        if (!customerId || !workspaceId) {
          throw new Error("customerId and workspaceId are required for GetAllProducts")
        }
        
              const productsResult = await GetAllProducts({
                phoneNumber: "unknown", // We don't have phone number in formatter context
                workspaceId: workspaceId,
                customerId: customerId,
                message: "Get all products",
                language: language || 'it'
              })
        
        console.log('🔧 Formatter: GetAllProducts returned:', { 
          success: !!productsResult.response, 
          totalProducts: productsResult.totalProducts 
        })
        
        if (productsResult.response) {
          // Replace [LIST_ALL_PRODUCTS] with the actual products list
          response = response.replace(/\[LIST_ALL_PRODUCTS\]/g, productsResult.response)
          console.log('🔧 Formatter: Replaced [LIST_ALL_PRODUCTS] with products list')
        }
      } catch (error) {
        console.error('❌ Formatter: GetAllProducts error:', error)
        // Replace with fallback message
        response = response.replace(/\[LIST_ALL_PRODUCTS\]/g, language === 'it' ? "Nessun prodotto disponibile al momento" : "No products available at the moment")
      }
    }
    
    // Handle other tokens using existing ReplaceLinkWithToken function
    if (hasListOffers || hasListActiveOffers || hasListServices || 
        hasLinkProfile || hasLinkCart || hasLinkTracking || hasLinkCheckout || hasLinkLastOrderInvoice) {
      
      console.log('🔧 Formatter: Found tokens that need replacement:', {
        hasListAllProducts: response.includes('[LIST_ALL_PRODUCTS]'),
        hasListServices: response.includes('[LIST_SERVICES]'),
        hasListOffers: response.includes('[LIST_OFFERS]'),
        customerId: customerId,
        workspaceId: workspaceId
      })
      
      try {
        const { ReplaceLinkWithToken } = require('../chatbot/calling-functions/ReplaceLinkWithToken')
        
        console.log('🔧 Formatter: Token replacement params:', {
          customerId: customerId,
          workspaceId: workspaceId,
          hasCustomerId: !!customerId,
          hasWorkspaceId: !!workspaceId
        })
        
        if (!customerId || !workspaceId) {
          throw new Error("customerId and workspaceId are required for token replacement")
        }
        
        console.log('🔧 Formatter: About to call ReplaceLinkWithToken with:', { response: response.substring(0, 100), customerId, workspaceId })
        
        const replaceResult = await ReplaceLinkWithToken(
          { response },
          customerId,
          workspaceId
        )
        
        console.log('🔧 Formatter: ReplaceLinkWithToken returned:', { success: replaceResult.success, hasResponse: !!replaceResult.response, error: replaceResult.error })
        
        console.log('🔧 Formatter: ReplaceLinkWithToken result:', {
          success: replaceResult.success,
          hasResponse: !!replaceResult.response,
          error: replaceResult.error
        })
        
        if (replaceResult.success && replaceResult.response) {
          response = replaceResult.response
          console.log('🔧 Formatter: Response after replacement:', response.substring(0, 200))
        }
      } catch (error) {
        console.error("❌ Formatter: Error replacing other tokens:", error)
      }
    }

    return response
  }

  private static getCategoryEmoji(categoryName: string): string {
    const lowerCategory = categoryName.toLowerCase()
    
    if (lowerCategory.includes('cheese') || lowerCategory.includes('dairy') || lowerCategory.includes('formaggi') || lowerCategory.includes('latticini')) {
      return '🧀'
    } else if (lowerCategory.includes('frozen') || lowerCategory.includes('surgelati') || lowerCategory.includes('gelati')) {
      return '🧊'
    } else if (lowerCategory.includes('sauce') || lowerCategory.includes('salsa') || lowerCategory.includes('preserve') || lowerCategory.includes('conserve')) {
      return '🍅'
    } else if (lowerCategory.includes('spice') || lowerCategory.includes('spezie') || lowerCategory.includes('herb') || lowerCategory.includes('erbe')) {
      return '🌿'
    } else if (lowerCategory.includes('pasta') || lowerCategory.includes('rice')) {
      return '🍝'
    } else if (lowerCategory.includes('meat') || lowerCategory.includes('salumi') || lowerCategory.includes('salami')) {
      return '🍖'
    } else if (lowerCategory.includes('water') || lowerCategory.includes('beverage') || lowerCategory.includes('bevanda')) {
      return '💧'
    } else if (lowerCategory.includes('flour') || lowerCategory.includes('baking') || lowerCategory.includes('farina')) {
      return '🌾'
    } else if (lowerCategory.includes('tomato') || lowerCategory.includes('pomodoro')) {
      return '🍅'
    } else {
      return '📦' // Default emoji
    }
  }
  static async formatResponse(response: string, language: string = 'it', formatRules?: string, customerId?: string, workspaceId?: string, originalQuestion?: string, customerDiscount?: number, conversationHistory?: Array<{role: string, content: string}>): Promise<string> {
    console.log('🔧 FORMATTER: ===== START FORMATTING =====')
    console.log('🔧 FORMATTER: Input response:', response)
    console.log('🔧 FORMATTER: Language:', language)
    console.log('🔧 FORMATTER: Format rules:', formatRules)
    console.log('🔧 FORMATTER: Customer ID:', customerId)
    console.log('🔧 FORMATTER: Workspace ID:', workspaceId)
    
    // Write to file for debugging
    const fs = require('fs')
    fs.appendFileSync('/tmp/formatter-debug.log', `\n===== FORMATTER DEBUG =====\n`)
    fs.appendFileSync('/tmp/formatter-debug.log', `Input: ${response}\n`)
    fs.appendFileSync('/tmp/formatter-debug.log', `Language: ${language}\n`)
    if (!response || response.trim() === '') {
      return "Nessuna risposta disponibile."
    }

    // 🚨 CRITICAL RULE: NEVER INVENT ANYTHING - ONLY USE REAL DATABASE DATA
    const criticalRule = `
    🚨 CRITICAL FORMATTING RULE - NEVER INVENT ANYTHING:
    - You are a helpful assistant for L'Altra Italia, specialized in Italian products
    - NEVER invent codes, dates, prices, products, links, or any information not in the database
    - NEVER add fake checkout codes, expiration dates, promotional messages, or website links
    - NEVER invent product names, discounts, offers, or any content
    - ONLY use the exact data provided in the response
    - If data is missing, say "Information not available" - DO NOT INVENT
    - NO FANTASY, NO CREATIVITY - ONLY REAL DATABASE FACTS
    - 🚨 ABSOLUTE RULE: If you don't have real data, don't make it up - just format what's there
    - 🚨 LINK RULE: NEVER add any links unless they are explicitly provided in the response
    - 🚨 NO WEBSITE LINKS: Do not add "Trova i nostri prodotti qui:" or any website links
    - 🚨 NO EXAMPLE LINKS: Do not use example.com, laltraitalia.com, or any other website links
    - ✅ TOKEN RULE: Tokens have already been replaced with real data from the database
    - 🚨 FORBIDDEN: Adding "Trova i nostri prodotti qui:" or any website links
    `
    
    // Combine critical rule with any additional format rules
    const combinedRules = criticalRule + (formatRules ? `\n\nADDITIONAL RULES:\n${formatRules}` : '')

    // Handle ALL VARIABLES first
    let formattedResponse = response
    
    try {
      formattedResponse = await this.replaceAllVariables(response, customerId, workspaceId, language, customerDiscount)
      console.log('✅ FORMATTER: Token replacement completed')
      console.log('🔧 FORMATTER: After token replacement:', formattedResponse)
      fs.appendFileSync('/tmp/formatter-debug.log', `After token replacement: ${formattedResponse}\n`)
    } catch (error) {
      console.error('❌ FORMATTER: Token replacement error:', error.message)
      formattedResponse = response
    }

    // SEMPRE applicare la traduzione nella lingua dell'utente
    console.log('🔧 FORMATTER: Applying language formatting...')
    let languageFormatted = await this.applyLanguageFormatting(formattedResponse, language, formatRules)
    console.log('🔧 FORMATTER: After language formatting:', languageFormatted.substring(0, 200))
    fs.appendFileSync('/tmp/formatter-debug.log', `After language formatting: ${languageFormatted}\n`)
    
    // Check if response contains lists - if so, skip WhatsApp formatting to preserve data
    const hasLists = languageFormatted.includes('•') || languageFormatted.includes('-') || languageFormatted.includes('**')
    
    let whatsappFormatted = languageFormatted
    
    if (!hasLists) {
      // Only apply WhatsApp formatting if no lists are present
      whatsappFormatted = await this.applyWhatsAppFormatting(languageFormatted)
    } else {
      console.log('🔧 FORMATTER: SKIPPING WhatsApp formatting - contains lists, preserving data')
    }
    
    console.log('🔧 FORMATTER: After WhatsApp formatting:', whatsappFormatted)
    console.log('🔧 FORMATTER: ===== END FORMATTING =====')
    fs.appendFileSync('/tmp/formatter-debug.log', `Final result: ${whatsappFormatted}\n`)
    fs.appendFileSync('/tmp/formatter-debug.log', `===== END FORMATTER DEBUG =====\n`)
    
    return whatsappFormatted
  }

  private static async applyLanguageFormatting(text: string, language: string, formatRules: string): Promise<string> {
    if (!text) return text

    console.log('🔧 NEW FORMATTER: applyLanguageFormatting called with:', { text: text.substring(0, 100), language, formatRules: formatRules?.substring(0, 50) })

    // Check if this is a JSON response with action type
    try {
      const jsonData = JSON.parse(text)
      if (jsonData.action && jsonData.linkUrl) {
        return this.formatActionResponse(jsonData, language)
      }
    } catch (e) {
      // Not JSON, continue with normal formatting
    }

    try {
      const axios = require('axios')
      const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
      const openRouterApiKey = process.env.OPENROUTER_API_KEY

      const languageNames = {
        'it': 'Italian',
        'en': 'English', 
        'es': 'Spanish',
        'pt': 'Portuguese'
      }
      
      const targetLanguage = languageNames[language] || 'Italian'

      const languageResponse = await axios.post(openRouterUrl, {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a WhatsApp message formatter. Your ONLY job is to translate the response to ${targetLanguage} while PRESERVING ALL LISTS AND SPECIFIC INFORMATION.

🚨 CRITICAL RULES:
1. Respond ONLY in ${targetLanguage}
2. PRESERVE ALL LISTS - never remove or replace them
3. PRESERVE ALL SPECIFIC INFORMATION - never replace with generic text
4. Only translate the language, don't change the content structure
5. If there are categories or products listed, KEEP THEM EXACTLY

EXAMPLE:
Original: "Ecco le categorie: • Cheeses & Dairy • Pasta & Rice • Sauces"
Good: "Ecco le nostre categorie: • Formaggi e Latticini • Pasta e Riso • Salse"
Bad: "Ciao! Abbiamo tanti prodotti disponibili!" (NEVER replace lists with generic text)

Return ONLY the translated response, no explanations.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.0,
        max_tokens: 300
      }, {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'ShopMe Language Formatter'
        },
        timeout: 10000
      })

      const formattedText = languageResponse.data.choices[0]?.message?.content?.trim() || text
      console.log('🔧 NEW FORMATTER: LLM response:', formattedText)
      console.log(`✅ Language formatting to ${targetLanguage} completed`)
      return formattedText
    } catch (error) {
      console.error('❌ Language formatting error:', error)
      return text // Return original text if formatting fails
    }
  }

  private static formatActionResponse(jsonData: any, language: string): string {
    const { action, linkUrl, expiresAt } = jsonData
    
    if (language === 'it') {
      switch (action) {
        case 'cart':
          return `Ecco il tuo carrello: ${linkUrl}\n\nIl link scadrà il ${new Date(expiresAt).toLocaleDateString('it-IT')} alle ${new Date(expiresAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}. Buon shopping! 🛒`
        case 'orders':
          return `Ecco i tuoi ordini: ${linkUrl}\n\nIl link scadrà il ${new Date(expiresAt).toLocaleDateString('it-IT')} alle ${new Date(expiresAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}.`
        case 'checkout':
          return `Procedi con il checkout: ${linkUrl}\n\nIl link scadrà il ${new Date(expiresAt).toLocaleDateString('it-IT')} alle ${new Date(expiresAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}.`
        default:
          return `Ecco il link richiesto: ${linkUrl}\n\nIl link scadrà il ${new Date(expiresAt).toLocaleDateString('it-IT')} alle ${new Date(expiresAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}.`
      }
    } else {
      // English
      switch (action) {
        case 'cart':
          return `Here's your cart: ${linkUrl}\n\nThe link will expire on ${new Date(expiresAt).toLocaleDateString('en-US')} at ${new Date(expiresAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}. Happy shopping! 🛒`
        case 'orders':
          return `Here are your orders: ${linkUrl}\n\nThe link will expire on ${new Date(expiresAt).toLocaleDateString('en-US')} at ${new Date(expiresAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.`
        case 'checkout':
          return `Proceed to checkout: ${linkUrl}\n\nThe link will expire on ${new Date(expiresAt).toLocaleDateString('en-US')} at ${new Date(expiresAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.`
        default:
          return `Here's the requested link: ${linkUrl}\n\nThe link will expire on ${new Date(expiresAt).toLocaleDateString('en-US')} at ${new Date(expiresAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.`
      }
    }
  }

  private static async applyWhatsAppFormatting(text: string): Promise<string> {
    if (!text) return text

    try {
      const axios = require('axios')
      const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
      const openRouterApiKey = process.env.OPENROUTER_API_KEY

      const formattingResponse = await axios.post(openRouterUrl, {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a WhatsApp message formatter for ShopME, an Italian food e-commerce. Your ONLY job is to make the text natural and conversational for WhatsApp.

🎭 PERSONALITÀ E STILE:
- Tono: Professionale ma caldo e accogliente, tipicamente italiano
- Multilingua: Adatta automaticamente la lingua all'utente
- Proattivo: Suggerisce prodotti correlati e ricette abbinate
- Esperto: Condivide conoscenze sui prodotti italiani e la loro origine

📋 BEST PRACTICES:
1. Sempre contestualizza le risposte con le informazioni dell'utente
2. Suggerisce abbinamenti quando possibile (ricette + prodotti)
3. È specifico sui dettagli dei prodotti (origine, caratteristiche)
4. Offre alternative se un prodotto non è disponibile
5. Facilita il contatto con l'operatore quando necessario

🚨 CRITICAL RULES - FOLLOW EXACTLY:
1. NEVER use any markdown formatting (no **bold**, _italics_, ~strikethrough~, \`code\`)
2. NEVER use bullet points, dashes, or structured lists
3. Write in flowing, natural sentences
4. Use simple line breaks only when necessary
5. Make it sound like a friendly conversation
6. Do NOT add any NEW links, websites, or URLs that are not in the original text
7. DO include any links that are already present in the original text
8. Do NOT add any additional information not in the original text
9. Do NOT use any formatting symbols or special characters
10. Be proactive and suggest related products or recipes
11. Share knowledge about Italian products and their origins
12. Always contextualize responses with user information
13. Offer alternatives when products are not available

EXAMPLE OF GOOD FORMATTING:
"Ciao! Offriamo spedizione per 5 EUR con consegna entro 3-5 giorni lavorativi, e confezione regalo per 30 EUR con messaggio personalizzato e materiali premium. Ti consiglio anche di abbinare il nostro Parmigiano Reggiano DOP con il nostro Aceto Balsamico di Modena IGP per un sapore autentico italiano!"

EXAMPLE OF BAD FORMATTING (NEVER DO THIS):
"- **Spedizione**: 5 EUR
- **Confezione regalo**: 30 EUR"

Return ONLY the natural, unformatted text, no explanations.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.0, // Zero temperature to prevent inventions
        max_tokens: 4000
      }, {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })

      if (formattingResponse.data?.choices?.[0]?.message?.content) {
        return formattingResponse.data.choices[0].message.content.trim()
      }
    } catch (error) {
      console.error("❌ WhatsApp formatting failed, using original:", error)
    }

    return text
  }
}