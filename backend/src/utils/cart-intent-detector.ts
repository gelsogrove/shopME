/**
 * Cart Intent Detection System
 * Safely detects cart operations across multiple languages
 */

import { prisma } from '../lib/prisma'
import logger from './logger'
import { conversationContext } from './conversation-context'
import { cartLockManager } from './cart-lock-manager'
import { cartStateSynchronizer } from './cart-state-synchronizer'

export interface CartIntentResult {
  hasCartIntent: boolean
  action: 'add' | 'remove' | 'view' | null
  confidence: number
  language: 'it' | 'en' | 'es' | 'pt' | 'unknown'
  extractedQuantity?: number
  extractedProduct?: string
}

/**
 * Detect cart intent in user queries with high precision
 * Requires explicit cart keywords to avoid false positives
 */
export function detectCartIntent(query: string): CartIntentResult {
  const normalizedQuery = query.toLowerCase().trim()
  
  // ✅ SAFE TRIGGERS: Require explicit cart/carrello keywords
  const cartKeywords = {
    it: ['carrello', 'nel carrello', 'al carrello'],
    en: ['cart', 'to cart', 'my cart', 'shopping cart', 'in cart'],  
    es: ['carrito', 'al carrito', 'en carrito', 'mi carrito'],
    pt: ['carrinho', 'ao carrinho', 'no carrinho', 'meu carrinho']
  }
  
  const addActions = {
    it: ['aggiungi', 'metti', 'inserisci', 'metti nel'],
    en: ['add', 'put', 'place', 'insert'],
    es: ['añadir', 'agregar', 'poner', 'meter'],
    pt: ['adicionar', 'colocar', 'inserir', 'botar']
  }
  
  const removeActions = {
    it: ['rimuovi', 'togli', 'elimina', 'leva'],
    en: ['remove', 'delete', 'take out', 'clear'],
    es: ['quitar', 'eliminar', 'sacar', 'borrar'],
    pt: ['remover', 'tirar', 'eliminar', 'apagar']
  }
  
  const viewActions = {
    it: ['vedi', 'mostra', 'visualizza', 'guarda'],
    en: ['show', 'view', 'see', 'display', 'what\'s in'],
    es: ['ver', 'mostrar', 'enseñar', 'visualizar'],
    pt: ['ver', 'mostrar', 'visualizar', 'exibir']
  }
  
  // Detect language based on cart keywords
  let detectedLanguage: 'it' | 'en' | 'es' | 'pt' | 'unknown' = 'unknown'
  let hasCartKeyword = false
  
  for (const [lang, keywords] of Object.entries(cartKeywords)) {
    if (keywords.some(keyword => normalizedQuery.includes(keyword))) {
      detectedLanguage = lang as 'it' | 'en' | 'es' | 'pt'
      hasCartKeyword = true
      break
    }
  }
  
  // 🚫 NO CART INTENT: If no cart keyword found, return early
  if (!hasCartKeyword) {
    return {
      hasCartIntent: false,
      action: null,
      confidence: 0,
      language: 'unknown'
    }
  }
  
  // Detect action type
  let action: 'add' | 'remove' | 'view' | null = null
  let confidence = 0.5 // Base confidence for having cart keyword
  
  if (detectedLanguage !== 'unknown') {
    // Check for add actions
    if (addActions[detectedLanguage].some(actionWord => normalizedQuery.includes(actionWord))) {
      action = 'add'
      confidence = 0.9
    }
    // Check for remove actions
    else if (removeActions[detectedLanguage].some(actionWord => normalizedQuery.includes(actionWord))) {
      action = 'remove'
      confidence = 0.9
    }
    // Check for view actions
    else if (viewActions[detectedLanguage].some(actionWord => normalizedQuery.includes(actionWord))) {
      action = 'view'
      confidence = 0.8
    }
    // If cart keyword but no clear action, assume view
    else {
      action = 'view'
      confidence = 0.6
    }
  }
  
  // Extract quantity (numbers like "2", "due", "dos", etc.)
  const quantityMatch = normalizedQuery.match(/(\d+|uno|due|tre|quattro|cinque|one|two|three|four|five|six|seven|eight|nine|ten|dos|tres|cuatro|cinco|dois|três|quatro|cinco)/i)
  const extractedQuantity = quantityMatch ? parseQuantityToNumber(quantityMatch[1]) : undefined
  
  // Extract potential product name (everything after action words, excluding cart keywords)
  let extractedProduct: string | undefined
  if (action === 'add' && detectedLanguage !== 'unknown') {
    const actionWords = addActions[detectedLanguage]
    for (const actionWord of actionWords) {
      const actionIndex = normalizedQuery.indexOf(actionWord)
      if (actionIndex !== -1) {
        let productPart = normalizedQuery.substring(actionIndex + actionWord.length).trim()
        
        // Remove cart keywords from product name
        for (const cartKeyword of cartKeywords[detectedLanguage]) {
          productPart = productPart.replace(cartKeyword, '').trim()
        }
        
        // Clean up prepositions and articles
        productPart = productPart.replace(/^(al|nel|to|in|a|the|la|il|lo|en|no|ao)\s+/i, '').trim()
        
        if (productPart.length > 2) {
          extractedProduct = productPart
          break
        }
      }
    }
  }
  
  return {
    hasCartIntent: true,
    action,
    confidence,
    language: detectedLanguage,
    extractedQuantity,
    extractedProduct
  }
}

/**
 * Convert word numbers to actual numbers
 */
function parseQuantityToNumber(quantityStr: string): number {
  const wordToNumber: Record<string, number> = {
    'uno': 1, 'one': 1, 'un': 1, 'uma': 1,
    'due': 2, 'two': 2, 'dos': 2, 'dois': 2,
    'tre': 3, 'three': 3, 'tres': 3, 'três': 3,
    'quattro': 4, 'four': 4, 'cuatro': 4, 'quatro': 4,
    'cinque': 5, 'five': 5, 'cinco': 5,
    'sei': 6, 'six': 6, 'seis': 6,
    'sette': 7, 'seven': 7, 'siete': 7, 'sete': 7,
    'otto': 8, 'eight': 8, 'ocho': 8, 'oito': 8,
    'nove': 9, 'nine': 9, 'nueve': 9, 'novePt': 9,
    'dieci': 10, 'ten': 10, 'diez': 10, 'dez': 10
  }
  
  const normalized = quantityStr.toLowerCase()
  return wordToNumber[normalized] || parseInt(quantityStr) || 1
}

/**
 * Validate if cart intent detection should trigger cart operations
 */
export function shouldTriggerCartOperation(intent: CartIntentResult): boolean {
  return intent.hasCartIntent && 
         intent.action === 'add' && 
         intent.confidence >= 0.8 &&
         intent.extractedProduct && 
         intent.extractedProduct.length > 2
}

/**
 * Handle automatic cart operations triggered by SearchRAG
 * Now with context memory and race condition protection
 */
export async function handleAutomaticCartOperation(
  intent: CartIntentResult,
  customerId: string,
  workspaceId: string,
  productResults: any[]
): Promise<any> {
  try {
    logger.info(`🛒 Cart operation: ${intent.action} for customer ${customerId}`)

    if (!intent.hasCartIntent || intent.action !== 'add' || !intent.extractedProduct) {
      return {
        success: false,
        message: 'No valid cart operation detected'
      }
    }

    // 🔒 Execute with race condition protection
    return await cartLockManager.executeWithLock(
      customerId,
      workspaceId,
      'add',
      async () => {
        // Save product list for disambiguation context
        conversationContext.saveProductList(
          customerId,
          workspaceId,
          productResults.map(p => ({
            id: p.id,
            name: p.name || p.title,
            price: p.price || p.finalPrice || 0,
            stock: p.stock || 0,
            ProductCode: p.ProductCode,
            sku: p.sku,
            description: p.description,
            category: p.category ? {
              id: p.category.id,
              name: p.category.name
            } : undefined
          })),
          intent.extractedProduct
        )

        // Find matching product
        const matchingProduct = findBestProductMatch(intent.extractedProduct, productResults)

        if (!matchingProduct) {
          return {
            success: false,
            message: `Product "${intent.extractedProduct}" not found`,
            needsDisambiguation: productResults.length > 1,
            availableProducts: productResults.slice(0, 3)
          }
        }

        // Check stock availability
        if ((matchingProduct.stock || 0) <= 0) {
          const result = {
            success: false,
            message: `Product "${matchingProduct.name}" is out of stock`,
            product: matchingProduct
          }
          
          // Save failed operation for context
          conversationContext.saveCartOperation(customerId, workspaceId, {
            success: false,
            operation: 'add',
            message: result.message
          })
          
          return result
        }

        const quantity = intent.extractedQuantity || 1

        // Execute cart operation in database
        const cartResult = await performCartAddOperation(
          customerId,
          workspaceId,
          matchingProduct,
          quantity
        )

        // 🔄 Synchronize cart state after operation
        await cartStateSynchronizer.syncCartState(
          customerId,
          workspaceId,
          'auto_add',
          cartResult
        )

        return cartResult
      }
    )

  } catch (error) {
    logger.error('❌ Error in handleAutomaticCartOperation:', error)
    
    // Save failed operation for context
    conversationContext.saveCartOperation(customerId, workspaceId, {
      success: false,
      operation: 'add',
      message: `Error: ${error.message}`
    })
    
    throw error
  }
}

/**
 * Perform the actual cart add operation
 */
async function performCartAddOperation(
  customerId: string,
  workspaceId: string,
  product: any,
  quantity: number
): Promise<any> {
  // Get or create cart
  let cart = await prisma.carts.findFirst({
    where: {
      customerId: customerId,
      workspaceId: workspaceId
    },
    include: {
      items: true
    }
  })

  if (!cart) {
    cart = await prisma.carts.create({
      data: {
        customerId: customerId,
        workspaceId: workspaceId
      },
      include: {
        items: true
      }
    })
  }

  // Check if product already exists in cart
  const existingItem = cart.items.find(item => item.productId === product.id)

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity
    
    // Check if new quantity exceeds stock
    if (newQuantity > (product.stock || 0)) {
      return {
        success: false,
        message: `Cannot add ${quantity} more ${product.name}. Only ${(product.stock || 0) - existingItem.quantity} available.`,
        product: product,
        currentQuantity: existingItem.quantity,
        requestedQuantity: quantity,
        availableStock: product.stock || 0
      }
    }

    // Update existing item
    await prisma.cartItems.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity }
    })
  } else {
    // Add new item to cart
    if (quantity > (product.stock || 0)) {
      return {
        success: false,
        message: `Cannot add ${quantity}x ${product.name}. Only ${product.stock || 0} available.`,
        product: product,
        requestedQuantity: quantity,
        availableStock: product.stock || 0
      }
    }

    await prisma.cartItems.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity: quantity
      }
    })
  }

  // Get updated cart
  const updatedCart = await prisma.carts.findFirst({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  const result = {
    success: true,
    message: `Added ${quantity}x ${product.name} to cart`,
    addedProduct: {
      id: product.id,
      name: product.name,
      quantity: quantity,
      price: product.price || product.finalPrice || 0,
      total: (product.price || product.finalPrice || 0) * quantity
    },
    cart: updatedCart,
    cartTotal: updatedCart?.items.reduce((total, item) => 
      total + ((item.product.price || 0) * item.quantity), 0
    ) || 0
  }

  // Save successful operation for context
  conversationContext.saveCartOperation(customerId, workspaceId, {
    success: true,
    operation: 'add',
    message: result.message,
    addedProduct: result.addedProduct,
    cart: {
      items: updatedCart?.items || [],
      total: result.cartTotal,
      count: updatedCart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
    }
  })

  return result
}

/**
 * Handle product disambiguation using conversation context
 */
export async function handleProductDisambiguation(
  customerId: string,
  workspaceId: string,
  productReference: string,
  quantity: number = 1
): Promise<any> {
  // Get product from context
  const selectedProduct = conversationContext.getProductByReference(
    customerId,
    workspaceId,
    productReference
  )

  if (!selectedProduct) {
    return {
      success: false,
      message: 'No products available for selection. Please search for products first.',
      needsNewSearch: true
    }
  }

  // Execute cart operation with race condition protection
  return await cartLockManager.executeWithLock(
    customerId,
    workspaceId,
    'add',
    async () => {
      const result = await performCartAddOperation(
        customerId,
        workspaceId,
        selectedProduct,
        quantity
      )

      // Synchronize cart state
      await cartStateSynchronizer.syncCartState(
        customerId,
        workspaceId,
        'disambiguation_add',
        result
      )

      return result
    }
  )
}

/**
 * Find best matching product from search results
 */
function findBestProductMatch(searchProduct: string, productResults: any[]): any | null {
  if (productResults.length === 0) return null
  
  const normalizedSearch = searchProduct.toLowerCase().trim()
  
  // First try exact name match
  let exactMatch = productResults.find(p => 
    (p.name || p.title || '').toLowerCase().includes(normalizedSearch)
  )
  
  if (exactMatch) return exactMatch
  
  // Then try partial matches or keywords
  const partialMatch = productResults.find(p => {
    const productName = (p.name || p.title || '').toLowerCase()
    const searchWords = normalizedSearch.split(' ')
    return searchWords.some(word => word.length > 2 && productName.includes(word))
  })
  
  if (partialMatch) return partialMatch
  
  // Default to first result if no good match
  return productResults[0]
}
