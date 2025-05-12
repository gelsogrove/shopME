import { Response } from "express";
import ServiceService from "../../../application/services/service.service";
import logger from "../../../utils/logger";
import { WorkspaceRequest } from "../types/workspace-request";

/**
 * ServicesController class
 * Handles HTTP requests related to services
 */
export class ServicesController {
  private serviceService: typeof ServiceService;
  
  constructor() {
    this.serviceService = ServiceService;
  }

  /**
   * Get all services for a workspace
   */
  async getServicesForWorkspace(req: WorkspaceRequest, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.workspaceContext;
      
      logger.info(`Getting services for workspace: ${workspaceId}`);
      const services = await this.serviceService.getAllForWorkspace(workspaceId);
      return res.json(services);
    } catch (error) {
      logger.error("Error getting services:", error);
      return res.status(500).json({ error: 'Failed to get services' });
    }
  }

  /**
   * Get service by ID
   */
  async getServiceById(req: WorkspaceRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { workspaceId } = req.workspaceContext;
      
      const service = await this.serviceService.getById(id, workspaceId);
      
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      return res.json(service);
    } catch (error) {
      logger.error(`Error getting service ${req.params.id}:`, error);
      return res.status(500).json({ error: 'Failed to get service' });
    }
  }

  /**
   * Create a new service
   */
  async createService(req: WorkspaceRequest, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.workspaceContext;
      
      const { name, description, price, currency, duration, isActive } = req.body;
      const serviceData = { 
        name, 
        description, 
        price: parseFloat(price),
        duration: parseInt(duration || '60', 10),
        currency,
        isActive: isActive !== undefined ? isActive : true,
        workspaceId 
      };
      
      logger.info(`Creating service for workspace: ${workspaceId}`);
      const service = await this.serviceService.create(serviceData);
      return res.status(201).json(service);
    } catch (error: any) {
      logger.error("Error creating service:", error);
      
      if (error.message === 'Invalid service data') {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Failed to create service' });
    }
  }

  /**
   * Update a service
   */
  async updateService(req: WorkspaceRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { workspaceId } = req.workspaceContext;
      
      // Verify service belongs to the workspace
      const existingService = await this.serviceService.getById(id, workspaceId);
      if (!existingService) {
        return res.status(404).json({ error: 'Service not found in specified workspace' });
      }
      
      const { name, description, price, currency, duration, isActive } = req.body;
      
      // Process numeric fields
      const updateData: any = { name, description, currency, isActive };
      
      if (price !== undefined) {
        updateData.price = parseFloat(price);
      }
      
      if (duration !== undefined) {
        updateData.duration = parseInt(duration, 10);
      }
      
      const service = await this.serviceService.update(id, updateData);
      
      return res.json(service);
    } catch (error: any) {
      logger.error(`Error updating service ${req.params.id}:`, error);
      
      if (error.message === 'Service not found') {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      if (error.message === 'Invalid service data') {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Failed to update service' });
    }
  }

  /**
   * Delete a service
   */
  async deleteService(req: WorkspaceRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { workspaceId } = req.workspaceContext;
      
      // Verify service belongs to the workspace
      const existingService = await this.serviceService.getById(id, workspaceId);
      if (!existingService) {
        return res.status(404).json({ error: 'Service not found in specified workspace' });
      }
      
      await this.serviceService.delete(id);
      return res.status(204).send();
    } catch (error: any) {
      logger.error(`Error deleting service ${req.params.id}:`, error);
      
      if (error.message === 'Service not found') {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      return res.status(500).json({ error: 'Failed to delete service' });
    }
  }
} 