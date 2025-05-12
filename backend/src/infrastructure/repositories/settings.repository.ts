import { Settings, SettingsProps } from "../../domain/entities/settings.entity";
import { ISettingsRepository } from "../../domain/repositories/settings.repository.interface";
import { prisma } from "../../lib/prisma";
import logger from "../../utils/logger";

/**
 * Implementation of Settings Repository using Prisma
 */
export class SettingsRepository implements ISettingsRepository {
  /**
   * Convert Prisma model to domain entity
   */
  private toDomainEntity(settingsData: any): Settings {
    return new Settings({
      id: settingsData.id,
      phoneNumber: settingsData.phoneNumber,
      apiKey: settingsData.apiKey,
      webhookUrl: settingsData.webhookUrl,
      settings: settingsData.settings,
      gdpr: settingsData.gdpr,
      workspaceId: settingsData.workspaceId,
      createdAt: settingsData.createdAt,
      updatedAt: settingsData.updatedAt
    });
  }

  /**
   * Find settings by workspace ID
   */
  async findByWorkspaceId(workspaceId: string): Promise<Settings | null> {
    try {
      const settings = await prisma.whatsappSettings.findUnique({
        where: { workspaceId }
      });
      
      return settings ? this.toDomainEntity(settings) : null;
    } catch (error) {
      logger.error(`Error finding settings for workspace ${workspaceId}:`, error);
      return null;
    }
  }

  /**
   * Create settings for a workspace
   */
  async create(data: SettingsProps): Promise<Settings> {
    try {
      const settings = await prisma.whatsappSettings.create({
        data: {
          phoneNumber: data.phoneNumber,
          apiKey: data.apiKey,
          webhookUrl: data.webhookUrl,
          settings: data.settings || {},
          gdpr: data.gdpr,
          workspaceId: data.workspaceId
        }
      });
      
      return this.toDomainEntity(settings);
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
      const updateData: any = {};
      
      if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
      if (data.apiKey !== undefined) updateData.apiKey = data.apiKey;
      if (data.webhookUrl !== undefined) updateData.webhookUrl = data.webhookUrl;
      if (data.settings !== undefined) updateData.settings = data.settings;
      if (data.gdpr !== undefined) updateData.gdpr = data.gdpr;
      
      const settings = await prisma.whatsappSettings.update({
        where: { workspaceId },
        data: updateData
      });
      
      return this.toDomainEntity(settings);
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
      await prisma.whatsappSettings.delete({
        where: { workspaceId }
      });
      
      return true;
    } catch (error) {
      logger.error(`Error deleting settings for workspace ${workspaceId}:`, error);
      return false;
    }
  }

  /**
   * Get GDPR content for a workspace
   */
  async getGdprContent(workspaceId: string): Promise<string | null> {
    try {
      const settings = await prisma.whatsappSettings.findUnique({
        where: { workspaceId },
        select: { gdpr: true }
      });
      
      return settings?.gdpr || null;
    } catch (error) {
      logger.error(`Error getting GDPR content for workspace ${workspaceId}:`, error);
      return null;
    }
  }

  /**
   * Update GDPR content for a workspace
   */
  async updateGdprContent(workspaceId: string, gdprContent: string): Promise<Settings> {
    try {
      // Check if settings already exist
      const existingSettings = await prisma.whatsappSettings.findUnique({
        where: { workspaceId }
      });
      
      let settings;
      
      if (existingSettings) {
        // Update existing settings
        settings = await prisma.whatsappSettings.update({
          where: { workspaceId },
          data: { gdpr: gdprContent }
        });
      } else {
        // Create new settings with empty values for required fields
        settings = await prisma.whatsappSettings.create({
          data: {
            workspaceId,
            gdpr: gdprContent,
            phoneNumber: "",
            apiKey: ""
          }
        });
      }
      
      return this.toDomainEntity(settings);
    } catch (error) {
      logger.error(`Error updating GDPR content for workspace ${workspaceId}:`, error);
      throw error;
    }
  }
} 