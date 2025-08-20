import { PrismaClient } from '@prisma/client'
import { SecureTokenService } from '../../application/services/secure-token.service'
import logger from '../../utils/logger'

export interface GetCustomerProfileLinkParams {
  workspaceId: string
  customerId: string
}

export interface GetCustomerProfileLinkResult {
  customerId: string
  customerName: string
  customerPhone: string
  profileUrl: string | null
}

export async function GetCustomerProfileLink(params: GetCustomerProfileLinkParams): Promise<GetCustomerProfileLinkResult | null> {
  logger.info(`[PROFILE-LINK] Starting GetCustomerProfileLink for customer ${params.customerId} in workspace ${params.workspaceId}`)
  
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
        workspace: {
          select: {
            url: true
          }
        }
      }
    })

    if (!customer) {
      logger.warn(`[PROFILE-LINK] Customer not found for ID ${params.customerId}`)
      return null
    }

    logger.info(`[PROFILE-LINK] Found customer ${customer.name} with phone ${customer.phone}`)

    // Generate secure token for profile page access
    const secureTokenService = new SecureTokenService()
    const tokenPayload = {
      customerId: params.customerId,
      workspaceId: params.workspaceId,
      phone: customer.phone,
      createdAt: new Date().toISOString()
    }

    logger.info(`[PROFILE-LINK] Generating token with payload:`, tokenPayload)

    const token = await secureTokenService.createToken(
      'profile',
      params.workspaceId,
      tokenPayload,
      '1h',
      params.customerId,
      customer.phone,
      undefined,
      params.customerId
    )

    logger.info(`[PROFILE-LINK] Token generated successfully: ${token.substring(0, 12)}...`)

    // Build profile URL - FORCE localhost:3000 for development
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    // TOKEN-ONLY: No phone parameter needed
    const profileUrl = `${baseUrl}/customer-profile?token=${token}`

    logger.info(`[PROFILE-LINK] Profile URL generated: ${profileUrl}`)

    return {
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone || '',
      profileUrl
    }

  } catch (error) {
    logger.error(`[PROFILE-LINK] Error generating profile link:`, error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

