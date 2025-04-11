import { Prisma, Products, ProductStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class ProductService {
  async getAllProducts(workspaceId?: string): Promise<Products[]> {
    const where: Prisma.ProductsWhereInput = {
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