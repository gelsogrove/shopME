import { Supplier, SupplierProps } from "../entities/supplier.entity";

/**
 * Interface for Supplier Repository
 * Defines all data operations for Supplier entity
 */
export interface ISupplierRepository {
  /**
   * Find all suppliers in a workspace
   */
  findAll(workspaceId: string): Promise<Supplier[]>;
  
  /**
   * Find active suppliers in a workspace
   */
  findActive(workspaceId: string): Promise<Supplier[]>;
  
  /**
   * Find a single supplier by ID and workspace
   */
  findById(id: string, workspaceId: string): Promise<Supplier | null>;
  
  /**
   * Find a supplier by slug in a workspace
   */
  findBySlug(slug: string, workspaceId: string): Promise<Supplier | null>;
  
  /**
   * Create a new supplier
   */
  create(data: SupplierProps): Promise<Supplier>;
  
  /**
   * Update an existing supplier
   */
  update(id: string, workspaceId: string, data: Partial<SupplierProps>): Promise<Supplier>;
  
  /**
   * Delete a supplier
   */
  delete(id: string, workspaceId: string): Promise<boolean>;
  
  /**
   * Check if any products use this supplier
   */
  isUsedByProducts(id: string): Promise<boolean>;
} 