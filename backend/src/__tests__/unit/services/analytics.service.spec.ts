import { AnalyticsService } from '../../../application/services/analytics.service';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client');

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = {
      orders: {
        findMany: jest.fn(),
        groupBy: jest.fn(),
      },
      customers: {
        findMany: jest.fn(),
      },
      message: {
        findMany: jest.fn(),
      },
      orderItems: {
        findMany: jest.fn(),
        groupBy: jest.fn(),
      },
      chatSession: {
        findMany: jest.fn(),
      },
      products: {
        findMany: jest.fn(),
      },
    } as any;

    // Replace the prisma instance in AnalyticsService
    analyticsService = new AnalyticsService();
    (analyticsService as any).prisma = mockPrisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardAnalytics', () => {
    const workspaceId = 'test-workspace-id';
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-03-31');

    beforeEach(() => {
      // Mock basic responses
      mockPrisma.orders.findMany.mockResolvedValue([
        {
          id: '1',
          total: 100,
          createdAt: new Date('2024-01-15'),
          customer: { id: 'customer1', name: 'Test Customer' },
          items: []
        },
        {
          id: '2',
          total: 200,
          createdAt: new Date('2024-02-15'),
          customer: { id: 'customer2', name: 'Test Customer 2' },
          items: []
        }
      ]);

      mockPrisma.customers.findMany.mockResolvedValue([
        {
          id: 'customer1',
          name: 'Test Customer',
          createdAt: new Date('2024-01-10'),
          workspaceId
        },
        {
          id: 'customer2', 
          name: 'Test Customer 2',
          createdAt: new Date('2024-02-10'),
          workspaceId
        }
      ]);

      mockPrisma.message.findMany.mockResolvedValue([
        {
          id: 'msg1',
          content: 'Hello',
          aiGenerated: true,
          createdAt: new Date('2024-01-15')
        },
        {
          id: 'msg2',
          content: 'Hi there',
          aiGenerated: false,
          createdAt: new Date('2024-02-15')
        }
      ]);

      mockPrisma.orderItems.findMany.mockResolvedValue([]);

      mockPrisma.chatSession.findMany.mockResolvedValue([
        {
          id: 'session1',
          startedAt: new Date('2024-01-15'),
          endedAt: new Date('2024-01-15T01:00:00'),
          workspaceId
        }
      ]);

      mockPrisma.orderItems.groupBy.mockResolvedValue([
        {
          productId: 'product1',
          _sum: { quantity: 10, price: 150 }
        }
      ]);

      mockPrisma.products.findMany.mockResolvedValue([
        {
          id: 'product1',
          name: 'Test Product',
          stock: 50,
          workspaceId
        }
      ]);
    });

    it('should return dashboard analytics with correct structure', async () => {
      const result = await analyticsService.getDashboardAnalytics(workspaceId, startDate, endDate);

      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('topProducts');
      expect(result).toHaveProperty('customerEngagement');

      // Check overview structure
      expect(result.overview).toHaveProperty('totalOrders');
      expect(result.overview).toHaveProperty('totalRevenue');
      expect(result.overview).toHaveProperty('totalCustomers');
      expect(result.overview).toHaveProperty('totalMessages');
      expect(result.overview).toHaveProperty('averageOrderValue');

      // Check calculated values
      expect(result.overview.totalOrders).toBe(2);
      expect(result.overview.totalRevenue).toBe(300);
      expect(result.overview.totalCustomers).toBe(2);
      expect(result.overview.totalMessages).toBe(2);
      expect(result.overview.averageOrderValue).toBe(150);
    });

    it('should filter data by workspaceId in all queries', async () => {
      await analyticsService.getDashboardAnalytics(workspaceId, startDate, endDate);

      // Verify workspace filtering in all queries
      expect(mockPrisma.orders.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            workspaceId
          })
        })
      );

      expect(mockPrisma.customers.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            workspaceId
          })
        })
      );

      expect(mockPrisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            chatSession: { workspaceId }
          })
        })
      );
    });

    it('should filter data by date range', async () => {
      await analyticsService.getDashboardAnalytics(workspaceId, startDate, endDate);

      // Verify date filtering
      expect(mockPrisma.orders.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          })
        })
      );

      expect(mockPrisma.customers.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          })
        })
      );
    });

    it('should return top products with correct data', async () => {
      const result = await analyticsService.getDashboardAnalytics(workspaceId, startDate, endDate);

      expect(result.topProducts).toHaveLength(1);
      expect(result.topProducts[0]).toEqual({
        id: 'product1',
        name: 'Test Product',
        totalSold: 10,
        revenue: 150,
        stock: 50
      });
    });

    it('should calculate AI response rate correctly', async () => {
      const result = await analyticsService.getDashboardAnalytics(workspaceId, startDate, endDate);

      // 1 AI message out of 2 total = 50%
      expect(result.customerEngagement.messageResponseRate).toBe(50);
    });

    it('should handle empty data gracefully', async () => {
      // Mock empty responses
      mockPrisma.orders.findMany.mockResolvedValue([]);
      mockPrisma.customers.findMany.mockResolvedValue([]);
      mockPrisma.message.findMany.mockResolvedValue([]);
      mockPrisma.orderItems.findMany.mockResolvedValue([]);
      mockPrisma.chatSession.findMany.mockResolvedValue([]);
      mockPrisma.orderItems.groupBy.mockResolvedValue([]);

      const result = await analyticsService.getDashboardAnalytics(workspaceId, startDate, endDate);

      expect(result.overview.totalOrders).toBe(0);
      expect(result.overview.totalRevenue).toBe(0);
      expect(result.overview.averageOrderValue).toBe(0);
      expect(result.customerEngagement.messageResponseRate).toBe(0);
      expect(result.topProducts).toHaveLength(0);
    });
  });

  describe('getDetailedMetrics', () => {
    const workspaceId = 'test-workspace-id';
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-03-31');

    it('should return detailed order metrics', async () => {
      const mockOrders = [
        {
          id: '1',
          total: 100,
          createdAt: new Date('2024-01-15'),
          customer: { name: 'Test Customer' },
          items: []
        }
      ];

      mockPrisma.orders.findMany.mockResolvedValue(mockOrders);

      const result = await analyticsService.getDetailedMetrics(workspaceId, startDate, endDate, 'orders');

      expect(result).toEqual(mockOrders);
      expect(mockPrisma.orders.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            workspaceId,
            createdAt: { gte: startDate, lte: endDate }
          }),
          include: expect.objectContaining({
            customer: true,
            items: expect.objectContaining({
              include: { product: true }
            })
          })
        })
      );
    });

    it('should throw error for unknown metric', async () => {
      await expect(
        analyticsService.getDetailedMetrics(workspaceId, startDate, endDate, 'unknown')
      ).rejects.toThrow('Unknown metric: unknown');
    });
  });
});