import { Request, Response } from "express"
import { SecureTokenService } from "../../../application/services/secure-token.service"
import { prisma } from "../../../lib/prisma"
import logger from "../../../utils/logger"

export class CartController {
  private secureTokenService = new SecureTokenService()

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

      const validation = await this.secureTokenService.validateToken(token, 'cart')
      
      if (!validation.valid || !validation.payload) {
        res.status(400).json({
          success: false,
          error: "Invalid or expired token"
        })
        return
      }

      const payload = validation.payload as any
      
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

      // Calculate updated totals
      let totalAmount = 0
      const items = cart.items.map(item => {
        const price = item.product.price
        const itemTotal = price * item.quantity
        totalAmount += itemTotal

        return {
          id: item.id,
          type: 'product',
          productId: item.productId,
          name: item.product.name,
          price: price,
          quantity: item.quantity,
          total: itemTotal
        }
      })

      res.json({
        success: true,
        cart: {
          id: cart.id,
          items,
          totalAmount,
          currency: cart.customer.currency || 'EUR',
          createdAt: cart.createdAt,
          updatedAt: cart.updatedAt
        },
        customer: {
          id: cart.customer.id,
          name: cart.customer.name,
          email: cart.customer.email,
          phone: cart.customer.phone
        },
        workspaceId: validation.data.workspaceId
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

      const validation = await this.secureTokenService.validateToken(token, 'cart')
      
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
        return sum + (item.product.price * item.quantity)
      }, 0)

      logger.info(`[CART] Item added to cart ${cart.id} via token`)

      res.json({
        success: true,
        cartItem: {
          id: cartItem.id,
          type: 'product',
          name: cartItem.product.name,
          price: cartItem.product.price,
          quantity: cartItem.quantity,
          total: cartItem.product.price * cartItem.quantity
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

      const validation = await this.secureTokenService.validateToken(token, 'cart')
      
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
        return sum + (item.product.price * item.quantity)
      }, 0)

      logger.info(`[CART] Item ${itemId} updated in cart ${payload.cartId} via token`)

      res.json({
        success: true,
        cartItem: {
          id: updatedCartItem.id,
          type: 'product',
          name: updatedCartItem.product.name,
          price: updatedCartItem.product.price,
          quantity: updatedCartItem.quantity,
          total: updatedCartItem.product.price * updatedCartItem.quantity
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

      const validation = await this.secureTokenService.validateToken(token, 'cart')
      
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
        return sum + (item.product.price * item.quantity)
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

      const validation = await this.secureTokenService.validateToken(token, 'cart')
      
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
        return sum + (item.product.price * item.quantity)
      }, 0)

      // Generate unique order code
      const orderCode = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

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
            create: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
              totalPrice: item.product.price * item.quantity
            }))
          }
        },
        include: {
          items: true
        }
      })

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

      const validation = await this.secureTokenService.validateToken(token, 'cart')
      
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

      logger.info(`[CART] Token validated for customer ${customer.id}`)

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
        cartData: {
          cartId: payload.cartId,
          items: payload.items || [],
          totalAmount: payload.totalAmount,
          currency: payload.currency,
          createdAt: payload.createdAt
        },
        workspaceId: secureToken.workspaceId,
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
