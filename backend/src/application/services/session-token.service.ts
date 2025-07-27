import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import logger from '../../utils/logger'

export interface SessionToken {
  token: string
  workspaceId: string
  customerId: string
  phoneNumber: string
  expiresAt: Date
  conversationId: string
  lastActivity: Date
  createdAt: Date
}

export interface SessionTokenValidation {
  valid: boolean
  token?: SessionToken
  error?: string
}

/**
 * Session Token Service for WhatsApp Conversations
 * Andrea's secure architecture: every message gets a session token
 */
export class SessionTokenService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Generate secure session token for WhatsApp conversation
   */
  private generateSecureToken(): string {
    const timestamp = Date.now().toString()
    const randomBytes = crypto.randomBytes(32).toString('hex')
    const payload = `session_${timestamp}_${randomBytes}`
    
    return crypto
      .createHash('sha256')
      .update(payload)
      .digest('hex')
      .substring(0, 48) // 48 characters for session tokens
  }

  /**
   * Create or renew session token for WhatsApp conversation
   * This is called for EVERY WhatsApp message to ensure secure tracking
   */
  async createOrRenewSessionToken(
    workspaceId: string,
    customerId: string,
    phoneNumber: string,
    conversationId?: string
  ): Promise<string> {
    try {
      // 🧹 AUTO-CLEANUP: Remove expired session tokens (older than 1 hour)
      const oneHourAgo = new Date()
      oneHourAgo.setHours(oneHourAgo.getHours() - 1)
      
      const cleanupResult = await this.prisma.secureToken.deleteMany({
        where: {
          type: 'session',
          workspaceId,
          expiresAt: {
            lt: oneHourAgo
          }
        }
      })

      if (cleanupResult.count > 0) {
        logger.info(`[SESSION-TOKEN] 🧹 Auto-cleaned ${cleanupResult.count} expired session tokens (older than 1 hour) for workspace ${workspaceId}`)
      }

      // Invalidate existing active session tokens for this customer
      await this.prisma.secureToken.updateMany({
        where: {
          type: 'session',
          workspaceId,
          phoneNumber,
          usedAt: null,
          expiresAt: {
            gt: new Date()
          }
        },
        data: {
          expiresAt: new Date() // Expire immediately
        }
      })

      // Generate new session token
      const token = this.generateSecureToken()

      // Set expiration to 1 hour from now
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1)

      // Create conversation ID if not provided
      const sessionConversationId = conversationId || `conv_${Date.now()}_${customerId}`

      // Prepare session payload
      const sessionPayload = {
        workspaceId,
        customerId,
        phoneNumber,
        conversationId: sessionConversationId,
        lastActivity: new Date(),
        createdAt: new Date()
      }

      // Save session token to database
      await this.prisma.secureToken.create({
        data: {
          token,
          type: 'session',
          workspaceId,
          userId: customerId,
          phoneNumber,
          payload: sessionPayload,
          expiresAt,
          ipAddress: null // WhatsApp doesn't provide IP
        }
      })

      logger.info(`[SESSION-TOKEN] Created session token for customer ${customerId} in workspace ${workspaceId}`)
      
      return token
    } catch (error) {
      logger.error('[SESSION-TOKEN] Error creating session token:', error)
      throw new Error('Failed to create session token')
    }
  }

  /**
   * Validate session token and get session data with workspace isolation
   */
  async validateSessionToken(token: string, workspaceId?: string): Promise<SessionTokenValidation> {
    try {
      const whereClause: any = {
        token,
        type: 'session',
        usedAt: null,
        expiresAt: {
          gt: new Date() // Must not be expired
        }
      }

      if (workspaceId) whereClause.workspaceId = workspaceId

      const sessionToken = await this.prisma.secureToken.findFirst({
        where: whereClause
      })

      if (!sessionToken) {
        return {
          valid: false,
          error: 'Invalid or expired session token'
        }
      }

      // Update last activity
      await this.prisma.secureToken.update({
        where: { id: sessionToken.id },
        data: {
          payload: {
            ...sessionToken.payload as any,
            lastActivity: new Date()
          }
        }
      })

      const sessionData: SessionToken = {
        token: sessionToken.token,
        workspaceId: sessionToken.workspaceId,
        customerId: sessionToken.userId!,
        phoneNumber: sessionToken.phoneNumber!,
        expiresAt: sessionToken.expiresAt,
        conversationId: (sessionToken.payload as any).conversationId,
        lastActivity: new Date(),
        createdAt: sessionToken.createdAt
      }

      return {
        valid: true,
        token: sessionData
      }
    } catch (error) {
      logger.error('[SESSION-TOKEN] Error validating session token:', error)
      return {
        valid: false,
        error: 'Failed to validate session token'
      }
    }
  }

  /**
   * Check if session token needs renewal (less than 15 minutes left) with workspace isolation
   */
  async needsRenewal(token: string, workspaceId?: string): Promise<boolean> {
    try {
      const whereClause: any = {
        token,
        type: 'session',
        usedAt: null
      }

      if (workspaceId) whereClause.workspaceId = workspaceId

      const sessionToken = await this.prisma.secureToken.findFirst({
        where: whereClause
      })

      if (!sessionToken) {
        return true // Token doesn't exist, needs renewal
      }

      const now = new Date()
      const timeLeft = sessionToken.expiresAt.getTime() - now.getTime()
      const fifteenMinutes = 15 * 60 * 1000 // 15 minutes in milliseconds

      return timeLeft < fifteenMinutes
    } catch (error) {
      logger.error('[SESSION-TOKEN] Error checking renewal:', error)
      return true // Default to renewal on error
    }
  }

  /**
   * Get active session for customer (if any)
   */
  async getActiveSession(workspaceId: string, phoneNumber: string): Promise<SessionToken | null> {
    try {
      const sessionToken = await this.prisma.secureToken.findFirst({
        where: {
          type: 'session',
          workspaceId,
          phoneNumber,
          usedAt: null,
          expiresAt: {
            gt: new Date()
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (!sessionToken) {
        return null
      }

      return {
        token: sessionToken.token,
        workspaceId: sessionToken.workspaceId,
        customerId: sessionToken.userId!,
        phoneNumber: sessionToken.phoneNumber!,
        expiresAt: sessionToken.expiresAt,
        conversationId: (sessionToken.payload as any).conversationId,
        lastActivity: (sessionToken.payload as any).lastActivity,
        createdAt: sessionToken.createdAt
      }
    } catch (error) {
      logger.error('[SESSION-TOKEN] Error getting active session:', error)
      return null
    }
  }

  /**
   * Mark session as completed/used
   */
  async markSessionAsCompleted(token: string): Promise<void> {
    try {
      await this.prisma.secureToken.update({
        where: { token },
        data: {
          usedAt: new Date()
        }
      })

      logger.info(`[SESSION-TOKEN] Marked session as completed: ${token.substring(0, 12)}...`)
    } catch (error) {
      logger.error('[SESSION-TOKEN] Error marking session as completed:', error)
    }
  }

  /**
   * Clean up expired session tokens (call this periodically)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await this.prisma.secureToken.deleteMany({
        where: {
          type: 'session',
          expiresAt: {
            lt: new Date()
          }
        }
      })

      logger.info(`[SESSION-TOKEN] Cleaned up ${result.count} expired session tokens`)
      return result.count
    } catch (error) {
      logger.error('[SESSION-TOKEN] Error cleaning up expired sessions:', error)
      return 0
    }
  }
} 