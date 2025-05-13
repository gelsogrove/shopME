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
   * @swagger
   * /api/settings/gdpr/{workspaceId}:
   *   get:
   *     summary: Get GDPR content for a workspace
   *     tags: [Settings]
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the workspace
   *     responses:
   *       200:
   *         description: GDPR content
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 gdpr:
   *                   type: string
   *       500:
   *         description: Failed to retrieve GDPR content
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
   * @swagger
   * /api/settings/gdpr/{workspaceId}:
   *   put:
   *     summary: Update GDPR content for a workspace
   *     tags: [Settings]
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the workspace
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               gdpr:
   *                 type: string
   *                 description: GDPR content
   *     responses:
   *       200:
   *         description: Updated settings
   *       500:
   *         description: Failed to update GDPR content
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
   * @swagger
   * /api/settings/gdpr/default:
   *   get:
   *     summary: Get default GDPR content
   *     tags: [Settings]
   *     responses:
   *       200:
   *         description: Default GDPR content
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 content:
   *                   type: string
   *       500:
   *         description: Failed to retrieve default GDPR content
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
   * @swagger
   * /api/settings/{workspaceId}:
   *   get:
   *     summary: Get settings for a workspace
   *     tags: [Settings]
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the workspace
   *     responses:
   *       200:
   *         description: Workspace settings
   *       404:
   *         description: Settings not found
   *       500:
   *         description: Failed to retrieve settings
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
   * @swagger
   * /api/settings/{workspaceId}:
   *   put:
   *     summary: Update settings for a workspace
   *     tags: [Settings]
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the workspace
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               phoneNumber:
   *                 type: string
   *               apiKey:
   *                 type: string
   *               webhookUrl:
   *                 type: string
   *               settings:
   *                 type: object
   *     responses:
   *       200:
   *         description: Updated settings
   *       500:
   *         description: Failed to update settings
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
   * @swagger
   * /api/settings/{workspaceId}:
   *   delete:
   *     summary: Delete settings for a workspace
   *     tags: [Settings]
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the workspace
   *     responses:
   *       204:
   *         description: Settings deleted
   *       404:
   *         description: Settings not found
   *       500:
   *         description: Failed to delete settings
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