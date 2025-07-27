import { OrderStatus, PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import logger from '../../utils/logger'
import { SecureTokenService } from './secure-token.service'

export interface CheckoutToken {
  id: string
  token: string
  customerId: string
  workspaceId: string
  expiresAt: Date
  isUsed: boolean
  createdAt: Date
}

export interface CheckoutLinkResult {
  success: boolean
  checkoutUrl?: string
  token?: string
  expiresAt?: Date
  error?: string
}

export interface CheckoutData {
  customerId: string
  workspaceId: string
  items: Array<{
    id: string
    type: 'product' | 'service'
    name: string
    price: number
    quantity: number
  }>
  totalAmount: number
  currency: string
}

/**
 * TASK 5: Checkout Service
 * Handles secure checkout link generation with token management
 */
export class CheckoutService {
  private prisma: PrismaClient
  private secureTokenService: SecureTokenService

  constructor() {
    this.prisma = new PrismaClient()
    this.secureTokenService = new SecureTokenService()
  }

  /**
   * TASK 5: Detect checkout intent in user message
   * 
   * @param message User message to analyze
   * @param language User's language preference
   * @returns true if checkout intent detected
   */
  detectCheckoutIntent(message: string, language: string = 'en'): boolean {
    const normalizedMessage = message.toLowerCase().trim()
    
    // Define checkout keywords by language
    const checkoutKeywords = {
      'en': ['buy', 'purchase', 'order', 'checkout', 'pay', 'payment', 'cart', 'complete order', 'finalize', 'proceed'],
      'it': ['comprare', 'acquistare', 'ordinare', 'pagare', 'pagamento', 'carrello', 'completa', 'finalizza', 'procedi', 'acquisto', 'ordine'],
      'es': ['comprar', 'adquirir', 'ordenar', 'pagar', 'pago', 'carrito', 'completar', 'finalizar', 'proceder', 'pedido', 'compra'],
      'pt': ['comprar', 'adquirir', 'encomendar', 'pagar', 'pagamento', 'carrinho', 'completar', 'finalizar', 'prosseguir', 'pedido'],
      'fr': ['acheter', 'acquérir', 'commander', 'payer', 'paiement', 'panier', 'compléter', 'finaliser', 'procéder', 'commande'],
      'de': ['kaufen', 'erwerben', 'bestellen', 'bezahlen', 'zahlung', 'warenkorb', 'bestellung', 'finalisieren', 'fortfahren']
    }

    // Normalize language code
    const normalizedLang = language.toLowerCase()
    let langCode = 'en' // default

    if (normalizedLang.includes('it') || normalizedLang === 'italian') {
      langCode = 'it'
    } else if (normalizedLang.includes('es') || normalizedLang === 'spanish') {
      langCode = 'es'
    } else if (normalizedLang.includes('pt') || normalizedLang === 'portuguese') {
      langCode = 'pt'
    } else if (normalizedLang.includes('fr') || normalizedLang === 'french') {
      langCode = 'fr'
    } else if (normalizedLang.includes('de') || normalizedLang === 'german') {
      langCode = 'de'
    }

    const keywords = checkoutKeywords[langCode] || checkoutKeywords['en']
    
    // Check if any checkout keyword is present
    const hasCheckoutIntent = keywords.some(keyword => 
      normalizedMessage.includes(keyword)
    )

    logger.info(`[TASK5] Checkout intent detection: "${message}" -> ${hasCheckoutIntent} (lang: ${langCode})`)
    
    return hasCheckoutIntent
  }

  /**
   * TASK 5: Generate secure checkout token
   * 
   * @param customerId Customer ID
   * @param workspaceId Workspace ID
   * @param expirationHours Token expiration in hours (default: 1)
   * @returns Generated token string
   */
  generateCheckoutToken(customerId: string, workspaceId: string, expirationHours: number = 1): string {
    const timestamp = Date.now().toString()
    const randomBytes = crypto.randomBytes(16).toString('hex')
    const payload = `${customerId}-${workspaceId}-${timestamp}-${randomBytes}`
    
    // Create secure hash
    const token = crypto
      .createHash('sha256')
      .update(payload)
      .digest('hex')
      .substring(0, 32) // Take first 32 characters for readability
    
    logger.info(`[TASK5] Generated checkout token for customer ${customerId} in workspace ${workspaceId}`)
    
    return token
  }

  /**
   * Create checkout link with secure token and encrypted cart data
   */
  async createCheckoutLink(
    customerId: string, 
    workspaceId: string, 
    checkoutData: CheckoutData,
    baseUrl?: string
  ): Promise<CheckoutLinkResult> {
    try {
      // Validate customer exists
      const customer = await this.prisma.customers.findUnique({
        where: { id: customerId },
        include: { workspace: true }
      })

      if (!customer) {
        return {
          success: false,
          error: 'Customer not found'
        }
      }

      if (customer.workspaceId !== workspaceId) {
        return {
          success: false,
          error: 'Customer does not belong to this workspace'
        }
      }

      // Prepare encrypted payload with checkout data
      const payload = {
        customerId,
        workspaceId,
        items: checkoutData.items,
        totalAmount: checkoutData.totalAmount,
        currency: checkoutData.currency,
        customerName: customer.name,
        customerPhone: customer.phone,
        createdAt: new Date().toISOString()
      }

      // Create secure checkout token (1 hour expiration)
      const token = await this.secureTokenService.createToken(
        'checkout',
        workspaceId,
        payload,
        '1h',
        customerId,
        customer.phone
      )
      
      // Determine base URL
      let checkoutBaseUrl = baseUrl
      if (!checkoutBaseUrl) {
        checkoutBaseUrl = customer.workspace.url || process.env.FRONTEND_URL || 'https://laltroitalia.shop'
      }
      
      if (!checkoutBaseUrl.startsWith('http://') && !checkoutBaseUrl.startsWith('https://')) {
        checkoutBaseUrl = 'https://' + checkoutBaseUrl
      }

      // Create secure checkout URL
      const checkoutUrl = `${checkoutBaseUrl}/checkout?token=${token}`

      // Set expiration time
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1)

      logger.info(`Created secure checkout link for customer ${customerId}: ${checkoutUrl}`)

      return {
        success: true,
        checkoutUrl,
        token,
        expiresAt
      }
    } catch (error) {
      logger.error(`Error creating checkout link for customer ${customerId}:`, error)
      
      return {
        success: false,
        error: 'Failed to create checkout link'
      }
    }
  }

  /**
   * TASK 5: Get checkout response message in customer's language
   * 
   * @param checkoutUrl The generated checkout URL
   * @param customerName Customer's name
   * @param language Customer's language preference
   * @returns Localized checkout message with link
   */
  getCheckoutMessage(checkoutUrl: string, customerName: string, language: string = 'en'): string {
    const messages = {
      'en': `Hi ${customerName}! 🛒 Ready to complete your order? Click here to proceed with checkout: ${checkoutUrl}\n\n⏰ This link expires in 1 hour for security.`,
      'it': `Ciao ${customerName}! 🛒 Pronto a completare il tuo ordine? Clicca qui per procedere al checkout: ${checkoutUrl}\n\n⏰ Questo link scade tra 1 ora per sicurezza.`,
      'es': `¡Hola ${customerName}! 🛒 ¿Listo para completar tu pedido? Haz clic aquí para proceder al checkout: ${checkoutUrl}\n\n⏰ Este enlace expira en 1 hora por seguridad.`,
      'pt': `Olá ${customerName}! 🛒 Pronto para completar seu pedido? Clique aqui para prosseguir com o checkout: ${checkoutUrl}\n\n⏰ Este link expira em 1 hora por segurança.`,
      'fr': `Salut ${customerName}! 🛒 Prêt à compléter votre commande? Cliquez ici pour procéder au checkout: ${checkoutUrl}\n\n⏰ Ce lien expire dans 1 heure pour la sécurité.`,
      'de': `Hallo ${customerName}! 🛒 Bereit, Ihre Bestellung abzuschließen? Klicken Sie hier, um zum Checkout zu gelangen: ${checkoutUrl}\n\n⏰ Dieser Link läuft in 1 Stunde aus Sicherheitsgründen ab.`
    }

    // Normalize language code
    const normalizedLang = language.toLowerCase()
    let langCode = 'en' // default

    if (normalizedLang.includes('it') || normalizedLang === 'italian') {
      langCode = 'it'
    } else if (normalizedLang.includes('es') || normalizedLang === 'spanish') {
      langCode = 'es'
    } else if (normalizedLang.includes('pt') || normalizedLang === 'portuguese') {
      langCode = 'pt'
    } else if (normalizedLang.includes('fr') || normalizedLang === 'french') {
      langCode = 'fr'
    } else if (normalizedLang.includes('de') || normalizedLang === 'german') {
      langCode = 'de'
    }

    return messages[langCode] || messages['en']
  }

  /**
   * Validate checkout token and get checkout data
   */
  async validateCheckoutToken(token: string): Promise<{
    valid: boolean
    checkoutData?: CheckoutData
    error?: string
  }> {
    try {
      const validation = await this.secureTokenService.validateToken(token, 'checkout', undefined)

      if (!validation.valid) {
        return {
          valid: false,
          error: 'Invalid or expired checkout token'
        }
      }

      const checkoutData: CheckoutData = {
        customerId: validation.payload.customerId,
        workspaceId: validation.payload.workspaceId,
        items: validation.payload.items,
        totalAmount: validation.payload.totalAmount,
        currency: validation.payload.currency
      }

      return {
        valid: true,
        checkoutData
      }
    } catch (error) {
      logger.error('Error validating checkout token:', error)
      return {
        valid: false,
        error: 'Failed to validate checkout token'
      }
    }
  }

  /**
   * Process checkout completion
   */
  async completeCheckout(token: string, paymentData: any): Promise<{
    success: boolean
    orderId?: string
    error?: string
  }> {
    try {
      // Validate token first
      const validation = await this.validateCheckoutToken(token)
      
      if (!validation.valid || !validation.checkoutData) {
        return {
          success: false,
          error: validation.error || 'Invalid checkout token'
        }
      }

      const { checkoutData } = validation

      // Create order in database  
      const orderCode = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const order = await this.prisma.orders.create({
        data: {
          orderCode: orderCode,
          customerId: checkoutData.customerId,
          workspaceId: checkoutData.workspaceId,
          totalAmount: checkoutData.totalAmount,
          status: OrderStatus.PENDING,
          items: {
            create: checkoutData.items.map(item => ({
              productId: item.type === 'product' ? item.id : '',
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: item.price * item.quantity
            }))
          }
        },
        include: {
          items: true
        }
      })

      // Mark token as used
      await this.secureTokenService.markTokenAsUsed(token)

      // Here you would integrate with payment processor
      // For now, we'll just mark as completed
      await this.prisma.orders.update({
        where: { id: order.id },
        data: { status: OrderStatus.DELIVERED }
      })

      logger.info(`Checkout completed successfully for order ${order.id}`)

      return {
        success: true,
        orderId: order.id
      }
    } catch (error) {
      logger.error('Error completing checkout:', error)
      return {
        success: false,
        error: 'Failed to complete checkout'
      }
    }
  }

  /**
   * Generate checkout intent for LangChain
   */
  async generateCheckoutIntent(customerId: string, workspaceId: string): Promise<string> {
    try {
      // Get customer's cart or recent items
      const customer = await this.prisma.customers.findUnique({
        where: { id: customerId },
        include: {
          cart: {
            include: {
              items: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      })

      if (!customer || !customer.cart || !customer.cart.items.length) {
        return 'No items in cart. Please add some products or services first.'
      }

      const cart = customer.cart
      const items = cart.items.map(item => ({
        id: item.productId || '',
        type: 'product' as 'product' | 'service',
        name: item.product?.name || 'Unknown item',
        price: item.product?.price || 0,
        quantity: item.quantity
      }))

      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      const checkoutData: CheckoutData = {
        customerId,
        workspaceId,
        items,
        totalAmount,
        currency: 'EUR'
      }

      const result = await this.createCheckoutLink(customerId, workspaceId, checkoutData)

      if (result.success) {
        return `To complete your order, please use this secure link: ${result.checkoutUrl}`
      } else {
        return 'Sorry, I cannot create a checkout link right now. Please try again later.'
      }
    } catch (error) {
      logger.error('Error generating checkout intent:', error)
      return 'Sorry, I cannot process your checkout request right now.'
    }
  }
} 