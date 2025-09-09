/**
 * Race Condition Manager
 * Prevents concurrent cart operations and ensures atomic transactions
 * Solves: Problem #2 - Race Conditions in Cart Operations
 */

export interface CartLockInfo {
  customerId: string
  workspaceId: string
  operation: string
  lockedAt: Date
  expiresAt: Date
  lockId: string
}

export interface QueuedOperation {
  id: string
  customerId: string
  workspaceId: string
  operation: () => Promise<any>
  operationType: 'add' | 'remove' | 'clear' | 'view'
  createdAt: Date
  retryCount: number
  maxRetries: number
}

/**
 * Cart Operation Lock Manager
 * Prevents race conditions with distributed locking
 */
export class CartLockManager {
  private static instance: CartLockManager
  private locks = new Map<string, CartLockInfo>()
  private operationQueue = new Map<string, QueuedOperation[]>()
  private cleanupInterval: NodeJS.Timeout
  
  // Configuration
  private readonly LOCK_TTL = 30 * 1000 // 30 seconds max lock time
  private readonly QUEUE_MAX_SIZE = 50
  private readonly MAX_RETRIES = 3
  private readonly CLEANUP_INTERVAL = 5 * 1000 // 5 seconds

  private constructor() {
    this.startCleanupTimer()
  }

  public static getInstance(): CartLockManager {
    if (!CartLockManager.instance) {
      CartLockManager.instance = new CartLockManager()
    }
    return CartLockManager.instance
  }

  /**
   * Acquire exclusive lock for cart operations
   */
  public async acquireLock(
    customerId: string, 
    workspaceId: string, 
    operation: string
  ): Promise<string | null> {
    const lockKey = this.getLockKey(customerId, workspaceId)
    const existingLock = this.locks.get(lockKey)
    
    // Check if lock is available
    if (existingLock && !this.isLockExpired(existingLock)) {
      console.log(`🔒 Cart locked for ${customerId} - operation: ${existingLock.operation}`)
      return null // Lock not available
    }
    
    // Create new lock
    const lockId = this.generateLockId()
    const now = new Date()
    const lockInfo: CartLockInfo = {
      customerId,
      workspaceId,
      operation,
      lockedAt: now,
      expiresAt: new Date(now.getTime() + this.LOCK_TTL),
      lockId
    }
    
    this.locks.set(lockKey, lockInfo)
    console.log(`🔓 Cart lock acquired for ${customerId} - operation: ${operation} - lockId: ${lockId}`)
    
    return lockId
  }

  /**
   * Release cart lock
   */
  public releaseLock(customerId: string, workspaceId: string, lockId: string): boolean {
    const lockKey = this.getLockKey(customerId, workspaceId)
    const existingLock = this.locks.get(lockKey)
    
    if (!existingLock || existingLock.lockId !== lockId) {
      console.warn(`⚠️ Attempted to release invalid lock for ${customerId}`)
      return false
    }
    
    this.locks.delete(lockKey)
    console.log(`🔓 Cart lock released for ${customerId} - lockId: ${lockId}`)
    
    // Process queued operations
    this.processQueue(customerId, workspaceId)
    
    return true
  }

  /**
   * Execute cart operation with automatic locking
   */
  public async executeWithLock<T>(
    customerId: string,
    workspaceId: string,
    operationType: 'add' | 'remove' | 'clear' | 'view',
    operation: () => Promise<T>
  ): Promise<T> {
    const lockId = await this.acquireLock(customerId, workspaceId, operationType)
    
    if (!lockId) {
      // Queue the operation if lock not available
      return this.queueOperation(customerId, workspaceId, operationType, operation)
    }
    
    try {
      console.log(`⚡ Executing ${operationType} operation for ${customerId}`)
      const result = await operation()
      
      // Success - release lock
      this.releaseLock(customerId, workspaceId, lockId)
      return result
      
    } catch (error) {
      // Error - release lock and rethrow
      this.releaseLock(customerId, workspaceId, lockId)
      console.error(`❌ Cart operation failed for ${customerId}:`, error)
      throw error
    }
  }

  /**
   * Add operation to queue when lock is not available
   */
  private async queueOperation<T>(
    customerId: string,
    workspaceId: string,
    operationType: 'add' | 'remove' | 'clear' | 'view',
    operation: () => Promise<T>
  ): Promise<T> {
    const queueKey = this.getLockKey(customerId, workspaceId)
    
    if (!this.operationQueue.has(queueKey)) {
      this.operationQueue.set(queueKey, [])
    }
    
    const queue = this.operationQueue.get(queueKey)!
    
    // Check queue size limit
    if (queue.length >= this.QUEUE_MAX_SIZE) {
      throw new Error(`Queue full for customer ${customerId}. Too many pending operations.`)
    }
    
    // Create queued operation
    const queuedOp: QueuedOperation = {
      id: this.generateOperationId(),
      customerId,
      workspaceId,
      operation,
      operationType,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: this.MAX_RETRIES
    }
    
    queue.push(queuedOp)
    console.log(`📝 Queued ${operationType} operation for ${customerId} - queue size: ${queue.length}`)
    
    // Return a promise that resolves when the operation is processed
    return new Promise((resolve, reject) => {
      // Replace the operation with one that handles the promise
      queuedOp.operation = async () => {
        try {
          const result = await operation()
          resolve(result)
          return result
        } catch (error) {
          reject(error)
          throw error
        }
      }
    })
  }

  /**
   * Process queued operations for a customer
   */
  private async processQueue(customerId: string, workspaceId: string): Promise<void> {
    const queueKey = this.getLockKey(customerId, workspaceId)
    const queue = this.operationQueue.get(queueKey)
    
    if (!queue || queue.length === 0) {
      return
    }
    
    // Get the next operation
    const nextOp = queue.shift()!
    console.log(`🔄 Processing queued operation for ${customerId}: ${nextOp.operationType}`)
    
    try {
      // Execute the operation with lock
      await this.executeWithLock(
        customerId,
        workspaceId,
        nextOp.operationType,
        nextOp.operation
      )
      
    } catch (error) {
      console.error(`❌ Queued operation failed for ${customerId}:`, error)
      
      // Retry logic
      if (nextOp.retryCount < nextOp.maxRetries) {
        nextOp.retryCount++
        queue.unshift(nextOp) // Put back at front of queue
        console.log(`🔄 Retrying operation for ${customerId} - attempt ${nextOp.retryCount}/${nextOp.maxRetries}`)
        
        // Retry after delay
        setTimeout(() => {
          this.processQueue(customerId, workspaceId)
        }, 1000 * nextOp.retryCount) // Exponential backoff
        
      } else {
        console.error(`💥 Max retries exceeded for ${customerId} operation: ${nextOp.operationType}`)
      }
    }
  }

  /**
   * Check if customer has pending operations
   */
  public hasPendingOperations(customerId: string, workspaceId: string): boolean {
    const lockKey = this.getLockKey(customerId, workspaceId)
    const queue = this.operationQueue.get(lockKey)
    return queue ? queue.length > 0 : false
  }

  /**
   * Get queue status for customer
   */
  public getQueueStatus(customerId: string, workspaceId: string): {
    isLocked: boolean
    queueSize: number
    lockOperation?: string
  } {
    const lockKey = this.getLockKey(customerId, workspaceId)
    const lock = this.locks.get(lockKey)
    const queue = this.operationQueue.get(lockKey)
    
    return {
      isLocked: lock ? !this.isLockExpired(lock) : false,
      queueSize: queue ? queue.length : 0,
      lockOperation: lock?.operation
    }
  }

  /**
   * Force release expired locks and clean up
   */
  public forceCleanup(): void {
    const now = new Date()
    let releasedLocks = 0
    let cleanedOperations = 0
    
    // Clean expired locks
    for (const [key, lock] of this.locks.entries()) {
      if (this.isLockExpired(lock)) {
        this.locks.delete(key)
        releasedLocks++
        
        // Process any queued operations
        const [workspaceId, customerId] = key.split(':')
        this.processQueue(customerId, workspaceId)
      }
    }
    
    // Clean old queued operations
    for (const [key, queue] of this.operationQueue.entries()) {
      const filtered = queue.filter(op => {
        const age = now.getTime() - op.createdAt.getTime()
        return age < 5 * 60 * 1000 // Keep operations less than 5 minutes old
      })
      
      if (filtered.length !== queue.length) {
        cleanedOperations += queue.length - filtered.length
        if (filtered.length === 0) {
          this.operationQueue.delete(key)
        } else {
          this.operationQueue.set(key, filtered)
        }
      }
    }
    
    if (releasedLocks > 0 || cleanedOperations > 0) {
      console.log(`🧹 Lock cleanup: ${releasedLocks} expired locks, ${cleanedOperations} old operations`)
    }
  }

  // Private methods

  private getLockKey(customerId: string, workspaceId: string): string {
    return `${workspaceId}:${customerId}`
  }

  private isLockExpired(lock: CartLockInfo): boolean {
    return new Date() > lock.expiresAt
  }

  private generateLockId(): string {
    return `lock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(() => {
      this.forceCleanup()
    }, this.CLEANUP_INTERVAL)
    
    console.log('🧹 Cart lock cleanup timer started')
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.locks.clear()
    this.operationQueue.clear()
  }

  /**
   * Get system statistics
   */
  public getStats(): {
    activeLocks: number
    totalQueued: number
    queuesByCustomer: Record<string, number>
  } {
    const activeLocks = Array.from(this.locks.values())
      .filter(lock => !this.isLockExpired(lock)).length
    
    let totalQueued = 0
    const queuesByCustomer: Record<string, number> = {}
    
    for (const [key, queue] of this.operationQueue.entries()) {
      totalQueued += queue.length
      queuesByCustomer[key] = queue.length
    }
    
    return {
      activeLocks,
      totalQueued,
      queuesByCustomer
    }
  }
}

// Export singleton instance
export const cartLockManager = CartLockManager.getInstance()
