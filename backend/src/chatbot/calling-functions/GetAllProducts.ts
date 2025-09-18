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

// Funzione per ottenere emoji categoria (dinamica dal nome, non hardcoded)
function getCategoryEmoji(categoryName: string): string {
  const name = categoryName.toLowerCase();
  if (name.includes('cheese') || name.includes('dairy') || name.includes('formagg')) return '🧀';
  if (name.includes('meat') || name.includes('salumi') || name.includes('cured')) return '🥩';
  if (name.includes('pasta') || name.includes('rice') || name.includes('riso')) return '🍝';
  if (name.includes('tomato') || name.includes('sauce') || name.includes('conserve')) return '🍅';
  if (name.includes('spice') || name.includes('various') || name.includes('spezie')) return '🧂';
  if (name.includes('frozen') || name.includes('surgel')) return '❄️';
  if (name.includes('beverage') || name.includes('water') || name.includes('bevande')) return '🥛';
  if (name.includes('flour') || name.includes('baking') || name.includes('farine')) return '🍞';
  return '📦'; // Default emoji
}

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
    const priceResult = await priceService.calculatePricesWithDiscounts(workspaceId, productIds, customerDiscount);
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

    // Formatta la risposta per categoria (OPZIONE B: Solo conteggio categorie)
    const isItalian = language === 'it';
    let response = isItalian ? 
      `Ciao! Ecco le nostre categorie di prodotti:\n\n` : 
      `Hello! Here are our product categories:\n\n`;
    
    // Mostra solo categorie con conteggio prodotti
    Object.entries(groupedProducts).forEach(([categoryName, categoryProducts]) => {
      const categoryEmoji = getCategoryEmoji(categoryName);
      const countText = isItalian ? 'prodotti' : 'products';
      response += `${categoryEmoji} ${categoryName} (${categoryProducts.length} ${countText})\n`;
    });
    
    const totalText = isItalian ? 'Totale' : 'Total';
    const availableText = isItalian ? 'prodotti disponibili' : 'products available';
    const askText = isItalian ? 
      '\nDimmi quale categoria ti interessa e ti mostrerò i prodotti specifici!' :
      '\nTell me which category you\'re interested in and I\'ll show you the specific products!';
    
    response += `\n📦 ${totalText}: ${productsWithPrices.length} ${availableText}${askText}`;

    logger.info(`[GET_ALL_PRODUCTS] Successfully retrieved ${productsWithPrices.length} products`);

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
