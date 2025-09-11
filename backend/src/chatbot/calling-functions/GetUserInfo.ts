import { PrismaClient } from '@prisma/client'
import logger from '../../utils/logger'

export interface GetUserInfoParams {
  workspaceId: string
  customerId: string
}

export interface GetUserInfoResult {
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail: string
  discountUser: number
  companyName: string
  lastOrderCode: string | null
  languageUser: string
}

export async function GetUserInfo(params: GetUserInfoParams): Promise<GetUserInfoResult | null> {
  logger.info(`[USER-INFO] Starting GetUserInfo for customer ${params.customerId} in workspace ${params.workspaceId}`)
  
  const prisma = new PrismaClient()
  
  try {
    // Get customer details
    const customer = await prisma.customers.findFirst({
      where: { 
        id: params.customerId,
        workspaceId: params.workspaceId 
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        discount: true,
        company: true,
        language: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { orderCode: true }
        }
      }
    })

    if (!customer) {
      logger.warn(`[USER-INFO] Customer ${params.customerId} not found in workspace ${params.workspaceId}`)
      return null
    }

    const result: GetUserInfoResult = {
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email || '',
      discountUser: customer.discount || 0,
      companyName: customer.company || '',
      lastOrderCode: customer.orders[0]?.orderCode || null,
      languageUser: customer.language || 'it'
    }

    logger.info(`[USER-INFO] ✅ User info retrieved for ${customer.name}: discount ${result.discountUser}%, language ${result.languageUser}`)
    
    return result

  } catch (error) {
    logger.error(`[USER-INFO] ❌ Error getting user info:`, error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}
