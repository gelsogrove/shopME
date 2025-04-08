import { Request, Response } from "express"
import { workspaceService } from "../services/workspace.service"

export const workspaceController = {
  async getAll(req: Request, res: Response) {
    try {
      const workspaces = await workspaceService.getAll()
      res.json(workspaces)
    } catch (error) {
      res.status(500).json({ message: "Error fetching workspaces" })
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const workspace = await workspaceService.getById(req.params.id)
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" })
      }
      res.json(workspace)
    } catch (error) {
      res.status(500).json({ message: "Error fetching workspace" })
    }
  },

  async create(req: Request, res: Response) {
    try {
      const workspace = await workspaceService.create(req.body)
      res.status(201).json(workspace)
    } catch (error) {
      res.status(500).json({ message: "Error creating workspace" })
    }
  },

  async update(req: Request, res: Response) {
    try {
      const workspace = await workspaceService.update(req.params.id, req.body)
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" })
      }
      res.json(workspace)
    } catch (error) {
      res.status(500).json({ message: "Error updating workspace" })
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await workspaceService.delete(req.params.id)
      res.status(204).send()
    } catch (error) {
      res.status(500).json({ message: "Error deleting workspace" })
    }
  },
}
