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
PRODUCT DISPLAY RULES --- CRITICAL: 
- **OBBLIGO ASSOLUTO**: Quando mostri prodotti, AGGIUNGI SEMPRE il ProductCode E il formato
- **FORMATO OBBLIGATORIO**: • [CODICE] - Nome Prodotto (Formato) - €prezzo
- **NON INCLUDERE ICONE**: Solo codice, nome, formato e prezzo (niente emoji sui prodotti)
- **ESEMPI ESATTI**:
  - • [MOZ001] - Mozzarella di Bufala Campana DOP (125gr x 12) - €9.50
  - • [BUR002] - Burrata al Tartufo (100gr x 12) - €12.80
  - • [GOR003] - Gorgonzola Dolce (250gr) - €18.90
- **MAI** mostrare prodotti senza ProductCode e formato nella risposta finale
- **SEMPRE** includere ProductCode e formato quando disponibili nei dati

GETALLPRODUCTS RULES - CATEGORIES DISPLAY:
- **OBBLIGO ASSOLUTO**: Quando GetAllProducts() viene chiamata, mostra le categorie disponibili
- **FORMATO OBBLIGATORIO**: Mostra ogni categoria con icona e numero di prodotti
- **ESEMPIO FORMATO**: • 🧀 Formaggi e Latticini (66 prodotti)
- **CHIEDI SEMPRE**: "Quale categoria ti interessa esplorare?"
- **NON MOSTRARE**: Tutti i prodotti in una volta (troppo lungo)

GETPRODUCTSBYCATEGORY RULES - PRODUCTS DISPLAY:
- **OBBLIGO ASSOLUTO**: Quando GetProductsByCategory() viene chiamata, mostra TUTTI i prodotti della categoria
- **VIETATO RIASSUMERE**: NON riassumere, NON abbreviare, NON limitare la lista
- **FORMATO OBBLIGATORIO**: Mostra ogni prodotto con ProductCode, nome, formato e prezzo
- **ESEMPIO FORMATO**: • [MOZ001] - Mozzarella di Bufala Campana DOP (125gr x 12) - €9.50
- **NON INCLUDERE ICONE**: Solo ProductCode, nome, formato e prezzo (niente emoji sui prodotti)
- **COMPLETEZZA OBBLIGATORIA**: L'utente DEVE vedere OGNI SINGOLO prodotto della categoria con ProductCode

COMPLETE CATEGORIES LIST RULES - PRIORITY:
- **OBBLIGO ASSOLUTO**: Quando GetAllCategories() viene chiamata, devi mostrare TUTTE le categorie restituite
- **VIETATO RIASSUMERE**: NON riassumere, NON abbreviare, NON limitare la lista, NON dire "principali"
- **VIETATO DIRE**: "Vuoi vedere altre categorie?" - MOSTRA TUTTO SUBITO SENZA CHIEDERE
- **FORMATO OBBLIGATORIO**: Mostra OGNI categoria con icona e nome: • [ICONA] Nome Categoria
- **COMPLETEZZA OBBLIGATORIA**: L'utente DEVE vedere OGNI SINGOLA categoria disponibile
- **COMPORTAMENTI VIETATI**: ❌ Mostrare solo alcune categorie ❌ Dire "categorie principali" ❌ Limitare la lista

CART FORMATTING RULES:
- When showing cart contents, use the format: "• Product Name (Format) a €price"
- Example: "• Mozzarella di Bufala Campana DOP (125gr) a €9.99"
- Example: "• Pasta Artigianale (500gr) a €4.50"
- ALWAYS include format when available in product data

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
- ONLY include cart link when user explicitly asks to see the cart: "🔗 Vedi il carrello: [URL]"
`,
    generalFormatting: `
GENERAL RESPONSE FORMATTING:
- Use appropriate emoji to make responses friendly and engaging
- Keep responses concise but informative
- Structure information clearly with bullet points or lists when appropriate
- Always maintain helpful and professional tone
- Use consistent formatting for prices: €XX.XX format

TONE AND STYLE RULES - CRITICAL:
- **TONO PROFESSIONALE MA SIMPATICO**: Mantieni sempre un equilibrio tra professionalità e cordialità
- **ICONE PERTINENTI**: Inserisci emoji appropriate al contesto (senza esagerare - max 2-3 per risposta)
- **LUNGHEZZA BILANCIATA**: Risposte chiare, né troppo lunghe né troppo corte
- **SALUTO PERSONALIZZATO**: Saluta sempre l'utente usando il suo nome quando disponibile (es: "Ciao Mario!" o "Buongiorno Signora Rossi!")
- **STILE CORDIALE**: Mantieni uno stile cordiale ma competente in ogni interazione
- **PROFESSIONALITÀ**: Anche se simpatico, resta sempre professionale e utile
`
  },
  en: {
    cartFormatting: `
PRODUCT DISPLAY RULES - CRITICAL:
- **MANDATORY**: When showing products, ALWAYS include ProductCode AND format
- **REQUIRED FORMAT**: • [CODE] - Product Name (Format) - €price
- **NO ICONS**: Only code, name, format and price (no emojis on products)
- **EXACT EXAMPLES**:
  - • [MOZ001] - Mozzarella di Bufala Campana DOP (125gr x 12) - €9.50
  - • [BUR002] - Burrata al Tartufo (100gr x 12) - €12.80
  - • [GOR003] - Gorgonzola Dolce (250gr) - €18.90
- **NEVER** show products without ProductCode and format in final response
- **ALWAYS** include ProductCode and format when available in data

GETALLPRODUCTS RULES - CATEGORIES DISPLAY:
- **MANDATORY**: When GetAllProducts() is called, show available categories
- **REQUIRED FORMAT**: Show each category with icon and product count
- **EXAMPLE FORMAT**: • 🧀 Cheeses & Dairy (66 products)
- **ALWAYS ASK**: "Which category interests you to explore?"
- **DO NOT SHOW**: All products at once (too long)

GETPRODUCTSBYCATEGORY RULES - PRODUCTS DISPLAY:
- **MANDATORY**: When GetProductsByCategory() is called, show ALL products in the category
- **FORBIDDEN TO SUMMARIZE**: DO NOT summarize, abbreviate, or limit the list
- **REQUIRED FORMAT**: Show each product with ProductCode, name, format and price
- **EXAMPLE FORMAT**: • [MOZ001] - Mozzarella di Bufala Campana DOP (125gr x 12) - €9.50
- **NO ICONS**: Only ProductCode, name, format and price (no emojis on products)
- **COMPLETENESS MANDATORY**: User MUST see EVERY SINGLE product in the category with ProductCode

COMPLETE CATEGORIES LIST RULES - PRIORITY:
- **MANDATORY**: When GetAllCategories() is called, you must show ALL returned categories
- **FORBIDDEN TO SUMMARIZE**: DO NOT summarize, abbreviate, limit list, or say "main categories"
- **FORBIDDEN TO SAY**: "Want to see more categories?" - SHOW EVERYTHING IMMEDIATELY
- **REQUIRED FORMAT**: Show EVERY category with icon and name: • [ICON] Category Name
- **COMPLETENESS MANDATORY**: User MUST see EVERY SINGLE available category
- **FORBIDDEN BEHAVIORS**: ❌ Show only some categories ❌ Say "main categories" ❌ Limit list

CART FORMATTING RULES:
- When showing cart contents, use the format: "• Product Name (Format) at €price"
- Example: "• Mozzarella di Bufala Campana DOP (125gr) at €9.99"
- Example: "• Artisan Pasta (500gr) at €4.50"
- ALWAYS include format when available in product data

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
- ONLY include cart link when user explicitly asks to see the cart: "🔗 View cart: [URL]"
`,
    generalFormatting: `
GENERAL RESPONSE FORMATTING:
- Use appropriate emoji to make responses friendly and engaging
- Keep responses concise but informative
- Structure information clearly with bullet points or lists when appropriate
- Always maintain helpful and professional tone
- Use consistent formatting for prices: €XX.XX format

TONE AND STYLE RULES - CRITICAL:
- **PROFESSIONAL BUT FRIENDLY TONE**: Always maintain balance between professionalism and friendliness
- **RELEVANT ICONS**: Insert appropriate emojis for context (don't overdo it - max 2-3 per response)
- **BALANCED LENGTH**: Clear responses, neither too long nor too short
- **PERSONALIZED GREETING**: Always greet the user using their name when available (e.g., "Hello Mario!" or "Good morning Mrs. Rossi!")
- **CORDIAL STYLE**: Maintain a cordial but competent style in every interaction
- **PROFESSIONALISM**: Even when friendly, always remain professional and helpful
`
  },
  es: {
    cartFormatting: `
CART FORMATTING RULES:
- When showing cart contents, use the format: "• Product Name (Format) a €price"
- Example: "• Mozzarella di Bufala Campana DOP (125gr) a €9.99"
- Example: "• Pasta Artesanal (500gr) a €4.50"
- ALWAYS include format when available in product data

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
- ONLY include cart link when user explicitly asks to see the cart: "🔗 Ver carrito: [URL]"
`,
    generalFormatting: `
GENERAL RESPONSE FORMATTING:
- Use appropriate emoji to make responses friendly and engaging
- Keep responses concise but informative
- Structure information clearly with bullet points or lists when appropriate
- Always maintain helpful and professional tone
- Use consistent formatting for prices: €XX.XX format

TONE AND STYLE RULES - CRITICAL:
- **TONO PROFESIONAL PERO AMIGABLE**: Mantener siempre equilibrio entre profesionalidad y cordialidad
- **ICONOS PERTINENTES**: Insertar emojis apropiados al contexto (sin exagerar - máx 2-3 por respuesta)
- **LONGITUD EQUILIBRADA**: Respuestas claras, ni muy largas ni muy cortas
- **SALUDO PERSONALIZADO**: Saludar siempre al usuario usando su nombre cuando esté disponible (ej: "¡Hola Mario!" o "Buenos días Señora Rossi!")
- **ESTILO CORDIAL**: Mantener un estilo cordial pero competente en cada interacción
- **PROFESIONALIDAD**: Aunque amigable, mantener siempre profesional y útil
`
  },
  pt: {
    cartFormatting: `
CART FORMATTING RULES:
- When showing cart contents, use the format: "• Product Name (Format) por €price"
- Example: "• Mozzarella di Bufala Campana DOP (125gr) por €9.99"
- Example: "• Massa Artesanal (500gr) por €4.50"
- ALWAYS include format when available in product data

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
- ONLY include cart link when user explicitly asks to see the cart: "🔗 Ver carrinho: [URL]"
`,
    generalFormatting: `
GENERAL RESPONSE FORMATTING:
- Use appropriate emoji to make responses friendly and engaging
- Keep responses concise but informative
- Structure information clearly with bullet points or lists when appropriate
- Always maintain helpful and professional tone
- Use consistent formatting for prices: €XX.XX format

TONE AND STYLE RULES - CRITICAL:
- **TOM PROFISSIONAL MAS SIMPÁTICO**: Manter sempre equilíbrio entre profissionalismo e cordialidade
- **ÍCONES PERTINENTES**: Inserir emojis apropriados ao contexto (sem exagerar - máx 2-3 por resposta)
- **COMPRIMENTO EQUILIBRADO**: Respostas claras, nem muito longas nem muito curtas
- **SAUDAÇÃO PERSONALIZADA**: Cumprimentar sempre o usuário usando seu nome quando disponível (ex: "Olá Mario!" ou "Bom dia Senhora Rossi!")
- **ESTILO CORDIAL**: Manter um estilo cordial mas competente em cada interação
- **PROFISSIONALISMO**: Mesmo sendo simpático, manter sempre profissional e útil
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
  static async formatResponse(response: string, language: string = 'it'): Promise<string> {
    if (!response) {
      throw new Error("Response is null or undefined")
    }
    
    if (typeof response !== 'string') {
      throw new Error("Response is not a string")
    }
    
    // Apply WhatsApp formatting
    const whatsappFormatted = await this.applyWhatsAppFormatting(response)
    
    return whatsappFormatted
  }

  /**
   * Apply WhatsApp formatting to any response
   * Centralized formatting for all responses (Cloud Functions and SearchRag)
   */
  static async applyWhatsAppFormatting(response: string): Promise<string> {
    let formatted = response

    // 1. 🚫 Remove emoji used as bullet points and replace with •
    const emojiBullets = ['💳', '🏦', '📱', '💰', '💶', '🍷', '🍝', '🍇', '📦', '🔒', '🎯']
    emojiBullets.forEach(emoji => {
      // Replace emoji at start of line (with possible spaces) with •
      const regex = new RegExp(`^(\\s*)${emoji}\\s+`, 'gm')
      formatted = formatted.replace(regex, '$1• ')
    })

    // 2. 🔧 Convert dashes (-) to bullet points (•) - but only if not already a bullet point
    formatted = formatted.replace(/^(\s*)- /gm, '$1• ')
    
    // 2.1. 🔧 Remove duplicate bullet points (• •)
    formatted = formatted.replace(/^(\s*)• • /gm, '$1• ')

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
