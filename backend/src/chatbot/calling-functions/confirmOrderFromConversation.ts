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
  conversationContext: string // Latest conversation messages
  prodottiSelezionati?: ConversationProduct[] // Products identified by LLM
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
    // Parameter validation
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

    // Verify that customer and workspace exist
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

    // Search products in database and calculate prices
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

    // Generate secure token
    const checkoutToken = generateSecureToken()
          const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

          // Save token in database with products
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

    // Create order summary message
    const checkoutMessage = `🛒 **Order Summary**

${prodottiConPrezzo
  .map(
    (item) =>
      `• ${item.descrizione} (${item.codice})\n  Quantity: ${item.qty} x €${item.prezzo.toFixed(2)} = €${(item.prezzo * item.qty).toFixed(2)}`
  )
  .join("\n\n")}

💰 **Total: €${totalAmount.toFixed(2)}**

🔗 **Complete your order:**
${checkoutUrl}

⏰ Link valid for 1 hour
🔐 Secure checkout

📝 In checkout you can:
• Verify selected products
• Enter shipping address
• Choose payment method
• Finally confirm the order

🧹 **Note**: Your cart has been cleared to avoid duplicate orders.`

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
    "Confirm order from current conversation and generate secure checkout link. To be called when the customer confirms they want to proceed with the order of products discussed in the chat.",
  parameters: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "ID of the customer confirming the order",
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
          "Products identified in the conversation that the customer wants to order",
        items: {
          type: "object",
          properties: {
            nome: {
              type: "string",
              description: "Product name as mentioned by the customer",
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
