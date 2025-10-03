import { PrismaClient } from "@prisma/client"
import { config } from "../config"
import logger from "../utils/logger"
import { usageService } from "./usage.service"

const prisma = new PrismaClient()

/**
 * 📱 PUSH MESSAGING SERVICE - Sistema Centralizzato
 *
 * Gestisce tutti i push messaging WhatsApp con:
 * - 🌍 Supporto multilingua automatico
 * - 💰 Tracking costi €0.5 per messaggio
 * - 📊 Integrazione analytics
 * - 🔄 Template messaging unificati
 *
 * @author Andrea Gelso
 */

export enum PushMessageType {
  ORDER_CONFIRMED = "ORDER_CONFIRMED",
  USER_REGISTERED = "USER_REGISTERED",
  DISCOUNT_UPDATED = "DISCOUNT_UPDATED",
  NEW_OFFER = "NEW_OFFER",
  CHATBOT_REACTIVATED = "CHATBOT_REACTIVATED",
}

export interface PushMessageData {
  workspaceId: string
  customerId: string
  customerPhone: string
  customerLanguage?: string
  type: PushMessageType
  templateData?: {
    orderCode?: string
    discountPercentage?: number
    offerPercentage?: number
    categoryName?: string
    offerEndDate?: string
    customerName?: string
  }
}

interface MessageTemplate {
  it: string
  en: string
  es?: string
  fr?: string
  de?: string
}

/**
 * Template messaggi per tutti i tipi di push
 */
const MESSAGE_TEMPLATES: Record<PushMessageType, MessageTemplate> = {
  [PushMessageType.ORDER_CONFIRMED]: {
    it: "🎉 Ordine confermato! Numero ordine: {orderCode}. Ti contatteremo per i dettagli di consegna.",
    en: "🎉 Order confirmed! Order number: {orderCode}. We'll contact you for delivery details.",
    es: "🎉 ¡Pedido confirmado! Número de pedido: {orderCode}. Te contactaremos para los detalles de entrega.",
    fr: "🎉 Commande confirmée! Numéro de commande: {orderCode}. Nous vous contactrons pour les détails de livraison.",
    de: "🎉 Bestellung bestätigt! Bestellnummer: {orderCode}. Wir werden Sie bezüglich der Lieferdetails kontaktieren.",
  },

  [PushMessageType.USER_REGISTERED]: {
    it: "👋 Benvenuto! Grazie per esserti registrato al nostro servizio di IA presto verrai attivato dai nostri commerciali.",
    en: "👋 Welcome! Thank you for registering to our AI service, you will be activated soon by our sales team.",
    es: "👋 ¡Bienvenido! Gracias por registrarte en nuestro servicio de IA, pronto serás activado por nuestro equipo comercial.",
    fr: "👋 Bienvenue! Merci de vous être inscrit à notre service d'IA, vous serez bientôt activé par notre équipe commerciale.",
    de: "👋 Willkommen! Danke für die Anmeldung bei unserem KI-Service, Sie werden bald von unserem Vertriebsteam aktiviert.",
  },

  [PushMessageType.DISCOUNT_UPDATED]: {
    it: "💸 Ciao {customerName}! Da oggi puoi usufruire del {discountPercentage}% di sconto sui nostri prodotti.",
    en: "💸 Hi {customerName}! From today you can enjoy {discountPercentage}% discount on our products.",
    es: "💸 ¡Hola {customerName}! Desde hoy puedes disfrutar de {discountPercentage}% de descuento en nuestros productos.",
    fr: "💸 Salut {customerName}! À partir d'aujourd'hui, vous pouvez bénéficier de {discountPercentage}% de remise sur nos produits.",
    de: "💸 Hallo {customerName}! Ab heute können Sie {discountPercentage}% Rabatt auf unsere Produkte genießen.",
  },

  [PushMessageType.NEW_OFFER]: {
    it: "🎯 Ciao {customerName}! Abbiamo un'offerta del {offerPercentage}% sulla categoria: {categoryName} fino al {offerEndDate}",
    en: "🎯 Hi {customerName}! We have a {offerPercentage}% offer on category: {categoryName} until {offerEndDate}",
    es: "🎯 ¡Hola {customerName}! Tenemos una oferta del {offerPercentage}% en la categoría: {categoryName} hasta el {offerEndDate}",
    fr: "🎯 Salut {customerName}! Nous avons une offre de {offerPercentage}% sur la catégorie: {categoryName} jusqu'au {offerEndDate}",
    de: "🎯 Hallo {customerName}! Wir haben ein {offerPercentage}% Angebot für die Kategorie: {categoryName} bis {offerEndDate}",
  },

  [PushMessageType.CHATBOT_REACTIVATED]: {
    it: "🤖 Ciao {customerName}, il chatbot è ora disponibile, come posso aiutarti oggi?",
    en: "🤖 Hi {customerName}, the chatbot is now available, how can I help you today?",
    es: "🤖 ¡Hola {customerName}, el chatbot ya está disponible, ¿cómo puedo ayudarte hoy?",
    fr: "🤖 Salut {customerName}, le chatbot est maintenant disponible, comment puis-je vous aider aujourd'hui?",
    de: "🤖 Hallo {customerName}, der Chatbot ist jetzt verfügbar, wie kann ich Ihnen heute helfen?",
  },
}

export const pushMessagingService = {
  /**
   * 📱 Invia push message centralizzato
   *
   * @param data - Dati del messaggio push
   * @returns Promise<boolean> - Success status
   */
  async sendPushMessage(data: PushMessageData): Promise<boolean> {
    try {
      logger.info(
        `[PUSH-MESSAGING] 🚀 Sending ${data.type} push to ${data.customerPhone}`
      )

      // 1. Ottieni dati customer completi
      const customer = await this.getCustomerData(
        data.customerId,
        data.workspaceId
      )
      if (!customer) {
        logger.error(
          `[PUSH-MESSAGING] ❌ Customer ${data.customerId} not found`
        )
        return false
      }

      // 2. Rileva lingua (auto o da parametro) e mappa formato
      const languageMapping: Record<string, string> = {
        IT: "it",
        ENG: "en",
        ESP: "es",
        PRT: "pt",
        FR: "fr",
        DE: "de",
      }

      const rawLanguage = data.customerLanguage || customer.language || "it"
      const language = languageMapping[rawLanguage] || rawLanguage || "it"

      logger.info(
        `[PUSH-MESSAGING] 🌍 Language mapping: ${customer.language} -> ${language} for customer ${customer.name}`
      )

      // 3. Genera messaggio dalla template
      const message = this.generateMessage(data.type, language, {
        ...data.templateData,
        customerName: customer.name,
      })

      // 4. Salva messaggio in chat history prima dell'invio
      const chatSession = await this.ensureChatSession(
        customer.id,
        data.workspaceId
      )

      // 5. 📱 Invio effettivo WhatsApp
      const whatsappResult = await this.sendWhatsAppMessage(
        data.customerPhone,
        message,
        data.workspaceId
      )

      // 6. Salva messaggio con status corretto basato su risultato WhatsApp
      const messageStatus = whatsappResult.success ? "sent" : "failed"
      await this.saveOutboundMessage(
        chatSession.id,
        message,
        data.type,
        messageStatus,
        whatsappResult.messageId
      )

      // 7. 💰 Track usage cost solo per push NON-ORDER (€0.5 per push message)
      // ORDER_CONFIRMED è già tracciato nel cart controller come parte del costo ordine completo (€1.50)
      if (data.type !== PushMessageType.ORDER_CONFIRMED) {
        await this.trackPushCost(data.workspaceId, data.customerId)
      } else {
        logger.info(
          `[PUSH-MESSAGING] 💰 SKIPPING cost tracking for ORDER_CONFIRMED (already included in order cost)`
        )
      }

      if (whatsappResult.success) {
        logger.info(
          `[PUSH-MESSAGING] ✅ Push sent successfully: ${data.type} to ${customer.name}`
        )
        return true
      } else {
        logger.error(`[PUSH-MESSAGING] ❌ Push failed: ${whatsappResult.error}`)
        return false
      }
    } catch (error) {
      logger.error(`[PUSH-MESSAGING] ❌ Error sending push message:`, error)
      return false
    }
  },

  /**
   * 🌍 Genera messaggio dalla template con supporto multilingua
   */
  generateMessage(
    type: PushMessageType,
    language: string,
    templateData: Record<string, any> = {}
  ): string {
    const template = MESSAGE_TEMPLATES[type]
    let message = template[language as keyof MessageTemplate] || template.it

    // Sostituisci placeholder con dati effettivi
    Object.entries(templateData).forEach(([key, value]) => {
      if (value !== undefined) {
        message = message.replace(`{${key}}`, String(value))
      }
    })

    return message
  },

  /**
   * 👤 Ottieni dati customer completi
   */
  async getCustomerData(customerId: string, workspaceId: string) {
    return await prisma.customers.findFirst({
      where: {
        id: customerId,
        workspaceId: workspaceId,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        language: true,
        workspaceId: true,
      },
    })
  },

  /**
   * 💬 Assicura esistenza chat session
   */
  async ensureChatSession(customerId: string, workspaceId: string) {
    let chatSession = await prisma.chatSession.findFirst({
      where: {
        customerId: customerId,
        workspaceId: workspaceId,
        status: "active",
      },
    })

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          customerId: customerId,
          workspaceId: workspaceId,
          status: "active",
          context: {},
        },
      })
    }

    return chatSession
  },

  /**
   * 💾 Salva messaggio outbound in history con status
   */
  async saveOutboundMessage(
    chatSessionId: string,
    content: string,
    pushType: PushMessageType,
    messageStatus: "sent" | "failed" = "sent",
    messageId?: string
  ) {
    await prisma.message.create({
      data: {
        chatSessionId: chatSessionId,
        direction: "OUTBOUND",
        content: content,
        type: "TEXT",
        status: messageStatus,
        aiGenerated: true,
        metadata: {
          source: "push_messaging",
          pushType: pushType,
          timestamp: new Date().toISOString(),
          whatsappMessageId: messageId,
          agentSelected: "CHATBOT_PUSH_MESSAGING",
          sentBy: "AI",
        },
      },
    })

    logger.info(
      `[PUSH-MESSAGING] 💾 Message saved with status: ${messageStatus}${messageId ? `, messageId: ${messageId}` : ""}`
    )
  },

  /**
   * 💰 Traccia costo push message (€0.5)
   */
  async trackPushCost(workspaceId: string, customerId: string) {
    try {
      const PUSH_MESSAGE_COST = config.pushMessaging.price

      await usageService.trackUsage({
        workspaceId: workspaceId,
        clientId: customerId,
        price: PUSH_MESSAGE_COST,
      })

      logger.info(
        `[PUSH-MESSAGING] ✅ Cost tracked: €${PUSH_MESSAGE_COST} for push message`
      )
    } catch (error) {
      logger.error(`[PUSH-MESSAGING] ❌ Error tracking push cost:`, error)
      throw error
    }
  },

  /**
   * 📱 Invio effettivo WhatsApp via Business API o Dev Mode
   */
  async sendWhatsAppMessage(
    phoneNumber: string,
    message: string,
    workspaceId: string
  ) {
    try {
      logger.info(
        `[PUSH-MESSAGING] 📱 Sending WhatsApp message to ${phoneNumber}`
      )

      // Get workspace WhatsApp settings
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
          whatsappApiKey: true,
          whatsappPhoneNumber: true,
        },
      })

      if (
        !workspace ||
        !workspace.whatsappApiKey ||
        !workspace.whatsappPhoneNumber
      ) {
        logger.error(
          `[PUSH-MESSAGING] ❌ WhatsApp settings not configured for workspace ${workspaceId}`
        )
        return { success: false, error: "WhatsApp settings not configured" }
      }

      // 🔧 DEV MODE: Simulate successful sending for development
      if (workspace.whatsappApiKey === "DEV_MODE_SIMULATOR_TOKEN_FOR_TESTING") {
        logger.info(
          `[PUSH-MESSAGING] 🔧 DEV MODE: Simulating WhatsApp message send to ${phoneNumber}`
        )
        logger.info(`[PUSH-MESSAGING] 🔧 DEV MODE: Message content: ${message}`)

        const simulatedMessageId = `dev_msg_${Date.now()}_${Math.random().toString(36).substring(7)}`

        logger.info(
          `[PUSH-MESSAGING] ✅ DEV MODE: Simulated message sent successfully`,
          {
            messageId: simulatedMessageId,
            phoneNumber,
            workspaceId,
            note: "This is a simulated message for development - no real WhatsApp message was sent",
          }
        )

        return {
          success: true,
          messageId: simulatedMessageId,
          status: "sent",
          devMode: true,
        }
      }

      // PRODUCTION MODE: Real WhatsApp API call
      const whatsappApiUrl = `https://graph.facebook.com/v18.0/${workspace.whatsappPhoneNumber}/messages`

      const whatsappPayload = {
        messaging_product: "whatsapp",
        to: phoneNumber.replace("+", ""),
        type: "text",
        text: {
          body: message,
        },
      }

      logger.info(`[PUSH-MESSAGING] 🚀 Calling WhatsApp API: ${whatsappApiUrl}`)

      const response = await fetch(whatsappApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${workspace.whatsappApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(whatsappPayload),
      })

      const responseData = await response.json()

      if (response.ok && responseData.messages?.[0]?.id) {
        logger.info(
          `[PUSH-MESSAGING] ✅ WhatsApp message sent successfully to ${phoneNumber}`,
          {
            messageId: responseData.messages[0].id,
            phoneNumber,
            workspaceId,
          }
        )

        return {
          success: true,
          messageId: responseData.messages[0].id,
          status: "sent",
        }
      } else {
        logger.error(`[PUSH-MESSAGING] ❌ WhatsApp API error:`, responseData)
        return {
          success: false,
          error: responseData.error?.message || "Unknown WhatsApp API error",
          details: responseData,
        }
      }
    } catch (error) {
      logger.error(`[PUSH-MESSAGING] ❌ Error sending WhatsApp message:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  /**
   * 📊 Helper per inviare diversi tipi di push message
   */
  async sendOrderConfirmation(
    customerId: string,
    customerPhone: string,
    workspaceId: string,
    orderCode: string
  ) {
    return await this.sendPushMessage({
      workspaceId,
      customerId,
      customerPhone,
      type: PushMessageType.ORDER_CONFIRMED,
      templateData: { orderCode },
    })
  },

  async sendUserWelcome(
    customerId: string,
    customerPhone: string,
    workspaceId: string
  ) {
    return await this.sendPushMessage({
      workspaceId,
      customerId,
      customerPhone,
      type: PushMessageType.USER_REGISTERED,
    })
  },

  async sendDiscountUpdate(
    customerId: string,
    customerPhone: string,
    workspaceId: string,
    discountPercentage: number
  ) {
    return await this.sendPushMessage({
      workspaceId,
      customerId,
      customerPhone,
      type: PushMessageType.DISCOUNT_UPDATED,
      templateData: { discountPercentage },
    })
  },

  async sendNewOffer(
    customerId: string,
    customerPhone: string,
    workspaceId: string,
    offerPercentage: number,
    categoryName: string,
    offerEndDate: string
  ) {
    return await this.sendPushMessage({
      workspaceId,
      customerId,
      customerPhone,
      type: PushMessageType.NEW_OFFER,
      templateData: { offerPercentage, categoryName, offerEndDate },
    })
  },

  async sendChatbotReactivated(
    customerId: string,
    customerPhone: string,
    workspaceId: string
  ) {
    return await this.sendPushMessage({
      workspaceId,
      customerId,
      customerPhone,
      type: PushMessageType.CHATBOT_REACTIVATED,
    })
  },
}
