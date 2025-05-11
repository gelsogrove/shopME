import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

// Definizione dell'interfaccia Offer
interface Offer {
  id: string;
  name: string;
  description: string | null;
  discountPercent: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  categoryId: string | null;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  categoryName?: string;
}

export class ProductRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll(workspaceId: string) {
    try {
      const products = await this.prisma.products.findMany({
        where: {
          workspaceId,
          isActive: true,
        },
        include: {
          category: true,
        },
      });

      // Non applico più gli sconti delle offerte
      return products;
    } catch (error) {
      logger.error('Error getting products:', error);
      return [];
    }
  }

  async findById(id: string, workspaceId: string) {
    try {
      const product = await this.prisma.products.findFirst({
        where: {
          id,
          workspaceId,
        },
        include: {
          category: true,
        },
      });

      if (!product) return null;

      // Non applico più gli sconti delle offerte
      return product;
    } catch (error) {
      logger.error(`Error getting product ${id}:`, error);
      return null;
    }
  }

  // Metodo modificato per non applicare più gli sconti delle offerte
  private async applyOffersToProducts(products: any[], workspaceId: string) {
    // Le offerte sono state rimosse, quindi ritorniamo i prodotti originali
    return products;
  }

  // Altri metodi esistenti...
} 