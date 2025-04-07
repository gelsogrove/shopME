import { IWorkspaceRepository } from "../../interfaces/workspace.repository"

export class DeleteWorkspaceUseCase {
  constructor(private workspaceRepository: IWorkspaceRepository) {}

  async execute(id: string): Promise<void> {
    // Check if workspace exists
    const workspace = await this.workspaceRepository.findById(id)
    if (!workspace) {
      throw new Error("Workspace not found")
    }

    // Delete workspace
    await this.workspaceRepository.delete(id)
  }
}
