import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { asyncMiddleware } from '../middlewares/async.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const publicRouter = Router();
const protectedRouter = Router();
const productController = new ProductController();

// Public routes
publicRouter.get('/', asyncMiddleware(productController.getAllProducts));
publicRouter.get('/category/:categoryId', asyncMiddleware(productController.getProductsByCategory));
publicRouter.get('/:id', asyncMiddleware(productController.getProductById));

// Protected routes
protectedRouter.use(authMiddleware);
protectedRouter.post('/', asyncMiddleware(productController.createProduct));
protectedRouter.put('/:id', asyncMiddleware(productController.updateProduct));
protectedRouter.delete('/:id', asyncMiddleware(productController.deleteProduct));
protectedRouter.patch('/:id/stock', asyncMiddleware(productController.updateProductStock));
protectedRouter.patch('/:id/status', asyncMiddleware(productController.updateProductStatus));

// Combine routers
const router = Router();
router.use('/', publicRouter);
router.use('/', protectedRouter);

export default router; 