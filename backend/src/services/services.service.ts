import { PrismaClient } from "@prisma/client";
import cuid from 'cuid';

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
      return await prisma.$queryRaw`SELECT * FROM services WHERE "workspaceId" = ${workspaceId} ORDER BY "createdAt" DESC`;
    } catch (error) {
      console.error("Error getting services for workspace:", error);
      return [];
    }
  },

  async getById(id: string) {
    return prisma.$queryRaw`SELECT * FROM services WHERE id = ${id} LIMIT 1`
  },

  async create(data: CreateServiceData) {
    const { name, description, price, workspaceId, currency = "€", isActive = true } = data
    
    return prisma.$queryRaw`
      INSERT INTO services (id, name, description, price, "workspaceId", currency, "isActive", "createdAt", "updatedAt")
      VALUES (${cuid()}, ${name}, ${description}, ${price}, ${workspaceId}, ${currency}, ${isActive}, NOW(), NOW())
      RETURNING *
    `
  },

  async update(id: string, data: UpdateServiceData) {
    // First check if service exists
    const existingService = await prisma.$queryRaw`SELECT * FROM services WHERE id = ${id} LIMIT 1`
    
    if (!existingService || (existingService as any[]).length === 0) {
      throw new Error("Service not found")
    }
    
    const service = (existingService as any[])[0]
    
    const { name, description, price, currency, isActive } = data
    
    return prisma.$queryRaw`
      UPDATE services 
      SET 
        name = ${name !== undefined ? name : service.name},
        description = ${description !== undefined ? description : service.description},
        price = ${price !== undefined ? price : service.price},
        currency = ${currency !== undefined ? currency : service.currency},
        "isActive" = ${isActive !== undefined ? isActive : service.isActive},
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `
  },

  async delete(id: string) {
    return prisma.$queryRaw`DELETE FROM services WHERE id = ${id}`
  },
} 