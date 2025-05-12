import fs from "fs";
import path from "path";
import { Settings, SettingsProps } from "../../domain/entities/settings.entity";
import { ISettingsRepository } from "../../domain/repositories/settings.repository.interface";
import { SettingsRepository } from "../../infrastructure/repositories/settings.repository";
import logger from "../../utils/logger";

/**
 * Service layer for Settings
 * Handles business logic for WhatsApp settings
 */
export class SettingsService {
  private settingsRepository: ISettingsRepository;
  
  constructor() {
    this.settingsRepository = new SettingsRepository();
  }
  
  /**
   * Get settings for a workspace
   */
  async getByWorkspaceId(workspaceId: string): Promise<Settings | null> {
    try {
      return await this.settingsRepository.findByWorkspaceId(workspaceId);
    } catch (error) {
      logger.error(`Error getting settings for workspace ${workspaceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create new settings for a workspace
   */
  async create(data: SettingsProps): Promise<Settings> {
    try {
      // Validate the input data
      const settingsToCreate = new Settings(data);
      
      if (!settingsToCreate.validate()) {
        throw new Error("Invalid settings data");
      }
      
      return await this.settingsRepository.create(data);
    } catch (error) {
      logger.error("Error creating settings:", error);
      throw error;
    }
  }
  
  /**
   * Update settings for a workspace
   */
  async update(workspaceId: string, data: Partial<SettingsProps>): Promise<Settings> {
    try {
      // Check if settings exist
      const existingSettings = await this.settingsRepository.findByWorkspaceId(workspaceId);
      
      if (!existingSettings) {
        throw new Error("Settings not found");
      }
      
      return await this.settingsRepository.update(workspaceId, data);
    } catch (error) {
      logger.error(`Error updating settings for workspace ${workspaceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete settings for a workspace
   */
  async delete(workspaceId: string): Promise<boolean> {
    try {
      // Check if settings exist
      const existingSettings = await this.settingsRepository.findByWorkspaceId(workspaceId);
      
      if (!existingSettings) {
        throw new Error("Settings not found");
      }
      
      return await this.settingsRepository.delete(workspaceId);
    } catch (error) {
      logger.error(`Error deleting settings for workspace ${workspaceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get GDPR content for a workspace
   */
  async getGdprContent(workspaceId: string): Promise<string | null> {
    try {
      return await this.settingsRepository.getGdprContent(workspaceId);
    } catch (error) {
      logger.error(`Error getting GDPR content for workspace ${workspaceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update GDPR content for a workspace
   */
  async updateGdprContent(workspaceId: string, gdprContent: string): Promise<Settings> {
    try {
      return await this.settingsRepository.updateGdprContent(workspaceId, gdprContent);
    } catch (error) {
      logger.error(`Error updating GDPR content for workspace ${workspaceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get default GDPR content from file
   */
  async getDefaultGdprContent(): Promise<string> {
    try {
      const filePath = path.join(__dirname, '../../../..', 'finalproject-AG', 'GDPR.md');
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      logger.error("Error reading default GDPR content:", error);
      throw error;
    }
  }
}

// Export a singleton instance for backward compatibility
export default new SettingsService(); 