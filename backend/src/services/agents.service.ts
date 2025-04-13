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
    console.log(`Updating agent ${id} with data:`, data);
    
    const agent = await prisma.prompts.findFirst({
      where: { 
        id,
        workspaceId
      }
    });

    if (!agent) {
      console.log(`Agent ${id} not found`);
      return null;
    }

    // Process the department field - ensure it's null for router agents
    const processedData = {
      ...data,
      department: data.isRouter === true ? null : (data.department || agent.department)
    };

    console.log(`Processed update data:`, processedData);

    // If we're trying to set this agent as router
    if (processedData.isRouter === true) {
      console.log(`Setting agent ${id} as router and removing router status from others`);
      // Start a transaction
      return prisma.$transaction(async (tx) => {
        // Set isRouter to false for all other agents
        await tx.prompts.updateMany({
          where: {
            workspaceId,
            isRouter: true,
            id: { not: id }, // Exclude this agent
          },
          data: {
            isRouter: false,
          },
        });

        // Update this agent
        const updated = await tx.prompts.update({
          where: { id },
          data: processedData,
        });

        return updated;
      });
    }

    // Regular update (not changing router status or explicitly setting to false)
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
    console.log(`Deleting agent ${id}`);
    
    // First check if agent exists in this workspace
    const agent = await prisma.prompts.findFirst({
      where: { 
        id,
        workspaceId
      }
    });

    if (!agent) {
      throw new Error("Agent not found");
    }

    return prisma.prompts.delete({
      where: { id },
    });
  },

  /**
   * Duplicate an agent
   */
  async duplicate(id: string, workspaceId: string) {
    console.log(`Duplicating agent ${id}`);
    
    const agent = await prisma.prompts.findFirst({
      where: { 
        id,
        workspaceId
      }
    });

    if (!agent) {
      console.log(`Agent ${id} not found`);
      return null;
    }

    // Create a copy with "(Copy)" appended to the name
    const duplicated = await prisma.prompts.create({
      data: {
        name: `${agent.name} (Copy)`,
        content: agent.content,
        workspaceId: agent.workspaceId,
        isRouter: false, // The copy is never a router
        department: agent.department,
        temperature: agent.temperature,
        top_p: agent.top_p,
        top_k: agent.top_k
      }
    });

    return duplicated;
  }
} 