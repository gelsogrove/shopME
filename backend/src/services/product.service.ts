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
    console.log('ProductService.getAllProducts chiamato con:', { workspaceId, options });
    
    // Iniziamo con un filtro vuoto
    const where: Prisma.ProductsWhereInput = {};

    // Aggiungiamo solo il workspaceId come filtro obbligatorio
    if (workspaceId) {
      where.workspaceId = workspaceId;
      console.log('Filtro per workspaceId:', workspaceId);
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

    console.log('Query Prisma products con:', { 
      where, 
      skip, 
      take: limit 
    });

    try {
      const totalInDatabase = await prisma.products.count({});
      console.log('Totale prodotti nel database (senza filtri):', totalInDatabase);
      
      // Se non ci sono prodotti nel database, non facciamo ulteriori query
      if (totalInDatabase === 0) {
        console.log('Nessun prodotto nel database');
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
      
      console.log('Totale prodotti nel workspace:', totalInWorkspace);
      
      // Se non ci sono prodotti nel workspace, non facciamo ulteriori query
      if (totalInWorkspace === 0) {
        console.log('Nessun prodotto nel workspace');
        return {
          products: [],
          total: 0,
          page: 1,
          totalPages: 0
        };
      }
      
      // Ora contiamo con tutti i filtri
      const total = await prisma.products.count({ where });
      console.log('Total prodotti trovati con tutti i filtri:', total);
      
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

      console.log(`Ritorno ${products.length} prodotti di ${total} totali`);
      
      if (products.length > 0) {
        console.log('Esempio prodotto:', {
          id: products[0].id,
          name: products[0].name,
          workspaceId: products[0].workspaceId,
          isActive: products[0].isActive,
          status: products[0].status
        });
      } else {
        console.log('Nessun prodotto trovato che corrisponde ai criteri di ricerca');
        
        if (workspaceId) {
          const allWorkspaceProducts = await prisma.products.findMany({
            where: { workspaceId },
            take: 5
          });
          
          console.log(`Prodotti nel workspace senza filtri: ${allWorkspaceProducts.length}`);
          if (allWorkspaceProducts.length > 0) {
            console.log('Esempi di prodotti nel workspace (primi 5):', 
              allWorkspaceProducts.map(p => ({ 
                id: p.id, 
                name: p.name, 
                isActive: p.isActive, 
                status: p.status 
              }))
            );
          }
        }
      }

      return {
        products,
        total,
        page,
        totalPages
      };
    } catch (error) {
      console.error('Errore nel recupero prodotti:', error);
      return {
        products: [],
        total: 0,
        page,
        totalPages: 0
      };
    }
  }

  async getProductById(id: string, workspaceId?: string): Promise<Products | null> {
    console.log('getProductById chiamato con:', { id, workspaceId });
    
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
      
      console.log('Prodotto trovato:', product ? 'sì' : 'no');
      return product;
    } catch (error) {
      console.error('Errore nel recupero prodotto:', error);
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