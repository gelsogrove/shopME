import { BillingType, PrismaClient } from "@prisma/client"
import { BillingPrices } from "../../domain/enums/billing-prices.enum"
import logger from "../../utils/logger"

export class BillingService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Charge the monthly channel cost on the first day of each month
   */
  async chargeMonthlyChannelCost(workspaceId: string): Promise<void> {
    try {
      await this.prisma.billing.create({
        data: {
          workspaceId,
          amount: BillingPrices.MONTHLY_CHANNEL_COST,
          type: BillingType.MONTHLY_CHANNEL,
          description: "Monthly channel subscription cost",
        },
      })
      logger.info(`Charged monthly channel cost for workspace ${workspaceId}`)
    } catch (error) {
      logger.error(
        `Failed to charge monthly channel cost for workspace ${workspaceId}`,
        error
      )
      throw error
    }
  }

  /**
   * Track message cost (€0.15) - used for all message interactions
   */
  async trackMessage(
    workspaceId: string,
    customerId: string,
    description: string = "Message interaction",
    userQuery?: string
  ): Promise<void> {
    try {
      // Get current total for this customer
      const previousTotal = await this.getCurrentTotalForCustomer(
        workspaceId,
        customerId
      )
      const currentCharge = BillingPrices.MESSAGE
      const newTotal = previousTotal + currentCharge

      await this.prisma.billing.create({
        data: {
          workspaceId,
          customerId,
          amount: currentCharge,
          type: BillingType.MESSAGE,
          description,
          userQuery: userQuery || null,
          previousTotal,
          currentCharge,
          newTotal,
        },
      })
      logger.info(
        `[BILLING] 💰 Message: €${previousTotal.toFixed(2)} + €${currentCharge.toFixed(2)} = €${newTotal.toFixed(2)} (workspace: ${workspaceId}, customer: ${customerId})`
      )
    } catch (error) {
      logger.error(
        `Failed to charge message cost for workspace ${workspaceId}, customer ${customerId}`,
        error
      )
      throw error
    }
  }

  /**
   * Track usage cost for new customer
   */
  async trackNewCustomer(
    workspaceId: string,
    customerId: string
  ): Promise<void> {
    try {
      // Get current total for this customer
      const previousTotal = await this.getCurrentTotalForCustomer(
        workspaceId,
        customerId
      )
      const currentCharge = BillingPrices.NEW_CUSTOMER
      const newTotal = previousTotal + currentCharge

      await this.prisma.billing.create({
        data: {
          workspaceId,
          customerId,
          amount: currentCharge,
          type: BillingType.NEW_CUSTOMER,
          description: "New customer registration",
          previousTotal,
          currentCharge,
          newTotal,
        },
      })
      logger.info(
        `[BILLING] 💰 New Customer: €${previousTotal.toFixed(2)} + €${currentCharge.toFixed(2)} = €${newTotal.toFixed(2)} (workspace: ${workspaceId}, customer: ${customerId})`
      )
    } catch (error) {
      logger.error(
        `Failed to charge new customer for workspace ${workspaceId}, customer ${customerId}`,
        error
      )
      throw error
    }
  }

  /**
   * Track usage cost for new order
   */
  async trackNewOrder(
    workspaceId: string,
    customerId: string,
    orderCode: string
  ): Promise<void> {
    try {
      // Get current total for this customer
      const previousTotal = await this.getCurrentTotalForCustomer(
        workspaceId,
        customerId
      )
      const currentCharge = BillingPrices.NEW_ORDER
      const newTotal = previousTotal + currentCharge

      await this.prisma.billing.create({
        data: {
          workspaceId,
          customerId,
          amount: currentCharge,
          type: BillingType.NEW_ORDER,
          description: `New order: ${orderCode}`,
          previousTotal,
          currentCharge,
          newTotal,
        },
      })
      logger.info(
        `[BILLING] 💰 New Order: €${previousTotal.toFixed(2)} + €${currentCharge.toFixed(2)} = €${newTotal.toFixed(2)} (workspace: ${workspaceId}, customer: ${customerId}, order: ${orderCode})`
      )
    } catch (error) {
      logger.error(
        `Failed to charge new order for workspace ${workspaceId}, customer ${customerId}, order ${orderCode}`,
        error
      )
      throw error
    }
  }

  /**
   * Track usage cost for human support
   */
  async trackHumanSupport(
    workspaceId: string,
    customerId: string,
    description: string = "Human support session"
  ): Promise<void> {
    try {
      // Get current total for this customer
      const previousTotal = await this.getCurrentTotalForCustomer(
        workspaceId,
        customerId
      )
      const currentCharge = BillingPrices.HUMAN_SUPPORT
      const newTotal = previousTotal + currentCharge

      await this.prisma.billing.create({
        data: {
          workspaceId,
          customerId,
          amount: currentCharge,
          type: BillingType.HUMAN_SUPPORT,
          description,
          previousTotal,
          currentCharge,
          newTotal,
        },
      })
      logger.info(
        `[BILLING] 💰 Human Support: €${previousTotal.toFixed(2)} + €${currentCharge.toFixed(2)} = €${newTotal.toFixed(2)} (workspace: ${workspaceId}, customer: ${customerId})`
      )
    } catch (error) {
      logger.error(
        `Failed to charge human support for workspace ${workspaceId}, customer ${customerId}`,
        error
      )
      throw error
    }
  }

  /**
   * Track usage cost for push message
   */
  async trackPushMessage(
    workspaceId: string,
    customerId: string,
    description?: string
  ): Promise<void> {
    try {
      // Get current total for this customer
      const previousTotal = await this.getCurrentTotalForCustomer(
        workspaceId,
        customerId
      )
      const currentCharge = BillingPrices.PUSH_MESSAGE
      const newTotal = previousTotal + currentCharge

      await this.prisma.billing.create({
        data: {
          workspaceId,
          customerId,
          amount: currentCharge,
          type: BillingType.PUSH_MESSAGE,
          description: description || "Push message sent",
          previousTotal,
          currentCharge,
          newTotal,
        },
      })
      logger.info(
        `[BILLING] 💰 Push Message: €${previousTotal.toFixed(2)} + €${currentCharge.toFixed(2)} = €${newTotal.toFixed(2)} (workspace: ${workspaceId}, customer: ${customerId})`
      )
    } catch (error) {
      logger.error(
        `Failed to charge push message for workspace ${workspaceId}, customer ${customerId}`,
        error
      )
      throw error
    }
  }

  /**
   * Track usage cost for new FAQ
   */
  async trackNewFAQ(
    workspaceId: string,
    customerId: string | null = null,
    description: string = "New FAQ created"
  ): Promise<void> {
    try {
      // Get current total for workspace (FAQ can be created by admin without specific customer)
      const previousTotal = customerId
        ? await this.getCurrentTotalForCustomer(workspaceId, customerId)
        : await this.getCurrentTotal(workspaceId)
      const currentCharge = BillingPrices.NEW_FAQ
      const newTotal = previousTotal + currentCharge

      await this.prisma.billing.create({
        data: {
          workspaceId,
          customerId,
          amount: currentCharge,
          type: BillingType.NEW_FAQ,
          description,
          previousTotal,
          currentCharge,
          newTotal,
        },
      })
      logger.info(
        `[BILLING] 💰 New FAQ: €${previousTotal.toFixed(2)} + €${currentCharge.toFixed(2)} = €${newTotal.toFixed(2)} (workspace: ${workspaceId}${customerId ? `, customer: ${customerId}` : ""})`
      )
    } catch (error) {
      logger.error(
        `Failed to charge new FAQ for workspace ${workspaceId}`,
        error
      )
      throw error
    }
  }

  /**
   * Track usage cost for active offer
   */
  async trackActiveOffer(
    workspaceId: string,
    offerId: string,
    offerTitle: string = "Offer activated"
  ): Promise<void> {
    try {
      const previousTotal = await this.getCurrentTotal(workspaceId)
      const currentCharge = BillingPrices.ACTIVE_OFFER // €0.50
      const newTotal = previousTotal + currentCharge

      await this.prisma.billing.create({
        data: {
          workspaceId,
          amount: currentCharge,
          type: BillingType.ACTIVE_OFFER,
          description: `Offer activated: ${offerTitle}`,
          previousTotal,
          currentCharge,
          newTotal,
        },
      })
      logger.info(
        `[BILLING] 💰 Active offer: €${previousTotal.toFixed(
          2
        )} + €${currentCharge.toFixed(2)} = €${newTotal.toFixed(2)}`
      )
    } catch (error) {
      logger.error(
        `Failed to charge active offer for workspace ${workspaceId}`,
        error
      )
      throw error
    }
  }

  /**
   * Get billing summary for a workspace
   */
  async getBillingSummary(
    workspaceId: string,
    days: number = 30
  ): Promise<{
    totalCost: number
    billingByType: Record<string, { count: number; cost: number }>
    recentBilling: any[]
  }> {
    try {
      const since = new Date()
      since.setDate(since.getDate() - days)

      const billings = await this.prisma.billing.findMany({
        where: {
          workspaceId,
          createdAt: {
            gte: since,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      const totalCost = billings.reduce(
        (sum, billing) => sum + billing.amount,
        0
      )

      const billingByType = billings.reduce(
        (acc, billing) => {
          const type = billing.type
          if (!acc[type]) {
            acc[type] = { count: 0, cost: 0 }
          }
          acc[type].count += 1
          acc[type].cost += billing.amount
          return acc
        },
        {} as Record<string, { count: number; cost: number }>
      )

      return {
        totalCost,
        billingByType,
        recentBilling: billings.slice(0, 50), // Last 50 billing records
      }
    } catch (error) {
      logger.error(
        `Failed to get billing summary for workspace ${workspaceId}`,
        error
      )
      throw error
    }
  }

  /**
   * Get current total billing cost for a workspace
   */
  async getCurrentTotal(workspaceId: string): Promise<number> {
    try {
      const result = await this.prisma.billing.aggregate({
        where: {
          workspaceId,
        },
        _sum: {
          amount: true,
        },
      })

      return result._sum.amount
        ? parseFloat(result._sum.amount.toString())
        : 0.0
    } catch (error) {
      logger.error(
        `Failed to get current total for workspace ${workspaceId}`,
        error
      )
      throw error
    }
  }

  /**
   * Get current total billing cost for a workspace and specific customer
   */
  async getCurrentTotalForCustomer(
    workspaceId: string,
    customerId: string
  ): Promise<number> {
    try {
      const result = await this.prisma.billing.aggregate({
        where: {
          workspaceId,
          customerId,
        },
        _sum: {
          amount: true,
        },
      })

      return result._sum.amount
        ? parseFloat(result._sum.amount.toString())
        : 0.0
    } catch (error) {
      logger.error(
        `Failed to get current total for workspace ${workspaceId}, customer ${customerId}`,
        error
      )
      throw error
    }
  }
}
