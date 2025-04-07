import { PrismaClient } from "@prisma/client"
import { IWorkspaceRepository } from "../../application/interfaces/workspace.repository"
import { Workspace } from "../../domain/entities/workspace.entity"

export class WorkspaceRepository implements IWorkspaceRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Workspace | null> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    })

    if (!workspace) return null

    return Workspace.create(
      workspace.id,
      workspace.name,
      workspace.description,
      workspace.whatsappPhoneNumber,
      workspace.whatsappApiToken,
      workspace.whatsappWebhookUrl
    )
  }

  async findAll(): Promise<Workspace[]> {
    const workspaces = await this.prisma.workspace.findMany()
    return workspaces.map((w) =>
      Workspace.create(
        w.id,
        w.name,
        w.description,
        w.whatsappPhoneNumber,
        w.whatsappApiToken,
        w.whatsappWebhookUrl
      )
    )
  }

  async findByName(name: string): Promise<Workspace | null> {
    const workspace = await this.prisma.workspace.findFirst({
      where: { name },
    })

    if (!workspace) return null

    return Workspace.create(
      workspace.id,
      workspace.name,
      workspace.description,
      workspace.whatsappPhoneNumber,
      workspace.whatsappApiToken,
      workspace.whatsappWebhookUrl
    )
  }

  async save(workspace: Workspace): Promise<void> {
    await this.prisma.workspace.upsert({
      where: { id: workspace.getId() },
      update: {
        name: workspace.getName(),
        description: workspace.getDescription(),
        whatsappPhoneNumber: workspace.getWhatsappPhoneNumber(),
        whatsappApiToken: workspace.getWhatsappApiToken(),
        whatsappWebhookUrl: workspace.getWhatsappWebhookUrl(),
        isActive: workspace.getIsActive(),
        updatedAt: workspace.getUpdatedAt(),
      },
      create: {
        id: workspace.getId(),
        name: workspace.getName(),
        description: workspace.getDescription(),
        whatsappPhoneNumber: workspace.getWhatsappPhoneNumber(),
        whatsappApiToken: workspace.getWhatsappApiToken(),
        whatsappWebhookUrl: workspace.getWhatsappWebhookUrl(),
        isActive: workspace.getIsActive(),
        createdAt: workspace.getCreatedAt(),
        updatedAt: workspace.getUpdatedAt(),
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workspace.delete({
      where: { id },
    })
  }
}
