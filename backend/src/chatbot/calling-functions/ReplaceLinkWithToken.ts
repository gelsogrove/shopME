/**
 * ReplaceLinkWithToken Calling Function
 * 
 * Handles replacement of [LINK_WITH_TOKEN] placeholders with actual generated links
 * Supports cart, profile, orders, tracking, and checkout links
 */


interface ReplaceLinkWithTokenParams {
  response: string
  linkType?: 'cart' | 'profile' | 'orders' | 'tracking' | 'checkout' | 'auto'
  context?: 'offers' | 'services' | 'auto'
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
    const { response, linkType = 'auto', context = 'auto' } = params
    
    const hasCartToken = response.includes('[LINK_CART_WITH_TOKEN]')
    const hasProfileToken = response.includes('[LINK_PROFILE_WITH_TOKEN]')
    const hasOrdersToken = response.includes('[LINK_ORDERS_WITH_TOKEN]')
    const hasTrackingToken = response.includes('[LINK_TRACKING_WITH_TOKEN]')
    const hasCheckoutToken = response.includes('[LINK_CHECKOUT_WITH_TOKEN]')
    const hasLastOrderInvoiceToken = response.includes('[LINK_LAST_ORDER_INVOICE_WITH_TOKEN]')
    const hasUserDiscountToken = response.includes('[USER_DISCOUNT]')
    const hasListOffersToken = response.includes('[LIST_OFFERS]')
    const hasListActiveOffersToken = response.includes('[LIST_ACTIVE_OFFERS]')
    const hasListAllProductsToken = response.includes('[LIST_ALL_PRODUCTS]')
    const hasListServicesToken = response.includes('[LIST_SERVICES]')
    const hasListCategoriesToken = response.includes('[LIST_CATEGORIES]')
    
    if (!hasCartToken && !hasProfileToken && !hasOrdersToken && !hasTrackingToken && !hasCheckoutToken && !hasLastOrderInvoiceToken && !hasUserDiscountToken && !hasListOffersToken && !hasListActiveOffersToken && !hasListAllProductsToken && !hasListServicesToken && !hasListCategoriesToken) {
      return {
        success: false,
        error: "Response does not contain any replaceable tokens"
      }
    }
    
    if (!customerId || !workspaceId) {
      return {
        success: false,
        error: "Missing customerId or workspaceId"
      }
    }

    let replacedResponse = response

    // Handle cart token - Redirect to web
    if (hasCartToken) {
      replacedResponse = replacedResponse.replace(/\[LINK_CART_WITH_TOKEN\]/g, "https://laltrait.com/cart")
    }

    // Handle profile token
    if (hasProfileToken) {
      try {
        const { PrismaClient } = require('@prisma/client')
        const prisma = new PrismaClient()
        
        const customer = await prisma.customers.findFirst({
          where: {
            id: customerId,
            workspaceId: workspaceId
          },
          select: {
            id: true,
            name: true,
            email: true
          }
        })
        
        if (customer) {
          const profileToken = Buffer.from(`${customerId}:${workspaceId}:${Date.now()}`).toString('base64')
          const profileLink = `http://localhost:3000/profile-public?token=${profileToken}`
          replacedResponse = replacedResponse.replace(/\[LINK_PROFILE_WITH_TOKEN\]/g, profileLink)
        } else {
          replacedResponse = replacedResponse.replace(/\[LINK_PROFILE_WITH_TOKEN\]/g, "Link del profilo non disponibile")
        }
        
        await prisma.$disconnect()
      } catch (error) {
        console.error("❌ Error generating profile link:", error)
        replacedResponse = replacedResponse.replace(/\[LINK_PROFILE_WITH_TOKEN\]/g, "Link del profilo non disponibile")
      }
    }

    // Handle orders token
    if (hasOrdersToken) {
      try {
        const { SecureTokenService } = require('../../application/services/secure-token.service')
        const secureTokenService = new SecureTokenService()
        
        const ordersToken = await secureTokenService.createToken(
          'orders',
          workspaceId,
          { customerId, workspaceId },
          '1h',
          undefined,
          undefined,
          undefined,
          customerId
        )
        
        const ordersLink = `http://localhost:3000/orders-public?token=${ordersToken}`
        replacedResponse = replacedResponse.replace(/\[LINK_ORDERS_WITH_TOKEN\]/g, ordersLink)
      } catch (error) {
        console.error("❌ Error generating orders link:", error)
        replacedResponse = replacedResponse.replace(/\[LINK_ORDERS_WITH_TOKEN\]/g, "Link degli ordini non disponibile")
      }
    }

    // Handle tracking token
    if (hasTrackingToken) {
      try {
        const { SecureTokenService } = require('../../application/services/secure-token.service')
        const secureTokenService = new SecureTokenService()
        
        const trackingToken = await secureTokenService.createToken(
          'orders',
          workspaceId,
          { customerId, workspaceId },
          '1h',
          undefined,
          undefined,
          undefined,
          customerId
        )
        
        const trackingLink = `http://localhost:3000/tracking-public?token=${trackingToken}`
        replacedResponse = replacedResponse.replace(/\[LINK_TRACKING_WITH_TOKEN\]/g, trackingLink)
      } catch (error) {
        console.error("❌ Error generating tracking link:", error)
        replacedResponse = replacedResponse.replace(/\[LINK_TRACKING_WITH_TOKEN\]/g, "Link di tracking non disponibile")
      }
    }

    // Handle checkout token
    if (hasCheckoutToken) {
      try {
        const { SecureTokenService } = require('../../application/services/secure-token.service')
        const secureTokenService = new SecureTokenService()
        
        const checkoutToken = await secureTokenService.createToken(
          'checkout',
          workspaceId,
          { customerId, workspaceId },
          '1h',
          undefined,
          undefined,
          undefined,
          customerId
        )
        
        const checkoutLink = `http://localhost:3000/checkout?token=${checkoutToken}`
        replacedResponse = replacedResponse.replace(/\[LINK_CHECKOUT_WITH_TOKEN\]/g, checkoutLink)
      } catch (error) {
        console.error("❌ Error generating checkout link:", error)
        replacedResponse = replacedResponse.replace(/\[LINK_CHECKOUT_WITH_TOKEN\]/g, "Link di checkout non disponibile")
      }
    }

    // Handle discount, offers, products, services and categories tokens
    if (hasUserDiscountToken || hasListOffersToken || hasListActiveOffersToken || hasListAllProductsToken || hasListServicesToken || hasListCategoriesToken) {
      let userDiscount = "0%"
      if (hasUserDiscountToken) {
        try {
          const { PrismaClient } = require('@prisma/client')
          const prisma = new PrismaClient()
          
          const customer = await prisma.customers.findFirst({
            where: {
              id: customerId,
              workspaceId: workspaceId
            },
            select: {
              id: true,
              name: true,
              discount: true
            }
          })
          
          if (customer && customer.discount > 0) {
            userDiscount = `${customer.discount}%`
          } else {
            userDiscount = "0%"
          }
          
          await prisma.$disconnect()
        } catch (error) {
          console.error("❌ Error getting customer discount:", error)
          userDiscount = "0%"
        }
      }
      
      let listOffers = "Nessuna offerta attiva al momento"
      let listActiveOffers = "Nessuna offerta attiva al momento"
      let listAllProducts = "Nessun prodotto disponibile al momento"
      let listServices = "Nessun servizio disponibile al momento"
      let listCategories = "Nessuna categoria disponibile al momento"
      
      if (hasListCategoriesToken) {
        try {
          const { PrismaClient } = require('@prisma/client')
          const prisma = new PrismaClient()
          
          const categories = await prisma.categories.findMany({
            where: {
              workspaceId: workspaceId
            },
            select: {
              name: true,
              description: true
            },
            take: 10
          })
          
          if (categories.length > 0) {
            listCategories = categories.map(category => 
              `• ${category.name}${category.description ? ` - ${category.description}` : ''}`
            ).join('\n')
          } else {
            listCategories = "Nessuna categoria disponibile al momento"
          }
          
          await prisma.$disconnect()
        } catch (error) {
          console.error("❌ Error getting categories:", error)
          listCategories = "Nessuna categoria disponibile al momento"
        }
      }
      
      if (hasListServicesToken) {
        try {
          const { PrismaClient } = require('@prisma/client')
          const prisma = new PrismaClient()
          
          const services = await prisma.services.findMany({
            where: {
              workspaceId: workspaceId
            },
            select: {
              name: true,
              description: true,
              price: true,
              currency: true
            },
            take: 5
          })
          
          if (services.length > 0) {
            listServices = services.map(service => 
              `• ${service.name}: ${service.price} ${service.currency} - ${service.description}`
            ).join('\n')
          } else {
            listServices = "Nessun servizio disponibile al momento"
          }
          
          await prisma.$disconnect()
        } catch (error) {
          console.error("❌ Error getting services:", error)
          listServices = "Nessun servizio disponibile al momento"
        }
      }
      
      if (hasListAllProductsToken) {
        try {
          const { PrismaClient } = require('@prisma/client')
          const prisma = new PrismaClient()
          
          // Get all products grouped by category
          const products = await prisma.products.findMany({
            where: {
              workspaceId: workspaceId,
              isActive: true
            },
            select: {
              name: true,
              price: true,
              currency: true,
              category: {
                select: {
                  name: true
                }
              }
            },
            take: 20
          })
          
          if (products.length > 0) {
            // Group products by category
            const groupedProducts = products.reduce((acc, product) => {
              const categoryName = product.category?.name || 'Other'
              if (!acc[categoryName]) {
                acc[categoryName] = []
              }
              acc[categoryName].push(product)
              return acc
            }, {} as Record<string, typeof products>)
            
            // Format products by category
            listAllProducts = Object.entries(groupedProducts).map(([category, categoryProducts]) => {
              const categoryProductsList = (categoryProducts as any[]).map(product => 
                `  • ${product.name}: ${product.price} ${product.currency}`
              ).join('\n')
              return `**${category}:**\n${categoryProductsList}`
            }).join('\n\n')
          } else {
            listAllProducts = "Nessun prodotto disponibile al momento"
          }
          
          await prisma.$disconnect()
        } catch (error) {
          console.error("❌ Error getting all products:", error)
          listAllProducts = "Nessun prodotto disponibile al momento"
        }
      }
      
      if (hasListActiveOffersToken) {
        try {
          const { PrismaClient } = require('@prisma/client')
          const prisma = new PrismaClient()
          
          // Get active offers
          const activeOffers = await prisma.offers.findMany({
            where: {
              workspaceId: workspaceId,
              isActive: true,
              startDate: { lte: new Date() },
              endDate: { gte: new Date() }
            },
            select: {
              name: true,
              description: true,
              discountPercent: true
            },
            take: 5
          })
          
          if (activeOffers.length > 0) {
            listActiveOffers = activeOffers.map(offer => 
              `• ${offer.name}: ${offer.discountPercent}% di sconto - ${offer.description}`
            ).join('\n')
          } else {
            listActiveOffers = "Nessuna offerta attiva al momento"
          }
          
          await prisma.$disconnect()
        } catch (error) {
          console.error("❌ Error getting active offers:", error)
          listActiveOffers = "Nessuna offerta attiva al momento"
        }
      }
      
      if (hasListOffersToken) {
        try {
          const { PrismaClient } = require('@prisma/client')
          const prisma = new PrismaClient()
          
          // Get offers (default behavior)
          const activeOffers = await prisma.offers.findMany({
            where: {
              workspaceId: workspaceId,
              isActive: true,
              startDate: { lte: new Date() },
              endDate: { gte: new Date() }
            },
            select: {
              name: true,
              description: true,
              discountPercent: true
            },
            take: 3
          })
          
          if (activeOffers.length > 0) {
            listOffers = activeOffers.map(offer => 
              `• ${offer.name}`
            ).join('\n')
          } else {
            listOffers = "Nessuna offerta attiva al momento"
          }
          
          await prisma.$disconnect()
        } catch (error) {
          console.error("❌ Error getting data:", error)
          listOffers = context === 'services' ? "Nessun servizio disponibile al momento" : "Nessuna offerta attiva al momento"
        }
      }
      
      replacedResponse = replacedResponse
        .replace(/\[USER_DISCOUNT\]/g, userDiscount)
        .replace(/\[LIST_OFFERS\]/g, listOffers)
        .replace(/\[LIST_ACTIVE_OFFERS\]/g, listActiveOffers)
        .replace(/\[LIST_ALL_PRODUCTS\]/g, listAllProducts)
        .replace(/\[LIST_SERVICES\]/g, listServices)
        .replace(/\[LIST_CATEGORIES\]/g, listCategories)
    }

    return {
      success: true,
      response: replacedResponse,
      linkType: linkType
    }

  } catch (error) {
    console.error("❌ ReplaceLinkWithToken error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}