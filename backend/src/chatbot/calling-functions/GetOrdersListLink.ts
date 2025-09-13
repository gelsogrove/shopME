import { SecureTokenService } from "../../application/services/secure-token.service"
import { prisma } from "../../lib/prisma"

type Params = {
  workspaceId: string
  customerId: string
  orderCode?: string
}

type Result = {
  ordersListUrl: string
  orderDetailUrl?: string
  token: string
  expiresAt: string
}

export async function GetOrdersListLink({ workspaceId, customerId, orderCode }: Params): Promise<Result> {
  if (!workspaceId || !customerId) {
    throw new Error("workspaceId and customerId are required")
  }

  const customer = await prisma.customers.findFirst({ where: { id: customerId, workspaceId }, include: { workspace: true } })
  if (!customer) {
    throw new Error("Customer not found in this workspace")
  }

  const tokenService = new SecureTokenService()
  const payload = { customerId, workspaceId, createdAt: new Date().toISOString() }
  const token = await tokenService.createToken("universal", workspaceId, payload, "1h", customerId, customer.phone || undefined, undefined, customerId)

  const baseUrl = customer.workspace?.url || process.env.FRONTEND_URL || "http://localhost:3000"
  const ordersListUrl = `${baseUrl}/orders-public?token=${token}`
  const result: Result = {
    ordersListUrl,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  }

  if (orderCode) {
    result.orderDetailUrl = `${baseUrl}/orders-public/${orderCode}?token=${token}`
  }

  return result
}

export const GetOrdersListLinkFunction = {
  name: "GetOrdersListLink",
  description: "Generate a secure public link to the orders list (and optional order detail) for a customer",
  parameters: {
    type: "object",
    properties: {
      workspaceId: { type: "string" },
      customerId: { type: "string" },
      orderCode: { type: "string" },
    },
    required: ["workspaceId", "customerId"],
  },
}


