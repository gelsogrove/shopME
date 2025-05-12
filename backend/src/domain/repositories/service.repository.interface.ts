import { Service } from "../entities/service.entity";

/**
 * Interface for Service Repository
 * Defines all data operations for Service entity
 */
export interface IServiceRepository {
  /**
   * Find all services in a workspace
   */
  findAll(workspaceId: string, active?: boolean): Promise<Service[]>;
  
  /**
   * Find a single service by ID
   */
  findById(id: string): Promise<Service | null>;
  
  /**
   * Find services by IDs
   */
  findByIds(ids: string[]): Promise<Service[]>;
  
  /**
   * Create a new service
   */
  create(data: Partial<Service>): Promise<Service>;
  
  /**
   * Update an existing service
   */
  update(id: string, data: Partial<Service>): Promise<Service | null>;
  
  /**
   * Delete a service
   */
  delete(id: string): Promise<boolean>;
} 