import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface CreateAgentData {
  name: string
  content: string
  workspaceId: string
  isRouter?: boolean
  department?: string
  temperature?: number
  top_p?: number
  top_k?: number
  model?: string
  max_tokens?: number
}

interface UpdateAgentData {
  name?: string
  content?: string
  isRouter?: boolean
  department?: string
  temperature?: number
  top_p?: number
  top_k?: number
  model?: string
  max_tokens?: number
}

// Mapping functions between API and database
const mapToDatabase = (data: any) => {
  // Map API fields to database fields
  const dbData: any = { ...data };
  
  // No need to map isRouter as it now exists in the schema
  return dbData;
};

const mapFromDatabase = (data: any) => {
  // Map database fields to API fields
  return data;
};

export const agentService = {
  /**
   * Get all agents for a workspace
   */
  async getAllForWorkspace(workspaceId: string) {
    console.log(`[agentService] Getting all agents for workspace ${workspaceId}`);
    
    try {
      const results = await prisma.prompts.findMany({
        where: {
          workspaceId,
        },
        orderBy: [
          { createdAt: 'asc' },
        ],
      });

      console.log(`[agentService] Found ${results.length} agents for workspace ${workspaceId}`);
      
      // Return results directly as schema now matches API
      return results;
    } catch (error) {
      console.error(`[agentService] Error getting agents for workspace ${workspaceId}:`, error);
      throw error;
    }
  },

  /**
   * Get an agent by ID
   */
  async getById(id: string, workspaceId: string) {
    console.log(`[agentService] Getting agent ${id} from workspace ${workspaceId}`);
    
    try {
      const result = await prisma.prompts.findFirst({
        where: {
          id,
          workspaceId
        },
      });

      if (!result) {
        console.log(`[agentService] Agent ${id} not found in workspace ${workspaceId}`);
        return null;
      }
      
      console.log(`[agentService] Found agent ${id} in workspace ${workspaceId}:`, result);
      return result;
    } catch (error) {
      console.error(`[agentService] Error getting agent ${id} from workspace ${workspaceId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new agent
   * If isRouter is true, set all other agents' isRouter to false
   */
  async create(data: CreateAgentData) {
    const { workspaceId, isRouter = false, model, ...restData } = data;
    console.log(`[agentService] Creating agent for workspace ${workspaceId}, isRouter: ${isRouter}`);
    
    try {
      // Se si sta tentando di creare un router agent e ne esiste già uno, blocca
      if (isRouter) {
        const existingRouter = await prisma.prompts.findFirst({
          where: { workspaceId, isRouter: true },
        });
        if (existingRouter) {
          console.log(`[agentService] A router agent already exists for workspace ${workspaceId}`);
          throw new Error("A router agent already exists for this workspace");
        }
      }

      // Start a transaction
      return prisma.$transaction(async (tx) => {
        // If this agent should be router, set isRouter to false for all other agents
        if (isRouter) {
          console.log(`[agentService] Setting all other agents' isRouter to false for workspace ${workspaceId}`);
          await tx.prompts.updateMany({
            where: {
              workspaceId,
              isRouter: true,
            },
            data: {
              isRouter: false,
            },
          });
        }

        // Process the department field - ensure it's null for router agents, string for others
        const processedData = {
          ...restData,
          workspaceId,
          isRouter,
          department: isRouter ? null : (data.department || null)
        };

        // Create the new agent
        console.log(`[agentService] Creating new agent with data:`, processedData);
        const created = await tx.prompts.create({
          data: processedData
        });

        console.log(`[agentService] Agent created successfully with ID ${created.id}`);
        return created;
      });
    } catch (error) {
      console.error(`[agentService] Error creating agent for workspace ${workspaceId}:`, error);
      throw error;
    }
  },

  /**
   * Update an agent
   * If isRouter is set to true, set all other agents' isRouter to false
   */
  async update(id: string, workspaceId: string, data: UpdateAgentData) {
    console.log(`[agentService] Updating agent ${id} for workspace ${workspaceId}`);
    
    try {
      // Verifica solo che l'agente esista
      const agent = await prisma.prompts.findFirst({ where: { id, workspaceId } });
      if (!agent) {
        console.log(`[agentService] Agent ${id} not found in workspace ${workspaceId}`);
        return null;
      }
      
      console.log(`[agentService] Found agent to update:`, agent);
      
      // Rimuovi isRouter e model dai dati di aggiornamento
      const { isRouter, model, ...dataWithoutExcluded } = data;
      
      // Process the department field - use the original agent's isRouter value
      const processedData = {
        ...dataWithoutExcluded,
        // Mantieni isRouter originale, non permettendo la sua modifica
        department: agent.isRouter ? null : (data.department || agent.department)
      };

      console.log(`[agentService] Processed update data:`, processedData);

      // Regular update (without changing router status)
      console.log(`[agentService] Regular update for agent ${id}`);
      const updated = await prisma.prompts.update({
        where: { id },
        data: processedData,
      });

      console.log(`[agentService] Agent ${id} updated successfully`);
      return updated;
    } catch (error) {
      console.error(`[agentService] Error updating agent ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an agent
   */
  async delete(id: string, workspaceId: string) {
    console.log(`[agentService] Deleting agent ${id} from workspace ${workspaceId}`);
    
    try {
      // Verifica solo che l'agente esista
      const agent = await prisma.prompts.findFirst({ where: { id, workspaceId } });
      if (!agent) {
        console.log(`[agentService] Agent ${id} not found in workspace ${workspaceId}`);
        throw new Error("Agent not found");
      }
      
      console.log(`[agentService] Deleting agent ${id}`);
      
      const result = await prisma.prompts.delete({
        where: { id },
      });
      
      console.log(`[agentService] Agent ${id} deleted successfully`);
      return result;
    } catch (error) {
      console.error(`[agentService] Error deleting agent ${id}:`, error);
      throw error;
    }
  },
} 