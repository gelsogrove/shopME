import { PrismaClient } from '@prisma/client'
import { CheckoutService } from '../../application/services/checkout.service'

const checkoutService = new CheckoutService()

const prisma = new PrismaClient()

export interface GenerateCartLinkParams {
  // No parameters needed - just generate a cart link for the current customer
}

export interface GenerateCartLinkResult {
  success: boolean
  message: string
  cartLink?: string
  error?: string
}

/**
 * Generate a secure cart link for the customer to manage their cart
 * This creates a token that allows access to the cart management page
 */
export async function generateCartLink(
  params: GenerateCartLinkParams,
  customerId: string,
  workspaceId: string,
  phone?: string
): Promise<GenerateCartLinkResult> {
  try {
    console.log(
      `[GENERATE_CART_LINK] Generating cart link for customer ${customerId} in workspace ${workspaceId}`
    )

    // Get workspace info
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    })

    if (!workspace) {
      return {
        success: false,
        message: 'Workspace not found',
        error: 'Workspace not found'
      }
    }

    // 🔧 USE WORKING ENDPOINT: /api/cart/generate-token instead of CheckoutService
    const axios = require('axios')
    
    console.log("🔧 GENERATE_CART_LINK: Using /api/cart/generate-token endpoint")
    console.log("🔧 GENERATE_CART_LINK: Parameters:", { customerId, workspaceId })
    
    const tokenResponse = await axios.post('http://localhost:3001/api/cart/generate-token', {
      customerId,
      workspaceId,
      expiresInMinutes: 60
    })

    if (!tokenResponse.data.success) {
      console.log("❌ GENERATE_CART_LINK: Token generation failed:", tokenResponse.data)
      return {
        success: false,
        message: tokenResponse.data.error || 'Failed to generate cart token',
        error: tokenResponse.data.error || 'Failed to generate cart token'
      }
    }

    console.log("✅ GENERATE_CART_LINK: Token generated successfully:", tokenResponse.data.token)
    const token = tokenResponse.data.token

    // Determine base URL
    const baseUrl = workspace.url || process.env.FRONTEND_URL || 'http://localhost:3000'
    const cartLink = `${baseUrl}/checkout?token=${token}`

    // Create localized message based on workspace language
    const language = workspace.language || 'it'
    
    let message = ''
    switch (language) {
      case 'en':
        message = `🛒 **Manage your cart directly with our web system:**

🔗 **Access your cart here:**
${cartLink}

From here you can:
• Add products to cart
• Modify quantities  
• Remove products
• View total
• Proceed to checkout

It's much simpler and faster! 😊`
        break
      case 'es':
        message = `🛒 **Gestiona tu carrito directamente con nuestro sistema web:**

🔗 **Accede a tu carrito aquí:**
${cartLink}

Desde aquí puedes:
• Añadir productos al carrito
• Modificar cantidades  
• Eliminar productos
• Ver el total
• Proceder al checkout

¡Es mucho más simple y rápido! 😊`
        break
      case 'pt':
        message = `🛒 **Gerencie seu carrinho diretamente com nosso sistema web:**

🔗 **Acesse seu carrinho aqui:**
${cartLink}

A partir daqui você pode:
• Adicionar produtos ao carrinho
• Modificar quantidades  
• Remover produtos
• Ver o total
• Prosseguir para o checkout

É muito mais simples e rápido! 😊`
        break
      default: // Italian
        message = `🛒 **Gestisci il tuo carrello direttamente con il nostro sistema web:**

🔗 **Accedi al tuo carrello qui:**
${cartLink}

Da qui puoi:
• Aggiungere prodotti al carrello
• Modificare le quantità  
• Rimuovere prodotti
• Visualizzare il totale
• Procedere al checkout

È molto più semplice e veloce! 😊`
        break
    }

    console.log(
      `[GENERATE_CART_LINK] Successfully generated cart link for customer ${customerId}`
    )

    return {
      success: true,
      message,
      cartLink
    }

  } catch (error) {
    console.error(
      `[GENERATE_CART_LINK] Error generating cart link for customer ${customerId}:`,
      error
    )

    return {
      success: false,
      message: 'Failed to generate cart link',
      error: 'Failed to generate cart link'
    }
  }
}

export const generateCartLinkFunction = {
  name: "generateCartLink",
  description: "Generate a secure cart link for the customer to manage their cart. Use this when the customer wants to add, remove, modify, or view their cart items.",
  parameters: {
    type: "object",
    properties: {},
    required: []
  }
}
