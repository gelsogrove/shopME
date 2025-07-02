import { Request, Response } from 'express';
import { ProductService } from '../../../application/services/product.service';
import ServiceService from '../../../application/services/service.service';
import logger from '../../../utils/logger';

export class CallingFunctionController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Get products with active categories for calling function
   * Requires token validation and filters by:
   * - product.isActive = true
   * - category.isActive = true  
   * - stock > 1
   * Ordered by category name
   */
  getProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { workspaceId, categoryId } = req.query;
      
      if (!workspaceId || typeof workspaceId !== 'string') {
        logger.error('WorkspaceId mancante nella richiesta CF getProducts');
        return res.status(400).json({ 
          success: false,
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }

      logger.info(`CF getProducts called for workspaceId: ${workspaceId}`);
      
      const products = await this.productService.getAllProductsWithActiveCategoriesOrderedByCategory(
        workspaceId,
        categoryId as string
      );
      
      return res.json({
        success: true,
        products,
        count: products.length,
        workspaceId,
        filters: {
          categoryId: categoryId || null,
          conditions: [
            'product.isActive = true',
            'category.isActive = true', 
            'stock > 1'
          ]
        }
      });
    } catch (error) {
      logger.error('Error in CF getProducts:', error);
      return res.status(500).json({ 
        success: false,
        message: 'An error occurred while fetching products for calling function',
        error: (error as Error).message 
      });
    }
  };

  /**
   * Get all services for calling function
   * Requires token validation and filters by workspaceId
   */
  getServices = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { workspaceId } = req.query;
      
      if (!workspaceId || typeof workspaceId !== 'string') {
        logger.error('WorkspaceId mancante nella richiesta CF getServices');
        return res.status(400).json({ 
          success: false,
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }

      logger.info(`CF getServices called for workspaceId: ${workspaceId}`);
      
      const services = await ServiceService.getAllForWorkspace(workspaceId);
      
      return res.json({
        success: true,
        services,
        count: services.length,
        workspaceId
      });
    } catch (error) {
      logger.error('Error in CF getServices:', error);
      return res.status(500).json({ 
        success: false,
        message: 'An error occurred while fetching services for calling function',
        error: (error as Error).message 
      });
    }
  };

  /**
   * Call operator request - Creates a request for human operator assistance
   * Requires token validation and saves operator request in database
   */
  callOperator = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { workspaceId, phoneNumber, chatId, timestamp, message } = req.body;
      
      // Validate required fields
      if (!workspaceId || !phoneNumber || !chatId || !timestamp || !message) {
        logger.error('Missing required fields for callOperator request');
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
          error: 'workspaceId, phoneNumber, chatId, timestamp, and message are required'
        });
      }

      const { prisma } = await import('../../../lib/prisma');
      
      // Create operator request
      const operatorRequest = await prisma.operatorRequests.create({
        data: {
          workspaceId,
          phoneNumber,
          chatId,
          message,
          timestamp: new Date(timestamp),
          status: 'PENDING'
        }
      });

      logger.info(`CF callOperator: Created request ${operatorRequest.id} for phone ${phoneNumber} in workspace ${workspaceId}`);

      return res.status(201).json({
        success: true,
        requestId: operatorRequest.id,
        status: 'PENDING',
        message: 'Richiesta inviata. Un operatore ti contatterà presto.',
        timestamp: operatorRequest.createdAt
      });

    } catch (error) {
      logger.error('Error in CF callOperator:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create operator request',
        error: (error as Error).message
      });
    }
  };
}