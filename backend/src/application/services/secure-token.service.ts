import { PrismaClient } from "@prisma/client"
import crypto from "crypto"
import logger from "../../utils/logger"

/**
 * Service for managing all types of secure tokens
 */
export class SecureTokenService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Generate a secure token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Encrypt sensitive payload data
   */
  private encryptPayload(payload: any): string {
    const key = process.env.TOKEN_ENCRYPTION_KEY || 'default-key-change-in-production'
    const cipher = crypto.createCipher('aes-256-cbc', key)
    let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  }

  /**
   * Decrypt payload data
   */
  private decryptPayload(encryptedPayload: string): any {
    try {
      const key = process.env.TOKEN_ENCRYPTION_KEY || 'default-key-change-in-production'
      const decipher = crypto.createDecipher('aes-256-cbc', key)
      let decrypted = decipher.update(encryptedPayload, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return JSON.parse(decrypted)
    } catch (error) {
      logger.error('Error decrypting payload:', error)
      return null
    }
  }

  /**
   * Create or update a secure token (UNICO RECORD PER UTENTE)
   */
  async createToken(
    type: 'registration' | 'checkout' | 'invoice' | 'cart' | 'password_reset' | 'email_verification' | 'orders' | 'profile' | 'any',
    workspaceId: string,
    payload?: any,
    expiresIn: string = '1h',
    userId?: string,
    phoneNumber?: string,
    ipAddress?: string,
    customerId?: string
  ): Promise<string> {
    try {
      // Generate new token
      const token = this.generateSecureToken()

      // Calculate expiration
      const expiresAt = new Date()
      const hours = parseInt(expiresIn.replace('h', '')) || 1
      expiresAt.setHours(expiresAt.getHours() + hours)

      // Store payload as JSON (no encryption) to ensure compatibility and avoid runtime crypto issues
      const encryptedPayload = payload ?? null

      // 🎯 NUOVA LOGICA: RIUTILIZZA TOKEN SE NON SCADUTO!
      if (customerId) {
        logger.info(`[SECURE-TOKEN] 🚀 Checking existing token for customerId="${customerId}", type="${type}", workspaceId="${workspaceId}"`)
        
        // Prima controlla se esiste un token valido
        const existingToken = await this.prisma.secureToken.findFirst({
          where: {
            customerId,
            type,
            workspaceId,
            expiresAt: {
              gt: new Date() // Token non scaduto
            }
          }
        })

        if (existingToken) {
          logger.info(`[SECURE-TOKEN] ✅ RIUTILIZZO TOKEN ESISTENTE: ${existingToken.token.substring(0, 10)}... (scade: ${existingToken.expiresAt})`)
          return existingToken.token
        }

        logger.info(`[SECURE-TOKEN] 🔄 Nessun token valido trovato, creo nuovo token`)
        
        // Prima elimina eventuali token scaduti per questo customer/type/workspace
        await this.prisma.secureToken.deleteMany({
          where: {
            customerId,
            type,
            workspaceId,
            expiresAt: {
              lte: new Date() // Token scaduti
            }
          }
        })

        // Crea nuovo token
        const newToken = await this.prisma.secureToken.create({
          data: {
            token,
            type,
            workspaceId,
            customerId,
            userId,
            phoneNumber,
            payload: encryptedPayload,
            expiresAt,
            ipAddress,
          }
        })

        logger.info(`[SECURE-TOKEN] ✅ NUOVO TOKEN creato per ${type} - customer ${customerId} in workspace ${workspaceId}`)
        return token
      }

      // 📝 FALLBACK: Crea nuovo record se customerId non fornito
      const newToken = await this.prisma.secureToken.create({
        data: {
          token,
          type,
          workspaceId,
          customerId,
          userId,
          phoneNumber,
          payload: encryptedPayload,
          expiresAt,
          ipAddress,
        },
      })

      logger.info(`[SECURE-TOKEN] 📝 Created new ${type} token (no customerId) with ID: ${newToken.id}`)
      return token
    } catch (error) {
      logger.error(`Error creating ${type} token:`, error)
      throw new Error(`Failed to create ${type} token`)
    }
  }

  /**
   * Validate a token with workspace isolation
   * If type is not specified, accepts any valid token type
   */
  async validateToken(
    token: string,
    type?: string,
    workspaceId?: string,
    requiredPayload?: any
  ): Promise<{ valid: boolean; data?: any; payload?: any }> {
    try {
      const whereClause: any = {
        token,
        expiresAt: {
          gt: new Date(),
        },
        usedAt: null,
      }

      // Only filter by type if explicitly specified
      if (type && type !== 'any') whereClause.type = type
      if (workspaceId) whereClause.workspaceId = workspaceId

      const secureToken = await this.prisma.secureToken.findFirst({
        where: whereClause,
      })

      if (!secureToken) {
        logger.warn(`Invalid or expired token: ${token.substring(0, 10)}...`)
        return { valid: false }
      }

      // Get payload if exists (not encrypted, stored as JSON)
      let decryptedPayload = null
      if (secureToken.payload) {
        decryptedPayload = secureToken.payload
      }

      // Validate required payload if specified
      if (requiredPayload && decryptedPayload) {
        for (const key in requiredPayload) {
          if (decryptedPayload[key] !== requiredPayload[key]) {
            logger.warn(`Token payload validation failed for key: ${key}`)
            return { valid: false }
          }
        }
      }

      logger.info(`Validated ${secureToken.type} token`)
      return {
        valid: true,
        data: {
          id: secureToken.id,
          type: secureToken.type,
          workspaceId: secureToken.workspaceId,
          customerId: secureToken.customerId, // Aggiunto customerId
          userId: secureToken.userId,
          phoneNumber: secureToken.phoneNumber,
          expiresAt: secureToken.expiresAt,
          createdAt: secureToken.createdAt,
        },
        payload: decryptedPayload,
      }
    } catch (error) {
      logger.error('Error validating token:', error)
      return { valid: false }
    }
  }

  /**
   * Mark token as used
   */
  async markTokenAsUsed(token: string): Promise<boolean> {
    try {
      await this.prisma.secureToken.update({
        where: { token },
        data: { usedAt: new Date() },
      })

      logger.info(`Marked token as used: ${token.substring(0, 10)}...`)
      return true
    } catch (error) {
      logger.error('Error marking token as used:', error)
      return false
    }
  }

  /**
   * Revoke a token
   */
  async revokeToken(token: string): Promise<boolean> {
    try {
      await this.prisma.secureToken.update({
        where: { token },
        data: { expiresAt: new Date() },
      })

      logger.info(`Revoked token: ${token.substring(0, 10)}...`)
      return true
    } catch (error) {
      logger.error('Error revoking token:', error)
      return false
    }
  }

  /**
   * Cleanup expired tokens (cron job)
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 7) // Delete tokens expired more than 7 days ago

      const result = await this.prisma.secureToken.deleteMany({
        where: {
          expiresAt: {
            lt: cutoffDate,
          },
        },
      })

      logger.info(`Cleaned up ${result.count} expired secure tokens`)
      return result.count
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error)
      throw new Error('Failed to clean up expired tokens')
    }
  }

  /**
   * Get token statistics
   */
  async getTokenStats(workspaceId: string): Promise<any> {
    try {
      const stats = await this.prisma.secureToken.groupBy({
        by: ['type'],
        where: {
          workspaceId,
          expiresAt: {
            gt: new Date(),
          },
          usedAt: null,
        },
        _count: {
          id: true,
        },
      })

      return stats.reduce((acc, stat) => {
        acc[stat.type] = stat._count.id
        return acc
      }, {} as Record<string, number>)
    } catch (error) {
      logger.error('Error getting token stats:', error)
      return {}
    }
  }
} 