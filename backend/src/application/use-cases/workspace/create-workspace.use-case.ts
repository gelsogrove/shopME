// @ts-nocheck
import { randomUUID } from "crypto";
import { Workspace } from "../../../domain/entities/workspace.entity";
import { CreateWorkspaceDTO } from "../../dtos/workspace.dto";
import { IWorkspaceRepository } from "../../interfaces/workspace.repository";

export class CreateWorkspaceUseCase {
  constructor(private readonly workspaceRepository: IWorkspaceRepository) {}

  async execute(dto: CreateWorkspaceDTO): Promise<Workspace> {
    // Genera uno slug semplice dal nome
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if workspace with same slug exists
    const existingWorkspace = await this.workspaceRepository.findBySlug(slug)
    if (existingWorkspace) {
      throw new Error(`Workspace with name "${dto.name}" already exists`)
    }

    // Creare l'entità Workspace usando un oggetto singolo
    const workspace = Workspace.create({
      id: randomUUID(),
      name: dto.name,
      slug: slug,
      description: dto.description,
      whatsappPhoneNumber: dto.whatsappPhoneNumber,
      whatsappApiToken: dto.whatsappApiToken,
      whatsappWebhookUrl: dto.whatsappWebhookUrl,
      webhookUrl: dto.webhookUrl,
      notificationEmail: dto.notificationEmail,
      language: dto.language || 'ENG',
      currency: dto.currency || 'EUR',
      isActive: dto.isActive !== undefined ? dto.isActive : true
    })

    return this.workspaceRepository.create(workspace)
  }
}
