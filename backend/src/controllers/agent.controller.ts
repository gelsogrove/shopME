import { NextFunction, Request, Response } from "express";
import { agentService } from "../services/agent.service";

export const agentController = {
  /**
   * Get all agents for a workspace
   */
  async getAllForWorkspace(req: Request, res: Response, next: NextFunction) {
    console.log('=== OLD AGENT CONTROLLER getAllForWorkspace ===');
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    console.log('Request params:', req.params);
    console.log('Request query:', req.query);
    console.log('Request headers workspace-related:', {
      'x-workspace-id': req.headers['x-workspace-id'],
      'workspace-id': req.headers['workspace-id']
    });

    // Get workspaceId from params or user context
    let workspaceId = req.params.workspaceId;
    
    console.log('workspaceId from params:', workspaceId);
    console.log('req.user:', req.user);
    
    // If workspaceId is not provided in the params (direct /agent route)
    if (!workspaceId) {
      try {
        // Try to get from user context
        const user = req.user as any;
        workspaceId = user?.workspaceId;
        
        console.log('workspaceId from user context:', workspaceId);
        
        // If still no workspace ID, return error instead of using fallback
        if (!workspaceId) {
          console.log("❌ No workspaceId found in params or user context");
          
          // Create comprehensive debug response
          const debugResponse = {
            message: "Workspace ID is required",
            debug: {
              url: req.originalUrl,
              method: req.method,
              params: req.params,
              query: req.query,
              headers: {
                'x-workspace-id': req.headers['x-workspace-id'],
                'workspace-id': req.headers['workspace-id']
              },
              user: req.user ? { userId: (req.user as any).userId, workspaceId: (req.user as any).workspaceId } : null,
              workspaceIdSources: {
                fromParams: req.params.workspaceId,
                fromUser: user?.workspaceId,
                fromHeaders: req.headers['x-workspace-id']
              }
            },
            sqlQuery: "No SQL query executed - workspace ID missing"
          };
          
          return res.status(400).json(debugResponse);
        }
        
        console.log(`✅ No workspaceId in params, using ${workspaceId} from user context`);
      } catch (error) {
        console.error("Failed to get workspace ID:", error);
        
        const debugResponse = {
          message: "Workspace ID is required",
          debug: {
            error: error.message,
            stack: error.stack,
            url: req.originalUrl,
            method: req.method
          },
          sqlQuery: "Error occurred before SQL execution"
        };
        
        return res.status(400).json(debugResponse);
      }
    }
    
    console.log(`✅ Getting all agents for workspace ${workspaceId}`);
    console.log("Request params:", req.params);
    console.log("Request headers:", req.headers);
    
    try {
      const agents = await agentService.getAllForWorkspace(workspaceId)
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
    const { id } = req.params;
    let { workspaceId } = req.params;
    
    // If workspaceId is not provided in the params (direct /agent/:id route)
    if (!workspaceId) {
      try {
        // Try to get from user context
        const user = req.user as any;
        workspaceId = user?.workspaceId;
        
        // If still no workspace ID, return error instead of using fallback
        if (!workspaceId) {
          console.log("No workspaceId found in params or user context");
          return res.status(400).json({ message: "Workspace ID is required" });
        }
        
        console.log(`No workspaceId in params, using ${workspaceId} from user context`);
      } catch (error) {
        console.error("Failed to get workspace ID:", error);
        return res.status(400).json({ message: "Workspace ID is required" });
      }
    }
    
    console.log(`Getting agent ${id} from workspace ${workspaceId}`);
    
    try {
      const agent = await agentService.getById(id, workspaceId)
      
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
    let { workspaceId } = req.params;
    
    // If workspaceId is not provided in the params (direct /agent route)
    if (!workspaceId) {
      try {
        // Try to get from user context
        const user = req.user as any;
        workspaceId = user?.workspaceId;
        
        // If still no workspace ID, return error instead of using fallback
        if (!workspaceId) {
          console.log("No workspaceId found in params or user context");
          return res.status(400).json({ message: "Workspace ID is required" });
        }
        
        console.log(`No workspaceId in params, using ${workspaceId} from user context`);
      } catch (error) {
        console.error("Failed to get workspace ID:", error);
        return res.status(400).json({ message: "Workspace ID is required" });
      }
    }
    
    console.log(`Creating agent for workspace ${workspaceId}`);
    console.log("Request body:", req.body);
    
    try {
      const agentData = {
        ...req.body,
        workspaceId
      }
      
      console.log("Agent data to be created:", agentData);
      const agent = await agentService.create(agentData)
      console.log(`Agent created successfully with ID ${agent.id}`);
      res.status(201).json(agent)
    } catch (error) {
      console.error(`Error creating agent for workspace ${workspaceId}:`, error);
      
      // Check if this is a conflict error (duplicate router agent)
      if (error.message && error.message.includes("router agent already exists")) {
        return res.status(409).json({ 
          message: "A router agent already exists for this workspace" 
        });
      }
      
      next(error)
    }
  },

  /**
   * Update an existing agent
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      let { workspaceId } = req.params;
      
      // If workspaceId is not provided in the params (direct /agent/:id route)
      if (!workspaceId) {
        try {
          // Try to get from user context
          const user = req.user as any;
          workspaceId = user?.workspaceId;
          
          // If still no workspace ID, return error instead of using fallback
          if (!workspaceId) {
            console.log("No workspaceId found in params or user context");
            return res.status(400).json({ message: "Workspace ID is required" });
          }
          
          console.log(`No workspaceId in params, using ${workspaceId} from user context`);
        } catch (error) {
          console.error("Failed to get workspace ID:", error);
          return res.status(400).json({ message: "Workspace ID is required" });
        }
      }
      
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
      const updatedAgent = await agentService.update(id, workspaceId, data)
      
      if (!updatedAgent) {
        console.log(`Agent ${id} not found for update`);
        return res.status(404).json({ message: "Agent not found" })
      }
      
      console.log(`Agent ${id} updated successfully`);
      res.json(updatedAgent)
    } catch (error) {
      console.error(`Error updating agent:`, error);
      
      // Check if this is a conflict error (duplicate router agent)
      if (error.message && error.message.includes("router agent already exists")) {
        return res.status(409).json({ 
          message: "A router agent already exists for this workspace" 
        });
      }
      
      next(error)
    }
  },

  /**
   * Delete an agent
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      let { workspaceId } = req.params;
      
      // If workspaceId is not provided in the params (direct /agent/:id route)
      if (!workspaceId) {
        try {
          // Try to get from user context
          const user = req.user as any;
          workspaceId = user?.workspaceId;
          
          // If still no workspace ID, return error instead of using fallback
          if (!workspaceId) {
            console.log("No workspaceId found in params or user context");
            return res.status(400).json({ message: "Workspace ID is required" });
          }
          
          console.log(`No workspaceId in params, using ${workspaceId} from user context`);
        } catch (error) {
          console.error("Failed to get workspace ID:", error);
          return res.status(400).json({ message: "Workspace ID is required" });
        }
      }
      
      console.log(`Deleting agent ${id} from workspace ${workspaceId}`);
      
      try {
        const deleted = await agentService.delete(id, workspaceId)
        
        if (!deleted) {
          console.log(`Agent ${id} not found for deletion`);
          return res.status(404).json({ message: "Agent not found" })
        }
        
        console.log(`Agent ${id} deleted successfully`);
        res.status(204).send()
      } catch (error) {
        console.error(`Error deleting agent ${id}:`, error);
        next(error)
      }
    } catch (error) {
      console.error("Error in delete agent controller:", error);
      next(error)
    }
  }
} 