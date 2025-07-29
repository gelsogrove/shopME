import { Router } from "express"
import { UsageController } from "../controllers/usage.controller"

const router = Router()
const usageController = new UsageController()

// Endpoint per N8N per tracciare l'uso quando ritorna una risposta AI
router.post("/track-usage", usageController.trackUsage)

export default router
