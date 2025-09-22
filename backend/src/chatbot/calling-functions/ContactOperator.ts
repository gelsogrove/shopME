import { prisma } from "../../lib/prisma"
import logger from "../../utils/logger"

/**
 * ContactOperator Calling Function
 *
 * This function handles operator intervention requests from users.
 * It sets the 'activeChatbot' field to false for the customer and returns a confirmation message.
 *
 * KISS Principle: Keep It Simple
 * - Just disable chatbot
 * - Return confirmation message
 * - No emails, no AI summaries
 */
export async function ContactOperator({
  phoneNumber,
  workspaceId,
  customerId,
}: {
  phoneNumber: string
  workspaceId: string
  customerId?: string
}) {
  if (!phoneNumber || !workspaceId) {
    throw new Error("Missing phone or workspaceId")
  }

  try {
    // Find customer
    const customer = await prisma.customers.findFirst({
      where: customerId
        ? { id: customerId }
        : { phone: phoneNumber, workspaceId },
    })

    if (!customer) {
      throw new Error("Customer not found")
    }

    // 🚀 KISS: Solo disattivare chatbot e ritornare conferma
    await prisma.customers.update({
      where: { id: customer.id },
      data: { activeChatbot: false },
    })

    return {
      success: true,
      message:
        "Certo, verrai contattato il prima possibile da un nostro operatore.",
      data: {
        customerName: customer.name,
        customerPhone: customer.phone,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    logger.error("❌ Error in ContactOperator:", error)
    return {
      success: false,
      error: error.message || "Error contacting operator",
      message:
        "Mi dispiace, si è verificato un errore tecnico. Riprova tra qualche minuto.",
    }
  }
}

// Export per LangChain function calling
export const contactOperatorFunction = {
  name: "ContactOperator",
  description:
    "Contatta un operatore per assistenza diretta quando il cliente lo richiede esplicitamente",
  parameters: {
    type: "object",
    properties: {
      phoneNumber: { type: "string", description: "Numero telefono utente" },
      workspaceId: { type: "string", description: "ID workspace" },
      customerId: { type: "string", description: "ID cliente (opzionale)" },
      message: {
        type: "string",
        description: "Messaggio utente che richiede operatore",
      },
    },
    required: ["phoneNumber", "workspaceId", "message"],
  },
  handler: ContactOperator,
}
