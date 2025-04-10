import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface CreatePromptData {
  name: string
  content: string
  workspaceId: string
  isActive?: boolean
  temperature?: number
  top_p?: number
  top_k?: number
}

interface UpdatePromptData {
  name?: string
  content?: string
  isActive?: boolean
  temperature?: number
  top_p?: number
  top_k?: number
}

export const promptsService = {
  /**
   * Get all prompts for a workspace
   */
  async getAllForWorkspace(workspaceId: string) {
    return prisma.prompts.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  /**
   * Get a prompt by ID
   */
  async getById(id: string) {
    return prisma.prompts.findUnique({
      where: {
        id,
      },
    })
  },

  /**
   * Create a new prompt
   * If isActive is true, deactivate all other prompts for the workspace
   */
  async create(data: CreatePromptData) {
    const { isActive = false, workspaceId } = data
    console.log(`Creating prompt with isActive=${isActive} for workspace ${workspaceId}`)

    // Start a transaction
    return prisma.$transaction(async (tx) => {
      // If this prompt should be active, deactivate all others
      if (isActive) {
        console.log(`Deactivating all other prompts for workspace ${workspaceId}`)
        const deactivated = await tx.prompts.updateMany({
          where: {
            workspaceId,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        })
        console.log(`Deactivated ${deactivated.count} prompts`)
      }

      // Create the new prompt
      console.log(`Creating new prompt with data:`, data)
      return tx.prompts.create({
        data
      })
    })
  },

  /**
   * Update a prompt
   * If isActive is set to true, deactivate all other prompts for the workspace
   */
  async update(id: string, data: UpdatePromptData) {
    console.log(`Updating prompt ${id} with data:`, data)
    
    const prompt = await prisma.prompts.findUnique({
      where: { id }
    })

    if (!prompt) {
      console.log(`Prompt ${id} not found`)
      return null
    }

    // If we're trying to activate this prompt
    if (data.isActive === true) {
      console.log(`Activating prompt ${id} and deactivating others`)
      // Start a transaction
      return prisma.$transaction(async (tx) => {
        // Deactivate all prompts for this workspace
        const deactivated = await tx.prompts.updateMany({
          where: {
            workspaceId: prompt.workspaceId,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        })
        console.log(`Deactivated ${deactivated.count} prompts`)

        // Update and activate this prompt
        return tx.prompts.update({
          where: { id },
          data,
        })
      })
    }

    // Regular update (not changing activation status or explicitly setting to inactive)
    console.log(`Regular update for prompt ${id}`)
    return prisma.prompts.update({
      where: { id },
      data,
    })
  },

  /**
   * Delete a prompt
   */
  async delete(id: string) {
    console.log(`Deleting prompt ${id}`)
    return prisma.prompts.delete({
      where: { id },
    })
  },

  /**
   * Activate a prompt (and deactivate all others)
   */
  async activate(id: string) {
    console.log(`Activating prompt ${id}`)
    
    const prompt = await prisma.prompts.findUnique({
      where: { id }
    })

    if (!prompt) {
      console.log(`Prompt ${id} not found`)
      return null
    }

    // Start a transaction
    return prisma.$transaction(async (tx) => {
      // Deactivate all prompts for this workspace
      console.log(`Deactivating all prompts for workspace ${prompt.workspaceId}`)
      const deactivated = await tx.prompts.updateMany({
        where: {
          workspaceId: prompt.workspaceId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      })
      console.log(`Deactivated ${deactivated.count} prompts`)

      // Activate this prompt
      console.log(`Setting prompt ${id} as active`)
      return tx.prompts.update({
        where: { id },
        data: {
          isActive: true,
        },
      })
    })
  },

  /**
   * Duplicate a prompt
   */
  async duplicate(id: string) {
    console.log(`Duplicating prompt ${id}`)
    
    const prompt = await prisma.prompts.findUnique({
      where: { id }
    })

    if (!prompt) {
      console.log(`Prompt ${id} not found`)
      return null
    }

    // Create a copy with "(Copy)" appended to the name
    return prisma.prompts.create({
      data: {
        name: `${prompt.name} (Copy)`,
        content: prompt.content,
        workspaceId: prompt.workspaceId,
        isActive: false // The copy starts as inactive
      }
    })
  }
} 