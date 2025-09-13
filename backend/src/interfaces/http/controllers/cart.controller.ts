import { Request, Response } from "express"
import { SecureTokenService } from "../../../application/services/secure-token.service"
import { prisma } from "../../../lib/prisma"
import logger from "../../../utils/logger"

export class CartController {
  private secureTokenService = new SecureTokenService()

  /**
   * 🎯 TASK: Clean up orphaned cart items (items with missing products)
   */
  private async cleanupOrphanedCartItems(workspaceId: string): Promise<void> {
    try {
      // Find cart items that reference non-existent products
      const orphanedItems = await prisma.cartItems.findMany({
        where: {
          cart: {
            workspaceId: workspaceId
          },
          product: null
        },
        include: {
          cart: true
        }
      })

      if (orphanedItems.length > 0) {
        console.warn(`🧹 Found ${orphanedItems.length} orphaned cart items in workspace ${workspaceId}`)
        
        // Delete orphaned items
        await prisma.cartItems.deleteMany({
          where: {
            id: {
              in: orphanedItems.map(item => item.id)
            }
          }
        })

        console.log(`🧹 Cleaned up ${orphanedItems.length} orphaned cart items`)
      }
    } catch (error) {
      console.error('❌ Error cleaning up orphaned cart items:', error)
    }
  }

  /**
   * 🆕 Generate a new cart token for public access
   */
  async generateToken(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, workspaceId, expiresInMinutes = 60 } = req.body

      if (!customerId || !workspaceId) {
        res.status(400).json({
          success: false,
          error: "customerId and workspaceId are required"
        })
        return
      }

      // Verify customer exists
      const customer = await prisma.customers.findFirst({
        where: {
          id: customerId,
          workspaceId: workspaceId,
          isActive: true
        }
      })

      if (!customer) {
        res.status(400).json({
          success: false,
          error: "Customer not found"
        })
        return
      }

      // Get or create cart for customer
      let cart = await prisma.carts.findFirst({
        where: {
          customerId: customerId,
          workspaceId: workspaceId
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      if (!cart) {
        cart = await prisma.carts.create({
          data: {
            customerId: customerId,
            workspaceId: workspaceId
          },
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        })
      }

      // Calculate total amount
      const totalAmount = cart.items.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity)
      }, 0)

      // Generate token
      const tokenData = {
        customerId: customer.id,
        cartId: cart.id,
        items: cart.items,
        totalAmount: totalAmount,
        currency: customer.currency || 'EUR',
        createdAt: new Date().toISOString()
      }

      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)
      
      const token = await this.secureTokenService.createToken(
        'cart',
        workspaceId,
        tokenData,
        `${expiresInMinutes}m`,
        undefined,
        undefined,
        undefined,
        customer.id
      )

      logger.info(`[CART] Token generated for customer ${customer.id}, cart ${cart.id}`)

      res.json({
        success: true,
        token: token,
        expiresAt: expiresAt.toISOString(),
        cartId: cart.id,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email
        }
      })

    } catch (error) {
      logger.error("[CART] Error generating token:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error"
      })
    }
  }

  /**
   * Get cart contents by token
   */
  async getCartByToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.params.token

      const validation = await this.secureTokenService.validateToken(token) // 🚀 KISS: Solo esistenza + non scaduto
      
      if (!validation.valid || !validation.payload) {
        res.status(400).json({
          success: false,
          error: "Invalid or expired token"
        })
        return
      }

      const payload = validation.payload as any
      
      // 🎯 TASK: Clean up orphaned cart items before retrieving cart
      await this.cleanupOrphanedCartItems(validation.data.workspaceId)
      
      // Get updated cart data from database
      const cart = await prisma.carts.findFirst({
        where: {
          id: payload.cartId,
          customerId: payload.customerId,
          workspaceId: validation.data.workspaceId
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true
        }
      })

      if (!cart) {
        res.status(400).json({
          success: false,
          error: "Cart not found"
        })
        return
      }

      // 🚀 KISS: Apply same price calculation logic as viewCart (Cloud Function)
      const { PriceCalculationService } = await import('../../../application/services/price-calculation.service')
      const priceService = new PriceCalculationService(prisma)
      
      // Get customer discount
      const customerDiscount = cart.customer?.discount || 0
      
      // Calculate updated totals with discounts
      let totalAmount = 0
      const items = []
      
      for (const item of cart.items) {
        // 🎯 TASK: Handle missing product gracefully
        if (!item.product) {
          console.warn(`⚠️ Cart item ${item.id} has missing product (productId: ${item.productId})`)
          items.push({
            id: item.id,
            type: 'product',
            productId: item.productId,
            productCode: 'N/A',
            name: `Product ${item.productId} (Not Found)`,
            originalPrice: 0,
            finalPrice: 0,
            discountAmount: 0,
            appliedDiscount: 0,
            quantity: item.quantity,
            total: 0
          })
          continue
        }

        // 🚀 KISS: Apply same discount calculation as viewCart
        const itemPrices = await priceService.calculatePricesWithDiscounts(
          validation.data.workspaceId,
          [item.productId],
          customerDiscount
        )
        
        const originalPrice = item.product.price || 0
        const finalPrice = itemPrices.products[0]?.finalPrice || originalPrice
        const discountInfo = itemPrices.products[0]
        const appliedDiscount = discountInfo?.appliedDiscount || 0
        const discountAmount = appliedDiscount > 0 ? (originalPrice * appliedDiscount / 100) : 0
        const itemTotal = finalPrice * item.quantity
        totalAmount += itemTotal

        items.push({
          id: item.id,
          type: 'product',
          productId: item.productId,
          productCode: item.product.ProductCode || item.productId,
          name: item.product.name || `Product ${item.productId}`,
          originalPrice: originalPrice,
          finalPrice: finalPrice,
          discountAmount: discountAmount,
          appliedDiscount: appliedDiscount,
          quantity: item.quantity,
          total: itemTotal
        })
      }

      // 🚀 KISS: Return format compatible with CheckoutPage frontend
      res.json({
        success: true,
        data: {
          id: cart.id,
          customerId: cart.customerId,
          workspaceId: validation.data.workspaceId,
          items,
          totalItems: items.length,
          subtotal: totalAmount,
          totalDiscount: 0, // TODO: Calculate if needed
          finalTotal: totalAmount,
          lastUpdated: cart.updatedAt,
          createdAt: cart.createdAt
        },
        // 🎯 Frontend expects these fields for CheckoutPage compatibility
        customer: {
          id: cart.customer.id,
          name: cart.customer.name,
          email: cart.customer.email,
          phone: cart.customer.phone,
          address: cart.customer.address // Include address for frontend
        },
        prodotti: items.map(item => ({
          codice: item.productCode, // 🎯 Use product code, not ID
          descrizione: item.name,
          quantita: item.quantity,
          prezzo: item.originalPrice,
          prezzoScontato: item.finalPrice,
          sconto: item.appliedDiscount,
          totale: item.total
        }))
      })

    } catch (error) {
      logger.error("[CART] Error getting cart by token:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error"
      })
    }
  }

  /**
   * Add item to cart by token
   */
  async addItemToCart(req: Request, res: Response): Promise<void> {
    try {
      const token = req.params.token
      const { productId, quantity = 1 } = req.body

      if (!productId) {
        res.status(400).json({
          success: false,
          error: "productId is required"
        })
        return
      }

      const validation = await this.secureTokenService.validateToken(token) // 🚀 KISS: Solo esistenza + non scaduto
      
      if (!validation.valid || !validation.payload) {
        res.status(400).json({
          success: false,
          error: "Invalid or expired token"
        })
        return
      }

      const payload = validation.payload as any
      
      // Get cart
      const cart = await prisma.carts.findFirst({
        where: {
          id: payload.cartId,
          customerId: payload.customerId,
          workspaceId: validation.data.workspaceId
        }
      })

      if (!cart) {
        res.status(400).json({
          success: false,
          error: "Cart not found"
        })
        return
      }

      // Verify product exists
      const product = await prisma.products.findFirst({
        where: {
          id: productId,
          workspaceId: validation.data.workspaceId,
          isActive: true
        }
      })

      if (!product) {
        res.status(400).json({
          success: false,
          error: "Product not found"
        })
        return
      }

      // Check if item already exists in cart
      const existingCartItem = await prisma.cartItems.findFirst({
        where: {
          cartId: cart.id,
          productId: productId
        }
      })

      let cartItem
      if (existingCartItem) {
        // Update quantity
        cartItem = await prisma.cartItems.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity + quantity
          },
          include: {
            product: true
          }
        })
      } else {
        // Create new cart item
        cartItem = await prisma.cartItems.create({
          data: {
            cartId: cart.id,
            productId: productId,
            quantity
          },
          include: {
            product: true
          }
        })
      }

      // Calculate cart totals
      const cartWithItems = await prisma.carts.findFirst({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      const totalAmount = cartWithItems!.items.reduce((sum, item) => {
        // 🎯 TASK: Handle missing product gracefully
        if (!item.product) {
          console.warn(`⚠️ Cart item ${item.id} has missing product (productId: ${item.productId})`)
          return sum
        }
        return sum + ((item.product.price || 0) * item.quantity)
      }, 0)

      logger.info(`[CART] Item added to cart ${cart.id} via token`)

      res.json({
        success: true,
        cartItem: {
          id: cartItem.id,
          type: 'product',
          name: cartItem.product?.name || `Product ${cartItem.productId}`,
          price: cartItem.product?.price || 0,
          quantity: cartItem.quantity,
          total: (cartItem.product?.price || 0) * cartItem.quantity
        },
        cart: {
          totalAmount: totalAmount,
          itemCount: cartWithItems!.items.length
        }
      })

    } catch (error) {
      logger.error("[CART] Error adding item to cart:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error"
      })
    }
  }

  /**
   * Update cart item by token
   */
  async updateCartItem(req: Request, res: Response): Promise<void> {
    try {
      const token = req.params.token
      const itemId = req.params.itemId
      const { quantity } = req.body

      if (quantity === undefined) {
        res.status(400).json({
          success: false,
          error: "quantity is required"
        })
        return
      }

      const validation = await this.secureTokenService.validateToken(token) // 🚀 KISS: Solo esistenza + non scaduto
      
      if (!validation.valid || !validation.payload) {
        res.status(400).json({
          success: false,
          error: "Invalid or expired token"
        })
        return
      }

      const payload = validation.payload as any

      // Verify cart item belongs to this cart
      const cartItem = await prisma.cartItems.findFirst({
        where: {
          id: itemId,
          cart: {
            id: payload.cartId,
            customerId: payload.customerId,
            workspaceId: validation.data.workspaceId
          }
        },
        include: {
          product: true
        }
      })

      if (!cartItem) {
        res.status(400).json({
          success: false,
          error: "Cart item not found"
        })
        return
      }

      // Update cart item
      const updatedCartItem = await prisma.cartItems.update({
        where: { id: itemId },
        data: { quantity },
        include: {
          product: true
        }
      })

      // Calculate cart totals
      const cartWithItems = await prisma.carts.findFirst({
        where: { id: payload.cartId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      const totalAmount = cartWithItems!.items.reduce((sum, item) => {
        // 🎯 TASK: Handle missing product gracefully
        if (!item.product) {
          console.warn(`⚠️ Cart item ${item.id} has missing product (productId: ${item.productId})`)
          return sum
        }
        return sum + ((item.product.price || 0) * item.quantity)
      }, 0)

      logger.info(`[CART] Item ${itemId} updated in cart ${payload.cartId} via token`)

      res.json({
        success: true,
        cartItem: {
          id: updatedCartItem.id,
          type: 'product',
          name: updatedCartItem.product?.name || `Product ${updatedCartItem.productId}`,
          price: updatedCartItem.product?.price || 0,
          quantity: updatedCartItem.quantity,
          total: (updatedCartItem.product?.price || 0) * updatedCartItem.quantity
        },
        cart: {
          totalAmount: totalAmount,
          itemCount: cartWithItems!.items.length
        }
      })

    } catch (error) {
      logger.error("[CART] Error updating cart item:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error"
      })
    }
  }

  /**
   * Remove item from cart by token
   */
  async removeCartItem(req: Request, res: Response): Promise<void> {
    try {
      const token = req.params.token
      const itemId = req.params.itemId

      const validation = await this.secureTokenService.validateToken(token) // 🚀 KISS: Solo esistenza + non scaduto
      
      if (!validation.valid || !validation.payload) {
        res.status(400).json({
          success: false,
          error: "Invalid or expired token"
        })
        return
      }

      const payload = validation.payload as any

      // Verify cart item belongs to this cart
      const cartItem = await prisma.cartItems.findFirst({
        where: {
          id: itemId,
          cart: {
            id: payload.cartId,
            customerId: payload.customerId,
            workspaceId: validation.data.workspaceId
          }
        }
      })

      if (!cartItem) {
        res.status(400).json({
          success: false,
          error: "Cart item not found"
        })
        return
      }

      // Remove cart item
      await prisma.cartItems.delete({
        where: { id: itemId }
      })

      // Calculate cart totals
      const cartWithItems = await prisma.carts.findFirst({
        where: { id: payload.cartId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      const totalAmount = cartWithItems!.items.reduce((sum, item) => {
        // 🎯 TASK: Handle missing product gracefully
        if (!item.product) {
          console.warn(`⚠️ Cart item ${item.id} has missing product (productId: ${item.productId})`)
          return sum
        }
        return sum + ((item.product.price || 0) * item.quantity)
      }, 0)

      logger.info(`[CART] Item ${itemId} removed from cart ${payload.cartId} via token`)

      res.json({
        success: true,
        message: "Item removed from cart",
        cart: {
          totalAmount: totalAmount,
          itemCount: cartWithItems!.items.length
        }
      })

    } catch (error) {
      logger.error("[CART] Error removing cart item:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error"
      })
    }
  }

  /**
   * Checkout cart by token
   */
  async checkoutByToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.params.token
      const { shippingAddress, paymentMethod = 'CASH' } = req.body

      const validation = await this.secureTokenService.validateToken(token) // 🚀 KISS: Solo esistenza + non scaduto
      
      if (!validation.valid || !validation.payload) {
        res.status(400).json({
          success: false,
          error: "Invalid or expired token"
        })
        return
      }

      const payload = validation.payload as any

      // Get cart with items
      const cart = await prisma.carts.findFirst({
        where: {
          id: payload.cartId,
          customerId: payload.customerId,
          workspaceId: validation.data.workspaceId
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true
        }
      })

      if (!cart || cart.items.length === 0) {
        res.status(400).json({
          success: false,
          error: "Cart is empty or not found"
        })
        return
      }

      const totalAmount = cart.items.reduce((sum, item) => {
        // 🎯 TASK: Handle missing product gracefully
        if (!item.product) {
          console.warn(`⚠️ Cart item ${item.id} has missing product (productId: ${item.productId})`)
          return sum
        }
        return sum + ((item.product.price || 0) * item.quantity)
      }, 0)

      // Generate unique order code - 5 uppercase letters
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      let orderCode = ''
      for (let i = 0; i < 5; i++) {
        orderCode += letters.charAt(Math.floor(Math.random() * letters.length))
      }

      // Create order
      const order = await prisma.orders.create({
        data: {
          orderCode,
          customerId: cart.customerId,
          workspaceId: validation.data.workspaceId,
          totalAmount: totalAmount,
          status: 'PENDING',
          paymentMethod: paymentMethod as any,
          shippingAddress: shippingAddress || cart.customer.address,
          items: {
            create: cart.items.map(item => {
              // 🎯 TASK: Handle missing product gracefully
              if (!item.product) {
                console.warn(`⚠️ Cart item ${item.id} has missing product (productId: ${item.productId})`)
                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPrice: 0,
                  totalPrice: 0
                }
              }
              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.product.price || 0,
                totalPrice: (item.product.price || 0) * item.quantity
              }
            })
          }
        },
        include: {
          items: true
        }
      })

      // 🎯 TASK: Auto-update customer address in database
      try {
        // Validate shipping address fields if provided
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
            phone: shippingAddress.phone || cart.customer.phone || ""
          };

          // Update customer address in database
          await prisma.customers.update({
            where: {
              id: cart.customerId,
              workspaceId: validation.data.workspaceId
            },
            data: {
              address: JSON.stringify(customerAddress),
              updatedAt: new Date()
            }
          });

          logger.info(`[CART] Auto-updated customer address for ${cart.customerId}:`, customerAddress);
        } else {
          logger.info(`[CART] No valid shipping address provided for customer ${cart.customerId}, using existing address`);
        }
      } catch (addressUpdateError) {
        // Don't fail the order if address update fails
        logger.error(`[CART] Failed to auto-update customer address for ${cart.customerId}:`, addressUpdateError);
      }

      // Clear cart
      await prisma.cartItems.deleteMany({
        where: { cartId: cart.id }
      })

      // Invalidate token (optional since user might want to create new orders)
      // await this.secureTokenService.invalidateToken(token)

      logger.info(`[CART] Checkout completed for cart ${cart.id}, order ${order.id} created via token`)

      res.json({
        success: true,
        order: {
          id: order.id,
          orderCode: order.orderCode,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          itemCount: order.items.length
        },
        message: "Checkout completed successfully"
      })

    } catch (error) {
      logger.error("[CART] Error during checkout:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error"
      })
    }
  }

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

      const validation = await this.secureTokenService.validateToken(token) // 🚀 KISS: Solo esistenza + non scaduto
      
      if (!validation.valid) {
        res.status(400).json({
          valid: false,
          error: "Token non valido o scaduto",
          errorType: "INVALID_TOKEN",
        })
        return
      }

      const secureToken = validation.data
      
      if (!validation.payload) {
        res.status(400).json({
          valid: false,
          error: "Token corrotto",
          errorType: "CORRUPTED_TOKEN",
        })
        return
      }

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

      logger.info(`[CART] Token validated for customer ${customer.id}`)

      res.json({
        success: true,
        data: {
          id: payload.cartId,
          customerId: customer.id,
          workspaceId: secureToken.workspaceId,
          items: (payload.items || []).map((item: any) => ({
            id: item.id,
            productId: item.productId || '',
            productCode: item.code,
            productName: item.name,
            quantity: item.quantity,
            unitPrice: item.finalPrice,
            totalPrice: item.total,
            discountAmount: item.appliedDiscount ? (item.originalPrice - item.finalPrice) * item.quantity : 0,
            finalPrice: item.finalPrice,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })),
          totalItems: (payload.items || []).reduce((sum: number, item: any) => sum + item.quantity, 0),
          subtotal: payload.totalAmount,
          totalDiscount: (payload.items || []).reduce((sum: number, item: any) => {
            return sum + (item.appliedDiscount ? (item.originalPrice - item.finalPrice) * item.quantity : 0)
          }, 0),
          finalTotal: payload.totalAmount,
          lastUpdated: new Date().toISOString(),
          createdAt: payload.createdAt || new Date().toISOString()
        }
      })
    } catch (error) {
      logger.error("[CART] Error validating token:", error)
      res.status(500).json({
        valid: false,
        error: "Internal server error",
      })
    }
  }
}
