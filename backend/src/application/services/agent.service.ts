import { Agent, AgentProps } from '../../domain/entities/agent.entity';
import { AgentRepositoryInterface } from '../../domain/repositories/agent.repository.interface';
import { AgentRepository } from '../../repositories/agent.repository';
import logger from '../../utils/logger';
import { getDefaultWorkspaceId } from '../../utils/workspace';

export class AgentService {
  private repository: AgentRepositoryInterface;

  constructor(repository?: AgentRepositoryInterface) {
    this.repository = repository || new AgentRepository();
  }

  /**
   * Get all agents for a workspace
   */
  async getAllForWorkspace(workspaceId: string): Promise<Agent[]> {
    logger.info(`Getting all agents for workspace ${workspaceId}`);

    try {
      const agents = await this.repository.findAllByWorkspace(workspaceId);
      logger.info(`Found ${agents.length} agents for workspace ${workspaceId}`);
      return agents;
    } catch (error) {
      logger.error(`Error getting agents for workspace ${workspaceId}:`, error);
      throw error;
    }
  }

  /**
   * Get an agent by ID
   */
  async getById(id: string, workspaceId: string): Promise<Agent | null> {
    logger.info(`Getting agent ${id} from workspace ${workspaceId}`);

    try {
      const agent = await this.repository.findById(id, workspaceId);
      
      if (!agent) {
        logger.info(`Agent ${id} not found in workspace ${workspaceId}`);
        return null;
      }
      
      logger.info(`Found agent ${id}`);
      return agent;
    } catch (error) {
      logger.error(`Error getting agent ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new agent
   */
  async create(data: AgentProps): Promise<Agent> {
    const { isRouter = false } = data;
    logger.info(`Creating agent for workspace ${data.workspaceId}, isRouter: ${isRouter}`);
    
    try {
      // Start by validating the agent data
      const agent = Agent.create(data);
      
      // If this is a router agent, check if one already exists
      if (isRouter) {
        const existingRouter = await this.repository.findRouterByWorkspace(data.workspaceId);
        
        if (existingRouter) {
          logger.error(`A router agent already exists for workspace ${data.workspaceId}`);
          throw new Error('A router agent already exists for this workspace');
        }
      }
      
      // Create the agent
      const createdAgent = await this.repository.create(agent);
      
      logger.info(`Agent created successfully with ID ${createdAgent.id}`);
      return createdAgent;
    } catch (error) {
      logger.error(`Error creating agent:`, error);
      throw error;
    }
  }

  /**
   * Update an agent
   */
  async update(id: string, workspaceId: string, data: Partial<AgentProps>): Promise<Agent | null> {
    logger.info(`Updating agent ${id} for workspace ${workspaceId}`);
    
    try {
      // Verify the agent exists
      const agent = await this.repository.findById(id, workspaceId);
      
      if (!agent) {
        logger.info(`Agent ${id} not found in workspace ${workspaceId}`);
        return null;
      }
      
      // Process the department field - use the original agent's isRouter value
      const processedData = {
        ...data,
        // Keep original isRouter status, don't allow changing it
        isRouter: agent.isRouter,
        // If this is a router agent, department must be null
        department: agent.isRouter ? null : (data.department ?? agent.department)
      };
      
      // Update the agent
      const updatedAgent = await this.repository.update(id, workspaceId, processedData);
      
      logger.info(`Agent ${id} updated successfully`);
      return updatedAgent;
    } catch (error) {
      logger.error(`Error updating agent ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an agent
   */
  async delete(id: string, workspaceId: string): Promise<boolean> {
    logger.info(`Deleting agent ${id} from workspace ${workspaceId}`);
    
    try {
      const deleted = await this.repository.delete(id, workspaceId);
      
      if (deleted) {
        logger.info(`Agent ${id} deleted successfully`);
      } else {
        logger.info(`Agent ${id} not found for deletion`);
      }
      
      return deleted;
    } catch (error) {
      logger.error(`Error deleting agent ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get or determine a workspace ID from user context or default
   */
  getWorkspaceId(workspaceId?: string, userContext?: any): string {
    // If provided directly, use it
    if (workspaceId) {
      return workspaceId;
    }
    
    // Try to get from user context
    if (userContext?.workspaceId) {
      return userContext.workspaceId;
    }
    
    // Use default as last resort
    const defaultId = getDefaultWorkspaceId();
    logger.debug(`Using default workspace ID: ${defaultId}`);
    return defaultId;
  }
} 