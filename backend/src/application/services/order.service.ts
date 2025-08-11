import { OrderStatus } from '@prisma/client';
import { Order } from '../../domain/entities/order.entity';
import { IOrderRepository, OrderFilters } from '../../domain/repositories/order.repository.interface';
import { OrderRepository } from '../../repositories/order.repository';
import logger from '../../utils/logger';
import { StockService } from './stock.service';

export class OrderService {
  private orderRepository: IOrderRepository;
  private stockService: StockService;

  constructor(orderRepository?: IOrderRepository, stockService?: StockService) {
    this.orderRepository = orderRepository || new OrderRepository();
    this.stockService = stockService || new StockService();
  }

  async getAllOrders(workspaceId: string, filters?: OrderFilters) {
    try {
      logger.info('OrderService.getAllOrders called with:', { workspaceId, filters });
      return await this.orderRepository.findAll(workspaceId, filters);
    } catch (error) {
      logger.error('Error in order service getAllOrders:', error);
      throw new Error(`Failed to get orders: ${(error as Error).message}`);
    }
  }

  async getOrderById(id: string, workspaceId: string): Promise<Order | null> {
    try {
      if (!id) {
        throw new Error('Order ID is required');
      }
      
      return await this.orderRepository.findById(id, workspaceId);
    } catch (error) {
      logger.error(`Error in order service getOrderById for order ${id}:`, error);
      throw new Error(`Failed to get order: ${(error as Error).message}`);
    }
  }

  async getOrderByCode(orderCode: string, workspaceId: string): Promise<Order | null> {
    try {
      if (!orderCode) {
        throw new Error('Order code is required');
      }
      
      return await this.orderRepository.findByOrderCode(orderCode, workspaceId);
    } catch (error) {
      logger.error(`Error in order service getOrderByCode for order ${orderCode}:`, error);
      throw new Error(`Failed to get order by code: ${(error as Error).message}`);
    }
  }

  async getOrdersByCustomerId(customerId: string, workspaceId: string): Promise<Order[]> {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }
      
      return await this.orderRepository.findByCustomerId(customerId, workspaceId);
    } catch (error) {
      logger.error(`Error in order service getOrdersByCustomerId for customer ${customerId}:`, error);
      throw new Error(`Failed to get orders by customer: ${(error as Error).message}`);
    }
  }

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    try {
      if (!orderData.customerId) {
        throw new Error('Customer ID is required');
      }

      if (!orderData.workspaceId) {
        throw new Error('Workspace ID is required');
      }

      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('Order must have at least one item');
      }

      if (!orderData.totalAmount || orderData.totalAmount <= 0) {
        throw new Error('Total amount must be greater than 0');
      }

      // Set default values
      orderData.status = orderData.status || OrderStatus.PENDING;
      orderData.shippingAmount = orderData.shippingAmount || 0;
      orderData.taxAmount = orderData.taxAmount || 0;
      orderData.discountAmount = orderData.discountAmount || 0;

      // Generate order code if not provided
      if (!orderData.orderCode) {
        orderData.orderCode = this.generateOrderCode();
      }

      // Create a proper domain entity
      const order = new Order(orderData);
      
      return await this.orderRepository.create(order);
    } catch (error) {
      logger.error('Error in order service createOrder:', error);
      throw new Error(`Failed to create order: ${(error as Error).message}`);
    }
  }

  async updateOrder(id: string, orderData: Partial<Order>, workspaceId: string): Promise<Order | null> {
    try {
      if (!id) {
        throw new Error('Order ID is required');
      }

      // Check if totalAmount is valid when provided
      if (orderData.totalAmount !== undefined && orderData.totalAmount <= 0) {
        throw new Error('Total amount must be greater than 0');
      }

      return await this.orderRepository.update(id, orderData, workspaceId);
    } catch (error) {
      logger.error(`Error in order service updateOrder for order ${id}:`, error);
      throw new Error(`Failed to update order: ${(error as Error).message}`);
    }
  }

  async deleteOrder(id: string, workspaceId: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('Order ID is required');
      }

      // Check if order exists and can be deleted
      const order = await this.orderRepository.findById(id, workspaceId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Only allow deletion of pending orders
      if (order.status !== OrderStatus.PENDING) {
        throw new Error('Only pending orders can be deleted');
      }

      await this.orderRepository.delete(id, workspaceId);
    } catch (error) {
      logger.error(`Error in order service deleteOrder for order ${id}:`, error);
      throw new Error(`Failed to delete order: ${(error as Error).message}`);
    }
  }

  async updateOrderStatus(id: string, status: OrderStatus, workspaceId: string): Promise<Order | null> {
    try {
      if (!id) {
        throw new Error('Order ID is required');
      }

      // Check if order exists
      const order = await this.orderRepository.findById(id, workspaceId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Validate status transitions
      if (!this.isValidStatusTransition(order.status, status)) {
        throw new Error(`Invalid status transition from ${order.status} to ${status}`);
      }

      const oldStatus = order.status;

      // Update order status
      const updatedOrder = await this.orderRepository.updateStatus(id, status, workspaceId);

      // Handle stock management and notifications
      if (updatedOrder) {
        await this.stockService.handleOrderStatusChange(id, oldStatus, status);
      }

      return updatedOrder;
    } catch (error) {
      logger.error(`Error in order service updateOrderStatus for order ${id}:`, error);
      throw new Error(`Failed to update order status: ${(error as Error).message}`);
    }
  }

  // Payment status is now handled by PaymentDetails table

  async getOrdersByDateRange(workspaceId: string, startDate: Date, endDate: Date): Promise<Order[]> {
    try {
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }

      if (startDate > endDate) {
        throw new Error('Start date must be before end date');
      }

      return await this.orderRepository.getOrdersByDateRange(workspaceId, startDate, endDate);
    } catch (error) {
      logger.error('Error in order service getOrdersByDateRange:', error);
      throw new Error(`Failed to get orders by date range: ${(error as Error).message}`);
    }
  }

  async getOrdersCount(workspaceId: string, filters?: OrderFilters): Promise<number> {
    try {
      return await this.orderRepository.getOrdersCount(workspaceId, filters);
    } catch (error) {
      logger.error('Error in order service getOrdersCount:', error);
      throw new Error(`Failed to get orders count: ${(error as Error).message}`);
    }
  }

  async getTotalRevenue(workspaceId: string, filters?: OrderFilters): Promise<number> {
    try {
      return await this.orderRepository.getTotalRevenue(workspaceId, filters);
    } catch (error) {
      logger.error('Error in order service getTotalRevenue:', error);
      throw new Error(`Failed to get total revenue: ${(error as Error).message}`);
    }
  }

  private generateOrderCode(): string {
    // Generate 5-digit numeric code (10000-99999)
    const min = 10000;
    const max = 99999;
    const code = Math.floor(Math.random() * (max - min + 1)) + min;
    return code.toString();
  }

  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [], // No transitions from delivered
      [OrderStatus.CANCELLED]: []  // No transitions from cancelled
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Get order analytics for dashboard
   * @param workspaceId Workspace ID
   * @param filters Optional filters
   * @returns Order analytics data
   */
  async getOrderAnalytics(workspaceId: string, filters?: OrderFilters) {
    try {
      const [totalOrders, totalRevenue, pendingOrders, completedOrders] = await Promise.all([
        this.orderRepository.getOrdersCount(workspaceId, filters),
        this.orderRepository.getTotalRevenue(workspaceId, filters),
        this.orderRepository.getOrdersCount(workspaceId, { ...filters, status: OrderStatus.PENDING }),
        this.orderRepository.getOrdersCount(workspaceId, { ...filters, status: OrderStatus.DELIVERED })
      ]);

      return {
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      };
    } catch (error) {
      logger.error('Error in order service getOrderAnalytics:', error);
      throw new Error(`Failed to get order analytics: ${(error as Error).message}`);
    }
  }

  async getLatestProcessingTracking(workspaceId: string, customerId: string): Promise<{
    orderId: string
    orderCode: string
    status: OrderStatus
    trackingNumber: string | null
    trackingUrl: string | null
  } | null> {
    try {
      if (!workspaceId || !customerId) {
        throw new Error('workspaceId and customerId are required')
      }
      const order = await this.orderRepository.findLatestProcessingByCustomer(customerId, workspaceId)
      if (!order) {
        return null
      }
      const { buildDhlTrackingUrl } = await import('../../config')
      const trackingUrl = buildDhlTrackingUrl(order.trackingNumber)
      return {
        orderId: order.id,
        orderCode: order.orderCode,
        status: order.status,
        trackingNumber: order.trackingNumber || null,
        trackingUrl,
      }
    } catch (error) {
      logger.error('Error in getLatestProcessingTracking:', error)
      throw error
    }
  }
}