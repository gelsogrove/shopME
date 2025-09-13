/**
 * Formatter Service
 * 
 * Centralizes all response formatting rules for ShopME chatbot.
 * Handles cart display, product formatting, and system response styling.
 * Supports multiple languages: IT, EN, ES, PT
 */

interface Messages {
  [key: string]: {
    cartFormatting: string;
    generalFormatting: string;
  }
}

const MESSAGES: Messages = {
  it: {
    cartFormatting: `
CART FORMATTING RULES:
- When showing cart contents, ALWAYS include the ProductCode in the format: "[CODE] - Product Name"
- Example: "[00004] - Mozzarella di Bufala Campana DOP a €9.99"
- If ProductCode is missing or "N/A", use the format: "• Product Name a €price"
- Example: "• Pasta Artigianale a €4.50"

PRODUCT DISAMBIGUATION RULES:
- When showing product options for disambiguation, show ProductCode in brackets: "• [CODE] - Product Name - €price"
- Example: "• [00004] - Mozzarella di Bufala Campana DOP - €9.99"
- Example: "• [000500] - Mozzarella di Bufala - €12.50"

PRODUCT SELECTION RULES:
- Always prioritize ProductCode matching over name matching for precision
- When user provides ProductCode, use exact match: "[00004]" → exact product
- When user provides name only, search and disambiguate if multiple matches found

CART RESPONSE FORMAT:
- Empty cart: When cart data shows isEmpty=true or items=[], respond naturally in the user's language with helpful suggestions
- Non-empty cart: Show itemized list with ProductCodes and totals
- Use emoji appropriately: 🛒 for cart, 💰 for totals, 📝 for instructions
- ALWAYS make cart totals bold using *asterisks*: *TOTALE: €XX.XX* or *Total: €XX.XX*
- CRITICAL: Use *TOTALE: €XX.XX* format - the asterisks are MANDATORY for bold display
- ALWAYS include cart link at the end when cartUrl is provided: "🔗 Vedi il carrello: [URL]"
`,
    generalFormatting: `
GENERAL RESPONSE FORMATTING:
- Use appropriate emoji to make responses friendly and engaging
- Keep responses concise but informative
- Structure information clearly with bullet points or lists when appropriate
- Always maintain helpful and professional tone
- Use consistent formatting for prices: €XX.XX format
`
  },
  en: {
    cartFormatting: `
CART FORMATTING RULES:
- When showing cart contents, ALWAYS include the ProductCode in the format: "[CODE] - Product Name"
- Example: "[00004] - Mozzarella di Bufala Campana DOP at €9.99"
- If ProductCode is missing or "N/A", use the format: "• Product Name at €price"
- Example: "• Artisan Pasta at €4.50"

PRODUCT DISAMBIGUATION RULES:
- When showing product options for disambiguation, show ProductCode in brackets: "• [CODE] - Product Name - €price"
- Example: "• [00004] - Mozzarella di Bufala Campana DOP - €9.99"
- Example: "• [000500] - Mozzarella di Bufala - €12.50"

PRODUCT SELECTION RULES:
- Always prioritize ProductCode matching over name matching for precision
- When user provides ProductCode, use exact match: "[00004]" → exact product
- When user provides name only, search and disambiguate if multiple matches found

CART RESPONSE FORMAT:
- Empty cart: Show friendly message with suggestions
- Non-empty cart: Show itemized list with ProductCodes and totals
- Use emoji appropriately: 🛒 for cart, 💰 for totals, 📝 for instructions
- ALWAYS make cart totals bold using *asterisks*: *TOTALE: €XX.XX* or *Total: €XX.XX*
- CRITICAL: Use *TOTALE: €XX.XX* format - the asterisks are MANDATORY for bold display
- ALWAYS include cart link at the end when cartUrl is provided: "🔗 View cart: [URL]"
`,
    generalFormatting: `
GENERAL RESPONSE FORMATTING:
- Use appropriate emoji to make responses friendly and engaging
- Keep responses concise but informative
- Structure information clearly with bullet points or lists when appropriate
- Always maintain helpful and professional tone
- Use consistent formatting for prices: €XX.XX format
`
  },
  es: {
    cartFormatting: `
CART FORMATTING RULES:
- When showing cart contents, ALWAYS include the ProductCode in the format: "[CODE] - Product Name"
- Example: "[00004] - Mozzarella di Bufala Campana DOP a €9.99"
- If ProductCode is missing or "N/A", use the format: "• Product Name a €price"
- Example: "• Pasta Artesanal a €4.50"

PRODUCT DISAMBIGUATION RULES:
- When showing product options for disambiguation, show ProductCode in brackets: "• [CODE] - Product Name - €price"
- Example: "• [00004] - Mozzarella di Bufala Campana DOP - €9.99"
- Example: "• [000500] - Mozzarella di Bufala - €12.50"

PRODUCT SELECTION RULES:
- Always prioritize ProductCode matching over name matching for precision
- When user provides ProductCode, use exact match: "[00004]" → exact product
- When user provides name only, search and disambiguate if multiple matches found

CART RESPONSE FORMAT:
- Empty cart: Show friendly message with suggestions
- Non-empty cart: Show itemized list with ProductCodes and totals
- Use emoji appropriately: 🛒 for cart, 💰 for totals, 📝 for instructions
- ALWAYS make cart totals bold using *asterisks*: *TOTALE: €XX.XX* or *Total: €XX.XX*
- CRITICAL: Use *TOTALE: €XX.XX* format - the asterisks are MANDATORY for bold display
- ALWAYS include cart link at the end when cartUrl is provided: "🔗 Ver carrito: [URL]"
`,
    generalFormatting: `
GENERAL RESPONSE FORMATTING:
- Use appropriate emoji to make responses friendly and engaging
- Keep responses concise but informative
- Structure information clearly with bullet points or lists when appropriate
- Always maintain helpful and professional tone
- Use consistent formatting for prices: €XX.XX format
`
  },
  pt: {
    cartFormatting: `
CART FORMATTING RULES:
- When showing cart contents, ALWAYS include the ProductCode in the format: "[CODE] - Product Name"
- Example: "[00004] - Mozzarella di Bufala Campana DOP por €9.99"
- If ProductCode is missing or "N/A", use the format: "• Product Name por €price"
- Example: "• Massa Artesanal por €4.50"

PRODUCT DISAMBIGUATION RULES:
- When showing product options for disambiguation, show ProductCode in brackets: "• [CODE] - Product Name - €price"
- Example: "• [00004] - Mozzarella di Bufala Campana DOP - €9.99"
- Example: "• [000500] - Mozzarella di Bufala - €12.50"

PRODUCT SELECTION RULES:
- Always prioritize ProductCode matching over name matching for precision
- When user provides ProductCode, use exact match: "[00004]" → exact product
- When user provides name only, search and disambiguate if multiple matches found

CART RESPONSE FORMAT:
- Empty cart: Show friendly message with suggestions
- Non-empty cart: Show itemized list with ProductCodes and totals
- Use emoji appropriately: 🛒 for cart, 💰 for totals, 📝 for instructions
- ALWAYS make cart totals bold using *asterisks*: *TOTALE: €XX.XX* or *Total: €XX.XX*
- CRITICAL: Use *TOTALE: €XX.XX* format - the asterisks are MANDATORY for bold display
- ALWAYS include cart link at the end when cartUrl is provided: "🔗 Ver carrinho: [URL]"
`,
    generalFormatting: `
GENERAL RESPONSE FORMATTING:
- Use appropriate emoji to make responses friendly and engaging
- Keep responses concise but informative
- Structure information clearly with bullet points or lists when appropriate
- Always maintain helpful and professional tone
- Use consistent formatting for prices: €XX.XX format
`
  }
};

export class FormatterService {
  
  /**
   * Get language key from language code
   */
  private static getLanguageKey(language: string): string {
    const lang = language.toLowerCase();
    if (lang === 'en' || lang === 'english') return 'en';
    if (lang === 'es' || lang === 'spanish') return 'es';
    if (lang === 'pt' || lang === 'portuguese') return 'pt';
    return 'it'; // Default to Italian
  }
  
  /**
   * Get cart formatting instructions for LLM
   */
  static getCartFormattingRules(language: string = 'it'): string {
    const langKey = this.getLanguageKey(language);
    return MESSAGES[langKey].cartFormatting;
  }

  /**
   * Get general response formatting guidelines
   */
  static getGeneralFormattingRules(language: string = 'it'): string {
    const langKey = this.getLanguageKey(language);
    return MESSAGES[langKey].generalFormatting;
  }

  /**
   * Get complete formatting instructions for LLM system message
   */
  static getAllFormattingInstructions(language: string = 'it'): string {
    return this.getCartFormattingRules(language) + "\n" + this.getGeneralFormattingRules(language);
  }

  /**
   * Format response from Cloud Functions or SearchRag
   * Handles both direct Cloud Function responses and SearchRag results
   */
  static formatResponse(response: string, language: string = 'it'): string {
    console.log("🔧 FormatterService.formatResponse called with response type:", typeof response)
    console.log("🔧 FormatterService.formatResponse response content:", response)
    
    if (!response) {
      console.error("❌ FormatterService: response is null/undefined!")
      throw new Error("Response is null or undefined")
    }
    
    if (typeof response !== 'string') {
      console.error("❌ FormatterService: response is not a string!", typeof response, response)
      throw new Error("Response is not a string")
    }
    
    // First apply WhatsApp formatting
    const whatsappFormatted = this.applyWhatsAppFormatting(response)
    
    console.log("✅ FormatterService.formatResponse completed successfully")
    
    // Then apply language-specific formatting if needed
    return whatsappFormatted
  }

  /**
   * Apply WhatsApp formatting to any response
   * Centralized formatting for all responses (Cloud Functions and SearchRag)
   */
  static applyWhatsAppFormatting(response: string): string {
    let formatted = response

    console.log("📱 Applying WhatsApp formatting...")
    console.log("📱 Original input:", formatted)

    // 1. 🚫 Remove emoji used as bullet points and replace with •
    const emojiBullets = ['💳', '🏦', '📱', '💰', '💶', '🍷', '🍝', '🍇', '📦', '🔒', '🎯']
    emojiBullets.forEach(emoji => {
      // Replace emoji at start of line (with possible spaces) with •
      const regex = new RegExp(`^(\\s*)${emoji}\\s+`, 'gm')
      formatted = formatted.replace(regex, '$1• ')
    })

    // 2. 🔧 Convert dashes (-) to bullet points (•)
    formatted = formatted.replace(/^(\s*)- /gm, '$1• ')

    // 3. ✨ Add titles with * when missing for payment lists
    if ((formatted.includes('• Carta di credito') || formatted.includes('• PayPal')) && 
        !formatted.includes('*Metodi') && !formatted.includes('*metodi')) {
      
      // Find where list starts and add title
      formatted = formatted.replace(
        /(.*?\n)(\s*• (?:Carta di credito|PayPal))/,
        '$1\n*Metodi accettati:*\n$2'
      )
    }

    // 4. 🗜️ Remove excessive empty lines (max 1 empty line consecutive)
    formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n')

    // 5. 🔧 Standardize functional emojis - add 🔒 for security if missing
    if ((formatted.includes('sicur') || formatted.includes('garanti')) && !formatted.includes('🔒')) {
      formatted = formatted.replace(
        /(sicur[a-z]*|garanti[a-z]*)/gi,
        '$1 🔒'
      )
    }

    // 6. 💰 FORMAT TOTALS AND PRICES - Ensure all important totals and prices are bold
    // Pattern for totals without asterisks: "TOTALE: €XX.XX" or "Total: €XX.XX"
    formatted = formatted.replace(/(\b(?:TOTALE|Total|TOTAL|Total):\s*€[\d,]+\.?\d*)/gi, '*$1*')
    
    // Pattern for totals with underscore: "_TOTALE: €XX.XX_" → "*TOTALE: €XX.XX*"
    formatted = formatted.replace(/_(\b(?:TOTALE|Total|TOTAL|Total):\s*€[\d,]+\.?\d*)_/gi, '*$1*')
    
    // Pattern for final prices: "Prezzo finale: €XX.XX" → "*Prezzo finale: €XX.XX*"
    formatted = formatted.replace(/(\b(?:Prezzo finale|Final price|Precio final|Preço final):\s*€[\d,]+\.?\d*)/gi, '*$1*')
    
    // Pattern for subtotals: "Subtotale: €XX.XX" → "*Subtotale: €XX.XX*"
    formatted = formatted.replace(/(\b(?:Subtotale|Subtotal|Subtotal|Subtotal):\s*€[\d,]+\.?\d*)/gi, '*$1*')

    // 7. 🎯 ADD PRODUCT ICONS - Apply specific icons for product types
    formatted = this.applyProductIcons(formatted)

    // 8. ✂️ Remove extra spaces before and after
    formatted = formatted.trim()

    console.log("📱 Formatted output:", formatted)
    console.log("📱 WhatsApp formatting applied successfully")
    
    return formatted
  }

  /**
   * Apply product-specific icons for better visual representation
   */
  private static applyProductIcons(formatted: string): string {
    // Formaggi
    formatted = formatted.replace(/\b(Mozzarella|Parmigiano|Gorgonzola|Burrata|Pecorino|Formaggio)\b/gi, '🧀 $1')
    
    // Salumi
    formatted = formatted.replace(/\b(Prosciutto|Salame|Pancetta|Bresaola|Mortadella|Salumi)\b/gi, '🥓 $1')
    
    // Vini
    formatted = formatted.replace(/\b(Prosecco|Vino|Spumante|Champagne|Rosso|Bianco)\b/gi, '🍷 $1')
    
    // Liquori
    formatted = formatted.replace(/\b(Limoncello|Grappa|Amaro|Liquore)\b/gi, '🍋 $1')
    
    // Pasta
    formatted = formatted.replace(/\b(Spaghetti|Penne|Fusilli|Tagliatelle|Pasta|Risotto)\b/gi, '🍝 $1')
    
    // Conserve
    formatted = formatted.replace(/\b(Passata|Pelati|Concentrato|Pomodori|Conserve)\b/gi, '🍅 $1')
    
    // Condimenti
    formatted = formatted.replace(/\b(Olio|Aceto|Pesto|Condimenti)\b/gi, '🫒 $1')
    
    // Dolci
    formatted = formatted.replace(/\b(Tiramisù|Cannoli|Panettone|Dolci|Dessert)\b/gi, '🍰 $1')
    
    // Pesce
    formatted = formatted.replace(/\b(Tonno|Alici|Baccalà|Pesce)\b/gi, '🐟 $1')
    
    // Spezie
    formatted = formatted.replace(/\b(Origano|Basilico|Rosmarino|Spezie)\b/gi, '🌿 $1')

    return formatted
  }

  /**
   * Format a cart item display string
   * @param productCode - Product code (e.g., "00004")
   * @param productName - Product name
   * @param price - Product price
   * @param quantity - Item quantity (optional)
   */
  static formatCartItem(productCode: string, productName: string, price: number, quantity?: number): string {
    const quantityText = quantity && quantity > 1 ? `${quantity}x ` : ""
    
    if (productCode && productCode !== "N/A") {
      return `${quantityText}[${productCode}] - ${productName} a €${price.toFixed(2)}`
    } else {
      return `${quantityText}• ${productName} a €${price.toFixed(2)}`
    }
  }

  /**
   * Format a product option for disambiguation
   * @param productCode - Product code (e.g., "00004")
   * @param productName - Product name
   * @param price - Product price
   */
  static formatProductOption(productCode: string, productName: string, price: number): string {
    return `• [${productCode}] - ${productName} - €${price.toFixed(2)}`
  }

  /**
   * Format price consistently
   * @param price - Price value
   */
  static formatPrice(price: number): string {
    return `€${price.toFixed(2)}`
  }
}
