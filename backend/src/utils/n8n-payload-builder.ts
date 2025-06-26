import { PrismaClient } from "@prisma/client"
import logger from "./logger"

const prisma = new PrismaClient()

/**
 * 🏗️ N8N PAYLOAD BUILDER
 * Centralized utility for building simplified N8N payloads
 * Used by both WhatsApp Controller and Message Service
 */
export class N8nPayloadBuilder {
  /**
   * 🚀 PRECOMPILE N8N DATA (Andrea's Performance Optimization)
   * Gathers ALL necessary data in parallel to avoid multiple N8N->Backend API calls
   */
  static async precompileN8NData(
    workspaceId: string,
    phoneNumber: string,
    messageContent: string,
    sessionToken: string
  ) {
    try {
      logger.info(
        `[N8N Payload Builder] 🚀 Precompiling N8N data for workspace: ${workspaceId}`
      )

      // 🏢 Get workspace/business info
      const businessInfo = await prisma.workspace.findUnique({
        where: { id: workspaceId },
      })

      // 👤 Get customer info
      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
        },
      })

      // 🤖 Get agent configuration
      const agentConfig = await prisma.agentConfig.findFirst({
        where: {
          workspaceId: workspaceId,
          isActive: true,
        },
      })

      // 📜 Get recent conversation history
      const conversationHistory = await this.getRecentConversationHistory(
        workspaceId,
        phoneNumber,
        10
      )

      logger.info(
        `[N8N Payload Builder] ✅ Precompilation complete - Business: ${
          businessInfo ? "✅" : "❌"
        } | Customer: ${customer ? "✅" : "❌"} | Agent: ${
          agentConfig ? "✅" : "❌"
        } | History: ${conversationHistory.length} messages`
      )

      return {
        businessInfo,
        customer,
        agentConfig,
        conversationHistory,
      }
    } catch (error) {
      logger.error(`[N8N Payload Builder] ❌ Error precompiling data:`, error)
      throw error
    }
  }

  /**
   * 💬 GET RECENT CONVERSATION HISTORY
   * Retrieves recent conversation for context
   */
  private static async getRecentConversationHistory(
    workspaceId: string,
    phoneNumber: string,
    limit: number = 10
  ) {
    try {
      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
          isActive: true,
        },
      })

      if (!customer) {
        return []
      }

      const chatSession = await prisma.chatSession.findFirst({
        where: {
          customerId: customer.id,
          workspaceId,
        },
      })

      if (!chatSession) {
        return []
      }

      const messages = await prisma.message.findMany({
        where: {
          chatSessionId: chatSession.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        select: {
          id: true,
          content: true,
          direction: true,
          createdAt: true,
          metadata: true,
        },
      })

      return messages.reverse() // Return in chronological order
    } catch (error) {
      logger.error(
        `[CONVERSATION-HISTORY] Error getting conversation history:`,
        error
      )
      return []
    }
  }

  /**
   * 🎯 BUILD SIMPLIFIED N8N PAYLOAD
   * Creates the standardized payload for N8N webhook calls
   * Follows EXACTLY the structure from webhook-payload-example.json
   */
  static async buildSimplifiedPayload(
    workspaceId: string,
    phoneNumber: string,
    messageContent: string,
    sessionToken: string,
    source: string = "whatsapp"
  ) {
    // Precompile all data needed
    const optimizedData = await N8nPayloadBuilder.precompileN8NData(
      workspaceId,
      phoneNumber,
      messageContent,
      sessionToken
    )

    // 🚨 ANDREA DEBUG: Verifica cosa arriva DAL DATABASE
    console.log("🚨 ANDREA DEBUG - optimizedData.businessInfo from DB:")
    console.log(JSON.stringify(optimizedData.businessInfo, null, 2))
    console.log("🚨 ANDREA DEBUG - optimizedData.customer from DB:")
    console.log(JSON.stringify(optimizedData.customer, null, 2))

    // 🚀 NEW CONSOLIDATED PAYLOAD STRUCTURE - Following updated webhook-payload-example.json
    const conversationHistory = optimizedData.conversationHistory.length > 0
      ? optimizedData.conversationHistory.map((msg) => ({
          id: msg.id,
          content: msg.content,
          role: msg.direction === "INBOUND" ? "user" : "assistant",
          timestamp: msg.createdAt,
        }))
      : [
          {
            id: "msg-1",
            content: "Ciao! Come posso aiutarti oggi?",
            role: "assistant",
            timestamp: "2024-06-19T15:25:00.000Z",
          },
          {
            id: "msg-2",
            content: "Salve, sto cercando dei formaggi",
            role: "user",
            timestamp: "2024-06-19T15:26:00.000Z",
          },
          {
            id: "msg-3",
            content: "Perfetto! Abbiamo un'ottima selezione di formaggi italiani. Che tipo di formaggio stai cercando?",
            role: "assistant",
            timestamp: "2024-06-19T15:26:30.000Z",
          },
        ];

    const messages = conversationHistory.map(({ role, content }) => ({ role, content }));

    const simplifiedPayload = {
      workspaceId: workspaceId,
      phoneNumber: phoneNumber,
      messageContent: messageContent,
      sessionToken: sessionToken,
      messages,
      precompiledData: {
        agentConfig: optimizedData.agentConfig
          ? {
              id: `agent-config-${Date.now()}`,
              workspaceId: workspaceId,
              model: optimizedData.agentConfig.model,
              temperature: optimizedData.agentConfig.temperature,
              maxTokens: optimizedData.agentConfig.maxTokens,
              topP: 0.9,
              prompt: optimizedData.agentConfig.prompt,
              isActive: optimizedData.agentConfig.isActive,
            }
          : {
              id: `agent-config-${Date.now()}`,
              workspaceId: workspaceId,
              model: "openai/gpt-4o-mini",
              temperature: 0.7,
              maxTokens: 1000,
              topP: 0.9,
              prompt:
                "Sei un assistente virtuale esperto per L'Altra Italia, un'azienda italiana specializzata in prodotti alimentari di alta qualità. Il tuo compito è aiutare i clienti a trovare i prodotti giusti, fornire informazioni sui prezzi, ingredienti e disponibilità. Rispondi sempre in modo professionale e cortese.",
              isActive: true,
            },

        // 🎯 CONSOLIDATED CUSTOMER OBJECT - ALL DATA IN ONE PLACE
        customer: optimizedData.customer
          ? {
              // 👤 CUSTOMER DATA
              id: optimizedData.customer.id,
              name: optimizedData.customer.name,
              email: optimizedData.customer.email,
              phone: optimizedData.customer.phone,
              language: optimizedData.customer.language || "it",
              isActive: Boolean(optimizedData.customer.isActive),
              isBlacklisted: Boolean(optimizedData.customer.isBlacklisted),
              activeChatbot: Boolean(optimizedData.customer.activeChatbot),
              discount: optimizedData.customer.discount,
              currency: optimizedData.customer.currency,
              address: optimizedData.customer.address || "Via Roma 123, Milano",
              company: optimizedData.customer.company || "",
              
              // 🏢 BUSINESS INFO MERGED HERE
              businessName: optimizedData.businessInfo?.name || "L'Altra Italia(ESP)",
              businessType: optimizedData.businessInfo?.businessType || "ECOMMERCE",
              plan: optimizedData.businessInfo?.plan || "PREMIUM",
              whatsappPhoneNumber: optimizedData.businessInfo?.whatsappPhoneNumber || "+34654728753",
              whatsappApiKey: "your-whatsapp-api-key",
              timezone: "Europe/Rome",
              url: optimizedData.businessInfo?.url || "https://laltroitalia.shop",
              notificationEmail: optimizedData.businessInfo?.notificationEmail || "admin@laltroitalia.shop",
              description: optimizedData.businessInfo?.description || "Prodotti alimentari italiani di alta qualità",
              
              // 💬 MESSAGES MERGED HERE
              wipMessages: {
                it: "Sto elaborando la tua richiesta, un momento per favore...",
                en: "Processing your request, please wait a moment...",
                es: "Procesando tu solicitud, por favor espera un momento...",
                fr: "Je traite votre demande, veuillez patienter un moment...",
                de: "Ich bearbeite Ihre Anfrage, bitte warten Sie einen Moment...",
                pt: "Processando sua solicitação, aguarde um momento por favor...",
              },
              
              // 📜 CONVERSATION HISTORY MERGED HERE
              conversationHistory: conversationHistory,
            }
          : {
              // 🚨 FALLBACK CUSTOMER (when no customer found)
              id: `customer-${Date.now()}`,
              name: "Customer",
              email: "",
              phone: phoneNumber,
              language: "it",
              isActive: true,
              isBlacklisted: false,
              activeChatbot: Boolean(true),
              discount: 0,
              currency: "EUR",
              address: "",
              company: "",
              
              // 🏢 FALLBACK BUSINESS INFO
              businessName: "L'Altra Italia(ESP)",
              businessType: "ECOMMERCE",
              plan: "PREMIUM",
              whatsappPhoneNumber: "+34654728753",
              whatsappApiKey: "your-whatsapp-api-key",
              timezone: "Europe/Rome",
              url: "https://laltroitalia.shop",
              notificationEmail: "admin@laltroitalia.shop",
              description: "Prodotti alimentari italiani di alta qualità",
              
              // 💬 FALLBACK MESSAGES
              wipMessages: {
                it: "Sto elaborando la tua richiesta, un momento per favore...",
                en: "Processing your request, please wait a moment...",
                es: "Procesando tu solicitud, por favor espera un momento...",
                fr: "Je traite votre demande, veuillez patienter un moment...",
                de: "Ich bearbeite Ihre Anfrage, bitte warten Sie einen Moment...",
                pt: "Processando sua solicitação, aguarde um momento por favor...",
              },
              
              // 📜 FALLBACK CONVERSATION HISTORY
              conversationHistory: conversationHistory,
            },
      },
    }

    return simplifiedPayload
  }

  /**
   * 📤 SEND TO N8N
   * Centralized method to send payload to N8N webhook
   */
  static async sendToN8N(
    simplifiedPayload: any,
    n8nWebhookUrl: string,
    source: string = "unknown"
  ) {
    try {
      logger.info(
        `[N8N] 🚀 Sending simplified payload to N8N: ${n8nWebhookUrl}`
      )
      logger.info(`[N8N] 📱 Phone: ${simplifiedPayload.phoneNumber}`)
      logger.info(`[N8N] 💬 Message: ${simplifiedPayload.messageContent}`)
      logger.info(
        `[N8N] 🔑 Session Token: ${simplifiedPayload.sessionToken.substring(0, 12)}...`
      )

      // 🚨 DEBUG: Alert prima della chiamata a N8N
      logger.info(`🚨 DEBUG: RUN POST N8N (from ${source})`)
      console.log(`🚨 DEBUG: RUN POST N8N (from ${source}) - ALERT EQUIVALENTE`)
      console.log("🚨 N8N URL:", n8nWebhookUrl)
      console.log("🚨 N8N Simplified Payload:")
      console.log(JSON.stringify(simplifiedPayload, null, 2))
      
      // 🔍 ANDREA DEBUG: Verifica specificamente businessInfo.isActive
      console.log("🔍 ANDREA DEBUG - customer.isActive:", simplifiedPayload?.precompiledData?.customer?.isActive)
      console.log("🔍 ANDREA DEBUG - customer.isActive type:", typeof simplifiedPayload?.precompiledData?.customer?.isActive)
      console.log("🔍 ANDREA DEBUG - customer.activeChatbot:", simplifiedPayload?.precompiledData?.customer?.activeChatbot)
      console.log("🔍 ANDREA DEBUG - customer.isBlacklisted:", simplifiedPayload?.precompiledData?.customer?.isBlacklisted)
      
      // 🚨 SUPER DEBUG: Mostra tutto il precompiledData
      console.log("🚨 SUPER DEBUG - INTERO precompiledData:")
      console.log(JSON.stringify(simplifiedPayload?.precompiledData, null, 2))

      // Send to N8N
      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(simplifiedPayload),
      })

      if (!response.ok) {
        throw new Error(
          `N8N webhook failed with status: ${response.status} ${response.statusText}`
        )
      }

      const n8nResponse = await response.json()
      logger.info(`[N8N] ✅ N8N response received successfully`)
      logger.info(`[N8N] 📝 Response:`, JSON.stringify(n8nResponse, null, 2))

      return n8nResponse
    } catch (error) {
      logger.error(`[N8N] ❌ Error sending to N8N:`, error)
      throw error
    }
  }
}
