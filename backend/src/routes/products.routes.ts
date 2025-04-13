import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { asyncMiddleware } from '../middlewares/async.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

// Create controller instance
const productController = new ProductController();

// Create a router builder function
export const productsRouter = () => {
  const publicRouter = Router();
  const protectedRouter = Router();

  // Public routes
  publicRouter.get('/workspaces/:workspaceId/products', asyncMiddleware(productController.getAllProducts));
  publicRouter.get('/workspaces/:workspaceId/products/category/:categoryId', asyncMiddleware(productController.getProductsByCategory));
  publicRouter.get('/workspaces/:workspaceId/products/:id', asyncMiddleware(productController.getProductById));

  // Protected routes
  protectedRouter.use(authMiddleware);
  protectedRouter.post('/workspaces/:workspaceId/products', asyncMiddleware(productController.createProduct));
  protectedRouter.put('/workspaces/:workspaceId/products/:id', asyncMiddleware(productController.updateProduct));
  protectedRouter.delete('/workspaces/:workspaceId/products/:id', asyncMiddleware(productController.deleteProduct));
  protectedRouter.patch('/workspaces/:workspaceId/products/:id/stock', asyncMiddleware(productController.updateProductStock));
  protectedRouter.patch('/workspaces/:workspaceId/products/:id/status', asyncMiddleware(productController.updateProductStatus));

  // Combine routers
  const router = Router();
  router.use(publicRouter);
  router.use(protectedRouter);

  return router;
};

export default productsRouter(); 