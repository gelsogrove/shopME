import logger from "../utils/logger"
import { NextFunction, Request, Response } from "express"
import { promptsService } from "../services/prompts.service"

export class PromptsController {
  /**
   * Get all prompts for a workspace
   */
  async getAllPrompts(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params
      const prompts = await promptsService.getAllForWorkspace(workspaceId)
      res.json(prompts)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get a specific prompt by ID
   */
  async getPromptById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const prompt = await promptsService.getById(id)
      
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" })
      }
      
      res.json(prompt)
    } catch (error) {
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
        workspaceId
      }
      
      const prompt = await promptsService.create(promptData)
      res.status(201).json(prompt)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Update an existing prompt
   */
  async updatePrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      
      // Esplicito log dei dati ricevuti nel body
      logger.info(`Prompt update request received for id ${id}:`, req.body)
      
      // Assicuriamoci che isActive sia interpretato correttamente anche se viene inviato come stringa
      let data = { ...req.body };
      
      // Se isActive è presente e inviato come stringa, convertiamolo in booleano
      if (data.isActive !== undefined) {
        if (typeof data.isActive === 'string') {
          data.isActive = data.isActive.toLowerCase() === 'true';
        }
        logger.info(`isActive value processed as ${data.isActive} (${typeof data.isActive})`)
      } else {
        logger.info(`isActive not included in update data`)
      }
      
      const updatedPrompt = await promptsService.update(id, data)
      
      if (!updatedPrompt) {
        return res.status(404).json({ message: "Prompt not found" })
      }
      
      res.json(updatedPrompt)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Delete a prompt
   */
  async deletePrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      
      try {
        await promptsService.delete(id)
        res.status(204).send()
      } catch (error: any) {
        // Check if error is because the prompt wasn't found
        if (error.code === 'P2025') {
          return res.status(404).json({ message: "Prompt not found" })
        }
        throw error
      }
    } catch (error) {
      next(error)
    }
  }

  /**
   * Activate a prompt (and deactivate all others)
   */
  async activatePrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const activatedPrompt = await promptsService.activate(id)
      
      if (!activatedPrompt) {
        return res.status(404).json({ message: "Prompt not found" })
      }
      
      res.json(activatedPrompt)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Duplicate a prompt
   */
  async duplicatePrompt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      logger.info(`Duplicate request received for prompt ${id}`)
      
      const duplicatedPrompt = await promptsService.duplicate(id)
      
      if (!duplicatedPrompt) {
        return res.status(404).json({ message: "Prompt not found" })
      }
      
      res.json(duplicatedPrompt)
    } catch (error) {
      logger.error(`Error duplicating prompt ${req.params.id}:`, error)
      next(error)
    }
  }
} 