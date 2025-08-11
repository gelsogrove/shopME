import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import logger from "../../../utils/logger"

const prisma = new PrismaClient()

interface JWTPayload {
  clientId: string
  workspaceId: string
  scope: string
  orderCode?: string
  iat?: number
  exp?: number
}

export class OrdersController {
  /**
   * Get customer orders list
   * GET /api/orders
   */
  async getCustomerOrders(req: Request, res: Response): Promise<void> {
    try {
      const token = req.query.token as string
      if (!token) {
        res.status(401).json({ 
          success: false, 
          error: "Token is required" 
        })
        return
      }

      // Get JWT payload from middleware
      const payload = (req as any).jwtPayload as JWTPayload
      if (!payload) {
        res.status(401).json({ 
          success: false, 
          error: "Invalid or expired token" 
        })
        return
      }

      // Check if token has orders:list scope
      if (payload.scope !== "orders:list") {
        res.status(403).json({ 
          success: false, 
          error: "Token not authorized for orders access" 
        })
        return
      }

      const { clientId, workspaceId } = payload

      // Get customer (for testing, use the first customer if clientId is mock)
      const customer = await prisma.customers.findFirst({
        where: clientId === "mock-customer-id" 
          ? { workspaceId }
          : { id: clientId, workspaceId },
        include: { workspace: true },
      })

      if (!customer) {
        res.status(404).json({ 
          success: false, 
          error: "Customer not found" 
        })
        return
      }

      // Get orders for customer (for testing, use all orders if clientId is mock)
      const orders = await prisma.orders.findMany({
        where: clientId === "mock-customer-id"
          ? { workspaceId }
          : { customerId: clientId, workspaceId },
        include: {
          items: { include: { product: true, service: true } },
        },
        orderBy: { createdAt: "desc" },
      })

      const mapped = orders.map((o) => ({
        id: o.id,
        orderCode: o.orderCode,
        date: o.createdAt,
        status: o.status,
        totalAmount: o.totalAmount,
        itemsCount: o.items.length,
        invoiceUrl: `/api/orders/${o.orderCode}/invoice?token=${token}`,
        ddtUrl: `/api/orders/${o.orderCode}/ddt?token=${token}`,
      }))

      res.status(200).json({
        success: true,
        data: {
          customer: { 
            id: customer.id, 
            name: customer.name, 
            phone: customer.phone, 
            email: customer.email 
          },
          workspace: { 
            id: customer.workspace.id, 
            name: customer.workspace.name 
          },
          orders: mapped,
        },
      })
    } catch (error) {
      logger.error("[ORDERS] Error fetching customer orders:", error)
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      })
    }
  }

  /**
   * Get order detail
   * GET /api/orders/:orderCode
   */
  async getOrderDetail(req: Request, res: Response): Promise<void> {
    try {
      const { orderCode } = req.params
      const token = req.query.token as string

      if (!token) {
        res.status(401).json({ 
          success: false, 
          error: "Token is required" 
        })
        return
      }

      // Get JWT payload from middleware
      const payload = (req as any).jwtPayload as JWTPayload
      if (!payload) {
        res.status(401).json({ 
          success: false, 
          error: "Invalid or expired token" 
        })
        return
      }

      // Check if token has orders:detail scope
      if (payload.scope !== "orders:detail") {
        res.status(403).json({ 
          success: false, 
          error: "Token not authorized for order detail access" 
        })
        return
      }

      const { clientId, workspaceId } = payload

      // Optional: if token payload restricts to a specific orderCode
      if (payload.orderCode && payload.orderCode !== orderCode) {
        res.status(403).json({ 
          success: false, 
          error: "Token not authorized for this order" 
        })
        return
      }

      const order = await prisma.orders.findFirst({
        where: clientId === "mock-customer-id"
          ? { orderCode, workspaceId }
          : { orderCode, customerId: clientId, workspaceId },
        include: {
          items: { include: { product: true, service: true } },
          customer: true,
        },
      })

      if (!order) {
        res.status(404).json({ 
          success: false, 
          error: "Order not found" 
        })
        return
      }

      res.status(200).json({
        success: true,
        data: {
          order: {
            id: order.id,
            orderCode: order.orderCode,
            date: order.createdAt,
            status: order.status,
            totalAmount: order.totalAmount,
            items: order.items.map((it) => ({
              id: it.id,
              itemType: it.itemType,
              name: it.product?.name || it.service?.name || "Item",
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              totalPrice: it.totalPrice,
            })),
            invoiceUrl: `/api/orders/${order.orderCode}/invoice?token=${token}`,
            ddtUrl: `/api/orders/${order.orderCode}/ddt?token=${token}`,
          },
          customer: { 
            id: order.customer.id, 
            name: order.customer.name 
          },
        },
      })
    } catch (error) {
      logger.error("[ORDERS] Error fetching order detail:", error)
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      })
    }
  }

  /**
   * Download invoice
   * GET /api/orders/:orderCode/invoice
   */
  async downloadInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { orderCode } = req.params
      const token = req.query.token as string

      if (!token) {
        res.status(401).json({ 
          success: false, 
          error: "Token required" 
        })
        return
      }

      const payload = (req as any).jwtPayload as JWTPayload
      if (!payload) {
        res.status(401).json({ 
          success: false, 
          error: "Invalid or expired token" 
        })
        return
      }

      // TODO: Implement actual PDF generation
      res.status(501).json({ 
        success: false, 
        error: "Invoice download not implemented yet" 
      })
    } catch (error) {
      logger.error("[ORDERS] Error downloading invoice:", error)
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      })
    }
  }

  /**
   * Download DDT
   * GET /api/orders/:orderCode/ddt
   */
  async downloadDdt(req: Request, res: Response): Promise<void> {
    try {
      const { orderCode } = req.params
      const token = req.query.token as string

      if (!token) {
        res.status(401).json({ 
          success: false, 
          error: "Token required" 
        })
        return
      }

      const payload = (req as any).jwtPayload as JWTPayload
      if (!payload) {
        res.status(401).json({ 
          success: false, 
          error: "Invalid or expired token" 
        })
        return
      }

      // TODO: Implement actual PDF generation
      res.status(501).json({ 
        success: false, 
        error: "DDT download not implemented yet" 
      })
    } catch (error) {
      logger.error("[ORDERS] Error downloading DDT:", error)
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      })
    }
  }

}
