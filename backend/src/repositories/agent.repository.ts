import { PrismaClient } from '@prisma/client';
import { Agent, AgentProps } from '../domain/entities/agent.entity';
import { AgentRepositoryInterface } from '../domain/repositories/agent.repository.interface';
import logger from '../utils/logger';

export class AgentRepository implements AgentRepositoryInterface {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Map database model to domain entity
   */
  private mapToDomain(data: any): Agent {
    return Agent.create({
      id: data.id,
      name: data.name,
      content: data.content,
      isActive: data.isActive ?? true,
      isRouter: data.isRouter ?? false,
      department: data.department,
      workspaceId: data.workspaceId,
      temperature: data.temperature,
      top_p: data.top_p,
      top_k: data.top_k,
      model: data.model,
      max_tokens: data.max_tokens,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  /**
   * Map domain entity to database model
   */
  private mapToDatabase(agent: Agent): any {
    return {
      id: agent.id || undefined,
      name: agent.name,
      content: agent.content,
      isActive: agent.isActive,
      isRouter: agent.isRouter,
      department: agent.department,
      workspaceId: agent.workspaceId,
      temperature: agent.temperature,
      top_p: agent.top_p,
      top_k: agent.top_k,
      model: agent.model,
      max_tokens: agent.max_tokens,
    };
  }

  /**
   * Find all agents for a given workspace
   */
  async findAllByWorkspace(workspaceId: string): Promise<Agent[]> {
    logger.debug(`Finding all agents for workspace ${workspaceId}`);

    try {
      const agents = await this.prisma.prompts.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'asc' },
      });

      logger.debug(`Found ${agents.length} agents for workspace ${workspaceId}`);
      return agents.map(agent => this.mapToDomain(agent));
    } catch (error) {
      logger.error(`Error finding agents for workspace ${workspaceId}:`, error);
      throw error;
    }
  }

  /**
   * Find an agent by its ID and workspace ID
   */
  async findById(id: string, workspaceId: string): Promise<Agent | null> {
    logger.debug(`Finding agent ${id} for workspace ${workspaceId}`);

    try {
      const agent = await this.prisma.prompts.findFirst({
        where: { id, workspaceId },
      });

      if (!agent) {
        logger.debug(`Agent ${id} not found`);
        return null;
      }

      logger.debug(`Found agent ${id}`);
      return this.mapToDomain(agent);
    } catch (error) {
      logger.error(`Error finding agent ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new agent
   */
  async create(agent: Agent): Promise<Agent> {
    logger.debug(`Creating agent ${agent.name} for workspace ${agent.workspaceId}`);

    try {
      const data = this.mapToDatabase(agent);
      
      // Create the agent
      const created = await this.prisma.prompts.create({
        data,
      });

      logger.debug(`Created agent with ID ${created.id}`);
      return this.mapToDomain(created);
    } catch (error) {
      logger.error(`Error creating agent:`, error);
      throw error;
    }
  }

  /**
   * Update an existing agent
   */
  async update(id: string, workspaceId: string, data: Partial<AgentProps>): Promise<Agent | null> {
    logger.debug(`Updating agent ${id} for workspace ${workspaceId}`);

    try {
      // Check if the agent exists
      const exists = await this.prisma.prompts.findFirst({
        where: { id, workspaceId },
      });

      if (!exists) {
        logger.debug(`Agent ${id} not found`);
        return null;
      }

      // Update the agent
      const updated = await this.prisma.prompts.update({
        where: { id },
        data,
      });

      logger.debug(`Updated agent ${id}`);
      return this.mapToDomain(updated);
    } catch (error) {
      logger.error(`Error updating agent ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an agent
   */
  async delete(id: string, workspaceId: string): Promise<boolean> {
    logger.debug(`Deleting agent ${id} for workspace ${workspaceId}`);

    try {
      // Check if the agent exists
      const agent = await this.prisma.prompts.findFirst({
        where: { id, workspaceId },
      });

      if (!agent) {
        logger.debug(`Agent ${id} not found`);
        return false;
      }

      // Delete the agent
      await this.prisma.prompts.delete({
        where: { id },
      });

      logger.debug(`Deleted agent ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting agent ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find a router agent for a workspace
   */
  async findRouterByWorkspace(workspaceId: string): Promise<Agent | null> {
    logger.debug(`Finding router agent for workspace ${workspaceId}`);

    try {
      const routerAgent = await this.prisma.prompts.findFirst({
        where: { 
          workspaceId, 
          isRouter: true 
        },
      });

      if (!routerAgent) {
        logger.debug(`No router agent found for workspace ${workspaceId}`);
        return null;
      }

      logger.debug(`Found router agent ${routerAgent.id}`);
      return this.mapToDomain(routerAgent);
    } catch (error) {
      logger.error(`Error finding router agent for workspace ${workspaceId}:`, error);
      throw error;
    }
  }
} 