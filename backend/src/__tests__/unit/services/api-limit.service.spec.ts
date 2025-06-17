// @ts-nocheck
import "@jest/globals";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ApiLimitService } from '../../../application/services/api-limit.service';

// Mock PrismaClient
const mockPrismaClient = {
  workspace: {
    findUnique: jest.fn()
  },
  message: {
    count: jest.fn(),
    updateMany: jest.fn()
  }
};

// Mock logger
jest.mock('../../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('ApiLimitService', () => {
  let apiLimitService: ApiLimitService;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create service with mocked Prisma
    apiLimitService = new ApiLimitService(mockPrismaClient as any);
    
    // Reset environment variables
    delete process.env.API_LIMIT_PER_HOUR;
  });

  describe('checkApiLimit', () => {
    const workspaceId = 'test-workspace-123';
    const now = new Date('2024-01-15T10:30:00Z');

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(now);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return not exceeded when usage is below limit', async () => {
      // Mock workspace with FREE plan
      mockPrismaClient.workspace.findUnique.mockResolvedValue({
        id: workspaceId,
        plan: 'FREE'
      });

      // Mock 50 API calls in the last hour (below FREE limit of 100)
      mockPrismaClient.message.count.mockResolvedValue(50);

      const result = await apiLimitService.checkApiLimit(workspaceId);

      expect(result.exceeded).toBe(false);
      expect(result.remaining).toBe(50);
      expect(result.currentUsage).toBe(50);
      expect(result.limit).toBe(100);
    });

    it('should return exceeded when usage reaches limit', async () => {
      // Mock workspace with FREE plan
      mockPrismaClient.workspace.findUnique.mockResolvedValue({
        id: workspaceId,
        plan: 'FREE'
      });

      // Mock 100 API calls (at FREE limit)
      mockPrismaClient.message.count.mockResolvedValue(100);

      const result = await apiLimitService.checkApiLimit(workspaceId);

      expect(result.exceeded).toBe(true);
      expect(result.remaining).toBe(0);
      expect(result.currentUsage).toBe(100);
      expect(result.limit).toBe(100);
    });

    it('should use correct limits for different plans', async () => {
      const testCases = [
        { plan: 'FREE', expectedLimit: 100 },
        { plan: 'BASIC', expectedLimit: 500 },
        { plan: 'PROFESSIONAL', expectedLimit: 2000 }
      ];

      for (const testCase of testCases) {
        mockPrismaClient.workspace.findUnique.mockResolvedValue({
          id: workspaceId,
          plan: testCase.plan
        });

        mockPrismaClient.message.count.mockResolvedValue(0);

        const result = await apiLimitService.checkApiLimit(workspaceId);

        expect(result.limit).toBe(testCase.expectedLimit);
      }
    });

    it('should use environment variable limit when set', async () => {
      process.env.API_LIMIT_PER_HOUR = '2500';
      
      // Recreate service to pick up new env var
      apiLimitService = new ApiLimitService(mockPrismaClient as any);

      mockPrismaClient.workspace.findUnique.mockResolvedValue({
        id: workspaceId,
        plan: 'UNKNOWN_PLAN'
      });

      mockPrismaClient.message.count.mockResolvedValue(0);

      const result = await apiLimitService.checkApiLimit(workspaceId);

      expect(result.limit).toBe(2500);
      
      // Reset env var
      delete process.env.API_LIMIT_PER_HOUR;
    });

    it('should handle workspace not found gracefully', async () => {
      // Reset any env vars to ensure default behavior
      delete process.env.API_LIMIT_PER_HOUR;
      apiLimitService = new ApiLimitService(mockPrismaClient as any);
      
      mockPrismaClient.workspace.findUnique.mockResolvedValue(null);
      mockPrismaClient.message.count.mockResolvedValue(0);

      const result = await apiLimitService.checkApiLimit(workspaceId);

      expect(result.exceeded).toBe(false);
      expect(result.limit).toBe(1000); // Default limit
    });

    it('should handle database errors gracefully (fail-open)', async () => {
      mockPrismaClient.workspace.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await apiLimitService.checkApiLimit(workspaceId);

      expect(result.exceeded).toBe(false);
      expect(result.remaining).toBe(1000);
      expect(result.currentUsage).toBe(0);
      expect(result.limit).toBe(1000);
    });

    it('should calculate correct time window for API calls', async () => {
      mockPrismaClient.workspace.findUnique.mockResolvedValue({
        id: workspaceId,
        plan: 'FREE'
      });

      mockPrismaClient.message.count.mockResolvedValue(25);

      await apiLimitService.checkApiLimit(workspaceId);

      // Verify the time window is correct (last hour)
      const expectedWindowStart = new Date('2024-01-15T09:30:00Z');
      const expectedWindowEnd = new Date('2024-01-15T10:30:00Z');

      expect(mockPrismaClient.message.count).toHaveBeenCalledWith({
        where: {
          chatSession: {
            workspaceId: workspaceId
          },
          direction: 'OUTBOUND',
          createdAt: {
            gte: expectedWindowStart,
            lte: expectedWindowEnd
          }
        }
      });
    });
  });

  describe('incrementApiUsage', () => {
    const workspaceId = 'test-workspace-123';

    it('should increment API usage successfully', async () => {
      mockPrismaClient.message.updateMany.mockResolvedValue({ count: 1 });

      await apiLimitService.incrementApiUsage(workspaceId, 'whatsapp_message');

      expect(mockPrismaClient.message.updateMany).toHaveBeenCalledWith({
        where: {
          chatSession: {
            workspaceId: workspaceId
          },
          createdAt: {
            gte: expect.any(Date)
          }
        },
        data: {
          metadata: {
            apiCallTracked: true,
            endpoint: 'whatsapp_message',
            timestamp: expect.any(String)
          }
        }
      });
    });

    it('should handle errors gracefully without throwing', async () => {
      mockPrismaClient.message.updateMany.mockRejectedValue(new Error('Database error'));

      // Should not throw
      await expect(apiLimitService.incrementApiUsage(workspaceId)).resolves.toBeUndefined();
    });
  });

  describe('getUsageStats', () => {
    const workspaceId = 'test-workspace-123';

    it('should return usage statistics', async () => {
      mockPrismaClient.workspace.findUnique.mockResolvedValue({
        id: workspaceId,
        plan: 'BASIC'
      });

      // Mock total calls (24 hours)
      mockPrismaClient.message.count
        .mockResolvedValueOnce(150) // Total calls
        .mockResolvedValueOnce(25); // Current hour calls

      const stats = await apiLimitService.getUsageStats(workspaceId, 24);

      expect(stats.totalCalls).toBe(150);
      expect(stats.currentHourUsage).toBe(25);
      expect(stats.limit).toBe(500); // BASIC plan limit
      expect(stats.hourlyBreakdown).toEqual([]);
    });

    // Note: getUsageStats has internal error handling that prevents errors from propagating
    // This is by design for graceful degradation
  });
}); 