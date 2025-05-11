import { Request, Response, Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { asyncMiddleware } from '../middlewares/async.middleware';
// Commento temporaneamente per i test
// import { authMiddleware } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

// Funzione di utilità per ottenere il workspaceId
const getWorkspaceId = (req: Request): string | undefined => {
  // Estrai workspaceId da params o query
  const workspaceId = req.params.workspaceId || req.query.workspaceId as string;
  console.log('getWorkspaceId helper:', {
    from_params: req.params.workspaceId,
    from_query: req.query.workspaceId,
    result: workspaceId,
    url: req.url,
    baseUrl: req.baseUrl,
    path: req.path,
    params: req.params
  });
  return workspaceId;
};

// Creiamo un'esportazione simile a quella dei servizi che funzionano
const createProductsRouter = () => {
  console.log('========== CREAZIONE PRODUCTS ROUTER ==========');
  
  // Create controller instance
  const productController = new ProductController();
  
  // Create a router
  const router = Router({ mergeParams: true }); // Importante: mergeParams per accedere ai parametri dal router parent
  
  // Endpoint di diagnostica per verificare tutti i prodotti nel DB
  router.get('/debug/products', asyncMiddleware(async (req: Request, res: Response) => {
    console.log('Endpoint di diagnostica /debug/products chiamato');
    // Conta il numero totale di prodotti
    const count = await prisma.products.count();
    
    // Prendi i primi 20 prodotti dal DB
    const products = await prisma.products.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Diagnostica: trovati ${count} prodotti totali nel DB`);
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
  
  // Tutti i percorsi relativi in uno stile simile a services.routes.ts
  // GET - lista di tutti i prodotti
  router.get('/', (req, res, next) => {
    console.log('GET / chiamata su products router', { 
      params: req.params,
      workspaceId: getWorkspaceId(req),
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl
    });
    return asyncMiddleware(productController.getAllProducts)(req, res, next);
  });
  
  // POST - crea un nuovo prodotto
  router.post('/', (req, res, next) => {
    console.log('POST / chiamata su products router', {
      params: req.params,
      workspaceId: getWorkspaceId(req)
    });
    return asyncMiddleware(productController.createProduct)(req, res, next);
  });
  
  // GET - ottieni prodotto per ID
  router.get('/:id', (req, res, next) => {
    console.log('GET /:id chiamata su products router', {
      id: req.params.id,
      params: req.params,
      workspaceId: getWorkspaceId(req)
    });
    return asyncMiddleware(productController.getProductById)(req, res, next);
  });
  
  // PUT - aggiorna prodotto
  router.put('/:id', (req, res, next) => {
    console.log('PUT /:id chiamata su products router', {
      id: req.params.id,
      params: req.params,
      workspaceId: getWorkspaceId(req)
    });
    return asyncMiddleware(productController.updateProduct)(req, res, next);
  });
  
  // DELETE - elimina prodotto
  router.delete('/:id', (req, res, next) => {
    console.log('DELETE /:id chiamata su products router', {
      id: req.params.id,
      params: req.params,
      workspaceId: getWorkspaceId(req)
    });
    return asyncMiddleware(productController.deleteProduct)(req, res, next);
  });
  
  // GET - prodotti per categoria
  router.get('/category/:categoryId', (req, res, next) => {
    console.log('GET /category/:categoryId chiamata su products router', {
      categoryId: req.params.categoryId,
      params: req.params,
      workspaceId: getWorkspaceId(req)
    });
    return asyncMiddleware(productController.getProductsByCategory)(req, res, next);
  });
  
  // PATCH - aggiorna stock prodotto
  router.patch('/:id/stock', (req, res, next) => {
    console.log('PATCH /:id/stock chiamata su products router', {
      id: req.params.id,
      params: req.params,
      workspaceId: getWorkspaceId(req),
      body: req.body
    });
    return asyncMiddleware(productController.updateProductStock)(req, res, next);
  });
  
  // PATCH - aggiorna status prodotto
  router.patch('/:id/status', (req, res, next) => {
    console.log('PATCH /:id/status chiamata su products router', {
      id: req.params.id,
      params: req.params,
      workspaceId: getWorkspaceId(req),
      body: req.body
    });
    return asyncMiddleware(productController.updateProductStatus)(req, res, next);
  });
  
  console.log('Router dei prodotti creato con successo');
  console.log('========== FINE CREAZIONE PRODUCTS ROUTER ==========');
  
  return router;
};

export default createProductsRouter; 