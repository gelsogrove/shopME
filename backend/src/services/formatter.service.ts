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
PRODUCT DISPLAY RULES - CRITICAL:
- **OBBLIGO ASSOLUTO**: Quando mostri prodotti, AGGIUNGI SEMPRE il formato
- **FORMATO OBBLIGATORIO**: • Nome Prodotto (Formato) - €prezzo
- **NON INCLUDERE ICONE**: Solo nome, formato e prezzo (niente emoji sui prodotti)
- **ESEMPI ESATTI**:
  - • Mozzarella di Bufala Campana DOP (125gr * 12) - €9.50
  - • Burrata al Tartufo (100gr * 12) - €12.80
  - • Gorgonzola Dolce (250gr) - €18.90
- **MAI** mostrare prodotti senza formato nella risposta finale
- **SEMPRE** includere formato quando disponibile nei dati

GETALLPRODUCTS RULES - CATEGORIES DISPLAY:
- **OBBLIGO ASSOLUTO**: Quando GetAllProducts() viene chiamata, mostra le categorie disponibili
- **FORMATO OBBLIGATORIO**: Mostra ogni categoria con icona e numero di prodotti
- **ESEMPIO FORMATO**: • 🧀 Formaggi e Latticini (66 prodotti)
- **CHIEDI SEMPRE**: "Quale categoria ti interessa esplorare?"
- **NON MOSTRARE**: Tutti i prodotti in una volta (troppo lungo)

GETPRODUCTSBYCATEGORY RULES - PRODUCTS DISPLAY:
- **OBBLIGO ASSOLUTO**: Quando GetProductsByCategory() viene chiamata, mostra TUTTI i prodotti della categoria
- **VIETATO RIASSUMERE**: NON riassumere, NON abbreviare, NON limitare la lista
- **FORMATO OBBLIGATORIO**: Mostra ogni prodotto con nome, formato e prezzo
- **ESEMPIO FORMATO**: • Mozzarella di Bufala Campana DOP (125gr * 12) - €9.50
- **NON INCLUDERE ICONE**: Solo nome, formato e prezzo (niente emoji sui prodotti)
- **COMPLETEZZA OBBLIGATORIA**: L'utente DEVE vedere OGNI SINGOLO prodotto della categoria

COMPLETE CATEGORIES LIST RULES - PRIORITY:
- **OBBLIGO ASSOLUTO**: Quando GetAllCategories() viene chiamata, devi mostrare TUTTE le categorie restituite
- **VIETATO RIASSUMERE**: NON riassumere, NON abbreviare, NON limitare la lista, NON dire "principali"
- **VIETATO DIRE**: "Vuoi vedere altre categorie?" - MOSTRA TUTTO SUBITO SENZA CHIEDERE
- **FORMATO OBBLIGATORIO**: Mostra OGNI categoria con icona e nome: • [ICONA] Nome Categoria
- **COMPLETEZZA OBBLIGATORIA**: L'utente DEVE vedere OGNI SINGOLA categoria disponibile
- **COMPORTAMENTI VIETATI**: ❌ Mostrare solo alcune categorie ❌ Dire "categorie principali" ❌ Limitare la lista

CART FORMATTING RULES:
- When showing cart contents, use the format: "• Product Name a €price"
- Example: "• Mozzarella di Bufala Campana DOP a €9.99"
- Example: "• Pasta Artigianale a €4.50"

PRODUCT DISAMBIGUATION RULES:
- When showing product options for disambiguation, use the format: "• Product Name - €price"
- Example: "• Mozzarella di Bufala Campana DOP - €9.99"
- Example: "• Mozzarella di Bufala - €12.50"

PRODUCT SELECTION RULES:
- Always prioritize name matching for product selection
- When user provides product name, search and disambiguate if multiple matches found
- Use exact name matching when possible for precision

CART RESPONSE FORMAT:
- Empty cart: When cart data shows isEmpty=true or items=[], respond naturally in the user's language with helpful suggestions
- Non-empty cart: Show itemized list with product names and totals
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
PRODUCT DISPLAY RULES - CRITICAL:
- **MANDATORY**: When showing products, ALWAYS include format
- **REQUIRED FORMAT**: • Product Name (Format) - €price
- **NO ICONS**: Only name, format and price (no emojis on products)
- **EXACT EXAMPLES**:
  - • Mozzarella di Bufala Campana DOP (125gr * 12) - €9.50
  - • Burrata al Tartufo (100gr * 12) - €12.80
  - • Gorgonzola Dolce (250gr) - €18.90
- **NEVER** show products without format in final response
- **ALWAYS** include format when available in data

GETALLPRODUCTS RULES - CATEGORIES DISPLAY:
- **MANDATORY**: When GetAllProducts() is called, show available categories
- **REQUIRED FORMAT**: Show each category with icon and product count
- **EXAMPLE FORMAT**: • 🧀 Cheeses & Dairy (66 products)
- **ALWAYS ASK**: "Which category interests you to explore?"
- **DO NOT SHOW**: All products at once (too long)

GETPRODUCTSBYCATEGORY RULES - PRODUCTS DISPLAY:
- **MANDATORY**: When GetProductsByCategory() is called, show ALL products in the category
- **FORBIDDEN TO SUMMARIZE**: DO NOT summarize, abbreviate, or limit the list
- **REQUIRED FORMAT**: Show each product with name, format and price
- **EXAMPLE FORMAT**: • Mozzarella di Bufala Campana DOP (125gr * 12) - €9.50
- **NO ICONS**: Only name, format and price (no emojis on products)
- **COMPLETENESS MANDATORY**: User MUST see EVERY SINGLE product in the category

COMPLETE CATEGORIES LIST RULES - PRIORITY:
- **MANDATORY**: When GetAllCategories() is called, you must show ALL returned categories
- **FORBIDDEN TO SUMMARIZE**: DO NOT summarize, abbreviate, limit list, or say "main categories"
- **FORBIDDEN TO SAY**: "Want to see more categories?" - SHOW EVERYTHING IMMEDIATELY
- **REQUIRED FORMAT**: Show EVERY category with icon and name: • [ICON] Category Name
- **COMPLETENESS MANDATORY**: User MUST see EVERY SINGLE available category
- **FORBIDDEN BEHAVIORS**: ❌ Show only some categories ❌ Say "main categories" ❌ Limit list

CART FORMATTING RULES:
- When showing cart contents, use the format: "• Product Name at €price"
- Example: "• Mozzarella di Bufala Campana DOP at €9.99"
- Example: "• Artisan Pasta at €4.50"

PRODUCT DISAMBIGUATION RULES:
- When showing product options for disambiguation, use the format: "• Product Name - €price"
- Example: "• Mozzarella di Bufala Campana DOP - €9.99"
- Example: "• Mozzarella di Bufala - €12.50"

PRODUCT SELECTION RULES:
- Always prioritize name matching for product selection
- When user provides product name, search and disambiguate if multiple matches found
- Use exact name matching when possible for precision

CART RESPONSE FORMAT:
- Empty cart: Show friendly message with suggestions
- Non-empty cart: Show itemized list with product names and totals
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
- When showing cart contents, use the format: "• Product Name a €price"
- Example: "• Mozzarella di Bufala Campana DOP a €9.99"
- Example: "• Pasta Artesanal a €4.50"

PRODUCT DISAMBIGUATION RULES:
- When showing product options for disambiguation, use the format: "• Product Name - €price"
- Example: "• Mozzarella di Bufala Campana DOP - €9.99"
- Example: "• Mozzarella di Bufala - €12.50"

PRODUCT SELECTION RULES:
- Always prioritize name matching for product selection
- When user provides product name, search and disambiguate if multiple matches found
- Use exact name matching when possible for precision

CART RESPONSE FORMAT:
- Empty cart: Show friendly message with suggestions
- Non-empty cart: Show itemized list with product names and totals
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
- When showing cart contents, use the format: "• Product Name por €price"
- Example: "• Mozzarella di Bufala Campana DOP por €9.99"
- Example: "• Massa Artesanal por €4.50"

PRODUCT DISAMBIGUATION RULES:
- When showing product options for disambiguation, use the format: "• Product Name - €price"
- Example: "• Mozzarella di Bufala Campana DOP - €9.99"
- Example: "• Mozzarella di Bufala - €12.50"

PRODUCT SELECTION RULES:
- Always prioritize name matching for product selection
- When user provides product name, search and disambiguate if multiple matches found
- Use exact name matching when possible for precision

CART RESPONSE FORMAT:
- Empty cart: Show friendly message with suggestions
- Non-empty cart: Show itemized list with product names and totals
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

    // 7. 🎯 PRODUCT ICONS DISABLED - No extra icons on products (only on categories)
    // formatted = this.applyProductIcons(formatted)

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
    return `${quantityText}• ${productName} a €${price.toFixed(2)}`
  }

  /**
   * Format a product option for disambiguation
   * @param productCode - Product code (e.g., "00004")
   * @param productName - Product name
   * @param price - Product price
   */
  static formatProductOption(productCode: string, productName: string, price: number): string {
    return `• ${productName} - €${price.toFixed(2)}`
  }

  /**
   * Format price consistently
   * @param price - Price value
   */
  static formatPrice(price: number): string {
    return `€${price.toFixed(2)}`
  }
}
