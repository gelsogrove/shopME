import { Response } from 'express';
import { CreateServiceDTO, ServiceDTO, UpdateServiceDTO } from '../../../application/dtos/service.dto';
import { validateDTO } from '../../../utils/dto-validator';
import logger from '../../../utils/logger';
import { WorkspaceRequest } from '../types/workspace-request';

/**
 * Example DDD Controller showcasing proper use of DTOs
 * This is a reference implementation for other controllers to follow
 */
export class ExampleDDDController {
  /**
   * GET method example
   */
  async getItem(req: WorkspaceRequest, res: Response): Promise<Response> {
    try {
      // Access workspaceId from validated context
      const { workspaceId } = req.workspaceContext;
      
      // Log using workspace context
      logger.info(`Processing request for workspace: ${workspaceId}`);
      
      // Return a DTO response
      const serviceDTO = new ServiceDTO();
      serviceDTO.id = 'example-uuid';
      serviceDTO.name = 'Example Service';
      serviceDTO.description = 'This is an example service';
      serviceDTO.price = 99.99;
      serviceDTO.currency = 'EUR';
      serviceDTO.workspaceId = workspaceId;
      
      // Return the response
      return res.status(200).json(serviceDTO);
    } catch (error) {
      logger.error('Error in getItem', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * POST method example with DTO validation
   */
  async createItem(req: WorkspaceRequest, res: Response): Promise<Response> {
    try {
      // Access workspaceId from validated context
      const { workspaceId } = req.workspaceContext;
      
      // Validate incoming data against DTO
      const createServiceData = { ...req.body, workspaceId };
      
      try {
        // Validate using our utility
        const validatedData = await validateDTO(CreateServiceDTO, createServiceData);
        
        // Log successful validation
        logger.info(`Validated service creation request for workspace: ${workspaceId}`);
        
        // In a real implementation, we would call a service to save the data
        // For now, just return the validated data with a fake ID
        return res.status(201).json({
          id: 'new-example-uuid',
          ...validatedData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (validationError: any) {
        // Specific error handling for validation issues
        logger.warn(`Validation error for service creation: ${validationError.message}`, {
          errors: validationError.errors
        });
        
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationError.errors 
        });
      }
    } catch (error) {
      logger.error('Error in createItem', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * PUT method example with DTO validation
   */
  async updateItem(req: WorkspaceRequest, res: Response): Promise<Response> {
    try {
      // Get item id from params
      const { id } = req.params;
      
      // Access workspaceId from validated context
      const { workspaceId } = req.workspaceContext;
      
      try {
        // Validate update data using our utility
        const validatedData = await validateDTO(UpdateServiceDTO, req.body);
        
        // Log successful validation
        logger.info(`Validated service update request for id: ${id} in workspace: ${workspaceId}`);
        
        // In a real implementation, we would call a service to update the data
        // For now, just return the validated data with the ID
        return res.status(200).json({
          id,
          ...validatedData,
          workspaceId,
          updatedAt: new Date()
        });
      } catch (validationError: any) {
        // Specific error handling for validation issues
        logger.warn(`Validation error for service update: ${validationError.message}`, {
          errors: validationError.errors
        });
        
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationError.errors 
        });
      }
    } catch (error) {
      logger.error('Error in updateItem', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
} 