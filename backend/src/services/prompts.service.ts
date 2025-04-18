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
   */
  async create(data: CreatePromptData) {
    const { workspaceId } = data
    console.log(`Creating prompt for workspace ${workspaceId}`)

    // Create the new prompt
    console.log(`Creating new prompt with data:`, data)
    return prisma.prompts.create({
      data
    })
  },

  /**
   * Update a prompt
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

    // Regular update without changing activation of other prompts
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
   * Activate a prompt (without deactivating others)
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

    // Simply activate this prompt
    console.log(`Setting prompt ${id} as active`)
    return prisma.prompts.update({
      where: { id },
      data: {
        isActive: true,
      },
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