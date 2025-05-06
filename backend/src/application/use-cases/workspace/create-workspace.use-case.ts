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

    const workspace = Workspace.create(
      crypto.randomUUID(),
      dto.name,
      slug,
      dto.description,
      dto.whatsappPhoneNumber,
      dto.whatsappApiToken,
      dto.whatsappWebhookUrl,
      dto.isActive
    )

    return this.workspaceRepository.create(workspace)
  }
}
