import { GdprRepository } from "../../repositories/gdpr.repository";
import logger from "../../utils/logger";

/**
 * Service layer for GDPR Content
 */
export class GdprService {
  private repository: GdprRepository;
  
  constructor() {
    this.repository = new GdprRepository();
  }
  
  /**
   * Get GDPR content for a workspace (auto-creates if not exists)
   */
  async getGdprContent(workspaceId: string): Promise<string> {
    try {
      logger.info(`[GDPR SERVICE] Getting GDPR content for workspace: ${workspaceId}`);
      return await this.repository.getGdprContent(workspaceId);
    } catch (error) {
      logger.error(`[GDPR SERVICE] Error getting GDPR content: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Update GDPR content for a workspace (auto-creates if not exists)
   */
  async updateGdprContent(workspaceId: string, content: string): Promise<any> {
    try {
      logger.info(`[GDPR SERVICE] Updating GDPR content for workspace: ${workspaceId}`);
      const result = await this.repository.updateGdprContent(workspaceId, content);
      
      // Return in the format expected by the controller
      return {
        id: result.id,
        workspaceId: result.workspaceId,
        gdpr: result.content
      };
    } catch (error) {
      logger.error(`[GDPR SERVICE] Error updating GDPR content: ${error.message}`);
      throw error;
    }
  }
} 