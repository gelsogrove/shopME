import { Request, Response } from "express";
import { SettingsService } from "../../../application/services/settings.service";
import logger from "../../../utils/logger";
import { AppResponse } from "../../../utils/response";

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
  async getGdprContent(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;

      if (!workspaceId || workspaceId.trim() === '') {
        AppResponse.badRequest(res, "Workspace ID is required");
        return;
      }

      const gdprContent = await this.settingsService.getGdprContent(workspaceId);
      
      // Always return a success, even if content doesn't exist
      // The service will return a default in that case
      AppResponse.success(res, { content: gdprContent || '' });
    } catch (error) {
      logger.error("Error getting GDPR content:", error);
      AppResponse.serverError(res, "Failed to get GDPR content");
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
  async updateGdprContent(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      const { gdpr } = req.body;

      logger.info(`[GDPR UPDATE] Starting update for workspace: ${workspaceId}`);
      logger.info(`[GDPR UPDATE] Request body keys: ${Object.keys(req.body)}`);
      logger.info(`[GDPR UPDATE] GDPR content length: ${gdpr ? gdpr.length : 'undefined'}`);

      if (!workspaceId) {
        logger.error("[GDPR UPDATE] Missing workspaceId");
        AppResponse.badRequest(res, "Workspace ID is required");
        return;
      }

      if (!gdpr) {
        logger.error("[GDPR UPDATE] Missing GDPR content");
        AppResponse.badRequest(res, "GDPR content is required");
        return;
      }

      logger.info(`[GDPR UPDATE] Calling service to update GDPR for workspace: ${workspaceId}`);
      const updatedSettings = await this.settingsService.updateGdprContent(workspaceId, gdpr);
      
      logger.info(`[GDPR UPDATE] Service returned: ${updatedSettings ? 'success' : 'null'}`);
      if (updatedSettings) {
        logger.info(`[GDPR UPDATE] Updated settings ID: ${updatedSettings.id}`);
        logger.info(`[GDPR UPDATE] Updated GDPR content length: ${updatedSettings.gdpr ? updatedSettings.gdpr.length : 'undefined'}`);
      }
      
      AppResponse.success(res, updatedSettings);
    } catch (error) {
      logger.error("Error updating GDPR content:", error);
      AppResponse.serverError(res, "Failed to update GDPR content");
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
  async getDefaultGdprContent(req: Request, res: Response): Promise<void> {
    try {
      const defaultGdprContent = await this.settingsService.getDefaultGdprContent();
      AppResponse.success(res, { content: defaultGdprContent });
    } catch (error) {
      logger.error("Error getting default GDPR content:", error);
      AppResponse.serverError(res, "Failed to get default GDPR content");
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
  async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      logger.info(`Getting settings for workspace ${workspaceId}`);

      if (!workspaceId) {
        AppResponse.badRequest(res, "Workspace ID is required");
        return;
      }

      const settings = await this.settingsService.getSettings(workspaceId);
      
      // Always return success, even if settings don't exist
      // The service will return an appropriate default object
      AppResponse.success(res, settings || {});
    } catch (error) {
      logger.error("Error getting settings:", error);
      AppResponse.serverError(res, "Failed to get settings");
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
  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      const settingsData = req.body;

      logger.info(`Updating settings for workspace ${workspaceId}`);

      if (!workspaceId) {
        AppResponse.badRequest(res, "Workspace ID is required");
        return;
      }

      if (!settingsData) {
        AppResponse.badRequest(res, "Settings data is required");
        return;
      }

      const updatedSettings = await this.settingsService.updateSettings(workspaceId, settingsData);
      AppResponse.success(res, updatedSettings);
    } catch (error) {
      logger.error("Error updating settings:", error);
      AppResponse.serverError(res, "Failed to update settings");
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
   *       200:
   *         description: Settings deleted successfully
   *       404:
   *         description: Settings not found
   *       500:
   *         description: Failed to delete settings
   */
  async deleteSettings(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;

      if (!workspaceId) {
        AppResponse.badRequest(res, "Workspace ID is required");
        return;
      }

      const success = await this.settingsService.deleteSettings(workspaceId);
      
      if (success) {
        AppResponse.success(res, { message: "Settings deleted successfully" });
      } else {
        AppResponse.notFound(res, "Settings not found or could not be deleted");
      }
    } catch (error) {
      logger.error("Error deleting settings:", error);
      AppResponse.serverError(res, "Failed to delete settings");
    }
  }
} 