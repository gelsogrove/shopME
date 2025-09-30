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

    // Risposte multilingua
    const escalationMessages: Record<string, string> = {
      it: "🤝 **Certo, lo capisco perfettamente!** \n\n📞 Verrai contattato **il prima possibile** da un nostro **operatore umano** e disattiviamo il CHATBOT. \n\n📧 Nel frattempo puoi inviarci **tutti i dettagli** del tuo caso all'indirizzo: **info@laltrait.com** \n\n⚡ Così saremo più veloci nella risoluzione del tuo problema!",
      es: "🤝 **¡Por supuesto, lo entiendo perfectamente!** \n\n📞 Serás contactado **lo antes posible** por uno de nuestros **operadores humanos** y desactivaremos el CHATBOT. \n\n📧 Mientras tanto, puedes enviarnos **todos los detalles** de tu caso al correo: **info@laltrait.com** \n\n⚡ ¡Así podremos resolver tu problema más rápidamente!",
      en: "🤝 **Of course, I understand perfectly!** \n\n📞 You will be contacted **as soon as possible** by one of our **human operators** and we will deactivate the CHATBOT. \n\n📧 In the meantime, you can send **all the details** of your case to: **info@laltrait.com** \n\n⚡ This way we can resolve your issue more quickly!",
      pt: "🤝 **Claro, entendo perfeitamente!** \n\n📞 Você será contactado **o mais rápido possível** por um dos nossos **operadores humanos** e desativaremos o CHATBOT. \n\n📧 Enquanto isso, pode enviar **todos os detalhes** do seu caso para: **info@laltrait.com** \n\n⚡ Assim poderemos resolver o seu problema mais rapidamente!",
    }

    // Default to 'it' if not set
    const lang = (customer.language || "it").toLowerCase().substring(0, 2)
    const message = escalationMessages[lang] || escalationMessages["it"]

    return {
      success: true,
      message,
      data: {
        customerName: customer.name,
        customerPhone: customer.phone,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error: any) {
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
