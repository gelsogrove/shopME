import { PrismaClient } from '@prisma/client';

export interface DashboardAnalytics {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalMessages: number;
    averageOrderValue: number;
    usageCost: number; // Andrea's €0.005 per LLM message tracking
  };
  trends: {
    orders: MonthlyData[];
    revenue: MonthlyData[];
    customers: MonthlyData[];
    messages: MonthlyData[];
  };
  topProducts: ProductAnalytics[];
  customerEngagement: {
    newCustomers: number;
    returningCustomers: number;
    averageSessionDuration: number;
    messageResponseRate: number;
  };
}

export interface MonthlyData {
  month: string;
  year: number;
  value: number;
  label: string; // e.g., "Jan 2024"
}

export interface ProductAnalytics {
  id: string;
  name: string;
  totalSold: number;
  revenue: number;
  stock: number;
}

export class AnalyticsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getDashboardAnalytics(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DashboardAnalytics> {
    try {
      // Get basic counts - simplified to avoid Prisma type issues
      const [orders, customers, messages, usageRecords] = await Promise.all([
        this.getOrdersInDateRange(workspaceId, startDate, endDate),
        this.getCustomersInDateRange(workspaceId, startDate, endDate),
        this.getMessagesInDateRange(workspaceId, startDate, endDate),
        this.getUsageInDateRange(workspaceId, startDate, endDate)
      ]);

      // Calculate overview metrics - simplified
      const totalOrders = orders.length;
      const totalCustomers = customers.length;
      const totalMessages = messages.length;
      const totalRevenue = 0; // TODO: Fix when Prisma types are resolved
      const averageOrderValue = 0; // TODO: Fix when Prisma types are resolved
      const usageCost = usageRecords.reduce((sum, record) => sum + (record.price || 0), 0);

      // Generate empty trends for now - avoid complex calculations
      const emptyTrends: MonthlyData[] = [];

      return {
        overview: {
          totalOrders,
          totalRevenue,
          totalCustomers,
          totalMessages,
          averageOrderValue,
          usageCost
        },
        trends: {
          orders: emptyTrends,
          revenue: emptyTrends,
          customers: emptyTrends,
          messages: emptyTrends
        },
        topProducts: [], // Simplified for now
        customerEngagement: {
          newCustomers: totalCustomers,
          returningCustomers: 0,
          averageSessionDuration: 0,
          messageResponseRate: 0
        }
      };
    } catch (error) {
      console.error('Analytics error:', error);
      throw error;
    }
  }

  async getDetailedMetrics(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
    metric: string
  ): Promise<any> {
    switch (metric) {
      case 'orders':
        return await this.getDetailedOrderMetrics(workspaceId, startDate, endDate);
      case 'customers':
        return await this.getDetailedCustomerMetrics(workspaceId, startDate, endDate);
      case 'products':
        return await this.getDetailedProductMetrics(workspaceId, startDate, endDate);
      default:
        throw new Error(`Unknown metric: ${metric}`);
    }
  }

  private async getOrdersInDateRange(workspaceId: string, startDate: Date, endDate: Date) {
    return await this.prisma.orders.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  private async getCustomersInDateRange(workspaceId: string, startDate: Date, endDate: Date) {
    return await this.prisma.customers.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  private async getMessagesInDateRange(workspaceId: string, startDate: Date, endDate: Date) {
    return await this.prisma.message.findMany({
      where: {
        chatSession: {
          workspaceId
        },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  private async getUsageInDateRange(workspaceId: string, startDate: Date, endDate: Date) {
    return await this.prisma.usage.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  private async getDetailedOrderMetrics(workspaceId: string, startDate: Date, endDate: Date) {
    return await this.prisma.orders.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  private async getDetailedCustomerMetrics(workspaceId: string, startDate: Date, endDate: Date) {
    return await this.prisma.customers.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  private async getDetailedProductMetrics(workspaceId: string, startDate: Date, endDate: Date) {
    return await this.prisma.products.findMany({
      where: {
        workspaceId
      }
    });
  }
}