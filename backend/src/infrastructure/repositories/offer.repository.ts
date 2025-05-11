import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

export class OfferRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll(workspaceId: string) {
    try {
      return this.prisma.$queryRaw`
        SELECT o.*, c.name as categoryName 
        FROM "offers" o
        LEFT JOIN "categories" c ON o."categoryId" = c.id
        WHERE o."workspaceId" = ${workspaceId}
      `;
    } catch (error) {
      logger.error('Error getting offers:', error);
      return [];
    }
  }

  async findById(id: string, workspaceId: string) {
    try {
      const results = await this.prisma.$queryRaw`
        SELECT o.*, c.name as categoryName 
        FROM "offers" o
        LEFT JOIN "categories" c ON o."categoryId" = c.id
        WHERE o.id = ${id} AND o."workspaceId" = ${workspaceId}
        LIMIT 1
      `;
      return results[0] || null;
    } catch (error) {
      logger.error(`Error getting offer ${id}:`, error);
      return null;
    }
  }

  async create(data: any) {
    try {
      const {
        name,
        description,
        discountPercent,
        startDate,
        endDate,
        isActive,
        categoryId,
        workspaceId
      } = data;

      return this.prisma.$executeRaw`
        INSERT INTO "offers" ("id", "name", "description", "discountPercent", "startDate", "endDate", "isActive", "categoryId", "workspaceId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${name}, ${description}, ${discountPercent}, ${startDate}, ${endDate}, ${isActive}, ${categoryId}, ${workspaceId}, NOW(), NOW())
        RETURNING *
      `;
    } catch (error) {
      logger.error('Error creating offer:', error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const updateFields = [];
      const values = [];
      
      if (data.name !== undefined) {
        updateFields.push(`"name" = $${values.length + 1}`);
        values.push(data.name);
      }
      
      if (data.description !== undefined) {
        updateFields.push(`"description" = $${values.length + 1}`);
        values.push(data.description);
      }
      
      if (data.discountPercent !== undefined) {
        updateFields.push(`"discountPercent" = $${values.length + 1}`);
        values.push(data.discountPercent);
      }
      
      if (data.startDate !== undefined) {
        updateFields.push(`"startDate" = $${values.length + 1}`);
        values.push(data.startDate);
      }
      
      if (data.endDate !== undefined) {
        updateFields.push(`"endDate" = $${values.length + 1}`);
        values.push(data.endDate);
      }
      
      if (data.isActive !== undefined) {
        updateFields.push(`"isActive" = $${values.length + 1}`);
        values.push(data.isActive);
      }
      
      if (data.categoryId !== undefined) {
        updateFields.push(`"categoryId" = $${values.length + 1}`);
        values.push(data.categoryId);
      }
      
      updateFields.push(`"updatedAt" = $${values.length + 1}`);
      values.push(new Date());
      
      values.push(id); // For WHERE clause
      
      const updateQuery = `
        UPDATE "offers"
        SET ${updateFields.join(', ')}
        WHERE "id" = $${values.length}
        RETURNING *
      `;
      
      const result = await this.prisma.$queryRawUnsafe(updateQuery, ...values);
      return result[0];
    } catch (error) {
      logger.error(`Error updating offer ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.$executeRaw`
        DELETE FROM "offers"
        WHERE "id" = ${id}
      `;
      return true;
    } catch (error) {
      logger.error(`Error deleting offer ${id}:`, error);
      return false;
    }
  }

  async getActiveOffers(workspaceId: string, categoryId?: string) {
    try {
      const now = new Date();
      
      let query = `
        SELECT o.*, c.name as categoryName 
        FROM "offers" o
        LEFT JOIN "categories" c ON o."categoryId" = c.id
        WHERE o."workspaceId" = $1
        AND o."isActive" = true
        AND o."startDate" <= $2
        AND o."endDate" >= $3
      `;
      
      const params = [workspaceId, now, now];
      
      if (categoryId) {
        query += ` AND o."categoryId" = $4`;
        params.push(categoryId);
      }
      
      return this.prisma.$queryRawUnsafe(query, ...params);
    } catch (error) {
      logger.error('Error getting active offers:', error);
      return [];
    }
  }
} 