import { PrismaClient } from "@prisma/client"
import { confirmOrderFromConversation } from "../../chatbot/calling-functions/confirmOrderFromConversation"
import { getAllCategories } from "../../chatbot/calling-functions/getAllCategories"
import { getAllProducts } from "../../chatbot/calling-functions/getAllProducts"
import { MessageRepository } from "../../repositories/message.repository"
import { documentService } from "../../services/documentService"
import logger from "../../utils/logger"
import { PriceCalculationService } from "./price-calculation.service"
import { SecureTokenService } from "./secure-token.service"
import { TokenService } from "./token.service"

interface FunctionCallResult {
  data: any
  functionName: string
}

// 🆕 DISAMBIGUATION SYSTEM INTERFACES
interface DisambiguationSession {
  sessionId: string
  customerId: string
  workspaceId: string
  query: string // Query originale "aggiungi vino al carrello"
  action: 'add' | 'remove' // Azione richiesta
  productQuery: string // "vino"
  quantity: number // 1
  products: ProductOption[] // Prodotti trovati 🔧 RENAMED
  expiresAt: Date // Scade dopo 5 minuti
  createdAt: number // Timestamp creazione
  lastActivity: number // Ultimo accesso
  userQuery: string // Query utente originale
}

interface ProductOption {
  id: string
  name: string
  price: number
  stock: number
  productCode: string
  index: number
  // 🆕 ADDITIONAL FIELDS FOR DISAMBIGUATION
  category?: string
  description?: string
  optionNumber: number
  icon: string
}

interface ParsedProduct {
  name: string
  quantity: number
  modifiers?: string[] // "grande", "piccolo", "bio"
}

interface DisambiguationResult {
  success: boolean
  action: 'resolved' | 'expired' | 'cancelled'
  selectedProduct?: ProductOption
  error?: string
}

/**
 * Service per gestire le chiamate di funzione dal function router
 */
export class FunctionHandlerService {
  private prisma: PrismaClient

  /**
   * 🎯 TASK: Clean up orphaned cart items (items with missing products)
   */
  private async cleanupOrphanedCartItems(workspaceId: string): Promise<void> {
    try {
      // Find cart items that reference non-existent products
      const orphanedItems = await this.prisma.cartItems.findMany({
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
        await this.prisma.cartItems.deleteMany({
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
  private messageRepository: MessageRepository
  private tokenService: TokenService
  private priceCalculationService: PriceCalculationService
  
  // 🆕 DISAMBIGUATION SESSION MANAGEMENT
  private disambiguationSessions: Map<string, DisambiguationSession> = new Map()
  private readonly SESSION_TTL = 5 * 60 * 1000 // 5 minuti in millisecondi

  constructor() {
    this.prisma = new PrismaClient()
    this.messageRepository = new MessageRepository()
    this.tokenService = new TokenService()
    this.priceCalculationService = new PriceCalculationService(this.prisma)
    
    // Auto-cleanup sessioni scadute ogni ora
    setInterval(() => this.cleanExpiredSessions(), 60 * 60 * 1000)
  }

  /**
   * Gestisce una chiamata di funzione in base al nome e ai parametri
   * @param functionName Nome della funzione da chiamare
   * @param params Parametri per la funzione
   * @param customer Informazioni sul cliente
   * @param workspaceId ID del workspace
   * @param phoneNumber Numero di telefono del cliente
   * @returns Risultato della chiamata di funzione
   */
  async handleFunctionCall(
    functionName: string,
    params: any,
    customer: any,
    workspaceId: string,
    phoneNumber: string
  ): Promise<FunctionCallResult> {
    logger.info(`🎯 FunctionHandlerService: Chiamata ricevuta per ${functionName}`, {
      functionName,
      params,
      customerId: customer?.id,
      workspaceId,
      phoneNumber
    })

    try {
      switch (functionName) {
        // 🛒 CART OPERATIONS
        case 'add_to_cart':
          return {
            data: await this.addToCart(params, customer?.id, workspaceId, phoneNumber),
            functionName
          }

        case 'remove_from_cart':
          return {
            data: await this.removeFromCart(params, customer?.id, workspaceId),
            functionName
          }

        case 'clear_cart':
          return {
            data: await this.clearCart(customer?.id, workspaceId),
            functionName
          }

        case 'view_cart':
        case 'get_cart_info':
          return {
            data: await this.viewCart(customer?.id, workspaceId),
            functionName
          }

        case 'get_cart_totals':
          return {
            data: await this.getCartTotals(customer?.id, workspaceId),
            functionName
          }

        case 'checkout_cart':
        case 'confirm_order':
          return {
            data: await this.generateCheckoutLink(customer?.id, workspaceId),
            functionName
          }

        // 🆕 DISAMBIGUATION SYSTEM
        case 'resolve_disambiguation':
          return {
            data: await this.resolveDisambiguation(params, customer?.id, workspaceId, phoneNumber),
            functionName
          }

        case 'cancel_disambiguation':
          return {
            data: await this.cancelDisambiguation(params),
            functionName
          }

        // 📦 PRODUCT OPERATIONS  
        case 'get_all_products':
          return {
            data: await this.handleGetAllProducts(phoneNumber, workspaceId, customer?.id, ''),
            functionName
          }

        case 'get_all_categories':
          return {
            data: await this.handleGetAllCategories(phoneNumber, workspaceId, customer?.id, ''),
            functionName
          }

        case 'search_products':
          return {
            data: await this.searchProducts(params.query, workspaceId),
            functionName
          }

        // 🚚 ORDER OPERATIONS & 🛒 CART OPERATIONS
        case 'confirm_order':
        case 'get_cart_info':
          // Determine if this is a cart request or order confirmation
          const isCartRequest = functionName === 'get_cart_info' || 
            (params.query && (
              params.query.toLowerCase().includes('carrello') ||
              params.query.toLowerCase().includes('cart') ||
              params.query.toLowerCase().includes('vedere') ||
              params.query.toLowerCase().includes('mostra')
            ))
          
          if (isCartRequest) {
            // Cart request - show cart contents and generate cart link
            return {
              data: await confirmOrderFromConversation({
                ...params,
                useCartData: true,
                generateCartLink: true
              }),
              functionName
            }
          } else {
            // Order confirmation - generate checkout link
            return {
              data: await confirmOrderFromConversation({
                ...params,
                useCartData: true,
                generateCartLink: false
              }),
              functionName
            }
          }

        // 📄 DOCUMENTATION & FAQ
        case 'search_documents':
          return {
            data: await this.searchDocuments(params.query, workspaceId),
            functionName
          }

        case 'get_faq_info':
          return {
            data: await this.getFaqInfo(params.question, workspaceId),
            functionName
          }

        // 🎯 DEFAULT CASE
        default:
          logger.warn(`⚠️ Funzione non riconosciuta: ${functionName}`)
          return {
            data: {
              success: false,
              error: `Funzione ${functionName} non supportata`,
              supportedFunctions: [
                'add_to_cart',
                'add_to_cart_with_disambiguation', 
                'remove_from_cart',
                'clear_cart',
                'view_cart',
                'get_cart_totals',
                'checkout_cart',
                'confirm_order',
                'resolve_disambiguation',
                'cancel_disambiguation',
                'get_all_products',
                'get_all_categories',
                'search_products',
                'search_documents',
                'get_faq_info'
              ]
            },
            functionName
          }
      }
    } catch (error) {
      logger.error(`❌ Errore in handleFunctionCall per ${functionName}:`, error)
      return {
        data: {
          success: false,
          error: error instanceof Error ? error.message : 'Errore interno del server',
          errorType: 'internal_error'
        },
        functionName
      }
    }
  }

  // =============================================================================
  // 🛒 CART METHODS
  // =============================================================================

  /**
   * Aggiunge un prodotto al carrello (versione semplice)
   */
  async addToCart(params: any, customerId: string, workspaceId: string, phoneNumber: string): Promise<any> {
    try {
      if (!customerId) {
        return {
          success: false,
          error: "Cliente non identificato. Devi prima registrarti per aggiungere prodotti al carrello."
        }
      }

      const productName = params.product_name || params.productName
      const quantity = params.quantity || 1

      if (!productName) {
        return {
          success: false,
          error: "Nome prodotto non specificato"
        }
      }

      // 1. Cerca il prodotto nel database (per nome o codice)
      let products = []
      
      // Se sembra un codice prodotto (es: [00004] o 00004)
      const cleanProductCode = productName.replace(/[\[\]]/g, '') // Rimuove parentesi quadre
      
      if (/^\d+$/.test(cleanProductCode)) {
        // Cerca prima per codice prodotto
        products = await this.prisma.products.findMany({
          where: {
            ProductCode: cleanProductCode,
            workspaceId: workspaceId,
            isActive: true
          }
        })
      }
      
      // Se non trovato per codice, cerca per nome
      if (products.length === 0) {
        products = await this.prisma.products.findMany({
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

      if (products.length === 0) {
        return {
          success: false,
          error: `❌ Prodotto "${productName}" non trovato nel catalogo.`,
          action: 'product_not_found'
        }
      }

      // 2. Se ci sono più prodotti, richiedi disambiguazione SOLO se non è un codice specifico
      if (products.length > 1) {
        // Se l'utente ha fornito un codice prodotto specifico, non mostrare disambiguazione
        if (/^\d+$/.test(cleanProductCode)) {
          // Codice specifico fornito ma trovati più prodotti - errore
          return {
            success: false,
            error: `❌ Codice prodotto "${cleanProductCode}" non trovato o non valido.`,
            action: 'product_not_found'
          }
        }
        
        // Altrimenti, mostra disambiguazione per ricerca per nome
        const productOptions = products.map((product) => 
          `• [${product.ProductCode || 'N/A'}] - ${product.name} - €${product.price.toFixed(2)}`
        ).join('\n')

        return {
          success: false,
          error: `🤔 Ho trovato più prodotti corrispondenti a "${productName}". Quale vuoi aggiungere al carrello?\n\n${productOptions}\n\n📝 Per aggiungere al carrello, scrivi ESATTAMENTE:\n"aggiungi al carrello [00004]"\noppure\n"aggiungi al carrello Mozzarella di Bufala Campana DOP"`,
          action: 'disambiguation_required',
          products: products.map(p => ({
            id: p.id,
            name: p.name,
            code: p.ProductCode,
            price: p.price
          })),
          originalRequest: 'add_to_cart'
        }
      }

      // 3. Prodotto univoco trovato
      const selectedProduct = products[0]

      // 3. Verifica stock disponibile
      if (selectedProduct.stock < quantity) {
        return {
          success: false,
          error: `❌ Stock insufficiente per ${selectedProduct.name}. Disponibili: ${selectedProduct.stock}, richiesti: ${quantity}`,
          available: selectedProduct.stock,
          requested: quantity
        }
      }

      // 4. Ottieni o crea carrello per il cliente
      let cart = await this.prisma.carts.findFirst({
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
        cart = await this.prisma.carts.create({
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

      // 5. Controlla se il prodotto è già nel carrello
      const existingItem = await this.prisma.cartItems.findFirst({
        where: {
          cartId: cart.id,
          productId: selectedProduct.id
        }
      })

      let cartItem
      if (existingItem) {
        // Aggiorna quantità esistente
        cartItem = await this.prisma.cartItems.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity
          },
          include: {
            product: true
          }
        })
      } else {
        // Crea nuovo item nel carrello
        cartItem = await this.prisma.cartItems.create({
          data: {
            cartId: cart.id,
            productId: selectedProduct.id,
            quantity: quantity
          },
          include: {
            product: true
          }
        })
      }

      // 6. Calcola totale carrello aggiornato CON SCONTI
      const updatedCart = await this.prisma.carts.findFirst({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      // Usa PriceCalculationService per calcolare prezzi con offerte
      const { PriceCalculationService } = await import('./price-calculation.service')
      const priceService = new PriceCalculationService(this.prisma)

      // Ottieni sconto cliente dal database
      const customer = await this.prisma.customers.findFirst({
        where: { id: customerId, workspaceId: workspaceId }
      })
      const customerDiscount = customer?.discount || 0

      // Calcola prezzo del prodotto aggiunto con sconti
      const productWithPrice = await priceService.calculatePricesWithDiscounts(
        workspaceId,
        [selectedProduct.id],
        customerDiscount
      )

      const finalProductPrice = productWithPrice.products[0]?.finalPrice || selectedProduct.price
      const discountInfo = productWithPrice.products[0]

      // Calcola totale carrello con tutti i prezzi scontati
      let totalAmount = 0
      for (const item of updatedCart!.items) {
        // 🎯 TASK: Handle missing product gracefully
        if (!item.product) {
          console.warn(`⚠️ Cart item ${item.id} has missing product (productId: ${item.productId})`)
          continue
        }

        const itemPrices = await priceService.calculatePricesWithDiscounts(
          workspaceId,
          [item.productId],
          customerDiscount
        )
        const itemFinalPrice = itemPrices.products[0]?.finalPrice || item.product.price || 0
        totalAmount += itemFinalPrice * item.quantity
      }

      logger.info(`[CART] ✅ Prodotto aggiunto: ${selectedProduct.name} (qty: ${quantity}) per customer ${customerId}`)

      // Prepara messaggio con sconto se applicabile
      let priceMessage = `€${finalProductPrice.toFixed(2)}`
      if (discountInfo?.appliedDiscount && discountInfo.appliedDiscount > 0) {
        priceMessage = `€${finalProductPrice.toFixed(2)} (era €${selectedProduct.price.toFixed(2)} - sconto ${discountInfo.appliedDiscount}%)`
      }

      // Ottieni il carrello completo con i codici prodotto
      const cartSummary = await this.viewCart(customerId, workspaceId)

      return {
        success: true,
        message: `✅ Ho aggiunto ${quantity}x ${selectedProduct.name} al carrello!`,
        product: {
          id: selectedProduct.id,
          code: selectedProduct.ProductCode || 'N/A',
          name: selectedProduct.name,
          originalPrice: selectedProduct.price,
          finalPrice: finalProductPrice,
          appliedDiscount: discountInfo?.appliedDiscount || 0,
          discountSource: discountInfo?.discountSource || 'none',
          quantity: cartItem.quantity,
          total: finalProductPrice * cartItem.quantity,
          priceDisplay: priceMessage
        },
        cart: cartSummary.success ? {
          id: cart.id,
          items: cartSummary.items,
          totalAmount: cartSummary.totalAmount,
          itemCount: cartSummary.itemCount
        } : {
          id: cart.id,
          totalAmount: totalAmount,
          itemCount: updatedCart!.items.length
        },
        action: 'product_added_successfully'
      }

    } catch (error) {
      logger.error('❌ Errore in addToCart:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno nell\'aggiunta al carrello'
      }
    }
  }

  /**
   * Rimuove un prodotto dal carrello
   */
  async removeFromCart(params: any, customerId: string, workspaceId: string): Promise<any> {
    try {
      if (!customerId) {
        return {
          success: false,
          error: "Cliente non identificato"
        }
      }

      const { productCode, productName, removeAll } = params

      // Ottieni carrello esistente
      const cart = await this.prisma.carts.findFirst({
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

      if (!cart || cart.items.length === 0) {
        return {
          success: false,
          error: "Il carrello è vuoto",
          action: 'empty_cart'
        }
      }

      if (removeAll) {
        // Rimuovi tutti gli articoli dal carrello
        await this.prisma.cartItems.deleteMany({
          where: { cartId: cart.id }
        })

        return {
          success: true,
          message: "🗑️ Carrello svuotato completamente",
          action: 'cart_cleared'
        }
      }

      // Trova prodotto da rimuovere
      let productToRemove = null

      if (productCode) {
        productToRemove = cart.items.find(item => 
          item.product.ProductCode?.toLowerCase() === productCode.toLowerCase()
        )
      } else if (productName) {
        // Cerca per nome
        const matchingItems = cart.items.filter(item =>
          item.product.name.toLowerCase().includes(productName.toLowerCase())
        )

        if (matchingItems.length > 1) {
          // Disambiguazione necessaria
          const options = matchingItems.map((item, index) => 
            `${index + 1}. ${item.product.ProductCode || 'N/A'} - ${item.product.name} (Quantità: ${item.quantity})`
          ).join('\n')

          return {
            success: false,
            message: `Trovati ${matchingItems.length} prodotti nel carrello con quel nome. Quale vuoi rimuovere?\n\n${options}\n\nPuoi specificare il numero o il codice prodotto.`,
            action: 'disambiguation_required',
            options: matchingItems.map(item => ({
              code: item.product.ProductCode,
              name: item.product.name,
              quantity: item.quantity
            }))
          }
        }

        productToRemove = matchingItems[0] || null
      }

      if (!productToRemove) {
        return {
          success: false,
          error: `Prodotto non trovato nel carrello${productCode ? ` con codice "${productCode}"` : productName ? ` con nome "${productName}"` : ''}`,
          action: 'product_not_found'
        }
      }

      // Rimuovi il prodotto dal carrello
      await this.prisma.cartItems.delete({
        where: { id: productToRemove.id }
      })

      return {
        success: true,
        message: `✅ Prodotto "${productToRemove.product.name}" rimosso dal carrello`,
        removedProduct: {
          code: productToRemove.product.ProductCode,
          name: productToRemove.product.name,
          quantity: productToRemove.quantity
        },
        action: 'product_removed'
      }

    } catch (error) {
      logger.error('❌ Errore in removeFromCart:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno nella rimozione dal carrello'
      }
    }
  }

  /**
   * Svuota il carrello
   */
  async clearCart(customerId: string, workspaceId: string): Promise<any> {
    try {
      // Implementation will be added in next update
      return {
        success: true,
        message: "Carrello svuotato con successo"
      }
    } catch (error) {
      logger.error('❌ Errore in clearCart:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno'
      }
    }
  }

  /**
   * Visualizza il contenuto del carrello
   */
  async viewCart(customerId: string, workspaceId: string): Promise<any> {
    try {
      if (!customerId) {
        return {
          success: false,
          error: "Cliente non identificato"
        }
      }

      // 🎯 TASK: Clean up orphaned cart items before retrieving cart
      await this.cleanupOrphanedCartItems(workspaceId)

      // Ottieni carrello con prodotti
      const cart = await this.prisma.carts.findFirst({
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

      if (!cart || cart.items.length === 0) {
        // Genera sempre un cartUrl anche per carrello vuoto
        const { SecureTokenService } = await import('./secure-token.service')
        const secureTokenService = new SecureTokenService()
        
        // Crea un carrello vuoto se non esiste
        let emptyCart = cart
        if (!cart) {
          emptyCart = await this.prisma.carts.create({
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
        
        const cartToken = await secureTokenService.createToken(
          'cart',
          workspaceId,
          { 
            customerId, 
            workspaceId, 
            cartId: emptyCart.id,
            items: [],
            totalAmount: 0,
            currency: 'EUR',
            createdAt: new Date().toISOString()
          },
          '1h',
          undefined,
          undefined,
          undefined,
          customerId
        )
        
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
        const cartUrl = `${baseUrl}/cart-public?token=${cartToken}`
        
        return {
          success: true,
          items: [],
          totalAmount: 0,
          itemCount: 0,
          isEmpty: true,
          action: 'empty_cart',
          cartUrl: cartUrl
        }
      }

      // Calcola prezzi con sconti per ogni prodotto
      const { PriceCalculationService } = await import('./price-calculation.service')
      const priceService = new PriceCalculationService(this.prisma)

      // Ottieni sconto cliente
      const customer = await this.prisma.customers.findFirst({
        where: { id: customerId, workspaceId: workspaceId }
      })
      const customerDiscount = customer?.discount || 0

      // Calcola totale carrello con sconti
      let totalAmount = 0
      const cartItemsWithPrices = []

      for (const item of cart.items) {
        // 🎯 TASK: Handle missing product gracefully
        if (!item.product) {
          console.warn(`⚠️ Cart item ${item.id} has missing product (productId: ${item.productId})`)
          cartItemsWithPrices.push({
            id: item.id,
            code: 'N/A',
            name: `Product ${item.productId} (Not Found)`,
            originalPrice: 0,
            finalPrice: 0,
            appliedDiscount: 0,
            quantity: item.quantity,
            total: 0
          })
          continue
        }

        const itemPrices = await priceService.calculatePricesWithDiscounts(
          workspaceId,
          [item.productId],
          customerDiscount
        )
        
        const finalPrice = itemPrices.products[0]?.finalPrice || item.product.price || 0
        const discountInfo = itemPrices.products[0]
        const itemTotal = finalPrice * item.quantity
        totalAmount += itemTotal

        cartItemsWithPrices.push({
          id: item.id,
          code: item.product.ProductCode || 'N/A',
          name: item.product.name || `Product ${item.productId}`,
          originalPrice: item.product.price || 0,
          finalPrice: finalPrice,
          appliedDiscount: discountInfo?.appliedDiscount || 0,
          quantity: item.quantity,
          total: itemTotal
        })
      }

      // Generate cart link for user access
      const secureTokenService = new SecureTokenService()
      const cartPayload = {
        customerId,
        workspaceId,
        cartId: cart.id,
        items: cartItemsWithPrices,
        totalAmount,
        currency: 'EUR',
        createdAt: new Date().toISOString()
      }

      const cartToken = await secureTokenService.createToken(
        'cart',
        workspaceId,
        cartPayload,
        '1h',
        undefined,
        undefined,
        undefined,
        customerId
      )

      // Get workspace URL for cart link
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { url: true }
      })
      
         const baseUrl = workspace?.url || process.env.FRONTEND_URL || 'http://localhost:3000'
         const cartUrl = `${baseUrl}/cart-public?token=${cartToken}`

      return {
        success: true,
        items: cartItemsWithPrices,
        totalAmount: totalAmount,
        itemCount: cart.items.length,
        message: `🛒 Il tuo carrello contiene ${cart.items.length} prodotti`,
        cartUrl: cartUrl,
        action: 'cart_retrieved'
      }

    } catch (error) {
      logger.error('❌ Errore in viewCart:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno nella visualizzazione carrello'
      }
    }
  }

  /**
   * Ottiene i totali del carrello
   */
  async getCartTotals(customerId: string, workspaceId: string): Promise<any> {
    try {
      // Implementation will be added in next update
      return {
        success: true,
        subtotal: 0,
        tax: 0,
        total: 0,
        itemCount: 0
      }
    } catch (error) {
      logger.error('❌ Errore in getCartTotals:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno'
      }
    }
  }

  /**
   * 🛒 Genera link checkout per il frontend
   */
  async generateCheckoutLink(customerId: string, workspaceId: string): Promise<any> {
    try {
      if (!customerId) {
        return {
          success: false,
          error: "Cliente non identificato. Devi prima registrarti per procedere al checkout."
        }
      }

      // 1. Verifica se il cliente ha un carrello attivo
      const cart = await this.prisma.carts.findFirst({
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

      if (!cart || cart.items.length === 0) {
        return {
          success: false,
          error: "❌ Non hai un carrello attivo. Aggiungi prima alcuni prodotti!",
          action: 'add_products_first'
        }
      }

      // 2. Calcola totale carrello
      const totalAmount = cart.items.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity)
      }, 0)

      // 3. Genera o ottieni token carrello esistente
      const { SecureTokenService } = await import('./secure-token.service')
      const secureTokenService = new SecureTokenService()
      
      const tokenData = {
        customerId: customerId,
        cartId: cart.id,
        items: cart.items,
        totalAmount: totalAmount,
        currency: 'EUR',
        createdAt: new Date().toISOString()
      }

      const token = await secureTokenService.createToken(
        'cart',
        workspaceId,
        tokenData,
        '60m', // 60 minuti
        undefined,
        undefined,
        undefined,
        customerId
      )

      // 4. Genera URL frontend
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      const checkoutLink = `${frontendUrl}/checkout?token=${token}`

      // 5. Prepara riepilogo carrello per messaggio
      const cartSummary = cart.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        total: item.product.price * item.quantity
      }))

      logger.info(`[CHECKOUT] Link generato per customer ${customerId}, cart ${cart.id}`)

      return {
        success: true,
        message: "✅ Carrello pronto per il checkout!",
        checkoutUrl: checkoutLink,
        token: token,
        cart: {
          id: cart.id,
          items: cartSummary,
          totalAmount: totalAmount,
          currency: 'EUR',
          itemCount: cart.items.length
        },
        action: 'redirect_to_checkout'
      }

    } catch (error) {
      logger.error('❌ Errore in generateCheckoutLink:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno nella generazione del link checkout'
      }
    }
  }

  // =============================================================================
  // 🆕 DISAMBIGUATION METHODS
  // =============================================================================

  /**
   * Risolve una disambiguazione
   */
  async resolveDisambiguation(params: any, customerId: string, workspaceId: string, phoneNumber: string): Promise<any> {
    try {
      const productChoice = params.product_choice
      const quantity = params.quantity || 1

      if (!productChoice) {
        return {
          success: false,
          error: "Scelta prodotto non specificata"
        }
      }

      // Cerca il prodotto per codice o nome
      let products = []
      
      // Se sembra un codice prodotto (es: [00004] o 00004)
      const cleanProductCode = productChoice.replace(/[\[\]]/g, '') // Rimuove parentesi quadre
      
      if (/^\d+$/.test(cleanProductCode)) {
        // Cerca per codice prodotto
        products = await this.prisma.products.findMany({
          where: {
            ProductCode: cleanProductCode,
            workspaceId: workspaceId,
            isActive: true
          }
        })
      }
      
      // Se non trovato per codice, cerca per nome
      if (products.length === 0) {
        products = await this.prisma.products.findMany({
          where: {
            name: {
              contains: productChoice,
              mode: 'insensitive'
            },
            workspaceId: workspaceId,
            isActive: true
          }
        })
      }

      if (products.length === 0) {
        return {
          success: false,
          error: `❌ Prodotto "${productChoice}" non trovato nel catalogo.`
        }
      }

      if (products.length > 1) {
        return {
          success: false,
          error: `❌ Trovati più prodotti per "${productChoice}". Sii più specifico.`
        }
      }

      // Prodotto univoco trovato - aggiungi al carrello
      const selectedProduct = products[0]
      
      // Chiama addToCart con il prodotto trovato
      return await this.addToCart(
        { product_name: selectedProduct.name, quantity: quantity },
        customerId,
        workspaceId,
        phoneNumber
      )

    } catch (error) {
      logger.error('❌ Errore in resolveDisambiguation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno nella risoluzione disambiguazione'
      }
    }
  }

  /**
   * Cancella una disambiguazione
   */
  async cancelDisambiguation(params: any): Promise<any> {
    try {
      // Implementation will be added in next update
      return {
        success: true,
        message: "Disambiguazione cancellata",
        sessionId: params.sessionId
      }
    } catch (error) {
      logger.error('❌ Errore in cancelDisambiguation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno'
      }
    }
  }

  // =============================================================================
  // 📦 PRODUCT METHODS
  // =============================================================================

  /**
   * Cerca prodotti per query
   */
  async searchProducts(query: string, workspaceId: string): Promise<any> {
    try {
      const products = await this.prisma.products.findMany({
        where: {
          workspaceId,
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      })

      return {
        success: true,
        products: products.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          stock: product.stock,
          productCode: product.ProductCode
        })),
        query,
        totalFound: products.length
      }
    } catch (error) {
      logger.error('❌ Errore in searchProducts:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno'
      }
    }
  }

  /**
   * Ottiene tutti i prodotti
   */
  async handleGetAllProducts(phoneNumber: string, workspaceId: string, customerId: string, message: string): Promise<any> {
    try {
      const result = await getAllProducts({
        phoneNumber,
        workspaceId,
        customerId,
        message
      })

      return {
        success: true,
        response: result?.response || 'Prodotti ottenuti con successo',
        products: result?.products || [],
        totalProducts: result?.totalProducts || 0
      }
    } catch (error) {
      logger.error('❌ Errore in handleGetAllProducts:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno'
      }
    }
  }

  /**
   * Ottiene tutte le categorie
   */
  async handleGetAllCategories(phoneNumber: string, workspaceId: string, customerId: string, message: string): Promise<any> {
    try {
      const result = await getAllCategories({
        phoneNumber,
        workspaceId,
        customerId,
        message
      })

      return {
        success: true,
        total_categories: result?.totalCategories || 0,
        categories: result?.categories || [],
        response_message: result?.response || 'Categorie ottenute con successo'
      }
    } catch (error) {
      logger.error('❌ Errore in handleGetAllCategories:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno'
      }
    }
  }

  // =============================================================================
  // 📄 DOCUMENTATION METHODS
  // =============================================================================

  /**
   * Cerca nei documenti
   */
  async searchDocuments(query: string, workspaceId: string): Promise<any> {
    try {
      logger.info(`🔍 Ricerca documenti per query: "${query}" in workspace ${workspaceId}`)
      
      const results = await documentService.searchDocuments(query, workspaceId)
      
      return {
        success: true,
        results,
        query,
        workspaceId
      }
    } catch (error) {
      logger.error('❌ Errore in searchDocuments:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno'
      }
    }
  }

  /**
   * Ottiene informazioni FAQ
   */
  async getFaqInfo(question: string, workspaceId: string): Promise<any> {
    try {
      const faqs = await this.prisma.fAQ.findMany({
        where: {
          workspaceId,
          isActive: true, // ✅ Only return active FAQs
          OR: [
            { question: { contains: question, mode: 'insensitive' } },
            { answer: { contains: question, mode: 'insensitive' } }
          ]
        },
        take: 5
      })

      return {
        success: true,
        faqs: faqs.map(faq => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer
        })),
        query: question
      }
    } catch (error) {
      logger.error('❌ Errore in getFaqInfo:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno'
      }
    }
  }

  // =============================================================================
  // 🧹 UTILITY METHODS
  // =============================================================================

  /**
   * Pulisce le sessioni di disambiguazione scadute
   */
  private cleanExpiredSessions(): void {
    const now = Date.now()
    for (const [sessionId, session] of this.disambiguationSessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TTL) {
        this.disambiguationSessions.delete(sessionId)
        logger.info(`🧹 Sessione scaduta rimossa: ${sessionId}`)
      }
    }
  }

  /**
   * Genera un saluto basato sull'ora del giorno
   */
  getTimeBasedGreeting(language: string = 'it'): string {
    const hour = new Date().getHours()
    
    if (language === 'en') {
      if (hour < 12) return 'Good morning!'
      if (hour < 18) return 'Good afternoon!'
      return 'Good evening!'
    }
    
    // Default italiano
    if (hour < 12) return 'Buongiorno!'
    if (hour < 18) return 'Buon pomeriggio!'
    return 'Buonasera!'
  }

  /**
   * Calcola il prezzo personalizzato per il cliente
   */
  async calculateCustomerPrice(basePrice: number, customerId: string | null = null): Promise<number> {
    if (!customerId) {
      return basePrice
    }

    try {
      const customer = await this.prisma.customers.findUnique({
        where: { id: customerId }
      })

      if (!customer) {
        logger.warn(`⚠️ Cliente non trovato: ${customerId}`)
        return basePrice
      }

      // Applica eventuali sconti personalizzati
      const discountPercent = customer.discount || 0
      return basePrice * (1 - discountPercent / 100)

    } catch (error) {
      logger.error('❌ Errore nel calcolo prezzo cliente:', error)
      return basePrice
    }
  }

  /**
   * Ottiene l'icona del prodotto
   */
  getProductIcon(productType: any): string {
    // Implementazione base
    return '📦'
  }
}