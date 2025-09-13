import { prisma } from '../../lib/prisma'
import logger from '../../utils/logger'

export interface AddToCartParams {
  productName?: string
  productCode?: string
  quantity?: number
  customerId: string
  workspaceId: string
}

export interface AddToCartResult {
  success: boolean
  message: string
  cartItem?: any
  error?: string
}

/**
 * Add product to customer's cart
 */
export async function addToCart(params: AddToCartParams): Promise<AddToCartResult> {
  try {
    const { productName, productCode, quantity = 1, customerId, workspaceId } = params

    logger.info(`[ADD_TO_CART] Adding product to cart for customer ${customerId}`)

    // Find product by name or code
    let product = null
    if (productCode) {
      product = await prisma.products.findFirst({
        where: {
          ProductCode: productCode,
          workspaceId: workspaceId,
          isActive: true
        }
      })
    } else if (productName) {
      product = await prisma.products.findFirst({
        where: {
          name: {
            contains: productName,
            mode: 'insensitive'
          },
          workspaceId: workspaceId,
          isActive: true
        }
      })
    }

    if (!product) {
      const searchTerm = productCode || productName || 'unknown'
      logger.warn(`[ADD_TO_CART] Product not found: ${searchTerm}`)
      return {
        success: false,
        message: `Prodotto "${searchTerm}" non trovato. Controlla il nome o il codice del prodotto.`,
        error: 'Product not found'
      }
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      logger.warn(`[ADD_TO_CART] Insufficient stock for product ${product.name}`)
      return {
        success: false,
        message: `Scorte insufficienti per "${product.name}". Disponibili: ${product.stock} pezzi.`,
        error: 'Insufficient stock'
      }
    }

    // Check if customer exists
    const customer = await prisma.customers.findFirst({
      where: {
        id: customerId,
        workspaceId: workspaceId,
        isActive: true
      }
    })

    if (!customer) {
      logger.warn(`[ADD_TO_CART] Customer not found: ${customerId}`)
      return {
        success: false,
        message: 'Cliente non trovato.',
        error: 'Customer not found'
      }
    }

    // Find or create cart for customer
    let cart = await prisma.carts.findFirst({
      where: {
        customerId: customerId,
        workspaceId: workspaceId
      }
    })

    if (!cart) {
      cart = await prisma.carts.create({
        data: {
          customerId: customerId,
          workspaceId: workspaceId
        }
      })
    }

    // Check if product is already in cart
    const existingCartItem = await prisma.cartItems.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id
      }
    })

    if (existingCartItem) {
      // Update quantity
      const updatedCartItem = await prisma.cartItems.update({
        where: {
          id: existingCartItem.id
        },
        data: {
          quantity: existingCartItem.quantity + quantity
        }
      })

      logger.info(`[ADD_TO_CART] Updated cart item quantity for product ${product.name}`)
      return {
        success: true,
        message: `Aggiornata quantità di "${product.name}"${product.formato ? ` (${product.formato})` : ''} nel carrello. Nuova quantità: ${updatedCartItem.quantity}`,
        cartItem: updatedCartItem
      }
    } else {
      // Create new cart item
      const newCartItem = await prisma.cartItems.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: quantity
        }
      })

      logger.info(`[ADD_TO_CART] Added new product to cart: ${product.name}`)
      return {
        success: true,
        message: `"${product.name}"${product.formato ? ` (${product.formato})` : ''} aggiunto al carrello! Quantità: ${quantity}, Prezzo: €${product.price.toFixed(2)}`,
        cartItem: newCartItem
      }
    }

  } catch (error) {
    logger.error('[ADD_TO_CART] Error adding product to cart:', error)
    return {
      success: false,
      message: 'Errore durante l\'aggiunta del prodotto al carrello. Riprova più tardi.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
