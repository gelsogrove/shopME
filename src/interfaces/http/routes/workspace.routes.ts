import { Router } from "express"
import { WorkspaceController } from "../controllers/workspace.controller"

export const createWorkspaceRouter = (
  workspaceController: WorkspaceController
): Router => {
  const router = Router()

  router.post("/", (req, res) => workspaceController.create(req, res))
  router.put("/:id", (req, res) => workspaceController.update(req, res))
  router.delete("/:id", (req, res) => workspaceController.delete(req, res))
  router.get("/:id", (req, res) => workspaceController.getOne(req, res))
  router.get("/", (req, res) => workspaceController.getAll(req, res))

  return router
}
