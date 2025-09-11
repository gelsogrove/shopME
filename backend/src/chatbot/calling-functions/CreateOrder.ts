import { ItemType } from "@prisma/client"
import { prisma } from "../../lib/prisma"
import logger from "../../utils/logger"

export interface CreateOrderParams {
  workspaceId: string
  customerId: string
  items: Array<{
    itemType: "PRODUCT" | "SERVICE"
    id: string
    name: string
    quantity: number
    unitPrice: number
  }>
  notes?: string
}

export interface CreateOrderResult {
  success: boolean
  message: string
  orderId?: string
  checkoutUrl?: string
  error?: string
}

export async function CreateOrder(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  try {
    logger.info(
      "🛒 CreateOrder chiamata con parametri:",
      JSON.stringify(params, null, 2)
    )

    const { workspaceId, customerId, items, notes } = params

    // Validazione parametri
    if (!workspaceId || !customerId || !items || items.length === 0) {
      return {
        success: false,
        message:
          "❌ Parametri mancanti: workspaceId, customerId e items sono obbligatori",
        error: "MISSING_PARAMETERS",
      }
    }

    // Verifica che il cliente esista
    const customer = await prisma.customers.findUnique({
      where: { id: customerId, workspaceId: workspaceId },
    })

    if (!customer) {
      return {
        success: false,
        message: "❌ Customer not found",
        error: "CUSTOMER_NOT_FOUND",
      }
    }

    // Calcolo totale ordine
    let totalAmount = 0
    const validatedItems: any[] = []

    for (const item of items) {
      if (item.itemType === "PRODUCT") {
        // Cerca prodotto nel database
        const product = await prisma.products.findFirst({
          where: {
            workspaceId: workspaceId,
            OR: [
              { id: item.id },
              { ProductCode: item.id },
              { sku: item.id },
            ],
            isActive: true,
          },
        })

        if (!product) {
          return {
            success: false,
            message: `❌ Product not found: ${item.name}`,
            error: "PRODUCT_NOT_FOUND",
          }
        }

        // Verifica stock
        if (product.stock < item.quantity) {
          return {
            success: false,
            message: `❌ Stock insufficiente per ${item.name}. Disponibile: ${product.stock}`,
            error: "INSUFFICIENT_STOCK",
          }
        }

        const totalPrice = item.unitPrice * item.quantity
        totalAmount += totalPrice

        validatedItems.push({
          itemType: "PRODUCT",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: totalPrice,
          productId: product.id, // ✅ CORRECT: Use productId field, not product relation
        })
      } else if (item.itemType === "SERVICE") {
        // Cerca servizio nel database
        const service = await prisma.services.findFirst({
          where: {
            workspaceId: workspaceId,
            OR: [{ id: item.id }, { name: item.name }],
            isActive: true,
          },
        })

        if (!service) {
          return {
            success: false,
            message: `❌ Service not found: ${item.name}`,
            error: "SERVICE_NOT_FOUND",
          }
        }

        const totalPrice = item.unitPrice * item.quantity
        totalAmount += totalPrice

        validatedItems.push({
          itemType: "SERVICE",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: totalPrice,
          serviceId: service.id, // ✅ CORRECT: Use serviceId field, not service relation
        })
      }
    }

    // Genera codice ordine univoco
    const generatedOrderCode = await (async () => {
      const date = new Date()
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
      const sequence = await prisma.orders.count({
        where: {
          workspaceId: workspaceId,
          createdAt: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          },
        },
      })
      return `ORD-${dateStr}-${(sequence + 1).toString().padStart(3, "0")}`
    })()

    const itemsCreateData = validatedItems.map((v) => {
      if (v.itemType === "PRODUCT") {
        return {
          itemType: ItemType.PRODUCT,
          quantity: v.quantity,
          unitPrice: v.unitPrice,
          totalPrice: v.totalPrice,
          productId: v.productId, // ✅ CORRECT: Use productId field, not product relation
        }
      } else {
        return {
          itemType: ItemType.SERVICE,
          quantity: v.quantity,
          unitPrice: v.unitPrice,
          totalPrice: v.totalPrice,
          serviceId: v.serviceId, // ✅ CORRECT: Use serviceId field, not service relation
        }
      }
    })

    const order = await prisma.orders.create({
      data: {
        customer: { connect: { id: customerId } },
        workspace: { connect: { id: workspaceId } },
        orderCode: generatedOrderCode,
        status: "PENDING",
        totalAmount: totalAmount,
        shippingAmount: 0,
        taxAmount: 0,
        discountAmount: 0,
        notes: notes || "",
        items: {
          create: itemsCreateData,
        },
      },
      include: {
        items: {
          include: {
            product: true,
            service: true,
          },
        },
        customer: true,
      },
    })

    // Aggiorna stock prodotti
    for (const item of validatedItems) {
      if (item.itemType === "PRODUCT" && item.productId) {
        await prisma.products.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }
    }

    // Track order cost (1€) in usage table
    await trackOrderCost(params.workspaceId, customer.id)

    // Genera checkout URL (opzionale per ordini WhatsApp)
    const checkoutUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/checkout/order/${order.id}`

    logger.info("✅ Order created successfully:", {
      orderId: order.id,
      orderCode: generatedOrderCode,
      customerId: customer.id,
      customerName: customer.name,
      totalAmount: totalAmount,
      itemsCount: validatedItems.length,
    })

    return {
      success: true,
      message: `✅ Order created successfully! Code: ${generatedOrderCode}`,
      orderId: order.id,
      checkoutUrl: checkoutUrl,
    }
  } catch (error) {
          logger.error("❌ CreateOrder error:", error)
    return {
      success: false,
              message: "❌ Internal server error during order creation",
      error: "INTERNAL_ERROR",
    }
  }
}

// Export per LangChain function calling
export const CreateOrderFunction = {
  name: "CreateOrder",
  description: `📝 **CREATEORDER() - CREAZIONE ORDINE CON PRODOTTI E SERVIZI**

**COSA FA QUESTA FUNZIONE:**  
Crea un nuovo ordine per il cliente, includendo sia prodotti che servizi, con quantità e prezzo per ciascun item.

**QUANDO CHIAMARE:**
- SOLO dopo conferma esplicita dell'ordine dal cliente
- Esempi: "Confermo l'ordine", "Sì, procedi", "Order now", "Compra"
- MAI chiamare per richieste generiche o senza conferma

**PARAMETRI RICHIESTI:**
- workspaceId: ID del workspace (sempre required)
- customerId: ID del cliente (sempre required)  
- items: Array di prodotti/servizi con type, id, name, quantity, unitPrice
- notes: Note opzionali per l'ordine

**FORMATO ITEMS:**
- type: "product" o "service"
- id: ProductCode/SKU del prodotto o ID del servizio
- name: Nome descrittivo
- quantity: Quantità richiesta
- unitPrice: Prezzo unitario

**ESEMPIO PAYLOAD:**
{
  "workspaceId": "workspace_id",
  "customerId": "customer_id", 
  "items": [
    {
      "type": "product",
      "id": "SP01", 
      "name": "Spaghetti Gragnano",
      "quantity": 2,
      "unitPrice": 4.99
    },
    {
      "type": "service",
      "id": "shipping_id",
      "name": "Spedizione",
      "quantity": 1, 
      "unitPrice": 12.75
    }
  ],
  "notes": "Ordine da WhatsApp"
}`,
  parameters: {
    type: "object",
    properties: {
      workspaceId: {
        type: "string",
        description: "ID del workspace",
      },
      customerId: {
        type: "string",
        description: "ID del cliente",
      },
      items: {
        type: "array",
        description: "Array di prodotti e servizi da ordinare",
        items: {
          type: "object",
          properties: {
            itemType: {
              type: "string",
              enum: ["PRODUCT", "SERVICE"],
              description: "Tipo di item (PRODUCT o SERVICE)",
            },
            id: {
              type: "string",
              description: "ID del prodotto o servizio",
            },
            name: {
              type: "string",
              description: "Nome del prodotto o servizio",
            },
            quantity: {
              type: "number",
              description: "Quantità richiesta",
            },
            unitPrice: {
              type: "number",
              description: "Prezzo unitario",
            },
          },
          required: ["itemType", "id", "name", "quantity", "unitPrice"],
        },
      },
      notes: {
        type: "string",
        description: "Note opzionali per l'ordine",
      },
    },
    required: ["workspaceId", "customerId", "items"],
  },
  handler: CreateOrder,
}

/**
 * Track order cost (1€) in usage table
 */
async function trackOrderCost(workspaceId: string, customerId: string): Promise<void> {
  try {
    await prisma.usage.create({
      data: {
        workspaceId: workspaceId,
        clientId: customerId,
        price: 1.00 // 1€
      }
    });

    logger.info(`[ORDER_COST] Tracked 1€ order cost for customer ${customerId} in workspace ${workspaceId}`);
  } catch (error) {
    logger.error(`[ORDER_COST] Error tracking order cost for customer ${customerId}:`, error);
  }
}

