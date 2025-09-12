import { Request, Response } from "express"
import { EmailService } from "../../../application/services/email.service"
import { PriceCalculationService } from "../../../application/services/price-calculation.service"
import { SecureTokenService } from "../../../application/services/secure-token.service"
import { prisma } from "../../../lib/prisma"
import logger from "../../../utils/logger"

export class CheckoutController {
  private emailService = new EmailService()
  private secureTokenService = new SecureTokenService()
  private priceCalculationService = new PriceCalculationService(prisma)

  /**
   * Validate checkout token and return order data
   */
  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.query.token as string

      if (!token) {
        res.status(400).json({
          valid: false,
          error: "Token is required",
        })
        return
      }

      // Use SecureTokenService for unified token validation
      const validation = await this.secureTokenService.validateToken(token, 'checkout')
      
      if (!validation.valid) {
        res.status(400).json({
          valid: false,
          error: "Token non valido o scaduto",
          errorType: "INVALID_TOKEN",
        })
        return
      }

      const secureToken = validation.data
      
      // Check payload validity
      if (!validation.payload) {
        res.status(400).json({
          valid: false,
          error: "Token corrotto",
          errorType: "CORRUPTED_TOKEN",
        })
        return
      }

      // Get customer and workspace data
      const payload = validation.payload as any
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

      // Get customer cart products from database
      const cart = await prisma.carts.findFirst({
        where: {
          customerId: customer.id,
          workspaceId: secureToken.workspaceId
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Calculate prices with discounts applied
      const productIds = cart?.items.map(item => item.productId) || [];
      const priceResult = await this.priceCalculationService.calculatePricesWithDiscounts(
        secureToken.workspaceId,
        productIds,
        customer.discount || 0
      );

      // Create a map of product prices with discounts
      const productPriceMap = new Map();
      priceResult.products.forEach(product => {
        productPriceMap.set(product.id, {
          finalPrice: product.finalPrice || product.price,
          originalPrice: product.originalPrice,
          appliedDiscount: product.appliedDiscount || 0,
          discountSource: product.discountSource,
          discountName: product.discountName
        });
      });

      // Calculate cart totals with discounted prices
      let totalAmount = 0;
      const cartItems = cart?.items.map(item => {
        const priceInfo = productPriceMap.get(item.productId) || {
          finalPrice: item.product.price,
          originalPrice: item.product.price,
          appliedDiscount: 0,
          discountSource: undefined,
          discountName: undefined
        };
        
        const itemTotal = priceInfo.finalPrice * item.quantity;
        totalAmount += itemTotal;
        
        return {
          id: item.id,
          productId: item.productId,
          codice: item.product.ProductCode || item.product.sku || 'N/A',
          descrizione: item.product.name,
          prezzo: priceInfo.finalPrice,
          prezzoOriginale: priceInfo.originalPrice,
          scontoApplicato: priceInfo.appliedDiscount,
          fonteSconto: priceInfo.discountSource,
          nomeSconto: priceInfo.discountName,
          qty: item.quantity,
          total: itemTotal
        };
      }) || [];

      res.json({
        valid: true,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          invoiceAddress: customer.invoiceAddress,
          language: customer.language,
        },
        prodotti: cartItems,
        totalAmount: totalAmount,
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

      // Validate token again using SecureTokenService
      const validation = await this.secureTokenService.validateToken(token, 'checkout')
      
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          error: "Invalid or expired token",
        })
        return
      }
      
      const secureToken = validation.data

      const payload = validation.payload as any
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

      // Find products by code to get productId
      const productCodes = prodotti.map((item: any) => item.codice)
      const products = await prisma.products.findMany({
        where: {
          ProductCode: { in: productCodes },
          workspaceId: workspaceId
        }
      })
      
      // Create a map of productCode -> productId
      const productMap = new Map()
      products.forEach(product => {
        productMap.set(product.ProductCode, product.id)
      })

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
              productId: productMap.get(item.codice), // ✅ CORRECT: Save productId from productCode lookup
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

      // 🎯 TASK: Auto-update customer address in database
      try {
        // Validate shipping address fields
        const hasValidShippingAddress = shippingAddress && 
          shippingAddress.firstName && 
          shippingAddress.lastName && 
          shippingAddress.address && 
          shippingAddress.city && 
          shippingAddress.postalCode;

        if (hasValidShippingAddress) {
          // Create structured address object for customer
          const customerAddress = {
            name: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
            street: shippingAddress.address,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode,
            province: shippingAddress.province || "",
            country: shippingAddress.country || "Italy",
            phone: shippingAddress.phone || customer.phone || ""
          };

          // Update customer address in database
          await prisma.customers.update({
            where: {
              id: customerId,
              workspaceId: workspaceId
            },
            data: {
              address: JSON.stringify(customerAddress),
              updatedAt: new Date()
            }
          });

          logger.info(`[CHECKOUT] Auto-updated customer address for ${customerId}:`, customerAddress);
        } else {
          logger.warn(`[CHECKOUT] Invalid shipping address provided for customer ${customerId}, skipping auto-update`);
        }

        // Auto-update billing address if provided and different from shipping
        if (billingAddress && !billingAddress.sameAsShipping) {
          const hasValidBillingAddress = billingAddress.firstName && 
            billingAddress.lastName && 
            billingAddress.address && 
            billingAddress.city && 
            billingAddress.postalCode;

          if (hasValidBillingAddress) {
            const customerInvoiceAddress = {
              firstName: billingAddress.firstName,
              lastName: billingAddress.lastName,
              address: billingAddress.address,
              city: billingAddress.city,
              postalCode: billingAddress.postalCode,
              province: billingAddress.province || "",
              country: billingAddress.country || "Italy",
              phone: billingAddress.phone || customer.phone || ""
            };

            // Update customer invoice address in database
            await prisma.customers.update({
              where: {
                id: customerId,
                workspaceId: workspaceId
              },
              data: {
                invoiceAddress: customerInvoiceAddress,
                updatedAt: new Date()
              }
            });

            logger.info(`[CHECKOUT] Auto-updated customer invoice address for ${customerId}:`, customerInvoiceAddress);
          }
        }
      } catch (addressUpdateError) {
        // Don't fail the order if address update fails
        logger.error(`[CHECKOUT] Failed to auto-update customer address for ${customerId}:`, addressUpdateError);
      }

      // Token remains valid for reuse until expiration

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
   * Generate unique order code - 5 uppercase letters
   */
  private async generateOrderCode(): Promise<string> {
    // Generate 5 random uppercase letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let orderCode = ''
    
    // Generate unique 5-letter code
    let attempts = 0
    const maxAttempts = 10
    
    do {
      orderCode = ''
      for (let i = 0; i < 5; i++) {
        orderCode += letters.charAt(Math.floor(Math.random() * letters.length))
      }
      
      // Check if this code already exists
      const existingOrder = await prisma.orders.findFirst({
        where: {
          orderCode: orderCode,
        },
      })
      
      if (!existingOrder) {
        break // Unique code found
      }
      
      attempts++
    } while (attempts < maxAttempts)
    
    // If we couldn't find a unique code after maxAttempts, add timestamp suffix
    if (attempts >= maxAttempts) {
      const timestamp = Date.now().toString().slice(-2) // Last 2 digits of timestamp
      orderCode = orderCode.slice(0, 3) + timestamp
    }
    
    return orderCode
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
