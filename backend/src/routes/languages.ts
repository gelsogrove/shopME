import { Router } from "express"
import { prisma } from "../lib/prisma"
import { authMiddleware } from "../middlewares/auth.middleware"

const router = Router()

// @ts-ignore
router.get("/", authMiddleware, async (req, res) => {
  try {
    // @ts-ignore
    if (!req.workspaceId) {
      return res.status(400).json({ error: "Workspace ID is required" })
    }

    const languages = await prisma.languages.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        isDefault: true,
      },
      where: {
        isActive: true,
        // @ts-ignore
        workspaceId: req.workspaceId
      },
      orderBy: {
        name: "asc",
      },
    })
    return res.status(200).json({
      languages: languages,
    })
  } catch (error) {
    console.error("Error fetching languages:", error)
    res.status(500).json({ error: "Failed to fetch languages" })
  }
})

export default router
