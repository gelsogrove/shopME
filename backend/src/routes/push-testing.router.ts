/**
 * 🧪 PUSH MESSAGING ADMIN TEST ENDPOINTS - SECURED
 *
 * ⚠️  SECURITY: Solo ADMIN/OWNER possono accedere a questi endpoint
 * ⚠️  Rate limiting attivo per prevenire abusi
 * ⚠️  Endpoint per testare il sistema di push messaging dall'admin dashboard
 */

import { Request, Response, Router } from "express"
import { authMiddleware } from "../interfaces/http/middlewares/auth.middleware"
import { pushRateLimitMiddleware } from "../interfaces/http/middlewares/push-rate-limit.middleware"
import {
  hasRole,
  UserRole,
} from "../interfaces/http/middlewares/rbac.middleware"
import { prisma } from "../lib/prisma"
import {
  PushMessageType,
  pushMessagingService,
} from "../services/push-messaging.service"
import logger from "../utils/logger"

export function createPushTestingRouter(): Router {
  const router = Router()

  // 🔒 SECURITY: Richiede autenticazione E ruolo ADMIN/OWNER E rate limiting
  router.use(authMiddleware)
  router.use(hasRole(UserRole.ADMIN)) // Solo ADMIN o superiore
  router.use(pushRateLimitMiddleware) // Rate limiting anche per admin (50/min)

  /**
   * 🧪 GET /admin/push-test - Test push messaging system
   */
  router.get("/push-test", async (req: Request, res: Response) => {
    try {
      const { customerId, workspaceId, type, templateData } = req.query

      if (!customerId || !workspaceId) {
        return res.status(400).json({
          success: false,
          error: "customerId and workspaceId are required",
        })
      }

      // Get customer data
      const customer = await prisma.customers.findFirst({
        where: {
          id: customerId as string,
          workspaceId: workspaceId as string,
        },
        select: { id: true, phone: true, name: true, language: true },
      })

      if (!customer || !customer.phone) {
        return res.status(404).json({
          success: false,
          error: "Customer not found or missing phone number",
        })
      }

      let result = false
      let messageType =
        (type as PushMessageType) || PushMessageType.USER_REGISTERED

      // Send appropriate push message
      switch (messageType) {
        case PushMessageType.ORDER_CONFIRMED:
          result = await pushMessagingService.sendOrderConfirmation(
            customer.id,
            customer.phone,
            workspaceId as string,
            "TEST-ORDER-001"
          )
          break

        case PushMessageType.USER_REGISTERED:
          result = await pushMessagingService.sendUserWelcome(
            customer.id,
            customer.phone,
            workspaceId as string
          )
          break

        case PushMessageType.DISCOUNT_UPDATED:
          result = await pushMessagingService.sendDiscountUpdate(
            customer.id,
            customer.phone,
            workspaceId as string,
            20
          )
          break

        case PushMessageType.NEW_OFFER:
          result = await pushMessagingService.sendNewOffer(
            customer.id,
            customer.phone,
            workspaceId as string,
            25,
            "Test Category",
            "31/12/2024"
          )
          break

        case PushMessageType.CHATBOT_REACTIVATED:
          result = await pushMessagingService.sendChatbotReactivated(
            customer.id,
            customer.phone,
            workspaceId as string
          )
          break

        default:
          result = await pushMessagingService.sendPushMessage({
            workspaceId: workspaceId as string,
            customerId: customer.id,
            customerPhone: customer.phone,
            type: messageType,
            templateData: templateData
              ? JSON.parse(templateData as string)
              : {},
          })
      }

      res.json({
        success: true,
        result: result,
        message: `Test push message sent: ${messageType}`,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          language: customer.language,
        },
        cost: "€0.50",
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logger.error("[PUSH-TEST] Error in push test endpoint:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error during push test",
      })
    }
  })

  /**
   * 📊 GET /admin/push-stats - Get push messaging statistics
   */
  router.get("/push-stats", async (req: Request, res: Response) => {
    try {
      const { workspaceId, days = 30 } = req.query

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          error: "workspaceId is required",
        })
      }

      const startDate = new Date(
        Date.now() - Number(days) * 24 * 60 * 60 * 1000
      )

      // Get push message usage records (€0.50 each)
      const pushUsage = await prisma.usage.findMany({
        where: {
          workspaceId: workspaceId as string,
          price: 0.5, // Push message cost
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          customer: {
            select: { name: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      // Get recent push messages from message history
      const recentMessages = await prisma.message.findMany({
        where: {
          chatSession: {
            workspaceId: workspaceId as string,
          },
          direction: "OUTBOUND",
          metadata: {
            path: ["source"],
            equals: "push_messaging",
          },
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          chatSession: {
            include: {
              customer: {
                select: { name: true, phone: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      })

      const totalPushMessages = pushUsage.length
      const totalCost = totalPushMessages * 0.5
      const averageDailyCost = totalCost / Number(days)

      // Group by push type
      const messagesByType = recentMessages.reduce(
        (acc, msg) => {
          const metadata = msg.metadata as any
          const pushType = metadata?.pushType || "UNKNOWN"
          acc[pushType] = (acc[pushType] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      res.json({
        success: true,
        stats: {
          totalPushMessages,
          totalCost: `€${totalCost.toFixed(2)}`,
          averageDailyCost: `€${averageDailyCost.toFixed(2)}`,
          period: `Last ${days} days`,
          messagesByType,
          recentMessages: recentMessages.map((msg) => ({
            id: msg.id,
            content:
              msg.content.substring(0, 100) +
              (msg.content.length > 100 ? "..." : ""),
            customer: msg.chatSession.customer.name,
            phone: msg.chatSession.customer.phone,
            pushType: (msg.metadata as any)?.pushType,
            timestamp: msg.createdAt,
          })),
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logger.error("[PUSH-STATS] Error in push stats endpoint:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error getting push stats",
      })
    }
  })

  /**
   * 🌍 GET /admin/push-preview - Preview message in different languages
   */
  router.get("/push-preview", async (req: Request, res: Response) => {
    try {
      const { type, customerName = "Test Customer", templateData } = req.query

      const messageType =
        (type as PushMessageType) || PushMessageType.USER_REGISTERED
      const languages = ["it", "en", "es", "fr", "de"]

      const data = {
        customerName: customerName as string,
        orderCode: "TEST-001",
        discountPercentage: 15,
        offerPercentage: 25,
        categoryName: "Test Category",
        offerEndDate: "31/12/2024",
        ...((templateData ? JSON.parse(templateData as string) : {}) as Record<
          string,
          any
        >),
      }

      const previews = languages.map((lang) => ({
        language: lang,
        message: pushMessagingService.generateMessage(messageType, lang, data),
      }))

      res.json({
        success: true,
        messageType,
        previews,
        templateData: data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logger.error("[PUSH-PREVIEW] Error in push preview endpoint:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error generating preview",
      })
    }
  })

  return router
}
