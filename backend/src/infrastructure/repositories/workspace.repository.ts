import { PrismaClient, Workspace as PrismaWorkspace } from "@prisma/client"
import { UpdateWorkspaceDTO } from "../../application/dtos/workspace.dto"
import { IWorkspaceRepository } from "../../application/interfaces/workspace.repository"
import { Workspace } from "../../domain/entities/workspace.entity"

export class WorkspaceRepository implements IWorkspaceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(workspace: Workspace): Promise<Workspace> {
    const created = await this.prisma.workspace.create({
      data: {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        slug: workspace.slug,
        isActive: workspace.isActive,
        whatsappPhoneNumber: workspace.whatsappPhoneNumber,
        // @ts-ignore
        whatsappApiToken: workspace.whatsappApiToken,
        // @ts-ignore
        whatsappWebhookUrl: workspace.whatsappWebhookUrl,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      },
    })
    return this.mapToEntity(created)
  }

  async findById(id: string): Promise<Workspace | null> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    })
    return workspace ? this.mapToEntity(workspace) : null
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug },
    })
    return workspace ? this.mapToEntity(workspace) : null
  }

  async findAll(): Promise<Workspace[]> {
    const workspaces = await this.prisma.workspace.findMany()
    return workspaces.map((w) => this.mapToEntity(w))
  }

  async update(id: string, data: UpdateWorkspaceDTO): Promise<Workspace> {
    const workspace = await this.prisma.workspace.update({
      where: { id },
      data,
    })
    return this.mapToEntity(workspace)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workspace.delete({
      where: { id },
    })
  }

  private mapToEntity(data: PrismaWorkspace): Workspace {
    return new Workspace(
      data.id,
      data.name,
      data.slug,
      data.description,
      data.whatsappPhoneNumber,
      // @ts-ignore
      data.whatsappApiToken,
      // @ts-ignore
      data.whatsappWebhookUrl,
      data.isActive,
      data.createdAt,
      data.updatedAt
    )
  }
}
