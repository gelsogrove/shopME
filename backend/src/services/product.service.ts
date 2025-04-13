import { Prisma, Products, ProductStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class ProductService {
  async getAllProducts(workspaceId?: string, options?: {
    search?: string;
    categoryId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Products[]; total: number; page: number; totalPages: number }> {
    const where: Prisma.ProductsWhereInput = {
      isActive: true
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    // Apply filters
    if (options?.search) {
      where.name = {
        contains: options.search,
        mode: 'insensitive'
      };
    }

    if (options?.categoryId) {
      where.categoryId = options.categoryId;
    }

    if (options?.status) {
      // Handle status filter
      switch (options.status) {
        case 'IN_STOCK':
          where.stock = {
            gt: 0
          };
          break;
        case 'OUT_OF_STOCK':
          where.stock = {
            lte: 0
          };
          break;
        case 'ACTIVE':
          where.status = 'ACTIVE';
          break;
        case 'INACTIVE':
          where.status = 'INACTIVE';
          break;
      }
    }

    // Set up pagination
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.products.count({ where });
    const totalPages = Math.ceil(total / limit);

    // Get paginated products
    const products = await prisma.products.findMany({
      where,
      include: {
        category: true
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
  }

  async getProductById(id: string, workspaceId?: string): Promise<Products | null> {
    const where: Prisma.ProductsWhereInput = {
      id
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    return prisma.products.findFirst({
      where,
      include: {
        category: true
      }
    });
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