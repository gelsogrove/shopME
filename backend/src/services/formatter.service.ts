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
