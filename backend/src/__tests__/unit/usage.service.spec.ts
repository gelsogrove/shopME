// Mock PrismaClient constructor
const mockPrisma = {
  customers: {
    findUnique: jest.fn(),
  },
  usage: {
    create: jest.fn(),
    findMany: jest.fn(),
    aggregate: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

import { usageService } from '../../services/usage.service';

describe('UsageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackUsage', () => {
    const validUsageData = {
      workspaceId: 'workspace-123',
      clientId: 'customer-456',
      price: 0.50,
    };

    const mockCustomer = {
      id: 'customer-456',
      name: 'Mario Rossi',
      phone: '+39123456789',
      workspaceId: 'workspace-123',
    };

    it('should track usage for valid registered customer', async () => {
      // Arrange
      (mockPrisma.customers.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (mockPrisma.usage.create as jest.Mock).mockResolvedValue({
        id: 'usage-123',
        ...validUsageData,
        createdAt: new Date(),
      });

      // Act
      await usageService.trackUsage(validUsageData);

      // Assert
      expect(mockPrisma.customers.findUnique).toHaveBeenCalledWith({
        where: { id: 'customer-456' },
        select: {
          id: true,
          name: true,
          phone: true,
          workspaceId: true,
        },
      });

      expect(mockPrisma.usage.create).toHaveBeenCalledWith({
        data: {
          workspaceId: 'workspace-123',
          clientId: 'customer-456',
          price: 0.50,
        },
      });
    });

    it('should not track usage for non-existent customer', async () => {
      // Arrange
      (mockPrisma.customers.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      await usageService.trackUsage(validUsageData);

      // Assert
      expect(mockPrisma.customers.findUnique).toHaveBeenCalledWith({
        where: { id: 'customer-456' },
        select: {
          id: true,
          name: true,
          phone: true,
          workspaceId: true,
        },
      });

      expect(mockPrisma.usage.create).not.toHaveBeenCalled();
    });

    it('should not track usage for customer from different workspace', async () => {
      // Arrange
      const customerFromDifferentWorkspace = {
        ...mockCustomer,
        workspaceId: 'different-workspace-789',
      };
      (mockPrisma.customers.findUnique as jest.Mock).mockResolvedValue(customerFromDifferentWorkspace);

      // Act
      await usageService.trackUsage(validUsageData);

      // Assert
      expect(mockPrisma.customers.findUnique).toHaveBeenCalled();
      expect(mockPrisma.usage.create).not.toHaveBeenCalled();
    });

    // Note: Default price test removed - price is now configurable via DEFAULT_LLM_PRICE env var
    // Current default is €0.50 per LLM response

    it('should handle errors gracefully without throwing', async () => {
      // Arrange
      (mockPrisma.customers.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act & Assert - should not throw
      await expect(usageService.trackUsage(validUsageData)).resolves.toBeUndefined();
      expect(mockPrisma.usage.create).not.toHaveBeenCalled();
    });
  });

  describe('getUsageStats', () => {
    const mockQuery = {
      workspaceId: 'workspace-123',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    };

    const mockUsageRecords = [
      {
        id: 'usage-1',
        workspaceId: 'workspace-123',
        clientId: 'customer-456',
        price: 2.50,
        createdAt: new Date('2024-01-15T10:30:00Z'),
        customer: {
          name: 'Mario Rossi',
          phone: '+39123456789',
        },
      },
      {
        id: 'usage-2',
        workspaceId: 'workspace-123',
        clientId: 'customer-456',
        price: 2.50,
        createdAt: new Date('2024-01-15T14:45:00Z'),
        customer: {
          name: 'Mario Rossi',
          phone: '+39123456789',
        },
      },
    ];

    it('should return usage statistics for given period', async () => {
      // Arrange
      (mockPrisma.usage.findMany as jest.Mock).mockResolvedValue(mockUsageRecords);
      (mockPrisma.usage.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { price: 5.00 } }) // Current month  
        .mockResolvedValueOnce({ _sum: { price: 2.50 } }); // Previous month

      // Act
      const result = await usageService.getUsageStats(mockQuery);

      // Assert
      expect(result).toEqual({
        totalCost: 5.00,
        totalMessages: 2,
        dailyUsage: expect.any(Array),
        topClients: expect.any(Array),
        peakHours: expect.any(Array),
        monthlyComparison: {
          currentMonth: 5.00,
          previousMonth: 2.50,
          growth: 100, // 100% growth
        },
      });
    });

    it('should handle empty usage records', async () => {
      // Arrange
      (mockPrisma.usage.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.usage.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { price: null } })
        .mockResolvedValueOnce({ _sum: { price: null } });

      // Act
      const result = await usageService.getUsageStats(mockQuery);

      // Assert
      expect(result.totalCost).toBe(0);
      expect(result.totalMessages).toBe(0);
      expect(result.monthlyComparison.growth).toBe(0);
    });

    it('should use default date range when not provided', async () => {
      // Arrange
      (mockPrisma.usage.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.usage.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { price: null } })
        .mockResolvedValueOnce({ _sum: { price: null } });

      const queryWithoutDates = {
        workspaceId: 'workspace-123',
      };

      // Act
      await usageService.getUsageStats(queryWithoutDates);

      // Assert
      expect(mockPrisma.usage.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId: 'workspace-123',
          createdAt: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        include: {
          customer: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('getUsageSummary', () => {
    it('should return usage summary for specified period', async () => {
      // Arrange
      const mockAggregateResult = {
        _sum: { price: 2.50 },
        _count: 5,
      };
      (mockPrisma.usage.aggregate as jest.Mock).mockResolvedValue(mockAggregateResult);

      // Act
      const result = await usageService.getUsageSummary('workspace-123', 30);

      // Assert
      expect(result).toEqual({
        totalCost: 2.50,
        totalMessages: 5,
        averageDailyCost: 2.50 / 30,
        averageDailyMessages: 5 / 30,
      });
    });

    it('should handle null values from aggregate', async () => {
      // Arrange
      const mockAggregateResult = {
        _sum: { price: null },
        _count: 0,
      };
      (mockPrisma.usage.aggregate as jest.Mock).mockResolvedValue(mockAggregateResult);

      // Act
      const result = await usageService.getUsageSummary('workspace-123', 30);

      // Assert
      expect(result).toEqual({
        totalCost: 0,
        totalMessages: 0,
        averageDailyCost: 0,
        averageDailyMessages: 0,
      });
    });

    it('should use default period of 30 days', async () => {
      // Arrange
      (mockPrisma.usage.aggregate as jest.Mock).mockResolvedValue({
        _sum: { price: 0 },
        _count: 0,
      });

      // Act
      await usageService.getUsageSummary('workspace-123');

      // Assert
      expect(mockPrisma.usage.aggregate).toHaveBeenCalledWith({
        where: {
          workspaceId: 'workspace-123',
          createdAt: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        _sum: { price: true },
        _count: true,
      });
    });
  });
});