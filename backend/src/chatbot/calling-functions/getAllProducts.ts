import { PrismaClient } from '@prisma/client';
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

    // 🚨 REGOLA CRITICA PROMPT: GetAllProducts() deve mostrare CATEGORIE, non tutti i prodotti
    // "NON MOSTRARE: Tutti i prodotti in una volta (troppo lungo)"
    
    // Raggruppa i prodotti per categoria per contare i prodotti per categoria
    const productsByCategory = products.reduce((acc, product) => {
      const categoryName = product.category?.name || 'Senza categoria';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(product);
      return acc;
    }, {} as Record<string, typeof products>);

    // Mappatura icone per categoria (come in getAllCategories)
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

    // 🚨 REGOLA PROMPT: Mostra ogni categoria con icona e numero di prodotti
    const categoryList = Object.entries(productsByCategory).map(([categoryName, categoryProducts]) => {
      const icon = categoryIcons[categoryName] || '📦';
      const productCount = categoryProducts.length;
      const productText = productCount === 1 ? 'prodotto' : 'prodotti';
      return `• ${icon} **${categoryName}** (${productCount} ${productText})`;
    }).join('\n');

    // 🚨 REGOLA PROMPT: "CHIEDI SEMPRE: Quale categoria ti interessa esplorare?"
    const productsMessage = `Ecco tutte le nostre categorie di prodotti disponibili: 🛍️

${categoryList}

**Quale categoria ti interessa esplorare?** 
Scrivi il nome della categoria per vedere tutti i prodotti disponibili! 📦`;

    logger.info(`[GET_ALL_PRODUCTS] Found ${products.length} products in ${Object.keys(productsByCategory).length} categories`);
    
    return {
      response: productsMessage,
      // 🚨 Ora restituiamo le categorie invece dei singoli prodotti (seguendo regole prompt)
      products: Object.entries(productsByCategory).map(([categoryName, categoryProducts]) => ({
        id: categoryName,
        name: categoryName,
        ProductCode: null,
        description: `Categoria con ${categoryProducts.length} prodotti`,
        formato: null,
        price: 0,
        originalPrice: 0,
        discountPercent: 0,
        discountSource: null,
        stock: categoryProducts.length,
        sku: null,
        category: categoryName,
        formatted: `${categoryProducts.length} prodotti disponibili`,
      })),
      totalProducts: Object.keys(productsByCategory).length // Numero di categorie, non prodotti totali
    };
    
  } catch (error) {
    logger.error(`[GET_ALL_PRODUCTS] Error getting products:`, error);
    
    const errorMessage = `An error occurred while retrieving products. 😞

Please try again later or contact our customer service.`;

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