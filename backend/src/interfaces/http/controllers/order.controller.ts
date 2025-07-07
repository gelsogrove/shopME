import { OrderStatus, PaymentStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { OrderService } from '../../../application/services/order.service';
import logger from '../../../utils/logger';

export class OrderController {
  private orderService: OrderService;

  constructor(orderService?: OrderService) {
    this.orderService = orderService || new OrderService();
  }

  getAllOrders = async (req: Request, res: Response): Promise<Response> => {
    try {
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceIdHeader = req.headers['x-workspace-id'] as string;
      const effectiveWorkspaceId = workspaceIdParam || workspaceIdQuery || workspaceIdHeader;
      
      if (!effectiveWorkspaceId) {
        logger.error('WorkspaceId missing in request');
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      const { 
        search, 
        customerId,
        status,
        paymentStatus,
        dateFrom,
        dateTo,
        page, 
        limit 
      } = req.query;
      
      const pageNumber = page ? parseInt(page as string) : undefined;
      const limitNumber = limit ? parseInt(limit as string) : undefined;
      const dateFromParsed = dateFrom ? new Date(dateFrom as string) : undefined;
      const dateToParsed = dateTo ? new Date(dateTo as string) : undefined;
      
      const result = await this.orderService.getAllOrders(
        effectiveWorkspaceId,
        {
          search: search as string,
          customerId: customerId as string,
          status: status as OrderStatus,
          paymentStatus: paymentStatus as PaymentStatus,
          dateFrom: dateFromParsed,
          dateTo: dateToParsed,
          page: pageNumber,
          limit: limitNumber
        }
      );
      
      return res.json({
        orders: result.orders,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      logger.error('Error fetching orders:', error);
      return res.status(500).json({ 
        message: 'An error occurred while fetching orders',
        error: (error as Error).message 
      });
    }
  };

  getOrderById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceIdHeader = req.headers['x-workspace-id'] as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery || workspaceIdHeader;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      const order = await this.orderService.getOrderById(id, workspaceId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.json(order);
    } catch (error) {
      logger.error(`Error getting order by ID:`, error);
      return res.status(500).json({ 
        message: 'An error occurred while fetching the order',
        error: (error as Error).message 
      });
    }
  };

  getOrderByCode = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { orderCode } = req.params;
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceIdHeader = req.headers['x-workspace-id'] as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery || workspaceIdHeader;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      const order = await this.orderService.getOrderByCode(orderCode, workspaceId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.json(order);
    } catch (error) {
      logger.error(`Error getting order by code:`, error);
      return res.status(500).json({ 
        message: 'An error occurred while fetching the order',
        error: (error as Error).message 
      });
    }
  };

  getOrdersByCustomer = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { customerId } = req.params;
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceIdHeader = req.headers['x-workspace-id'] as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery || workspaceIdHeader;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      const orders = await this.orderService.getOrdersByCustomerId(customerId, workspaceId);
      return res.json(orders);
    } catch (error) {
      logger.error(`Error getting orders by customer:`, error);
      return res.status(500).json({ 
        message: 'An error occurred while fetching orders by customer',
        error: (error as Error).message 
      });
    }
  };

  createOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceIdHeader = req.headers['x-workspace-id'] as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery || workspaceIdHeader;
      
      const orderData = req.body;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }

      // Validate required fields
      if (!orderData.customerId) {
        return res.status(400).json({ 
          message: 'Customer ID is required',
          error: 'Missing required field: customerId' 
        });
      }

      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return res.status(400).json({ 
          message: 'Order items are required',
          error: 'Missing or invalid field: items' 
        });
      }

      if (!orderData.totalAmount || orderData.totalAmount <= 0) {
        return res.status(400).json({ 
          message: 'Valid total amount is required',
          error: 'Missing or invalid field: totalAmount' 
        });
      }
      
      if (!orderData.workspaceId) {
        orderData.workspaceId = workspaceId;
      }
      
      const order = await this.orderService.createOrder(orderData);
      
      return res.status(201).json(order);
    } catch (error) {
      logger.error('Error creating order:', error);
      return res.status(error.message?.includes('required') ? 400 : 500).json({ 
        message: 'An error occurred while creating the order',
        error: (error as Error).message 
      });
    }
  };

  updateOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceIdHeader = req.headers['x-workspace-id'] as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery || workspaceIdHeader;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      const orderData = req.body;
      
      // Validate totalAmount if provided
      if (orderData.totalAmount !== undefined && orderData.totalAmount <= 0) {
        return res.status(400).json({ 
          message: 'Total amount must be greater than 0',
          error: 'Invalid field: totalAmount' 
        });
      }
      
      const updatedOrder = await this.orderService.updateOrder(id, orderData, workspaceId);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      return res.json(updatedOrder);
    } catch (error) {
      logger.error('Error updating order:', error);
      return res.status(error.message?.includes('greater than 0') ? 400 : 500).json({ 
        message: 'An error occurred while updating the order',
        error: (error as Error).message 
      });
    }
  };

  deleteOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceIdHeader = req.headers['x-workspace-id'] as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery || workspaceIdHeader;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      await this.orderService.deleteOrder(id, workspaceId);
      return res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
      logger.error('Error deleting order:', error);
      return res.status(500).json({ 
        message: 'An error occurred while deleting the order',
        error: (error as Error).message 
      });
    }
  };

  updateOrderStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceIdHeader = req.headers['x-workspace-id'] as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery || workspaceIdHeader;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      if (!status || !Object.values(OrderStatus).includes(status as OrderStatus)) {
        return res.status(400).json({ 
          message: 'Valid status is required',
          error: 'Missing or invalid status parameter',
          validStatuses: Object.values(OrderStatus)
        });
      }
      
      const updatedOrder = await this.orderService.updateOrderStatus(id, status as OrderStatus, workspaceId);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      return res.json(updatedOrder);
    } catch (error) {
      logger.error('Error updating order status:', error);
      return res.status(500).json({ 
        message: 'An error occurred while updating order status',
        error: (error as Error).message 
      });
    }
  };

  updatePaymentStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { paymentStatus } = req.body;
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceIdHeader = req.headers['x-workspace-id'] as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery || workspaceIdHeader;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }
      
      if (!paymentStatus || !Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)) {
        return res.status(400).json({ 
          message: 'Valid payment status is required',
          error: 'Missing or invalid paymentStatus parameter',
          validStatuses: Object.values(PaymentStatus)
        });
      }
      
      const updatedOrder = await this.orderService.updatePaymentStatus(id, paymentStatus as PaymentStatus, workspaceId);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      return res.json(updatedOrder);
    } catch (error) {
      logger.error('Error updating payment status:', error);
      return res.status(500).json({ 
        message: 'An error occurred while updating payment status',
        error: (error as Error).message 
      });
    }
  };

  getOrderAnalytics = async (req: Request, res: Response): Promise<Response> => {
    try {
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceIdHeader = req.headers['x-workspace-id'] as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery || workspaceIdHeader;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }

      const { 
        status,
        paymentStatus,
        dateFrom,
        dateTo
      } = req.query;

      const dateFromParsed = dateFrom ? new Date(dateFrom as string) : undefined;
      const dateToParsed = dateTo ? new Date(dateTo as string) : undefined;

      const analytics = await this.orderService.getOrderAnalytics(workspaceId, {
        status: status as OrderStatus,
        paymentStatus: paymentStatus as PaymentStatus,
        dateFrom: dateFromParsed,
        dateTo: dateToParsed
      });
      
      return res.json(analytics);
    } catch (error) {
      logger.error('Error fetching order analytics:', error);
      return res.status(500).json({ 
        message: 'An error occurred while fetching order analytics',
        error: (error as Error).message 
      });
    }
  };

  getOrdersByDateRange = async (req: Request, res: Response): Promise<Response> => {
    try {
      const workspaceIdParam = req.params.workspaceId;
      const workspaceIdQuery = req.query.workspaceId as string;
      const workspaceIdHeader = req.headers['x-workspace-id'] as string;
      const workspaceId = workspaceIdParam || workspaceIdQuery || workspaceIdHeader;
      
      const { startDate, endDate } = req.query;
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }

      if (!startDate || !endDate) {
        return res.status(400).json({ 
          message: 'Start date and end date are required',
          error: 'Missing startDate or endDate parameter' 
        });
      }

      const startDateParsed = new Date(startDate as string);
      const endDateParsed = new Date(endDate as string);

      if (isNaN(startDateParsed.getTime()) || isNaN(endDateParsed.getTime())) {
        return res.status(400).json({ 
          message: 'Invalid date format',
          error: 'Dates must be in valid ISO format' 
        });
      }
      
      const orders = await this.orderService.getOrdersByDateRange(workspaceId, startDateParsed, endDateParsed);
      return res.json(orders);
    } catch (error) {
      logger.error('Error fetching orders by date range:', error);
      return res.status(500).json({ 
        message: 'An error occurred while fetching orders by date range',
        error: (error as Error).message 
      });
    }
  };
}