import { PrismaClient } from "@prisma/client"
import { DeepMockProxy, mockDeep } from "jest-mock-extended"
import { AnalyticsService } from "../../../application/services/analytics.service"

// Mock Prisma
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(),
}))

describe("AnalyticsService - LLM Usage Cost Tests", () => {
  let analyticsService: AnalyticsService
  let mockPrisma: DeepMockProxy<PrismaClient>

  beforeEach(() => {
    mockPrisma = mockDeep<PrismaClient>()
    ;(PrismaClient as jest.Mock).mockImplementation(() => mockPrisma)
    analyticsService = new AnalyticsService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("getDashboardAnalytics", () => {
    it("should calculate usage cost correctly from usage records", async () => {
      const workspaceId = "test-workspace"
      const startDate = new Date("2024-01-01")
      const endDate = new Date("2024-12-31")

      // Mock usage records with €0.005 per message
      const mockUsageRecords = [
        { price: 0.005, workspaceId: "test-workspace" },
        { price: 0.005, workspaceId: "test-workspace" },
        { price: 0.005, workspaceId: "test-workspace" },
      ]

      // Mock other data
      const mockOrders = []
      const mockCustomers = []
      const mockMessages = []

      // Mock Prisma queries for all methods
      mockPrisma.usage.findMany.mockResolvedValue(mockUsageRecords)
      mockPrisma.orders.findMany.mockResolvedValue(mockOrders)
      mockPrisma.customers.findMany.mockResolvedValue(mockCustomers)
      mockPrisma.message.findMany.mockResolvedValue(mockMessages)
      
      // Mock all $queryRaw calls for trends
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([]) // orderTrends
        .mockResolvedValueOnce([]) // revenueTrends
        .mockResolvedValueOnce([]) // customerTrends
        .mockResolvedValueOnce([]) // messageTrends
        .mockResolvedValueOnce([]) // usageCostTrends
        .mockResolvedValueOnce([]) // topProducts
        .mockResolvedValueOnce([]) // topCustomers

      const result = await analyticsService.getDashboardAnalytics(
        workspaceId,
        startDate,
        endDate
      )

      // Verify usage cost calculation
      expect(result.overview.usageCost).toBe(0.015) // 3 * €0.005
      expect(mockPrisma.usage.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      })
    })

    it("should return 0 usage cost when no usage records exist", async () => {
      const workspaceId = "test-workspace"
      const startDate = new Date("2024-01-01")
      const endDate = new Date("2024-12-31")

      // Mock empty usage records
      const mockUsageRecords = []

      // Mock other data
      const mockOrders = []
      const mockCustomers = []
      const mockMessages = []

      // Mock Prisma queries for all methods
      mockPrisma.usage.findMany.mockResolvedValue(mockUsageRecords)
      mockPrisma.orders.findMany.mockResolvedValue(mockOrders)
      mockPrisma.customers.findMany.mockResolvedValue(mockCustomers)
      mockPrisma.message.findMany.mockResolvedValue(mockMessages)
      
      // Mock all $queryRaw calls for trends
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([]) // orderTrends
        .mockResolvedValueOnce([]) // revenueTrends
        .mockResolvedValueOnce([]) // customerTrends
        .mockResolvedValueOnce([]) // messageTrends
        .mockResolvedValueOnce([]) // usageCostTrends
        .mockResolvedValueOnce([]) // topProducts
        .mockResolvedValueOnce([]) // topCustomers

      const result = await analyticsService.getDashboardAnalytics(
        workspaceId,
        startDate,
        endDate
      )

      // Verify usage cost is 0 when no records
      expect(result.overview.usageCost).toBe(0)
    })

    it("should handle usage records with null prices", async () => {
      const workspaceId = "test-workspace"
      const startDate = new Date("2024-01-01")
      const endDate = new Date("2024-12-31")

      // Mock usage records with some null prices
      const mockUsageRecords = [
        { price: 0.005, workspaceId: "test-workspace" },
        { price: null, workspaceId: "test-workspace" },
        { price: 0.005, workspaceId: "test-workspace" },
      ]

      // Mock other data
      const mockOrders = []
      const mockCustomers = []
      const mockMessages = []

      // Mock Prisma queries for all methods
      mockPrisma.usage.findMany.mockResolvedValue(mockUsageRecords)
      mockPrisma.orders.findMany.mockResolvedValue(mockOrders)
      mockPrisma.customers.findMany.mockResolvedValue(mockCustomers)
      mockPrisma.message.findMany.mockResolvedValue(mockMessages)
      
      // Mock all $queryRaw calls for trends
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([]) // orderTrends
        .mockResolvedValueOnce([]) // revenueTrends
        .mockResolvedValueOnce([]) // customerTrends
        .mockResolvedValueOnce([]) // messageTrends
        .mockResolvedValueOnce([]) // usageCostTrends
        .mockResolvedValueOnce([]) // topProducts
        .mockResolvedValueOnce([]) // topCustomers

      const result = await analyticsService.getDashboardAnalytics(
        workspaceId,
        startDate,
        endDate
      )

      // Verify usage cost calculation handles null prices
      expect(result.overview.usageCost).toBe(0.01) // 2 * €0.005 (null price ignored)
    })
  })
})
