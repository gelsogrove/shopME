import { PrismaClient } from "@prisma/client"
import logger from "../utils/logger"

export class SchedulerService {
  private prisma: PrismaClient
  private readonly CHECK_INTERVAL = 5 * 60 * 1000 // 5 minuti

  constructor() {
    this.prisma = new PrismaClient()
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
   * Inizia il processo di aggiornamento periodico
   */
  public startScheduledTasks(): void {
    // Esegui immediatamente al primo avvio
    this.updateExpiredOffers()

    // Imposta l'intervallo per le esecuzioni successive
    setInterval(() => {
      this.updateExpiredOffers()
    }, this.CHECK_INTERVAL)

    logger.info("Scheduler service started")
  }
}