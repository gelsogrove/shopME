import { NextFunction, Request, Response } from "express";
import { SettingsService } from "../../../application/services/settings.service";
import logger from "../../../utils/logger";

/**
 * SettingsController class
 * Handles HTTP requests related to WhatsApp settings
 */
export class SettingsController {
  private settingsService: SettingsService;
  
  constructor() {
    this.settingsService = new SettingsService();
  }

  /**
   * Get GDPR content for a workspace
   */
  async getGdprContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      
      const gdprContent = await this.settingsService.getGdprContent(workspaceId);
      
      res.json({ gdpr: gdprContent });
    } catch (error) {
      logger.error(`Error getting GDPR content for workspace ${req.params.workspaceId}:`, error);
      next(error);
    }
  }

  /**
   * Update GDPR content for a workspace
   */
  async updateGdprContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { gdpr } = req.body;
      
      const settings = await this.settingsService.updateGdprContent(workspaceId, gdpr);
      
      res.json(settings);
    } catch (error) {
      logger.error(`Error updating GDPR content for workspace ${req.params.workspaceId}:`, error);
      next(error);
    }
  }

  /**
   * Get default GDPR content
   */
  async getDefaultGdprContent(_req: Request, res: Response, next: NextFunction) {
    try {
      const content = await this.settingsService.getDefaultGdprContent();
      res.json({ content });
    } catch (error) {
      logger.error("Error getting default GDPR content:", error);
      next(error);
    }
  }

  /**
   * Get settings for a workspace
   */
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      
      const settings = await this.settingsService.getByWorkspaceId(workspaceId);
      
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      logger.error(`Error getting settings for workspace ${req.params.workspaceId}:`, error);
      next(error);
    }
  }

  /**
   * Update settings for a workspace
   */
  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { phoneNumber, apiKey, webhookUrl, settings } = req.body;
      
      // Create update data
      const updateData: any = {};
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      if (apiKey !== undefined) updateData.apiKey = apiKey;
      if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl;
      if (settings !== undefined) updateData.settings = settings;
      
      let updatedSettings;
      
      try {
        updatedSettings = await this.settingsService.update(workspaceId, updateData);
      } catch (error: any) {
        if (error.message === "Settings not found") {
          // Settings don't exist yet, create them
          updatedSettings = await this.settingsService.create({
            phoneNumber: phoneNumber || "",
            apiKey: apiKey || "",
            webhookUrl,
            settings,
            workspaceId
          });
        } else {
          throw error;
        }
      }
      
      res.json(updatedSettings);
    } catch (error) {
      logger.error(`Error updating settings for workspace ${req.params.workspaceId}:`, error);
      next(error);
    }
  }

  /**
   * Delete settings for a workspace
   */
  async deleteSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      
      const success = await this.settingsService.delete(workspaceId);
      
      if (!success) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      if (error.message === "Settings not found") {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      logger.error(`Error deleting settings for workspace ${req.params.workspaceId}:`, error);
      next(error);
    }
  }
} 