import { EmailService } from "../../application/services/email.service"
import { prisma } from "../../lib/prisma"
import logger from "../../utils/logger"

/**
 * ContactOperator Calling Function
 *
 * This function is used to handle operator intervention requests from users.
 * When called, it sets the 'activeChatbot' field to false for the customer matching the given phone and workspaceId.
 * It also sends an email notification to the operator (adminEmail) with AI-generated chat summary.
 * It returns a confirmation message to the user: "Certo, verrà contattato il prima possibile dal nostro operatore."
 *
 * Parameters:
 *   - phone: string (the customer's phone number)
 *   - workspaceId: string (the workspace context)
 *
 * Usage:
 *   - Used by N8N or the chatbot when a user requests to speak with a human operator.
 *   - After this call, the chatbot will no longer respond to the user until reactivated manually.
 *   - An email notification is sent to the operator (adminEmail) with AI-generated chat summary.
 */
export async function ContactOperator({
  phone,
  workspaceId,
}: {
  phone: string
  workspaceId: string
}) {
  if (!phone || !workspaceId) {
    throw new Error("Missing phone or workspaceId")
  }

  try {
    // Find customer
    const customer = await prisma.customers.findFirst({
      where: { phone, workspaceId },
    })

    if (!customer) {
      throw new Error("Customer not found")
    }

    // Check if customer has email
    if (!customer.email) {
      logger.warn(`Customer ${customer.name || phone} has no email - continuing without email requirement`)
    }

    // Get workspace and admin email
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        whatsappSettings: true,
      },
    })

    if (!workspace) {
      throw new Error("Workspace not found")
    }

    // Disable chatbot for this customer
    await prisma.customers.update({
      where: { id: customer.id },
      data: { activeChatbot: false },
    })

    // Get recent chat messages for summary (last 24 hours)
    const recentMessages = await prisma.message.findMany({
      where: {
        chatSession: {
          workspaceId: workspaceId,
          customerId: customer.id,
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // Limit to 10 recent messages
    })

    // Create AI-powered message summary for the operator
    const conversationText = recentMessages.length > 0
      ? recentMessages
          .slice(0, 10) // Last 10 messages for AI analysis
          .reverse() // Show chronological order
          .map(
            (msg) =>
              `${msg.direction === "INBOUND" ? "Cliente" : "Bot"}: ${msg.content}`
          )
          .join("\n")
      : "Nessuna conversazione recente disponibile"

    // Generate AI summary of the conversation for the operator
    const aiSummary = await generateAIChatSummary(conversationText, customer.name || phone)

    const emailContent = `
🚨 RICHIESTA OPERATORE UMANO

📱 Cliente: ${customer.name} (${phone})
📧 Email cliente: ${customer.email || 'N/A'}
🌐 Workspace: ${workspaceId}
⏰ Data richiesta: ${new Date().toLocaleString("it-IT")}

📄 RIASSUNTO AI CONVERSAZIONE (ultimo giorno):
${aiSummary}

ℹ️ Il chatbot è stato automaticamente disattivato per questo cliente.
📞 Contattare il cliente al numero ${phone} ${customer.email ? `o via email ${customer.email}` : ''} il prima possibile.
    `

    // Send email notification to operator (adminEmail) if configured
    const adminEmail = workspace.whatsappSettings?.adminEmail
    if (adminEmail) {
      const emailService = new EmailService()

      try {
        await emailService.sendOperatorNotificationEmail({
          to: adminEmail, // Send to operator (admin)
          customerName: customer.name || phone,
          chatSummary: aiSummary, // Use AI-generated summary
          workspaceName: workspace.name,
          subject: `🔔 Cliente ${customer.name || phone} richiede assistenza operatore`,
          fromEmail: 'noreply@shopme.com', // Fixed sender email
          // TODO: Add chatId if chat system is available
        })

        logger.info(
          `Operator notification email sent to admin ${adminEmail} for customer ${customer.name || phone}`
        )
      } catch (emailError) {
        logger.error(
          `Failed to send operator notification email: ${emailError}`
        )
        // Continue execution even if email fails
      }
    } else {
      logger.warn(
        `No admin email configured for workspace ${workspaceId}, skipping email notification`
      )
    }

    return {
      message:
        "Certo, verrà contattato il prima possibile dal nostro operatore.",
    }
  } catch (error) {
    logger.error(`Error in ContactOperator: ${error}`)
    throw error
  }
}

/**
 * Generate AI-powered chat summary for operator notification
 */
async function generateAIChatSummary(
  conversationText: string,
  customerName: string
): Promise<string> {
  try {
    const systemPrompt = `Sei un assistente AI specializzato nel riassumere conversazioni chat per operatori di customer service.

OBIETTIVO: Crea un riassunto conciso e utile della conversazione per aiutare l'operatore a comprendere rapidamente la situazione del cliente.

FORMATO RICHIESTO:
1. Riassunto principale (2-3 frasi)
2. Punti chiave della richiesta
3. Stato della conversazione
4. Prossimi passi suggeriti

STILE: Professionale, chiaro, orientato all'azione.`

    const userPrompt = `Cliente: ${customerName}

Conversazione da riassumere:
${conversationText}

Crea un riassunto professionale per l'operatore che dovrà assistere questo cliente.`

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || "sk-or-v1-78c47a3d3e2b2a0faf8b7e9c5d4b6a1e8f9c2d1a5b6e9f0c3a7b8d2e5f1c4a9b6"}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
          "X-Title": "ShopMe ChatBot",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 400,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const aiSummary = data.choices?.[0]?.message?.content?.trim()

    if (aiSummary) {
      logger.info(
        `AI chat summary generated successfully for customer ${customerName}`
      )
      return aiSummary
    } else {
      throw new Error("No AI summary generated")
    }
  } catch (error) {
    logger.error(`Failed to generate AI chat summary: ${error}`)

    // Fallback to simple summary if AI fails
    const fallbackSummary = `📋 Riassunto conversazione con ${customerName}:

${conversationText.split("\n").slice(-5).join("\n")}

⚠️ Riassunto AI non disponibile - mostrati ultimi 5 messaggi.
Il cliente ha richiesto assistenza operatore.`

    return fallbackSummary
  }
}
