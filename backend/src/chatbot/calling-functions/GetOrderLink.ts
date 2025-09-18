import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface GetOrderLinkParams {
  customerId: string;
  workspaceId: string;
  orderCode?: string;
  documentType?: 'invoice' | 'ddt' | 'order';
  language?: string;
}

export interface GetOrderLinkResponse {
  success: boolean;
  response?: string;
  link?: string;
  message?: string;
  orderCode?: string;
  orderStatus?: string;
  error?: string;
}

export async function GetOrderLink(params: GetOrderLinkParams): Promise<GetOrderLinkResponse> {
  try {
    const { customerId, workspaceId, orderCode, documentType = 'order', language = 'it' } = params;

    console.log(`🔗 GetOrderLink: customerId=${customerId}, workspaceId=${workspaceId}, orderCode=${orderCode}, documentType=${documentType}`);

    let targetOrder;

    if (orderCode) {
      // Cerca ordine specifico per codice
      targetOrder = await prisma.orders.findFirst({
        where: {
          orderCode: orderCode,
          customerId: customerId,
          workspaceId: workspaceId
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!targetOrder) {
        return {
          success: false,
          error: `Order ${orderCode} not found for this customer`
        };
      }
    } else {
      // Cerca ultimo ordine
      targetOrder = await prisma.orders.findFirst({
        where: {
          customerId: customerId,
          workspaceId: workspaceId
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!targetOrder) {
        return {
          success: false,
          error: 'No orders found for this customer'
        };
      }
    }

    // Genera token sicuro per l'ordine
    const token = generateSecureToken(targetOrder.id, customerId, workspaceId);
    
    // Determina il link in base al tipo di documento
    let link: string;
    let message: string;

    switch (documentType) {
      case 'invoice':
        // TODO: Implementare route /invoice-public nel frontend
        link = `http://localhost:3000/orders-public?token=${token}`;
        message = language === 'it' 
          ? `⚠️ Fattura non ancora disponibile. Ecco il link per visualizzare l'ordine ${targetOrder.orderCode}: ${link}`
          : `⚠️ Invoice not yet available. Here's the link to view order ${targetOrder.orderCode}: ${link}`;
        break;
      case 'ddt':
        // TODO: Implementare route /ddt-public nel frontend  
        link = `http://localhost:3000/orders-public?token=${token}`;
        message = language === 'it' 
          ? `⚠️ DDT non ancora disponibile. Ecco il link per visualizzare l'ordine ${targetOrder.orderCode}: ${link}`
          : `⚠️ DDT not yet available. Here's the link to view order ${targetOrder.orderCode}: ${link}`;
        break;
      case 'order':
      default:
        link = `http://localhost:3000/orders-public?token=${token}`;
        message = language === 'it' 
          ? `Ecco il link per visualizzare l'ordine ${targetOrder.orderCode}: ${link}`
          : `Here's the link to view order ${targetOrder.orderCode}: ${link}`;
        break;
    }

    console.log(`🔗 GetOrderLink: Generated link for order ${targetOrder.orderCode}: ${link}`);

    return {
      success: true,
      response: message, // Restituisce solo il messaggio naturale
      link: link,
      orderCode: targetOrder.orderCode,
      orderStatus: targetOrder.status
    };

  } catch (error) {
    console.error('❌ GetOrderLink error:', error);
    return {
      success: false,
      error: 'Failed to generate order link'
    };
  }
}

function generateSecureToken(orderId: string, customerId: string, workspaceId: string): string {
  // Genera un token sicuro basato su orderId, customerId e workspaceId
  const crypto = require('crypto');
  const data = `${orderId}-${customerId}-${workspaceId}-${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}
