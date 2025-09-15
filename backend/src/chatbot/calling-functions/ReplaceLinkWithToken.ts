/**
 * ReplaceLinkWithToken Calling Function
 * 
 * Handles replacement of [LINK_WITH_TOKEN] placeholders with actual generated links
 * Supports cart, profile, orders, tracking, and checkout links
 */

import { generateCartLink } from './generateCartLink'

interface ReplaceLinkWithTokenParams {
  response: string
  linkType?: 'cart' | 'profile' | 'orders' | 'tracking' | 'checkout' | 'auto'
}

interface ReplaceLinkWithTokenResult {
  success: boolean
  response?: string
  error?: string
  linkType?: string
  generatedLink?: string
}

export async function ReplaceLinkWithToken(
  params: ReplaceLinkWithTokenParams,
  customerId: string,
  workspaceId: string
): Promise<ReplaceLinkWithTokenResult> {
  try {
    console.log("🔗 ReplaceLinkWithToken called with params:", params)
    
    const { response, linkType = 'auto' } = params
    
    // Controlliamo se contiene uno dei token specifici
    const hasCartToken = response.includes('[LINK_CART_WITH_TOKEN]')
    const hasProfileToken = response.includes('[LINK_PROFILE_WITH_TOKEN]')
    const hasOrdersToken = response.includes('[LINK_ORDERS_WITH_TOKEN]')
    const hasTrackingToken = response.includes('[LINK_TRACKING_WITH_TOKEN]')
    const hasCheckoutToken = response.includes('[LINK_CHECKOUT_WITH_TOKEN]')
    
    if (!hasCartToken && !hasProfileToken && !hasOrdersToken && !hasTrackingToken && !hasCheckoutToken) {
      return {
        success: false,
        error: "Response does not contain any LINK_*_WITH_TOKEN"
      }
    }
    
    if (!customerId || !workspaceId) {
      return {
        success: false,
        error: "Missing customerId or workspaceId"
      }
    }
    
    // Determine link type if auto or based on token found
    let finalLinkType = linkType
    if (linkType === 'auto' || linkType === 'cart' || linkType === 'profile' || linkType === 'orders' || linkType === 'tracking' || linkType === 'checkout') {
      // Use the linkType passed from DualLLMService (already detected)
      if (linkType !== 'auto') {
        finalLinkType = linkType
      } else {
        // Fallback auto-detection based on token presence
        if (hasProfileToken) {
          finalLinkType = 'profile'
        } else if (hasOrdersToken) {
          finalLinkType = 'orders'
        } else if (hasTrackingToken) {
          finalLinkType = 'tracking'
        } else if (hasCheckoutToken) {
          finalLinkType = 'checkout'
        } else if (hasCartToken) {
          finalLinkType = 'cart'
        } else {
          finalLinkType = 'cart' // default
        }
      }
    }
    
    console.log(`🔗 Generating ${finalLinkType} link...`)
    
    let generatedLink = ""
    
    // Generate appropriate link based on type
    switch (finalLinkType) {
      case 'profile':
        // const profileResult = await GetCustomerProfileLink({ workspaceId, customerId })
        const profileResult = null // REMOVED - GetCustomerProfileLink deleted
        if (profileResult && profileResult.profileUrl) {
          generatedLink = profileResult.profileUrl
        } else {
          generatedLink = "https://shopme.com/profile?token=ERROR_TOKEN"
        }
        break
        
      case 'orders':
        // 🔧 ORDERS: Generate /orders-public link
        console.log("🔧 REPLACE_LINK_DEBUG: Generating ORDERS link with:", { customerId, workspaceId })
        console.log("🚨 FORCE RELOAD - ENTERING ORDERS CASE!")
        const ordersResult = await generateCartLink({}, customerId, workspaceId)
        console.log("🔧 REPLACE_LINK_DEBUG: generateCartLink result for orders:", ordersResult)
        
        if (ordersResult.success && ordersResult.cartLink) {
          // Replace /checkout with /orders-public in the generated link
          generatedLink = ordersResult.cartLink.replace('/checkout?', '/orders-public?')
          console.log("✅ ORDERS LINK GENERATED:", generatedLink)
        } else {
          generatedLink = "https://shopme.com/orders-public?token=ERROR_TOKEN"
        }
        break

      case 'tracking':
        // 🔧 TRACKING: Generate /tracking link 
        console.log("🔧 REPLACE_LINK_DEBUG: Generating TRACKING link with:", { customerId, workspaceId })
        const trackingResult = await generateCartLink({}, customerId, workspaceId)
        
        if (trackingResult.success && trackingResult.cartLink) {
          // Replace /checkout with /tracking for tracking links
          generatedLink = trackingResult.cartLink.replace('/checkout?', '/tracking?')
          console.log("✅ TRACKING LINK GENERATED:", generatedLink)
        } else {
          generatedLink = "https://shopme.com/tracking?token=ERROR_TOKEN"
        }
        break
        
      case 'checkout':
      case 'cart':
      default:
        // 🔧 CART/CHECKOUT: Use original /checkout link
        console.log("🔧 REPLACE_LINK_DEBUG: Calling generateCartLink with:", { customerId, workspaceId })
        
        const cartResult = await generateCartLink({}, customerId, workspaceId)
        console.log("🔧 REPLACE_LINK_DEBUG: generateCartLink result:", cartResult)
        
        if (cartResult.success && cartResult.cartLink) {
          generatedLink = cartResult.cartLink
          console.log("✅ CART LINK GENERATED:", generatedLink)
        } else {
          generatedLink = "https://shopme.com/cart?token=ERROR_TOKEN"
        }
        break
    }
    
    // Replace [LINK_WITH_TOKEN] with generated link
    // Replace tutti i possibili token con il link generato
    let replacedResponse = response
      .replace(/\[LINK_CART_WITH_TOKEN\]/g, generatedLink)
      .replace(/\[LINK_PROFILE_WITH_TOKEN\]/g, generatedLink)
      .replace(/\[LINK_ORDERS_WITH_TOKEN\]/g, generatedLink)
      .replace(/\[LINK_TRACKING_WITH_TOKEN\]/g, generatedLink)
      .replace(/\[LINK_CHECKOUT_WITH_TOKEN\]/g, generatedLink)
    
    console.log(`✅ ${finalLinkType} link generated:`, generatedLink)
    console.log("✅ [LINK_WITH_TOKEN] replaced successfully")
    
    return {
      success: true,
      response: replacedResponse,
      linkType: finalLinkType,
      generatedLink
    }
    
  } catch (error) {
    console.error("❌ Error in ReplaceLinkWithToken:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}
