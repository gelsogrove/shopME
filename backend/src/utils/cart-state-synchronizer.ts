/**
 * Cart State Synchronizer
 * Ensures consistency between different cart operation paths
 * Solves: Problem #3 - Cart State Synchronization Issues
 */

import { cartLockManager } from './cart-lock-manager'
import { conversationContext } from './conversation-context'

export interface CartState {
  customerId: string
  workspaceId: string
  items: CartItem[]
  totalAmount: number
  totalItems: number
  lastUpdated: Date
  lastOperation: string
  checksum: string
}

export interface CartItem {
  id: string
  productId: string
  productName: string
  productCode?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  addedAt: Date
  updatedAt: Date
}

export interface CartValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  inconsistencies: CartInconsistency[]
}

export interface CartInconsistency {
  type: 'quantity_mismatch' | 'price_mismatch' | 'missing_item' | 'extra_item' | 'checksum_invalid'
  field: string
  expected: any
  actual: any
  severity: 'error' | 'warning'
}

/**
 * Cart State Synchronizer
 * Maintains consistency across all cart operations
 */
export class CartStateSynchronizer {
  private static instance: CartStateSynchronizer
  private stateCache = new Map<string, CartState>()
  private syncQueue = new Map<string, (() => Promise<void>)[]>()
  
  // Configuration
  private readonly CACHE_TTL = 10 * 60 * 1000 // 10 minutes
  private readonly SYNC_BATCH_SIZE = 5
  private readonly VALIDATION_INTERVAL = 30 * 1000 // 30 seconds

  private constructor() {
    this.startValidationTimer()
  }

  public static getInstance(): CartStateSynchronizer {
    if (!CartStateSynchronizer.instance) {
      CartStateSynchronizer.instance = new CartStateSynchronizer()
    }
    return CartStateSynchronizer.instance
  }

  /**
   * Synchronize cart state after any operation
   */
  public async syncCartState(
    customerId: string,
    workspaceId: string,
    operation: string,
    prismaResult: any
  ): Promise<CartState> {
    const stateKey = this.getStateKey(customerId, workspaceId)
    
    // console.log(`🔄 Syncing cart state for ${customerId} after ${operation}`)
    
    // Execute with lock to prevent race conditions
    return cartLockManager.executeWithLock(
      customerId,
      workspaceId,
      'view',
      async () => {
        // Get current state from database
        const freshState = await this.fetchCartFromDatabase(customerId, workspaceId)
        
        // Calculate checksum for integrity verification
        const checksum = this.calculateChecksum(freshState)
        
        const newState: CartState = {
          customerId,
          workspaceId,
          items: freshState.items,
          totalAmount: freshState.totalAmount,
          totalItems: freshState.totalItems,
          lastUpdated: new Date(),
          lastOperation: operation,
          checksum
        }
        
        // Update cache
        this.stateCache.set(stateKey, newState)
        
        // Update conversation context
        conversationContext.saveCartOperation(customerId, workspaceId, {
          success: true,
          operation: operation as any,
          message: `Cart synchronized after ${operation}`,
          cart: {
            items: newState.items,
            total: newState.totalAmount,
            count: newState.totalItems
          }
        })
        
        // console.log(`✅ Cart state synced for ${customerId}: ${newState.totalItems} items, €${newState.totalAmount}`)
        
        return newState
      }
    )
  }

  /**
   * Get current cart state (cached or fresh)
   */
  public async getCartState(customerId: string, workspaceId: string): Promise<CartState | null> {
    const stateKey = this.getStateKey(customerId, workspaceId)
    const cached = this.stateCache.get(stateKey)
    
    // Return cached if still valid
    if (cached && this.isCacheValid(cached)) {
      return cached
    }
    
    // Fetch fresh state
    try {
      return await this.syncCartState(customerId, workspaceId, 'refresh', null)
    } catch (error) {
      console.error(`❌ Failed to fetch cart state for ${customerId}:`, error)
      return null
    }
  }

  /**
   * Validate cart state consistency
   */
  public async validateCartState(customerId: string, workspaceId: string): Promise<CartValidationResult> {
    const state = await this.getCartState(customerId, workspaceId)
    const result: CartValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      inconsistencies: []
    }
    
    if (!state) {
      result.isValid = false
      result.errors.push('Cart state not found')
      return result
    }
    
    // Validate checksum
    const currentChecksum = this.calculateChecksum(state)
    if (currentChecksum !== state.checksum) {
      result.inconsistencies.push({
        type: 'checksum_invalid',
        field: 'checksum',
        expected: state.checksum,
        actual: currentChecksum,
        severity: 'error'
      })
      result.isValid = false
      result.errors.push('Cart checksum mismatch - data integrity compromised')
    }
    
    // Validate totals
    const calculatedTotal = state.items.reduce((sum, item) => sum + item.totalPrice, 0)
    const calculatedCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    
    if (Math.abs(calculatedTotal - state.totalAmount) > 0.01) {
      result.inconsistencies.push({
        type: 'price_mismatch',
        field: 'totalAmount',
        expected: calculatedTotal,
        actual: state.totalAmount,
        severity: 'error'
      })
      result.isValid = false
      result.errors.push(`Total amount mismatch: expected €${calculatedTotal}, got €${state.totalAmount}`)
    }
    
    if (calculatedCount !== state.totalItems) {
      result.inconsistencies.push({
        type: 'quantity_mismatch',
        field: 'totalItems',
        expected: calculatedCount,
        actual: state.totalItems,
        severity: 'error'
      })
      result.isValid = false
      result.errors.push(`Total items mismatch: expected ${calculatedCount}, got ${state.totalItems}`)
    }
    
    // Validate individual items
    for (const item of state.items) {
      const expectedTotal = item.quantity * item.unitPrice
      if (Math.abs(expectedTotal - item.totalPrice) > 0.01) {
        result.inconsistencies.push({
          type: 'price_mismatch',
          field: `item_${item.id}_totalPrice`,
          expected: expectedTotal,
          actual: item.totalPrice,
          severity: 'error'
        })
        result.isValid = false
        result.errors.push(`Item ${item.productName} total price mismatch`)
      }
      
      if (item.quantity <= 0) {
        result.inconsistencies.push({
          type: 'quantity_mismatch',
          field: `item_${item.id}_quantity`,
          expected: '>0',
          actual: item.quantity,
          severity: 'error'
        })
        result.isValid = false
        result.errors.push(`Item ${item.productName} has invalid quantity: ${item.quantity}`)
      }
    }
    
    // Check for stale data
    const age = Date.now() - state.lastUpdated.getTime()
    if (age > this.CACHE_TTL) {
      result.warnings.push(`Cart state is ${Math.round(age / 1000)}s old - consider refreshing`)
    }
    
    return result
  }

  /**
   * Force refresh cart state from database
   */
  public async forceRefresh(customerId: string, workspaceId: string): Promise<CartState> {
    const stateKey = this.getStateKey(customerId, workspaceId)
    
    // Clear cache to force refresh
    this.stateCache.delete(stateKey)
    
    return this.syncCartState(customerId, workspaceId, 'force_refresh', null)
  }

  /**
   * Get state comparison between cached and fresh data
   */
  public async compareStates(customerId: string, workspaceId: string): Promise<{
    cached: CartState | null
    fresh: CartState
    differences: string[]
  }> {
    const stateKey = this.getStateKey(customerId, workspaceId)
    const cached = this.stateCache.get(stateKey) || null
    
    // Force fetch fresh state
    this.stateCache.delete(stateKey)
    const fresh = await this.syncCartState(customerId, workspaceId, 'compare', null)
    
    const differences: string[] = []
    
    if (!cached) {
      differences.push('No cached state available')
    } else {
      if (cached.totalAmount !== fresh.totalAmount) {
        differences.push(`Total amount: ${cached.totalAmount} → ${fresh.totalAmount}`)
      }
      if (cached.totalItems !== fresh.totalItems) {
        differences.push(`Total items: ${cached.totalItems} → ${fresh.totalItems}`)
      }
      if (cached.items.length !== fresh.items.length) {
        differences.push(`Item count: ${cached.items.length} → ${fresh.items.length}`)
      }
      if (cached.checksum !== fresh.checksum) {
        differences.push(`Checksum changed: data modified`)
      }
    }
    
    return { cached, fresh, differences }
  }

  /**
   * Batch synchronize multiple customers
   */
  public async batchSync(customerIds: { customerId: string, workspaceId: string }[]): Promise<void> {
    // console.log(`🔄 Batch syncing ${customerIds.length} customers`)
    
    for (let i = 0; i < customerIds.length; i += this.SYNC_BATCH_SIZE) {
      const batch = customerIds.slice(i, i + this.SYNC_BATCH_SIZE)
      
      await Promise.allSettled(
        batch.map(({ customerId, workspaceId }) =>
          this.forceRefresh(customerId, workspaceId)
        )
      )
      
      // console.log(`✅ Synced batch ${Math.floor(i / this.SYNC_BATCH_SIZE) + 1}`)
    }
  }

  // Private methods

  private async fetchCartFromDatabase(customerId: string, workspaceId: string): Promise<{
    items: CartItem[]
    totalAmount: number
    totalItems: number
  }> {
    // console.log(`📊 Fetching cart from DB for ${customerId}`)
    
    try {
      // Import Prisma dynamically to avoid circular dependencies
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      // Get cart with all items and product details
      const cart = await prisma.carts.findFirst({
        where: {
          customerId,
          workspaceId
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      })
      
      if (!cart) {
        // console.log(`📊 No cart found for customer ${customerId}`)
        return {
          items: [],
          totalAmount: 0,
          totalItems: 0
        }
      }
      
      // Transform database items to CartItem format
      const items: CartItem[] = cart.items.map(item => {
        // 🎯 TASK: Handle missing product gracefully
        if (!item.product) {
          console.warn(`⚠️ Cart item ${item.id} has missing product (productId: ${item.productId})`)
          return {
            id: item.id,
            productId: item.productId,
            productName: `Product ${item.productId} (Not Found)`,
            productCode: 'N/A',
            quantity: item.quantity,
            unitPrice: 0,
            totalPrice: 0,
            addedAt: item.createdAt,
            updatedAt: item.updatedAt
          }
        }

        return {
          id: item.id,
          productId: item.productId,
          productName: item.product.name || `Product ${item.productId}`,
          productCode: item.product.ProductCode || item.product.sku || 'N/A',
          quantity: item.quantity,
          unitPrice: item.product.price || 0,
          totalPrice: (item.product.price || 0) * item.quantity,
          addedAt: item.createdAt,
          updatedAt: item.updatedAt
        }
      })
      
      // Calculate totals
      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
      
      // console.log(`📊 Fetched cart: ${totalItems} items, €${totalAmount.toFixed(2)}`)
      
      await prisma.$disconnect()
      
      return {
        items,
        totalAmount,
        totalItems
      }
      
    } catch (error) {
      console.error(`❌ Error fetching cart from database:`, error)
      
      // Return empty cart on error to prevent crashes
      return {
        items: [],
        totalAmount: 0,
        totalItems: 0
      }
    }
  }

  private calculateChecksum(state: CartState | Partial<CartState>): string {
    const data = {
      customerId: state.customerId,
      workspaceId: state.workspaceId,
      items: state.items?.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })) || [],
      totalAmount: state.totalAmount || 0,
      totalItems: state.totalItems || 0
    }
    
    const jsonString = JSON.stringify(data, Object.keys(data).sort())
    
    // Simple hash function - in production use crypto.createHash
    let hash = 0
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    
    return hash.toString(16)
  }

  private getStateKey(customerId: string, workspaceId: string): string {
    return `${workspaceId}:${customerId}`
  }

  private isCacheValid(state: CartState): boolean {
    const age = Date.now() - state.lastUpdated.getTime()
    return age < this.CACHE_TTL
  }

  private startValidationTimer(): void {
    setInterval(() => {
      this.performPeriodicValidation()
    }, this.VALIDATION_INTERVAL)
    
    // console.log('🔍 Cart validation timer started')
  }

  private async performPeriodicValidation(): Promise<void> {
    // console.log('🔍 Performing periodic cart validation...')
    
    let validatedCount = 0
    let errorCount = 0
    
    for (const [key, state] of this.stateCache.entries()) {
      try {
        const [workspaceId, customerId] = key.split(':')
        const validation = await this.validateCartState(customerId, workspaceId)
        
        if (!validation.isValid) {
          console.warn(`⚠️ Cart validation failed for ${customerId}:`, validation.errors)
          errorCount++
          
          // Auto-fix if possible
          await this.forceRefresh(customerId, workspaceId)
        }
        
        validatedCount++
        
      } catch (error) {
        console.error(`❌ Validation error for ${key}:`, error)
        errorCount++
      }
    }
    
    // if (validatedCount > 0) {
    //   console.log(`✅ Validated ${validatedCount} carts, ${errorCount} errors`)
    // }
  }

  /**
   * Get synchronizer statistics
   */
  public getStats(): {
    cachedStates: number
    validStates: number
    oldStates: number
  } {
    let validStates = 0
    let oldStates = 0
    
    for (const state of this.stateCache.values()) {
      if (this.isCacheValid(state)) {
        validStates++
      } else {
        oldStates++
      }
    }
    
    return {
      cachedStates: this.stateCache.size,
      validStates,
      oldStates
    }
  }

  public destroy(): void {
    this.stateCache.clear()
    this.syncQueue.clear()
  }
}

// Export singleton instance
export const cartStateSynchronizer = CartStateSynchronizer.getInstance()
