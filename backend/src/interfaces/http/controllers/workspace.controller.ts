import { Request, Response } from "express"
import { CreateWorkspaceUseCase } from "../../../application/use-cases/workspace/create-workspace.use-case"
import { DeleteWorkspaceUseCase } from "../../../application/use-cases/workspace/delete-workspace.use-case"
import { GetWorkspaceUseCase } from "../../../application/use-cases/workspace/get-workspace.use-case"
import { ListWorkspacesUseCase } from "../../../application/use-cases/workspace/list-workspaces.use-case"
import { UpdateWorkspaceUseCase } from "../../../application/use-cases/workspace/update-workspace.use-case"
import { AppError } from "../middlewares/error.middleware"

interface WorkspaceControllerConfig {
  createWorkspaceUseCase: CreateWorkspaceUseCase
  getWorkspaceUseCase: GetWorkspaceUseCase
  listWorkspacesUseCase: ListWorkspacesUseCase
  updateWorkspaceUseCase: UpdateWorkspaceUseCase
  deleteWorkspaceUseCase: DeleteWorkspaceUseCase
}

export class WorkspaceController {
  private createWorkspaceUseCase: CreateWorkspaceUseCase
  private getWorkspaceUseCase: GetWorkspaceUseCase
  private listWorkspacesUseCase: ListWorkspacesUseCase
  private updateWorkspaceUseCase: UpdateWorkspaceUseCase
  private deleteWorkspaceUseCase: DeleteWorkspaceUseCase

  constructor(config: WorkspaceControllerConfig) {
    this.createWorkspaceUseCase = config.createWorkspaceUseCase
    this.getWorkspaceUseCase = config.getWorkspaceUseCase
    this.listWorkspacesUseCase = config.listWorkspacesUseCase
    this.updateWorkspaceUseCase = config.updateWorkspaceUseCase
    this.deleteWorkspaceUseCase = config.deleteWorkspaceUseCase
  }

  async createWorkspace(req: Request, res: Response) {
    const workspace = await this.createWorkspaceUseCase.execute(req.body)
    res.status(201).json(workspace)
  }

  async getWorkspace(req: Request, res: Response) {
    const { id } = req.params
    const workspace = await this.getWorkspaceUseCase.execute(id)
    if (!workspace) {
      throw new AppError(404, "Workspace not found")
    }
    res.json(workspace)
  }

  async listWorkspaces(_req: Request, res: Response) {
    const workspaces = await this.listWorkspacesUseCase.execute()
    res.json(workspaces)
  }

  async updateWorkspace(req: Request, res: Response) {
    const { id } = req.params
    const workspace = await this.updateWorkspaceUseCase.execute(id, req.body)
    if (!workspace) {
      throw new AppError(404, "Workspace not found")
    }
    res.json(workspace)
  }

  async deleteWorkspace(req: Request, res: Response) {
    const { id } = req.params
    await this.deleteWorkspaceUseCase.execute(id)
    res.status(204).send()
  }
}
