import { StandardResponse } from '../../types/whatsapp.types'

export interface GetActiveOffersParams {
  customerId: string
  workspaceId: string
}

export interface GetActiveOffersResult extends StandardResponse {
  offers?: Array<{
    id: string
    name: string
    description: string
    discountPercentage: number
    validFrom: string
    validTo: string
    categoryId?: string
    categoryName?: string
    isActive: boolean
  }>
}

export async function GetActiveOffers(
  params: GetActiveOffersParams,
  customerId: string,
  workspaceId: string
): Promise<GetActiveOffersResult> {
  try {
    console.log("🎯 GetActiveOffers called with:", { params, customerId, workspaceId })

    if (!customerId || !workspaceId) {
      return {
        success: false,
        error: "Missing customerId or workspaceId",
        message: "Customer or workspace information not available",
        timestamp: new Date().toISOString()
      }
    }

    // Import Prisma client
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Get active offers for the workspace
      const offers = await prisma.offer.findMany({
        where: {
          workspaceId: workspaceId,
          isActive: true,
          validFrom: {
            lte: new Date()
          },
          validTo: {
            gte: new Date()
          }
        },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          discountPercentage: 'desc'
        }
      })

      console.log(`🎯 Found ${offers.length} active offers for workspace ${workspaceId}`)

      if (offers.length === 0) {
        return {
          success: true,
          message: "Attualmente non ci sono offerte attive. Controlla regolarmente per nuove promozioni!",
          offers: [],
          timestamp: new Date().toISOString()
        }
      }

      // Format offers for response
      const formattedOffers = offers.map(offer => ({
        id: offer.id,
        name: offer.name,
        description: offer.description || `Sconto del ${offer.discountPercentage}%`,
        discountPercentage: offer.discountPercentage,
        validFrom: offer.validFrom.toISOString(),
        validTo: offer.validTo.toISOString(),
        categoryId: offer.category?.id,
        categoryName: offer.category?.name,
        isActive: offer.isActive
      }))

      // Create response message
      let responseMessage = "🎉 **OFFERTE ATTIVE DISPONIBILI:**\n\n"
      
      formattedOffers.forEach((offer, index) => {
        responseMessage += `**${index + 1}. ${offer.name}**\n`
        responseMessage += `💰 **Sconto**: ${offer.discountPercentage}%\n`
        if (offer.categoryName) {
          responseMessage += `📂 **Categoria**: ${offer.categoryName}\n`
        }
        if (offer.description) {
          responseMessage += `📝 **Descrizione**: ${offer.description}\n`
        }
        responseMessage += `📅 **Valida fino**: ${new Date(offer.validTo).toLocaleDateString('it-IT')}\n\n`
      })

      responseMessage += "🛒 **Approfitta subito di queste offerte!** Contattaci per maggiori informazioni o procedi con l'acquisto."

      return {
        success: true,
        message: responseMessage,
        offers: formattedOffers,
        timestamp: new Date().toISOString()
      }

    } finally {
      await prisma.$disconnect()
    }

  } catch (error) {
    console.error("❌ Error in GetActiveOffers:", error)
    return {
      success: false,
      error: error.message || 'Unknown error',
      message: "Si è verificato un errore nel recuperare le offerte. Riprova più tardi.",
      timestamp: new Date().toISOString()
    }
  }
}
