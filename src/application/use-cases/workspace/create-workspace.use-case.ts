import { v4 as uuidv4 } from "uuid"
import { Workspace } from "../../../domain/entities/workspace.entity"
import { CreateWorkspaceDto } from "../../dtos/workspace.dto"
import { IWorkspaceRepository } from "../../interfaces/workspace.repository"

export class CreateWorkspaceUseCase {
  constructor(private workspaceRepository: IWorkspaceRepository) {}

  async execute(dto: CreateWorkspaceDto): Promise<Workspace> {
    // Check if workspace with same name already exists
    const existingWorkspace = await this.workspaceRepository.findByName(
      dto.name
    )
    if (existingWorkspace) {
      throw new Error("Workspace with this name already exists")
    }

    // Create new workspace
    const workspace = Workspace.create(
      uuidv4(),
      dto.name,
      dto.description,
      dto.whatsappPhoneNumber,
      dto.whatsappApiToken,
      dto.whatsappWebhookUrl
    )

    // Save to repository
    await this.workspaceRepository.save(workspace)

    return workspace
  }
}
