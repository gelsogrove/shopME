import { OrderStatus, PrismaClient } from '@prisma/client'
import { OrderService } from '../../application/services/order.service'
import { SecureTokenService } from '../../application/services/secure-token.service'
import logger from '../../utils/logger'

export interface GetShipmentTrackingLinkParams {
  workspaceId: string
  customerId: string
}

export interface GetShipmentTrackingLinkResult {
  orderId: string
  orderCode: string
  status: OrderStatus
  trackingNumber: string | null
  trackingUrl: string | null
}

export async function GetShipmentTrackingLink(params: GetShipmentTrackingLinkParams): Promise<GetShipmentTrackingLinkResult | null> {
  logger.info(`[TRACKING-LINK] Starting GetShipmentTrackingLink for customer ${params.customerId} in workspace ${params.workspaceId}`)
  
  const service = new OrderService()
  const result = await service.getLatestProcessingTracking(params.workspaceId, params.customerId)
  
  if (!result) {
    logger.warn(`[TRACKING-LINK] No processing order found for customer ${params.customerId}`)
    return null
  }

  logger.info(`[TRACKING-LINK] Found order ${result.orderCode} with status ${result.status}`)

  try {
    // Get customer phone number for URL construction
    const prisma = new PrismaClient()
    const customer = await prisma.customers.findFirst({
      where: { 
        id: params.customerId,
        workspaceId: params.workspaceId 
      },
      select: {
        phone: true,
        workspace: {
          select: {
            url: true
          }
        }
      }
    })

    if (!customer) {
      logger.warn(`[TRACKING-LINK] Customer not found for ID ${params.customerId}, falling back to DHL URL`)
      // Fallback to original DHL URL if customer not found
      return result
    }

    logger.info(`[TRACKING-LINK] Found customer with phone ${customer.phone}`)

    // Generate secure token for orders page access
    const secureTokenService = new SecureTokenService()
    const tokenPayload = {
      customerId: params.customerId,
      workspaceId: params.workspaceId,
      orderCode: result.orderCode,
      createdAt: new Date().toISOString()
    }

    logger.info(`[TRACKING-LINK] Generating token with payload:`, tokenPayload)

    const token = await secureTokenService.createToken(
      'orders',
      params.workspaceId,
      tokenPayload,
      '24h',
      params.customerId,
      customer.phone
    )

    logger.info(`[TRACKING-LINK] Token generated successfully: ${token.substring(0, 12)}...`)

    // Build ShopMe URL with token
    const baseUrl = customer.workspace?.url || process.env.FRONTEND_URL || 'http://localhost:3000'
    const phoneParam = encodeURIComponent(customer.phone || '')
    const shopMeUrl = `${baseUrl}/orders-public/${result.orderCode}?phone=${phoneParam}&token=${token}`

    logger.info(`[TRACKING-LINK] Generated ShopMe URL: ${shopMeUrl}`)

    // Return result with ShopMe URL instead of DHL URL
    return {
      ...result,
      trackingUrl: shopMeUrl
    }

  } catch (error) {
    logger.error('[TRACKING-LINK] Error generating ShopMe tracking URL:', error)
    // Fallback to original DHL URL if token generation fails
    return result
  }
}

export const GetShipmentTrackingLinkFunction = {
  name: 'GetShipmentTrackingLink',
  description: 'Return trackingNumber and ShopMe tracking URL for latest processing order of a customer in a workspace',
  parameters: {
    type: 'object',
    properties: {
      workspaceId: { type: 'string' },
      customerId: { type: 'string' }
    },
    required: ['workspaceId', 'customerId']
  }
}
