/**
 * Simple in-memory rate limiter for API endpoints
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>()
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests

    // Clean up old entries every minute
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.requests.entries()) {
        if (now > entry.resetTime) {
          this.requests.delete(key)
        }
      }
    }, 60000)
  }

  /**
   * Check if request is allowed for a given identifier
   * @param identifier - Usually IP address or user ID
   * @returns true if request is allowed, false if rate limited
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const entry = this.requests.get(identifier)

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return true
    }

    if (entry.count >= this.maxRequests) {
      return false // Rate limited
    }

    // Increment counter
    entry.count++
    return true
  }

  /**
   * Get time until rate limit resets for an identifier
   * @param identifier
   * @returns milliseconds until reset, or 0 if not rate limited
   */
  getTimeToReset(identifier: string): number {
    const entry = this.requests.get(identifier)
    if (!entry) return 0

    const now = Date.now()
    return Math.max(0, entry.resetTime - now)
  }

  /**
   * Get current request count for an identifier
   */
  getCurrentCount(identifier: string): number {
    const entry = this.requests.get(identifier)
    if (!entry || Date.now() > entry.resetTime) return 0
    return entry.count
  }
}

// Rate limiter for /chat/recent endpoint: max 15 requests per minute per IP (increased for polling hooks)
export const recentChatsRateLimiter = new RateLimiter(60000, 15)
