/**
 * Formatter Service
 * 
 * Centralizes all response formatting rules for ShopME chatbot.
 * Handles cart display, product formatting, and system response styling.
 * Supports multiple languages: IT, EN, ES, PT
 */

export class FormatterService {
  private static async replaceAllVariables(response: string, customerId?: string, workspaceId?: string): Promise<string> {
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
    if (response.includes('[LIST_OFFERS]') || response.includes('[LIST_ACTIVE_OFFERS]') || 
        response.includes('[LIST_ALL_PRODUCTS]') || response.includes('[LIST_SERVICES]') || 
        response.includes('[LINK_PROFILE_WITH_TOKEN]') || response.includes('[LINK_CART_WITH_TOKEN]') || 
        response.includes('[LINK_TRACKING_WITH_TOKEN]') || response.includes('[LINK_CHECKOUT_WITH_TOKEN]')) {
      
      try {
        const { ReplaceLinkWithToken } = require('../chatbot/calling-functions/ReplaceLinkWithToken')
        
        const replaceResult = await ReplaceLinkWithToken(
          { response },
          customerId || 'default-customer-id',
          workspaceId || 'default-workspace-id'
        )
        
        if (replaceResult.success && replaceResult.response) {
          response = replaceResult.response
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
  static async formatResponse(response: string, language: string = 'it', formatRules?: string, customerId?: string, workspaceId?: string, originalQuestion?: string, conversationHistory?: Array<{role: string, content: string}>): Promise<string> {
    console.log('🔧 Formatter: formatResponse called with:', response.substring(0, 100))
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
    - FOR LINKS: Only use links that are explicitly provided in the response
    - Use line breaks before and after links for better readability
    - 🚨 TOKEN RULE: NEVER replace tokens like [LIST_SERVICES], [LIST_PRODUCTS], [USER_DISCOUNT], [LIST_ALL_PRODUCTS], [LIST_OFFERS] with invented content
    - 🚨 TOKEN RULE: If you see a token like [LIST_SERVICES], keep it EXACTLY as is - DO NOT replace it
    - 🚨 TOKEN RULE: Tokens will be replaced by the system later - your job is ONLY to format and translate
    - 🚨 ABSOLUTE RULE: If you don't have real data, don't make it up - just format what's there
    `
    
    // Combine critical rule with any additional format rules
    const combinedRules = criticalRule + (formatRules ? `\n\nADDITIONAL RULES:\n${formatRules}` : '')

    // Format and translate response with critical rules
    let formattedResponse = response
    
    try {
      const axios = require('axios')
      const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
      const openRouterApiKey = process.env.OPENROUTER_API_KEY

      const languageMap = {
        "it": "Italian",
        "es": "Spanish", 
        "pt": "Portuguese",
        "en": "English"
      }
      
      const targetLanguage = languageMap[language] || "Italian"
      
      // Handle ALL VARIABLES BEFORE calling OpenRouter
      response = await this.replaceAllVariables(response, customerId, workspaceId)
      
      const formatResponse = await axios.post(openRouterUrl, {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant for L'Altra Italia, specialized in Italian products.

${combinedRules}

🚨 CRITICAL: If the response contains tokens like [LIST_SERVICES], [LIST_PRODUCTS], [USER_DISCOUNT], [LIST_CATEGORIES], [LIST_OFFERS], [LIST_ACTIVE_OFFERS], [LIST_ALL_PRODUCTS], [LINK_ORDERS_WITH_TOKEN], [LINK_PROFILE_WITH_TOKEN], [LINK_CART_WITH_TOKEN], [LINK_TRACKING_WITH_TOKEN], [LINK_CHECKOUT_WITH_TOKEN] - DO NOT REPLACE THEM! Keep them EXACTLY as they are!

🚨 ABSOLUTE RULE: NEVER replace any token with invented content! Examples of what NOT to do:
- NEVER replace [LIST_SERVICES] with invented services like "Prenotazione di voli", "Spedizione standard" - these are FAKE!
- NEVER replace [LIST_ALL_PRODUCTS] with invented products like "Pasta di Gragnano", "Parmigiano Reggiano" - these are FAKE!
- NEVER replace [USER_DISCOUNT] with invented percentages like "10%" - this is FAKE!
- NEVER replace [LIST_OFFERS] with invented offers like "Scopri le nostre promozioni" - this is FAKE!

🚨 FINAL WARNING: If you see ANY token in the response, DO NOT replace it with any text! Keep it exactly as it is! The system will replace it later with real data from the database!

Format and translate the following response to ${targetLanguage}. Keep product names, brand names, and technical terms in their original language. Return ONLY the formatted and translated response, no explanations.`
          },
          {
            role: 'user',
            content: response
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      }, {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })

      if (formatResponse.data?.choices?.[0]?.message?.content) {
        formattedResponse = formatResponse.data.choices[0].message.content.trim()
      }
    } catch (error) {
      console.error("❌ Formatter: Formatting failed, using original:", error)
      formattedResponse = response
    }

    // Apply WhatsApp formatting
    const whatsappFormatted = await this.applyWhatsAppFormatting(formattedResponse)
    
    return whatsappFormatted
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
            content: `You are a WhatsApp message formatter for an Italian e-commerce platform. Format the following text for WhatsApp with:

1. **Bold text** using *asterisks* for important information
2. _Italic text_ using _underscores_ for emphasis
3. ~Strikethrough~ using ~tildes~ for crossed-out prices
4. \`Monospace\` using backticks for codes/IDs
5. Add relevant emojis naturally
6. Use line breaks for readability
7. Keep it conversational and friendly
8. Don't over-format - keep it clean and readable
9. FOR LINKS: Always put links on a new line, never on the same line as text
10. Use line breaks before and after links for better readability

Return ONLY the formatted text, no explanations.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 800
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