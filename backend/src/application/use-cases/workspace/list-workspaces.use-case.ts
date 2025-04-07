import { Workspace } from "../../../domain/entities/workspace.entity"
import { IWorkspaceRepository } from "../../interfaces/workspace.repository"

export class ListWorkspacesUseCase {
  constructor(private readonly workspaceRepository: IWorkspaceRepository) {}

  async execute(): Promise<Workspace[]> {
    return this.workspaceRepository.findAll()
  }
}
