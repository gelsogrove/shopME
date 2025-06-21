import { NextFunction, Request, Response } from "express"
import { WorkspaceService } from "../../../application/services/workspace.service"
import logger from "../../../utils/logger"

export class WorkspaceController {
  private workspaceService: WorkspaceService

  constructor() {
    this.workspaceService = new WorkspaceService()
  }

  /**
   * Get all workspaces
   */
  getAllWorkspaces = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info("Getting all workspaces")
      const workspaces = await this.workspaceService.getAll()
      return res.json(workspaces)
    } catch (error) {
      logger.error("Error fetching workspaces:", error)
      return next(error)
    }
  }

  /**
   * Get a workspace by ID
   */
  getWorkspaceById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params
      logger.info(`Getting workspace ${id}`)

      if (!id) {
        return res.status(400).json({ error: "Workspace ID is required" })
      }

      try {
        const workspace = await this.workspaceService.getById(id)

        if (!workspace) {
          return res.status(404).json({ message: "Workspace not found" })
        }

        return res.json(workspace)
      } catch (serviceError) {
        logger.error(`Service error fetching workspace ${id}:`, serviceError)
        // Restituisci un errore più specifico basato sull'errore del servizio
        return res.status(500).json({
          error: "Failed to retrieve workspace",
          details:
            serviceError instanceof Error
              ? serviceError.message
              : "Unknown error",
        })
      }
    } catch (error) {
      logger.error(
        `Error in workspace controller for ID ${req.params.id}:`,
        error
      )
      return next(error)
    }
  }

  /**
   * Create a new workspace
   */
  createWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info("Creating new workspace")
      const workspaceData = req.body

      const workspace = await this.workspaceService.create(workspaceData)
      return res.status(201).json(workspace)
    } catch (error) {
      logger.error("Error creating workspace:", error)
      return next(error)
    }
  }

  /**
   * Update a workspace
   */
  updateWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const workspaceData = req.body

      logger.info(`Updating workspace ${id}`)
      logger.info(
        "Workspace data received:",
        JSON.stringify(workspaceData, null, 2)
      )

      const workspace = await this.workspaceService.update(id, workspaceData)

      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" })
      }

      logger.info(
        "Workspace updated successfully:",
        JSON.stringify(workspace, null, 2)
      )
      return res.json(workspace)
    } catch (error) {
      logger.error(`Error updating workspace ${req.params.id}:`, error)
      return next(error)
    }
  }

  /**
   * Delete a workspace
   */
  deleteWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      logger.info(`Deleting workspace ${id}`)

      const result = await this.workspaceService.delete(id)

      if (!result) {
        return res.status(404).json({ message: "Workspace not found" })
      }

      return res.status(204).send()
    } catch (error) {
      logger.error(`Error deleting workspace ${req.params.id}:`, error)
      return next(error)
    }
  }
}
