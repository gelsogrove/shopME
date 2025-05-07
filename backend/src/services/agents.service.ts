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
}

interface UpdateAgentData {
  name?: string
  content?: string
  isRouter?: boolean
  department?: string
  temperature?: number
  top_p?: number
  top_k?: number
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

export const agentsService = {
  /**
   * Get all agents for a workspace
   */
  async getAllForWorkspace(workspaceId: string) {
    const results = await prisma.prompts.findMany({
      where: {
        workspaceId,
      },
      orderBy: [
        { createdAt: 'asc' },
      ],
    });

    // Return results directly as schema now matches API
    return results;
  },

  /**
   * Get an agent by ID
   */
  async getById(id: string, workspaceId: string) {
    const result = await prisma.prompts.findFirst({
      where: {
        id,
        workspaceId
      },
    });

    if (!result) return null;
    
    return result;
  },

  /**
   * Create a new agent
   * If isRouter is true, set all other agents' isRouter to false
   */
  async create(data: CreateAgentData) {
    const { workspaceId, isRouter = false } = data;
    // Se si sta tentando di creare un router agent e ne esiste già uno, blocca
    if (isRouter) {
      const existingRouter = await prisma.prompts.findFirst({
        where: { workspaceId, isRouter: true },
      });
      if (existingRouter) {
        throw new Error("A router agent already exists for this workspace");
      }
    }
    console.log(`Creating agent for workspace ${workspaceId}, isRouter: ${isRouter}`);

    // Start a transaction
    return prisma.$transaction(async (tx) => {
      // If this agent should be router, set isRouter to false for all other agents
      if (isRouter) {
        console.log(`Setting all other agents' isRouter to false for workspace ${workspaceId}`);
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
        ...data,
        department: isRouter ? null : (data.department || null)
      };

      // Create the new agent
      console.log(`Creating new agent with data:`, processedData);
      const created = await tx.prompts.create({
        data: processedData
      });

      return created;
    });
  },

  /**
   * Update an agent
   * If isRouter is set to true, set all other agents' isRouter to false
   */
  async update(id: string, workspaceId: string, data: UpdateAgentData) {
    // Verifica solo che l'agente esista
    const agent = await prisma.prompts.findFirst({ where: { id, workspaceId } });
    if (!agent) return null;
    
    console.log(`Updating agent ${id} with data:`, data);
    
    // Rimuovi isRouter dai dati di aggiornamento per mantenere il valore originale
    const { isRouter, ...dataWithoutIsRouter } = data;
    
    // Process the department field - use the original agent's isRouter value
    const processedData = {
      ...dataWithoutIsRouter,
      // Mantieni isRouter originale, non permettendo la sua modifica
      department: agent.isRouter ? null : (data.department || agent.department)
    };

    console.log(`Processed update data:`, processedData);

    // Regular update (without changing router status)
    console.log(`Regular update for agent ${id}`);
    const updated = await prisma.prompts.update({
      where: { id },
      data: processedData,
    });

    return updated;
  },

  /**
   * Delete an agent
   */
  async delete(id: string, workspaceId: string) {
    // Verifica solo che l'agente esista
    const agent = await prisma.prompts.findFirst({ where: { id, workspaceId } });
    if (!agent) throw new Error("Agent not found");
    
    console.log(`Deleting agent ${id}`);
    
    return prisma.prompts.delete({
      where: { id },
    });
  },
} 