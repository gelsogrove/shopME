import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

/**
 * API Limit Service
 * 
 * Gestisce il controllo dei limiti API per workspace per prevenire abusi
 * e controllare i costi delle chiamate a OpenRouter
 */

export interface ApiLimitResult {
  exceeded: boolean;
  remaining: number;
  resetTime: Date;
  currentUsage: number;
  limit: number;
}

export interface ApiUsageRecord {
  workspaceId: string;
  count: number;
  windowStart: Date;
  windowEnd: Date;
}

export class ApiLimitService {
  private prisma: PrismaClient;
  private readonly DEFAULT_LIMIT_PER_HOUR: number;
  private readonly WINDOW_SIZE_HOURS: number = 1;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    // Limite configurabile via environment variable
    this.DEFAULT_LIMIT_PER_HOUR = parseInt(process.env.API_LIMIT_PER_HOUR || '1000');
  }

  /**
   * Controlla se il workspace ha superato il limite API
   */
  async checkApiLimit(workspaceId: string): Promise<ApiLimitResult> {
    try {
      logger.info(`[API_LIMIT] Checking limit for workspace ${workspaceId}`);

      // Ottieni il limite specifico del workspace (se configurato)
      const workspaceLimit = await this.getWorkspaceLimit(workspaceId);
      const limit = workspaceLimit || this.DEFAULT_LIMIT_PER_HOUR;

      // Calcola finestra temporale (ultima ora)
      const now = new Date();
      const windowStart = new Date(now.getTime() - (this.WINDOW_SIZE_HOURS * 60 * 60 * 1000));

      // Conta le chiamate API nell'ultima ora
      const currentUsage = await this.countApiCalls(workspaceId, windowStart, now);

      // Calcola quando si resetta il limite (prossima ora)
      const resetTime = new Date(Math.ceil(now.getTime() / (60 * 60 * 1000)) * (60 * 60 * 1000));

      const exceeded = currentUsage >= limit;
      const remaining = Math.max(0, limit - currentUsage);

      if (exceeded) {
        logger.warn(`[API_LIMIT] Limit exceeded for workspace ${workspaceId}: ${currentUsage}/${limit}`);
        
        // Log per audit
        await this.logLimitExceeded(workspaceId, currentUsage, limit);
      } else {
        logger.info(`[API_LIMIT] Within limit for workspace ${workspaceId}: ${currentUsage}/${limit}`);
      }

      return {
        exceeded,
        remaining,
        resetTime,
        currentUsage,
        limit
      };

    } catch (error) {
      logger.error(`[API_LIMIT] Error checking limit for workspace ${workspaceId}:`, error);
      
      // In caso di errore, permettiamo la chiamata (fail-open)
      // ma loggiamo l'errore per investigazione
      return {
        exceeded: false,
        remaining: this.DEFAULT_LIMIT_PER_HOUR,
        resetTime: new Date(Date.now() + 60 * 60 * 1000),
        currentUsage: 0,
        limit: this.DEFAULT_LIMIT_PER_HOUR
      };
    }
  }

  /**
   * Incrementa il contatore delle chiamate API
   */
  async incrementApiUsage(workspaceId: string, endpoint: string = 'whatsapp_message'): Promise<void> {
    try {
      logger.info(`[API_LIMIT] Incrementing usage for workspace ${workspaceId}, endpoint: ${endpoint}`);

      // Salva record della chiamata API per tracking
      await this.prisma.message.updateMany({
        where: {
          chatSession: {
            workspaceId: workspaceId
          },
          createdAt: {
            gte: new Date(Date.now() - 5000) // Ultimi 5 secondi
          }
        },
        data: {
          metadata: {
            // Aggiungi metadata per tracking API usage
            apiCallTracked: true,
            endpoint: endpoint,
            timestamp: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      logger.error(`[API_LIMIT] Error incrementing usage for workspace ${workspaceId}:`, error);
      // Non blocchiamo il flusso per errori di tracking
    }
  }

  /**
   * Ottiene il limite specifico del workspace
   */
  private async getWorkspaceLimit(workspaceId: string): Promise<number | null> {
    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { 
          id: true,
          name: true
        }
      });

      if (!workspace) {
        logger.warn(`[API_LIMIT] Workspace ${workspaceId} not found`);
        return null;
      }

      // Unlimited plan - no restrictions
      return this.DEFAULT_LIMIT_PER_HOUR;

    } catch (error) {
      logger.error(`[API_LIMIT] Error getting workspace limit:`, error);
      return null;
    }
  }

  /**
   * Conta le chiamate API nell'intervallo specificato
   */
  private async countApiCalls(workspaceId: string, startTime: Date, endTime: Date): Promise<number> {
    try {
      // Conta i messaggi OUTBOUND (risposte del bot) come proxy per chiamate API
      const count = await this.prisma.message.count({
        where: {
          chatSession: {
            workspaceId: workspaceId
          },
          direction: 'OUTBOUND',
          createdAt: {
            gte: startTime,
            lte: endTime
          }
        }
      });

      return count || 0;

    } catch (error) {
      logger.error(`[API_LIMIT] Error counting API calls:`, error);
      // Return 0 to allow processing on error
      return 0;
    }
  }

  /**
   * Log quando il limite viene superato per audit
   */
  private async logLimitExceeded(workspaceId: string, currentUsage: number, limit: number): Promise<void> {
    try {
      logger.warn(`API_LIMIT_EXCEEDED: workspace-${workspaceId} - Usage: ${currentUsage}/${limit} - Remaining: 0`);
      
      // TODO: Implementare tabella audit_logs se necessario
      // Per ora usiamo solo i log

    } catch (error) {
      logger.error(`[API_LIMIT] Error logging limit exceeded:`, error);
    }
  }

  /**
   * Ottiene statistiche di utilizzo per dashboard admin
   */
  async getUsageStats(workspaceId: string, hours: number = 24): Promise<{
    totalCalls: number;
    hourlyBreakdown: Array<{hour: string, calls: number}>;
    currentHourUsage: number;
    limit: number;
  }> {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));

      const totalCalls = await this.countApiCalls(workspaceId, startTime, now);
      const currentHourStart = new Date(Math.floor(now.getTime() / (60 * 60 * 1000)) * (60 * 60 * 1000));
      const currentHourUsage = await this.countApiCalls(workspaceId, currentHourStart, now);
      
      const workspaceLimit = await this.getWorkspaceLimit(workspaceId);
      const limit = workspaceLimit || this.DEFAULT_LIMIT_PER_HOUR;

      // TODO: Implementare hourlyBreakdown se necessario per dashboard
      const hourlyBreakdown: Array<{hour: string, calls: number}> = [];

      return {
        totalCalls,
        hourlyBreakdown,
        currentHourUsage,
        limit
      };

    } catch (error) {
      logger.error(`[API_LIMIT] Error getting usage stats:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiLimitService = new ApiLimitService(new PrismaClient()); 