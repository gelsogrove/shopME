/**
 * Smart Cart Routing System
 * Intelligent decision logic between SearchRAG path vs LLM calling functions path
 * Solves: Problem #3 - Missing intelligent routing logic
 */

import { detectCartIntent, type CartIntentResult } from './cart-intent-detector'
import { conversationContext } from './conversation-context'
import logger from './logger'

export interface RoutingDecision {
  path: 'searchrag' | 'calling_functions' | 'hybrid'
  confidence: number
  reason: string
  action: 'search_then_add' | 'direct_function' | 'disambiguation' | 'context_lookup'
  metadata: {
    hasProductCode: boolean
    hasProductContext: boolean
    requiresSearch: boolean
    hasCartIntent: boolean
    messageType: 'product_query' | 'cart_operation' | 'mixed' | 'unclear'
  }
}

export interface SmartRoutingContext {
  message: string
  customerId: string
  workspaceId: string
  conversationHistory?: any[]
  availableProducts?: string[]
}

/**
 * Smart Cart Router
 * Decides the optimal path for cart operations
 */
export class SmartCartRouter {
  private static instance: SmartCartRouter

  // Configuration thresholds
  private readonly SEARCHRAG_CONFIDENCE_THRESHOLD = 0.7
  private readonly CALLING_FUNCTIONS_CONFIDENCE_THRESHOLD = 0.8
  private readonly PRODUCT_CODE_PATTERNS = /^[A-Z0-9]{3,10}$|^SKU[0-9]+$|^[0-9]{8,13}$/
  private readonly DIRECT_CART_PATTERNS = {
    it: ['mostra carrello', 'vedi carrello', 'carrello', 'svuota carrello', 'cancella carrello'],
    en: ['show cart', 'view cart', 'cart', 'clear cart', 'empty cart'],
    es: ['mostrar carrito', 'ver carrito', 'carrito', 'vaciar carrito'],
    pt: ['mostrar carrinho', 'ver carrinho', 'carrinho', 'esvaziar carrinho']
  }

  public static getInstance(): SmartCartRouter {
    if (!SmartCartRouter.instance) {
      SmartCartRouter.instance = new SmartCartRouter()
    }
    return SmartCartRouter.instance
  }

  /**
   * Main routing decision method
   */
  public async route(context: SmartRoutingContext): Promise<RoutingDecision> {
    logger.info(`🧠 Smart routing for: "${context.message}"`)

    // Step 1: Analyze message intent
    const cartIntent = detectCartIntent(context.message)
    const messageAnalysis = this.analyzeMessage(context.message)
    
    // Step 2: Check conversation context
    const conversationCtx = conversationContext.getContext(context.customerId, context.workspaceId)
    
    // Step 3: Apply routing logic
    const decision = this.makeRoutingDecision(
      context,
      cartIntent,
      messageAnalysis,
      conversationCtx
    )

    logger.info(`🧠 Routing decision: ${decision.path} (${decision.confidence.toFixed(2)}) - ${decision.reason}`)
    
    return decision
  }

  /**
   * Analyze message characteristics
   */
  private analyzeMessage(message: string): {
    hasProductCode: boolean
    hasProductName: boolean
    hasQuantity: boolean
    isDirectCartCommand: boolean
    messageType: 'product_query' | 'cart_operation' | 'mixed' | 'unclear'
    language: 'it' | 'en' | 'es' | 'pt' | 'unknown'
  } {
    const normalizedMessage = message.toLowerCase().trim()
    
    // Detect language and direct cart commands
    let language: 'it' | 'en' | 'es' | 'pt' | 'unknown' = 'unknown'
    let isDirectCartCommand = false
    
    for (const [lang, patterns] of Object.entries(this.DIRECT_CART_PATTERNS)) {
      if (patterns.some(pattern => normalizedMessage.includes(pattern))) {
        language = lang as any
        isDirectCartCommand = true
        break
      }
    }
    
    // Detect product codes (SKU, barcode, etc.)
    const hasProductCode = this.PRODUCT_CODE_PATTERNS.test(message)
    
    // Detect product names (contains letters and not just cart commands)
    const hasProductName = /[a-zA-Z]{3,}/.test(message) && !isDirectCartCommand
    
    // Detect quantities
    const hasQuantity = /\b\d+\b|uno|due|tre|one|two|three|primeiro|segundo/.test(normalizedMessage)
    
    // Determine message type
    let messageType: 'product_query' | 'cart_operation' | 'mixed' | 'unclear' = 'unclear'
    
    if (isDirectCartCommand && !hasProductName) {
      messageType = 'cart_operation'
    } else if (hasProductName && !isDirectCartCommand) {
      messageType = 'product_query'
    } else if (hasProductName && isDirectCartCommand) {
      messageType = 'mixed'
    }
    
    return {
      hasProductCode,
      hasProductName,
      hasQuantity,
      isDirectCartCommand,
      messageType,
      language
    }
  }

  /**
   * Core routing decision logic
   */
  private makeRoutingDecision(
    context: SmartRoutingContext,
    cartIntent: CartIntentResult,
    messageAnalysis: any,
    conversationCtx: any
  ): RoutingDecision {
    
    // RULE 1: Direct cart operations → Calling Functions
    if (messageAnalysis.isDirectCartCommand && !messageAnalysis.hasProductName) {
      return {
        path: 'calling_functions',
        confidence: 0.95,
        reason: 'Direct cart command detected (show/clear cart)',
        action: 'direct_function',
        metadata: {
          hasProductCode: messageAnalysis.hasProductCode,
          hasProductContext: !!conversationCtx?.lastProductList,
          requiresSearch: false,
          hasCartIntent: cartIntent.hasCartIntent,
          messageType: messageAnalysis.messageType
        }
      }
    }

    // RULE 2: Product code with cart intent → Calling Functions
    if (messageAnalysis.hasProductCode && cartIntent.hasCartIntent) {
      return {
        path: 'calling_functions',
        confidence: 0.9,
        reason: 'Product code with cart intent - direct function call',
        action: 'direct_function',
        metadata: {
          hasProductCode: true,
          hasProductContext: !!conversationCtx?.lastProductList,
          requiresSearch: false,
          hasCartIntent: true,
          messageType: messageAnalysis.messageType
        }
      }
    }

    // RULE 3: Product name with cart intent → SearchRAG
    if (messageAnalysis.hasProductName && cartIntent.hasCartIntent && cartIntent.confidence > 0.7) {
      return {
        path: 'searchrag',
        confidence: cartIntent.confidence,
        reason: 'Product name with cart intent - requires search for product matching',
        action: 'search_then_add',
        metadata: {
          hasProductCode: messageAnalysis.hasProductCode,
          hasProductContext: !!conversationCtx?.lastProductList,
          requiresSearch: true,
          hasCartIntent: true,
          messageType: messageAnalysis.messageType
        }
      }
    }

    // RULE 4: Context-based disambiguation → Calling Functions
    if (conversationCtx?.lastProductList && this.isDisambiguationResponse(context.message)) {
      return {
        path: 'calling_functions',
        confidence: 0.85,
        reason: 'Disambiguation response with existing product context',
        action: 'context_lookup',
        metadata: {
          hasProductCode: messageAnalysis.hasProductCode,
          hasProductContext: true,
          requiresSearch: false,
          hasCartIntent: true,
          messageType: messageAnalysis.messageType
        }
      }
    }

    // RULE 5: Product search without cart intent → SearchRAG
    if (messageAnalysis.hasProductName && !cartIntent.hasCartIntent) {
      return {
        path: 'searchrag',
        confidence: 0.8,
        reason: 'Product search without explicit cart intent',
        action: 'search_then_add',
        metadata: {
          hasProductCode: messageAnalysis.hasProductCode,
          hasProductContext: !!conversationCtx?.lastProductList,
          requiresSearch: true,
          hasCartIntent: false,
          messageType: messageAnalysis.messageType
        }
      }
    }

    // RULE 6: Hybrid approach for complex queries
    if (messageAnalysis.messageType === 'mixed') {
      return {
        path: 'hybrid',
        confidence: 0.6,
        reason: 'Complex query requires hybrid approach (search + functions)',
        action: 'search_then_add',
        metadata: {
          hasProductCode: messageAnalysis.hasProductCode,
          hasProductContext: !!conversationCtx?.lastProductList,
          requiresSearch: true,
          hasCartIntent: cartIntent.hasCartIntent,
          messageType: messageAnalysis.messageType
        }
      }
    }

    // DEFAULT: Low confidence → SearchRAG (safer option)
    return {
      path: 'searchrag',
      confidence: 0.3,
      reason: 'Unclear intent - defaulting to SearchRAG for safety',
      action: 'search_then_add',
      metadata: {
        hasProductCode: messageAnalysis.hasProductCode,
        hasProductContext: !!conversationCtx?.lastProductList,
        requiresSearch: true,
        hasCartIntent: cartIntent.hasCartIntent,
        messageType: messageAnalysis.messageType
      }
    }
  }

  /**
   * Check if message is a disambiguation response
   */
  private isDisambiguationResponse(message: string): boolean {
    const normalized = message.toLowerCase().trim()
    
    // Numeric responses
    if (/^[1-5]$/.test(normalized)) {
      return true
    }
    
    // Language-specific disambiguation responses
    const disambiguationPatterns = [
      // Italian
      'primo', 'prima', 'secondo', 'seconda', 'terzo', 'terza',
      // English
      'first', 'second', 'third', 'fourth', 'fifth',
      // Spanish
      'primero', 'primera', 'segundo', 'segunda', 'tercero', 'tercera',
      // Portuguese
      'primeiro', 'primeira', 'segundo', 'segunda', 'terceiro', 'terceira'
    ]
    
    return disambiguationPatterns.some(pattern => normalized.includes(pattern))
  }

  /**
   * Get routing statistics
   */
  public getRoutingStats(): {
    totalRoutes: number
    pathDistribution: Record<string, number>
    averageConfidence: number
  } {
    // This would track actual usage stats in production
    return {
      totalRoutes: 0,
      pathDistribution: {
        searchrag: 0,
        calling_functions: 0,
        hybrid: 0
      },
      averageConfidence: 0
    }
  }

  /**
   * Test routing with sample messages
   */
  public async testRouting(testMessages: string[]): Promise<RoutingDecision[]> {
    const results: RoutingDecision[] = []
    
    for (const message of testMessages) {
      const context: SmartRoutingContext = {
        message,
        customerId: 'test_customer',
        workspaceId: 'test_workspace'
      }
      
      const decision = await this.route(context)
      results.push(decision)
    }
    
    return results
  }
}

// Export singleton instance
export const smartCartRouter = SmartCartRouter.getInstance()

// Test routing decisions
export const ROUTING_TEST_CASES = [
  // Direct cart operations
  'mostra carrello',
  'show cart', 
  'svuota carrello',
  
  // Product codes with cart intent
  'aggiungi SKU123 al carrello',
  'add ABC123 to cart',
  
  // Product names with cart intent
  'aggiungi mozzarella al carrello',
  'add cheese to cart',
  'metti pane nel carrello',
  
  // Product search without cart intent
  'mozzarella',
  'cheese varieties',
  'pane integrale',
  
  // Disambiguation responses
  '1',
  'primo',
  'first',
  'primero',
  
  // Mixed/complex queries
  'cercami vino rosso e aggiungilo al carrello',
  'find red wine and add 2 bottles to my cart'
]
