import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  getAllProducts = async (req: Request, res: Response) => {
    try {
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const effectiveWorkspaceId = workspaceIdParam || workspaceIdQuery;
      
      const { 
        search, 
        categoryId,
        supplierId, 
        status, 
        page, 
        limit 
      } = req.query;
      
      console.log('Get products request received:', {
        paramsWorkspaceId: workspaceIdParam,
        queryWorkspaceId: workspaceIdQuery,
        effectiveWorkspaceId,
        search,
        categoryId,
        supplierId,
        status,
        page,
        limit,
        params: req.params,
        headers: req.headers,
        url: req.url,
        method: req.method,
        path: req.path,
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl,
        query: req.query
      });
      
      if (!effectiveWorkspaceId) {
        console.error('WorkspaceId mancante nella richiesta');
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      const pageNumber = page ? parseInt(page as string) : undefined;
      const limitNumber = limit ? parseInt(limit as string) : undefined;
      
      console.log('Chiamata a productService.getAllProducts con:', {
        effectiveWorkspaceId,
        options: {
          search,
          categoryId,
          supplierId,
          status,
          pageNumber,
          limitNumber
        }
      });
      
      const result = await this.productService.getAllProducts(
        effectiveWorkspaceId,
        {
          search: search as string,
          categoryId: categoryId as string,
          supplierId: supplierId as string,
          status: status as string,
          page: pageNumber,
          limit: limitNumber
        }
      );
      
      console.log('Risultato ottenuto dal service:', {
        totalProdotti: result.total,
        numeroProdotti: result.products.length,
        paginaCorrente: result.page,
        totalePagine: result.totalPages
      });
      
      return res.json(result.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ 
        message: 'An error occurred while fetching products',
        error: (error as Error).message 
      });
    }
  };

  getProductById = async (req: Request, res: Response) => {
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
  };

  getProductsByCategory = async (req: Request, res: Response) => {
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
  };

  createProduct = async (req: Request, res: Response) => {
    try {
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery;
      
      const productData = req.body;
      
      console.log('Creazione prodotto richiesta:', {
        workspaceIdParam,
        workspaceIdQuery,
        effectiveWorkspaceId: workspaceId,
        productData
      });
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      if (!productData.workspaceId) {
        productData.workspaceId = workspaceId;
      }
      
      if (!productData.slug && productData.name) {
        productData.slug = productData.name
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-') + '-' + Date.now();
      }
      
      console.log('Dati prodotto pre-creazione:', productData);
      
      const product = await this.productService.createProduct(productData);
      
      console.log('Prodotto creato con successo:', {
        id: product.id,
        name: product.name,
        workspaceId: product.workspaceId
      });
      
      return res.status(201).json(product);
    } catch (error) {
      console.error('Errore durante la creazione del prodotto:', error);
      return res.status(500).json({ 
        message: 'An error occurred while creating the product',
        error: (error as Error).message 
      });
    }
  };

  updateProduct = async (req: Request, res: Response) => {
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
    if (!productData.workspaceId) {
      productData.workspaceId = workspaceId;
    }
    
    const product = await this.productService.updateProduct(id, productData);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  };

  deleteProduct = async (req: Request, res: Response) => {
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
    
    await this.productService.deleteProduct(id, workspaceId);
    return res.status(204).send();
  };

  updateProductStock = async (req: Request, res: Response) => {
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
    
    const { stock } = req.body;
    const product = await this.productService.updateProductStock(id, stock, workspaceId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  };

  updateProductStatus = async (req: Request, res: Response) => {
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
    
    const { status } = req.body;
    const product = await this.productService.updateProductStatus(id, status, workspaceId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  };
} 