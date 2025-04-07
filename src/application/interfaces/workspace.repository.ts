import { Workspace } from "../../domain/entities/workspace.entity"

export interface IWorkspaceRepository {
  findById(id: string): Promise<Workspace | null>
  findAll(): Promise<Workspace[]>
  findByName(name: string): Promise<Workspace | null>
  save(workspace: Workspace): Promise<void>
  delete(id: string): Promise<void>
}
