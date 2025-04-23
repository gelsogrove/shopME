import { Router } from "express"
import { whatsappSettingsController } from "../controllers/whatsapp-settings.controller"

const router = Router()

// Route to get GDPR content for a workspace
router.get("/:workspaceId/gdpr", whatsappSettingsController.getGdpr)

// Route to update GDPR content for a workspace
router.put("/:workspaceId/gdpr", whatsappSettingsController.updateGdpr)

// Route to get default GDPR content
router.get("/default", whatsappSettingsController.getDefaultGdpr)

export default router 