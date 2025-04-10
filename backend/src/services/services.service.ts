import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

interface CreateServiceData {
  name: string
  description: string
  price: number
  workspaceId: string
  currency?: string
  isActive?: boolean
}

interface UpdateServiceData {
  name?: string
  description?: string
  price?: number
  currency?: string
  isActive?: boolean
}

export const servicesService = {
  async getAllForWorkspace(workspaceId: string) {
    try {
      console.log("Getting services for workspace:", workspaceId);
      // @ts-ignore - Prisma types issue
      return await prisma.services.findMany({
        where: {
          workspaceId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      console.error("Error getting services for workspace:", error);
      return [];
    }
  },

  async getById(id: string) {
    // @ts-ignore - Prisma types issue
    return prisma.services.findUnique({
      where: { id }
    });
  },

  async create(data: CreateServiceData) {
    const { name, description, price, workspaceId, currency = "€", isActive = true } = data
    
    // @ts-ignore - Prisma types issue
    return prisma.services.create({
      data: {
        name,
        description, 
        price,
        currency,
        isActive,
        workspace: {
          connect: {
            id: workspaceId
          }
        }
      }
    });
  },

  async update(id: string, data: UpdateServiceData) {
    // First check if service exists
    // @ts-ignore - Prisma types issue
    const existingService = await prisma.services.findUnique({
      where: { id }
    });
    
    if (!existingService) {
      throw new Error("Service not found");
    }
    
    const { name, description, price, currency, isActive } = data;
    
    // @ts-ignore - Prisma types issue
    return prisma.services.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(currency !== undefined && { currency }),
        ...(isActive !== undefined && { isActive }),
      }
    });
  },

  async delete(id: string) {
    // @ts-ignore - Prisma types issue
    return prisma.services.delete({
      where: { id }
    });
  },
} 