import { prisma } from "../lib/prisma";
import logger from "../utils/logger";

/**
 * Repository for GDPR Content management
 */
export class GdprRepository {
  
  /**
   * Get GDPR content for a workspace, create default if not exists
   */
  async getGdprContent(workspaceId: string): Promise<string> {
    try {
      logger.info(`[GDPR REPO] Getting GDPR content for workspace: ${workspaceId}`);
      
      // Try to find existing GDPR content
      let gdprRecord = await prisma.gdprContent.findUnique({
        where: { workspaceId }
      });
      
      // If not found, create default GDPR content
      if (!gdprRecord) {
        logger.info(`[GDPR REPO] No GDPR content found, creating default for workspace: ${workspaceId}`);
        
        const defaultContent = `Informativa sulla Privacy e Trattamento dei Dati Personali

In conformità al Regolamento Generale sulla Protezione dei Dati (GDPR) UE 2016/679, La informiamo che:

1. I Suoi dati personali saranno trattati per finalità di assistenza clienti e supporto tecnico
2. Il trattamento è basato sul consenso da Lei espresso
3. I dati saranno conservati per il tempo necessario a fornire il servizio richiesto
4. Ha il diritto di accedere, rettificare, cancellare i Suoi dati e di opporsi al trattamento
5. Può revocare il consenso in qualsiasi momento

Per esercitare i Suoi diritti o per maggiori informazioni, può contattarci.`;
        
        gdprRecord = await prisma.gdprContent.create({
          data: {
            workspaceId,
            content: defaultContent
          }
        });
        
        logger.info(`[GDPR REPO] Default GDPR content created with ID: ${gdprRecord.id}`);
      }
      
      return gdprRecord.content;
    } catch (error) {
      logger.error(`[GDPR REPO] Error getting GDPR content: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Update GDPR content for a workspace, create if not exists
   */
  async updateGdprContent(workspaceId: string, content: string): Promise<any> {
    try {
      logger.info(`[GDPR REPO] Updating GDPR content for workspace: ${workspaceId}`);
      
      // Use upsert to update if exists, create if not
      const gdprRecord = await prisma.gdprContent.upsert({
        where: { workspaceId },
        update: { content },
        create: {
          workspaceId,
          content
        }
      });
      
      logger.info(`[GDPR REPO] GDPR content updated/created with ID: ${gdprRecord.id}`);
      
      return gdprRecord;
    } catch (error) {
      logger.error(`[GDPR REPO] Error updating GDPR content: ${error.message}`);
      throw error;
    }
  }
} 