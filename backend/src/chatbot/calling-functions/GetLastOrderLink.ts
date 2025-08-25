import { SecureTokenService } from "../../application/services/secure-token.service"
import { prisma } from "../../lib/prisma"

type Params = {
  workspaceId: string
  customerId: string
}

type Result = {
  lastOrderUrl: string
  orderCode: string
  token: string
  expiresAt: string
}

export async function GetLastOrderLink({ workspaceId, customerId }: Params): Promise<Result> {
  if (!workspaceId || !customerId) {
    throw new Error("workspaceId and customerId are required")
  }

  const customer = await prisma.customers.findFirst({ where: { id: customerId, workspaceId }, include: { workspace: true } })
  if (!customer) {
    throw new Error("Customer not found in this workspace")
  }

  // Find the last order for this customer
  const lastOrder = await prisma.orders.findFirst({
    where: { 
      customerId: customerId,
      workspaceId: workspaceId 
    },
    orderBy: { 
      createdAt: 'desc' 
    },
    select: {
      orderCode: true
    }
  })

  if (!lastOrder) {
    throw new Error("No orders found for this customer")
  }

  const tokenService = new SecureTokenService()
  const payload = { customerId, workspaceId, createdAt: new Date().toISOString() }
  const token = await tokenService.createToken("orders", workspaceId, payload, "1h", customerId, customer.phone || undefined, undefined, customerId)

  const baseUrl = customer.workspace?.url || process.env.FRONTEND_URL || "http://localhost:3000"
  const lastOrderUrl = `${baseUrl}/orders-public/${lastOrder.orderCode}?token=${token}`

  return {
    lastOrderUrl,
    orderCode: lastOrder.orderCode,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  }
}

export const GetLastOrderLinkFunction = {
  name: "GetLastOrderLink",
  description: "Generate a secure public link to the customer's last order",
  parameters: {
    type: "object",
    properties: {
      workspaceId: { type: "string" },
      customerId: { type: "string" },
    },
    required: ["workspaceId", "customerId"],
  },
}
