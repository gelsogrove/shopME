import { Supplier, SupplierProps } from "../../domain/entities/supplier.entity";
import { ISupplierRepository } from "../../domain/repositories/supplier.repository.interface";
import { SupplierRepository } from "../../infrastructure/repositories/supplier.repository";
import logger from "../../utils/logger";

/**
 * Service layer for Supplier
 * Handles business logic for suppliers
 */
export class SupplierService {
  private supplierRepository: ISupplierRepository;
  
  constructor() {
    this.supplierRepository = new SupplierRepository();
  }

  /**
   * Get all suppliers for a workspace
   */
  async getAllForWorkspace(workspaceId: string): Promise<Supplier[]> {
    try {
      return await this.supplierRepository.findAll(workspaceId);
    } catch (error) {
      logger.error("Error getting all suppliers:", error);
      throw error;
    }
  }

  /**
   * Get active suppliers for a workspace
   */
  async getActiveForWorkspace(workspaceId: string): Promise<Supplier[]> {
    try {
      return await this.supplierRepository.findActive(workspaceId);
    } catch (error) {
      logger.error("Error getting active suppliers:", error);
      throw error;
    }
  }

  /**
   * Get a supplier by ID
   */
  async getById(id: string, workspaceId: string): Promise<Supplier | null> {
    try {
      return await this.supplierRepository.findById(id, workspaceId);
    } catch (error) {
      logger.error(`Error getting supplier with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new supplier
   */
  async create(data: SupplierProps): Promise<Supplier> {
    try {
      // Validate required fields
      if (!data.name || !data.workspaceId) {
        throw new Error("Name and workspace ID are required");
      }
      
      // Check if a supplier with the same name/slug exists
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      
      const existingSupplier = await this.supplierRepository.findBySlug(slug, data.workspaceId);
      if (existingSupplier) {
        throw new Error("A supplier with this name already exists");
      }
      
      return await this.supplierRepository.create(data);
    } catch (error) {
      logger.error("Error creating supplier:", error);
      throw error;
    }
  }

  /**
   * Update an existing supplier
   */
  async update(id: string, workspaceId: string, data: Partial<SupplierProps>): Promise<Supplier | null> {
    try {
      // Check if supplier exists
      const existingSupplier = await this.supplierRepository.findById(id, workspaceId);
      if (!existingSupplier) {
        throw new Error("Supplier not found");
      }
      
      // Check for name uniqueness if name is being updated
      if (data.name) {
        const slug = data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        
        const supplierWithSlug = await this.supplierRepository.findBySlug(slug, workspaceId);
        if (supplierWithSlug && supplierWithSlug.id !== id) {
          throw new Error("A supplier with this name already exists");
        }
      }
      
      return await this.supplierRepository.update(id, workspaceId, data);
    } catch (error) {
      logger.error(`Error updating supplier with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a supplier
   */
  async delete(id: string, workspaceId: string): Promise<boolean> {
    try {
      // Check if supplier exists
      const supplier = await this.supplierRepository.findById(id, workspaceId);
      if (!supplier) {
        throw new Error("Supplier not found");
      }
      
      // Check if supplier is used by any products
      const isUsed = await this.supplierRepository.isUsedByProducts(id);
      if (isUsed) {
        throw new Error("Cannot delete supplier that is used by products");
      }
      
      return await this.supplierRepository.delete(id, workspaceId);
    } catch (error) {
      logger.error(`Error deleting supplier with id ${id}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance for backward compatibility
export default new SupplierService(); 