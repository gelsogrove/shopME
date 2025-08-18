import { NextFunction, Request, Response } from "express";
import { agentService } from "../services/agent.service";

export const agentController = {
  /**
   * Get all agents for a workspace
   */
  async getAllForWorkspace(req: Request, res: Response, next: NextFunction) {
    logger.info('=== OLD AGENT CONTROLLER getAllForWorkspace ===');
    logger.info('Request URL:', req.originalUrl);
    logger.info('Request method:', req.method);
    logger.info('Request params:', req.params);
    logger.info('Request query:', req.query);
    logger.info('Request headers workspace-related:', {
      'x-workspace-id': req.headers['x-workspace-id'],
      'workspace-id': req.headers['workspace-id']
    });

    // Get workspaceId from params or user context
    let workspaceId = req.params.workspaceId;
    
    logger.info('workspaceId from params:', workspaceId);
    logger.info('req.user:', req.user);
    
    // If workspaceId is not provided in the params (direct /agent route)
    if (!workspaceId) {
      try {
        // Try to get from user context
        const user = req.user as any;
        workspaceId = user?.workspaceId;
        
        logger.info('workspaceId from user context:', workspaceId);
        
        // If still no workspace ID, return error instead of using fallback
        if (!workspaceId) {
          logger.info("❌ No workspaceId found in params or user context");
          
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
        
        logger.info(`✅ No workspaceId in params, using ${workspaceId} from user context`);
      } catch (error) {
        logger.error("Failed to get workspace ID:", error);
        
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
    
    logger.info(`✅ Getting all agents for workspace ${workspaceId}`);
    logger.info("Request params:", req.params);
    logger.info("Request headers:", req.headers);
    
    try {
      const agents = await agentService.getAllForWorkspace(workspaceId)
      logger.info(`Found ${agents.length} agents for workspace ${workspaceId}`);
      res.json(agents)
    } catch (error) {
      logger.error(`Error getting agents for workspace ${workspaceId}:`, error);
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
          logger.info("No workspaceId found in params or user context");
          return res.status(400).json({ message: "Workspace ID is required" });
        }
        
        logger.info(`No workspaceId in params, using ${workspaceId} from user context`);
      } catch (error) {
        logger.error("Failed to get workspace ID:", error);
        return res.status(400).json({ message: "Workspace ID is required" });
      }
    }
    
    logger.info(`Getting agent ${id} from workspace ${workspaceId}`);
    
    try {
      const agent = await agentService.getById(id, workspaceId)
      
      if (!agent) {
        logger.info(`Agent ${id} not found in workspace ${workspaceId}`);
        return res.status(404).json({ message: "Agent not found" })
      }
      
      logger.info(`Found agent ${id} in workspace ${workspaceId}`);
      res.json(agent)
    } catch (error) {
      logger.error(`Error getting agent ${id} from workspace ${workspaceId}:`, error);
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
          logger.info("No workspaceId found in params or user context");
          return res.status(400).json({ message: "Workspace ID is required" });
        }
        
        logger.info(`No workspaceId in params, using ${workspaceId} from user context`);
      } catch (error) {
        logger.error("Failed to get workspace ID:", error);
        return res.status(400).json({ message: "Workspace ID is required" });
      }
    }
    
    logger.info(`Creating agent for workspace ${workspaceId}`);
    logger.info("Request body:", req.body);
    
    try {
      const agentData = {
        ...req.body,
        workspaceId
      }
      
      logger.info("Agent data to be created:", agentData);
      const agent = await agentService.create(agentData)
      logger.info(`Agent created successfully with ID ${agent.id}`);
      res.status(201).json(agent)
    } catch (error) {
      logger.error(`Error creating agent for workspace ${workspaceId}:`, error);
      
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
            logger.info("No workspaceId found in params or user context");
            return res.status(400).json({ message: "Workspace ID is required" });
          }
          
          logger.info(`No workspaceId in params, using ${workspaceId} from user context`);
        } catch (error) {
          logger.error("Failed to get workspace ID:", error);
          return res.status(400).json({ message: "Workspace ID is required" });
        }
      }
      
      // Esplicito log dei dati ricevuti nel body
      logger.info(`Agent update request received for id ${id}:`, req.body)
      
      // Assicuriamoci che isRouter sia interpretato correttamente anche se viene inviato come stringa
      let data = { ...req.body };
      
      // Se isRouter è presente e inviato come stringa, convertiamolo in booleano
      if (data.isRouter !== undefined) {
        if (typeof data.isRouter === 'string') {
          data.isRouter = data.isRouter.toLowerCase() === 'true';
        }
        logger.info(`isRouter value processed as ${data.isRouter} (${typeof data.isRouter})`)
      } else {
        logger.info(`isRouter not included in update data`)
      }
      
      logger.info("Agent data to be updated:", data);
      const updatedAgent = await agentService.update(id, workspaceId, data)
      
      if (!updatedAgent) {
        logger.info(`Agent ${id} not found for update`);
        return res.status(404).json({ message: "Agent not found" })
      }
      
      logger.info(`Agent ${id} updated successfully`);
      res.json(updatedAgent)
    } catch (error) {
      logger.error(`Error updating agent:`, error);
      
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
            logger.info("No workspaceId found in params or user context");
            return res.status(400).json({ message: "Workspace ID is required" });
          }
          
          logger.info(`No workspaceId in params, using ${workspaceId} from user context`);
        } catch (error) {
          logger.error("Failed to get workspace ID:", error);
          return res.status(400).json({ message: "Workspace ID is required" });
        }
      }
      
      logger.info(`Deleting agent ${id} from workspace ${workspaceId}`);
      
      try {
        const deleted = await agentService.delete(id, workspaceId)
        
        if (!deleted) {
          logger.info(`Agent ${id} not found for deletion`);
          return res.status(404).json({ message: "Agent not found" })
        }
        
        logger.info(`Agent ${id} deleted successfully`);
        res.status(204).send()
      } catch (error) {
        logger.error(`Error deleting agent ${id}:`, error);
        next(error)
      }
    } catch (error) {
      logger.error("Error in delete agent controller:", error);
      next(error)
    }
  }
} 