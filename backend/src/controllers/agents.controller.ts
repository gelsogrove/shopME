import { NextFunction, Request, Response } from "express";
import { agentsService } from "../services/agents.service";

export const agentsController = {
  /**
   * Get all agents for a workspace
   */
  async getAllForWorkspace(req: Request, res: Response, next: NextFunction) {
    const { workspaceId } = req.params;
    console.log(`Getting all agents for workspace ${workspaceId}`);
    
    try {
      const agents = await agentsService.getAllForWorkspace(workspaceId)
      console.log(`Found ${agents.length} agents for workspace ${workspaceId}`);
      res.json(agents)
    } catch (error) {
      console.error(`Error getting agents for workspace ${workspaceId}:`, error);
      next(error)
    }
  },

  /**
   * Get a specific agent by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    const { id, workspaceId } = req.params;
    console.log(`Getting agent ${id} from workspace ${workspaceId}`);
    
    try {
      const agent = await agentsService.getById(id, workspaceId)
      
      if (!agent) {
        console.log(`Agent ${id} not found in workspace ${workspaceId}`);
        return res.status(404).json({ message: "Agent not found" })
      }
      
      console.log(`Found agent ${id} in workspace ${workspaceId}`);
      res.json(agent)
    } catch (error) {
      console.error(`Error getting agent ${id} from workspace ${workspaceId}:`, error);
      next(error)
    }
  },

  /**
   * Create a new agent
   */
  async create(req: Request, res: Response, next: NextFunction) {
    const { workspaceId } = req.params;
    console.log(`Creating agent for workspace ${workspaceId}`);
    console.log("Request body:", req.body);
    
    try {
      const agentData = {
        ...req.body,
        workspaceId
      }
      
      console.log("Agent data to be created:", agentData);
      const agent = await agentsService.create(agentData)
      console.log(`Agent created successfully with ID ${agent.id}`);
      res.status(201).json(agent)
    } catch (error) {
      console.error(`Error creating agent for workspace ${workspaceId}:`, error);
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
      
      console.log("Agent data to be updated:", data);
      const updatedAgent = await agentsService.update(id, workspaceId, data)
      
      if (!updatedAgent) {
        console.log(`Agent ${id} not found for update`);
        return res.status(404).json({ message: "Agent not found" })
      }
      
      console.log(`Agent ${id} updated successfully`);
      res.json(updatedAgent)
    } catch (error) {
      console.error(`Error updating agent:`, error);
      next(error)
    }
  },

  /**
   * Delete an agent
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params
      console.log(`Deleting agent ${id} from workspace ${workspaceId}`);
      
      try {
        await agentsService.delete(id, workspaceId)
        console.log(`Agent ${id} deleted successfully`);
        res.status(204).send()
      } catch (error: any) {
        // Check if error is because the agent wasn't found
        if (error.code === 'P2025') {
          console.log(`Agent ${id} not found for deletion`);
          return res.status(404).json({ message: "Agent not found" })
        }
        throw error
      }
    } catch (error) {
      console.error(`Error deleting agent:`, error);
      next(error)
    }
  },

  /**
   * Duplicate an agent
   */
  async duplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params
      console.log(`Duplicate request received for agent ${id} in workspace ${workspaceId}`)
      
      const duplicatedAgent = await agentsService.duplicate(id, workspaceId)
      
      if (!duplicatedAgent) {
        console.log(`Agent ${id} not found for duplication`);
        return res.status(404).json({ message: "Agent not found" })
      }
      
      console.log(`Agent ${id} duplicated successfully, new ID: ${duplicatedAgent.id}`);
      res.json(duplicatedAgent)
    } catch (error) {
      console.error(`Error duplicating agent ${req.params.id}:`, error)
      next(error)
    }
  }
} 