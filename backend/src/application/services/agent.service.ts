// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import logger from "../../utils/logger";

/**
 * Service layer for Agents
 * Handles agent operations for AI assistants
 */
export class AgentService {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get all agents for a workspace
   * @param workspaceId Workspace ID
   * @returns List of agents
   */
  async getAllForWorkspace(workspaceId: string) {
    try {
      logger.info(`Getting all agents for workspace ${workspaceId}`);
      console.log('DEBUG AGENT SERVICE: workspaceId:', workspaceId);
      
      // Ensure workspaceId is not undefined
      if (!workspaceId) {
        logger.warn("getAllForWorkspace called without workspaceId");
        return [];
      }
      
      let agents = [];
      try {
        agents = await this.prisma.prompts.findMany({
          where: { 
            workspaceId 
          }
        });
        console.log('DEBUG AGENT SERVICE: Prisma result:', agents);
      } catch (prismaError) {
        console.log('DEBUG AGENT SERVICE: Prisma query error:', prismaError);
      }
      if (!agents || agents.length === 0) {
        try {
          const rawAgents = await this.prisma.$queryRawUnsafe(
            `SELECT * FROM "Prompts" WHERE "workspaceId" = $1`,
            workspaceId
          );
          console.log('DEBUG AGENT SERVICE: RAW SQL result:', rawAgents);
          return rawAgents;
        } catch (rawError) {
          console.log('DEBUG AGENT SERVICE: RAW SQL error:', rawError);
        }
      }
      logger.info(`Found ${agents.length} agents for workspace ${workspaceId}`);
      return agents || [];
    } catch (error) {
      logger.error(`Error getting agents:`, error);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Get an agent by ID
   * @param id Agent ID
   * @param workspaceId Workspace ID
   * @returns Agent or null
   */
  async getById(id: string, workspaceId: string) {
    try {
      logger.info(`Getting agent ${id} for workspace ${workspaceId}`);
      
      // Ensure id and workspaceId are not undefined
      if (!id || !workspaceId) {
        logger.warn("getById called without id or workspaceId");
        return null;
      }
      
      const agent = await this.prisma.prompts.findFirst({
        where: { 
          id,
          workspaceId 
        }
      });
      
      return agent;
    } catch (error) {
      logger.error(`Error getting agent:`, error);
      throw error;
    }
  }

  /**
   * Create a new agent
   * @param data Agent data
   * @param workspaceId Workspace ID
   * @returns Created agent
   */
  async create(data: any, workspaceId: string) {
    try {
      logger.info(`Creating new agent for workspace ${workspaceId}`);
      
      // Ensure required data is present
      if (!data.name || !workspaceId) {
        logger.warn("Missing required data for creating agent");
        throw new Error("Name and workspace ID are required");
      }
      
      // Check if this is a router agent
      if (data.isRouter) {
        // Check if a router agent already exists for this workspace
        const existingRouter = await this.prisma.prompts.findFirst({
          where: {
            workspaceId,
            isRouter: true
          }
        });
        
        if (existingRouter) {
          const error = new Error('A router agent already exists for this workspace');
          error.statusCode = 409;
          throw error;
        }
      }
      
      // Set the workspace ID in the data
      data.workspaceId = workspaceId;
      
      // Ensure boolean fields are boolean
      data.isRouter = !!data.isRouter;
      data.isActive = data.isActive === undefined ? true : !!data.isActive;
      
      const agent = await this.prisma.prompts.create({
        data
      });
      
      return agent;
    } catch (error) {
      logger.error(`Error creating agent:`, error);
      throw error;
    }
  }

  /**
   * Update an agent
   * @param id Agent ID
   * @param data Agent data
   * @param workspaceId Workspace ID
   * @returns Updated agent
   */
  async update(id: string, data: any, workspaceId: string) {
    try {
      logger.info(`Updating agent ${id} for workspace ${workspaceId}`);
      
      // Ensure required data is present
      if (!id || !workspaceId) {
        logger.warn("Missing required data for updating agent");
        throw new Error("ID and workspace ID are required");
      }
      
      // First check if the agent exists and belongs to the workspace
      const existingAgent = await this.prisma.prompts.findFirst({
        where: {
          id,
          workspaceId
        }
      });
      
      if (!existingAgent) {
        return null;
      }
      
      // If this is trying to set isRouter=true, check if another router agent exists
      if (data.isRouter && !existingAgent.isRouter) {
        const existingRouter = await this.prisma.prompts.findFirst({
          where: {
            workspaceId,
            isRouter: true,
            NOT: {
              id
            }
          }
        });
        
        if (existingRouter) {
          const error = new Error('A router agent already exists for this workspace');
          error.statusCode = 409;
          throw error;
        }
      }
      
      // Update the agent
      const updatedAgent = await this.prisma.prompts.update({
        where: { id },
        data
      });
      
      return updatedAgent;
    } catch (error) {
      logger.error(`Error updating agent:`, error);
      throw error;
    }
  }

  /**
   * Delete an agent
   * @param id Agent ID
   * @param workspaceId Workspace ID
   * @returns Success status
   */
  async delete(id: string, workspaceId: string) {
    try {
      logger.info(`Deleting agent ${id} for workspace ${workspaceId}`);
      
      // Ensure required data is present
      if (!id || !workspaceId) {
        logger.warn("Missing required data for deleting agent");
        throw new Error("ID and workspace ID are required");
      }
      
      // First check if the agent exists and belongs to the workspace
      const existingAgent = await this.prisma.prompts.findFirst({
        where: {
          id,
          workspaceId
        }
      });
      
      if (!existingAgent) {
        throw new Error("Agent not found");
      }
      
      // Delete the agent
      await this.prisma.prompts.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      logger.error(`Error deleting agent:`, error);
      throw error;
    }
  }
  
  /**
   * Get or determine a workspace ID from user context or default
   * @param workspaceId Optional workspace ID directly provided
   * @param userContext User context that may contain workspace ID
   * @returns Workspace ID
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
    
    // Try to get from default workspace in database
    try {
      // This is synchronous so we can't use Prisma here directly
      // In a real app, this should be handled differently
      const defaultId = process.env.DEFAULT_WORKSPACE_ID || 'default-workspace-id';
      logger.debug(`Using default workspace ID: ${defaultId}`);
      return defaultId;
    } catch (error) {
      logger.error('Error getting default workspace ID:', error);
      return 'default-workspace-id';
    }
  }
}

// Export a singleton instance for backward compatibility
export const agentService = new AgentService(); 