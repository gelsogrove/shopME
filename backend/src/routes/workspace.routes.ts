import { RequestHandler, Router } from "express"
import { workspaceController } from "../controllers/workspace.controller"
import { prisma } from "../lib/prisma"
import { wrapController } from "../utils/controller-wrapper"

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Workspace:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - slug
 *         - isActive
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the workspace
 *         name:
 *           type: string
 *           description: The name of the workspace
 *         slug:
 *           type: string
 *           description: URL-friendly version of the name
 *         description:
 *           type: string
 *           nullable: true
 *           description: Optional description of the workspace
 *         whatsappPhoneNumber:
 *           type: string
 *           nullable: true
 *           description: WhatsApp phone number for the workspace
 *         whatsappApiToken:
 *           type: string
 *           nullable: true
 *           description: WhatsApp API token
 *         whatsappWebhookUrl:
 *           type: string
 *           nullable: true
 *           description: WhatsApp webhook URL
 *         isActive:
 *           type: boolean
 *           description: Whether the workspace is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the workspace was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the workspace was last updated
 */

/**
 * @swagger
 * /workspaces/current:
 *   get:
 *     summary: Get the current active workspace
 *     tags: [Workspaces]
 *     responses:
 *       200:
 *         description: The current active workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workspace'
 *       404:
 *         description: No active workspace found
 *       500:
 *         description: Server error
 */
const getCurrentWorkspace: RequestHandler = async (req, res): Promise<void> => {
  try {
    // For now, return the first active workspace
    // TODO: Update this to use the actual current workspace from the session
    const workspace = await prisma.workspace.findFirst({
      where: {
        isActive: true,
        isDelete: false,
      },
      include: {
        whatsappSettings: true,
      },
    })

    if (!workspace) {
      res.status(404).json({ error: "No active workspace found" })
      return
    }

    // Include adminEmail from whatsappSettings in the response
    const responseData = {
      ...workspace,
      adminEmail: workspace.whatsappSettings?.adminEmail || null,
    }

    res.json(responseData)
    return
  } catch (error) {
    console.error("Error fetching current workspace:", error)
    res.status(500).json({ error: "Failed to fetch current workspace" })
    return
  }
}

/**
 * @swagger
 * /workspaces:
 *   get:
 *     summary: Get all workspaces
 *     tags: [Workspaces]
 *     responses:
 *       200:
 *         description: The list of workspaces
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workspace'
 */
router.get("/current", getCurrentWorkspace)
router.get("/", wrapController(workspaceController.getAll))

/**
 * @swagger
 * /workspaces/{id}:
 *   get:
 *     summary: Get a workspace by ID
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The workspace ID
 *     responses:
 *       200:
 *         description: The workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workspace'
 *       404:
 *         description: Workspace not found
 */
router.get("/:id", wrapController(workspaceController.getById))

/**
 * @swagger
 * /workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               whatsappPhoneNumber:
 *                 type: string
 *               whatsappApiToken:
 *                 type: string
 *               whatsappWebhookUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: The created workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workspace'
 */
router.post("/", wrapController(workspaceController.create))

/**
 * @swagger
 * /workspaces/{id}:
 *   put:
 *     summary: Update a workspace
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The workspace ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               whatsappPhoneNumber:
 *                 type: string
 *               whatsappApiToken:
 *                 type: string
 *               whatsappWebhookUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The updated workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workspace'
 *       404:
 *         description: Workspace not found
 */
router.put("/:id", wrapController(workspaceController.update))

/**
 * @swagger
 * /workspaces/{id}:
 *   delete:
 *     summary: Hard delete a workspace and all related data
 *     description: |
 *       Permanently deletes a workspace and ALL related data including:
 *       - Products and categories
 *       - Customers and chat sessions  
 *       - Services and offers
 *       - Documents and FAQ chunks
 *       - Agent configurations and prompts
 *       - User-workspace relationships
 *       - WhatsApp settings
 *       
 *       **WARNING**: This operation is irreversible and complies with GDPR Article 17 (Right to erasure).
 *       All data will be permanently removed with no recovery option.
 *     tags: [Workspaces]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The workspace ID to delete
 *     responses:
 *       204:
 *         description: Workspace and all related data successfully deleted
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Error during deletion process
 */
router.delete("/:id", wrapController(workspaceController.delete))

export default router
