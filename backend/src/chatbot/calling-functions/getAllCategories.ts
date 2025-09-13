import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

const prisma = new PrismaClient();

/**
 * Get All Categories Calling Function
 * 
 * Ottiene tutte le categorie disponibili nel workspace
 */

export interface GetAllCategoriesParams {
  workspaceId: string;
  customerId?: string;
  message: string;
  phoneNumber?: string;
}

export interface GetAllCategoriesResult {
  response: string;
  categories: any[];
  totalCategories: number;
}

/**
 * Funzione per ottenere tutte le categorie
 */
export async function getAllCategories(params: GetAllCategoriesParams): Promise<GetAllCategoriesResult> {
  const { workspaceId, message } = params;
  
  logger.info(`[GET_ALL_CATEGORIES] Getting categories in workspace ${workspaceId}`);
  
  try {
    // Ottieni tutte le categorie attive del workspace
    const categories = await prisma.categories.findMany({
      where: {
        workspaceId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            products: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    if (!categories || categories.length === 0) {
      const noCategories = `Non ci sono categorie disponibili al momento. 😔

Contatta il nostro staff per maggiori informazioni sui prodotti disponibili.`;

      return {
        response: noCategories,
        categories: [],
        totalCategories: 0
      };
    }

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

    // Formatta le categorie per la risposta con icone a sinistra
    const categoryList = categories.map((cat) => {
      const icon = categoryIcons[cat.name] || '📦';
      const productCount = cat._count.products;
      const productText = productCount === 1 ? 'prodotto' : 'prodotti';
      return `• ${icon} **${cat.name}** ${cat.description ? `- ${cat.description}` : ''} (${productCount} ${productText})`;
    }).join('\n');

    const categoriesMessage = `Ecco tutte le nostre categorie disponibili: 📋

${categoryList}

Dimmi quale categoria ti interessa o scrivi il nome di un prodotto specifico! 🛍️`;

    logger.info(`[GET_ALL_CATEGORIES] Found ${categories.length} categories`);
    
    return {
      response: categoriesMessage,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        productCount: cat._count.products
      })),
      totalCategories: categories.length
    };
    
  } catch (error) {
    logger.error(`[GET_ALL_CATEGORIES] Error getting categories:`, error);
    
    const errorMessage = `An error occurred while retrieving categories. 😞

Please try again later or contact our customer service.`;

    return {
      response: errorMessage,
      categories: [],
      totalCategories: 0
    };
  }
}

// Export per LangChain function calling
export const getAllCategoriesFunction = {
  name: 'getAllCategories',
  description: 'Ottiene tutte le categorie di prodotti disponibili nel workspace',
  parameters: {
    type: 'object',
    properties: {
      workspaceId: { type: 'string', description: 'ID workspace' },
      customerId: { type: 'string', description: 'ID cliente (opzionale)' },
      message: { type: 'string', description: 'Messaggio utente' },
      phoneNumber: { type: 'string', description: 'Numero telefono utente (opzionale)' }
    },
    required: ['workspaceId', 'message']
  },
  handler: getAllCategories
}; 