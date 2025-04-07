import { Workspace } from "../../../domain/entities/workspace.entity"
import { UpdateWorkspaceDTO } from "../../dtos/workspace.dto"
import { IWorkspaceRepository } from "../../interfaces/workspace.repository"

export class UpdateWorkspaceUseCase {
  constructor(private readonly workspaceRepository: IWorkspaceRepository) {}

  async execute(id: string, dto: UpdateWorkspaceDTO): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findById(id)
    if (!workspace) {
      throw new Error(`Workspace with id ${id} not found`)
    }

    return this.workspaceRepository.update(id, dto)
  }
}
