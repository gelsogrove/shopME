import { usageService } from "../../services/usage.service"
import logger from "../../utils/logger"

/**
 * TrackUsage Calling Function
 *
 * This function tracks LLM usage by adding 0.5 cents (€0.005) for each AI response.
 * This should be called EVERY TIME the AI provides a response to a customer.
 *
 * Parameters:
 *   - phone: string (the customer's phone number to identify them)
 *   - workspaceId: string (the workspace context)
 *   - responseType?: string (optional: 'llm' or 'operator', defaults to 'llm')
 *
 * Usage:
 *   - Called by N8N workflow after AI responds to user
 *   - Tracks cost of €0.005 per response for analytics dashboard
 *   - Only tracks for registered customers (non-registered users are ignored)
 */
export async function TrackUsage({
  phone,
  workspaceId,
  responseType = 'llm',
}: {
  phone: string
  workspaceId: string
  responseType?: string
}) {
  if (!phone || !workspaceId) {
    logger.error('[TrackUsage] Missing required parameters: phone or workspaceId')
    return { 
      success: false, 
      message: "Parametri mancanti: phone o workspaceId" 
    }
  }

  try {
    logger.info(`[TrackUsage] 💰 Tracking ${responseType} usage for phone ${phone} in workspace ${workspaceId}`)

    // Find customer by phone and workspace
    const { prisma } = await import("../../lib/prisma")
    
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
      logger.warn(`[TrackUsage] ⚠️ Customer with phone ${phone} not found in workspace ${workspaceId} - no usage tracked`)
      return { 
        success: true, 
        message: "Cliente non registrato - nessun tracking applicato",
        tracked: false
      }
    }

    // Track the usage
    await usageService.trackUsage({
      workspaceId: workspaceId,
      clientId: customer.id,
      price: 0.005 // €0.005 per response (0.5 centesimi)
    })

    logger.info(`[TrackUsage] ✅ Usage tracked successfully: €0.005 for customer ${customer.name} (${customer.phone})`)

    return {
      success: true,
      message: `Usage tracked: €0.005 for ${responseType} response`,
      tracked: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone
      },
      cost: 0.005
    }

  } catch (error) {
    logger.error(`[TrackUsage] ❌ Error tracking usage:`, error)
    
    return {
      success: false,
      message: "Errore nel tracking dell'usage",
      error: error instanceof Error ? error.message : "Errore sconosciuto"
    }
  }
}
