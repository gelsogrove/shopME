import { Workspace } from "../../../domain/entities/workspace.entity"
import { UpdateWorkspaceDto } from "../../dtos/workspace.dto"
import { IWorkspaceRepository } from "../../interfaces/workspace.repository"

export class UpdateWorkspaceUseCase {
  constructor(private workspaceRepository: IWorkspaceRepository) {}

  async execute(id: string, dto: UpdateWorkspaceDto): Promise<Workspace> {
    // Find existing workspace
    const workspace = await this.workspaceRepository.findById(id)
    if (!workspace) {
      throw new Error("Workspace not found")
    }

    // Check name uniqueness if name is being updated
    if (dto.name) {
      const existingWorkspace = await this.workspaceRepository.findByName(
        dto.name
      )
      if (existingWorkspace && existingWorkspace.getId() !== id) {
        throw new Error("Workspace with this name already exists")
      }
      workspace.updateName(dto.name)
    }

    // Update other fields
    if (dto.description !== undefined) {
      workspace.updateDescription(dto.description)
    }

    if (
      dto.whatsappPhoneNumber !== undefined ||
      dto.whatsappApiToken !== undefined ||
      dto.whatsappWebhookUrl !== undefined
    ) {
      workspace.updateWhatsappConfig(
        dto.whatsappPhoneNumber ?? workspace.getWhatsappPhoneNumber(),
        dto.whatsappApiToken ?? workspace.getWhatsappApiToken(),
        dto.whatsappWebhookUrl ?? workspace.getWhatsappWebhookUrl()
      )
    }

    if (dto.isActive !== undefined) {
      dto.isActive ? workspace.activate() : workspace.deactivate()
    }

    // Save changes
    await this.workspaceRepository.save(workspace)

    return workspace
  }
}
