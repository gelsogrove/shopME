import logger from "../../utils/logger"
import { config } from "../../config"
import { UrlShortenerService } from "./url-shortener.service"

/**
 * Centralized Link Generator Service
 * Ensures ALL links use URL shortener consistently
 */
export class LinkGeneratorService {
  private urlShortenerService: UrlShortenerService

  constructor() {
    this.urlShortenerService = new UrlShortenerService()
  }

  /**
   * Generate a short URL for any link type
   * This is the SINGLE source of truth for link generation
   */
  async generateShortLink(
    originalUrl: string,
    workspaceId: string,
    linkType: string = "generic"
  ): Promise<string> {
    try {
      // Create short URL
      const shortResult = await this.urlShortenerService.createShortUrl(
        originalUrl,
        workspaceId
      )

      const shortUrl = `http://localhost:3001${shortResult.shortUrl}`

      logger.info(
        `📎 Created short ${linkType} link: ${shortUrl} → ${originalUrl}`
      )
      return shortUrl
    } catch (error) {
      logger.warn(
        `⚠️ Failed to create short URL for ${linkType}, using long URL:`,
        error
      )
      return originalUrl // Fallback to original URL
    }
  }

  /**
   * Generate checkout link with token
   */
  async generateCheckoutLink(
    token: string,
    workspaceId: string
  ): Promise<string> {
    const originalUrl = `${config.frontendUrl}/checkout?token=${token}`
    return this.generateShortLink(originalUrl, workspaceId, "checkout")
  }

  /**
   * Generate orders link (general or specific)
   */
  async generateOrdersLink(
    token: string,
    workspaceId: string,
    orderCode?: string
  ): Promise<string> {
    let originalUrl: string

    if (orderCode && orderCode.trim() !== "") {
      const safeCode = encodeURIComponent(orderCode.trim())
      originalUrl = `${config.frontendUrl}/orders-public/${safeCode}?token=${token}`
    } else {
      originalUrl = `${config.frontendUrl}/orders-public?token=${token}`
    }

    return this.generateShortLink(originalUrl, workspaceId, "orders")
  }

  /**
   * Generate profile link with token
   */
  async generateProfileLink(
    token: string,
    workspaceId: string
  ): Promise<string> {
    const originalUrl = `${config.frontendUrl}/customer-profile?token=${token}`
    return this.generateShortLink(originalUrl, workspaceId, "profile")
  }

  /**
   * Generate tracking link with token
   * NOTE: Tracking uses orders-public page, not a separate tracking page
   */
  async generateTrackingLink(
    token: string,
    workspaceId: string
  ): Promise<string> {
    const originalUrl = `${config.frontendUrl}/orders-public?token=${token}`
    return this.generateShortLink(originalUrl, workspaceId, "tracking")
  }

  /**
   * Generate invoice link with token
   */
  async generateInvoiceLink(
    token: string,
    workspaceId: string
  ): Promise<string> {
    const originalUrl = `${config.frontendUrl}/invoice-public?token=${token}`
    return this.generateShortLink(originalUrl, workspaceId, "invoice")
  }

  /**
   * Generate registration link with token
   */
  async generateRegistrationLink(
    token: string,
    workspaceUrl: string,
    workspaceId: string
  ): Promise<string> {
    const originalUrl = `${workspaceUrl.replace(/\/$/, "")}/register?token=${token}`
    return this.generateShortLink(originalUrl, workspaceId, "registration")
  }

  /**
   * Generate tracking link for specific order
   */
  async generateShipmentTrackingLink(
    baseUrl: string,
    orderCode: string,
    token: string,
    workspaceId: string
  ): Promise<string> {
    const originalUrl = `${baseUrl}/orders-public/${orderCode}?token=${token}`
    return this.generateShortLink(originalUrl, workspaceId, "shipment-tracking")
  }
}

// Export singleton instance
export const linkGeneratorService = new LinkGeneratorService()
