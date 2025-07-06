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
    // All queries must filter by workspaceId as per CRITICAL rules
    const [
      orders,
      customers,
      messages,
      orderItems,
      chatSessions,
      usageRecords
    ] = await Promise.all([
      this.getOrdersInDateRange(workspaceId, startDate, endDate),
      this.getCustomersInDateRange(workspaceId, startDate, endDate),
      this.getMessagesInDateRange(workspaceId, startDate, endDate),
      this.getOrderItemsInDateRange(workspaceId, startDate, endDate),
      this.getChatSessionsInDateRange(workspaceId, startDate, endDate),
      this.getUsageInDateRange(workspaceId, startDate, endDate)
    ]);

    // Calculate overview metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const totalMessages = messages.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const usageCost = usageRecords.reduce((sum, record) => sum + (record.price || 0), 0); // Andrea's €0.005 per LLM tracking

    // Generate monthly trends
    const orderTrends = this.generateMonthlyTrends(orders, startDate, endDate, 'count');
    const revenueTrends = this.generateMonthlyTrends(orders, startDate, endDate, 'revenue');
    const customerTrends = this.generateMonthlyTrends(customers, startDate, endDate, 'count');
    const messageTrends = this.generateMonthlyTrends(messages, startDate, endDate, 'count');

    // Get top products
    const topProducts = await this.getTopProducts(workspaceId, startDate, endDate);

    // Calculate customer engagement
    const newCustomersCount = customers.filter(c => 
      c.createdAt >= startDate && c.createdAt <= endDate
    ).length;
    
    const returningCustomersCount = totalCustomers - newCustomersCount;

    // Calculate average session duration (in minutes)
    const avgSessionDuration = this.calculateAverageSessionDuration(chatSessions);

    // Calculate message response rate (percentage of messages that are AI generated)
    const aiMessages = messages.filter(m => m.aiGenerated).length;
    const messageResponseRate = totalMessages > 0 ? (aiMessages / totalMessages) * 100 : 0;

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
        orders: orderTrends,
        revenue: revenueTrends,
        customers: customerTrends,
        messages: messageTrends
      },
      topProducts,
      customerEngagement: {
        newCustomers: newCustomersCount,
        returningCustomers: returningCustomersCount,
        averageSessionDuration: avgSessionDuration,
        messageResponseRate: Math.round(messageResponseRate * 100) / 100
      }
    };
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
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
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

  private async getOrderItemsInDateRange(workspaceId: string, startDate: Date, endDate: Date) {
    return await this.prisma.orderItems.findMany({
      where: {
        order: {
          workspaceId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      include: {
        product: true,
        order: true
      }
    });
  }

  private async getChatSessionsInDateRange(workspaceId: string, startDate: Date, endDate: Date) {
    return await this.prisma.chatSession.findMany({
      where: {
        workspaceId,
        startedAt: {
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

  private generateMonthlyTrends(
    data: any[], 
    startDate: Date, 
    endDate: Date, 
    type: 'count' | 'revenue'
  ): MonthlyData[] {
    const monthlyData: { [key: string]: MonthlyData } = {};

    // Initialize all months in the range
    const current = new Date(startDate);
    while (current <= endDate) {
      const monthKey = `${current.getFullYear()}-${current.getMonth()}`;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      monthlyData[monthKey] = {
        month: monthNames[current.getMonth()],
        year: current.getFullYear(),
        value: 0,
        label: `${monthNames[current.getMonth()]} ${current.getFullYear()}`
      };

      current.setMonth(current.getMonth() + 1);
    }

    // Aggregate data by month
    data.forEach(item => {
      const date = new Date(item.createdAt || item.startedAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (monthlyData[monthKey]) {
        if (type === 'revenue') {
          monthlyData[monthKey].value += item.total || 0;
        } else {
          monthlyData[monthKey].value += 1;
        }
      }
    });

    return Object.values(monthlyData as { [key: string]: MonthlyData }).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(a.month) -
             ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(b.month);
    });
  }

  private async getTopProducts(workspaceId: string, startDate: Date, endDate: Date): Promise<ProductAnalytics[]> {
    const productSales = await this.prisma.orderItems.groupBy({
      by: ['productId'],
      where: {
        order: {
          workspaceId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      _sum: {
        quantity: true,
        price: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    });

    const productDetails = await this.prisma.products.findMany({
      where: {
        id: {
          in: productSales.map(ps => ps.productId)
        },
        workspaceId
      }
    });

    return productSales.map(ps => {
      const product = productDetails.find(p => p.id === ps.productId);
      return {
        id: ps.productId,
        name: product?.name || 'Unknown Product',
        totalSold: ps._sum.quantity || 0,
        revenue: ps._sum.price || 0,
        stock: product?.stock || 0
      };
    });
  }

  private calculateAverageSessionDuration(chatSessions: any[]): number {
    if (chatSessions.length === 0) return 0;

    const totalDuration = chatSessions.reduce((sum, session) => {
      if (session.endedAt && session.startedAt) {
        const duration = new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime();
        return sum + duration;
      }
      return sum;
    }, 0);

    // Return duration in minutes
    return totalDuration > 0 ? Math.round(totalDuration / (1000 * 60) / chatSessions.length) : 0;
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
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
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
      include: {
        orders: true,
        chatSessions: {
          include: {
            messages: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  private async getDetailedProductMetrics(workspaceId: string, startDate: Date, endDate: Date) {
    const products = await this.prisma.products.findMany({
      where: {
        workspaceId
      },
      include: {
        orderItems: {
          where: {
            order: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        }
      }
    });

    return products.map(product => ({
      ...product,
      totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      totalRevenue: product.orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    }));
  }
}