/**
 * SearchSpecificProduct Calling Function
 * 
 * 🚨 REGOLA CRITICA PROMPT: Questa funzione cerca un prodotto specifico per nome
 * - RICERCA MIRATA: Cerca solo il prodotto richiesto, non tutta la lista
 * - RISPOSTA DIRETTA: "Sì, abbiamo [prodotto] - €prezzo" o "No, non abbiamo [prodotto]"
 * - FORMATO OBBLIGATORIO: • [CODICE] - Nome Prodotto (Formato) - €prezzo ~~€prezzo_originale~~
 */

import { prisma } from "../../lib/prisma";
import logger from "../../utils/logger";

export interface SearchSpecificProductParams {
  phoneNumber: string;
  workspaceId: string;
  customerId?: string;
  message: string;
  productName: string; // Nome del prodotto da cercare
  language?: string;
}

export interface ProductWithPrice {
  id: string;
  name: string;
  ProductCode?: string;
  description?: string;
  formato?: string;
  price: number;
  currency: string;
  stock: number;
  sku?: string;
  categoryName?: string;
  originalPrice?: number;
  hasDiscount?: boolean;
  discountPercent?: number;
  discountSource?: string;
}

export interface SearchSpecificProductResult {
  response: string;
  products: ProductWithPrice[];
  totalProducts: number;
  found: boolean;
}

/**
 * Funzione per cercare un prodotto specifico per nome
 */
export async function SearchSpecificProduct(params: SearchSpecificProductParams): Promise<SearchSpecificProductResult> {
  const { phoneNumber, workspaceId, customerId, productName, language = 'it' } = params;
  
  logger.info(`[SEARCH_SPECIFIC_PRODUCT] Searching for product: "${productName}" in workspace ${workspaceId}`);
  
  try {
    // Estrai il nome del prodotto dal messaggio originale se productName è generico
    let searchTerm = productName;
    if (productName.length < 3 || productName === "unknown") {
      // Estrai parole chiave dal messaggio originale
      const message = params.message || "";
      const words = message.toLowerCase().split(/\s+/).filter(word => 
        word.length > 3 && 
        !['avete', 'have', 'you', 'do', 'c\'è', 'hay', 'tienes', 'disponibile', 'available', 'stock', 'trovare', 'find'].includes(word)
      );
      searchTerm = words.join(' ');
    }
    
    // Cerca prodotti che contengono il nome cercato (case insensitive)
    const products = await prisma.products.findMany({
      where: {
        workspaceId,
        isActive: true,
        status: 'ACTIVE',
        name: {
          contains: searchTerm,
          mode: 'insensitive'
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
      return {
        response: isItalian ? 
          `Mi dispiace, non abbiamo "${productName}" nel nostro catalogo. Prova a controllare il nome o chiedi di vedere tutti i nostri prodotti.` :
          `Sorry, we don't have "${productName}" in our catalog. Please check the name or ask to see all our products.`,
        products: [],
        totalProducts: 0,
        found: false
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
        id: product.id,
        name: product.name,
        ProductCode: product.ProductCode || undefined,
        description: product.description || undefined,
        formato: product.formato || undefined,
        price: product.price,
        currency: '€',
        stock: product.stock,
        sku: product.sku || undefined,
        categoryName: product.category?.name || 'Other',
        originalPrice: priceData?.originalPrice,
        hasDiscount: (priceData?.appliedDiscount || 0) > 0,
        discountPercent: priceData?.appliedDiscount || 0,
        discountSource: priceData?.discountSource,
      };
    });

    // Formatta la risposta
    const isItalian = language === 'it';
    let response = isItalian ? 
      `Sì! Abbiamo trovato ${productsWithPrices.length} prodotto/i che corrisponde al tuo criterio:\n\n` :
      `Yes! We found ${productsWithPrices.length} product/s matching your criteria:\n\n`;
    
    productsWithPrices.forEach(product => {
      const code = product.ProductCode ? `[${product.ProductCode}]` : '';
      const format = product.formato ? ` (${product.formato})` : '';
      const price = product.hasDiscount ? 
        `€${product.price} ~~€${product.originalPrice}~~` : 
        `€${product.price}`;
      
      response += `• ${code} ${product.name}${format} - ${price}\n`;
    });

    response += `\n📦 ${isItalian ? 'Totale trovati' : 'Total found'}: ${productsWithPrices.length}`;

    logger.info(`[SEARCH_SPECIFIC_PRODUCT] Successfully found ${productsWithPrices.length} products matching "${productName}"`);

    return {
      response,
      products: productsWithPrices,
      totalProducts: productsWithPrices.length,
      found: true
    };

  } catch (error) {
    logger.error(`[SEARCH_SPECIFIC_PRODUCT] Error searching for product "${productName}":`, error);
    
    const isItalian = language === 'it';
    return {
      response: isItalian ? 
        "Mi dispiace, si è verificato un errore nella ricerca. Riprova più tardi." :
        "Sorry, there was an error searching. Please try again later.",
      products: [],
      totalProducts: 0,
      found: false
    };
  }
}

// Export per LangChain function calling
export const searchSpecificProductFunction = {
  name: 'SearchSpecificProduct',
  description: 'Cerca un prodotto specifico per nome nel catalogo e restituisce informazioni dettagliate su prezzo, stock e formato',
  parameters: {
    type: 'object',
    properties: {
      phoneNumber: { type: 'string', description: 'Numero telefono utente' },
      workspaceId: { type: 'string', description: 'ID workspace' },
      customerId: { type: 'string', description: 'ID cliente (opzionale)' },
      message: { type: 'string', description: 'Messaggio utente' },
      productName: { type: 'string', description: 'Nome del prodotto da cercare' },
      language: { type: 'string', description: 'Lingua di risposta (it/en)', default: 'it' }
    },
    required: ['phoneNumber', 'workspaceId', 'message', 'productName']
  },
  handler: SearchSpecificProduct
};
