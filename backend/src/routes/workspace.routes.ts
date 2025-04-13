import { RequestHandler, Router } from "express"
import { workspaceController } from "../controllers/workspace.controller"
import { prisma } from "../lib/prisma"

const router = Router()

const getCurrentWorkspace: RequestHandler = async (req, res): Promise<void> => {
  try {
    // For now, return the first active workspace
    // TODO: Update this to use the actual current workspace from the session
    const workspace = await prisma.workspace.findFirst({
      where: {
        isActive: true,
        isDelete: false,
      },
    })

    if (!workspace) {
      res.status(404).json({ error: "No active workspace found" })
      return
    }

    res.json(workspace)
    return
  } catch (error) {
    console.error("Error fetching current workspace:", error)
    res.status(500).json({ error: "Failed to fetch current workspace" })
    return
  }
}

router.get("/current", getCurrentWorkspace)
router.get("/", workspaceController.getAll as RequestHandler)
router.get("/:id", workspaceController.getById as RequestHandler)
router.post("/", workspaceController.create as RequestHandler)
router.put("/:id", workspaceController.update as RequestHandler)
router.delete("/:id", workspaceController.delete as RequestHandler)

export default router
