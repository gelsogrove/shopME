import { NextFunction, Request, Response } from "express"
import { agentsService } from "../services/agents.service"

export const agentsController = {
  /**
   * Get all agents for a workspace
   */
  async getAllForWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params
      const agents = await agentsService.getAllForWorkspace(workspaceId)
      res.json(agents)
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get a specific agent by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params
      const agent = await agentsService.getById(id, workspaceId)
      
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" })
      }
      
      res.json(agent)
    } catch (error) {
      next(error)
    }
  },

  /**
   * Create a new agent
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params
      const agentData = {
        ...req.body,
        workspaceId
      }
      
      const agent = await agentsService.create(agentData)
      res.status(201).json(agent)
    } catch (error) {
      next(error)
    }
  },

  /**
   * Update an existing agent
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params
      
      // Esplicito log dei dati ricevuti nel body
      console.log(`Agent update request received for id ${id}:`, req.body)
      
      // Assicuriamoci che isRouter sia interpretato correttamente anche se viene inviato come stringa
      let data = { ...req.body };
      
      // Se isRouter è presente e inviato come stringa, convertiamolo in booleano
      if (data.isRouter !== undefined) {
        if (typeof data.isRouter === 'string') {
          data.isRouter = data.isRouter.toLowerCase() === 'true';
        }
        console.log(`isRouter value processed as ${data.isRouter} (${typeof data.isRouter})`)
      } else {
        console.log(`isRouter not included in update data`)
      }
      
      const updatedAgent = await agentsService.update(id, workspaceId, data)
      
      if (!updatedAgent) {
        return res.status(404).json({ message: "Agent not found" })
      }
      
      res.json(updatedAgent)
    } catch (error) {
      next(error)
    }
  },

  /**
   * Delete an agent
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params
      
      try {
        await agentsService.delete(id, workspaceId)
        res.status(204).send()
      } catch (error: any) {
        // Check if error is because the agent wasn't found
        if (error.code === 'P2025') {
          return res.status(404).json({ message: "Agent not found" })
        }
        throw error
      }
    } catch (error) {
      next(error)
    }
  },

  /**
   * Duplicate an agent
   */
  async duplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params
      console.log(`Duplicate request received for agent ${id}`)
      
      const duplicatedAgent = await agentsService.duplicate(id, workspaceId)
      
      if (!duplicatedAgent) {
        return res.status(404).json({ message: "Agent not found" })
      }
      
      res.json(duplicatedAgent)
    } catch (error) {
      console.error(`Error duplicating agent ${req.params.id}:`, error)
      next(error)
    }
  }
} 