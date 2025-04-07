import { IWorkspaceRepository } from "../../interfaces/workspace.repository"

export class DeleteWorkspaceUseCase {
  constructor(private readonly workspaceRepository: IWorkspaceRepository) {}

  async execute(id: string): Promise<void> {
    const workspace = await this.workspaceRepository.findById(id)
    if (!workspace) {
      throw new Error(`Workspace with id ${id} not found`)
    }

    await this.workspaceRepository.delete(id)
  }
}
