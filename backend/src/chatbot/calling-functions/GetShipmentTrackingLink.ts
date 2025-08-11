import { OrderStatus } from '@prisma/client'
import { OrderService } from '../../application/services/order.service'

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
  const service = new OrderService()
  const result = await service.getLatestProcessingTracking(params.workspaceId, params.customerId)
  return result
}

export const GetShipmentTrackingLinkFunction = {
  name: 'GetShipmentTrackingLink',
  description: 'Return trackingNumber and trackingUrl for latest processing order of a customer in a workspace',
  parameters: {
    type: 'object',
    properties: {
      workspaceId: { type: 'string' },
      customerId: { type: 'string' }
    },
    required: ['workspaceId', 'customerId']
  }
}