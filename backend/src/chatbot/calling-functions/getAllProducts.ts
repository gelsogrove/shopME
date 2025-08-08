import { PrismaClient } from '@prisma/client';
import type { ProductWithPrice } from "../../application/services/price-calculation.service";
import logger from '../../utils/logger';

const prisma = new PrismaClient();

/**
 * Get All Products Calling Function
 * 
 * Ottiene tutti i prodotti disponibili nel workspace
 */

export interface GetAllProductsParams {
  phoneNumber: string;
  workspaceId: string;
  customerId?: string;
  message: string;
}

export interface GetAllProductsResult {
  response: string;
  products: any[];
  totalProducts: number;
}

/**
 * Funzione per ottenere tutti i prodotti
 */
export async function getAllProducts(params: GetAllProductsParams): Promise<GetAllProductsResult> {
  const { phoneNumber, workspaceId, message } = params;
  
  logger.info(`[GET_ALL_PRODUCTS] Getting products for ${phoneNumber} in workspace ${workspaceId}`);
  
  try {
    // Ottieni tutti i prodotti attivi del workspace
    const products = await prisma.products.findMany({
      where: {
        workspaceId,
        isActive: true,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        sku: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    if (!products || products.length === 0) {
      const noProducts = `Non ci sono prodotti disponibili al momento. 😔

Contatta il nostro staff per maggiori informazioni sui prodotti disponibili.`;

      return {
        response: noProducts,
        products: [],
        totalProducts: 0
      };
    }

    // Raggruppa i prodotti per categoria
    const productsByCategory = products.reduce((acc, product) => {
      const categoryName = product.category?.name || 'Senza categoria';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(product);
      return acc;
    }, {} as Record<string, typeof products>);

    // After fetching products, import and use PriceCalculationService:
    const { PriceCalculationService } = await import("../../application/services/price-calculation.service");
    const priceService = new PriceCalculationService(prisma);
    const productIds = products.map((p) => p.id);
    const customerDiscount = params.customerId ? (await prisma.customers.findUnique({ where: { id: params.customerId }, select: { discount: true } }))?.discount || 0 : 0;
    const priceResult = await priceService.calculatePricesWithDiscounts(workspaceId, productIds, customerDiscount);
    const priceMap = new Map(priceResult.products.map(p => [p.id, p]));

    // Formatta i prodotti per la risposta
    const productList = (Object.entries(productsByCategory) as Array<[string, typeof products]>).map(([categoryName, categoryProducts]) => {
      const productItems = categoryProducts.map((product, index) => {
        const priceData = priceMap.get(product.id) as ProductWithPrice | undefined;
        const hasDiscount = (priceData?.appliedDiscount || 0) > 0;
        const prezzoFinale = priceData?.finalPrice ?? product.price;
        const prezzoOriginale = priceData?.originalPrice ?? product.price;
        const scontoPercentuale = priceData?.appliedDiscount || 0;
        const scontoTipo = priceData?.discountSource || null;
        let priceText = `€${prezzoFinale.toFixed(2)}`;
        if (hasDiscount) {
          priceText += ` (scontato del ${scontoPercentuale}%, prezzo pieno €${prezzoOriginale.toFixed(2)}`;
          if (scontoTipo) priceText += `, fonte: ${scontoTipo}`;
          priceText += ")";
        }
        const stockText = product.stock > 0 ? `✅ Disponibile (${product.stock})` : '❌ Esaurito';
        
        return `   ${index + 1}. **${product.name}** - ${priceText} - ${stockText}${product.description ? `\n      _${product.description}_` : ''}`;
      }).join('\n');
      
      return `📂 **${categoryName}**\n${productItems}`;
    }).join('\n\n');

    const productsMessage = `Ecco tutti i nostri prodotti disponibili: 🛍️

${productList}

Dimmi quale prodotto ti interessa o scrivi il nome specifico per maggiori dettagli! 📦`;

    logger.info(`[GET_ALL_PRODUCTS] Found ${products.length} products in ${Object.keys(productsByCategory).length} categories`);
    
    return {
      response: productsMessage,
      products: products.map(product => {
        const priceData = priceMap.get(product.id) as ProductWithPrice | undefined;
        const hasDiscount = (priceData?.appliedDiscount || 0) > 0;
        const prezzoFinale = priceData?.finalPrice ?? product.price;
        const prezzoOriginale = priceData?.originalPrice ?? product.price;
        const scontoPercentuale = priceData?.appliedDiscount || 0;
        const scontoTipo = priceData?.discountSource || null;
        let formatted = `Prezzo: €${prezzoFinale.toFixed(2)}`;
        if (hasDiscount) {
          formatted += ` (scontato del ${scontoPercentuale}%, prezzo pieno €${prezzoOriginale.toFixed(2)}`;
          if (scontoTipo) formatted += `, fonte: ${scontoTipo}`;
          formatted += ")";
        }
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: prezzoFinale,
          originalPrice: prezzoOriginale,
          discountPercent: scontoPercentuale,
          discountSource: scontoTipo,
          stock: product.stock,
          sku: product.sku,
          category: product.category?.name,
          formatted,
        };
      }),
      totalProducts: products.length
    };
    
  } catch (error) {
    logger.error(`[GET_ALL_PRODUCTS] Error getting products:`, error);
    
    const errorMessage = `Si è verificato un errore nel recupero dei prodotti. 😞

Per favore riprova più tardi o contatta il nostro servizio clienti.`;

    return {
      response: errorMessage,
      products: [],
      totalProducts: 0
    };
  }
}

// Export per LangChain function calling
export const getAllProductsFunction = {
  name: 'getAllProducts',
  description: 'Ottiene tutti i prodotti disponibili nel workspace con informazioni su prezzo, stock e categoria',
  parameters: {
    type: 'object',
    properties: {
      phoneNumber: { type: 'string', description: 'Numero telefono utente' },
      workspaceId: { type: 'string', description: 'ID workspace' },
      customerId: { type: 'string', description: 'ID cliente (opzionale)' },
      message: { type: 'string', description: 'Messaggio utente' }
    },
    required: ['phoneNumber', 'workspaceId', 'message']
  },
  handler: getAllProducts
}; 