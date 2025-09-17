/**
 * GetAllProducts Calling Function
 * 
 * 🚨 REGOLA CRITICA PROMPT: Questa funzione mostra TUTTI i prodotti disponibili
 * - VIETATO RIASSUMERE: NON riassumere, NON abbreviare, NON limitare la lista
 * - FORMATO OBBLIGATORIO: • [CODICE] - Nome Prodotto (Formato) - €prezzo
 * - COMPLETEZZA OBBLIGATORIA: L'utente DEVE vedere OGNI SINGOLO prodotto disponibile
 */

import { prisma } from "../../lib/prisma";
import logger from "../../utils/logger";

export interface GetAllProductsParams {
  phoneNumber: string;
  workspaceId: string;
  customerId?: string;
  message: string;
  language?: string;
}

export interface ProductWithPrice {
  id: string;
  name: string;
  ProductCode: string;
  description: string;
  formato: string;
  price: number;
  stock: number;
  sku: string;
  category: {
    name: string;
  };
  finalPrice?: number;
  originalPrice?: number;
  hasDiscount?: boolean;
  discountPercent?: number;
  discountSource?: string;
}

export interface GetAllProductsResult {
  response: string;
  products: ProductWithPrice[];
  totalProducts: number;
}

/**
 * Funzione per ottenere tutti i prodotti disponibili
 */
export async function GetAllProducts(params: GetAllProductsParams): Promise<GetAllProductsResult> {
  const { phoneNumber, workspaceId, customerId, language = 'it' } = params;
  
  logger.info(`[GET_ALL_PRODUCTS] Getting all products for workspace ${workspaceId}`);
  
  try {
    // Ottieni tutti i prodotti attivi
    const products = await prisma.products.findMany({
      where: {
        workspaceId,
        isActive: true,
        status: 'ACTIVE',
        stock: {
          gt: 0 // Solo prodotti con stock > 0
        }
      },
      select: {
        id: true,
        name: true,
        ProductCode: true,
        description: true,
        formato: true,
        price: true,
        stock: true,
        sku: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    if (!products || products.length === 0) {
      const isItalian = language === 'it';
      const noProducts = isItalian ? 
        `Non ci sono prodotti disponibili al momento. 😔

Prova a controllare più tardi o contatta il nostro staff per maggiori informazioni.` :
        `No products available at the moment. 😔

Please check back later or contact our staff for more information.`;

      return {
        response: noProducts,
        products: [],
        totalProducts: 0
      };
    }

    // Calcola prezzi con sconti
    const { PriceCalculationService } = await import("../../application/services/price-calculation.service");
    const priceService = new PriceCalculationService(prisma);
    const productIds = products.map((p) => p.id);
    const customerDiscount = customerId ? (await prisma.customers.findUnique({ where: { id: customerId }, select: { discount: true } }))?.discount || 0 : 0;
    console.log(`🔧 GET_ALL_PRODUCTS: Customer discount: ${customerDiscount}% for customerId: ${customerId}`);
    const priceResult = await priceService.calculatePricesWithDiscounts(workspaceId, productIds, customerDiscount);
    console.log(`🔧 GET_ALL_PRODUCTS: Price calculation result:`, { 
      totalProducts: priceResult.products.length,
      firstProduct: priceResult.products[0] ? {
        id: priceResult.products[0].id,
        originalPrice: priceResult.products[0].originalPrice,
        finalPrice: priceResult.products[0].finalPrice,
        appliedDiscount: priceResult.products[0].appliedDiscount
      } : null
    });
    const priceMap = new Map(priceResult.products.map(p => [p.id, p]));

    // Combina prodotti con prezzi calcolati
    const productsWithPrices: ProductWithPrice[] = products.map(product => {
      const priceData = priceMap.get(product.id);
      return {
        ...product,
        finalPrice: priceData?.finalPrice || product.price,
        originalPrice: priceData?.originalPrice || product.price,
        hasDiscount: (priceData?.appliedDiscount || 0) > 0,
        discountPercent: priceData?.appliedDiscount || 0,
        discountSource: priceData?.discountSource
      };
    });

    // Raggruppa prodotti per categoria
    const groupedProducts = productsWithPrices.reduce((acc, product) => {
      const categoryName = product.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(product);
      return acc;
    }, {} as Record<string, ProductWithPrice[]>);

    // Formatta la risposta per categoria
    const isItalian = language === 'it';
    let response = isItalian ? 
      `Ecco tutti i nostri prodotti disponibili:\n\n` : 
      `Here are all our available products:\n\n`;
    let totalFormattedProducts = 0;
    
    Object.entries(groupedProducts).forEach(([categoryName, categoryProducts]) => {
      response += `**${categoryName}:**\n`;
      
      categoryProducts.forEach(product => {
        const code = product.ProductCode ? `[${product.ProductCode}]` : '';
        const format = product.formato ? ` (${product.formato})` : '';
        const price = product.hasDiscount ? 
          `€${product.finalPrice} ~~€${product.originalPrice}~~` : 
          `€${product.finalPrice}`;
        
        response += `• ${code} ${product.name}${format} - ${price}\n`;
        totalFormattedProducts++;
      });
      
      response += `\n`;
    });
    
    console.log(`🔧 GET_ALL_PRODUCTS: Formatted ${totalFormattedProducts} products out of ${productsWithPrices.length}`);

    response += `\n📦 ${isItalian ? 'Totale prodotti' : 'Total products'}: ${productsWithPrices.length}`;

    logger.info(`[GET_ALL_PRODUCTS] Successfully retrieved ${productsWithPrices.length} products`);
    console.log(`🔧 GET_ALL_PRODUCTS: Retrieved ${productsWithPrices.length} products, response length: ${response.length}`);

    return {
      response,
      products: productsWithPrices,
      totalProducts: productsWithPrices.length
    };

  } catch (error) {
    logger.error(`[GET_ALL_PRODUCTS] Error getting all products:`, error);
    
    const isItalian = language === 'it';
    return {
      response: isItalian ? 
        "Mi dispiace, si è verificato un errore nel recuperare i prodotti. Riprova più tardi." :
        "Sorry, there was an error retrieving the products. Please try again later.",
      products: [],
      totalProducts: 0
    };
  }
}

// Export per LangChain function calling
export const getAllProductsFunction = {
  name: 'GetAllProducts',
  description: 'Ottiene tutti i prodotti disponibili con informazioni complete su prezzo, stock e formato',
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
  handler: GetAllProducts
};
