import { PrismaClient } from "@prisma/client"
import logger from "../utils/logger"

export class SchedulerService {
  private prisma: PrismaClient
  private readonly CHECK_INTERVAL = 5 * 60 * 1000 // 5 minuti
  private readonly URL_CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 ora
  private readonly CHAT_CLEANUP_INTERVAL = 12 * 60 * 60 * 1000 // 12 ore
  private readonly MESSAGE_LIMIT = 50 // limite di messaggi per cliente

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Pulisce la cronologia delle chat mantenendo solo gli ultimi 50 messaggi per ogni cliente
   */
  private async cleanupChatHistory(): Promise<void> {
    try {
      // Ottiene tutte le sessioni di chat attive
      const chatSessions = await this.prisma.chatSession.findMany({
        select: {
          id: true,
          customerId: true,
          messages: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })

      for (const session of chatSessions) {
        // Se il cliente ha più di 50 messaggi, elimina i più vecchi
        if (session.messages.length > this.MESSAGE_LIMIT) {
          // Ottiene gli ID dei messaggi da eliminare
          const messagesToDelete = session.messages
            .slice(this.MESSAGE_LIMIT)
            .map(msg => msg.id)

          // Elimina i messaggi più vecchi
          const result = await this.prisma.message.deleteMany({
            where: {
              id: {
                in: messagesToDelete
              }
            }
          })

          if (result.count > 0) {
            logger.info(`🧹 Removed ${result.count} old messages for chat session ${session.id}`)
          }
        }
      }
    } catch (error) {
      logger.error("Error cleaning up chat history:", error)
    }
  }

  /**
   * Aggiorna lo stato delle offerte scadute
   */
  private async updateExpiredOffers(): Promise<void> {
    const now = new Date()

    try {
      // Trova e aggiorna tutte le offerte scadute che sono ancora attive
      const result = await this.prisma.offers.updateMany({
        where: {
          isActive: true,
          endDate: { lt: now }
        },
        data: {
          isActive: false
        }
      })

      if (result.count > 0) {
        logger.info(`Updated ${result.count} expired offers`)
      }
    } catch (error) {
      logger.error("Error updating expired offers:", error)
    }
  }

  /**
   * Pulisce le URL scadute e vecchie
   */
  private async cleanupUrls(): Promise<void> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000) // 1 ora fa

      const result = await this.prisma.shortUrls.deleteMany({
        where: {
          OR: [
            // Elimina URL scadute
            {
              expiresAt: {
                lt: new Date(),
              },
            },
            // Elimina URL più vecchie di 1 ora
            {
              createdAt: {
                lt: oneHourAgo,
              },
            },
          ],
        },
      })

      if (result.count > 0) {
        logger.info(`🧹 Scheduled cleanup: removed ${result.count} old/expired short URLs`)
      }
    } catch (error) {
      logger.error("Error cleaning up URLs:", error)
    }
  }

  /**
   * Inizia il processo di aggiornamento periodico
   */
  public startScheduledTasks(): void {
    // Esegui immediatamente al primo avvio
    this.updateExpiredOffers()
    this.cleanupUrls()
    this.cleanupChatHistory()

    // Imposta gli intervalli per le esecuzioni successive
    setInterval(() => {
      this.updateExpiredOffers()
    }, this.CHECK_INTERVAL)

    setInterval(() => {
      this.cleanupUrls()
    }, this.URL_CLEANUP_INTERVAL)

    setInterval(() => {
      this.cleanupChatHistory()
    }, this.CHAT_CLEANUP_INTERVAL)

    logger.info("Scheduler service started - managing offers, URLs and chat history cleanup")
  }
}
