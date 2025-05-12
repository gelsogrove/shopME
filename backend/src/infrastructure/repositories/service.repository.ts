import { Service } from "../../domain/entities/service.entity";
import { IServiceRepository } from "../../domain/repositories/service.repository.interface";
import { prisma } from "../../lib/prisma";
import logger from "../../utils/logger";

/**
 * Implementation of Service Repository using Prisma
 */
export class ServiceRepository implements IServiceRepository {
  /**
   * Find all services in a workspace
   */
  async findAll(workspaceId: string, active?: boolean): Promise<Service[]> {
    try {
      const whereCondition: any = { workspaceId };
      
      if (active !== undefined) {
        whereCondition.isActive = active;
      }
      
      const services = await prisma.services.findMany({
        where: whereCondition,
        orderBy: {
          name: 'asc'
        }
      });
      
      return services.map(service => new Service(service));
    } catch (error) {
      logger.error("Error finding services:", error);
      throw error;
    }
  }
  
  /**
   * Find a single service by ID
   */
  async findById(id: string): Promise<Service | null> {
    try {
      const service = await prisma.services.findUnique({
        where: { id }
      });
      
      return service ? new Service(service) : null;
    } catch (error) {
      logger.error(`Error finding service ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Find services by IDs
   */
  async findByIds(ids: string[]): Promise<Service[]> {
    try {
      const services = await prisma.services.findMany({
        where: {
          id: {
            in: ids
          }
        }
      });
      
      return services.map(service => new Service(service));
    } catch (error) {
      logger.error(`Error finding services by ids:`, error);
      return [];
    }
  }
  
  /**
   * Create a new service
   */
  async create(data: Partial<Service>): Promise<Service> {
    try {
      const service = await prisma.services.create({
        data: data as any
      });
      
      return new Service(service);
    } catch (error) {
      logger.error("Error creating service:", error);
      throw error;
    }
  }
  
  /**
   * Update an existing service
   */
  async update(id: string, data: Partial<Service>): Promise<Service | null> {
    try {
      const service = await prisma.services.update({
        where: { id },
        data: data as any
      });
      
      return new Service(service);
    } catch (error) {
      logger.error(`Error updating service ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Delete a service
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.services.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      logger.error(`Error deleting service ${id}:`, error);
      return false;
    }
  }
} 