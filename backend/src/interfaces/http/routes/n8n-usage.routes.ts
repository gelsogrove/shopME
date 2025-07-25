import { Router } from 'express'
import { usageService } from '../../../services/usage.service'
import { asyncHandler } from '../middlewares/async.middleware'
import logger from '../../../utils/logger'

const router = Router()

/**
 * @route POST /api/n8n/track-usage
 * @desc Track LLM usage after AI response
 * @access N8N Internal (with secret)
 * @body { phone: string, workspaceId: string, responseType?: 'llm' | 'operator' }
 */
router.post('/track-usage', asyncHandler(async (req, res) => {
  const { phone, workspaceId, responseType = 'llm' } = req.body

  // Basic validation
  if (!phone || !workspaceId) {
    return res.status(400).json({
      success: false,
      message: 'Parametri mancanti: phone e workspaceId sono obbligatori'
    })
  }

  try {
    logger.info(`[N8N-TrackUsage] 💰 Tracking ${responseType} usage for phone ${phone}`)

    // Find customer by phone and workspace
    const { prisma } = await import('../../../lib/prisma')
    
    const customer = await prisma.customers.findFirst({
      where: { 
        phone: phone,
        workspaceId: workspaceId 
      },
      select: {
        id: true,
        name: true,
        phone: true,
      },
    })

    if (!customer) {
      logger.warn(`[N8N-TrackUsage] ⚠️ Customer with phone ${phone} not found - no usage tracked`)
      return res.status(200).json({
        success: true,
        message: "Cliente non registrato - nessun tracking applicato",
        tracked: false
      })
    }

    // Track the usage using existing service
    await usageService.trackUsage({
      workspaceId: workspaceId,
      clientId: customer.id,
      price: 0.005 // €0.005 per response (0.5 centesimi)
    })

    logger.info(`[N8N-TrackUsage] ✅ Usage tracked: €0.005 for customer ${customer.name}`)

    return res.status(200).json({
      success: true,
      message: `Usage tracked successfully: €0.005 for ${responseType} response`,
      tracked: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone
      },
      cost: 0.005
    })

  } catch (error) {
    logger.error(`[N8N-TrackUsage] ❌ Error tracking usage:`, error)
    
    return res.status(500).json({
      success: false,
      message: "Errore nel tracking dell'usage",
      error: error instanceof Error ? error.message : "Errore sconosciuto"
    })
  }
}))

export default router
