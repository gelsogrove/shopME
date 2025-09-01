import { Request, Response } from "express"
import { config } from "../../../config"
import { usageService } from "../../../services/usage.service"
import logger from "../../../utils/logger"

export class UsageController {
  constructor() {}

  public trackUsage = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info("[UsageController] 📊 External API chiamando track-usage:", req.body)

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
        price: config.llm.defaultPrice,
      })

      logger.info("[UsageController] ✅ Usage tracked successfully:", {
        customerId,
        workspaceId,
        type,
        cost: `€${config.llm.defaultPrice}`,
      })

      res.json({
        success: true,
        usage: {
                  cost: config.llm.defaultPrice,
        message: `Usage tracked successfully (€${config.llm.defaultPrice})`,
        },
      })
    } catch (error) {
      logger.error("[UsageController] ❌ Usage tracking error:", error)
      res.status(500).json({
        success: false,
        error: "Internal error during usage tracking",
      })
    }
  }
}
