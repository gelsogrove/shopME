import { Workspace } from "../../../domain/entities/workspace.entity"
import { generateSlug } from "../../../utils/slug"
import { UpdateWorkspaceDTO } from "../../dtos/workspace.dto"
import { IWorkspaceRepository } from "../../interfaces/workspace.repository"

export class UpdateWorkspaceUseCase {
  constructor(private readonly workspaceRepository: IWorkspaceRepository) {}

  async execute(id: string, dto: UpdateWorkspaceDTO): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findById(id)
    if (!workspace) {
      throw new Error(`Workspace with id ${id} not found`)
    }

    // If name is being updated, generate new slug
    if (dto.name) {
      dto.slug = generateSlug(dto.name)

      // Check if new slug would conflict with existing workspace
      const existingWorkspace = await this.workspaceRepository.findBySlug(
        dto.slug
      )
      if (existingWorkspace && existingWorkspace.id !== id) {
        throw new Error(`Workspace with name "${dto.name}" already exists`)
      }
    }

    return this.workspaceRepository.update(id, dto)
  }
}
