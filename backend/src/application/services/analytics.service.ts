import logger from "../utils/logger"
import { PrismaClient } from "@prisma/client"

export interface DashboardAnalytics {
  overview: {
    totalOrders: number
    totalRevenue: number
    totalCustomers: number
    totalMessages: number
    averageOrderValue: number
    usageCost: number // Andrea's €0.005 per LLM message tracking
  }
  trends: {
    orders: MonthlyData[]
    revenue: MonthlyData[]
    customers: MonthlyData[]
    messages: MonthlyData[]
    usageCost: MonthlyData[] // Add LLM usage cost trends
  }
  topProducts: ProductAnalytics[]
  topCustomers: CustomerAnalytics[]
}

export interface MonthlyData {
  month: string
  year: number
  value: number
  label: string // e.g., "Jan 2024"
}

export interface ProductAnalytics {
  id: string
  name: string
  totalSold: number
  revenue: number
  stock: number
}

export interface CustomerAnalytics {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  totalOrders: number
  totalSpent: number
  lastOrderDate?: string
  averageOrderValue: number
}

export class AnalyticsService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async getDashboardAnalytics(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DashboardAnalytics> {
    try {
      // Get basic data
      const [orders, customers, messages, usageRecords] = await Promise.all([
        this.getOrdersInDateRange(workspaceId, startDate, endDate),
        this.getCustomersInDateRange(workspaceId, startDate, endDate),
        this.getMessagesInDateRange(workspaceId, startDate, endDate),
        this.getUsageInDateRange(workspaceId, startDate, endDate),
      ])

      // Calculate overview metrics
      const totalOrders = orders.length
      const totalCustomers = customers.length
      const totalMessages = messages.length
      const totalRevenue = orders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      )
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
      const usageCost = usageRecords.reduce(
        (sum, record) => sum + (record.price || 0),
        0
      )

      // Generate historical trends - REAL DATA
      const [
        orderTrends,
        revenueTrends,
        customerTrends,
        messageTrends,
        usageCostTrends,
      ] = await Promise.all([
        this.generateOrderTrends(workspaceId, startDate, endDate),
        this.generateRevenueTrends(workspaceId, startDate, endDate),
        this.generateCustomerTrends(workspaceId, startDate, endDate),
        this.generateMessageTrends(workspaceId, startDate, endDate),
        this.generateUsageCostTrends(workspaceId, startDate, endDate),
      ])

      // Get top products and top customers
      const [topProducts, topCustomers] = await Promise.all([
        this.getTopProducts(workspaceId, startDate, endDate),
        this.getTopCustomers(workspaceId, startDate, endDate),
      ])

      return {
        overview: {
          totalOrders,
          totalRevenue,
          totalCustomers,
          totalMessages,
          averageOrderValue,
          usageCost,
        },
        trends: {
          orders: orderTrends,
          revenue: revenueTrends,
          customers: customerTrends,
          messages: messageTrends,
          usageCost: usageCostTrends,
        },
        topProducts,
        topCustomers,
      }
    } catch (error) {
      logger.error("Analytics error:", error)
      throw error
    }
  }

  // Generate monthly trends for orders
  private async generateOrderTrends(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MonthlyData[]> {
    const monthlyData = (await this.prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM "createdAt") as year,
        EXTRACT(MONTH FROM "createdAt") as month,
        COUNT(*) as count
      FROM "orders" 
      WHERE "workspaceId" = ${workspaceId}
        AND "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
      GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt")
      ORDER BY year, month
    `) as { year: number; month: number; count: bigint }[]

    return this.formatMonthlyData(monthlyData)
  }

  // Generate monthly trends for revenue
  private async generateRevenueTrends(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MonthlyData[]> {
    const monthlyData = (await this.prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM "createdAt") as year,
        EXTRACT(MONTH FROM "createdAt") as month,
        COALESCE(SUM("totalAmount"), 0) as total
      FROM "orders" 
      WHERE "workspaceId" = ${workspaceId}
        AND "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
      GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt")
      ORDER BY year, month
    `) as { year: number; month: number; total: number }[]

    return monthlyData.map((item) => ({
      month: this.getMonthName(item.month),
      year: item.year,
      value: Number(item.total) || 0,
      label: `${this.getMonthName(item.month)} ${item.year}`,
    }))
  }

  // Generate monthly trends for customers
  private async generateCustomerTrends(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MonthlyData[]> {
    const monthlyData = (await this.prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM "createdAt") as year,
        EXTRACT(MONTH FROM "createdAt") as month,
        COUNT(*) as count
      FROM "customers" 
      WHERE "workspaceId" = ${workspaceId}
        AND "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
      GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt")
      ORDER BY year, month
    `) as { year: number; month: number; count: bigint }[]

    return this.formatMonthlyData(monthlyData)
  }

  // Generate monthly trends for messages
  private async generateMessageTrends(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MonthlyData[]> {
    const monthlyData = (await this.prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM m."createdAt") as year,
        EXTRACT(MONTH FROM m."createdAt") as month,
        COUNT(*) as count
      FROM "messages" m
      JOIN "chat_sessions" cs ON m."chatSessionId" = cs.id
      WHERE cs."workspaceId" = ${workspaceId}
        AND m."createdAt" >= ${startDate}
        AND m."createdAt" <= ${endDate}
      GROUP BY EXTRACT(YEAR FROM m."createdAt"), EXTRACT(MONTH FROM m."createdAt")
      ORDER BY year, month
    `) as { year: number; month: number; count: bigint }[]

    return this.formatMonthlyData(monthlyData)
  }

  // Generate monthly trends for usage cost
  private async generateUsageCostTrends(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MonthlyData[]> {
    const monthlyData = (await this.prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM u."createdAt") as year,
        EXTRACT(MONTH FROM u."createdAt") as month,
        COALESCE(SUM(u.price), 0) as total_cost
      FROM "usage" u
      WHERE u."workspaceId" = ${workspaceId}
        AND u."createdAt" >= ${startDate}
        AND u."createdAt" <= ${endDate}
      GROUP BY EXTRACT(YEAR FROM u."createdAt"), EXTRACT(MONTH FROM u."createdAt")
      ORDER BY year, month
    `) as { year: number; month: number; total_cost: number }[]

    return monthlyData.map((item) => ({
      month: this.getMonthName(item.month),
      year: item.year,
      value: Number(item.total_cost) || 0,
      label: `${this.getMonthName(item.month)} ${item.year}`,
    }))
  }

  // Get top selling products
  private async getTopProducts(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProductAnalytics[]> {
    try {
      const topProducts = (await this.prisma.$queryRaw`
        SELECT 
          p.id,
          p.name,
          COUNT(oi.*) as total_sold,
          COALESCE(SUM(oi."unitPrice" * oi.quantity), 0) as revenue,
          p.stock
        FROM "products" p
        LEFT JOIN "order_items" oi ON p.id = oi."productId"
        LEFT JOIN "orders" o ON oi."orderId" = o.id
        WHERE p."workspaceId" = ${workspaceId}
          AND (o."createdAt" IS NULL OR (o."createdAt" >= ${startDate} AND o."createdAt" <= ${endDate}))
        GROUP BY p.id, p.name, p.stock
        ORDER BY total_sold DESC, revenue DESC
        LIMIT 10
      `) as {
        id: string
        name: string
        total_sold: bigint
        revenue: number
        stock: number
      }[]

      return topProducts.map((product) => ({
        id: product.id,
        name: product.name,
        totalSold: Number(product.total_sold) || 0,
        revenue: Number(product.revenue) || 0,
        stock: product.stock || 0,
      }))
    } catch (error) {
      logger.error("Error getting top products:", error)
      return []
    }
  }

  // Get top customers by total spending
  private async getTopCustomers(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CustomerAnalytics[]> {
    try {
      const topCustomers = (await this.prisma.$queryRaw`
        SELECT 
          c.id,
          c.name,
          c.email,
          c.phone,
          c.company,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(o."totalAmount"), 0) as total_spent,
          MAX(o."createdAt") as last_order_date,
          CASE 
            WHEN COUNT(o.id) > 0 THEN COALESCE(SUM(o."totalAmount"), 0) / COUNT(o.id) 
            ELSE 0 
          END as average_order_value
        FROM "customers" c
        LEFT JOIN "orders" o ON c.id = o."customerId" 
          AND o."createdAt" >= ${startDate} 
          AND o."createdAt" <= ${endDate}
        WHERE c."workspaceId" = ${workspaceId}
          AND c."isActive" = true
        GROUP BY c.id, c.name, c.email, c.phone, c.company
        ORDER BY total_spent DESC, total_orders DESC
        LIMIT 10
      `) as {
        id: string
        name: string
        email: string
        phone: string | null
        company: string | null
        total_orders: bigint
        total_spent: number
        last_order_date: Date | null
        average_order_value: number
      }[]

      return topCustomers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || undefined,
        company: customer.company || undefined,
        totalOrders: Number(customer.total_orders) || 0,
        totalSpent: Number(customer.total_spent) || 0,
        lastOrderDate: customer.last_order_date
          ? customer.last_order_date.toISOString()
          : undefined,
        averageOrderValue: Number(customer.average_order_value) || 0,
      }))
    } catch (error) {
      logger.error("Error getting top customers:", error)
      return []
    }
  }

  // Helper method to format monthly data
  private formatMonthlyData(
    data: { year: number; month: number; count: bigint }[]
  ): MonthlyData[] {
    return data.map((item) => ({
      month: this.getMonthName(item.month),
      year: item.year,
      value: Number(item.count) || 0,
      label: `${this.getMonthName(item.month)} ${item.year}`,
    }))
  }

  // Helper method to get month name in English
  private getMonthName(monthNumber: number): string {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]
    return months[monthNumber - 1] || "Unknown"
  }

  async getDetailedMetrics(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
    metric: string
  ): Promise<any> {
    switch (metric) {
      case "orders":
        return await this.getDetailedOrderMetrics(
          workspaceId,
          startDate,
          endDate
        )
      case "customers":
        return await this.getDetailedCustomerMetrics(
          workspaceId,
          startDate,
          endDate
        )
      case "products":
        return await this.getDetailedProductMetrics(
          workspaceId,
          startDate,
          endDate
        )
      default:
        throw new Error(`Unknown metric: ${metric}`)
    }
  }

  private async getOrdersInDateRange(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await this.prisma.orders.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })
  }

  private async getCustomersInDateRange(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await this.prisma.customers.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })
  }

  private async getMessagesInDateRange(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await this.prisma.message.findMany({
      where: {
        chatSession: {
          workspaceId,
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })
  }

  private async getUsageInDateRange(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await this.prisma.usage.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })
  }

  private async getDetailedOrderMetrics(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await this.prisma.orders.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  private async getDetailedCustomerMetrics(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await this.prisma.customers.findMany({
      where: {
        workspaceId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  private async getDetailedProductMetrics(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await this.prisma.products.findMany({
      where: {
        workspaceId,
      },
    })
  }

  // Get monthly top customers breakdown
  async getMonthlyTopCustomers(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ) {
    try {
      // Generate array of months between startDate and endDate
      const months = this.generateMonthsArray(startDate, endDate)
      const monthlyData = []

      for (const monthInfo of months) {
        const monthStart = new Date(monthInfo.year, monthInfo.month - 1, 1)
        const monthEnd = new Date(
          monthInfo.year,
          monthInfo.month,
          0,
          23,
          59,
          59,
          999
        )

        const topCustomers = await this.getTopCustomers(
          workspaceId,
          monthStart,
          monthEnd
        )

        monthlyData.push({
          month: monthInfo.month.toString().padStart(2, "0"),
          year: monthInfo.year,
          customers: topCustomers,
        })
      }

      return monthlyData
    } catch (error) {
      logger.error("Error getting monthly top customers:", error)
      throw error
    }
  }

  // Get monthly top clients breakdown (clients = customers with company field)
  async getMonthlyTopClients(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ) {
    try {
      // Generate array of months between startDate and endDate
      const months = this.generateMonthsArray(startDate, endDate)
      const monthlyData = []

      for (const monthInfo of months) {
        const monthStart = new Date(monthInfo.year, monthInfo.month - 1, 1)
        const monthEnd = new Date(
          monthInfo.year,
          monthInfo.month,
          0,
          23,
          59,
          59,
          999
        )

        // Get top customers that have a company (i.e., clients)
        const topClients = await this.getTopClients(
          workspaceId,
          monthStart,
          monthEnd
        )

        monthlyData.push({
          month: monthInfo.month.toString().padStart(2, "0"),
          year: monthInfo.year,
          clients: topClients,
        })
      }

      return monthlyData
    } catch (error) {
      logger.error("Error getting monthly top clients:", error)
      throw error
    }
  }

  // Helper method to generate array of months between two dates
  private generateMonthsArray(
    startDate: Date,
    endDate: Date
  ): { year: number; month: number }[] {
    const months = []
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

    while (current <= end) {
      months.push({
        year: current.getFullYear(),
        month: current.getMonth() + 1,
      })
      current.setMonth(current.getMonth() + 1)
    }

    return months
  }

  // Get top clients (customers with company field)
  private async getTopClients(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CustomerAnalytics[]> {
    try {
      const topClients = (await this.prisma.$queryRaw`
        SELECT 
          c.id,
          c.name,
          c.email,
          c.phone,
          c.company,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(o."totalAmount"), 0) as total_spent,
          MAX(o."createdAt") as last_order_date,
          CASE 
            WHEN COUNT(o.id) > 0 THEN COALESCE(SUM(o."totalAmount"), 0) / COUNT(o.id) 
            ELSE 0 
          END as average_order_value
        FROM "customers" c
        LEFT JOIN "orders" o ON c.id = o."customerId" 
          AND o."createdAt" >= ${startDate} 
          AND o."createdAt" <= ${endDate}
        WHERE c."workspaceId" = ${workspaceId}
          AND c."isActive" = true
          AND c.company IS NOT NULL
          AND c.company != ''
        GROUP BY c.id, c.name, c.email, c.phone, c.company
        ORDER BY total_spent DESC, total_orders DESC
        LIMIT 10
      `) as {
        id: string
        name: string
        email: string
        phone: string | null
        company: string | null
        total_orders: bigint
        total_spent: number
        last_order_date: Date | null
        average_order_value: number
      }[]

      return topClients.map((client) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone || undefined,
        company: client.company || undefined,
        totalOrders: Number(client.total_orders) || 0,
        totalSpent: Number(client.total_spent) || 0,
        lastOrderDate: client.last_order_date
          ? client.last_order_date.toISOString()
          : undefined,
        averageOrderValue: Number(client.average_order_value) || 0,
      }))
    } catch (error) {
      logger.error("Error fetching top clients:", error)
      return []
    }
  }
}
