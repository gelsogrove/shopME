import { PrismaClient } from "@prisma/client"
import { randomUUID } from "crypto"
import logger from "../../utils/logger"

const prisma = new PrismaClient()

export class AdminSessionService {
  /**
   * Crea una nuova sessione admin al login
   * POLICY: Una sola sessione attiva per user, la vecchia viene revocata
   * 
   * @param userId - ID utente
   * @param workspaceId - ID workspace selezionato (opzionale)
   * @param ipAddress - IP address del client
   * @param userAgent - User agent del browser
   * @returns sessionId generato
   */
  async createSession(
    userId: string,
    workspaceId: string | null,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    try {
      // 1. Revoca tutte le sessioni esistenti per questo user
      await prisma.adminSession.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false }
      })

      logger.info(`🔒 Revoked existing sessions for user ${userId}`)

      // 2. Genera nuovo sessionId univoco
      const sessionId = randomUUID()
      
      // 3. Calcola scadenza: +1 ora FISSA dalla creazione
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000) // +1h

      // 4. Crea nuova sessione
      await prisma.adminSession.create({
        data: {
          sessionId,
          userId,
          workspaceId,
          expiresAt,
          lastActivityAt: now,
          ipAddress: ipAddress?.substring(0, 45), // Limita lunghezza IP
          userAgent: userAgent?.substring(0, 1000), // Limita user agent
          isActive: true
        }
      })

      logger.info(`🔐 Admin session created for user ${userId}: ${sessionId.substring(0, 8)}... (expires: ${expiresAt.toISOString()})`)
      
      return sessionId
    } catch (error) {
      logger.error("❌ Error creating admin session:", error)
      throw new Error("Failed to create session")
    }
  }

  /**
   * Valida una sessione esistente
   * Verifica: esistenza, isActive, non scaduta
   * Aggiorna lastActivityAt se valida
   * 
   * @param sessionId - ID sessione da validare
   * @returns { valid: boolean, session?: AdminSession, error?: string }
   */
  async validateSession(sessionId: string): Promise<{
    valid: boolean
    session?: any
    error?: string
  }> {
    try {
      const session = await prisma.adminSession.findUnique({
        where: { sessionId },
        include: {
          user: { select: { id: true, email: true, role: true, firstName: true, lastName: true } },
          workspace: { select: { id: true, name: true, slug: true } }
        }
      })

      // 1. Sessione non trovata
      if (!session) {
        logger.warn(`⚠️ Session not found: ${sessionId.substring(0, 8)}...`)
        return { valid: false, error: "Session not found" }
      }

      // 2. Sessione disattivata
      if (!session.isActive) {
        logger.warn(`⚠️ Session revoked: ${sessionId.substring(0, 8)}...`)
        return { valid: false, error: "Session revoked" }
      }

      // 3. Sessione scaduta (>1h dalla creazione)
      if (session.expiresAt < new Date()) {
        logger.warn(`⚠️ Session expired: ${sessionId.substring(0, 8)}... (expired: ${session.expiresAt.toISOString()})`)
        
        // Auto-revoca sessione scaduta
        await prisma.adminSession.update({
          where: { id: session.id },
          data: { isActive: false }
        })
        
        return { valid: false, error: "Session expired" }
      }

      // 4. Sessione valida → Aggiorna lastActivityAt
      await prisma.adminSession.update({
        where: { id: session.id },
        data: { lastActivityAt: new Date() }
      })

      logger.debug(`✅ Session valid for user ${session.user.email} (${sessionId.substring(0, 8)}...)`)

      return { valid: true, session }
    } catch (error) {
      logger.error("❌ Error validating session:", error)
      return { valid: false, error: "Validation error" }
    }
  }

  /**
   * Revoca una sessione (logout)
   * 
   * @param sessionId - ID sessione da revocare
   */
  async revokeSession(sessionId: string): Promise<void> {
    try {
      await prisma.adminSession.updateMany({
        where: { sessionId },
        data: { isActive: false }
      })
      
      logger.info(`🔒 Session revoked: ${sessionId.substring(0, 8)}...`)
    } catch (error) {
      logger.error("❌ Error revoking session:", error)
      throw new Error("Failed to revoke session")
    }
  }

  /**
   * Cleanup automatico sessioni scadute
   * Chiamato da scheduler (ogni 1h) o manualmente
   * 
   * @returns Numero di sessioni eliminate
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await prisma.adminSession.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },  // Scadute
            { isActive: false }                  // Revocate
          ]
        }
      })

      if (result.count > 0) {
        logger.info(`🧹 Cleaned up ${result.count} expired/revoked admin sessions`)
      }

      return result.count
    } catch (error) {
      logger.error("❌ Error cleaning up sessions:", error)
      return 0
    }
  }

  /**
   * Ottiene statistiche sessioni attive
   * Utile per monitoring
   * 
   * @returns Numero di sessioni attive totali
   */
  async getActiveSessionsCount(): Promise<number> {
    try {
      const count = await prisma.adminSession.count({
        where: {
          isActive: true,
          expiresAt: { gt: new Date() }
        }
      })

      return count
    } catch (error) {
      logger.error("❌ Error counting active sessions:", error)
      return 0
    }
  }
}

export const adminSessionService = new AdminSessionService()
