import { Router } from "express"
import { workspaceController } from "../controllers/workspace.controller"
import { prisma } from "../lib/prisma"

const router = Router()

router.get("/current", async (req, res) => {
  try {
    // For now, return the first active workspace
    // TODO: Update this to use the actual current workspace from the session
    const workspace = await prisma.workspace.findFirst({
      where: {
        isActive: true,
        visible: true,
      },
    })

    if (!workspace) {
      return res.status(404).json({ error: "No active workspace found" })
    }

    res.json(workspace)
  } catch (error) {
    console.error("Error fetching current workspace:", error)
    res.status(500).json({ error: "Failed to fetch current workspace" })
  }
})

router.get("/", workspaceController.getAll)
router.get("/:id", workspaceController.getById)
router.post("/", workspaceController.create)
router.put("/:id", workspaceController.update)
router.delete("/:id", workspaceController.delete)

export default router
