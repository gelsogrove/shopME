import { ProductStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { ProductService } from '../../../application/services/product.service';
import { prisma } from '../../../lib/prisma';
import { embeddingService } from '../../../services/embeddingService';
import logger from '../../../utils/logger';
import { canAddProduct, getPlanLimitErrorMessage, PlanType } from '../../../utils/planLimits';

export class ProductController {
  private productService: ProductService;

  constructor(productService?: ProductService) {
    this.productService = productService || new ProductService();
  }

  getAllProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const effectiveWorkspaceId = workspaceIdParam || workspaceIdQuery;
      
      if (!effectiveWorkspaceId) {
        logger.error('WorkspaceId mancante nella richiesta');
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      const { 
        search, 
        categoryId,
   
        status, 
        page, 
        limit 
      } = req.query;
      
      const pageNumber = page ? parseInt(page as string) : undefined;
      const limitNumber = limit ? parseInt(limit as string) : undefined;
      
      const result = await this.productService.getAllProducts(
        effectiveWorkspaceId,
        {
          search: search as string,
          categoryId: categoryId as string,
          status: status as string,
          page: pageNumber,
          limit: limitNumber
        }
      );
      
      return res.json({
        products: result.products,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      logger.error('Error fetching products:', error);
      return res.status(500).json({ 
        message: 'An error occurred while fetching products',
        error: (error as Error).message 
      });
    }
  };

  getProductById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      const product = await this.productService.getProductById(id, workspaceId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.json(product);
    } catch (error) {
      logger.error(`Error getting product by ID:`, error);
      return res.status(500).json({ 
        message: 'An error occurred while fetching the product',
        error: (error as Error).message 
      });
    }
  };

  getProductsByCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { categoryId } = req.params;
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      const products = await this.productService.getProductsByCategory(categoryId, workspaceId);
      return res.json(products);
    } catch (error) {
      logger.error(`Error getting products by category:`, error);
      return res.status(500).json({ 
        message: 'An error occurred while fetching products by category',
        error: (error as Error).message 
      });
    }
  };

  createProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery;
      
      const productData = req.body;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }

      // Check workspace plan and current product count
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { plan: true }
      });

      if (!workspace) {
        return res.status(404).json({
          message: 'Workspace not found',
          error: 'Invalid workspaceId'
        });
      }

      // Count current active products
      const currentProductCount = await prisma.products.count({
        where: {
          workspaceId: workspaceId,
          isActive: true
        }
      });

      // Check if user can add another product based on their plan
      const planType = workspace.plan as PlanType;
      if (!canAddProduct(planType, currentProductCount)) {
        return res.status(403).json({
          message: 'Plan limit reached',
          error: getPlanLimitErrorMessage(planType, 'products')
        });
      }
      
      if (!productData.workspaceId) {
        productData.workspaceId = workspaceId;
      }
      
      const product = await this.productService.createProduct(productData);
      
      return res.status(201).json(product);
    } catch (error) {
      logger.error('Error creating product:', error);
      return res.status(error.message?.includes('required') ? 400 : 500).json({ 
        message: 'An error occurred while creating the product',
        error: (error as Error).message 
      });
    }
  };

  updateProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      const productData = req.body;
      
      // Validate required fields for update
      if (!productData.name || productData.name.trim() === '') {
        return res.status(400).json({ 
          message: 'Product name is required',
          error: 'Missing required field: name' 
        });
      }
      
      if (productData.price === undefined || productData.price === null || isNaN(productData.price) || productData.price < 0) {
        return res.status(400).json({ 
          message: 'Valid product price is required',
          error: 'Missing or invalid field: price' 
        });
      }
      
      const updatedProduct = await this.productService.updateProduct(id, productData, workspaceId);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      return res.json(updatedProduct);
    } catch (error) {
      logger.error('Error updating product:', error);
      return res.status(error.message?.includes('negative') ? 400 : 500).json({ 
        message: 'An error occurred while updating the product',
        error: (error as Error).message 
      });
    }
  };

  deleteProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      // Check if the product exists before deleting it
      const existingProduct = await this.productService.getProductById(id, workspaceId);
      if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      await this.productService.deleteProduct(id, workspaceId);
      return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      logger.error('Error deleting product:', error);
      return res.status(500).json({ 
        message: 'An error occurred while deleting the product',
        error: (error as Error).message 
      });
    }
  };

  updateProductStock = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      if (stock === undefined || stock === null) {
        return res.status(400).json({ 
          message: 'Stock value is required',
          error: 'Missing stock parameter' 
        });
      }
      
      const updatedProduct = await this.productService.updateProductStock(id, stock, workspaceId);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      return res.json(updatedProduct);
    } catch (error) {
      logger.error('Error updating product stock:', error);
      return res.status(error.message?.includes('negative') ? 400 : 500).json({ 
        message: 'An error occurred while updating product stock',
        error: (error as Error).message 
      });
    }
  };

  updateProductStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      if (!status || !Object.values(ProductStatus).includes(status as ProductStatus)) {
        return res.status(400).json({ 
          message: 'Valid status is required',
          error: 'Missing or invalid status parameter',
          validStatuses: Object.values(ProductStatus)
        });
      }
      
      const updatedProduct = await this.productService.updateProductStatus(id, status as ProductStatus, workspaceId);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      return res.json(updatedProduct);
    } catch (error) {
      logger.error('Error updating product status:', error);
      return res.status(500).json({ 
        message: 'An error occurred while updating product status',
        error: (error as Error).message 
      });
    }
  };

  getProductsWithDiscounts = async (req: Request, res: Response): Promise<Response> => {
    try {
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery;
      
      const { customerDiscount } = req.query;
      const discountValue = customerDiscount ? parseFloat(customerDiscount as string) : undefined;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      const products = await this.productService.getProductsWithDiscounts(workspaceId, discountValue);
      return res.json(products);
    } catch (error) {
      logger.error('Error fetching products with discounts:', error);
      return res.status(500).json({ 
        message: 'An error occurred while fetching products with discounts',
        error: (error as Error).message 
      });
    }
  };

  /**
   * Generate embeddings for all active products in a workspace
   * @swagger
   * /api/workspaces/{workspaceId}/products/generate-embeddings:
   *   post:
   *     summary: Generate embeddings for all active products in a workspace
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         required: true
   *         schema:
   *           type: string
   *         description: The workspace ID
   *     responses:
   *       200:
   *         description: Product embedding generation completed
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 processed:
   *                   type: number
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: string
   *       400:
   *         description: Bad request
   *       500:
   *         description: Failed to generate product embeddings
   */
  async generateEmbeddings(req: Request, res: Response): Promise<Response> {
    try {
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }

      logger.info(`Starting product embedding generation for workspace: ${workspaceId}`);

      const result = await embeddingService.generateProductEmbeddings(workspaceId);

      return res.status(200).json({
        message: 'Product embedding generation completed',
        processed: result.processed,
        errors: result.errors
      });

    } catch (error) {
      logger.error('Error generating product embeddings:', error);
      
      return res.status(500).json({
        message: 'Failed to generate product embeddings',
        error: (error as Error).message
      });
    }
  }
} 