import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import logger from '../../../utils/logger';

export function createOrderRouter(): Router {
  const router = Router();
  const orderController = new OrderController();

  // Apply auth middleware to all routes
  router.use(authMiddleware);

  // Log route registration
  logger.info('Setting up order routes');

  // GET /orders - Get all orders with filters and pagination
  router.get('/', orderController.getAllOrders);

  // GET /orders/analytics - Get order analytics
  router.get('/analytics', orderController.getOrderAnalytics);

  // GET /orders/date-range - Get orders by date range
  router.get('/date-range', orderController.getOrdersByDateRange);

  // GET /orders/:id - Get order by ID
  router.get('/:id', orderController.getOrderById);

  // GET /orders/code/:orderCode - Get order by order code
  router.get('/code/:orderCode', orderController.getOrderByCode);

  // GET /orders/customer/:customerId - Get orders by customer ID
  router.get('/customer/:customerId', orderController.getOrdersByCustomer);

  // POST /orders - Create new order
  router.post('/', orderController.createOrder);

  // PUT /orders/:id - Update order
  router.put('/:id', orderController.updateOrder);

  // DELETE /orders/:id - Delete order
  router.delete('/:id', orderController.deleteOrder);

  // PATCH /orders/:id/status - Update order status
  router.patch('/:id/status', orderController.updateOrderStatus);

  // PATCH /orders/:id/payment-status - Update payment status
  router.patch('/:id/payment-status', orderController.updatePaymentStatus);

  logger.info('Order routes configured');

  return router;
}

export default createOrderRouter;