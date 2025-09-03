import { Router, Request, Response } from 'express';
import { SearchService } from '../services/searchService';
import { embeddingService } from '../services/embeddingService';
import { PriceCalculationService } from '../application/services/price-calculation.service';
import { prisma } from '../lib/prisma';
import logger from '../utils/logger';

const router = Router();

/**
 * Internal API routes for N8N calling functions
 */

/**
 * RAG Search endpoint with price calculation
 */
router.post('/rag-search', async (req: Request, res: Response) => {
  try {
    const { query, workspaceId, customerId } = req.body;

    if (!query || !workspaceId) {
      return res.status(400).json({
        success: false,
        message: 'Query and workspaceId are required'
      });
    }

    logger.info(`🔍 Internal RAG Search: "${query}" for workspace ${workspaceId}`);

    // Search across all content types with pricing
    const [productResults, faqResults, serviceResults] = await Promise.all([
      embeddingService.searchProducts(query, workspaceId, 5),
      embeddingService.searchFAQs(query, workspaceId, 5),
      embeddingService.searchServices(query, workspaceId, 5)
    ]);

    // Apply pricing calculation to products if any found
    let enhancedProductResults = productResults;
    if (productResults.length > 0) {
      try {
        // Get customer discount if available
        let customerDiscount = 0;
        if (customerId) {
          const customer = await prisma.customers.findUnique({
            where: { id: customerId },
            select: { discount: true }
          });
          customerDiscount = customer?.discount || 0;
        }

        // Calculate prices with discounts
        const priceService = new PriceCalculationService(prisma);
        const productIds = productResults.map(p => p.id).filter(Boolean);
        
        if (productIds.length > 0) {
          const priceResult = await priceService.calculatePricesWithDiscounts(
            workspaceId, 
            productIds, 
            customerDiscount
          );

          // Enhance results with calculated prices
          enhancedProductResults = productResults.map(result => {
            const priceData = priceResult.products.find(p => p.id === result.id);
            if (priceData) {
              return {
                ...result,
                price: priceData.finalPrice || priceData.price,
                originalPrice: priceData.originalPrice,
                hasDiscount: (priceData.appliedDiscount || 0) > 0,
                discountPercent: priceData.appliedDiscount,
                discountSource: priceData.discountSource
              };
            }
            return result;
          });
        }
      } catch (priceError) {
        logger.error('Error calculating prices for RAG search:', priceError);
        // Continue with original results if pricing fails
      }
    }

    const allResults = [
      ...enhancedProductResults.map(r => ({ ...r, type: 'product' })),
      ...faqResults.map(r => ({ ...r, type: 'faq' })),
      ...serviceResults.map(r => ({ ...r, type: 'service' }))
    ];

    logger.info(`✅ RAG Search completed: ${allResults.length} results found`);

    return res.json({
      success: true,
      results: {
        products: enhancedProductResults,
        faqs: faqResults,
        services: serviceResults,
        total: allResults.length
      },
      query,
      workspaceId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in internal RAG search:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get all products with pricing
 */
router.post('/get-all-products', async (req: Request, res: Response) => {
  try {
    const { workspaceId, customerId, search } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: 'WorkspaceId is required'
      });
    }

    // Get customer discount if available
    let customerDiscount = 0;
    if (customerId) {
      const customer = await prisma.customers.findUnique({
        where: { id: customerId },
        select: { discount: true }
      });
      customerDiscount = customer?.discount || 0;
    }

    // Calculate prices with discounts
    const priceService = new PriceCalculationService(prisma);
    const priceResult = await priceService.calculatePricesWithDiscounts(
      workspaceId,
      undefined,
      customerDiscount
    );

    logger.info(`✅ GetAllProducts: ${priceResult.products.length} products with pricing calculated`);

    return res.json({
      success: true,
      data: {
        products: priceResult.products,
        discountsApplied: priceResult.discountsApplied
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in get all products:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get active offers
 */
router.post('/get-active-offers', async (req: Request, res: Response) => {
  try {
    const { workspaceId, customerId } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: 'WorkspaceId is required'
      });
    }

    const now = new Date();
    const offers = await prisma.offers.findMany({
      where: {
        workspaceId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      },
      orderBy: { discountPercent: 'desc' }
    });

    logger.info(`✅ GetActiveOffers: ${offers.length} active offers found`);

    return res.json({
      success: true,
      data: {
        offers,
        totalOffers: offers.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in get active offers:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
