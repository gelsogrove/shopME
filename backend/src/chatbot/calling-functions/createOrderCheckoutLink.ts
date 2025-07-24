import crypto from "crypto"
import { prisma } from "../../lib/prisma"
import logger from "../../utils/logger"

/**
 * Create Order Checkout Link Calling Function
 *
 * Genera link sicuro per il checkout con array di prodotti
 */

export interface ProductItem {
  codice: string
  descrizione: string
  qty: number
  prezzo: number
}

export interface CreateOrderCheckoutLinkParams {
  customerId: string
  workspaceId: string
  prodotti: ProductItem[]
}

export interface CreateOrderCheckoutLinkResult {
  response: string
  checkoutToken: string
  checkoutUrl: string
  expiresAt: Date
}

/**
 * Funzione per creare link checkout sicuro con prodotti
 */
export async function createOrderCheckoutLink(
  params: CreateOrderCheckoutLinkParams
): Promise<CreateOrderCheckoutLinkResult> {
  const { customerId, workspaceId, prodotti } = params

  logger.info(
    `[CREATE_ORDER_CHECKOUT] Creating order checkout link for customer ${customerId}`
  )

  try {
    // Validazione parametri
    if (!customerId || !workspaceId || !prodotti || prodotti.length === 0) {
      throw new Error(
        "Missing required parameters: customerId, workspaceId, or prodotti"
      )
    }

    // Verifica che customer e workspace esistano
    const customer = await prisma.customers.findFirst({
      where: { id: customerId, workspaceId },
    })

    if (!customer) {
      throw new Error(
        `Customer ${customerId} not found in workspace ${workspaceId}`
      )
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    })

    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`)
    }

    // Genera token sicuro
    const checkoutToken = generateSecureToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 ora

    // Salva token nel database con i prodotti
    await prisma.secureToken.create({
      data: {
        token: checkoutToken,
        type: "checkout",
        workspaceId,
        userId: customerId,
        payload: JSON.parse(
          JSON.stringify({
            customerId,
            prodotti,
            type: "order_checkout",
          })
        ) as any,
        expiresAt,
      },
    })

    // Crea URL frontend
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
    const checkoutUrl = `${frontendUrl}/checkout/${checkoutToken}`

    // Calcola totale per il messaggio
    const totalAmount = prodotti.reduce(
      (sum, item) => sum + item.prezzo * item.qty,
      0
    )

    const checkoutMessage = `🛒 **Riepilogo Ordine**

${prodotti
  .map(
    (item) =>
      `• ${item.descrizione} (${item.codice})\n  Quantità: ${item.qty} x €${item.prezzo.toFixed(2)}`
  )
  .join("\n\n")}

💰 **Totale: €${totalAmount.toFixed(2)}**

🔗 **Finalizza il tuo ordine:**
${checkoutUrl}

⏰ Link valido per 1 ora
🔐 Checkout sicuro`

    logger.info(
      `[CREATE_ORDER_CHECKOUT] Checkout link created: ${checkoutToken}, Total: €${totalAmount}`
    )

    return {
      response: checkoutMessage,
      checkoutToken,
      checkoutUrl,
      expiresAt,
    }
  } catch (error) {
    logger.error(
      `[CREATE_ORDER_CHECKOUT] Error creating order checkout link:`,
      error
    )
    throw error
  }
}

/**
 * Genera token sicuro usando crypto
 */
function generateSecureToken(): string {
  const randomBytes = crypto.randomBytes(32)
  const timestamp = Date.now().toString()
  const combined = randomBytes.toString("hex") + timestamp
  return crypto
    .createHash("sha256")
    .update(combined)
    .digest("hex")
    .substring(0, 32)
}

// Export per LangChain function calling
export const createOrderCheckoutLinkFunction = {
  name: "createOrderCheckoutLink",
  description:
    "Genera link sicuro per checkout con array di prodotti. Da chiamare quando utente vuole confermare un ordine.",
  parameters: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "ID del cliente che effettua l'ordine",
      },
      workspaceId: {
        type: "string",
        description: "ID del workspace",
      },
      prodotti: {
        type: "array",
        description: "Array di prodotti selezionati",
        items: {
          type: "object",
          properties: {
            codice: { type: "string", description: "Codice prodotto" },
            descrizione: {
              type: "string",
              description: "Descrizione prodotto",
            },
            qty: { type: "number", description: "Quantità" },
            prezzo: { type: "number", description: "Prezzo unitario" },
          },
          required: ["codice", "descrizione", "qty", "prezzo"],
        },
      },
    },
    required: ["customerId", "workspaceId", "prodotti"],
  },
  handler: createOrderCheckoutLink,
}
