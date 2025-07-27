import { Request, Response } from "express"
import { EmailService } from "../../../application/services/email.service"
import { prisma } from "../../../lib/prisma"
import logger from "../../../utils/logger"

export class CheckoutController {
  private emailService = new EmailService()

  /**
   * Validate checkout token and return order data
   */
  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params

      if (!token) {
        res.status(400).json({
          valid: false,
          error: "Token is required",
        })
        return
      }

      // Find token in database (check if exists first)
      const tokenExists = await prisma.secureToken.findFirst({
        where: {
          token,
          type: "checkout",
        },
      })

      if (!tokenExists) {
        res.status(400).json({
          valid: false,
          error: "Token non valido",
          errorType: "INVALID_TOKEN",
        })
        return
      }

      // Check if token was already used
      if (tokenExists.usedAt) {
        res.status(400).json({
          valid: false,
          error: "Link già utilizzato",
          errorType: "ALREADY_USED",
        })
        return
      }

      // Check if token is expired
      if (tokenExists.expiresAt <= new Date()) {
        res.status(400).json({
          valid: false,
          error: "Link scaduto (validità 1 ora)",
          errorType: "EXPIRED_TOKEN",
          expiresAt: tokenExists.expiresAt,
        })
        return
      }

      // Check payload validity
      if (!tokenExists.payload) {
        res.status(400).json({
          valid: false,
          error: "Token corrotto",
          errorType: "CORRUPTED_TOKEN",
        })
        return
      }

      const secureToken = tokenExists

      // Get customer and workspace data
      const payload = secureToken.payload as any
      const customer = await prisma.customers.findFirst({
        where: {
          id: payload.customerId,
          workspaceId: secureToken.workspaceId,
        },
      })

      if (!customer) {
        res.status(400).json({
          valid: false,
          error: "Customer not found",
        })
        return
      }

      logger.info(`[CHECKOUT] Token validated for customer ${customer.id}`)

      res.json({
        valid: true,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          invoiceAddress: customer.invoiceAddress,
        },
        prodotti: payload.prodotti || [],
        workspaceId: secureToken.workspaceId,
      })
    } catch (error) {
      logger.error("[CHECKOUT] Error validating token:", error)
      res.status(500).json({
        valid: false,
        error: "Internal server error",
      })
    }
  }

  /**
   * Submit order and send notifications
   */
  async submitOrder(req: Request, res: Response): Promise<void> {
    try {
      const { token, prodotti, shippingAddress, billingAddress, notes } =
        req.body

      if (!token || !prodotti || !shippingAddress) {
        res.status(400).json({
          success: false,
          error: "Missing required fields",
        })
        return
      }

      // Validate token again with workspace isolation
      const secureToken = await prisma.secureToken.findFirst({
        where: {
          token,
          type: "checkout",
          usedAt: null,
          expiresAt: {
            gt: new Date(),
          },
          // Note: workspaceId will be validated from token payload
        },
      })

      if (!secureToken) {
        res.status(400).json({
          success: false,
          error: "Invalid or expired token",
        })
        return
      }

      const payload = secureToken.payload as any
      const customerId = payload.customerId
      const workspaceId = secureToken.workspaceId

      // Get customer and workspace
      const [customer, workspace] = await Promise.all([
        prisma.customers.findFirst({
          where: { id: customerId, workspaceId },
        }),
        prisma.workspace.findUnique({
          where: { id: workspaceId },
        }),
      ])

      if (!customer || !workspace) {
        res.status(400).json({
          success: false,
          error: "Customer or workspace not found",
        })
        return
      }

      // Calculate total
      const totalAmount = prodotti.reduce(
        (sum: number, item: any) => sum + item.prezzo * item.qty,
        0
      )

      // Generate order code
      const orderCode = await this.generateOrderCode()

      // Create order
      const order = await prisma.orders.create({
        data: {
          orderCode,
          status: "PENDING",
          totalAmount,
          shippingAmount: 0,
          taxAmount: 0,
          shippingAddress,
          billingAddress,
          notes,
          customerId,
          workspaceId,
          items: {
            create: prodotti.map((item: any) => ({
              itemType: "PRODUCT",
              quantity: item.qty,
              unitPrice: item.prezzo,
              totalPrice: item.prezzo * item.qty,
              productVariant: {
                codice: item.codice,
                descrizione: item.descrizione,
              },
            })),
          },
        },
        include: {
          items: true,
        },
      })

      // Mark token as used
      await prisma.secureToken.update({
        where: { id: secureToken.id },
        data: { usedAt: new Date() },
      })

      logger.info(
        `[CHECKOUT] Order created: ${orderCode} for customer ${customerId}`
      )

      // Send notifications
      await this.sendNotifications(order, customer, workspace)

      // Reset customer cart after successful order
      await this.resetCustomerCart(customerId, workspaceId)

      res.json({
        success: true,
        orderId: order.id,
        orderCode: order.orderCode,
      })
    } catch (error) {
      logger.error("[CHECKOUT] Error submitting order:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error",
      })
    }
  }

  /**
   * Generate unique order code
   */
  private async generateOrderCode(): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")

    // Find the last order of today
    const lastOrder = await prisma.orders.findFirst({
      where: {
        orderCode: {
          startsWith: `ORD-${dateStr}-`,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    let sequence = 1
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderCode.split("-")[2])
      sequence = lastSequence + 1
    }

    return `ORD-${dateStr}-${sequence.toString().padStart(3, "0")}`
  }

  /**
   * Send email and WhatsApp notifications
   */
  private async sendNotifications(
    order: any,
    customer: any,
    workspace: any
  ): Promise<void> {
    try {
      // Get admin email from whatsapp settings
      const whatsappSettings = await prisma.whatsappSettings.findFirst({
        where: { workspaceId: workspace.id },
      })

      const adminEmail =
        whatsappSettings?.adminEmail || workspace.notificationEmail

      // Send email to customer
      if (customer.email) {
        await this.sendCustomerEmail(customer.email, order, customer.name)
      }

      // Send email to admin
      if (adminEmail) {
        await this.sendAdminEmail(adminEmail, order, customer)
      }

      // Send WhatsApp message
      await this.sendWhatsAppNotification(
        customer.phone,
        order.orderCode,
        workspace.id
      )

      logger.info(`[CHECKOUT] Notifications sent for order ${order.orderCode}`)
    } catch (error) {
      logger.error("[CHECKOUT] Error sending notifications:", error)
      // Don't throw error - order is already created
    }
  }

  /**
   * Send email to customer
   */
  private async sendCustomerEmail(
    email: string,
    order: any,
    customerName: string
  ): Promise<void> {
    try {
      const emailContent = `
Ciao ${customerName},

Il tuo ordine ${order.orderCode} è stato ricevuto con successo.

Il nostro team ti contatterà il prima possibile per la conferma dell'ordine.

Totale: €${order.totalAmount.toFixed(2)}

Grazie per aver scelto i nostri servizi!

Cordiali saluti,
Il Team
      `.trim()

      const transporter = await this.emailService["transporter"]
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@shopme.com",
        to: email,
        subject: `Ordine Ricevuto - ${order.orderCode}`,
        text: emailContent,
      })

      logger.info(`[CHECKOUT] Customer email sent to ${email}`)
    } catch (error) {
      logger.error("[CHECKOUT] Error sending customer email:", error)
    }
  }

  /**
   * Send email to admin
   */
  private async sendAdminEmail(
    email: string,
    order: any,
    customer: any
  ): Promise<void> {
    try {
      const emailContent = `
Nuovo ordine ricevuto da confermare:

Ordine: ${order.orderCode}
Cliente: ${customer.name}
Email: ${customer.email}
Telefono: ${customer.phone}
Totale: €${order.totalAmount.toFixed(2)}

Prodotti:
${order.items
  .map(
    (item: any) =>
      `- ${item.quantity}x ${item.productVariant?.descrizione || "Prodotto"} (€${item.unitPrice.toFixed(2)})`
  )
  .join("\n")}

Accedi al pannello amministrativo per confermare l'ordine.
      `.trim()

      const transporter = await this.emailService["transporter"]
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@shopme.com",
        to: email,
        subject: `Nuovo Ordine da Confermare - ${order.orderCode}`,
        text: emailContent,
      })

      logger.info(`[CHECKOUT] Admin email sent to ${email}`)
    } catch (error) {
      logger.error("[CHECKOUT] Error sending admin email:", error)
    }
  }

  /**
   * Send WhatsApp notification
   */
  private async sendWhatsAppNotification(
    phoneNumber: string,
    orderCode: string,
    workspaceId: string
  ): Promise<void> {
    try {
      const message = `✅ Ordine numero ${orderCode} preso in consegna! Ti faremo sapere il prima possibile per la conferma.`

      // Find or create chat session
      const customer = await prisma.customers.findFirst({
        where: { phone: phoneNumber, workspaceId },
      })

      if (!customer) {
        logger.error(
          `[CHECKOUT] Customer not found for WhatsApp notification: ${phoneNumber}`
        )
        return
      }

      let chatSession = await prisma.chatSession.findFirst({
        where: {
          customerId: customer.id,
          workspaceId,
          status: "active",
        },
      })

      if (!chatSession) {
        chatSession = await prisma.chatSession.create({
          data: {
            customerId: customer.id,
            workspaceId,
            status: "active",
            context: {},
          },
        })
      }

      // Save outbound message to history
      await prisma.message.create({
        data: {
          chatSessionId: chatSession.id,
          direction: "OUTBOUND",
          content: message,
          type: "TEXT",
          status: "sent",
          aiGenerated: true,
          metadata: {
            source: "checkout_notification",
            orderCode,
          },
        },
      })

      // TODO: Send actual WhatsApp message via API
      // This would require integration with WhatsApp Business API

      logger.info(
        `[CHECKOUT] WhatsApp message saved for ${phoneNumber}: ${orderCode}`
      )
    } catch (error) {
      logger.error("[CHECKOUT] Error sending WhatsApp notification:", error)
    }
  }

  /**
   * Reset customer cart after successful order
   */
  private async resetCustomerCart(
    customerId: string,
    workspaceId: string
  ): Promise<void> {
    try {
      // Find customer cart
      const cart = await prisma.carts.findFirst({
        where: {
          customerId,
          workspaceId,
        },
        include: {
          items: true,
        },
      })

      if (cart) {
        // Delete all cart items
        await prisma.cartItems.deleteMany({
          where: {
            cartId: cart.id,
          },
        })

        logger.info(
          `[CHECKOUT] Cart reset for customer ${customerId} - ${cart.items.length} items removed`
        )
      } else {
        logger.info(
          `[CHECKOUT] No cart found for customer ${customerId} - nothing to reset`
        )
      }
    } catch (error) {
      logger.error("[CHECKOUT] Error resetting customer cart:", error)
      // Don't throw error - order is already created successfully
    }
  }
}
