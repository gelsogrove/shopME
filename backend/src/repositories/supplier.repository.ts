import { Supplier, SupplierProps } from "../domain/entities/supplier.entity";
import { ISupplierRepository } from "../domain/repositories/supplier.repository.interface";
import { prisma } from "../lib/prisma";
import logger from "../utils/logger";

/**
 * Implementation of Supplier Repository using Prisma
 */
export class SupplierRepository implements ISupplierRepository {
  /**
   * Generate a slug for supplier name
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  
  /**
   * Convert Prisma model to domain entity
   */
  private toDomainEntity(supplierData: any): Supplier {
    return new Supplier({
      id: supplierData.id,
      name: supplierData.name,
      description: supplierData.description,
      address: supplierData.address,
      website: supplierData.website,
      phone: supplierData.phone,
      email: supplierData.email,
      contactPerson: supplierData.contactPerson,
      notes: supplierData.notes,
      isActive: supplierData.isActive,
      createdAt: supplierData.createdAt,
      updatedAt: supplierData.updatedAt,
      workspaceId: supplierData.workspaceId,
      slug: supplierData.slug
    });
  }

  /**
   * Find all suppliers in a workspace
   */
  async findAll(workspaceId: string): Promise<Supplier[]> {
    try {
      // @ts-ignore - Prisma types are not correctly generated
      const suppliers = await prisma.suppliers.findMany({
        where: { workspaceId },
        orderBy: { name: 'asc' }
      });
      
      return suppliers.map(supplier => this.toDomainEntity(supplier));
    } catch (error) {
      logger.error("Error finding suppliers:", error);
      throw error;
    }
  }
  
  /**
   * Find active suppliers in a workspace
   */
  async findActiveByWorkspaceId(workspaceId: string): Promise<Supplier[]> {
    try {
      // @ts-ignore - Prisma types are not correctly generated
      const suppliers = await prisma.suppliers.findMany({
        where: {
          workspaceId,
          isActive: true
        },
        orderBy: { name: 'asc' }
      });
      
      return suppliers.map(supplier => this.toDomainEntity(supplier));
    } catch (error) {
      logger.error("Error finding active suppliers:", error);
      throw error;
    }
  }
  
  /**
   * Find a single supplier by ID and workspace
   */
  async findById(id: string, workspaceId: string): Promise<Supplier | null> {
    try {
      // @ts-ignore - Prisma types are not correctly generated
      const supplier = await prisma.suppliers.findFirst({
        where: {
          id,
          workspaceId
        }
      });
      
      return supplier ? this.toDomainEntity(supplier) : null;
    } catch (error) {
      logger.error(`Error finding supplier ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Find a supplier by slug in a workspace
   */
  async findBySlug(slug: string, workspaceId: string): Promise<Supplier | null> {
    try {
      // @ts-ignore - Prisma types are not correctly generated
      const supplier = await prisma.suppliers.findFirst({
        where: {
          slug,
          workspaceId
        }
      });
      
      return supplier ? this.toDomainEntity(supplier) : null;
    } catch (error) {
      logger.error(`Error finding supplier with slug ${slug}:`, error);
      return null;
    }
  }
  
  /**
   * Create a new supplier
   */
  async create(data: SupplierProps): Promise<Supplier> {
    try {
      const slug = data.slug || this.generateSlug(data.name);
      
      // @ts-ignore - Prisma types are not correctly generated
      const supplier = await prisma.suppliers.create({
        data: {
          name: data.name,
          description: data.description,
          address: data.address,
          website: data.website,
          phone: data.phone,
          email: data.email,
          contactPerson: data.contactPerson,
          notes: data.notes,
          isActive: data.isActive !== undefined ? data.isActive : true,
          workspaceId: data.workspaceId,
          slug
        }
      });
      
      return this.toDomainEntity(supplier);
    } catch (error) {
      logger.error("Error creating supplier:", error);
      throw error;
    }
  }
  
  /**
   * Update an existing supplier
   */
  async update(id: string, workspaceId: string, data: Partial<SupplierProps>): Promise<Supplier> {
    try {
      const updateData: any = { ...data };
      
      // If name is updated, also update the slug
      if (data.name) {
        updateData.slug = this.generateSlug(data.name);
      }
      
      // @ts-ignore - Prisma types are not correctly generated
      await prisma.suppliers.updateMany({
        where: { id, workspaceId },
        data: updateData
      });
      
      const supplier = await this.findById(id, workspaceId);
      if (!supplier) {
        throw new Error('Supplier not found after update');
      }
      
      return supplier;
    } catch (error) {
      logger.error(`Error updating supplier ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a supplier
   */
  async delete(id: string, workspaceId: string): Promise<boolean> {
    try {
      // @ts-ignore - Prisma types are not correctly generated
      await prisma.suppliers.deleteMany({
        where: { id, workspaceId }
      });
      
      return true;
    } catch (error) {
      logger.error(`Error deleting supplier ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Check if any products use this supplier
   */
  async isUsedByProducts(id: string): Promise<boolean> {
    try {
      // @ts-ignore - Prisma types are not correctly generated
      const productsCount = await prisma.products.count({
        where: { supplierId: id }
      });
      
      return productsCount > 0;
    } catch (error) {
      logger.error(`Error checking if supplier ${id} is used by products:`, error);
      throw error;
    }
  }
} 