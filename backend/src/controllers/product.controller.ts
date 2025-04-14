import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  getAllProducts = async (req: Request, res: Response) => {
    try {
      const { workspaceId } = req.params; // Prendi workspaceId dai parametri dell'URL
      const workspaceIdQuery = req.query.workspaceId as string; // Supporta anche workspaceId dalla query string
      const effectiveWorkspaceId = workspaceId || workspaceIdQuery;
      
      const { 
        search, 
        categoryId, 
        status, 
        page, 
        limit 
      } = req.query;
      
      // Log per debug completo
      console.log('Get products request received:', {
        paramsWorkspaceId: workspaceId,
        queryWorkspaceId: workspaceIdQuery,
        effectiveWorkspaceId,
        search,
        categoryId,
        status,
        page,
        limit,
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
      
      // Converti i parametri numerici da stringhe a numeri
      const pageNumber = page ? parseInt(page as string) : undefined;
      const limitNumber = limit ? parseInt(limit as string) : undefined;
      
      console.log('Chiamata a productService.getAllProducts con:', {
        effectiveWorkspaceId,
        options: {
          search,
          categoryId,
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
      
      return res.json(result);
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
    const product = await this.productService.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  };

  getProductsByCategory = async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const products = await this.productService.getProductsByCategory(categoryId);
    return res.json(products);
  };

  createProduct = async (req: Request, res: Response) => {
    try {
      const { workspaceId } = req.params;
      const productData = req.body;
      
      console.log('Creazione prodotto richiesta:', {
        workspaceId,
        productData
      });
      
      // Assicuriamoci che il workspaceId sia incluso nei dati del prodotto
      if (workspaceId && !productData.workspaceId) {
        productData.workspaceId = workspaceId;
      }
      
      // Generiamo uno slug dal nome del prodotto se non è fornito
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
    const productData = req.body;
    const product = await this.productService.updateProduct(id, productData);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  };

  deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.productService.deleteProduct(id);
    return res.status(204).send();
  };

  updateProductStock = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { stock } = req.body;
    const product = await this.productService.updateProductStock(id, stock);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  };

  updateProductStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const product = await this.productService.updateProductStatus(id, status);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  };
} 