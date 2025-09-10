/**
 * Conversation Context Management System
 * Handles disambiguation persistence and conversation state
 * Solves: Problem #1 - Context Memory Loss
 */

export interface ConversationContext {
  customerId: string
  workspaceId: string
  lastProductList?: Product[]
  disambiguationExpiry?: Date
  lastSearchQuery?: string
  lastCartOperation?: CartOperationResult
  contextType?: 'product_disambiguation' | 'cart_operation' | 'general'
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  price: number
  stock: number
  ProductCode?: string
  sku?: string
  description?: string
  category?: {
    id: string
    name: string
  }
}

export interface CartOperationResult {
  success: boolean
  operation: 'add' | 'remove' | 'clear' | 'view'
  message: string
  addedProduct?: {
    id: string
    name: string
    quantity: number
    price: number
  }
  cart?: {
    items: any[]
    total: number
    count: number
  }
}

/**
 * Context Cache Manager
 * In-memory cache with TTL and automatic cleanup
 */
export class ConversationContextManager {
  private static instance: ConversationContextManager
  private contextCache = new Map<string, ConversationContext>()
  private cleanupInterval: NodeJS.Timeout
  
  // TTL constants
  private readonly DISAMBIGUATION_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly GENERAL_CONTEXT_TTL = 30 * 60 * 1000 // 30 minutes
  private readonly CLEANUP_INTERVAL = 60 * 1000 // 1 minute

  private constructor() {
    this.startCleanupTimer()
  }

  public static getInstance(): ConversationContextManager {
    if (!ConversationContextManager.instance) {
      ConversationContextManager.instance = new ConversationContextManager()
    }
    return ConversationContextManager.instance
  }

  /**
   * Get conversation context for customer
   */
  public getContext(customerId: string, workspaceId: string): ConversationContext | null {
    const key = this.getContextKey(customerId, workspaceId)
    const context = this.contextCache.get(key)
    
    if (!context) {
      return null
    }
    
    // Check if context is expired
    if (this.isContextExpired(context)) {
      this.contextCache.delete(key)
      return null
    }
    
    return context
  }

  /**
   * Set conversation context
   */
  public setContext(context: ConversationContext): void {
    const key = this.getContextKey(context.customerId, context.workspaceId)
    
    // Set expiry based on context type
    const now = new Date()
    const ttl = context.contextType === 'product_disambiguation' 
      ? this.DISAMBIGUATION_TTL 
      : this.GENERAL_CONTEXT_TTL
    
    context.disambiguationExpiry = new Date(now.getTime() + ttl)
    context.updatedAt = now
    
    this.contextCache.set(key, context)
    
    // console.log(`💾 Context saved for ${context.customerId}: ${context.contextType}`)
  }

  /**
   * Update existing context with new data
   */
  public updateContext(
    customerId: string, 
    workspaceId: string, 
    updates: Partial<ConversationContext>
  ): ConversationContext | null {
    const existing = this.getContext(customerId, workspaceId)
    
    if (!existing) {
      // Create new context if none exists
      const newContext: ConversationContext = {
        customerId,
        workspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...updates
      }
      this.setContext(newContext)
      return newContext
    }
    
    // Update existing context
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    }
    
    this.setContext(updated)
    return updated
  }

  /**
   * Save product list for disambiguation
   */
  public saveProductList(
    customerId: string, 
    workspaceId: string, 
    products: Product[], 
    searchQuery: string
  ): void {
    this.updateContext(customerId, workspaceId, {
      lastProductList: products,
      lastSearchQuery: searchQuery,
      contextType: 'product_disambiguation'
    })
    
    // console.log(`🔍 Saved ${products.length} products for disambiguation: "${searchQuery}"`)
  }

  /**
   * Get product from previous list by index/reference
   */
  public getProductByReference(
    customerId: string, 
    workspaceId: string, 
    reference: string
  ): Product | null {
    const context = this.getContext(customerId, workspaceId)
    
    if (!context || !context.lastProductList || context.lastProductList.length === 0) {
      return null
    }
    
    // Parse reference ("1", "prima", "first", etc.)
    const index = this.parseProductReference(reference, context.lastProductList.length)
    
    if (index >= 0 && index < context.lastProductList.length) {
      const product = context.lastProductList[index]
      // console.log(`👆 Selected product ${index + 1}: ${product.name}`)
      return product
    }
    
    return null
  }

  /**
   * Save cart operation result for context
   */
  public saveCartOperation(
    customerId: string, 
    workspaceId: string, 
    operation: CartOperationResult
  ): void {
    this.updateContext(customerId, workspaceId, {
      lastCartOperation: operation,
      contextType: 'cart_operation'
    })
    
    // console.log(`🛒 Saved cart operation: ${operation.operation} - ${operation.success ? 'SUCCESS' : 'FAILED'}`)
  }

  /**
   * Clear context for customer
   */
  public clearContext(customerId: string, workspaceId: string): void {
    const key = this.getContextKey(customerId, workspaceId)
    this.contextCache.delete(key)
    // console.log(`🗑️ Cleared context for ${customerId}`)
  }

  /**
   * Get cache statistics
   */
  public getStats(): { totalContexts: number; activeContexts: number } {
    const now = new Date()
    let activeContexts = 0
    
    for (const context of this.contextCache.values()) {
      if (!this.isContextExpired(context)) {
        activeContexts++
      }
    }
    
    return {
      totalContexts: this.contextCache.size,
      activeContexts
    }
  }

  // Private methods

  private getContextKey(customerId: string, workspaceId: string): string {
    return `${workspaceId}:${customerId}`
  }

  private isContextExpired(context: ConversationContext): boolean {
    if (!context.disambiguationExpiry) {
      return false
    }
    return new Date() > context.disambiguationExpiry
  }

  private parseProductReference(reference: string, listLength: number): number {
    const ref = reference.toLowerCase().trim()
    
    // Numeric references
    const numMatch = ref.match(/^(\d+)$/)
    if (numMatch) {
      const num = parseInt(numMatch[1])
      return num - 1 // Convert to 0-based index
    }
    
    // Language-specific references
    const referenceMap: Record<string, number> = {
      // Italian
      'primo': 0, 'prima': 0, 'secondo': 1, 'seconda': 1, 'terzo': 2, 'terza': 2,
      // English  
      'first': 0, 'second': 1, 'third': 2, 'fourth': 3, 'fifth': 4,
      // Spanish
      'primero': 0, 'primera': 0, 'segundoes': 1, 'segundaes': 1, 'tercero': 2, 'tercera': 2,
      // Portuguese
      'primeiro': 0, 'primeira': 0, 'segundopt': 1, 'segundapt': 1, 'terceiro': 2, 'terceira': 2
    }
    
    if (ref in referenceMap) {
      return referenceMap[ref]
    }
    
    return -1 // Invalid reference
  }

  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup()
    }, this.CLEANUP_INTERVAL)
    
    // console.log('🧹 Context cleanup timer started')
  }

  private performCleanup(): void {
    const now = new Date()
    let cleanedCount = 0
    
    for (const [key, context] of this.contextCache.entries()) {
      if (this.isContextExpired(context)) {
        this.contextCache.delete(key)
        cleanedCount++
      }
    }
    
    // if (cleanedCount > 0) {
    //   console.log(`🧹 Cleaned ${cleanedCount} expired contexts`)
    // }
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.contextCache.clear()
  }
}

// Export singleton instance
export const conversationContext = ConversationContextManager.getInstance()
