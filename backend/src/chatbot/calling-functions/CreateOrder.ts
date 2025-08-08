import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export interface OrderItem {
  type: "product" | "service"
  id: string
  name: string
  quantity: number
  unitPrice: number
}

export interface CreateOrderParams {
  workspaceId: string
  customerId: string
  items: OrderItem[]
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
    console.log(
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
        message: "❌ Cliente non trovato",
        error: "CUSTOMER_NOT_FOUND",
      }
    }

    // Calcolo totale ordine
    let totalAmount = 0
    const validatedItems: any[] = []

    for (const item of items) {
      if (item.type === "product") {
        // Verifica prodotto esiste e ha stock
        const product = await prisma.products.findFirst({
          where: {
            OR: [{ ProductCode: item.id }, { sku: item.id }, { id: item.id }],
            workspaceId: workspaceId,
            status: "ACTIVE",
          },
        })

        if (!product) {
          return {
            success: false,
            message: `❌ Prodotto non trovato: ${item.name}`,
            error: "PRODUCT_NOT_FOUND",
          }
        }

        if (product.stock < item.quantity) {
          return {
            success: false,
            message: `❌ Stock insufficiente per ${product.name}. Disponibili: ${product.stock}, richiesti: ${item.quantity}`,
            error: "INSUFFICIENT_STOCK",
          }
        }

        validatedItems.push({
          itemType: "PRODUCT",
          product: { connect: { id: product.id } },
          service: undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        })

        totalAmount += item.quantity * item.unitPrice
      } else if (item.type === "service") {
        // Verifica servizio esiste
        const service = await prisma.services.findFirst({
          where: {
            OR: [{ id: item.id }, { name: item.name }],
            workspaceId: workspaceId,
            isActive: true,
          },
        })

        if (!service) {
          return {
            success: false,
            message: `❌ Servizio non trovato: ${item.name}`,
            error: "SERVICE_NOT_FOUND",
          }
        }

        validatedItems.push({
          itemType: "SERVICE",
          product: undefined,
          service: { connect: { id: service.id } },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        })

        totalAmount += item.quantity * item.unitPrice
      }
    }

    // Helper per order code a 5 cifre
    const generateOrderCode = () => {
      const min = 10000
      const max = 99999
      return String(Math.floor(Math.random() * (max - min + 1)) + min)
    }

    // Creazione ordine
    const order = await prisma.orders.create({
      data: {
        orderCode: generateOrderCode(),
        status: "PENDING",
        totalAmount: totalAmount,
        notes: notes || "",
        // trackingNumber left undefined unless provided upstream
        customer: { connect: { id: customerId } },
        workspace: { connect: { id: workspaceId } },
        items: {
          create: validatedItems,
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
      if (item.productId) {
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

    // Genera checkout URL (opzionale per ordini WhatsApp)
    const checkoutUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/checkout/order/${order.id}`

    console.log("✅ Ordine creato con successo:", {
      orderId: order.id,
      customerId: customer.id,
      customerName: customer.name,
      totalAmount: totalAmount,
      itemsCount: validatedItems.length,
    })

    return {
      success: true,
      message: `✅ Ordine creato con successo! ID: ${order.id}`,
      orderId: order.id,
      checkoutUrl: checkoutUrl,
    }
  } catch (error) {
    console.error("❌ Errore CreateOrder:", error)
    return {
      success: false,
      message: "❌ Errore interno del server durante la creazione dell'ordine",
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
            type: {
              type: "string",
              enum: ["product", "service"],
              description: "Tipo di item: product o service",
            },
            id: {
              type: "string",
              description: "ProductCode, SKU o ID dell'item",
            },
            name: {
              type: "string",
              description: "Nome descrittivo dell'item",
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
          required: ["type", "id", "name", "quantity", "unitPrice"],
        },
      },
      notes: {
        type: "string",
        description: "Note opzionali per l'ordine",
      },
    },
    required: ["workspaceId", "customerId", "items"],
  },
}
