// Cache per getLatesttMessages
interface CacheEntry {
  data: any[]
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class MessageCache {
  private cache = new Map<string, CacheEntry>()
  private defaultTTL = 30000 // 30 secondi
  private pendingQueries = new Map<string, Promise<any[]>>() // Debouncing per query parallele

  private getCacheKey(
    phoneNumber: string,
    limit: number,
    workspaceId?: string
  ): string {
    return `${phoneNumber}:${limit}:${workspaceId || "no-workspace"}`
  }

  get(phoneNumber: string, limit: number, workspaceId?: string): any[] | null {
    const key = this.getCacheKey(phoneNumber, limit, workspaceId)
    const entry = this.cache.get(key)

    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set(
    phoneNumber: string,
    limit: number,
    data: any[],
    workspaceId?: string,
    ttl = this.defaultTTL
  ): void {
    const key = this.getCacheKey(phoneNumber, limit, workspaceId)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  // Metodo per gestire query pending (debouncing)
  async getOrSetPending<T>(key: string, queryFn: () => Promise<T>): Promise<T> {
    // Se c'è già una query in corso per questa chiave, aspetta il risultato
    if (this.pendingQueries.has(key)) {
      return this.pendingQueries.get(key) as Promise<T>
    }

    // Avvia la query e salvala come pending
    const queryPromise = queryFn()
    this.pendingQueries.set(key, queryPromise as Promise<any[]>)

    try {
      const result = await queryPromise
      return result
    } finally {
      // Rimuovi la query pending quando completa
      this.pendingQueries.delete(key)
    }
  }

  // Invalidate all cache entries for a specific phone number
  invalidateByPhoneNumber(phoneNumber: string): void {
    const keysToDelete: string[] = []

    for (const key of this.cache.keys()) {
      if (key.startsWith(`${phoneNumber}:`)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key))

    if (keysToDelete.length > 0) {
      console.log(
        `[CACHE] Invalidated ${keysToDelete.length} cache entries for phone: ${phoneNumber}`
      )
    }
  }

  clear(): void {
    this.cache.clear()
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const messageCache = new MessageCache()

// Cleanup ogni 5 minuti
setInterval(() => messageCache.cleanup(), 5 * 60 * 1000)
