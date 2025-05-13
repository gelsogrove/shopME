import { Prisma, Products, ProductStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class ProductService {
  async getAllProducts(workspaceId?: string, options?: {
    search?: string;
    categoryId?: string;
    supplierId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Products[]; total: number; page: number; totalPages: number }> {
    // Iniziamo con un filtro vuoto
    const where: Prisma.ProductsWhereInput = {};

    // Aggiungiamo solo il workspaceId come filtro obbligatorio
    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    // Aggiungiamo la ricerca per nome, se presente
    if (options?.search) {
      where.name = {
        contains: options.search,
        mode: 'insensitive'
      };
    }

    // Aggiungiamo il filtro per categoria, se presente
    if (options?.categoryId) {
      where.categoryId = options.categoryId;
    }

    // Aggiungiamo il filtro per fornitore, se presente
    if (options?.supplierId) {
      where.supplierId = options.supplierId;
    }

    // Gestiamo lo status in maniera semplificata
    if (options?.status) {
      switch (options.status) {
        case 'IN_STOCK':
          where.stock = { gt: 0 };
          break;
        case 'OUT_OF_STOCK':
          where.stock = { lte: 0 };
          break;
        case 'ACTIVE':
          where.status = 'ACTIVE';
          // Non impostiamo più where.isActive qui
          break;
        case 'INACTIVE':
          where.status = 'INACTIVE';
          // Non impostiamo più where.isActive qui
          break;
      }
    }

    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    try {
      const totalInDatabase = await prisma.products.count({});
      
      // Se non ci sono prodotti nel database, non facciamo ulteriori query
      if (totalInDatabase === 0) {
        return {
          products: [],
          total: 0,
          page: 1,
          totalPages: 0
        };
      }
      
      // Contiamo i prodotti che soddisfano il filtro workspaceId
      const totalInWorkspace = workspaceId ? 
        await prisma.products.count({ where: { workspaceId } }) : 
        totalInDatabase;
      
      // Se non ci sono prodotti nel workspace, non facciamo ulteriori query
      if (totalInWorkspace === 0) {
        return {
          products: [],
          total: 0,
          page: 1,
          totalPages: 0
        };
      }
      
      // Ora contiamo con tutti i filtri
      const total = await prisma.products.count({ where });
      
      const totalPages = Math.ceil(total / limit);

      // Otteniamo i prodotti filtrati e paginati
      const products = await prisma.products.findMany({
        where,
        include: {
          category: true,
          supplier: true
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: limit
      });

      return {
        products,
        total,
        page,
        totalPages
      };
    } catch (error) {
      return {
        products: [],
        total: 0,
        page,
        totalPages: 0
      };
    }
  }

  async getProductById(id: string, workspaceId?: string): Promise<Products | null> {
    const where: Prisma.ProductsWhereInput = {
      id
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    try {
      const product = await prisma.products.findFirst({
        where,
        include: {
          category: true,
          supplier: true
        }
      });
      
      return product;
    } catch (error) {
      return null;
    }
  }

  async getProductsByCategory(categoryId: string, workspaceId?: string): Promise<Products[]> {
    const where: Prisma.ProductsWhereInput = {
      categoryId,
      isActive: true
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    return prisma.products.findMany({
      where,
      include: {
        category: true
      }
    });
  }

  async createProduct(data: Prisma.ProductsCreateInput): Promise<Products> {
    return prisma.products.create({
      data,
      include: {
        category: true
      }
    });
  }

  async updateProduct(id: string, data: Prisma.ProductsUpdateInput, workspaceId?: string): Promise<Products | null> {
    const where: Prisma.ProductsWhereInput = {
      id
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    return prisma.products.update({
      where: where as Prisma.ProductsWhereUniqueInput,
      data,
      include: {
        category: true
      }
    });
  }

  async deleteProduct(id: string, workspaceId?: string): Promise<void> {
    const where: Prisma.ProductsWhereInput = {
      id
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    await prisma.products.update({
      where: where as Prisma.ProductsWhereUniqueInput,
      data: { isActive: false }
    });
  }

  async updateProductStock(id: string, stock: number, workspaceId?: string): Promise<Products | null> {
    const where: Prisma.ProductsWhereInput = {
      id
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    return prisma.products.update({
      where: where as Prisma.ProductsWhereUniqueInput,
      data: { stock },
      include: {
        category: true
      }
    });
  }

  async updateProductStatus(id: string, status: ProductStatus, workspaceId?: string): Promise<Products | null> {
    const where: Prisma.ProductsWhereInput = {
      id
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    return prisma.products.update({
      where: where as Prisma.ProductsWhereUniqueInput,
      data: { status },
      include: {
        category: true
      }
    });
  }
} 