import logger from "../../../utils/logger"
import { Request, Response } from "express"
import { usageService } from "../../../services/usage.service"

export class UsageController {
  constructor() {}

  public trackUsage = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info("[UsageController] 📊 N8N chiamando track-usage:", req.body)

      const { customerId, workspaceId, type = "ai_response" } = req.body

      // Validazione parametri
      if (!customerId || !workspaceId) {
        logger.error("[UsageController] ❌ Parametri mancanti:", {
          customerId,
          workspaceId,
        })
        res.status(400).json({
          success: false,
          error: "customerId e workspaceId sono richiesti",
        })
        return
      }

      logger.info(
        "[UsageController] 🎯 Tracking usage per customer:",
        customerId
      )

      // Traccia l'uso (€0.005 per risposta AI)
      await usageService.trackUsage({
        clientId: customerId,
        workspaceId: workspaceId,
        price: 0.005,
      })

      logger.info("[UsageController] ✅ Usage tracked successfully:", {
        customerId,
        workspaceId,
        type,
        cost: "€0.005",
      })

      res.json({
        success: true,
        usage: {
          cost: 0.005,
          message: "Usage tracked successfully (€0.005)",
        },
      })
    } catch (error) {
      logger.error("[UsageController] ❌ Errore tracking usage:", error)
      res.status(500).json({
        success: false,
        error: "Errore interno durante tracking usage",
      })
    }
  }
}
