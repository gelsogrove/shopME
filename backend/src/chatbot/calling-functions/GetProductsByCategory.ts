/**
 * GetProductsByCategory Calling Function
 * 
 * 🚨 REGOLA CRITICA PROMPT: Questa funzione mostra TUTTI i prodotti di una categoria specifica
 * - VIETATO RIASSUMERE: NON riassumere, NON abbreviare, NON limitare la lista
 * - FORMATO OBBLIGATORIO: • [CODICE] - Nome Prodotto (Formato) - €prezzo
 * - COMPLETEZZA OBBLIGATORIA: L'utente DEVE vedere OGNI SINGOLO prodotto della categoria
 */

import { prisma } from "../../lib/prisma";
import logger from "../../utils/logger";

export interface GetProductsByCategoryParams {
  phoneNumber: string;
  workspaceId: string;
  customerId?: string;
  message: string;
  categoryName: string; // Nome categoria in inglese (dal database)
}

export interface ProductWithPrice {
  id: string;
  name: string;
  ProductCode: string | null;
  description: string | null;
  formato: string | null;
  price: number;
  originalPrice: number;
  finalPrice: number;
  appliedDiscount: number;
  discountSource: string | null;
  stock: number;
  sku: string | null;
  category: string | null;
  formatted: string;
}

export interface GetProductsByCategoryResult {
  response: string;
  products: ProductWithPrice[];
  totalProducts: number;
  categoryName: string;
}

/**
 * Funzione per ottenere tutti i prodotti di una categoria specifica
 */
export async function GetProductsByCategory(params: GetProductsByCategoryParams): Promise<GetProductsByCategoryResult> {
  const { phoneNumber, workspaceId, categoryName, customerId } = params;
  
  logger.info(`[GET_PRODUCTS_BY_CATEGORY] Getting products for category "${categoryName}" in workspace ${workspaceId}`);
  
  try {
    // Ottieni tutti i prodotti attivi della categoria specifica
    const products = await prisma.products.findMany({
      where: {
        workspaceId,
        isActive: true,
        status: 'ACTIVE',
        category: {
          name: categoryName // Nome inglese della categoria dal database
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
      const noProducts = `Non ci sono prodotti disponibili nella categoria "${categoryName}". 😔

Prova a controllare altre categorie o contatta il nostro staff per maggiori informazioni.`;

      return {
        response: noProducts,
        products: [],
        totalProducts: 0,
        categoryName
      };
    }

    // Calcola prezzi con sconti
    const { PriceCalculationService } = await import("../../application/services/price-calculation.service");
    const priceService = new PriceCalculationService(prisma);
    const productIds = products.map((p) => p.id);
    const customerDiscount = customerId ? (await prisma.customers.findUnique({ where: { id: customerId }, select: { discount: true } }))?.discount || 0 : 0;
    const priceResult = await priceService.calculatePricesWithDiscounts(workspaceId, productIds, customerDiscount);
    const priceMap = new Map(priceResult.products.map(p => [p.id, p]));

    // 🚨 REGOLA CRITICA PROMPT: FORMATO OBBLIGATORIO • [CODICE] - Nome Prodotto (Formato) - €prezzo
    const productList = products.map((product) => {
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
      const formatoText = product.formato ? ` (${product.formato})` : '';
      const productCode = product.ProductCode || 'N/A';
      
      // 🚨 REGOLA CRITICA PROMPT: • [CODICE] - Nome Prodotto (Formato) - €prezzo
      return `• [${productCode}] - ${product.name}${formatoText} - ${priceText} - ${stockText}${product.description ? `\n  _${product.description}_` : ''}`;
    }).join('\n');

    // Mappatura icone per categoria
    const categoryIcons: { [key: string]: string } = {
      'Cheeses & Dairy': '🧀',
      'Cured Meats': '🥓',
      'Salami & Cold Cuts': '🥩', 
      'Pasta & Rice': '🍝',
      'Tomato Products': '🍅',
      'Flour & Baking': '🌾',
      'Sauces & Preserves': '🍯',
      'Water & Beverages': '💧',
      'Frozen Products': '🧊',
      'Various & Spices': '🌿'
    };

    const icon = categoryIcons[categoryName] || '📦';

    // 🚨 REGOLA PROMPT: COMPLETEZZA OBBLIGATORIA - Mostra TUTTI i prodotti della categoria
    const productsMessage = `${icon} **${categoryName}** - Tutti i prodotti disponibili:

${productList}

Scrivi il codice del prodotto che ti interessa o dimmi quale vorresti aggiungere al carrello! 🛒`;

    logger.info(`[GET_PRODUCTS_BY_CATEGORY] Found ${products.length} products in category "${categoryName}"`);
    
    return {
      response: productsMessage,
      products: products.map(product => {
        const priceData = priceMap.get(product.id) as ProductWithPrice | undefined;
        const hasDiscount = (priceData?.appliedDiscount || 0) > 0;
        const prezzoFinale = priceData?.finalPrice ?? product.price;
        const prezzoOriginale = priceData?.originalPrice ?? product.price;
        const scontoPercentuale = priceData?.appliedDiscount || 0;
        const scontoTipo = priceData?.discountSource || null;
        
        let formatted = `[${product.ProductCode || 'N/A'}] - ${product.name}`;
        if (product.formato) formatted += ` (${product.formato})`;
        formatted += ` - €${prezzoFinale.toFixed(2)}`;
        if (hasDiscount) {
          formatted += ` (scontato del ${scontoPercentuale}%)`;
        }
        
        return {
          id: product.id,
          name: product.name,
          ProductCode: product.ProductCode,
          description: product.description,
          formato: product.formato,
          price: prezzoFinale,
          originalPrice: prezzoOriginale,
          finalPrice: prezzoFinale,
          appliedDiscount: scontoPercentuale,
          discountSource: scontoTipo,
          stock: product.stock,
          sku: product.sku,
          category: product.category?.name,
          formatted,
        };
      }),
      totalProducts: products.length,
      categoryName
    };
    
  } catch (error) {
    logger.error(`[GET_PRODUCTS_BY_CATEGORY] Error getting products for category "${categoryName}":`, error);
    
    const errorMessage = `Si è verificato un errore nel recuperare i prodotti della categoria "${categoryName}". 😞

Riprova più tardi o contatta il nostro servizio clienti.`;

    return {
      response: errorMessage,
      products: [],
      totalProducts: 0,
      categoryName
    };
  }
}

// Export per LangChain function calling
export const getProductsByCategoryFunction = {
  name: 'GetProductsByCategory',
  description: 'Ottiene tutti i prodotti di una categoria specifica con informazioni complete su prezzo, stock e formato',
  parameters: {
    type: 'object',
    properties: {
      phoneNumber: { type: 'string', description: 'Numero telefono utente' },
      workspaceId: { type: 'string', description: 'ID workspace' },
      customerId: { type: 'string', description: 'ID cliente (opzionale)' },
      message: { type: 'string', description: 'Messaggio utente' },
      categoryName: { type: 'string', description: 'Nome categoria in inglese (es: "Cheeses & Dairy", "Cured Meats")' }
    },
    required: ['phoneNumber', 'workspaceId', 'message', 'categoryName']
  },
  handler: GetProductsByCategory
};
