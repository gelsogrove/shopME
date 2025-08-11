<<<<<<< HEAD
import { z } from 'zod';
import logger from '../../utils/logger';
import { OrderRepository } from '../../repositories/order.repository';

const GetShipmentTrackingLinkSchema = z.object({
  workspaceId: z.string().describe("The workspace ID"),
  customerId: z.string().describe("The customer ID")
});

export const GetShipmentTrackingLink = {
  name: "GetShipmentTrackingLink",
  description: "Get shipment tracking link for the latest processing order of a customer",
  parameters: GetShipmentTrackingLinkSchema,
  execute: async (params: z.infer<typeof GetShipmentTrackingLinkSchema>) => {
    try {
      logger.info(`[GetShipmentTrackingLink] 📦 Looking for tracking info for customer ${params.customerId} in workspace ${params.workspaceId}`);
      
      const orderRepository = new OrderRepository();
      
      // Find all orders for this customer
      const customerOrders = await orderRepository.findByCustomerId(
        params.customerId,
        params.workspaceId
      );
      
      // Filter for PROCESSING orders and get the latest one
      const processingOrders = customerOrders.filter(order => order.status === 'PROCESSING');
      
      if (processingOrders.length === 0) {
        logger.info(`[GetShipmentTrackingLink] ⚠️ No processing order found for customer ${params.customerId}`);
        return {
          success: false,
          message: "Nessun ordine in elaborazione trovato. Il tracking sarà disponibile quando l'ordine verrà spedito."
        };
      }
      
      // Get the most recent processing order
      const latestProcessingOrder = processingOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      // Check if order has tracking number (field not yet implemented in schema)
      // For now, always return that tracking is not available yet
      logger.info(`[GetShipmentTrackingLink] ⚠️ Order ${latestProcessingOrder.orderCode} - tracking field not yet implemented in database`);
      return {
        success: false,
        message: `Il tuo ordine ${latestProcessingOrder.orderCode} è in preparazione. Il numero di tracking sarà disponibile a breve quando verrà spedito.`
      };
      
      // TODO: Uncomment when trackingNumber field is added to Orders table
      /*
      if (!latestProcessingOrder.trackingNumber) {
        logger.info(`[GetShipmentTrackingLink] ⚠️ Order ${latestProcessingOrder.orderCode} has no tracking number yet`);
        return {
          success: false,
          message: "Il tuo ordine è in preparazione. Il numero di tracking sarà disponibile a breve."
        };
      }
      
      // Generate DHL tracking URL
      const trackingUrl = `https://www.dhl.com/en/express/tracking.html?AWB=${latestProcessingOrder.trackingNumber}`;
      
      logger.info(`[GetShipmentTrackingLink] ✅ Tracking link generated for order ${latestProcessingOrder.orderCode}`);
      
      return {
        success: true,
        data: {
          orderId: latestProcessingOrder.id,
          orderCode: latestProcessingOrder.orderCode,
          status: latestProcessingOrder.status,
          trackingNumber: latestProcessingOrder.trackingNumber,
          trackingUrl: trackingUrl
        },
        message: `🚚 Ecco il link per tracciare il tuo ordine ${latestProcessingOrder.orderCode}: ${trackingUrl}`
      };
      */
      
    } catch (error) {
      logger.error(`[GetShipmentTrackingLink] ❌ Error getting tracking link:`, error);
      return {
        success: false,
        message: "Errore nel recupero delle informazioni di tracking. Riprova più tardi."
      };
    }
  }
};
=======
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
>>>>>>> c8c486282d896950d19d363eade0d2692a34088b
