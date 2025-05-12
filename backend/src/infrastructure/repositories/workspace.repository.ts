import { PrismaClient } from "@prisma/client"
import { Workspace, WorkspaceProps } from "../../domain/entities/workspace.entity"
import { WorkspaceRepositoryInterface } from "../../domain/repositories/workspace.repository.interface"
import logger from "../../utils/logger"

export class WorkspaceRepository implements WorkspaceRepositoryInterface {
  private prisma: PrismaClient

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient()
  }

  /**
   * Map database model to domain entity
   */
  private mapToDomain(data: any): Workspace {
    return Workspace.create({
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      whatsappPhoneNumber: data.whatsappPhoneNumber,
      whatsappApiToken: data.whatsappApiKey,
      whatsappWebhookUrl: data.whatsappWebhookUrl,
      webhookUrl: data.webhookUrl,
      notificationEmail: data.notificationEmail,
      language: data.language,
      currency: data.currency,
      messageLimit: data.messageLimit,
      blocklist: data.blocklist,
      welcomeMessages: data.welcomeMessages,
      wipMessages: data.wipMessages,
      challengeStatus: data.challengeStatus,
      isActive: data.isActive,
      isDelete: data.isDelete,
      url: data.url,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }

  /**
   * Map domain entity to database model
   */
  private mapToDatabase(workspace: Workspace): any {
    return {
      id: workspace.id || undefined,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      whatsappPhoneNumber: workspace.whatsappPhoneNumber,
      whatsappApiKey: workspace.whatsappApiToken,
      whatsappWebhookUrl: workspace.whatsappWebhookUrl,
      webhookUrl: workspace.webhookUrl,
      notificationEmail: workspace.notificationEmail,
      language: workspace.language,
      currency: workspace.currency,
      messageLimit: workspace.messageLimit,
      blocklist: workspace.blocklist,
      welcomeMessages: workspace.welcomeMessages,
      wipMessages: workspace.wipMessages,
      challengeStatus: workspace.challengeStatus,
      isActive: workspace.isActive,
      isDelete: workspace.isDelete,
      url: workspace.url,
    }
  }

  /**
   * Find all workspaces
   */
  async findAll(): Promise<Workspace[]> {
    logger.debug("Finding all workspaces")

    try {
      const workspaces = await this.prisma.workspace.findMany({
        orderBy: { createdAt: "asc" },
      })

      logger.debug(`Found ${workspaces.length} workspaces`)
      return workspaces.map((workspace) => this.mapToDomain(workspace))
    } catch (error) {
      logger.error("Error finding workspaces:", error)
      throw error
    }
  }

  /**
   * Find a workspace by ID
   */
  async findById(id: string): Promise<Workspace | null> {
    logger.debug(`Finding workspace by ID: ${id}`)

    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id },
      })

      if (!workspace) {
        logger.debug(`Workspace with ID ${id} not found`)
        return null
      }

      logger.debug(`Found workspace with ID ${id}`)
      return this.mapToDomain(workspace)
    } catch (error) {
      logger.error(`Error finding workspace with ID ${id}:`, error)
      throw error
    }
  }

  /**
   * Find a workspace by slug
   */
  async findBySlug(slug: string): Promise<Workspace | null> {
    logger.debug(`Finding workspace by slug: ${slug}`)

    try {
      const workspace = await this.prisma.workspace.findFirst({
        where: { slug },
      })

      if (!workspace) {
        logger.debug(`Workspace with slug ${slug} not found`)
        return null
      }

      logger.debug(`Found workspace with slug ${slug}`)
      return this.mapToDomain(workspace)
    } catch (error) {
      logger.error(`Error finding workspace with slug ${slug}:`, error)
      throw error
    }
  }

  /**
   * Find workspaces by user ID
   */
  async findByUserId(userId: string): Promise<Workspace[]> {
    logger.debug(`Finding workspaces for user ${userId}`)

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          workspaces: {
            include: {
              workspace: true,
            },
          },
        },
      })

      if (!user || !user.workspaces) {
        logger.debug(`No workspaces found for user ${userId}`)
        return []
      }

      const workspaces = user.workspaces.map((uw) => uw.workspace)
      logger.debug(`Found ${workspaces.length} workspaces for user ${userId}`)

      return workspaces.map((workspace) => this.mapToDomain(workspace))
    } catch (error) {
      logger.error(`Error finding workspaces for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Create a new workspace
   */
  async create(workspace: Workspace): Promise<Workspace> {
    logger.debug(`Creating new workspace: ${workspace.name}`)

    try {
      const data = this.mapToDatabase(workspace)
      
      const createdWorkspace = await this.prisma.workspace.create({
        data,
      })

      logger.debug(`Created workspace with ID ${createdWorkspace.id}`)
      return this.mapToDomain(createdWorkspace)
    } catch (error) {
      logger.error("Error creating workspace:", error)
      throw error
    }
  }

  /**
   * Update an existing workspace
   */
  async update(id: string, data: Partial<WorkspaceProps>): Promise<Workspace | null> {
    logger.debug(`Updating workspace with ID ${id}`)

    try {
      const existingWorkspace = await this.prisma.workspace.findUnique({
        where: { id },
      })

      if (!existingWorkspace) {
        logger.debug(`Workspace with ID ${id} not found for update`)
        return null
      }

      const updatedWorkspace = await this.prisma.workspace.update({
        where: { id },
        data,
      })

      logger.debug(`Updated workspace with ID ${id}`)
      return this.mapToDomain(updatedWorkspace)
    } catch (error) {
      logger.error(`Error updating workspace with ID ${id}:`, error)
      throw error
    }
  }

  /**
   * Delete a workspace
   */
  async delete(id: string): Promise<boolean> {
    logger.debug(`Deleting workspace with ID ${id}`)

    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id },
      })

      if (!workspace) {
        logger.debug(`Workspace with ID ${id} not found for deletion`)
        return false
      }

      await this.prisma.workspace.delete({
        where: { id },
      })

      logger.debug(`Deleted workspace with ID ${id}`)
      return true
    } catch (error) {
      logger.error(`Error deleting workspace with ID ${id}:`, error)
      throw error
    }
  }
}
