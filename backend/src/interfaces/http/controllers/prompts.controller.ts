import { NextFunction, Request, Response } from "express";
import { AgentService } from "../../../application/services/agent.service";
import logger from "../../../utils/logger";

export class PromptsController {
  private agentService: AgentService;

  constructor() {
    this.agentService = new AgentService();
  }

  /**
   * Get all prompts for a workspace
   */
  async getAllPrompts(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params
      logger.info(`Getting all prompts for workspace ${workspaceId}`)
      
      const prompts = await this.agentService.getAllForWorkspace(workspaceId)
      res.json(prompts)
    } catch (error) {
      logger.error('Error fetching prompts:', error)
      next(error)
    }
  }

  /**
   * Get a specific prompt by ID
   */
  async getPromptById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const workspaceId = req.params.workspaceId || '';
      
      logger.info(`Getting prompt ${id} for workspace ${workspaceId}`)
      
      const prompt = await this.agentService.getById(id, workspaceId)
      
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" })
      }
      
      res.json(prompt)
    } catch (error) {
      logger.error(`Error fetching prompt ${req.params.id}:`, error)
      next(error)
    }
  }

  /**
   * Create a new prompt
   */
  async createPrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params
      const promptData = {
        ...req.body,
        workspaceId,
        isRouter: false // Default to regular prompt/agent
      }
      
      logger.info(`Creating new prompt for workspace ${workspaceId}`)
      
      const prompt = await this.agentService.create(promptData)
      res.status(201).json(prompt)
    } catch (error) {
      logger.error('Error creating prompt:', error)
      next(error)
    }
  }

  /**
   * Update an existing prompt
   */
  async updatePrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const workspaceId = req.params.workspaceId || '';
      
      logger.info(`Updating prompt ${id} for workspace ${workspaceId}`)
      
      // Process data from request
      let data = { ...req.body };
      
      // Convert isActive to boolean if it's a string
      if (data.isActive !== undefined && typeof data.isActive === 'string') {
        data.isActive = data.isActive.toLowerCase() === 'true';
      }
      
      const updatedPrompt = await this.agentService.update(id, workspaceId, data)
      
      if (!updatedPrompt) {
        return res.status(404).json({ message: "Prompt not found" })
      }
      
      res.json(updatedPrompt)
    } catch (error) {
      logger.error(`Error updating prompt ${req.params.id}:`, error)
      next(error)
    }
  }

  /**
   * Delete a prompt
   */
  async deletePrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const workspaceId = req.params.workspaceId || '';
      
      logger.info(`Deleting prompt ${id} for workspace ${workspaceId}`)
      
      const result = await this.agentService.delete(id, workspaceId)
      
      if (!result) {
        return res.status(404).json({ message: "Prompt not found" })
      }
      
      res.status(204).send()
    } catch (error) {
      logger.error(`Error deleting prompt ${req.params.id}:`, error)
      next(error)
    }
  }

  /**
   * Duplicate a prompt
   */
  async duplicatePrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const workspaceId = req.params.workspaceId || '';
      
      logger.info(`Getting original prompt ${id} to duplicate`)
      
      // First get the original prompt
      const originalPrompt = await this.agentService.getById(id, workspaceId)
      
      if (!originalPrompt) {
        return res.status(404).json({ message: "Prompt not found" })
      }
      
      // Create a copy with modified name
      const copyData = {
        name: `${originalPrompt.name} (Copy)`,
        content: originalPrompt.content,
        workspaceId: originalPrompt.workspaceId,
        isActive: false,
        temperature: originalPrompt.temperature,
        top_p: originalPrompt.top_p,
        top_k: originalPrompt.top_k,
        model: originalPrompt.model,
        max_tokens: originalPrompt.max_tokens
      };
      
      logger.info(`Creating duplicate of prompt ${id}`)
      
      // Create the copy
      const duplicatedPrompt = await this.agentService.create(copyData)
      res.status(201).json(duplicatedPrompt)
    } catch (error) {
      logger.error(`Error duplicating prompt ${req.params.id}:`, error)
      next(error)
    }
  }
} 