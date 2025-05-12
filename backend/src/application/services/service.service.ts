import { Service } from "../../domain/entities/service.entity";
import { IServiceRepository } from "../../domain/repositories/service.repository.interface";
import { ServiceRepository } from "../../infrastructure/repositories/service.repository";
import logger from "../../utils/logger";

/**
 * Service layer for Service
 * Handles business logic for services
 */
export class ServiceService {
  private serviceRepository: IServiceRepository;
  
  constructor() {
    this.serviceRepository = new ServiceRepository();
  }
  
  /**
   * Get all services for a workspace
   */
  async getAllForWorkspace(workspaceId: string, active?: boolean): Promise<Service[]> {
    try {
      return await this.serviceRepository.findAll(workspaceId, active);
    } catch (error) {
      logger.error("Error getting all services:", error);
      throw error;
    }
  }
  
  /**
   * Get service by ID
   */
  async getById(id: string, workspaceId?: string): Promise<Service | null> {
    try {
      const service = await this.serviceRepository.findById(id);
      
      // If workspaceId provided, verify the service belongs to the workspace
      if (workspaceId && service && service.workspaceId !== workspaceId) {
        logger.warn(`Unauthorized attempt to access service ${id} from workspace ${workspaceId}`);
        return null;
      }
      
      return service;
    } catch (error) {
      logger.error(`Error getting service ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get services by IDs
   */
  async getByIds(ids: string[]): Promise<Service[]> {
    try {
      return await this.serviceRepository.findByIds(ids);
    } catch (error) {
      logger.error("Error getting services by ids:", error);
      throw error;
    }
  }
  
  /**
   * Create a new service
   */
  async create(data: Partial<Service>): Promise<Service> {
    try {
      // Set default values
      if (data.isActive === undefined) {
        data.isActive = true;
      }
      
      if (!data.currency) {
        data.currency = 'EUR';
      }
      
      // Create a service entity for validation
      const serviceToCreate = new Service(data);
      
      // Validate the service
      if (!serviceToCreate.validate()) {
        throw new Error("Invalid service data");
      }
      
      // Create the service
      return await this.serviceRepository.create(serviceToCreate);
    } catch (error) {
      logger.error("Error creating service:", error);
      throw error;
    }
  }
  
  /**
   * Update a service
   */
  async update(id: string, data: Partial<Service>): Promise<Service | null> {
    try {
      // Check if service exists
      const existingService = await this.serviceRepository.findById(id);
      if (!existingService) {
        throw new Error("Service not found");
      }
      
      // Create merged service for validation
      const serviceToUpdate = new Service({
        ...existingService,
        ...data
      });
      
      // Validate the service
      if (!serviceToUpdate.validate()) {
        throw new Error("Invalid service data");
      }
      
      // Update the service
      return await this.serviceRepository.update(id, data);
    } catch (error) {
      logger.error(`Error updating service ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a service
   */
  async delete(id: string): Promise<boolean> {
    try {
      // Check if service exists
      const service = await this.serviceRepository.findById(id);
      if (!service) {
        throw new Error("Service not found");
      }
      
      // Delete the service
      return await this.serviceRepository.delete(id);
    } catch (error) {
      logger.error(`Error deleting service ${id}:`, error);
      throw error;
    }
  }
}

export default new ServiceService(); 