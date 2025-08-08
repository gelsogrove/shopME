import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import { SecureTokenService } from "../../../application/services/secure-token.service"

import { getAllCategories } from "../../../chatbot/calling-functions/getAllCategories"
import { MessageRepository } from "../../../repositories/message.repository"
import { embeddingService } from "../../../services/embeddingService"
import logger from "../../../utils/logger"

const prisma = new PrismaClient()

/**
 * Internal API Controller for N8N Integration
 * Handles all internal API endpoints called by N8N workflows with Multi-Business Support
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     N8NAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 *       description: "N8N Internal API authentication"
 *   schemas:
 *     BusinessType:
 *       type: string
 *       enum: [ECOMMERCE, RESTAURANT, CLINIC, RETAIL, SERVICES, GENERIC]
 *     WorkspaceBusinessType:
 *       type: object
 *       properties:
 *         businessType:
 *           $ref: '#/components/schemas/BusinessType'
 *         workspaceName:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *     ChannelStatus:
 *       type: object
 *       properties:
 *         isActive:
 *           type: boolean
 *           nullable: true
 *         workspaceName:
 *           type: string
 *         businessType:
 *           $ref: '#/components/schemas/BusinessType'
 *         reason:
 *           type: string
 *     RAGSearchRequest:
 *       type: object
 *       required:
 *         - query
 *         - workspaceId
 *       properties:
 *         query:
 *           type: string
 *           description: Search query for RAG
 *         workspaceId:
 *           type: string
 *           description: Workspace ID
 *         businessType:
 *           $ref: '#/components/schemas/BusinessType'
 *     RAGSearchResponse:
 *       type: object
 *       properties:
 *         businessType:
 *           $ref: '#/components/schemas/BusinessType'
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Product ID
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Discounted price (final price shown to customer)
 *               originalPrice:
 *                 type: number
 *                 description: Original price before discount
 *               discountPercent:
 *                 type: number
 *                 description: Discount percent applied (0 if none)
 *               discountSource:
 *                 type: string
 *                 description: Source of discount ("customer" or "offer")
 *               formatted:
 *                 type: string
 *                 description: Formatted price string with discount details
 *               stock:
 *                 type: number
 *                 description: Units in stock
 *               category:
 *                 type: string
 *                 description: Product category
 *         faqs:
 *           type: array
 *           items:
 *             type: object
 *         services:
 *           type: array
 *           items:
 *             type: object
 *         documents:
 *           type: array
 *           items:
 *             type: object
 *     LLMProcessRequest:
 *       type: object
 *       required:
 *         - message
 *         - workspaceId
 *       properties:
 *         message:
 *           type: string
 *         ragResults:
 *           type: object
 *         customer:
 *           type: object
 *         workspaceId:
 *           type: string
 *         conversationHistory:
 *           type: array
 *           items:
 *             type: object
 *         businessType:
 *           $ref: '#/components/schemas/BusinessType'
 *         phoneNumber:
 *           type: string
 *     LLMProcessResponse:
 *       type: object
 *       properties:
 *         response:
 *           type: string
 *         model:
 *           type: string
 *         businessType:
 *           $ref: '#/components/schemas/BusinessType'
 *         tokensUsed:
 *           type: integer
 *         temperature:
 *           type: number
 *         maxTokens:
 *           type: integer
 *         promptUsed:
 *           type: string
 *
 * /internal/channel-status/{workspaceId}:
 *   get:
 *     tags: [Internal API]
 *     summary: Check WhatsApp channel status
 *     security:
 *       - InternalAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Channel status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isActive:
 *                   type: boolean
 *                 workspaceName:
 *                   type: string
 *                 businessType:
 *                   type: string
 *                 reason:
 *                   type: string
 *
 * /internal/business-type/{workspaceId}:
 *   get:
 *     tags: [Internal API]
 *     summary: Get business type for dynamic workflow routing
 *     security:
 *       - InternalAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business type information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 businessType:
 *                   type: string
 *                   enum: [ECOMMERCE, RESTAURANT, CLINIC, RETAIL, SERVICES, GENERIC]
 *                 workspaceName:
 *                   type: string
 *                 description:
 *                   type: string
 *
 * /internal/agent-config/{workspaceId}:
 *   get:
 *     tags: [Internal API]
 *     summary: Get agent configuration for N8N direct OpenRouter calls
 *     security:
 *       - InternalAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agentConfig:
 *                   type: object
 *                   properties:
 *                     model:
 *                       type: string
 *                     temperature:
 *                       type: number
 *                     maxTokens:
 *                       type: integer
 *                     prompt:
 *                       type: string
 *                 workspaceId:
 *                   type: string
 *
 * /internal/rag-search:
 *   post:
 *     tags: [Internal API]
 *     summary: Business-specific semantic search
 *     security:
 *       - InternalAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *               workspaceId:
 *                 type: string
 *               businessType:
 *                 type: string
 *               customerLanguage:
 *                 type: string
 *               sessionToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 businessType:
 *                   type: string
 *                 products:
 *                   type: array
 *                 faqs:
 *                   type: array
 *                 services:
 *                   type: array
 */
export class InternalApiController {
  private secureTokenService: SecureTokenService
  private prisma: PrismaClient

  constructor(private messageRepository: MessageRepository) {
    this.secureTokenService = new SecureTokenService()
    this.prisma = new PrismaClient()
  }

  /**
   * GET /internal/channel-status/:workspaceId
   * Check if WhatsApp channel is active for workspace
   */
  async getChannelStatus(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params

      // Check workspace exists and is active
      const workspace =
        await this.messageRepository.getWorkspaceSettings(workspaceId)

      if (!workspace || !workspace.isActive) {
        res.json({
          isActive: false,
          reason: "Workspace not found or inactive",
        })
        return
      }

      // Check if WhatsApp is configured and active
      const isChannelActive =
        workspace.whatsappApiKey && workspace.whatsappPhoneNumber

      res.json({
        isActive: isChannelActive,
        workspaceName: workspace.name,
        businessType: workspace.businessType || "ECOMMERCE", // Default to ECOMMERCE
        reason: isChannelActive ? "Channel active" : "WhatsApp not configured",
      })
    } catch (error) {
      logger.error("[INTERNAL-API] Channel status error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  /**
   * GET /internal/business-type/:workspaceId
   * Get business type for dynamic workflow routing
   */
  async getBusinessType(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params

      const workspace =
        await this.messageRepository.getWorkspaceSettings(workspaceId)

      if (!workspace) {
        res.json({
          businessType: "GENERIC",
          reason: "Workspace not found, using generic flow",
        })
        return
      }

      res.json({
        businessType: workspace.businessType || "ECOMMERCE",
        workspaceName: workspace.name,
        description: workspace.description,
      })
    } catch (error) {
      logger.error("[INTERNAL-API] Business type error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  /**
   * GET /internal/user-check/:workspaceId/:phone
   * Check user registration status
   */
  async getUserCheck(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, phone } = req.params

      const customer = await this.messageRepository.findCustomerByPhone(
        phone,
        workspaceId
      )

      res.json({
        isRegistered: !!customer,
        customer: customer
          ? {
              id: customer.id,
              name: customer.name,
              language: customer.language,
              discount: customer.discount,
              isBlacklisted: customer.isBlacklisted,
            }
          : null,
      })
    } catch (error) {
      logger.error("[INTERNAL-API] User check error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  /**
   * GET /internal/wip-status/:workspaceId/:phone
   * Check Work In Progress status for user
   */
  async getWipStatus(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params

      // Check workspace challenge status (WIP mode)
      const workspace =
        await this.messageRepository.getWorkspaceSettings(workspaceId)
      const hasActiveWip = workspace?.challengeStatus || false

      res.json({
        hasActiveWip,
        wipData: hasActiveWip
          ? { reason: "Workspace in maintenance mode" }
          : null,
      })
    } catch (error) {
      logger.error("[INTERNAL-API] WIP status error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  /**
   * POST /internal/rag-search
   * Perform semantic search across all content types with business-specific logic
   * Enhanced with Andrea's Session Token Validation
   */
  async ragSearch(req: Request, res: Response): Promise<void> {
    try {
      const {
        query,
        workspaceId,
        businessType,
        customerLanguage,
        sessionToken,
      } = req.body

      if (!query || !workspaceId) {
        res.status(400).json({ error: "Query and workspaceId are required" })
        return
      }

      logger.info(
        `[RAG-SEARCH] Processing search: "${query}" for workspace ${workspaceId}`
      )

      // 🔑 ANDREA'S SESSION TOKEN VALIDATION (Optional for backward compatibility)
      if (sessionToken) {
        const validation = await this.secureTokenService.validateToken(
          sessionToken,
          "session",
          workspaceId
        )
        if (!validation.valid) {
          logger.warn(
            `[RAG-SEARCH] Invalid session token: ${sessionToken.substring(0, 12)}...`
          )
          res.status(401).json({ error: "Invalid or expired session token" })
          return
        }
        logger.info(
          `[RAG-SEARCH] Valid session token for workspace ${workspaceId}`
        )
      }

      // 🌍 TRANSLATE QUERY TO ENGLISH FOR BETTER SEMANTIC SEARCH
      const translatedQuery = await this.translateQueryToEnglish(
        query,
        customerLanguage || "it"
      )

      logger.info(
        `[RAG-SEARCH] Original: "${query}" | Translated: "${translatedQuery}" | Language: ${customerLanguage}`
      )

      // Get workspace to determine business type if not provided
      let targetBusinessType = businessType
      if (!targetBusinessType) {
        const workspace = await prisma.workspace.findUnique({
          where: { id: workspaceId },
        })
        targetBusinessType = workspace?.businessType || "GENERIC"
      }

      // Route to business-specific RAG search using translated query
      switch (targetBusinessType) {
        case "ECOMMERCE":
          await this.ecommerceRagSearch(req, res, translatedQuery, workspaceId)
          break
        case "RESTAURANT":
          await this.restaurantRagSearch(req, res, translatedQuery, workspaceId)
          break
        case "CLINIC":
          await this.clinicRagSearch(req, res, translatedQuery, workspaceId)
          break
        case "RETAIL":
        case "SERVICES":
        case "GENERIC":
        default:
          await this.genericRagSearch(req, res, translatedQuery, workspaceId)
          break
      }
    } catch (error) {
      logger.error("[RAG-SEARCH] Error processing search:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  /**
   * E-commerce specific RAG search (current ShopMe logic)
   */
  private async ecommerceRagSearch(
    req: Request,
    res: Response,
    query: string,
    workspaceId: string
  ): Promise<void> {
    const customerId = req.body.customerId

    // 🔍 DEBUG: Log dei parametri ricevuti
    logger.info(`[E-COMMERCE-RAG] 🔍 Query: "${query}"`)
    logger.info(`[E-COMMERCE-RAG] 🔍 WorkspaceId: "${workspaceId}"`)
    logger.info(`[E-COMMERCE-RAG] 🔍 CustomerId received: "${customerId}"`)
    logger.info(`[E-COMMERCE-RAG] 🔍 CustomerId type: ${typeof customerId}`)

    // Import document service
    const { DocumentService } = await import(
      "../../../services/documentService"
    )
    const documentService = new DocumentService()

    // Parallel search across all content types
    const [productResults, faqResults, serviceResults, documentResults] =
      await Promise.all([
        embeddingService.searchProducts(query, workspaceId, 5),
        embeddingService.searchFAQs(query, workspaceId, 5),
        embeddingService.searchServices(query, workspaceId, 5),
        documentService.searchDocuments(query, workspaceId, 5),
      ])

    // Get full product details with stock verification
    const productIds = productResults.map((r) => r.id)
    let fullProducts =
      productIds.length > 0
        ? await this.messageRepository.findProducts(workspaceId, {
            productIds: productIds,
            limit: 5,
            isActive: true,
          })
        : []

    // 💰 Andrea's Logic: Apply discount calculation to products
    if (fullProducts.length > 0) {
      try {
        const { PriceCalculationService } = await import(
          "../../../application/services/price-calculation.service"
        )
        const { PrismaClient } = await import("@prisma/client")
        const prisma = new PrismaClient()
        const priceService = new PriceCalculationService(prisma)

        // 🔥 NUOVO: Recupera il customer discount dalla tabella customers
        let customerDiscount = 0
        if (customerId) {
          try {
            const customer = await prisma.customers.findUnique({
              where: { id: customerId },
              select: { discount: true, name: true, phone: true },
            })

            if (customer) {
              customerDiscount = customer.discount || 0
              logger.info(
                `[E-COMMERCE-RAG] 💰 Customer found: ${customer.name} (${customer.phone})`
              )
              logger.info(
                `[E-COMMERCE-RAG] 💰 Customer discount from DB: ${customerDiscount}%`
              )
            } else {
              logger.warn(
                `[E-COMMERCE-RAG] ⚠️ Customer not found for ID: ${customerId}`
              )
            }
          } catch (customerError) {
            logger.error(
              `[E-COMMERCE-RAG] ❌ Error fetching customer:`,
              customerError
            )
            // Continue with 0% discount if customer fetch fails
          }
        } else {
          logger.info(
            `[E-COMMERCE-RAG] ⚪ No customerId provided, using 0% discount`
          )
        }

        // Calculate prices with Andrea's logic (highest discount wins)
        logger.info(
          `[E-COMMERCE-RAG] 🧮 Calculating prices for ${productIds.length} products with customer discount ${customerDiscount}%`
        )
        const priceResult = await priceService.calculatePricesWithDiscounts(
          workspaceId,
          productIds,
          customerDiscount
        )
        logger.info(`[E-COMMERCE-RAG] 💰 Price calculation result:`, {
          totalProducts: priceResult.products.length,
          customerDiscount: priceResult.discountsApplied.customerDiscount,
          bestOfferDiscount: priceResult.discountsApplied.bestOfferDiscount,
          appliedDiscount: priceResult.discountsApplied.appliedDiscount,
          source: priceResult.discountsApplied.source,
        })

        // Merge price data with product data
        fullProducts = fullProducts.map((product) => {
          const priceData = priceResult.products.find(
            (p) => p.id === product.id
          )
          return {
            ...product,
            originalPrice: priceData?.originalPrice || product.price,
            finalPrice: priceData?.finalPrice || product.price,
            hasDiscount: (priceData?.appliedDiscount || 0) > 0,
            discountPercent: priceData?.appliedDiscount || 0,
            discountSource: priceData?.discountSource,
            discountName: priceData?.discountName,
            // Update the display price to final price
            price: priceData?.finalPrice || product.price,
          }
        })

        logger.info(
          `[E-COMMERCE-RAG] 💰 Andrea's Logic applied - Customer: ${customerDiscount}%, Best offer: ${priceResult.discountsApplied.bestOfferDiscount}%`
        )
        await prisma.$disconnect()
      } catch (priceError) {
        logger.error(
          "[E-COMMERCE-RAG] ❌ Error calculating prices:",
          priceError
        )
        // Continue without price calculation if error
      }
    }

    res.json({
      products: productResults
        .map((r) => {
          const product = fullProducts.find((p) => p.id === r.id)
          return product
            ? {
                id: product.id,
                name: product.name,
                description: product.description,
                price: (product as any).originalPrice || product.price,
                finalPrice: (product as any).finalPrice || product.price,
                hasDiscount: (product as any).hasDiscount || false,
                discountPercent: (product as any).discountPercent || 0,
                discountSource: (product as any).discountSource,
                discountName: (product as any).discountName,
                stock: product.stock,
                sku: product.sku,
                category: product.category?.name,
              }
            : null
        })
        .filter(Boolean),
      faqs: await Promise.all(
        faqResults.map(async (r) => ({
          id: r.id,
          question: r.sourceName,
          answer: await this.translateResponseToCustomerLanguage(
            r.content,
            req.body.customerLanguage || "it"
          ),
        }))
      ),
      services: serviceResults.map((r) => ({
        id: r.id,
        name: r.sourceName,
        description: r.content,
      })),
      documents: documentResults.map((r) => ({
        id: r.documentId,
        title: r.documentName,
        content: r.content,
      })),
    })
  }

  /**
   * Restaurant specific RAG search (menu, reservations, delivery)
   */
  private async restaurantRagSearch(
    req: Request,
    res: Response,
    query: string,
    workspaceId: string
  ): Promise<void> {
    // Import document service
    const { DocumentService } = await import(
      "../../../services/documentService"
    )
    const documentService = new DocumentService()

    // For restaurants: search menu items (products), restaurant info (services), hours/policies (FAQs)
    const [menuResults, faqResults, serviceResults, documentResults] =
      await Promise.all([
        embeddingService.searchProducts(query, workspaceId, 5), // Menu items
        embeddingService.searchFAQs(query, workspaceId, 5), // Hours, policies
        embeddingService.searchServices(query, workspaceId, 5), // Delivery, reservations
        documentService.searchDocuments(query, workspaceId, 5), // Documents like menus, policies
      ])

    const productIds = menuResults.map((r) => r.id)
    const menuItems =
      productIds.length > 0
        ? await this.messageRepository.findProducts(workspaceId, {
            productIds: productIds,
            limit: 5,
            isActive: true,
          })
        : []

    res.json({
      businessType: "RESTAURANT",
      menuItems: menuResults
        .map((r) => {
          const menuItem = menuItems.find((p) => p.id === r.id)
          return menuItem
            ? {
                id: menuItem.id,
                name: menuItem.name,
                description: menuItem.description,
                price: menuItem.price,
                category: menuItem.category?.name,
                stock: menuItem.stock,
              }
            : null
        })
        .filter(Boolean),
      restaurantInfo: await Promise.all(
        faqResults.map(async (r) => ({
          id: r.id,
          question: r.sourceName,
          answer: await this.translateResponseToCustomerLanguage(
            r.content,
            req.body.customerLanguage || "it"
          ),
        }))
      ),
      services: serviceResults.map((r) => ({
        id: r.id,
        name: r.sourceName,
        description: r.content,
      })),
      documents: documentResults.map((r) => ({
        id: r.documentId,
        title: r.documentName,
        content: r.content,
      })),
    })
  }

  /**
   * Clinic specific RAG search (appointments, medical services)
   */
  private async clinicRagSearch(
    req: Request,
    res: Response,
    query: string,
    workspaceId: string
  ): Promise<void> {
    // Import document service
    const { DocumentService } = await import(
      "../../../services/documentService"
    )
    const documentService = new DocumentService()

    // For clinics: search medical services, appointment info, policies
    const [serviceResults, faqResults, documentResults] = await Promise.all([
      embeddingService.searchServices(query, workspaceId, 8), // Medical services
      embeddingService.searchFAQs(query, workspaceId, 5), // Appointment policies, hours
      documentService.searchDocuments(query, workspaceId, 5), // Medical documents, forms
    ])

    res.json({
      businessType: "CLINIC",
      medicalServices: serviceResults.map((r) => ({
        id: r.id,
        name: r.sourceName,
        description: r.content,
      })),
      clinicInfo: await Promise.all(
        faqResults.map(async (r) => ({
          id: r.id,
          question: r.sourceName,
          answer: await this.translateResponseToCustomerLanguage(
            r.content,
            req.body.customerLanguage || "it"
          ),
        }))
      ),
      products: [], // No products for clinics
      documents: documentResults.map((r) => ({
        id: r.documentId,
        title: r.documentName,
        content: r.content,
      })),
    })
  }

  /**
   * Generic RAG search for undefined business types
   */
  private async genericRagSearch(
    req: Request,
    res: Response,
    query: string,
    workspaceId: string
  ): Promise<void> {
    // Import document service
    const { DocumentService } = await import(
      "../../../services/documentService"
    )
    const documentService = new DocumentService()

    // Get customer language from request
    const customerLanguage = req.body.customerLanguage || "it"

    // Generic search across all available content
    const [productResults, faqResults, serviceResults, documentResults] =
      await Promise.all([
        embeddingService.searchProducts(query, workspaceId, 3),
        embeddingService.searchFAQs(query, workspaceId, 5),
        embeddingService.searchServices(query, workspaceId, 3),
        documentService.searchDocuments(query, workspaceId, 5),
      ])

    // Translate FAQ answers to customer's language if needed
    const translatedFaqs = await Promise.all(
      faqResults.map(async (r) => ({
        id: r.id,
        question: r.sourceName,
        answer: await this.translateResponseToCustomerLanguage(
          r.content,
          customerLanguage
        ),
      }))
    )

    res.json({
      businessType: "GENERIC",
      products: productResults.map((r) => ({
        id: r.id,
        name: r.sourceName,
        description: r.content,
      })),
      faqs: translatedFaqs,
      services: serviceResults.map((r) => ({
        id: r.id,
        name: r.sourceName,
        description: r.content,
      })),
      documents: documentResults.map((r) => ({
        id: r.documentId,
        title: r.documentName,
        content: r.content,
      })),
    })
  }

  /**
   * POST /internal/llm-process
   * Business-aware LLM processing with OpenRouter using DYNAMIC AGENT SETTINGS
   */
  /**
   * ❌ DEPRECATED - Now handled directly by N8N with OpenRouter
   */
  async llmProcess(req: Request, res: Response): Promise<void> {
    try {
      const {
        message,
        ragResults,
        customer,
        workspaceId,
        conversationHistory,
        businessType,
        phoneNumber,
      } = req.body

      if (!message || !workspaceId) {
        res.status(400).json({ error: "Message and workspaceId required" })
        return
      }

      logger.info(
        `[LLM-PROCESS] Processing message for workspace: ${workspaceId}, business: ${businessType}`
      )

      // 🎯 GET AGENT SETTINGS FROM DATABASE (NOT HARDCODED!)
      const agentConfig =
        await this.messageRepository.getAgentConfig(workspaceId)
      if (!agentConfig) {
        res
          .status(400)
          .json({ error: "Agent configuration not found for workspace" })
        return
      }

      logger.info(
        `[LLM-PROCESS] Using agent config - Model: ${agentConfig.model}, Temp: ${agentConfig.temperature}, MaxTokens: ${agentConfig.maxTokens}`
      )

      // 🧠 BUILD COMPLETE CONVERSATION MEMORY (NOT JUST RECENT!)
      let fullConversationHistory = ""
      if (conversationHistory && conversationHistory.length > 0) {
        fullConversationHistory = conversationHistory
          .slice(-10) // Last 10 messages for context
          .map(
            (h: any) =>
              `${h.direction === "INBOUND" ? "Customer" : "Assistant"}: ${h.content}`
          )
          .join("\n")
      }

      // 🏢 GET FULL CONVERSATION HISTORY FROM DATABASE
      if (phoneNumber) {
        try {
          const dbHistory = await this.messageRepository.getLatesttMessages(
            phoneNumber,
            20,
            workspaceId
          )
          if (dbHistory && dbHistory.length > 0) {
            const formattedHistory = dbHistory
              .slice(-15) // Last 15 messages
              .map(
                (msg) =>
                  `${msg.direction === "INBOUND" ? "Customer" : "Assistant"}: ${msg.content}`
              )
              .join("\n")
            fullConversationHistory = formattedHistory
          }
        } catch (error) {
          logger.warn(
            `[LLM-PROCESS] Could not fetch conversation history: ${error.message}`
          )
        }
      }

      // 🎯 USE DYNAMIC PROMPT FROM AGENT CONFIG (NOT HARDCODED!)
      const businessContext = this.buildBusinessContext(
        businessType,
        ragResults
      )

      // 🚀 BUILD FINAL PROMPT USING AGENT PROMPT + CONTEXT
      const dynamicPrompt = `${agentConfig.prompt}

BUSINESS TYPE: ${businessType || "GENERIC"}
CURRENT CONTEXT: You are helping a customer for a ${businessType?.toLowerCase() || "business"} business.

CUSTOMER INFORMATION:
- Name: ${customer?.name || "Guest"}
- Phone: ${phoneNumber || "Unknown"}
- Language: ${customer?.language || "italian"}
- Discount Level: ${customer?.discount || 0}%
- Is Blacklisted: ${customer?.isBlacklisted ? "Yes" : "No"}

KNOWLEDGE BASE SEARCH RESULTS:
${businessContext}

CONVERSATION MEMORY (Last 15 messages):
${fullConversationHistory || "No previous conversation"}

CURRENT CUSTOMER MESSAGE: "${message}"

RESPONSE INSTRUCTIONS:
1. Use ALL relevant information from the knowledge base
2. Reference previous conversation when relevant
3. Be helpful, accurate, and professional
4. Respond in ${customer?.language || "italian"}
5. Apply customer discount if relevant
6. Include specific product details, prices, and availability
7. If no relevant information found, suggest alternatives or ask for clarification`

      logger.info(
        `[LLM-PROCESS] Calling OpenRouter with model: ${agentConfig.model}`
      )

      // 🌐 CALL OPENROUTER WITH DYNAMIC SETTINGS FROM DATABASE
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
            "X-Title": "ShopMe AI Assistant",
          },
          body: JSON.stringify({
            model: agentConfig.model, // 🎯 FROM DATABASE
            messages: [
              {
                role: "user",
                content: dynamicPrompt,
              },
            ],
            temperature: agentConfig.temperature, // 🎯 FROM DATABASE
            max_tokens: agentConfig.maxTokens, // 🎯 FROM DATABASE
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        logger.error(
          `[LLM-PROCESS] OpenRouter API error: ${response.status} - ${errorText}`
        )
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const data = await response.json()
      const formattedResponse =
        data.choices?.[0]?.message?.content ||
        "Sorry, I could not process your request."

      logger.info(
        `[LLM-PROCESS] OpenRouter response received, tokens used: ${data.usage?.total_tokens || 0}`
      )

      // 💰 USAGE TRACKING: Now handled in MessageRepository.saveMessage() when N8N calls /internal/save-message

      res.json({
        response: formattedResponse,
        model: agentConfig.model,
        businessType: businessType || "GENERIC",
        tokensUsed: data.usage?.total_tokens || 0,
        temperature: agentConfig.temperature,
        maxTokens: agentConfig.maxTokens,
        promptUsed: agentConfig.prompt.substring(0, 100) + "...", // First 100 chars for debugging
      })
    } catch (error) {
      logger.error("[LLM-PROCESS] Error in LLM processing:", error)
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      })
    }
  }

  /**
   * Build business-specific context for LLM
   */
  private buildBusinessContext(businessType: string, ragResults: any): string {
    switch (businessType) {
      case "ECOMMERCE":
        return `PRODUCTS AVAILABLE:
${
  ragResults?.products
    ?.map(
      (r: any) =>
        `- ${r.product?.name} (€${r.product?.price}) - Stock: ${r.product?.stock} units`
    )
    .join("\n") || "No products found"
}

FAQS:
${ragResults?.faqs?.map((r: any) => `- ${r.faq?.question}: ${r.faq?.answer}`).join("\n") || "No FAQs found"}

SERVICES:
${ragResults?.services?.map((r: any) => `- ${r.service?.name}: ${r.service?.description}`).join("\n") || "No services found"}`

      case "RESTAURANT":
        return `MENU ITEMS:
${
  ragResults?.menuItems
    ?.map(
      (r: any) =>
        `- ${r.menuItem?.name} (€${r.menuItem?.price}) - ${r.menuItem?.description || "Available"}`
    )
    .join("\n") || "No menu items found"
}

RESTAURANT INFO:
${ragResults?.restaurantInfo?.map((r: any) => `- ${r.info?.question}: ${r.info?.answer}`).join("\n") || "No restaurant info found"}

SERVICES (Delivery/Reservations):
${ragResults?.services?.map((r: any) => `- ${r.service?.name}: ${r.service?.description}`).join("\n") || "No services found"}`

      case "CLINIC":
        return `MEDICAL SERVICES:
${ragResults?.medicalServices?.map((r: any) => `- ${r.service?.name}: ${r.service?.description}`).join("\n") || "No medical services found"}

CLINIC INFORMATION:
${ragResults?.clinicInfo?.map((r: any) => `- ${r.info?.question}: ${r.info?.answer}`).join("\n") || "No clinic info found"}`

      default:
        return `AVAILABLE INFORMATION:
${JSON.stringify(ragResults, null, 2)}`
    }
  }

  /**
   * POST /internal/save-message
   * Save message and conversation history + Track usage (Andrea's Logic)
   */
  async saveMessage(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "[SAVE-MESSAGE] 📥 Request received:",
        JSON.stringify(req.body, null, 2)
      )

      const { phoneNumber, workspaceId, message, response } = req.body

      if (!phoneNumber || !workspaceId || !message) {
        res.status(400).json({ error: "Required fields missing" })
        return
      }

      console.log(
        `[SAVE-MESSAGE] 📝 Processing message from ${phoneNumber}, response: "${response ? response.substring(0, 50) + "..." : "NO RESPONSE"}"`
      )

      // Save the conversation using MessageRepository (includes €0.005 tracking)
      const savedMessage = await this.messageRepository.saveMessage({
        workspaceId,
        phoneNumber,
        message,
        response: response || "",
        direction: "INBOUND",
      })

      // 💰 USAGE TRACKING: Now handled in MessageRepository.saveMessage() (Andrea's Logic)
      console.log(
        "[SAVE-MESSAGE] ✅ Message saved via MessageRepository (tracking included)"
      )

      res.json({ success: true })
    } catch (error) {
      logger.error("[INTERNAL-API] Save message error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  /**
   * GET /internal/conversation-history/:workspaceId/:phone
   * Get conversation history for context
   */
  async getConversationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, phone } = req.params
      const limit = parseInt(req.query.limit as string) || 5

      const history = await this.messageRepository.getLatesttMessages(
        phone,
        limit,
        workspaceId
      )

      res.json({ history })
    } catch (error) {
      logger.error("[INTERNAL-API] Conversation history error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  /**
   * POST /internal/welcome-user
   * Handle user welcome and registration
   */
  async welcomeUser(req: Request, res: Response): Promise<void> {
    try {
      const { phone, workspaceId, language } = req.body

      if (!phone || !workspaceId) {
        res.status(400).json({ error: "Phone and workspaceId required" })
        return
      }

      // Generate simple registration token (simplified for now)
      const registrationToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Get welcome message from workspace
      const welcomeMessage = await this.messageRepository.getWelcomeMessage(
        workspaceId,
        language || "italian"
      )

      res.json({
        registrationToken,
        registrationUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/register?token=${registrationToken}`,
        welcomeMessage,
      })
    } catch (error) {
      logger.error("[INTERNAL-API] Welcome user error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  /**
   * GET /internal/agent-config/{workspaceId}
   * Get agent configuration for N8N direct OpenRouter calls
   */
  async getAgentConfig(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params

      if (!workspaceId) {
        res.status(400).json({ error: "WorkspaceId required" })
        return
      }

      logger.info(
        `[INTERNAL-API] Getting agent config for workspace: ${workspaceId}`
      )

      // Get agent configuration from database
      const agentConfig =
        await this.messageRepository.getAgentConfig(workspaceId)
      if (!agentConfig) {
        res
          .status(404)
          .json({ error: "Agent configuration not found for workspace" })
        return
      }

      logger.info(
        `[INTERNAL-API] Agent config found - Model: ${agentConfig.model}, Temp: ${agentConfig.temperature}`
      )

      res.json({
        agentConfig: {
          model: agentConfig.model,
          temperature: agentConfig.temperature,
          maxTokens: agentConfig.maxTokens,
          prompt: agentConfig.prompt,
        },
        workspaceId,
      })
    } catch (error) {
      logger.error("[INTERNAL-API] Get agent config error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  /**
   * POST /internal/generate-registration-link
   * Generate registration link for new users
   */
  async generateRegistrationLink(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, workspaceId, language } = req.body

      if (!phoneNumber || !workspaceId) {
        res.status(400).json({ error: "Phone number and workspaceId required" })
        return
      }

      logger.info(
        `[INTERNAL-API] Generating registration link for ${phoneNumber} in workspace ${workspaceId}`
      )

      // Generate secure registration token
      const token = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`

      // Get workspace details for URL
      const workspace =
        await this.messageRepository.getWorkspaceSettings(workspaceId)
      const baseUrl =
        workspace?.url || process.env.FRONTEND_URL || "http://localhost:3000"

      // Build registration URL
      const registrationUrl = `${baseUrl}/register?phone=${encodeURIComponent(phoneNumber)}&workspace=${workspaceId}&token=${token}&lang=${language || "it"}`

      // Get welcome message template based on language
      const welcomeMessage = await this.messageRepository.getWelcomeMessage(
        workspaceId,
        language || "italian"
      )

      // Combine welcome message with registration link
      const fullMessage = `${welcomeMessage}\n\n🔗 Per registrarti clicca qui: ${registrationUrl}`

      res.json({
        success: true,
        token,
        registrationUrl,
        welcomeMessage,
        fullMessage,
        phoneNumber,
        workspaceId,
      })
    } catch (error) {
      logger.error("[INTERNAL-API] Generate registration link error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  // ❌ REMOVED: llmRouter method - Now handled directly by N8N with OpenRouter
  // Intent classification is now done in N8N workflow using OpenRouter LLM calls

  /**
   * 📱 Send WhatsApp Message (Andrea's Architecture)
   *
   * Sends final response via WhatsApp and saves to database
   */
  async sendWhatsApp(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, message, workspaceId, chatSessionId } = req.body

      if (!phoneNumber || !message || !workspaceId) {
        res.status(400).json({
          error: "Phone number, message, and workspace ID are required",
        })
        return
      }

      logger.info(
        `[SEND-WHATSAPP] 📱 Andrea's Architecture - Sending to ${phoneNumber}: "${message.substring(0, 50)}..."`
      )

      const { PrismaClient } = await import("@prisma/client")
      const prisma = new PrismaClient()

      // Save OUTBOUND message to database
      if (chatSessionId) {
        await prisma.message.create({
          data: {
            chatSessionId,
            content: message,
            direction: "OUTBOUND",
            type: "TEXT",
            metadata: {
              source: "n8n",
              phoneNumber,
              timestamp: new Date().toISOString(),
            },
          },
        })
        logger.info(
          `[SEND-WHATSAPP] 💾 Message saved to database (chatSessionId: ${chatSessionId})`
        )
      }

      // In a real implementation, here we would call the actual WhatsApp API
      // For now, we simulate the response
      logger.info(
        `[SEND-WHATSAPP] ✅ WhatsApp message sent successfully to ${phoneNumber}`
      )

      res.json({
        success: true,
        phoneNumber,
        messageId: `msg_${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: "sent",
        length: message.length,
      })

      await prisma.$disconnect()
    } catch (error: any) {
      logger.error("[SEND-WHATSAPP] ❌ Error sending WhatsApp message:", error)
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    }
  }

  /**
   * 💰 Get Products with Discounts Applied (Andrea's Logic)
   *
   * Used by N8N for RAG search with accurate pricing
   * NON-CUMULATIVE: highest discount wins
   */
  async getProductsWithDiscounts(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, customerId, productIds, query } = req.body

      if (!workspaceId) {
        res.status(400).json({
          error: "Workspace ID is required",
        })
        return
      }

      logger.info(
        `[PRODUCTS-DISCOUNTS] 💰 Andrea's Logic - Getting products for workspace ${workspaceId}`
      )

      const { PriceCalculationService } = await import(
        "../../../application/services/price-calculation.service"
      )
      const { PrismaClient } = await import("@prisma/client")
      const prisma = new PrismaClient()

      const priceService = new PriceCalculationService(prisma)

      // Get customer discount if customerId provided
      let customerDiscount = 0
      if (customerId) {
        const customer = await prisma.customers.findUnique({
          where: { id: customerId },
          select: { discount: true },
        })
        customerDiscount = customer?.discount || 0
        logger.info(
          `[PRODUCTS-DISCOUNTS] 👤 Customer discount: ${customerDiscount}%`
        )
      }

      // Calculate prices with Andrea's logic (highest discount wins)
      const result = await priceService.calculatePricesWithDiscounts(
        workspaceId,
        productIds,
        customerDiscount
      )

      // Filter by query if provided
      let filteredProducts = result.products
      if (query) {
        const searchTerm = query.toLowerCase()
        filteredProducts = result.products.filter((product) =>
          product.name.toLowerCase().includes(searchTerm)
        )
      }

      logger.info(
        `[PRODUCTS-DISCOUNTS] ✅ Found ${filteredProducts.length} products, best discount: ${result.discountsApplied.appliedDiscount}%`
      )

      res.json({
        success: true,
        products: filteredProducts.map((product) => {
          // Build formatted string if not present
          const hasDiscount = (product.appliedDiscount || 0) > 0
          const prezzoFinale = product.finalPrice ?? product.price
          const prezzoOriginale = product.originalPrice ?? product.price
          const scontoPercentuale = product.appliedDiscount || 0
          const scontoTipo = product.discountSource || null
          let formatted = `Prezzo: €${prezzoFinale.toFixed(2)}`
          if (hasDiscount) {
            formatted += ` (scontato del ${scontoPercentuale}%, prezzo pieno €${prezzoOriginale.toFixed(2)}`
            if (scontoTipo) formatted += `, fonte: ${scontoTipo}`
            formatted += ")"
          }
          return {
            id: product.id,
            name: product.name,
            // description, stock, and category may not be present; fallback to empty string or null
            description: "",
            price: product.finalPrice,
            originalPrice: product.originalPrice,
            discountPercent: product.appliedDiscount,
            discountSource: product.discountSource,
            formatted,
            stock: null,
            category: product.categoryId ? String(product.categoryId) : null,
          }
        }),
        discountInfo: {
          customerDiscount,
          bestOfferDiscount: result.discountsApplied.bestOfferDiscount,
          appliedDiscount: result.discountsApplied.appliedDiscount,
          source: result.discountsApplied.source,
        },
        totalSavings: result.totalDiscount,
        query: query || null,
      })

      await prisma.$disconnect()
    } catch (error: any) {
      logger.error(
        "[PRODUCTS-DISCOUNTS] ❌ Error getting products with discounts:",
        error
      )
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    }
  }

  /**
   * 🔧 LLM Formatter for RAG Response Grouping (Andrea's Architecture)
   *
   * Takes multiple RAG results and formats them into a single cohesive message
   * Used in N8N to group products, FAQs, services into one response
   */
  // ❌ REMOVED: llmFormatter method - Now handled directly by N8N with OpenRouter
  // Response formatting is now done in N8N workflow using OpenRouter LLM calls

  /**
   * 🧪 TEST ENDPOINT - Complete RAG + Pricing Test (Andrea's Testing)
   *
   * Input: frase da cercare
   * Output: tutto quello che trova con prezzi scontati
   */
  async testRagComplete(req: Request, res: Response): Promise<void> {
    try {
      const { query, workspaceId } = req.body

      if (!query || !workspaceId) {
        res.status(400).json({
          error: "Query and workspace ID are required",
          example: {
            query: "pasta gragnano",
            workspaceId: "clzd8x8z20000356cqhpe6yu0",
          },
        })
        return
      }

      logger.info(
        `[TEST-RAG] 🧪 Andrea's Test - Query: "${query}" for workspace ${workspaceId}`
      )

      // Search across all content types
      const [productResults, faqResults, serviceResults] = await Promise.all([
        embeddingService.searchProducts(query, workspaceId, 5),
        embeddingService.searchFAQs(query, workspaceId, 5),
        embeddingService.searchServices(query, workspaceId, 5),
      ])

      // Get full product details
      const productIds = productResults.map((r) => r.id)
      let fullProducts: any[] = []

      if (productIds.length > 0) {
        fullProducts = await this.messageRepository.findProducts(workspaceId, {
          productIds: productIds,
          limit: 5,
          isActive: true,
        })
      }

      // Format simple response
      const ragResults = {
        products: productResults.map((r) => ({
          id: r.id,
          similarity: r.similarity,
          content: r.content,
          sourceName: r.sourceName,
          productData: fullProducts.find((p) => p.id === r.id),
        })),
        faqs: faqResults.map((r) => ({
          id: r.id,
          similarity: r.similarity,
          content: r.content,
          sourceName: r.sourceName,
        })),
        services: serviceResults.map((r) => ({
          id: r.id,
          similarity: r.similarity,
          content: r.content,
          sourceName: r.sourceName,
        })),
      }

      const totalResults =
        productResults.length + faqResults.length + serviceResults.length

      logger.info(
        `[TEST-RAG] ✅ Test completed - Found ${totalResults} results`
      )

      res.json({
        success: true,
        query,
        workspaceId,
        ragResults,
        summary: {
          totalResults,
          productsFound: productResults.length,
          faqsFound: faqResults.length,
          servicesFound: serviceResults.length,
        },
        testInfo: {
          endpoint: "/internal/test-rag-complete",
          description: "Complete RAG test endpoint by Andrea",
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error: any) {
      logger.error("[TEST-RAG] ❌ Error in complete RAG test:", error)
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
        query: req.body.query || "N/A",
      })
    }
  }

  /**
   * 🧪 SIMPLE TEST - Search Products (Andrea's Testing)
   */
  async testSimpleSearch(req: Request, res: Response): Promise<void> {
    try {
      const { query, workspaceId } = req.body

      if (!query || !workspaceId) {
        res.status(400).json({
          error: "Query and workspace ID are required",
          example: { query: "pasta", workspaceId: "clzd8x8z20000356cqhpe6yu0" },
        })
        return
      }

      // Simple search
      const results = await embeddingService.searchProducts(
        query,
        workspaceId,
        5
      )

      res.json({
        success: true,
        query,
        workspaceId,
        results,
        count: results.length,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      res.status(500).json({
        error: "Error in search",
        message: error.message,
      })
    }
  }

  /**
   * 🧪 MOCK TEST - Demo Results (Andrea's Testing)
   */
  async testMockResults(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body

      logger.info(`[MOCK-TEST] 🧪 Andrea's Mock Test - Query: "${query}"`)

      // Mock results for Andrea to see the structure
      const mockResults = [
        {
          id: "prod-001",
          similarity: 0.92,
          content:
            "Mozzarella di Bufala Campana DOP - 250g. Prodotta in Campania con latte di bufala fresco. Cremosa e saporita, perfetta per insalate e pizza.",
          sourceName: "Mozzarella di Bufala DOP",
          productData: {
            id: "prod-001",
            name: "Mozzarella di Bufala Campana DOP",
            description: "Mozzarella di bufala fresca prodotta in Campania",
            price: 8.5,
            stock: 25,
            category: { name: "Formaggi" },
          },
        },
        {
          id: "prod-002",
          similarity: 0.87,
          content:
            "Mozzarella Fiordilatte Pugliese - 200g. Mozzarella vaccina fresca del giorno. Gusto delicato e consistenza morbida.",
          sourceName: "Mozzarella Fiordilatte",
          productData: {
            id: "prod-002",
            name: "Mozzarella Fiordilatte Pugliese",
            description: "Mozzarella vaccina fresca pugliese",
            price: 4.2,
            stock: 40,
            category: { name: "Formaggi" },
          },
        },
        {
          id: "prod-003",
          similarity: 0.81,
          content:
            "Burrata Pugliese Artigianale - 125g. Formaggio fresco con cuore cremoso. Prodotta con latte locale di alta qualità.",
          sourceName: "Burrata Pugliese Artigianale",
          productData: {
            id: "prod-003",
            name: "Burrata Pugliese Artigianale",
            description: "Burrata fresca con cuore cremoso",
            price: 6.8,
            stock: 15,
            category: { name: "Formaggi" },
          },
        },
      ]

      // Filter results based on query
      let filteredResults = mockResults
      if (query) {
        const lowerQuery = query.toLowerCase()
        if (lowerQuery.includes("mozzarella")) {
          filteredResults = mockResults.slice(0, 2) // First 2 are mozzarella
        } else if (lowerQuery.includes("burrata")) {
          filteredResults = [mockResults[2]] // Only burrata
        } else if (
          lowerQuery.includes("formaggio") ||
          lowerQuery.includes("cheese")
        ) {
          filteredResults = mockResults // All cheese products
        }
      }

      res.json({
        success: true,
        query,
        isMockData: true,
        results: filteredResults,
        count: filteredResults.length,
        formattedResponse: this.formatMockResults(filteredResults, query),
        timestamp: new Date().toISOString(),
        note: "🧪 DATI MOCK - Questi sono risultati di esempio per mostrare il funzionamento",
      })
    } catch (error: any) {
      res.status(500).json({
        error: "Error in mock search",
        message: error.message,
      })
    }
  }

  private formatMockResults(results: any[], query: string): string {
    if (results.length === 0) {
      return `🔍 Nessun risultato trovato per "${query}"`
    }

    let response = `🛍️ **PRODOTTI TROVATI PER "${query.toUpperCase()}":**\n\n`

    results.forEach((item, index) => {
      const product = item.productData
      response += `${index + 1}. **${product.name}** (Similarità: ${(item.similarity * 100).toFixed(1)}%)\n`
      response += `   💰 Prezzo: €${product.price}\n`
      response += `   📝 ${product.description}\n`
      response += `   📦 Stock: ${product.stock}\n`
      response += `   🏷️ Categoria: ${product.category.name}\n\n`
    })

    return response
  }

  /**
   * 🧪 OPEN TEST ENDPOINT - No Auth, Hardcoded WorkspaceId (Andrea's Testing)
   * GET /internal/test-rag-open?search=avete le mozzarelle
   * Completely open endpoint with hardcoded workspace for quick testing
   */
  async testRagOpen(req: Request, res: Response): Promise<void> {
    try {
      const { search } = req.query

      // 🔒 HARDCODED VALUES FOR TESTING (Andrea's Request)
      const HARDCODED_WORKSPACE_ID = "clzd8x8z20000356cqhpe6yu0"
      const query = (search as string) || "mozzarelle" // Default search if empty

      logger.info(`[OPEN-RAG-TEST] 🧪 Andrea's Open Test - Query: "${query}"`)

      // Search across all content types in parallel
      const [productResults, faqResults, serviceResults] = await Promise.all([
        embeddingService.searchProducts(query, HARDCODED_WORKSPACE_ID, 10),
        embeddingService.searchFAQs(query, HARDCODED_WORKSPACE_ID, 10),
        embeddingService.searchServices(query, HARDCODED_WORKSPACE_ID, 10),
      ])

      logger.info(
        `[OPEN-RAG-TEST] Found - Products: ${productResults.length}, FAQs: ${faqResults.length}, Services: ${serviceResults.length}`
      )

      // Simple, clean response for Andrea's testing
      res.json({
        testName: "Andrea's Open RAG Test",
        query,
        workspaceId: HARDCODED_WORKSPACE_ID,
        results: {
          products: productResults,
          faqs: faqResults,
          services: serviceResults,
        },
        summary: {
          totalResults:
            productResults.length + faqResults.length + serviceResults.length,
          productsFound: productResults.length,
          faqsFound: faqResults.length,
          servicesFound: serviceResults.length,
        },
        timestamp: new Date().toISOString(),
        note: "🔓 Endpoint completamente aperto per test rapidi",
      })
    } catch (error: any) {
      logger.error("[OPEN-RAG-TEST] ❌ Error:", error)
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
        query: req.query.search || "N/A",
      })
    }
  }

  /**
   * 🧪 TEST EMBEDDING REGENERATION - No Auth Required (Andrea's Testing)
   * POST /internal/test-regenerate-embeddings
   */
  async testRegenerateEmbeddings(req: Request, res: Response): Promise<void> {
    try {
      const HARDCODED_WORKSPACE_ID = "clzd8x8z20000356cqhpe6yu0"

      logger.info(
        `[TEST-EMBEDDING-REGEN] 🔄 Starting FAQ embedding regeneration for workspace: ${HARDCODED_WORKSPACE_ID}`
      )

      // Import embedding service dynamically to avoid circular dependencies
      const { EmbeddingService } = await import(
        "../../../services/embeddingService"
      )
      const embeddingService = new EmbeddingService()

      // Regenerate FAQ embeddings
      await embeddingService.generateFAQEmbeddings(HARDCODED_WORKSPACE_ID)

      logger.info(
        `[TEST-EMBEDDING-REGEN] ✅ FAQ embedding regeneration completed`
      )

      res.json({
        status: "success",
        message: "FAQ embeddings regenerated successfully",
        workspaceId: HARDCODED_WORKSPACE_ID,
        timestamp: new Date().toISOString(),
        note: "🔓 Test endpoint - embeddings regenerated",
      })
    } catch (error: any) {
      logger.error("[TEST-EMBEDDING-REGEN] ❌ Error:", error)
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    }
  }

  /**
   * 🧪 GET ENDPOINT - Simple RAG Search with Query Parameter (Andrea's Request)
   * GET /internal/test-simple-search?search=avete le mozzarelle&workspaceId=xxx
   */
  async testSimpleSearchGet(req: Request, res: Response): Promise<void> {
    try {
      const { search, workspaceId } = req.query

      if (!search) {
        res.status(400).json({
          error: "Search parameter is required",
          example:
            "GET /internal/test-simple-search?search=mozzarelle&workspaceId=clzd8x8z20000356cqhpe6yu0",
        })
        return
      }

      const finalWorkspaceId =
        (workspaceId as string) || "clzd8x8z20000356cqhpe6yu0"
      const query = search as string

      logger.info(
        `[SIMPLE-RAG-GET] 🔍 Search: "${query}" in workspace: ${finalWorkspaceId}`
      )

      // Simple product search
      const results = await embeddingService.searchProducts(
        query,
        finalWorkspaceId,
        5
      )

      res.json({
        success: true,
        query,
        workspaceId: finalWorkspaceId,
        results,
        count: results.length,
        endpoint: "GET /internal/test-simple-search",
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      logger.error("[SIMPLE-RAG-GET] ❌ Error:", error)
      res.status(500).json({
        error: "Error in GET search",
        message: error.message,
      })
    }
  }

  /**
   * POST /internal/generate-token
   * Generate secure tokens for various purposes (checkout, invoice, etc.)
   * Called by N8N workflow when creating secure links
   */
  async generateToken(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, action, metadata, workspaceId } = req.body

      if (!customerId || !action) {
        res.status(400).json({ error: "customerId and action are required" })
        return
      }

      logger.info(
        `[INTERNAL-API] Generating ${action} token for customer ${customerId}`
      )

      // Get customer details
      const customer = await prisma.customers.findUnique({
        where: { id: customerId },
        include: { workspace: true },
      })

      if (!customer) {
        res.status(404).json({ error: "Customer not found" })
        return
      }

      // Validate workspace if provided
      const targetWorkspaceId = workspaceId || customer.workspaceId
      if (customer.workspaceId !== targetWorkspaceId) {
        res
          .status(403)
          .json({ error: "Customer does not belong to this workspace" })
        return
      }

      let token: string
      let expiresAt: Date
      let linkUrl: string | null = null

      // Generate different types of tokens based on action
      switch (action) {
        case "checkout":
          // Create checkout token using SecureTokenService
          const checkoutPayload = {
            customerId,
            workspaceId: targetWorkspaceId,
            customerName: customer.name,
            customerPhone: customer.phone,
            metadata: metadata || {},
            createdAt: new Date().toISOString(),
          }

          token = await this.secureTokenService.createToken(
            "checkout",
            targetWorkspaceId,
            checkoutPayload,
            "1h",
            customerId,
            customer.phone
          )

          expiresAt = new Date()
          expiresAt.setHours(expiresAt.getHours() + 1)

          // Build checkout URL
          const baseUrl =
            customer.workspace.url ||
            process.env.FRONTEND_URL ||
            "http://localhost:3000"
          linkUrl = `${baseUrl}/checkout?token=${token}`
          break

        case "invoice":
          // Create invoice token
          const invoicePayload = {
            customerId,
            workspaceId: targetWorkspaceId,
            customerName: customer.name,
            customerPhone: customer.phone,
            metadata: metadata || {},
            createdAt: new Date().toISOString(),
          }

          token = await this.secureTokenService.createToken(
            "invoice",
            targetWorkspaceId,
            invoicePayload,
            "24h",
            customerId,
            customer.phone
          )

          expiresAt = new Date()
          expiresAt.setHours(expiresAt.getHours() + 24)

          // Build invoice URL
          const invoiceBaseUrl =
            customer.workspace.url ||
            process.env.FRONTEND_URL ||
            "http://localhost:3000"
          linkUrl = `${invoiceBaseUrl}/invoice?token=${token}`
          break

        case "cart":
          // Create cart token
          const cartPayload = {
            customerId,
            workspaceId: targetWorkspaceId,
            customerName: customer.name,
            customerPhone: customer.phone,
            metadata: metadata || {},
            createdAt: new Date().toISOString(),
          }

          token = await this.secureTokenService.createToken(
            "cart",
            targetWorkspaceId,
            cartPayload,
            "2h",
            customerId,
            customer.phone
          )

          expiresAt = new Date()
          expiresAt.setHours(expiresAt.getHours() + 2)

          // Build cart URL
          const cartBaseUrl =
            customer.workspace.url ||
            process.env.FRONTEND_URL ||
            "http://localhost:3000"
          linkUrl = `${cartBaseUrl}/cart?token=${token}`
          break

        default:
          res.status(400).json({ error: `Unsupported action: ${action}` })
          return
      }

      res.json({
        success: true,
        token,
        expiresAt,
        linkUrl,
        action,
        customerId,
        workspaceId: targetWorkspaceId,
      })

      logger.info(
        `[INTERNAL-API] Generated ${action} token: ${token.substring(0, 12)}... for customer ${customerId}`
      )
    } catch (error) {
      logger.error("[INTERNAL-API] Generate token error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }

  /**
   * 📋 GET ALL PRODUCTS - For N8N getAllProducts Tool (Andrea's Request)
   * POST /internal/get-all-products
   * Returns all products for a workspace with customer discount logic applied
   * Enhanced with Andrea's "Highest Discount Wins" Logic
   */
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, customerId, categoryId, search, limit } = req.body

      if (!workspaceId) {
        res.status(400).json({
          error: "Workspace ID is required",
          example: {
            workspaceId: "clzd8x8z20000356cqhpe6yu0",
            customerId: "optional",
          },
        })
        return
      }

      logger.info(
        `[GET-ALL-PRODUCTS] 📋 Andrea's getAllProducts - Getting products for workspace ${workspaceId}, customerId: ${customerId}`
      )

      // Build filter conditions
      const where: any = {
        workspaceId,
        isActive: true, // Only active products
      }

      // Add category filter if provided
      if (categoryId) {
        where.categoryId = categoryId
      }

      // Add search filter if provided
      if (search) {
        where.name = {
          contains: search,
          mode: "insensitive",
        }
      }

      // Get products with pagination
      const maxLimit = limit || 50 // Default limit
      const products = await prisma.products.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          name: "asc",
        },
        take: maxLimit,
      })

      // Count total products in workspace
      const totalProducts = await prisma.products.count({
        where: { workspaceId, isActive: true },
      })

      // 💰 ANDREA'S LOGIC: Apply customer discount calculation
      let customerDiscount = 0
      let customerInfo = null

      if (customerId) {
        try {
          const customer = await prisma.customers.findUnique({
            where: { id: customerId },
            select: { discount: true, name: true, phone: true },
          })

          if (customer) {
            customerDiscount = customer.discount || 0
            customerInfo = {
              name: customer.name,
              discount: customerDiscount,
            }
            logger.info(
              `[GET-ALL-PRODUCTS] 👤 Customer found: ${customer.name}, discount: ${customerDiscount}%`
            )
          }
        } catch (customerError) {
          logger.error(
            `[GET-ALL-PRODUCTS] ❌ Error fetching customer:`,
            customerError
          )
        }
      }

      // Apply pricing calculation with Andrea's logic
      let finalProducts = products
      if (products.length > 0) {
        try {
          const { PriceCalculationService } = await import(
            "../../../application/services/price-calculation.service"
          )
          const priceService = new PriceCalculationService(prisma)

          const productIds = products.map((p) => p.id)
          const priceResult = await priceService.calculatePricesWithDiscounts(
            workspaceId,
            productIds,
            customerDiscount
          )

          // Merge price data with product data
          finalProducts = products.map((product) => {
            const priceData = priceResult.products.find(
              (p) => p.id === product.id
            )
            return {
              ...product,
              originalPrice: priceData?.originalPrice || product.price,
              finalPrice: priceData?.finalPrice || product.price,
              appliedDiscount: priceData?.appliedDiscount || 0,
              discountSource: priceData?.discountSource,
              discountName: priceData?.discountName,
            }
          })

          logger.info(
            `[GET-ALL-PRODUCTS] 💰 Andrea's Logic applied - Customer: ${customerDiscount}%, Best offer: ${priceResult.discountsApplied.bestOfferDiscount}%`
          )
        } catch (priceError) {
          logger.error(
            `[GET-ALL-PRODUCTS] ❌ Error calculating prices:`,
            priceError
          )
        }
      }

      // Format response for N8N with Andrea's pricing
      const formattedProducts = finalProducts.map((product: any) => {
        const hasDiscount = (product.appliedDiscount || 0) > 0
        const prezzoFinale = product.finalPrice || product.price
        const prezzoOriginale = product.originalPrice || product.price
        const scontoPercentuale = product.appliedDiscount || 0
        const scontoTipo = product.discountSource || null

        let formatted = `Prezzo: €${prezzoFinale.toFixed(2)}`
        if (hasDiscount) {
          formatted += ` (scontato del ${scontoPercentuale}%, prezzo pieno €${prezzoOriginale.toFixed(2)}`
          if (scontoTipo) formatted += `, fonte: ${scontoTipo}`
          formatted += ")"
        }

        return {
          id: product.id,
          name: product.name,
          ProductCode: product.ProductCode,
          description: product.description || "",
          price: prezzoFinale,
          originalPrice: prezzoOriginale,
          discountPercent: scontoPercentuale,
          discountSource: scontoTipo,
          formatted,
          stock: product.stock,
          category: product.category?.name || "Uncategorized",
          available: product.stock > 0,
          customerDiscount,
          bestDiscount: Math.max(customerDiscount, scontoPercentuale),
          discountApplied: hasDiscount ? scontoTipo : "none",
        }
      })

      logger.info(
        `[GET-ALL-PRODUCTS] ✅ Found ${formattedProducts.length} products with pricing applied (total in workspace: ${totalProducts})`
      )

      res.json({
        success: true,
        workspaceId,
        customerInfo,
        products: formattedProducts,
        summary: {
          found: formattedProducts.length,
          totalInWorkspace: totalProducts,
          filters: {
            categoryId: categoryId || null,
            search: search || null,
            limit: maxLimit,
          },
        },
        discountLogic: {
          customerDiscount,
          note: "Andrea's Logic: Highest discount wins",
          appliedLogic: customerId
            ? "customer_discount_considered"
            : "no_customer_provided",
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      logger.error("[GET-ALL-PRODUCTS] ❌ Error getting products:", error)
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    }
  }

  /**
   * 🛍️ GET ALL SERVICES - For N8N getAllServices Tool (Andrea's Request)
   * POST /internal/get-all-services
   * Returns all services for a workspace with customer discount logic applied
   * Enhanced with Andrea's "Highest Discount Wins" Logic for services
   */
  async getAllServices(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, customerId, search, limit } = req.body

      if (!workspaceId) {
        res.status(400).json({
          error: "Workspace ID is required",
          example: {
            workspaceId: "clzd8x8z20000356cqhpe6yu0",
            customerId: "optional",
          },
        })
        return
      }

      logger.info(
        `[GET-ALL-SERVICES] 🛍️ Andrea's getAllServices - Getting services for workspace ${workspaceId}, customerId: ${customerId}`
      )

      // Build filter conditions
      const where: any = {
        workspaceId,
        isActive: true, // Only active services
      }

      // Add search filter if provided
      if (search) {
        where.name = {
          contains: search,
          mode: "insensitive",
        }
      }

      // Get services with pagination
      const maxLimit = limit || 50 // Default limit
      const services = await prisma.services.findMany({
        where,
        orderBy: {
          name: "asc",
        },
        take: maxLimit,
      })

      // Count total services in workspace
      const totalServices = await prisma.services.count({
        where: { workspaceId, isActive: true },
      })

      // 💰 ANDREA'S LOGIC: Apply customer discount to services
      let customerDiscount = 0
      let customerInfo = null

      if (customerId) {
        try {
          const customer = await prisma.customers.findUnique({
            where: { id: customerId },
            select: { discount: true, name: true, phone: true },
          })

          if (customer) {
            customerDiscount = customer.discount || 0
            customerInfo = {
              name: customer.name,
              discount: customerDiscount,
            }
            logger.info(
              `[GET-ALL-SERVICES] 👤 Customer found: ${customer.name}, discount: ${customerDiscount}%`
            )
          }
        } catch (customerError) {
          logger.error(
            `[GET-ALL-SERVICES] ❌ Error fetching customer:`,
            customerError
          )
        }
      }

      // Apply Andrea's discount logic to services
      const formattedServices = services.map((service: any) => {
        const originalPrice = service.price || 0
        const serviceDiscount = service.discountPercent || 0

        // Andrea's Logic: Highest discount wins
        const bestDiscount = Math.max(customerDiscount, serviceDiscount)
        const discountSource =
          bestDiscount === customerDiscount && customerDiscount > 0
            ? "customer"
            : bestDiscount === serviceDiscount && serviceDiscount > 0
              ? "service"
              : "none"

        const finalPrice = originalPrice * (1 - bestDiscount / 100)
        const hasDiscount = bestDiscount > 0

        let formatted = `Prezzo: €${finalPrice.toFixed(2)}`
        if (hasDiscount) {
          formatted += ` (scontato del ${bestDiscount}%, prezzo pieno €${originalPrice.toFixed(2)}, fonte: ${discountSource})`
        }

        return {
          id: service.id,
          name: service.name,
          description: service.description || "",
          price: finalPrice,
          originalPrice,
          discountPercent: bestDiscount,
          discountSource,
          formatted,
          category: service.category || "Services",
          available: service.isActive,
          customerDiscount,
          serviceDiscount,
          bestDiscount,
          discountApplied: hasDiscount ? discountSource : "none",
        }
      })

      logger.info(
        `[GET-ALL-SERVICES] ✅ Found ${formattedServices.length} services with pricing applied (total in workspace: ${totalServices})`
      )

      res.json({
        success: true,
        workspaceId,
        customerInfo,
        services: formattedServices,
        summary: {
          found: formattedServices.length,
          totalInWorkspace: totalServices,
          filters: {
            search: search || null,
            limit: maxLimit,
          },
        },
        discountLogic: {
          customerDiscount,
          note: "Andrea's Logic: Highest discount wins (applied to services)",
          appliedLogic: customerId
            ? "customer_discount_considered"
            : "no_customer_provided",
        },
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      logger.error("[GET-ALL-SERVICES] ❌ Error getting services:", error)
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      })
    }
  }

  /**
   * POST /internal/contact-operator
   * Disattiva il chatbot per il cliente e segnala richiesta operatore
   */
  async contactOperator(req: Request, res: Response): Promise<void> {
    try {
      const { phone, workspaceId } = req.body
      if (!phone || !workspaceId) {
        res.status(400).json({
          error: "Missing required fields: phone, workspaceId",
        })
        return
      }
      logger.info(
        `[CONTACT-OPERATOR] Request for phone: ${phone}, workspace: ${workspaceId}`
      )
      const customer = await prisma.customers.findFirst({
        where: { phone, workspaceId },
      })
      if (!customer) {
        res.status(404).json({ error: "Customer not found" })
        return
      }
      await prisma.customers.update({
        where: { id: customer.id },
        data: { activeChatbot: false },
      })
      logger.info(
        `[CONTACT-OPERATOR] Chatbot deactivated for customer ${customer.id}`
      )
      res.json({
        success: true,
        message:
          "Certo, verrà contattato il prima possibile dal nostro operatore.",
      })
    } catch (error: any) {
      logger.error("[CONTACT-OPERATOR] Error:", error)
      res
        .status(500)
        .json({ error: "Internal server error", message: error.message })
    }
  }

  /**
   * Get All Categories (PRD Implementation)
   */
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, workspaceId, customerId, message } = req.body

      if (!workspaceId || !message) {
        res.status(400).json({
          error: "Missing required fields: workspaceId, message",
        })
        return
      }

      logger.info(
        `[INTERNAL_API] Getting categories for workspace ${workspaceId}`
      )

      const result = await getAllCategories({
        workspaceId,
        customerId,
        message,
        phoneNumber, // opzionale, passato solo se presente
      })

      res.json({
        success: true,
        total_categories: result.totalCategories,
        categories: result.categories,
        response_message: result.response,
      })
    } catch (error) {
      logger.error("[INTERNAL_API] Error getting categories:", error)
      res.status(500).json({
        error: "Internal server error getting categories",
      })
    }
  }

  /**
   * POST /internal/get-active-offers
   * Get all active offers for a workspace with customer discount calculation
   * 💰 Andrea's Logic: Considers customer discount vs offer discount (highest wins)
   */
  async getActiveOffers(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, customerId } = req.body

      if (!workspaceId) {
        res.status(400).json({ error: "workspaceId is required" })
        return
      }

      logger.info(
        `[INTERNAL_API] 💰 Getting active offers for workspace ${workspaceId}, customerId: ${customerId || "none"}`
      )

      // 💰 Get customer discount if customerId provided (Andrea's Logic)
      let customerDiscount = 0
      let customerInfo = null
      if (customerId) {
        try {
          const customer = await prisma.customers.findUnique({
            where: { id: customerId },
            select: { discount: true, name: true, phone: true },
          })

          if (customer) {
            customerDiscount = customer.discount || 0
            customerInfo = customer
            logger.info(
              `[GET-ACTIVE-OFFERS] 👤 Customer found: ${customer.name} with ${customerDiscount}% discount`
            )
          } else {
            logger.warn(
              `[GET-ACTIVE-OFFERS] ⚠️ Customer not found for ID: ${customerId}`
            )
          }
        } catch (customerError) {
          logger.error(
            `[GET-ACTIVE-OFFERS] ❌ Error fetching customer:`,
            customerError
          )
          // Continue with 0% discount if customer fetch fails
        }
      } else {
        logger.info(
          `[GET-ACTIVE-OFFERS] ⚪ No customerId provided, using 0% discount`
        )
      }

      // Get current date
      const now = new Date()

      // Find all active offers for the workspace
      const activeOffers = await prisma.offers.findMany({
        where: {
          workspaceId: workspaceId,
          isActive: true,
          startDate: {
            lte: now,
          },
          endDate: {
            gte: now,
          },
        },
        include: {
          category: true,
          categories: true,
        },
        orderBy: {
          discountPercent: "desc", // Show highest discounts first
        },
      })

      logger.info(
        `[GET-ACTIVE-OFFERS] Found ${activeOffers.length} active offers`
      )

      // 💰 Andrea's Logic: Calculate which discount is better for each offer
      const formattedOffers = activeOffers.map((offer) => {
        const categoryNames = []

        // Add single category if exists
        if (offer.category) {
          categoryNames.push(offer.category.name)
        }

        // Add multiple categories if exist
        if (offer.categories && offer.categories.length > 0) {
          categoryNames.push(...offer.categories.map((cat) => cat.name))
        }

        // Remove duplicates
        const uniqueCategories = [...new Set(categoryNames)]

        // 🎯 ANDREA'S DISCOUNT LOGIC: Compare customer vs offer discount
        const offerDiscount = offer.discountPercent || 0
        const bestDiscount = Math.max(customerDiscount, offerDiscount)
        const discountSource =
          bestDiscount === customerDiscount ? "customer" : "offer"

        // Only show the offer if it provides better discount than customer discount
        const isOfferBetterThanCustomer = offerDiscount > customerDiscount

        logger.info(
          `[GET-ACTIVE-OFFERS] Offer "${offer.name}": customer ${customerDiscount}% vs offer ${offerDiscount}% → best: ${bestDiscount}% (${discountSource})`
        )

        return {
          id: offer.id,
          name: offer.name,
          description: offer.description,
          discountPercent: offer.discountPercent,
          customerDiscount: customerDiscount,
          bestDiscount: bestDiscount,
          discountSource: discountSource,
          isOfferBetterThanCustomer: isOfferBetterThanCustomer,
          startDate: offer.startDate,
          endDate: offer.endDate,
          categories:
            uniqueCategories.length > 0
              ? uniqueCategories
              : ["Tutte le categorie"],
          isForAllCategories: uniqueCategories.length === 0,
        }
      })

      // 🎯 Filter offers: only show offers that are better than customer discount
      const relevantOffers = formattedOffers.filter(
        (offer) => offer.isOfferBetterThanCustomer
      )

      logger.info(
        `[GET-ACTIVE-OFFERS] 💰 Of ${formattedOffers.length} total offers, ${relevantOffers.length} are better than customer discount of ${customerDiscount}%`
      )

      // Create response message with Andrea's Logic
      let responseMessage = ""
      if (customerInfo) {
        responseMessage += `👤 **Cliente: ${customerInfo.name}** (Sconto personale: ${customerDiscount}%)\n\n`
      }

      if (relevantOffers.length === 0) {
        if (customerDiscount > 0) {
          responseMessage += `🎯 Non ci sono offerte migliori del tuo sconto personale del ${customerDiscount}%.\n`
          responseMessage += `💰 Tutti i prodotti hanno già il tuo sconto applicato!`
        } else {
          responseMessage += "🚫 Non ci sono offerte attive al momento."
        }
      } else {
        responseMessage += `🎉 **Offerte migliori del tuo sconto personale (${customerDiscount}%):**\n\n`
        relevantOffers.forEach((offer) => {
          const categoriesText = offer.isForAllCategories
            ? "su tutti i prodotti"
            : `sulle categorie: ${offer.categories.join(", ")}`

          const additionalDiscount = offer.discountPercent - customerDiscount

          responseMessage += `✨ **${offer.name}** - ${offer.discountPercent}% di sconto ${categoriesText}\n`
          responseMessage += `💰 Risparmio extra: +${additionalDiscount}% rispetto al tuo sconto personale\n`
          responseMessage += `📝 ${offer.description}\n`
          responseMessage += `📅 Valida fino al ${offer.endDate.toLocaleDateString("it-IT")}\n\n`
        })
      }

      res.json({
        success: true,
        customerInfo: customerInfo
          ? {
              name: customerInfo.name,
              discount: customerDiscount,
            }
          : null,
        total_offers: activeOffers.length,
        relevant_offers: relevantOffers.length,
        offers: relevantOffers, // Only return offers better than customer discount
        all_offers: formattedOffers, // All offers for debugging/admin
        response_message: responseMessage,
        discountLogic: {
          customerDiscount,
          note: "Only showing offers better than customer discount",
          appliedLogic: "Andrea's highest discount wins logic",
        },
      })
    } catch (error) {
      logger.error("[INTERNAL_API] Error getting active offers:", error)
      res.status(500).json({
        error: "Internal server error getting active offers",
      })
    }
  }

  /**
   * GET /internal/get-cf-services
   * Get complete list of Cloudflare services and functions
   */
  async getCFServices(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.body

      if (!workspaceId) {
        res.status(400).json({ error: "workspaceId is required" })
        return
      }

      logger.info(
        `[INTERNAL_API] Getting CF services list for workspace ${workspaceId}`
      )

      // Define the complete CF services list
      const cfServices = [
        {
          id: 1,
          name: "SearchRag",
          status: "✅ IMPLEMENTATA",
          endpoint: "CF/SearchRag",
          description:
            "Ricerca semantica unificata tra prodotti, FAQ, servizi e documenti",
          category: "Search & Discovery",
        },
        {
          id: 2,
          name: "GetAllProducts",
          status: "✅ IMPLEMENTATA",
          endpoint: "CF/GetAllProducts",
          description: "Restituisce lista completa prodotti del workspace",
          category: "Product Management",
        },
        {
          id: 3,
          name: "GetAllServices",
          status: "✅ IMPLEMENTATA",
          endpoint: "CF/GetAllServices",
          description: "Restituisce lista completa servizi del workspace",
          category: "Service Management",
        },
        {
          id: 4,
          name: "CallOperator",
          status: "⚠️ QUASI COMPLETA (90%)",
          endpoint: "CF/CallOperator",
          description: "Attiva controllo manuale operatore",
          category: "Support & Assistance",
        },
        {
          id: 5,
          name: "ReceiveInvoice",
          status: "❌ DA IMPLEMENTARE",
          endpoint: "CF/ReceiveInvoice",
          description: "Gestisce richieste fatture con filtro codice ordine",
          category: "Financial Operations",
        },
        {
          id: 6,
          name: "PaymentProcessStart",
          status: "❌ IN TODO",
          endpoint: "CF/PaymentProcessStart",
          description: "Avvia processo di pagamento per ordini",
          category: "Payment Processing",
        },
        {
          id: 7,
          name: "GetActiveOffers",
          status: "✅ IMPLEMENTATA",
          endpoint: "CF/GetActiveOffers",
          description: "Restituisce tutte le offerte e sconti attivi",
          category: "Promotions & Offers",
        },
      ]

      // Group services by category
      const servicesByCategory = cfServices.reduce(
        (acc, service) => {
          if (!acc[service.category]) {
            acc[service.category] = []
          }
          acc[service.category].push(service)
          return acc
        },
        {} as Record<string, typeof cfServices>
      )

      // Calculate statistics
      const totalServices = cfServices.length
      const implementedServices = cfServices.filter((s) =>
        s.status.includes("✅")
      ).length
      const partialServices = cfServices.filter((s) =>
        s.status.includes("⚠️")
      ).length
      const missingServices = cfServices.filter((s) =>
        s.status.includes("❌")
      ).length

      // Create formatted response message
      let responseMessage =
        "🔧 **LISTA COMPLETA FUNZIONI CF (CALLING FUNCTIONS)**\n\n"
      responseMessage += `📊 **Statistiche:**\n`
      responseMessage += `• Totale servizi: ${totalServices}\n`
      responseMessage += `• ✅ Implementati: ${implementedServices}\n`
      responseMessage += `• ⚠️ Parziali: ${partialServices}\n`
      responseMessage += `• ❌ Mancanti: ${missingServices}\n\n`

      // Add services by category
      Object.entries(servicesByCategory).forEach(([category, services]) => {
        responseMessage += `## 📂 ${category}\n\n`
        services.forEach((service) => {
          responseMessage += `### ${service.status} **${service.name}**\n`
          responseMessage += `📍 **Endpoint**: \`${service.endpoint}\`\n`
          responseMessage += `📝 **Descrizione**: ${service.description}\n\n`
        })
      })

      responseMessage += `---\n\n`
      responseMessage += `💡 **Nota**: Le funzioni CF sono strumenti intelligenti che il chatbot utilizza per processare richieste specifiche degli utenti.`

      res.json({
        success: true,
        total_services: totalServices,
        implemented: implementedServices,
        partial: partialServices,
        missing: missingServices,
        services: cfServices,
        services_by_category: servicesByCategory,
        response_message: responseMessage,
      })
    } catch (error) {
      logger.error("[INTERNAL_API] Error getting CF services:", error)
      res.status(500).json({
        error: "Internal server error getting CF services",
      })
    }
  }

  /**
   * Translate query to English for better semantic search results
   * Since embeddings work better with consistent language
   * Supports: Italian, Spanish, French, Portuguese
   */
  private async translateQueryToEnglish(
    query: string,
    customerLanguage: string
  ): Promise<string> {
    // Auto-detect if query is already in English by checking common Italian/Spanish/Portuguese words
    const italianWords =
      /\b(qual|quale|come|dove|quando|perché|cosa|che|dei|della|delle|del|per|con|una|uno|è|sono|hai|avete|posso|puoi|può)\b/i
    const spanishWords =
      /\b(qué|cuál|cómo|dónde|cuándo|por qué|para|con|una|uno|es|son|tienes|tienen|puedo|puedes|puede)\b/i
    const frenchWords =
      /\b(qu'est|quel|quelle|comment|où|quand|pourquoi|pour|avec|une|un|est|sont|avez|peux|peut)\b/i
    const portugueseWords =
      /\b(qual|quais|como|onde|quando|por que|para|com|uma|um|é|são|tem|têm|posso|pode|você)\b/i

    // If query contains non-English words, translate it
    const needsTranslation =
      italianWords.test(query) ||
      spanishWords.test(query) ||
      frenchWords.test(query) ||
      portugueseWords.test(query)

    if (!needsTranslation) {
      return query
    }

    try {
      logger.info(
        `[RAG-TRANSLATE] Translating "${query}" from ${customerLanguage} to English`
      )

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemma-2-9b-it:free", // Fast, free model for translation
            messages: [
              {
                role: "system",
                content:
                  "You are a translator. Translate the user's query to English. Return ONLY the translated text, no explanations.",
              },
              {
                role: "user",
                content: `Translate this to English: "${query}"`,
              },
            ],
            max_tokens: 100,
            temperature: 0.1,
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        const translatedQuery =
          data.choices[0]?.message?.content?.trim() || query
        logger.info(`[RAG-TRANSLATE] Translation result: "${translatedQuery}"`)
        return translatedQuery
      } else {
        logger.warn(`[RAG-TRANSLATE] Translation failed, using original query`)
        return query
      }
    } catch (error) {
      logger.error(`[RAG-TRANSLATE] Translation error:`, error)
      return query // Fallback to original query
    }
  }

  /**
   * Translate English response back to customer's language
   * Used to translate FAQ answers and other content back to Italian/Spanish/French/Portuguese
   */
  private async translateResponseToCustomerLanguage(
    text: string,
    targetLanguage: string
  ): Promise<string> {
    // If target language is English or not specified, return original text
    if (
      !targetLanguage ||
      targetLanguage.toLowerCase() === "en" ||
      targetLanguage.toLowerCase() === "english"
    ) {
      return text
    }

    // Don't translate if text is too short (likely not meaningful content)
    if (text.length < 10) {
      return text
    }

    try {
      logger.info(
        `[RESPONSE-TRANSLATE] Translating response to ${targetLanguage}: "${text.substring(0, 50)}..."`
      )

      // Map language codes to full language names
      const languageMap: { [key: string]: string } = {
        it: "Italian",
        italian: "Italian",
        italiano: "Italian",
        es: "Spanish",
        spanish: "Spanish",
        español: "Spanish",
        fr: "French",
        french: "French",
        français: "French",
        pt: "Portuguese",
        portuguese: "Portuguese",
        português: "Portuguese",
        "pt-br": "Brazilian Portuguese",
        "pt-pt": "Portuguese",
      }

      const fullLanguageName =
        languageMap[targetLanguage.toLowerCase()] || targetLanguage

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemma-2-9b-it:free",
            messages: [
              {
                role: "system",
                content: `You are a translator. Translate the text to ${fullLanguageName}. Return ONLY the translated text, no explanations. Keep the same tone and format.`,
              },
              {
                role: "user",
                content: `Translate this to ${fullLanguageName}: "${text}"`,
              },
            ],
            max_tokens: 200,
            temperature: 0.1,
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        const translatedText = data.choices[0]?.message?.content?.trim() || text
        logger.info(
          `[RESPONSE-TRANSLATE] Translation result: "${translatedText.substring(0, 50)}..."`
        )
        return translatedText
      } else {
        logger.warn(
          `[RESPONSE-TRANSLATE] Translation failed, using original text`
        )
        return text
      }
    } catch (error) {
      logger.error(`[RESPONSE-TRANSLATE] Translation error:`, error)
      return text // Fallback to original text
    }
  }

  /**
   * 🔐 VALIDATE SECURE TOKEN
   * Validates token for public links (checkout, invoice, cart, etc.)
   */
  async validateSecureToken(req: Request, res: Response): Promise<void> {
    try {
      const { token, type, workspaceId } = req.body

      if (!token) {
        res.status(400).json({
          valid: false,
          error: "Token is required",
        })
        return
      }

      // Validate token using SecureTokenService with workspace isolation
      const validation = await this.secureTokenService.validateToken(
        token,
        type,
        workspaceId
      )

      if (!validation.valid) {
        res.status(401).json({
          valid: false,
          error: "Invalid or expired token",
        })
        return
      }

      // Check workspace match if provided
      if (workspaceId && validation.data?.workspaceId !== workspaceId) {
        res.status(403).json({
          valid: false,
          error: "Token workspace mismatch",
        })
        return
      }

      logger.info(
        `[VALIDATE-TOKEN] ✅ Token validated successfully for type: ${type || "any"}`
      )

      res.status(200).json({
        valid: true,
        data: {
          tokenId: validation.data?.id,
          type: validation.data?.type,
          workspaceId: validation.data?.workspaceId,
          userId: validation.data?.userId,
          phoneNumber: validation.data?.phoneNumber,
          expiresAt: validation.data?.expiresAt,
          createdAt: validation.data?.createdAt,
        },
        payload: validation.payload,
      })
    } catch (error) {
      logger.error("[VALIDATE-TOKEN] Error validating secure token:", error)
      res.status(500).json({
        valid: false,
        error: "Internal server error during token validation",
      })
    }
  }

  /**
   * 🧾 GET CUSTOMER INVOICES BY TOKEN
   * Retrieves customer invoices using a secure token
   */
  async getCustomerInvoicesByToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params

      if (!token) {
        res.status(400).json({
          success: false,
          error: "Token is required",
        })
        return
      }

      // Validate invoice token with workspace isolation
      const validation = await this.secureTokenService.validateToken(
        token,
        "invoice",
        undefined // workspaceId will be extracted from token payload
      )

      if (!validation.valid) {
        res.status(401).json({
          success: false,
          error: "Invalid or expired invoice token",
        })
        return
      }

      const { customerId, workspaceId } = validation.payload || {}

      if (!customerId || !workspaceId) {
        res.status(400).json({
          success: false,
          error: "Invalid token payload",
        })
        return
      }

      logger.info(
        `[INVOICES] 📋 Fetching invoices for customer ${customerId} in workspace ${workspaceId}`
      )

      // Get customer info
      const customer = await this.prisma.customers.findFirst({
        where: {
          id: customerId,
          workspaceId: workspaceId,
        },
        include: {
          workspace: true,
        },
      })

      if (!customer) {
        res.status(404).json({
          success: false,
          error: "Customer not found",
        })
        return
      }

      // Get customer orders that can be converted to invoices
      const orders = await this.prisma.orders.findMany({
        where: {
          customerId: customerId,
          workspaceId: workspaceId,
          status: {
            in: ["DELIVERED"], // Only DELIVERED is a valid completed status
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      // Convert orders to invoice format
      const invoices = orders.map((order) => ({
        id: order.id,
        number: `INV-${order.id.slice(-8).toUpperCase()}`,
        date: order.createdAt,
        amount: order.totalAmount,
        status:
          order.status === "DELIVERED"
            ? "paid"
            : order.status === "PENDING"
              ? "pending"
              : "overdue",
        items: order.items.map((item) => ({
          description: item.product?.name || "Prodotto",
          quantity: item.quantity,
          unitPrice: item.product?.price ?? 0,
          amount: ((item.quantity ?? 1) * (item.product?.price ?? 0)).toFixed(
            2
          ),
        })),
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
      }))

      // Calculate summary
      const summary = {
        totalInvoices: invoices.length,
        totalPaid: invoices
          .filter((inv) => inv.status === "paid")
          .reduce((sum, inv) => sum + inv.amount, 0)
          .toFixed(2),
        totalPending: invoices
          .filter((inv) => inv.status === "pending")
          .reduce((sum, inv) => sum + inv.amount, 0)
          .toFixed(2),
        totalOverdue: invoices
          .filter((inv) => inv.status === "overdue")
          .reduce((sum, inv) => sum + inv.amount, 0)
          .toFixed(2),
      }

      logger.info(
        `[INVOICES] ✅ Found ${invoices.length} invoices for customer ${customer.name}`
      )

      res.status(200).json({
        success: true,
        data: {
          customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          },
          workspace: {
            id: customer.workspace.id,
            name: customer.workspace.name,
          },
          invoices,
          summary,
          tokenInfo: {
            type: "invoice",
            expiresAt: validation.data?.expiresAt,
            issuedAt: validation.data?.createdAt,
          },
        },
      })
    } catch (error) {
      logger.error("[INVOICES] Error fetching customer invoices:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error",
      })
    }
  }

  /**
   * POST /internal/create-order
   * Crea un ordine via N8N Custom Function
   * Body: { workspaceId, customerId, items?, totalAmount?, notes? }
   */
  async createOrderInternal(req: Request, res: Response): Promise<void> {
    try {
      // Log completo del payload ricevuto per debug (formato migliorato)
      logger.info(
        `[CREATE-ORDER] DEBUG PAYLOAD: ${JSON.stringify(req.body, null, 2)}`
      )

      // Log completo del payload ricevuto per debug
      logger.info(
        `[CREATE-ORDER] Received payload: ${JSON.stringify(req.body)}`
      )

      // Estrai i dati dagli arguments se il payload è in formato function call
      let orderData = req.body
      if (req.body.function_call && req.body.function_call.arguments) {
        try {
          // Parsing degli arguments da stringa JSON a oggetto
          orderData = JSON.parse(req.body.function_call.arguments)
          logger.info(
            `[CREATE-ORDER] Extracted order data from function_call.arguments: ${JSON.stringify(orderData, null, 2)}`
          )
        } catch (parseError) {
          logger.error(
            `[CREATE-ORDER] Error parsing function_call.arguments: ${parseError}`
          )
        }
      }

      const {
        workspaceId,
        customerId,
        customerid,
        items,
        totalAmount,
        notes,
        shippingAddress,
        billingAddress,
      } = orderData
      // Supporta sia customerId che customerid per compatibilità con N8N
      const finalCustomerId = customerId || customerid

      if (!workspaceId || !finalCustomerId) {
        res.status(400).json({
          success: false,
          error: "workspaceId e customerId sono obbligatori",
          example: {
            workspaceId: "clzd8x8z20000356cqhpe6yu0",
            customerId: "cus_123456",
          },
        })
        return
      }

      logger.info(
        `[CREATE-ORDER] Creating order for customer ${finalCustomerId} in workspace ${workspaceId}`
      )

      // Verifica che il customer esista, altrimenti crea un customer temporaneo per testing
      let customer = await this.prisma.customers.findFirst({
        where: {
          OR: [{ id: finalCustomerId }, { phone: req.body.customerPhone }],
          workspaceId: workspaceId,
        },
      })

      if (!customer) {
        logger.info(
          `[CREATE-ORDER] Customer ${finalCustomerId} not found, creating temporary customer for ProductCode testing...`
        )

        try {
          // Crea un customer temporaneo per permettere il testing del ProductCode
          customer = await this.prisma.customers.create({
            data: {
              name: `Test Customer ${finalCustomerId}`,
              phone: req.body.customerPhone || "+393401234567",
              email: `${finalCustomerId}@test.local`,
              workspaceId: workspaceId,
              activeChatbot: true,
              isBlacklisted: false,
              discount: 0,
            },
          })
          logger.info(
            `[CREATE-ORDER] Created temporary customer: ${customer.name} (${customer.id})`
          )
        } catch (createError) {
          logger.error(
            `[CREATE-ORDER] Failed to create customer, trying to find any existing customer in workspace...`
          )

          // Fallback: usa qualsiasi customer esistente nel workspace
          customer = await this.prisma.customers.findFirst({
            where: { workspaceId: workspaceId },
          })

          if (!customer) {
            res.status(404).json({
              success: false,
              error:
                "No customer found in workspace and cannot create new customer",
              workspaceId: workspaceId,
              requestedCustomerId: finalCustomerId,
              createError: createError.message,
            })
            return
          }

          logger.info(
            `[CREATE-ORDER] Using existing customer: ${customer.name} (${customer.id})`
          )
        }
      }

      // Genera un orderCode univoco
      const orderCode = await this.generateOrderCode()

      // Se non ci sono items specifici, crea un ordine placeholder
      let orderItems = items || []
      let finalTotalAmount = totalAmount || 0

      // Se non ci sono items, crea un ordine vuoto con importo 0
      if (!orderItems || orderItems.length === 0) {
        logger.info(
          `[CREATE-ORDER] Creating empty order for customer ${customer.name}`
        )
        finalTotalAmount = 0
        orderItems = []
      }

      // Risolvi ProductCode in productId per ogni item
      const resolvedOrderItems = []
      for (const item of orderItems) {
        let productId = item.productId || null
        let serviceId = item.serviceId || null
        let unitPrice = item.unitPrice || 0

        let foundProduct = null
        let foundService = null

        // Enhanced debugging for each item
        logger.debug(
          `[CREATE-ORDER] Processing item: ${JSON.stringify(item, null, 2)}`
        )

        // Support both 'id' and 'productCode' fields from N8N
        const itemId = item.id || item.productCode || item.serviceId

        // Support both 'type' and 'itemType' fields for backward compatibility
        const itemType = item.type || item.itemType

        if (
          itemType === "product" ||
          itemType === "PRODUCT" ||
          (!itemType && itemId)
        ) {
          // Cerca prodotto per ProductCode, sku o id
          foundProduct = await this.prisma.products.findFirst({
            where: {
              OR: [{ ProductCode: itemId }, { sku: itemId }, { id: itemId }],
              workspaceId: workspaceId,
              status: "ACTIVE",
            },
          })

          if (foundProduct) {
            productId = foundProduct.id
            unitPrice = unitPrice || foundProduct.price
            logger.info(
              `[CREATE-ORDER] Product found: ${foundProduct.name} (ProductCode: ${foundProduct.ProductCode}) -> ${foundProduct.id}`
            )
          } else {
            logger.warn(
              `[CREATE-ORDER] Product not found for ID/ProductCode: ${itemId}`
            )
          }
        } else if (itemType === "service" || itemType === "SERVICE") {
          // Cerca servizio per id o name
          foundService = await this.prisma.services.findFirst({
            where: {
              OR: [{ id: itemId }, { name: item.name }],
              workspaceId: workspaceId,
              isActive: true,
            },
          })

          if (foundService) {
            serviceId = foundService.id
            unitPrice = unitPrice || foundService.price
            logger.info(
              `[CREATE-ORDER] Service found: ${foundService.name} -> ${foundService.id}`
            )
          } else {
            logger.warn(`[CREATE-ORDER] Service not found for ID: ${itemId}`)
          }
        }

        resolvedOrderItems.push({
          itemType:
            itemType === "product" || itemType === "PRODUCT"
              ? "PRODUCT"
              : itemType === "service" || itemType === "SERVICE"
                ? "SERVICE"
                : "PRODUCT",
          quantity: item.quantity || 1,
          unitPrice: unitPrice,
          totalPrice: (item.quantity || 1) * unitPrice,
          productId: productId,
          serviceId: serviceId,
          productVariant: itemId
            ? {
                originalId: itemId,
                ProductCode: foundProduct?.ProductCode || itemId,
                name:
                  item.name || foundProduct?.name || foundService?.name || null,
              }
            : null,
        })

        // Aggiorna il totale con i prezzi reali
        finalTotalAmount += (item.quantity || 1) * unitPrice
      }

      // Crea l'ordine reale nel database
      const order = await this.prisma.orders.create({
        data: {
          orderCode,
          status: "PENDING",
          totalAmount: finalTotalAmount,
          shippingAmount: 0,
          taxAmount: 0,
          discountAmount: 0,
          shippingAddress: shippingAddress || null,
          billingAddress: billingAddress || null,
          notes: notes || `Ordine creato tramite N8N per ${customer.name}`,
          customerId: customer.id, // Usa l'ID del customer effettivo trovato/creato
          workspaceId: workspaceId,
          items: {
            create: resolvedOrderItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
              service: true,
            },
          },
          customer: true,
        },
      })

      logger.info(
        `[CREATE-ORDER] ✅ Order created successfully: ${orderCode} for customer ${customer.name}`
      )

      res.status(200).json({
        DEBUG_PAYLOAD: req.body,
        success: true,
        message: `Ordine creato per ${customer.name} in workspace ${workspaceId}`,
        workspaceId,
        customerId: finalCustomerId,
        order: {
          id: order.id,
          orderCode: order.orderCode,
          status: order.status,
          totalAmount: order.totalAmount,
          itemsCount: order.items.length,
          customerName: customer.name,
          createdAt: order.createdAt,
        },
      })
    } catch (error) {
      logger.error("[CREATE-ORDER] ❌ Errore creazione ordine:", error)
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  /**
   * Generate unique order code (same logic as checkout controller)
   */
  private async generateOrderCode(): Promise<string> {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")

    // Find the last order of today
    const lastOrder = await this.prisma.orders.findFirst({
      where: {
        orderCode: {
          startsWith: `ORD-${dateStr}-`,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    let sequence = 1
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderCode.split("-")[2])
      sequence = lastSequence + 1
    }

    return `ORD-${dateStr}-${sequence.toString().padStart(3, "0")}`
  }

  /**
   * 📦 GET CUSTOMER ORDERS BY TOKEN
   * Returns orders list for a customer using a secure token (type: 'orders')
   */
  async getCustomerOrdersByToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params
      if (!token) {
        res.status(400).json({ success: false, error: "Token is required" })
        return
      }

      const validation = await this.secureTokenService.validateToken(token, "orders")
      if (!validation.valid) {
        res.status(401).json({ success: false, error: "Invalid or expired orders token" })
        return
      }

      const { customerId, workspaceId } = validation.payload || {}
      if (!customerId || !workspaceId) {
        res.status(400).json({ success: false, error: "Invalid token payload" })
        return
      }

      const customer = await this.prisma.customers.findFirst({
        where: { id: customerId, workspaceId },
        include: { workspace: true },
      })
      if (!customer) {
        res.status(404).json({ success: false, error: "Customer not found" })
        return
      }

      const orders = await this.prisma.orders.findMany({
        where: { customerId, workspaceId },
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
        invoiceUrl: `/api/internal/orders/${o.orderCode}/invoice?token=${token}`,
        ddtUrl: `/api/internal/orders/${o.orderCode}/ddt?token=${token}`,
      }))

      res.status(200).json({
        success: true,
        data: {
          customer: { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email },
          workspace: { id: customer.workspace.id, name: customer.workspace.name },
          orders: mapped,
          tokenInfo: { type: "orders", expiresAt: validation.data?.expiresAt, issuedAt: validation.data?.createdAt },
        },
      })
    } catch (error) {
      logger.error("[ORDERS] Error fetching customer orders:", error)
      res.status(500).json({ success: false, error: "Internal server error" })
    }
  }

  /**
   * 📦 GET ORDER DETAIL BY TOKEN
   * Returns a single order detail if the token is valid for the same customer/workspace
   */
  async getOrderDetailByToken(req: Request, res: Response): Promise<void> {
    try {
      const { token, orderCode } = req.params as { token: string; orderCode: string }
      if (!token || !orderCode) {
        res.status(400).json({ success: false, error: "Token and orderCode are required" })
        return
      }

      const validation = await this.secureTokenService.validateToken(token, "orders")
      if (!validation.valid) {
        res.status(401).json({ success: false, error: "Invalid or expired orders token" })
        return
      }

      const { customerId, workspaceId } = validation.payload || {}
      if (!customerId || !workspaceId) {
        res.status(400).json({ success: false, error: "Invalid token payload" })
        return
      }

      // Optional: if token payload restricts to a specific orderCode
      if (validation.payload?.orderCode && validation.payload.orderCode !== orderCode) {
        res.status(403).json({ success: false, error: "Token not authorized for this order" })
        return
      }

      const order = await this.prisma.orders.findFirst({
        where: { orderCode, customerId, workspaceId },
        include: {
          items: { include: { product: true, service: true } },
          customer: true,
        },
      })

      if (!order) {
        res.status(404).json({ success: false, error: "Order not found" })
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
            invoiceUrl: `/api/internal/orders/${order.orderCode}/invoice?token=${token}`,
            ddtUrl: `/api/internal/orders/${order.orderCode}/ddt?token=${token}`,
          },
          customer: { id: order.customer.id, name: order.customer.name },
          tokenInfo: { type: "orders", expiresAt: validation.data?.expiresAt, issuedAt: validation.data?.createdAt },
        },
      })
    } catch (error) {
      logger.error("[ORDERS] Error fetching order detail:", error)
      res.status(500).json({ success: false, error: "Internal server error" })
    }
  }

  /**
   * 🧾 DOWNLOAD INVOICE (stub)
   */
  async downloadInvoiceByOrderCode(req: Request, res: Response): Promise<void> {
    try {
      const { orderCode } = req.params
      const { token } = req.query as { token?: string }
      if (!token) {
        res.status(400).json({ success: false, error: "Token required" })
        return
      }
      const validation = await this.secureTokenService.validateToken(token, "orders")
      if (!validation.valid) {
        res.status(401).json({ success: false, error: "Invalid or expired token" })
        return
      }
      // TODO: return real PDF stream; for now return JSON with placeholder
      res.status(501).json({ success: false, error: "Invoice download not implemented yet" })
    } catch (error) {
      logger.error("[ORDERS] Error downloading invoice:", error)
      res.status(500).json({ success: false, error: "Internal server error" })
    }
  }

  /**
   * 📄 DOWNLOAD DDT (stub)
   */
  async downloadDdtByOrderCode(req: Request, res: Response): Promise<void> {
    try {
      const { orderCode } = req.params
      const { token } = req.query as { token?: string }
      if (!token) {
        res.status(400).json({ success: false, error: "Token required" })
        return
      }
      const validation = await this.secureTokenService.validateToken(token, "orders")
      if (!validation.valid) {
        res.status(401).json({ success: false, error: "Invalid or expired token" })
        return
      }
      res.status(501).json({ success: false, error: "DDT download not implemented yet" })
    } catch (error) {
      logger.error("[ORDERS] Error downloading DDT:", error)
      res.status(500).json({ success: false, error: "Internal server error" })
    }
  }
}
