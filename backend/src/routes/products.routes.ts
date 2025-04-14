import { Request, Response, Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { asyncMiddleware } from '../middlewares/async.middleware';
// Commento temporaneamente per i test
// import { authMiddleware } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

// Create controller instance
const productController = new ProductController();

// Create a router builder function
export const productsRouter = () => {
  const router = Router();

  // Log per debug
  console.log('Inizializzazione delle route dei prodotti');

  // Endpoint di diagnostica per verificare tutti i prodotti nel DB
  router.get('/debug/products', asyncMiddleware(async (req: Request, res: Response) => {
    // Conta il numero totale di prodotti
    const count = await prisma.products.count();
    
    // Prendi i primi 20 prodotti dal DB
    const products = await prisma.products.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({
      totalCount: count,
      sample: products.map(p => ({
        id: p.id,
        name: p.name,
        workspaceId: p.workspaceId,
        isActive: p.isActive,
        status: p.status,
        createdAt: p.createdAt
      }))
    });
  }));

  // Endpoint di diagnostica per vedere tutti i prodotti di uno specifico workspace
  router.get('/debug/workspaces/:workspaceId/products', asyncMiddleware(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'WorkspaceId richiesto' });
    }
    
    // Conta il numero totale di prodotti nel workspace
    const count = await prisma.products.count({
      where: { workspaceId }
    });
    
    // Prendi tutti i prodotti del workspace (max 50)
    const products = await prisma.products.findMany({
      where: { workspaceId },
      take: 50,
      orderBy: { updatedAt: 'desc' }
    });
    
    return res.json({
      workspaceId,
      totalInWorkspace: count,
      products
    });
  }));

  // Public routes - Tutte le route sono pubbliche per i test
  router.get('/workspaces/:workspaceId/products', (req, res, next) => {
    console.log('GET /workspaces/:workspaceId/products chiamata', {
      workspaceId: req.params.workspaceId,
      query: req.query
    });
    return asyncMiddleware(productController.getAllProducts)(req, res, next);
  });
  
  router.get('/workspaces/:workspaceId/products/category/:categoryId', (req, res, next) => {
    console.log('GET /workspaces/:workspaceId/products/category/:categoryId chiamata', {
      workspaceId: req.params.workspaceId,
      categoryId: req.params.categoryId
    });
    return asyncMiddleware(productController.getProductsByCategory)(req, res, next);
  });
  
  router.get('/workspaces/:workspaceId/products/:id', (req, res, next) => {
    console.log('GET /workspaces/:workspaceId/products/:id chiamata', {
      workspaceId: req.params.workspaceId,
      id: req.params.id
    });
    return asyncMiddleware(productController.getProductById)(req, res, next);
  });

  // Tutte le route per ora sono pubbliche per i test
  router.post('/workspaces/:workspaceId/products', asyncMiddleware(productController.createProduct));
  router.put('/workspaces/:workspaceId/products/:id', asyncMiddleware(productController.updateProduct));
  router.delete('/workspaces/:workspaceId/products/:id', asyncMiddleware(productController.deleteProduct));
  router.patch('/workspaces/:workspaceId/products/:id/stock', asyncMiddleware(productController.updateProductStock));
  router.patch('/workspaces/:workspaceId/products/:id/status', asyncMiddleware(productController.updateProductStatus));

  console.log('Route dei prodotti inizializzate');

  return router;
};

export default productsRouter(); 