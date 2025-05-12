import { NextFunction, Request, Response } from 'express';
import { AgentService } from '../../../application/services/agent.service';
import { AgentProps } from '../../../domain/entities/agent.entity';
import logger from '../../../utils/logger';

export class AgentController {
  private agentService: AgentService;

  constructor(agentService?: AgentService) {
    this.agentService = agentService || new AgentService();
  }

  /**
   * Get all agents for a workspace
   */
  getAllForWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get workspaceId from params or headers
      let workspaceId = req.params.workspaceId;
      
      // If not in params, try to determine from user context
      workspaceId = this.agentService.getWorkspaceId(workspaceId, req.user);
      
      logger.info(`Getting all agents for workspace ${workspaceId}`);
      
      const agents = await this.agentService.getAllForWorkspace(workspaceId);
      return res.json(agents);
    } catch (error) {
      logger.error('Error fetching agents:', error);
      return next(error);
    }
  }

  /**
   * Get a specific agent by ID
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      let workspaceId = req.params.workspaceId;
      
      // If not in params, try to determine from user context
      workspaceId = this.agentService.getWorkspaceId(workspaceId, req.user);
      
      logger.info(`Getting agent ${id} for workspace ${workspaceId}`);
      
      const agent = await this.agentService.getById(id, workspaceId);
      
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      
      return res.json(agent);
    } catch (error) {
      logger.error('Error fetching agent:', error);
      return next(error);
    }
  }

  /**
   * Create a new agent
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let workspaceId = req.params.workspaceId;
      
      // If not in params, try to determine from user context
      workspaceId = this.agentService.getWorkspaceId(workspaceId, req.user);
      
      logger.info(`Creating agent for workspace ${workspaceId}`);
      
      // Process input data
      let data = req.body as AgentProps;
      data.workspaceId = workspaceId;
      
      // Handle boolean values that might come as strings
      if (typeof req.body.isRouter === 'string') {
        data.isRouter = req.body.isRouter.toLowerCase() === 'true';
      }
      
      const agent = await this.agentService.create(data);
      return res.status(201).json(agent);
    } catch (error) {
      logger.error('Error creating agent:', error);
      if (error instanceof Error && error.message.includes('router agent already exists')) {
        return res.status(409).json({ message: error.message });
      }
      return next(error);
    }
  }

  /**
   * Update an existing agent
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      let workspaceId = req.params.workspaceId;
      
      // If not in params, try to determine from user context
      workspaceId = this.agentService.getWorkspaceId(workspaceId, req.user);
      
      logger.info(`Updating agent ${id} for workspace ${workspaceId}`);
      
      // Process input data
      let data = req.body as Partial<AgentProps>;
      
      // Handle boolean values that might come as strings
      if (typeof req.body.isRouter === 'string') {
        data.isRouter = req.body.isRouter.toLowerCase() === 'true';
      }
      
      const updatedAgent = await this.agentService.update(id, workspaceId, data);
      
      if (!updatedAgent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      
      return res.json(updatedAgent);
    } catch (error) {
      logger.error('Error updating agent:', error);
      return next(error);
    }
  }

  /**
   * Delete an agent
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      let workspaceId = req.params.workspaceId;
      
      // If not in params, try to determine from user context
      workspaceId = this.agentService.getWorkspaceId(workspaceId, req.user);
      
      logger.info(`Deleting agent ${id} for workspace ${workspaceId}`);
      
      const result = await this.agentService.delete(id, workspaceId);
      
      if (!result) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      
      return res.status(204).send();
    } catch (error) {
      logger.error('Error deleting agent:', error);
      return next(error);
    }
  }
} 