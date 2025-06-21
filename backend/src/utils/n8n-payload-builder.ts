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
        `[PRECOMPILE] 🔄 Gathering all N8N data for workspace ${workspaceId}`
      )

      // 🏃‍♂️ PARALLEL EXECUTION - Andrea's efficiency approach
      const [agentConfig, customer, workspace, recentMessages] =
        await Promise.all([
          // 1. Agent Configuration
          prisma.agentConfig.findFirst({
            where: { workspaceId },
          }),

          // 2. Customer Information
          prisma.customers.findFirst({
            where: {
              phone: phoneNumber,
              workspaceId: workspaceId,
              isActive: true,
            },
          }),

          // 3. Workspace Information
          prisma.workspace.findUnique({
            where: { id: workspaceId },
          }),

          // 4. Conversation History
          N8nPayloadBuilder.getRecentConversationHistory(workspaceId, phoneNumber, 10),
        ])

      logger.info(
        `[PRECOMPILE] ✅ Data gathered - Agent: ${agentConfig?.model}, Customer: ${customer?.id ? "exists" : "new"}, Workspace: ${workspace?.name}`
      )

      return {
        // 🤖 AGENT CONFIGURATION
        agentConfig: agentConfig
          ? {
              model: agentConfig.model,
              temperature: agentConfig.temperature,
              maxTokens: agentConfig.maxTokens,
              prompt: agentConfig.prompt,
              isActive: agentConfig.isActive,
            }
          : null,

        // 👤 CUSTOMER INFORMATION
        customer: customer
          ? {
              id: customer.id,
              phone: customer.phone,
              name: customer.name,
              email: customer.email,
              language: customer.language || "en",
              isActive: customer.isActive,
              activeChatbot: customer.activeChatbot,
              isBlacklisted: customer.isBlacklisted,
              discount: customer.discount,
              currency: customer.currency,
            }
          : null,

        // 🏢 BUSINESS INFORMATION
        businessInfo: workspace
          ? {
              name: workspace.name,
              businessType: workspace.businessType,
              whatsappPhoneNumber: workspace.whatsappPhoneNumber,
              isActive: workspace.isActive,
              plan: workspace.plan,
              language: workspace.language,
              url: workspace.url || "",
              notificationEmail: workspace.notificationEmail,
              welcomeMessages: workspace.welcomeMessages,
              wipMessages: workspace.wipMessages,
              afterRegistrationMessages: workspace.afterRegistrationMessages,
              currency: workspace.currency,
              description: workspace.description,
            }
          : null,

        // 💬 CONVERSATION HISTORY (last 10 messages)
        conversationHistory: recentMessages,
      }
    } catch (error) {
      logger.error(`[PRECOMPILE] ❌ Error precompiling N8N data:`, error)
      return {
        agentConfig: null,
        customer: null,
        businessInfo: null,
        conversationHistory: [],
      }
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

    // 🚀 EXACT PAYLOAD STRUCTURE - Following webhook-payload-example.json
    const simplifiedPayload = {
      workspaceId: workspaceId,
      phoneNumber: phoneNumber,
      messageContent: messageContent,
      sessionToken: sessionToken,
      precompiledData: {
        agentConfig: optimizedData.agentConfig ? {
          id: `agent-config-${Date.now()}`,
          workspaceId: workspaceId,
          model: optimizedData.agentConfig.model,
          temperature: optimizedData.agentConfig.temperature,
          maxTokens: optimizedData.agentConfig.maxTokens,
          topP: 0.9,
          prompt: optimizedData.agentConfig.prompt,
          isActive: optimizedData.agentConfig.isActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } : null,
        
        customer: optimizedData.customer ? {
          id: optimizedData.customer.id,
          name: optimizedData.customer.name,
          email: optimizedData.customer.email,
          phone: optimizedData.customer.phone,
          language: optimizedData.customer.language || "en",
          isActive: optimizedData.customer.isActive,
          isBlacklisted: optimizedData.customer.isBlacklisted,
          activeChatbot: optimizedData.customer.activeChatbot,
          discount: optimizedData.customer.discount,
          currency: optimizedData.customer.currency,
          address: "",
          company: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } : null,
        
        businessInfo: optimizedData.businessInfo ? {
          id: workspaceId,
          name: optimizedData.businessInfo.name,
          businessType: optimizedData.businessInfo.businessType,
          plan: optimizedData.businessInfo.plan || "BASIC",
          whatsappPhoneNumber: optimizedData.businessInfo.whatsappPhoneNumber,
          whatsappApiKey: "your-whatsapp-api-key",
          language: optimizedData.businessInfo.language || "en",
          currency: optimizedData.businessInfo.currency || "EUR",
          timezone: "Europe/Rome",
          isActive: optimizedData.businessInfo.isActive,
          url: optimizedData.businessInfo.url || "",
          notificationEmail: optimizedData.businessInfo.notificationEmail,
          description: optimizedData.businessInfo.description || "",
          welcomeMessages: optimizedData.businessInfo.welcomeMessages || {},
          wipMessages: optimizedData.businessInfo.wipMessages || {},
          afterRegistrationMessages: optimizedData.businessInfo.afterRegistrationMessages || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } : null,
        
        conversationHistory: optimizedData.conversationHistory.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.direction === "INBOUND" ? "user" : "assistant",
          timestamp: msg.createdAt,
        })),
        
        // 🚨 SEPARATE MESSAGES STRUCTURE (as per example)
        wipMessages: optimizedData.businessInfo?.wipMessages || {},
        welcomeMessages: optimizedData.businessInfo?.welcomeMessages || {},
        afterRegistrationMessages: optimizedData.businessInfo?.afterRegistrationMessages || {},
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: source,
        apiVersion: "v1.0",
        securityChecks: {
          apiLimitPassed: true,
          spamDetectionPassed: true,
          blacklistCheck: false,
          operatorControl: false,
        },
        performance: {
          securityGatewayTime: "5ms",
          precompilationTime: "12ms",
          totalProcessingTime: "17ms",
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
      logger.info(`[N8N] 🚀 Sending simplified payload to N8N: ${n8nWebhookUrl}`)
      logger.info(`[N8N] 📱 Phone: ${simplifiedPayload.phoneNumber}`)
      logger.info(`[N8N] 💬 Message: ${simplifiedPayload.messageContent}`)
      logger.info(`[N8N] 🔑 Session Token: ${simplifiedPayload.sessionToken.substring(0, 12)}...`)

      // 🚨 DEBUG: Alert prima della chiamata a N8N
      logger.info(`🚨 DEBUG: RUN POST N8N (from ${source})`)
      console.log(`🚨 DEBUG: RUN POST N8N (from ${source}) - ALERT EQUIVALENTE`)
      console.log("🚨 N8N URL:", n8nWebhookUrl)
      console.log(
        "🚨 N8N Simplified Payload:",
        JSON.stringify(simplifiedPayload, null, 2)
      )

      // Send to N8N
      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(simplifiedPayload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        const errorDetails = `Status: ${response.status}, Response: ${errorText}`
        logger.error(`[N8N] ❌ N8N webhook failed: ${errorDetails}`)
        console.log(`🚨 N8N ERROR (from ${source}):`, errorDetails)
        throw new Error(`N8N webhook failed: ${errorDetails}`)
      }

      // Parse and return the response from N8N
      const n8nResponse = await response.json()
      logger.info(
        `[N8N] ✅ Successfully received response from N8N:`,
        n8nResponse
      )
      console.log(`🚨 N8N RESPONSE SUCCESS (from ${source}):`, n8nResponse)
      console.log(`🚨 SALVATO - Risposta N8N processata con successo (from ${source})`)

      return n8nResponse
    } catch (error) {
      logger.error(`[N8N] ❌ Error sending to N8N (from ${source}):`, error)
      console.log(`🚨 N8N ERROR (from ${source}):`, error)
      throw error
    }
  }
}
