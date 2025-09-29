import { Request, Response } from "express"
import logger from "../../../utils/logger"
import { pushMessagingService } from "../../../services/push-messaging.service"
import { prisma } from "../../../lib/prisma"

/**
 * 📱 PUSH MESSAGING CONTROLLER
 * 
 * Controller per gestire tutti i tipi di push messaging
 * con supporto per i nuovi use cases:
 * - Nuovo utente registrato
 * - Sconto aggiornato
 * - Nuova offerta
 * - Chatbot riattivato
 * 
 * @author Andrea Gelso
 */

export class PushMessagingController {

  /**
   * 👋 Invia push di benvenuto per nuovo utente registrato
   */
  async sendUserWelcome(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, workspaceId } = req.body

      logger.info(`[PUSH-CONTROLLER] 👋 Sending welcome push for customer ${customerId}`)

      // Validate input
      if (!customerId || !workspaceId) {
        res.status(400).json({
          success: false,
          error: "customerId and workspaceId are required"
        })
        return
      }

      // Get customer data
      const customer = await prisma.customers.findFirst({
        where: { id: customerId, workspaceId },
        select: { id: true, phone: true, name: true }
      })

      if (!customer || !customer.phone) {
        res.status(404).json({
          success: false,
          error: "Customer not found or missing phone number"
        })
        return
      }

      // Send welcome push
      const success = await pushMessagingService.sendUserWelcome(
        customerId,
        customer.phone,
        workspaceId
      )

      res.json({
        success: success,
        message: success 
          ? `Welcome push sent successfully to ${customer.name}` 
          : "Failed to send welcome push",
        cost: "€0.50"
      })

    } catch (error) {
      logger.error("[PUSH-CONTROLLER] Error sending user welcome push:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error"
      })
    }
  }

  /**
   * 💸 Invia push per sconto aggiornato
   */
  async sendDiscountUpdate(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, discountPercentage, customerIds } = req.body

      logger.info(`[PUSH-CONTROLLER] 💸 Sending discount update push: ${discountPercentage}%`)

      // Validate input
      if (!workspaceId || !discountPercentage) {
        res.status(400).json({
          success: false,
          error: "workspaceId and discountPercentage are required"
        })
        return
      }

      // Get customers to notify
      const customers = await prisma.customers.findMany({
        where: {
          workspaceId: workspaceId,
          ...(customerIds ? { id: { in: customerIds } } : {}),
          phone: { not: null }
        },
        select: { id: true, phone: true, name: true }
      })

      const results = []
      for (const customer of customers) {
        if (customer.phone) {
          const success = await pushMessagingService.sendDiscountUpdate(
            customer.id,
            customer.phone,
            workspaceId,
            discountPercentage
          )
          results.push({ 
            customerId: customer.id, 
            customerName: customer.name,
            success 
          })
        }
      }

      res.json({
        success: true,
        message: `Discount update push sent to ${customers.length} customers`,
        results: results,
        totalCost: `€${(customers.length * 0.50).toFixed(2)}`
      })

    } catch (error) {
      logger.error("[PUSH-CONTROLLER] Error sending discount update push:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error"
      })
    }
  }

  /**
   * 🎯 Invia push per nuova offerta
   */
  async sendNewOffer(req: Request, res: Response): Promise<void> {
    try {
      const { 
        workspaceId, 
        offerPercentage, 
        categoryName, 
        offerEndDate,
        customerIds 
      } = req.body

      logger.info(`[PUSH-CONTROLLER] 🎯 Sending new offer push: ${offerPercentage}% on ${categoryName}`)

      // Validate input
      if (!workspaceId || !offerPercentage || !categoryName || !offerEndDate) {
        res.status(400).json({
          success: false,
          error: "workspaceId, offerPercentage, categoryName and offerEndDate are required"
        })
        return
      }

      // Get customers to notify
      const customers = await prisma.customers.findMany({
        where: {
          workspaceId: workspaceId,
          ...(customerIds ? { id: { in: customerIds } } : {}),
          phone: { not: null }
        },
        select: { id: true, phone: true, name: true }
      })

      const results = []
      for (const customer of customers) {
        if (customer.phone) {
          const success = await pushMessagingService.sendNewOffer(
            customer.id,
            customer.phone,
            workspaceId,
            offerPercentage,
            categoryName,
            offerEndDate
          )
          results.push({ 
            customerId: customer.id, 
            customerName: customer.name,
            success 
          })
        }
      }

      res.json({
        success: true,
        message: `New offer push sent to ${customers.length} customers`,
        results: results,
        totalCost: `€${(customers.length * 0.50).toFixed(2)}`
      })

    } catch (error) {
      logger.error("[PUSH-CONTROLLER] Error sending new offer push:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error"
      })
    }
  }

  /**
   * 🤖 Invia push per chatbot riattivato
   */
  async sendChatbotReactivated(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, customerIds } = req.body

      logger.info(`[PUSH-CONTROLLER] 🤖 Sending chatbot reactivated push`)

      // Validate input
      if (!workspaceId) {
        res.status(400).json({
          success: false,
          error: "workspaceId is required"
        })
        return
      }

      // Get customers to notify (recent active customers)
      const customers = await prisma.customers.findMany({
        where: {
          workspaceId: workspaceId,
          ...(customerIds ? { id: { in: customerIds } } : {}),
          phone: { not: null },
          // Solo clienti con sessioni attive negli ultimi 7 giorni
          chatSessions: {
            some: {
              updatedAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          }
        },
        select: { id: true, phone: true, name: true }
      })

      const results = []
      for (const customer of customers) {
        if (customer.phone) {
          const success = await pushMessagingService.sendChatbotReactivated(
            customer.id,
            customer.phone,
            workspaceId
          )
          results.push({ 
            customerId: customer.id, 
            customerName: customer.name,
            success 
          })
        }
      }

      res.json({
        success: true,
        message: `Chatbot reactivated push sent to ${customers.length} active customers`,
        results: results,
        totalCost: `€${(customers.length * 0.50).toFixed(2)}`
      })

    } catch (error) {
      logger.error("[PUSH-CONTROLLER] Error sending chatbot reactivated push:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error"
      })
    }
  }

  /**
   * 📊 Test push messaging service
   */
  async testPushMessage(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, workspaceId, type, templateData } = req.body

      if (!customerId || !workspaceId || !type) {
        res.status(400).json({
          success: false,
          error: "customerId, workspaceId and type are required"
        })
        return
      }

      const customer = await prisma.customers.findFirst({
        where: { id: customerId, workspaceId },
        select: { id: true, phone: true, name: true }
      })

      if (!customer || !customer.phone) {
        res.status(404).json({
          success: false,
          error: "Customer not found or missing phone number"
        })
        return
      }

      const success = await pushMessagingService.sendPushMessage({
        workspaceId,
        customerId,
        customerPhone: customer.phone,
        type: type,
        templateData: templateData
      })

      res.json({
        success: success,
        message: `Test push message sent: ${type}`,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone
        },
        cost: "€0.50"
      })

    } catch (error) {
      logger.error("[PUSH-CONTROLLER] Error sending test push message:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error"
      })
    }
  }
}