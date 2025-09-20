import { Request, Response, Router } from "express"
import { PriceCalculationService } from "../application/services/price-calculation.service"
import { prisma } from "../lib/prisma"
import { embeddingService } from "../services/embeddingService"
import logger from "../utils/logger"
// Import public orders routes
import publicOrdersRoutes from "./public-orders.routes"
// Import cart intent detection
import {
  detectCartIntent,
  handleAutomaticCartOperation,
  shouldTriggerCartOperation,
} from "../utils/cart-intent-detector"

const router = Router()

/**
 * Internal API routes for AI function calling
 */

/**
 * RAG Search endpoint with price calculation and cart-awareness
 */
router.post("/rag-search", async (req: Request, res: Response) => {
  try {
    const { query, workspaceId, customerId, welcomeBackMessage } = req.body

    if (!query || !workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Query and workspaceId are required",
      })
    }

    logger.info(
      `🔍 Internal RAG Search: "${query}" for workspace ${workspaceId}`
    )

    // ✨ CART-AWARENESS: Detect cart intent in multiple languages
    const cartIntentResult = detectCartIntent(query)
    logger.info(`🛒 Cart Intent Detection: ${JSON.stringify(cartIntentResult)}`)

    // Determine optional tuning params from request body
    // Increase default top_k to return more results when callers don't specify
    const top_k = typeof req.body.top_k === "number" ? req.body.top_k : 100
    const similarityThreshold =
      typeof req.body.similarityThreshold === "number"
        ? req.body.similarityThreshold
        : undefined

    // Search across all content types with pricing
    const [productResults, faqResults, serviceResults] = await Promise.all([
      embeddingService.searchProducts(
        query,
        workspaceId,
        top_k,
        similarityThreshold
      ),
      embeddingService.searchFAQs(query, workspaceId, top_k),
      embeddingService.searchServices(query, workspaceId, top_k),
    ])

    // Apply pricing calculation to products if any found
    let enhancedProductResults = productResults
    if (productResults.length > 0) {
      try {
        // Get customer discount if available
        let customerDiscount = 0
        if (customerId) {
          const customer = await prisma.customers.findUnique({
            where: { id: customerId },
            select: { discount: true },
          })
          customerDiscount = customer?.discount || 0
        }

        // Calculate prices with discounts
        const priceService = new PriceCalculationService(prisma)
        const productIds = productResults.map((p) => p.id).filter(Boolean)

        if (productIds.length > 0) {
          const priceResult = await priceService.calculatePricesWithDiscounts(
            workspaceId,
            productIds,
            customerDiscount
          )

          // Enhance results with calculated prices
          enhancedProductResults = productResults.map((result) => {
            const priceData = priceResult.products.find(
              (p) => p.id === result.id
            )
            if (priceData) {
              return {
                ...result,
                price: priceData.finalPrice || priceData.price,
                originalPrice: priceData.originalPrice,
                hasDiscount: (priceData.appliedDiscount || 0) > 0,
                discountPercent: priceData.appliedDiscount,
                discountSource: priceData.discountSource,
              }
            }
            return result
          })
        }
      } catch (priceError) {
        logger.error("Error calculating prices for RAG search:", priceError)
        // Continue with original results if pricing fails
      }
    }

    const allResults = [
      ...enhancedProductResults.map((r) => ({ ...r, type: "product" })),
      ...faqResults.map((r) => ({ ...r, type: "faq" })),
      ...serviceResults.map((r) => ({ ...r, type: "service" })),
    ]

    logger.info(`✅ RAG Search completed: ${allResults.length} results found`)

    // ✨ CART-AWARENESS: Handle automatic cart operations
    let cartOperationResult = null
    if (
      shouldTriggerCartOperation(cartIntentResult) &&
      customerId &&
      enhancedProductResults.length > 0
    ) {
      try {
        cartOperationResult = await handleAutomaticCartOperation(
          cartIntentResult,
          customerId,
          workspaceId,
          enhancedProductResults
        )
        logger.info(
          `🛒 Cart operation completed: ${JSON.stringify(cartOperationResult)}`
        )
      } catch (cartError) {
        logger.error("❌ Cart operation failed:", cartError)
        cartOperationResult = {
          success: false,
          error:
            cartError instanceof Error ? cartError.message : "Unknown error",
        }
      }
    }

    // TOKEN-FIRST RULE: If any result (product/faq/service) contains one of the
    // special tokens used by the Formatter ([LIST_ALL_PRODUCTS], [LIST_SERVICES],
    // [LIST_CATEGORIES], [LIST_OFFERS]) then we MUST return ONLY those results and
    // exclude all others. This ensures the Formatter receives the token and can
    // perform the correct replacement/action.
    const SPECIAL_TOKENS = [
      "[LIST_ALL_PRODUCTS]",
      "[LIST_SERVICES]",
      "[LIST_CATEGORIES]",
      "[LIST_OFFERS]",
    ]

    // Helper to check if a content string contains any special token
    const containsSpecialToken = (content: string | undefined) => {
      if (!content) return false
      return SPECIAL_TOKENS.some((t) => content.includes(t))
    }

    // Collect all items that include a special token
    const tokenProducts = enhancedProductResults.filter((p) =>
      containsSpecialToken(p.content)
    )
    const tokenFaqs = faqResults.filter((f) => containsSpecialToken(f.content))
    const tokenServices = serviceResults.filter((s) =>
      containsSpecialToken(s.content)
    )

    const anyTokensFound =
      (tokenProducts && tokenProducts.length > 0) ||
      (tokenFaqs && tokenFaqs.length > 0) ||
      (tokenServices && tokenServices.length > 0)

    if (anyTokensFound) {
      logger.info(
        "🔁 TOKEN-FIRST: special token(s) detected in RAG results. Returning only token items."
      )
      return res.json({
        success: true,
        results: {
          products: tokenProducts,
          faqs: tokenFaqs,
          services: tokenServices,
          total: tokenProducts.length + tokenFaqs.length + tokenServices.length,
        },
        cartIntent: cartIntentResult,
        cartOperation: cartOperationResult,
        welcomeBackMessage: welcomeBackMessage || null,
        query,
        workspaceId,
        timestamp: new Date().toISOString(),
      })
    }

    return res.json({
      success: true,
      results: {
        products: enhancedProductResults,
        faqs: faqResults,
        services: serviceResults,
        total: allResults.length,
      },
      cartIntent: cartIntentResult,
      cartOperation: cartOperationResult,
      welcomeBackMessage: welcomeBackMessage || null, // 🎯 TASK: Include welcome back message
      query,
      workspaceId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error("Error in internal RAG search:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

/**
 * Get all products with pricing
 */
router.post("/get-all-products", async (req: Request, res: Response) => {
  try {
    const { workspaceId, customerId, search } = req.body

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "WorkspaceId is required",
      })
    }

    // Get customer discount if available
    let customerDiscount = 0
    if (customerId) {
      const customer = await prisma.customers.findUnique({
        where: { id: customerId },
        select: { discount: true },
      })
      customerDiscount = customer?.discount || 0
    }

    // Calculate prices with discounts
    const priceService = new PriceCalculationService(prisma)
    const priceResult = await priceService.calculatePricesWithDiscounts(
      workspaceId,
      undefined,
      customerDiscount
    )

    logger.info(
      `✅ GetAllProducts: ${priceResult.products.length} products with pricing calculated`
    )

    return res.json({
      success: true,
      data: {
        products: priceResult.products,
        discountsApplied: priceResult.discountsApplied,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error("Error in get all products:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

/**
 * Get active offers
 */
router.post("/get-active-offers", async (req: Request, res: Response) => {
  try {
    const { workspaceId, customerId } = req.body

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "WorkspaceId is required",
      })
    }

    const now = new Date()
    const offers = await prisma.offers.findMany({
      where: {
        workspaceId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { discountPercent: "desc" },
    })

    return res.json({
      success: true,
      data: {
        offers,
        totalOffers: offers.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error("Error in get active offers:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Mount public orders routes
router.use("/", publicOrdersRoutes)

export default router
