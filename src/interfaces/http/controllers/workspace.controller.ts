import { Request, Response } from "express"
import { WorkspaceResponseDto } from "../../../application/dtos/workspace.dto"
import { CreateWorkspaceUseCase } from "../../../application/use-cases/workspace/create-workspace.use-case"
import { DeleteWorkspaceUseCase } from "../../../application/use-cases/workspace/delete-workspace.use-case"
import { GetWorkspaceUseCase } from "../../../application/use-cases/workspace/get-workspace.use-case"
import { ListWorkspacesUseCase } from "../../../application/use-cases/workspace/list-workspaces.use-case"
import { UpdateWorkspaceUseCase } from "../../../application/use-cases/workspace/update-workspace.use-case"

export class WorkspaceController {
  constructor(
    private createWorkspaceUseCase: CreateWorkspaceUseCase,
    private updateWorkspaceUseCase: UpdateWorkspaceUseCase,
    private deleteWorkspaceUseCase: DeleteWorkspaceUseCase,
    private getWorkspaceUseCase: GetWorkspaceUseCase,
    private listWorkspacesUseCase: ListWorkspacesUseCase
  ) {}

  private toResponseDto(workspace: any): WorkspaceResponseDto {
    return {
      id: workspace.getId(),
      name: workspace.getName(),
      description: workspace.getDescription(),
      whatsappPhoneNumber: workspace.getWhatsappPhoneNumber(),
      whatsappApiToken: workspace.getWhatsappApiToken(),
      whatsappWebhookUrl: workspace.getWhatsappWebhookUrl(),
      isActive: workspace.getIsActive(),
      createdAt: workspace.getCreatedAt(),
      updatedAt: workspace.getUpdatedAt(),
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const workspace = await this.createWorkspaceUseCase.execute(req.body)
      res.status(201).json(this.toResponseDto(workspace))
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const workspace = await this.updateWorkspaceUseCase.execute(
        req.params.id,
        req.body
      )
      res.json(this.toResponseDto(workspace))
    } catch (error) {
      if (error.message === "Workspace not found") {
        res.status(404).json({ message: error.message })
      } else {
        res.status(400).json({ message: error.message })
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await this.deleteWorkspaceUseCase.execute(req.params.id)
      res.status(204).send()
    } catch (error) {
      if (error.message === "Workspace not found") {
        res.status(404).json({ message: error.message })
      } else {
        res.status(400).json({ message: error.message })
      }
    }
  }

  async getOne(req: Request, res: Response): Promise<void> {
    try {
      const workspace = await this.getWorkspaceUseCase.execute(req.params.id)
      res.json(this.toResponseDto(workspace))
    } catch (error) {
      if (error.message === "Workspace not found") {
        res.status(404).json({ message: error.message })
      } else {
        res.status(400).json({ message: error.message })
      }
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const workspaces = await this.listWorkspacesUseCase.execute()
      res.json(workspaces.map(this.toResponseDto))
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
}
