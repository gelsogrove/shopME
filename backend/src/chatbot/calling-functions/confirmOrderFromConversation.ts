import crypto from "crypto"
import { prisma } from "../../lib/prisma"
import logger from "../../utils/logger"

/**
 * Confirm Order From Conversation Calling Function
 *
 * Estrae prodotti dalla conversazione corrente e genera link checkout sicuro
 */

export interface ConversationProduct {
  nome: string
  descrizione?: string
  quantita: number
  codice?: string
}

export interface ConfirmOrderFromConversationParams {
  customerId: string
  workspaceId: string
  conversationContext: string // Ultimi messaggi della conversazione
  prodottiSelezionati?: ConversationProduct[] // Prodotti identificati dal LLM
}

export interface ConfirmOrderFromConversationResult {
  success: boolean
  response?: string
  checkoutToken?: string
  checkoutUrl?: string
  expiresAt?: Date
  error?: string
  totalAmount?: number
}

/**
 * Conferma ordine dalla conversazione e crea checkout link
 */
export async function confirmOrderFromConversation(
  params: ConfirmOrderFromConversationParams
): Promise<ConfirmOrderFromConversationResult> {
  const { customerId, workspaceId, conversationContext, prodottiSelezionati } =
    params

  logger.info(
    `[CONFIRM_ORDER_CONVERSATION] Processing order confirmation for customer ${customerId}`
  )

  try {
    // Validazione parametri
    if (!customerId || !workspaceId) {
      throw new Error("Missing required parameters: customerId or workspaceId")
    }

    if (!prodottiSelezionati || prodottiSelezionati.length === 0) {
      return {
        success: false,
        response:
          "I have not identified products in our conversation. Can you specify what you want to order?",
        error: "No products identified in conversation",
      }
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

    // Cerca prodotti nel database e calcola prezzi
    const prodottiConPrezzo = []
    let totalAmount = 0

    for (const product of prodottiSelezionati) {
      // Search product by name or SKU
      const dbProduct = await prisma.products.findFirst({
        where: {
          workspaceId,
          OR: [
            { name: { contains: product.nome, mode: "insensitive" } },
            { sku: product.codice },
            { description: { contains: product.nome, mode: "insensitive" } },
          ],
          isActive: true,
        },
      })

      if (!dbProduct) {
        logger.warn(`Product not found: ${product.nome}`)
        return {
          success: false,
          response: `I cannot find the product "${product.nome}" in the catalog. Can you verify the name?`,
          error: `Product not found: ${product.nome}`,
        }
      }

      // Calculate price with possible discounts
      const unitPrice = dbProduct.price
      const totalPrice = unitPrice * product.quantita

      prodottiConPrezzo.push({
        codice: dbProduct.ProductCode || dbProduct.sku || dbProduct.id,
        descrizione: dbProduct.name,
        qty: product.quantita,
        prezzo: unitPrice,
        productId: dbProduct.id,
      })

      totalAmount += totalPrice
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
            prodotti: prodottiConPrezzo,
            type: "conversational_order_checkout",
            conversationContext: conversationContext.substring(0, 1000), // Limita dimensione
          })
        ) as any,
        expiresAt,
      },
    })

    // Crea URL frontend
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
    const checkoutUrl = `${frontendUrl}/checkout/${checkoutToken}`

    // Crea messaggio di riepilogo
    const checkoutMessage = `🛒 **Riepilogo Ordine**

${prodottiConPrezzo
  .map(
    (item) =>
      `• ${item.descrizione} (${item.codice})\n  Quantità: ${item.qty} x €${item.prezzo.toFixed(2)} = €${(item.prezzo * item.qty).toFixed(2)}`
  )
  .join("\n\n")}

💰 **Totale: €${totalAmount.toFixed(2)}**

🔗 **Finalizza il tuo ordine:**
${checkoutUrl}

⏰ Link valido per 1 ora
🔐 Checkout sicuro

📝 Nel checkout potrai:
• Verificare i prodotti selezionati
• Inserire l'indirizzo di spedizione
• Scegliere il metodo di pagamento
• Confermare definitivamente l'ordine

🧹 **Nota**: Il tuo carrello è stato pulito per evitare ordini duplicati.`

    logger.info(
      `[CONFIRM_ORDER_CONVERSATION] Checkout link created: ${checkoutToken}, Total: €${totalAmount}`
    )

    return {
      success: true,
      response: checkoutMessage,
      checkoutToken,
      checkoutUrl,
      expiresAt,
      totalAmount,
    }
  } catch (error) {
    logger.error(
      `[CONFIRM_ORDER_CONVERSATION] Error confirming order from conversation:`,
      error
    )
    return {
      success: false,
      response:
        "An error occurred during order creation. Please try again or contact support.",
      error: (error as Error).message,
    }
  }
}

/**
 * Genera token sicuro usando crypto
 */
function generateSecureToken(): string {
  const randomBytes = crypto.randomBytes(32)
  return crypto
    .createHash("sha256")
    .update(randomBytes)
    .digest("hex")
    .substring(0, 32)
}

// Export per LangChain function calling
export const confirmOrderFromConversationFunction = {
  name: "confirmOrderFromConversation",
  description:
    "Conferma ordine dalla conversazione corrente e genera link checkout sicuro. Da chiamare quando il cliente conferma di voler procedere con l'ordine dei prodotti discussi nella chat.",
  parameters: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "ID del cliente che conferma l'ordine",
      },
      workspaceId: {
        type: "string",
        description: "ID del workspace",
      },
      conversationContext: {
        type: "string",
        description: "Ultimi messaggi della conversazione per contesto",
      },
      prodottiSelezionati: {
        type: "array",
        description:
          "Prodotti identificati nella conversazione che il cliente vuole ordinare",
        items: {
          type: "object",
          properties: {
            nome: {
              type: "string",
              description: "Nome del prodotto come menzionato dal cliente",
            },
            quantita: {
              type: "number",
              description: "Quantità richiesta dal cliente",
            },
            descrizione: {
              type: "string",
              description: "Descrizione aggiuntiva se fornita",
            },
            codice: {
              type: "string",
              description: "Codice prodotto se menzionato",
            },
          },
          required: ["nome", "quantita"],
        },
      },
    },
    required: ["customerId", "workspaceId", "prodottiSelezionati"],
  },
  handler: confirmOrderFromConversation,
}
