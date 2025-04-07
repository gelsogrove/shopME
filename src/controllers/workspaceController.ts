import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"

const prisma = new PrismaClient()

export const workspaceController = {
  // Get all workspaces
  getAll: async (req: Request, res: Response) => {
    try {
      const workspaces = await prisma.workspaces.findMany()
      return res.json(workspaces)
    } catch (error) {
      return res.status(500).json({ error: "Error fetching workspaces" })
    }
  },

  // Get single workspace
  getOne: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const workspace = await prisma.workspaces.findUnique({
        where: { id },
      })
      if (!workspace) {
        return res.status(404).json({ error: "Workspace not found" })
      }
      return res.json(workspace)
    } catch (error) {
      return res.status(500).json({ error: "Error fetching workspace" })
    }
  },

  // Create workspace
  create: async (req: Request, res: Response) => {
    try {
      const workspace = await prisma.workspaces.create({
        data: req.body,
      })
      return res.status(201).json(workspace)
    } catch (error) {
      return res.status(500).json({ error: "Error creating workspace" })
    }
  },

  // Update workspace
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const workspace = await prisma.workspaces.update({
        where: { id },
        data: req.body,
      })
      return res.json(workspace)
    } catch (error) {
      return res.status(500).json({ error: "Error updating workspace" })
    }
  },

  // Delete workspace
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      await prisma.workspaces.delete({
        where: { id },
      })
      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ error: "Error deleting workspace" })
    }
  },
}
