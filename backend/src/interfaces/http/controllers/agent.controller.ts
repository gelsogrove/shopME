import { NextFunction, Request, Response } from 'express';
import { AgentService, agentService as applicationAgentService } from '../../../application/services/agent.service';
import { WorkspaceService } from '../../../application/services/workspace.service';
import { AgentProps } from '../../../domain/entities/agent.entity';
import { prisma } from '../../../lib/prisma';
import logger from '../../../utils/logger';

export class AgentController {
  private agentService: AgentService;

  constructor(agentService?: AgentService) {
    this.agentService = agentService || applicationAgentService;
  }

  /**
   * Get all agents for a workspace
   */
  getAllForWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('=== AGENT CONTROLLER getAllForWorkspace ===');
      console.log('req.params:', req.params);
      console.log('req.params.workspaceId:', req.params.workspaceId);
      console.log('req.headers["x-workspace-id"]:', req.headers['x-workspace-id']);
      console.log('(req as any).workspaceId:', (req as any).workspaceId);
      console.log('req.user:', req.user ? { userId: (req.user as any).userId } : null);
      
      // DEBUG: Collect all possible workspaceId sources
      const paramId = req.params.workspaceId;
      const headerId = req.headers['x-workspace-id'];
      const customId = (req as any).workspaceId;
      const userId = req.user && (req.user as any).workspaceId;
      let workspaceId = paramId || customId || headerId || userId;
      console.log('DEBUG workspaceId sources:', { paramId, customId, headerId, userId, final: workspaceId });
      
      // Always include SQL query for debugging
      const sqlQuery = `SELECT "id" FROM "Workspace" WHERE "id" = '${workspaceId}' LIMIT 1;`;
      
      // FORCE DEBUG RESPONSE TO SEE WHAT'S HAPPENING
      console.log('FORCING DEBUG RESPONSE - workspaceId:', workspaceId);
      console.log('workspaceId type:', typeof workspaceId);
      console.log('workspaceId length:', workspaceId ? workspaceId.length : 'null/undefined');
      console.log('workspaceId truthy:', !!workspaceId);
      console.log('workspaceId trim:', workspaceId ? workspaceId.trim() : 'null/undefined');
      
      return res.status(400).json({
        message: 'FORCED DEBUG RESPONSE',
        debug: { 
          paramId, 
          customId, 
          headerId, 
          userId, 
          final: workspaceId,
          type: typeof workspaceId,
          length: workspaceId ? workspaceId.length : null,
          truthy: !!workspaceId,
          trimmed: workspaceId ? workspaceId.trim() : null,
          originalUrl: req.originalUrl,
          method: req.method,
          params: req.params,
          headers: {
            'x-workspace-id': req.headers['x-workspace-id'],
            'workspace-id': req.headers['workspace-id']
          }
        },
        sqlQuery
      });
      
      if (!workspaceId) {
        return res.status(400).json({
          message: 'Workspace ID is required',
          debug: { paramId, customId, headerId, userId, final: workspaceId },
          sqlQuery
        });
      }
      // Check if workspace exists using WorkspaceService
      const workspaceService = new WorkspaceService(prisma);
      const workspace = await workspaceService.getById(workspaceId);
      if (!workspace) {
        return res.status(404).json({
          message: 'Workspace not found',
          workspaceId,
          sqlQuery
        });
      }
      logger.info(`Getting all agents for workspace ${workspaceId}`);
      
      const agents = await this.agentService.getAllForWorkspace(workspaceId);
      console.log('=== AGENT CONTROLLER SUCCESS ===');
      return res.json(agents);
    } catch (error) {
      console.log('=== AGENT CONTROLLER ERROR ===', error);
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
  async create(req: Request, res: Response): Promise<void> {
    try {
      let workspaceId = (req as any).workspaceId;
      workspaceId = this.agentService.getWorkspaceId(workspaceId, req.user);
      
      // Get data from request body
      const data = {
        ...req.body,
        workspaceId
      }
      
      // Create the agent with workspaceId
      const agent = await this.agentService.create(data, workspaceId);
      
      res.status(201).json(agent);
    } catch (err: any) {
      // Check if this is a conflict error (duplicate router agent)
      if (err.message && err.message.includes("router agent already exists")) {
        res.status(409).json({
          status: 'error',
          message: "A router agent already exists for this workspace"
        });
        return;
      }
      
      this.handleError(res, err, 'Error creating agent');
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
      
      const updatedAgent = await this.agentService.update(id, data, workspaceId);
      
      if (!updatedAgent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      
      return res.json(updatedAgent);
    } catch (error: any) {
      logger.error('Error updating agent:', error);
      
      // Check if this is a conflict error (duplicate router agent)
      if (error.message && error.message.includes("router agent already exists")) {
        return res.status(409).json({ 
          message: "A router agent already exists for this workspace" 
        });
      }
      
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
      
      try {
        await this.agentService.delete(id, workspaceId);
        return res.status(204).send();
      } catch (error: any) {
        // Check if error is because the agent wasn't found
        if (error.code === 'P2025' || error.message === 'Agent not found') {
          return res.status(404).json({ message: 'Agent not found' });
        }
        throw error;
      }
    } catch (error) {
      logger.error('Error deleting agent:', error);
      return next(error);
    }
  }

  /**
   * Handle API errors with consistent response format
   */
  private handleError(res: Response, err: any, message: string): void {
    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || message;
    
    logger.error(`${message}:`, err);
    
    res.status(statusCode).json({
      status: 'error',
      message: errorMessage
    });
  }
} 