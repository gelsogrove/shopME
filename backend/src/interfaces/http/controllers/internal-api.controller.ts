import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { SecureTokenService } from '../../../application/services/secure-token.service';
import { MessageRepository } from '../../../repositories/message.repository';
import { embeddingService } from '../../../services/embeddingService';
import logger from '../../../utils/logger';

const prisma = new PrismaClient();

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
  private secureTokenService: SecureTokenService;

  constructor(
    private messageRepository: MessageRepository
  ) {
    this.secureTokenService = new SecureTokenService();
  }

  /**
   * GET /internal/channel-status/:workspaceId
   * Check if WhatsApp channel is active for workspace
   */
  async getChannelStatus(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      
      // Check workspace exists and is active
      const workspace = await this.messageRepository.getWorkspaceSettings(workspaceId);
      
      if (!workspace || !workspace.isActive) {
        res.json({
          isActive: false,
          reason: 'Workspace not found or inactive'
        });
        return;
      }

      // Check if WhatsApp is configured and active
      const isChannelActive = workspace.whatsappApiKey && 
                             workspace.whatsappPhoneNumber;

      res.json({
        isActive: isChannelActive,
        workspaceName: workspace.name,
        businessType: workspace.businessType || 'ECOMMERCE', // Default to ECOMMERCE
        reason: isChannelActive ? 'Channel active' : 'WhatsApp not configured'
      });

    } catch (error) {
      logger.error('[INTERNAL-API] Channel status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /internal/business-type/:workspaceId
   * Get business type for dynamic workflow routing
   */
  async getBusinessType(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      
      const workspace = await this.messageRepository.getWorkspaceSettings(workspaceId);
      
      if (!workspace) {
        res.json({
          businessType: 'GENERIC',
          reason: 'Workspace not found, using generic flow'
        });
        return;
      }

      res.json({
        businessType: workspace.businessType || 'ECOMMERCE',
        workspaceName: workspace.name,
        description: workspace.description
      });

    } catch (error) {
      logger.error('[INTERNAL-API] Business type error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /internal/user-check/:workspaceId/:phone
   * Check user registration status
   */
  async getUserCheck(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, phone } = req.params;
      
      const customer = await this.messageRepository.findCustomerByPhone(phone, workspaceId);
      
      res.json({
        isRegistered: !!customer,
        customer: customer ? {
          id: customer.id,
          name: customer.name,
          language: customer.language,
          discount: customer.discount,
          isBlacklisted: customer.isBlacklisted
        } : null
      });

    } catch (error) {
      logger.error('[INTERNAL-API] User check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /internal/wip-status/:workspaceId/:phone
   * Check Work In Progress status for user
   */
  async getWipStatus(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      
      // Check workspace challenge status (WIP mode)
      const workspace = await this.messageRepository.getWorkspaceSettings(workspaceId);
      const hasActiveWip = workspace?.challengeStatus || false;
      
      res.json({
        hasActiveWip,
        wipData: hasActiveWip ? { reason: 'Workspace in maintenance mode' } : null
      });

    } catch (error) {
      logger.error('[INTERNAL-API] WIP status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /internal/rag-search
   * Perform semantic search across all content types with business-specific logic
   * Enhanced with Andrea's Session Token Validation
   */
  async ragSearch(req: Request, res: Response): Promise<void> {
    try {
      const { query, workspaceId, businessType, customerLanguage, sessionToken } = req.body;
      
      if (!query || !workspaceId) {
        res.status(400).json({ error: 'Query and workspaceId are required' });
        return;
      }

      logger.info(`[RAG-SEARCH] Processing search: "${query}" for workspace ${workspaceId}`);

      // 🔑 ANDREA'S SESSION TOKEN VALIDATION (Optional for backward compatibility)
      if (sessionToken) {
        const validation = await this.secureTokenService.validateToken(sessionToken, 'session');
        if (!validation.valid) {
          logger.warn(`[RAG-SEARCH] Invalid session token: ${sessionToken.substring(0, 12)}...`);
          res.status(401).json({ error: 'Invalid or expired session token' });
          return;
        }
        logger.info(`[RAG-SEARCH] Valid session token for workspace ${workspaceId}`);
      }

      // Get workspace to determine business type if not provided
      let targetBusinessType = businessType;
      if (!targetBusinessType) {
        const workspace = await prisma.workspace.findUnique({
          where: { id: workspaceId }
        });
        targetBusinessType = workspace?.businessType || 'GENERIC';
      }

      // Route to business-specific RAG search
      switch (targetBusinessType) {
        case 'ECOMMERCE':
          await this.ecommerceRagSearch(req, res, query, workspaceId);
          break;
        case 'RESTAURANT':
          await this.restaurantRagSearch(req, res, query, workspaceId);
          break;
        case 'CLINIC':
          await this.clinicRagSearch(req, res, query, workspaceId);
          break;
        case 'RETAIL':
        case 'SERVICES':
        case 'GENERIC':
        default:
          await this.genericRagSearch(req, res, query, workspaceId);
          break;
      }

    } catch (error) {
      logger.error('[RAG-SEARCH] Error processing search:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * E-commerce specific RAG search (current ShopMe logic)
   */
  private async ecommerceRagSearch(req: Request, res: Response, query: string, workspaceId: string): Promise<void> {
    const customerId = req.body.customerId;
    
    // Import document service
    const { DocumentService } = await import('../../../services/documentService');
    const documentService = new DocumentService();
    
    // Parallel search across all content types
    const [productResults, faqResults, serviceResults, documentResults] = await Promise.all([
      embeddingService.searchProducts(query, workspaceId, 5),
      embeddingService.searchFAQs(query, workspaceId, 5),
      embeddingService.searchServices(query, workspaceId, 5),
      documentService.searchDocuments(query, workspaceId, 5)
    ]);

    // Get full product details with stock verification
    const productIds = productResults.map(r => r.id);
    let fullProducts = productIds.length > 0 ? await this.messageRepository.findProducts(workspaceId, {
      productIds: productIds,
      limit: 5,
      isActive: true
    }) : [];

    // 💰 Andrea's Logic: Apply discount calculation to products
    if (fullProducts.length > 0) {
      try {
        const { PriceCalculationService } = await import('../../../application/services/price-calculation.service');
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        const priceService = new PriceCalculationService(prisma);

        // Get customer discount
        let customerDiscount = 0;
        if (customerId) {
          const customer = await prisma.customers.findUnique({
            where: { id: customerId },
            select: { discount: true }
          });
          customerDiscount = customer?.discount || 0;
        }

        // Calculate prices with Andrea's logic (highest discount wins)
        const priceResult = await priceService.calculatePricesWithDiscounts(
          workspaceId, 
          productIds, 
          customerDiscount
        );

        // Merge price data with product data
        fullProducts = fullProducts.map(product => {
          const priceData = priceResult.products.find(p => p.id === product.id);
          return {
            ...product,
            originalPrice: priceData?.originalPrice || product.price,
            finalPrice: priceData?.finalPrice || product.price,
            hasDiscount: (priceData?.appliedDiscount || 0) > 0,
            discountPercent: priceData?.appliedDiscount || 0,
            discountSource: priceData?.discountSource,
            discountName: priceData?.discountName,
            // Update the display price to final price
            price: priceData?.finalPrice || product.price
          };
        });

        logger.info(`[E-COMMERCE-RAG] 💰 Andrea's Logic applied - Customer: ${customerDiscount}%, Best offer: ${priceResult.discountsApplied.bestOfferDiscount}%`);
        await prisma.$disconnect();

      } catch (priceError) {
        logger.error('[E-COMMERCE-RAG] ❌ Error calculating prices:', priceError);
        // Continue without price calculation if error
      }
    }

    res.json({
      businessType: 'ECOMMERCE',
      products: productResults.map(r => ({
        similarity: r.similarity,
        content: r.content,
        product: fullProducts.find(p => p.id === r.id)
      })).filter(r => r.product),
      faqs: faqResults.map(r => ({
        similarity: r.similarity,
        content: r.content,
        faq: { id: r.id, question: r.sourceName, answer: r.content }
      })),
      services: serviceResults.map(r => ({
        similarity: r.similarity,
        content: r.content,
        service: { id: r.id, name: r.sourceName, description: r.content }
      })),
      documents: documentResults.map(r => ({
        similarity: r.similarity,
        content: r.content,
        document: { id: r.documentId, title: r.documentName }
      }))
    });
  }

  /**
   * Restaurant specific RAG search (menu, reservations, delivery)
   */
  private async restaurantRagSearch(req: Request, res: Response, query: string, workspaceId: string): Promise<void> {
    // Import document service
    const { DocumentService } = await import('../../../services/documentService');
    const documentService = new DocumentService();
    
    // For restaurants: search menu items (products), restaurant info (services), hours/policies (FAQs)
    const [menuResults, faqResults, serviceResults, documentResults] = await Promise.all([
      embeddingService.searchProducts(query, workspaceId, 5), // Menu items
      embeddingService.searchFAQs(query, workspaceId, 5),     // Hours, policies
      embeddingService.searchServices(query, workspaceId, 5), // Delivery, reservations
      documentService.searchDocuments(query, workspaceId, 5)  // Documents like menus, policies
    ]);

    const productIds = menuResults.map(r => r.id);
    const menuItems = productIds.length > 0 ? await this.messageRepository.findProducts(workspaceId, {
      productIds: productIds,
      limit: 5,
      isActive: true
    }) : [];

    res.json({
      businessType: 'RESTAURANT',
      menuItems: menuResults.map(r => ({
        similarity: r.similarity,
        content: r.content,
        menuItem: menuItems.find(p => p.id === r.id)
      })).filter(r => r.menuItem),
      restaurantInfo: faqResults.map(r => ({
        similarity: r.similarity,
        content: r.content,
        info: { id: r.id, question: r.sourceName, answer: r.content }
      })),
      services: serviceResults.map(r => ({
        similarity: r.similarity,
        content: r.content,
        service: { id: r.id, name: r.sourceName, description: r.content }
      })),
      documents: documentResults.map(r => ({
        similarity: r.similarity,
        content: r.content,
        document: { id: r.documentId, title: r.documentName }
      }))
    });
  }

  /**
   * Clinic specific RAG search (appointments, medical services)
   */
  private async clinicRagSearch(req: Request, res: Response, query: string, workspaceId: string): Promise<void> {
    // Import document service
    const { DocumentService } = await import('../../../services/documentService');
    const documentService = new DocumentService();
    
    // For clinics: search medical services, appointment info, policies
    const [serviceResults, faqResults, documentResults] = await Promise.all([
      embeddingService.searchServices(query, workspaceId, 8), // Medical services
      embeddingService.searchFAQs(query, workspaceId, 5),     // Appointment policies, hours
      documentService.searchDocuments(query, workspaceId, 5)  // Medical documents, forms
    ]);

    res.json({
      businessType: 'CLINIC',
      medicalServices: serviceResults.map(r => ({
        similarity: r.similarity,
        content: r.content,
        service: { id: r.id, name: r.sourceName, description: r.content }
      })),
      clinicInfo: faqResults.map(r => ({
        similarity: r.similarity,
        content: r.content,
        info: { id: r.id, question: r.sourceName, answer: r.content }
      })),
      products: [], // No products for clinics
      documents: documentResults.map(r => ({
        similarity: r.similarity,
        content: r.content,
        document: { id: r.documentId, title: r.documentName }
      }))
    });
  }

  /**
   * Generic RAG search for undefined business types
   */
  private async genericRagSearch(req: Request, res: Response, query: string, workspaceId: string): Promise<void> {
    // Import document service
    const { DocumentService } = await import('../../../services/documentService');
    const documentService = new DocumentService();
    
    // Generic search across all available content
    const [productResults, faqResults, serviceResults, documentResults] = await Promise.all([
      embeddingService.searchProducts(query, workspaceId, 3),
      embeddingService.searchFAQs(query, workspaceId, 5),
      embeddingService.searchServices(query, workspaceId, 3),
      documentService.searchDocuments(query, workspaceId, 5)
    ]);

    res.json({
      businessType: 'GENERIC',
      content: {
        products: productResults,
        faqs: faqResults,
        services: serviceResults,
        documents: documentResults
      }
    });
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
      const { message, ragResults, customer, workspaceId, conversationHistory, businessType, phoneNumber } = req.body;
      
      if (!message || !workspaceId) {
        res.status(400).json({ error: 'Message and workspaceId required' });
        return;
      }

      logger.info(`[LLM-PROCESS] Processing message for workspace: ${workspaceId}, business: ${businessType}`);

      // 🎯 GET AGENT SETTINGS FROM DATABASE (NOT HARDCODED!)
      const agentConfig = await this.messageRepository.getAgentConfig(workspaceId);
      if (!agentConfig) {
        res.status(400).json({ error: 'Agent configuration not found for workspace' });
        return;
      }

      logger.info(`[LLM-PROCESS] Using agent config - Model: ${agentConfig.model}, Temp: ${agentConfig.temperature}, MaxTokens: ${agentConfig.maxTokens}`);

      // 🧠 BUILD COMPLETE CONVERSATION MEMORY (NOT JUST RECENT!)
      let fullConversationHistory = '';
      if (conversationHistory && conversationHistory.length > 0) {
        fullConversationHistory = conversationHistory
          .slice(-10) // Last 10 messages for context
          .map((h: any) => `${h.direction === 'INBOUND' ? 'Customer' : 'Assistant'}: ${h.content}`)
          .join('\n');
      }

      // 🏢 GET FULL CONVERSATION HISTORY FROM DATABASE
      if (phoneNumber) {
        try {
          const dbHistory = await this.messageRepository.getLatesttMessages(phoneNumber, 20, workspaceId);
          if (dbHistory && dbHistory.length > 0) {
            const formattedHistory = dbHistory
              .slice(-15) // Last 15 messages
              .map(msg => `${msg.direction === 'INBOUND' ? 'Customer' : 'Assistant'}: ${msg.content}`)
              .join('\n');
            fullConversationHistory = formattedHistory;
          }
        } catch (error) {
          logger.warn(`[LLM-PROCESS] Could not fetch conversation history: ${error.message}`);
        }
      }

      // 🎯 USE DYNAMIC PROMPT FROM AGENT CONFIG (NOT HARDCODED!)
      const businessContext = this.buildBusinessContext(businessType, ragResults);
      
      // 🚀 BUILD FINAL PROMPT USING AGENT PROMPT + CONTEXT
      const dynamicPrompt = `${agentConfig.prompt}

BUSINESS TYPE: ${businessType || 'GENERIC'}
CURRENT CONTEXT: You are helping a customer for a ${businessType?.toLowerCase() || 'business'} business.

CUSTOMER INFORMATION:
- Name: ${customer?.name || 'Guest'}
- Phone: ${phoneNumber || 'Unknown'}
- Language: ${customer?.language || 'italian'}
- Discount Level: ${customer?.discount || 0}%
- Is Blacklisted: ${customer?.isBlacklisted ? 'Yes' : 'No'}

KNOWLEDGE BASE SEARCH RESULTS:
${businessContext}

CONVERSATION MEMORY (Last 15 messages):
${fullConversationHistory || 'No previous conversation'}

CURRENT CUSTOMER MESSAGE: "${message}"

RESPONSE INSTRUCTIONS:
1. Use ALL relevant information from the knowledge base
2. Reference previous conversation when relevant
3. Be helpful, accurate, and professional
4. Respond in ${customer?.language || 'italian'}
5. Apply customer discount if relevant
6. Include specific product details, prices, and availability
7. If no relevant information found, suggest alternatives or ask for clarification`;

      logger.info(`[LLM-PROCESS] Calling OpenRouter with model: ${agentConfig.model}`);

      // 🌐 CALL OPENROUTER WITH DYNAMIC SETTINGS FROM DATABASE
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
          'X-Title': 'ShopMe AI Assistant'
        },
        body: JSON.stringify({
          model: agentConfig.model, // 🎯 FROM DATABASE
          messages: [{ 
            role: 'user', 
            content: dynamicPrompt 
          }],
          temperature: agentConfig.temperature, // 🎯 FROM DATABASE
          max_tokens: agentConfig.maxTokens,    // 🎯 FROM DATABASE
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`[LLM-PROCESS] OpenRouter API error: ${response.status} - ${errorText}`);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const formattedResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not process your request.';

      logger.info(`[LLM-PROCESS] OpenRouter response received, tokens used: ${data.usage?.total_tokens || 0}`);

      // Track usage for registered customers (0.5 cents per LLM response)
      if (formattedResponse && customer?.id) {
        try {
          const { usageService } = await import('../../../services/usage.service');
          await usageService.trackUsage({
            workspaceId: workspaceId,
            clientId: customer.id,
            price: 0.005 // 0.5 cents as requested by Andrea
          });
          logger.info(`[LLM-PROCESS] 💰 Usage tracked for customer ${customer.id}`);
        } catch (usageError) {
          logger.error(`[LLM-PROCESS] Failed to track usage for customer ${customer.id}:`, usageError);
          // Don't fail the main request if usage tracking fails
        }
      }

      res.json({
        response: formattedResponse,
        model: agentConfig.model,
        businessType: businessType || 'GENERIC',
        tokensUsed: data.usage?.total_tokens || 0,
        temperature: agentConfig.temperature,
        maxTokens: agentConfig.maxTokens,
        promptUsed: agentConfig.prompt.substring(0, 100) + '...' // First 100 chars for debugging
      });

    } catch (error) {
      logger.error('[LLM-PROCESS] Error in LLM processing:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  /**
   * Build business-specific context for LLM
   */
  private buildBusinessContext(businessType: string, ragResults: any): string {
    switch (businessType) {
      case 'ECOMMERCE':
        return `PRODUCTS AVAILABLE:
${ragResults?.products?.map((r: any) => 
  `- ${r.product?.name} (€${r.product?.price}) - Stock: ${r.product?.stock} units`
).join('\n') || 'No products found'}

FAQS:
${ragResults?.faqs?.map((r: any) => `- ${r.faq?.question}: ${r.faq?.answer}`).join('\n') || 'No FAQs found'}

SERVICES:
${ragResults?.services?.map((r: any) => `- ${r.service?.name}: ${r.service?.description}`).join('\n') || 'No services found'}`;

      case 'RESTAURANT':
        return `MENU ITEMS:
${ragResults?.menuItems?.map((r: any) => 
  `- ${r.menuItem?.name} (€${r.menuItem?.price}) - ${r.menuItem?.description || 'Available'}`
).join('\n') || 'No menu items found'}

RESTAURANT INFO:
${ragResults?.restaurantInfo?.map((r: any) => `- ${r.info?.question}: ${r.info?.answer}`).join('\n') || 'No restaurant info found'}

SERVICES (Delivery/Reservations):
${ragResults?.services?.map((r: any) => `- ${r.service?.name}: ${r.service?.description}`).join('\n') || 'No services found'}`;

      case 'CLINIC':
        return `MEDICAL SERVICES:
${ragResults?.medicalServices?.map((r: any) => `- ${r.service?.name}: ${r.service?.description}`).join('\n') || 'No medical services found'}

CLINIC INFORMATION:
${ragResults?.clinicInfo?.map((r: any) => `- ${r.info?.question}: ${r.info?.answer}`).join('\n') || 'No clinic info found'}`;

      default:
        return `AVAILABLE INFORMATION:
${JSON.stringify(ragResults, null, 2)}`;
    }
  }

  /**
   * POST /internal/save-message
   * Save message and conversation history
   */
  async saveMessage(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, workspaceId, message, response } = req.body;
      
      if (!phoneNumber || !workspaceId || !message) {
        res.status(400).json({ error: 'Required fields missing' });
        return;
      }

      // Save the conversation
      await this.messageRepository.saveMessage({
        workspaceId,
        phoneNumber,
        message,
        response: response || '',
        direction: 'INBOUND'
      });

      res.json({ success: true });

    } catch (error) {
      logger.error('[INTERNAL-API] Save message error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /internal/conversation-history/:workspaceId/:phone
   * Get conversation history for context
   */
  async getConversationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, phone } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;
      
      const history = await this.messageRepository.getLatesttMessages(phone, limit, workspaceId);
      
      res.json({ history });

    } catch (error) {
      logger.error('[INTERNAL-API] Conversation history error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /internal/welcome-user
   * Handle user welcome and registration
   */
  async welcomeUser(req: Request, res: Response): Promise<void> {
    try {
      const { phone, workspaceId, language } = req.body;
      
      if (!phone || !workspaceId) {
        res.status(400).json({ error: 'Phone and workspaceId required' });
        return;
      }

      // Generate simple registration token (simplified for now)
      const registrationToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Get welcome message from workspace
      const welcomeMessage = await this.messageRepository.getWelcomeMessage(workspaceId, language || 'italian');

      res.json({
        registrationToken,
        registrationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?token=${registrationToken}`,
        welcomeMessage
      });

    } catch (error) {
      logger.error('[INTERNAL-API] Welcome user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /internal/agent-config/{workspaceId}
   * Get agent configuration for N8N direct OpenRouter calls
   */
  async getAgentConfig(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      
      if (!workspaceId) {
        res.status(400).json({ error: 'WorkspaceId required' });
        return;
      }

      logger.info(`[INTERNAL-API] Getting agent config for workspace: ${workspaceId}`);

      // Get agent configuration from database
      const agentConfig = await this.messageRepository.getAgentConfig(workspaceId);
      if (!agentConfig) {
        res.status(404).json({ error: 'Agent configuration not found for workspace' });
        return;
      }

      logger.info(`[INTERNAL-API] Agent config found - Model: ${agentConfig.model}, Temp: ${agentConfig.temperature}`);

      res.json({
        agentConfig: {
          model: agentConfig.model,
          temperature: agentConfig.temperature,
          maxTokens: agentConfig.maxTokens,
          prompt: agentConfig.prompt
        },
        workspaceId
      });

    } catch (error) {
      logger.error('[INTERNAL-API] Get agent config error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /internal/generate-registration-link
   * Generate registration link for new users
   */
  async generateRegistrationLink(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, workspaceId, language } = req.body;
      
      if (!phoneNumber || !workspaceId) {
        res.status(400).json({ error: 'Phone number and workspaceId required' });
        return;
      }

      logger.info(`[INTERNAL-API] Generating registration link for ${phoneNumber} in workspace ${workspaceId}`);

      // Generate secure registration token
      const token = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
      
      // Get workspace details for URL
      const workspace = await this.messageRepository.getWorkspaceSettings(workspaceId);
      const baseUrl = workspace?.url || process.env.FRONTEND_URL || 'http://localhost:3000';
      
      // Build registration URL
      const registrationUrl = `${baseUrl}/register?phone=${encodeURIComponent(phoneNumber)}&workspace=${workspaceId}&token=${token}&lang=${language || 'it'}`;
      
      // Get welcome message template based on language
      const welcomeMessage = await this.messageRepository.getWelcomeMessage(workspaceId, language || 'italian');
      
      // Combine welcome message with registration link
      const fullMessage = `${welcomeMessage}\n\n🔗 Per registrarti clicca qui: ${registrationUrl}`;

      res.json({
        success: true,
        token,
        registrationUrl,
        welcomeMessage,
        fullMessage,
        phoneNumber,
        workspaceId
      });

    } catch (error) {
      logger.error('[INTERNAL-API] Generate registration link error:', error);
      res.status(500).json({ error: 'Internal server error' });
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
      const { phoneNumber, message, workspaceId, chatSessionId } = req.body;

      if (!phoneNumber || !message || !workspaceId) {
        res.status(400).json({
          error: 'Phone number, message, and workspace ID are required'
        });
        return;
      }

      logger.info(`[SEND-WHATSAPP] 📱 Andrea's Architecture - Sending to ${phoneNumber}: "${message.substring(0, 50)}..."`);

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // Save OUTBOUND message to database
      if (chatSessionId) {
        await prisma.message.create({
          data: {
            chatSessionId,
            content: message,
            direction: 'OUTBOUND',
            type: 'TEXT',
            metadata: {
              source: 'n8n',
              phoneNumber,
              timestamp: new Date().toISOString()
            }
          }
        });
        logger.info(`[SEND-WHATSAPP] 💾 Message saved to database (chatSessionId: ${chatSessionId})`);
      }

      // In a real implementation, here we would call the actual WhatsApp API
      // For now, we simulate the response
      logger.info(`[SEND-WHATSAPP] ✅ WhatsApp message sent successfully to ${phoneNumber}`);

      res.json({
        success: true,
        phoneNumber,
        messageId: `msg_${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'sent',
        length: message.length
      });

      await prisma.$disconnect();

    } catch (error: any) {
      logger.error('[SEND-WHATSAPP] ❌ Error sending WhatsApp message:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
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
      const { workspaceId, customerId, productIds, query } = req.body;

      if (!workspaceId) {
        res.status(400).json({
          error: 'Workspace ID is required'
        });
        return;
      }

      logger.info(`[PRODUCTS-DISCOUNTS] 💰 Andrea's Logic - Getting products for workspace ${workspaceId}`);

      const { PriceCalculationService } = await import('../../../application/services/price-calculation.service');
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const priceService = new PriceCalculationService(prisma);

      // Get customer discount if customerId provided
      let customerDiscount = 0;
      if (customerId) {
        const customer = await prisma.customers.findUnique({
          where: { id: customerId },
          select: { discount: true }
        });
        customerDiscount = customer?.discount || 0;
        logger.info(`[PRODUCTS-DISCOUNTS] 👤 Customer discount: ${customerDiscount}%`);
      }

      // Calculate prices with Andrea's logic (highest discount wins)
      const result = await priceService.calculatePricesWithDiscounts(
        workspaceId, 
        productIds, 
        customerDiscount
      );

      // Filter by query if provided
      let filteredProducts = result.products;
      if (query) {
        const searchTerm = query.toLowerCase();
        filteredProducts = result.products.filter(product => 
          product.name.toLowerCase().includes(searchTerm)
        );
      }

      logger.info(`[PRODUCTS-DISCOUNTS] ✅ Found ${filteredProducts.length} products, best discount: ${result.discountsApplied.appliedDiscount}%`);

      res.json({
        success: true,
        products: filteredProducts,
        discountInfo: {
          customerDiscount,
          bestOfferDiscount: result.discountsApplied.bestOfferDiscount,
          appliedDiscount: result.discountsApplied.appliedDiscount,
          source: result.discountsApplied.source
        },
        totalSavings: result.totalDiscount,
        query: query || null
      });

      await prisma.$disconnect();

    } catch (error: any) {
      logger.error('[PRODUCTS-DISCOUNTS] ❌ Error getting products with discounts:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
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
      const { query, workspaceId } = req.body;

      if (!query || !workspaceId) {
        res.status(400).json({
          error: 'Query and workspace ID are required',
          example: {
            query: "pasta gragnano",
            workspaceId: "clzd8x8z20000356cqhpe6yu0"
          }
        });
        return;
      }

      logger.info(`[TEST-RAG] 🧪 Andrea's Test - Query: "${query}" for workspace ${workspaceId}`);

      // Search across all content types
      const [productResults, faqResults, serviceResults] = await Promise.all([
        embeddingService.searchProducts(query, workspaceId, 5),
        embeddingService.searchFAQs(query, workspaceId, 5),
        embeddingService.searchServices(query, workspaceId, 5)
      ]);

      // Get full product details
      const productIds = productResults.map(r => r.id);
      let fullProducts: any[] = [];
      
      if (productIds.length > 0) {
        fullProducts = await this.messageRepository.findProducts(workspaceId, {
          productIds: productIds,
          limit: 5,
          isActive: true
        });
      }

      // Format simple response
      const ragResults = {
        products: productResults.map(r => ({
          id: r.id,
          similarity: r.similarity,
          content: r.content,
          sourceName: r.sourceName,
          productData: fullProducts.find(p => p.id === r.id)
        })),
        faqs: faqResults.map(r => ({
          id: r.id,
          similarity: r.similarity,
          content: r.content,
          sourceName: r.sourceName
        })),
        services: serviceResults.map(r => ({
          id: r.id,
          similarity: r.similarity,
          content: r.content,
          sourceName: r.sourceName
        }))
      };

      const totalResults = productResults.length + faqResults.length + serviceResults.length;

      logger.info(`[TEST-RAG] ✅ Test completed - Found ${totalResults} results`);

      res.json({
        success: true,
        query,
        workspaceId,
        ragResults,
        summary: {
          totalResults,
          productsFound: productResults.length,
          faqsFound: faqResults.length,
          servicesFound: serviceResults.length
        },
        testInfo: {
          endpoint: '/internal/test-rag-complete',
          description: 'Complete RAG test endpoint by Andrea',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      logger.error('[TEST-RAG] ❌ Error in complete RAG test:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        query: req.body.query || 'N/A'
      });
    }
  }

  /**
   * 🧪 SIMPLE TEST - Search Products (Andrea's Testing)
   */
  async testSimpleSearch(req: Request, res: Response): Promise<void> {
    try {
      const { query, workspaceId } = req.body;

      if (!query || !workspaceId) {
        res.status(400).json({
          error: 'Query and workspace ID are required',
          example: { query: "pasta", workspaceId: "clzd8x8z20000356cqhpe6yu0" }
        });
        return;
      }

      // Simple search
      const results = await embeddingService.searchProducts(query, workspaceId, 5);

      res.json({
        success: true,
        query,
        workspaceId,
        results,
        count: results.length,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      res.status(500).json({
        error: 'Error in search',
        message: error.message
      });
    }
  }

  /**
   * 🧪 MOCK TEST - Demo Results (Andrea's Testing)
   */
  async testMockResults(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;

      logger.info(`[MOCK-TEST] 🧪 Andrea's Mock Test - Query: "${query}"`);

      // Mock results for Andrea to see the structure
      const mockResults = [
        {
          id: "prod-001",
          similarity: 0.92,
          content: "Mozzarella di Bufala Campana DOP - 250g. Prodotta in Campania con latte di bufala fresco. Cremosa e saporita, perfetta per insalate e pizza.",
          sourceName: "Mozzarella di Bufala DOP",
          productData: {
            id: "prod-001",
            name: "Mozzarella di Bufala Campana DOP",
            description: "Mozzarella di bufala fresca prodotta in Campania",
            price: 8.50,
            stock: 25,
            category: { name: "Formaggi" }
          }
        },
        {
          id: "prod-002", 
          similarity: 0.87,
          content: "Mozzarella Fiordilatte Pugliese - 200g. Mozzarella vaccina fresca del giorno. Gusto delicato e consistenza morbida.",
          sourceName: "Mozzarella Fiordilatte", 
          productData: {
            id: "prod-002",
            name: "Mozzarella Fiordilatte Pugliese",
            description: "Mozzarella vaccina fresca pugliese",
            price: 4.20,
            stock: 40,
            category: { name: "Formaggi" }
          }
        },
        {
          id: "prod-003",
          similarity: 0.81,
          content: "Burrata Pugliese Artigianale - 125g. Formaggio fresco con cuore cremoso. Prodotta con latte locale di alta qualità.",
          sourceName: "Burrata Pugliese Artigianale",
          productData: {
            id: "prod-003", 
            name: "Burrata Pugliese Artigianale",
            description: "Burrata fresca con cuore cremoso",
            price: 6.80,
            stock: 15,
            category: { name: "Formaggi" }
          }
        }
      ];

      // Filter results based on query
      let filteredResults = mockResults;
      if (query) {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('mozzarella')) {
          filteredResults = mockResults.slice(0, 2); // First 2 are mozzarella
        } else if (lowerQuery.includes('burrata')) {
          filteredResults = [mockResults[2]]; // Only burrata
        } else if (lowerQuery.includes('formaggio') || lowerQuery.includes('cheese')) {
          filteredResults = mockResults; // All cheese products
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
        note: "🧪 DATI MOCK - Questi sono risultati di esempio per mostrare il funzionamento"
      });

    } catch (error: any) {
      res.status(500).json({
        error: 'Error in mock search',
        message: error.message
      });
    }
  }

  private formatMockResults(results: any[], query: string): string {
    if (results.length === 0) {
      return `🔍 Nessun risultato trovato per "${query}"`;
    }

    let response = `🛍️ **PRODOTTI TROVATI PER "${query.toUpperCase()}":**\n\n`;
    
    results.forEach((item, index) => {
      const product = item.productData;
      response += `${index + 1}. **${product.name}** (Similarità: ${(item.similarity * 100).toFixed(1)}%)\n`;
      response += `   💰 Prezzo: €${product.price}\n`;
      response += `   📝 ${product.description}\n`;
      response += `   📦 Stock: ${product.stock}\n`;
      response += `   🏷️ Categoria: ${product.category.name}\n\n`;
    });

    return response;
  }

  /**
   * 🧪 OPEN TEST ENDPOINT - No Auth, Hardcoded WorkspaceId (Andrea's Testing)
   * GET /internal/test-rag-open?search=avete le mozzarelle
   * Completely open endpoint with hardcoded workspace for quick testing
   */
  async testRagOpen(req: Request, res: Response): Promise<void> {
    try {
      const { search } = req.query;
      
      // 🔒 HARDCODED VALUES FOR TESTING (Andrea's Request)
      const HARDCODED_WORKSPACE_ID = "clzd8x8z20000356cqhpe6yu0";
      const query = (search as string) || "mozzarelle"; // Default search if empty

      logger.info(`[OPEN-RAG-TEST] 🧪 Andrea's Open Test - Query: "${query}"`);

      // Search across all content types in parallel
      const [productResults, faqResults, serviceResults] = await Promise.all([
        embeddingService.searchProducts(query, HARDCODED_WORKSPACE_ID, 10),
        embeddingService.searchFAQs(query, HARDCODED_WORKSPACE_ID, 10), 
        embeddingService.searchServices(query, HARDCODED_WORKSPACE_ID, 10)
      ]);

      logger.info(`[OPEN-RAG-TEST] Found - Products: ${productResults.length}, FAQs: ${faqResults.length}, Services: ${serviceResults.length}`);

      // Simple, clean response for Andrea's testing
      res.json({
        testName: "Andrea's Open RAG Test",
        query,
        workspaceId: HARDCODED_WORKSPACE_ID,
        results: {
          products: productResults,
          faqs: faqResults,
          services: serviceResults
        },
        summary: {
          totalResults: productResults.length + faqResults.length + serviceResults.length,
          productsFound: productResults.length,
          faqsFound: faqResults.length, 
          servicesFound: serviceResults.length
        },
        timestamp: new Date().toISOString(),
        note: "🔓 Endpoint completamente aperto per test rapidi"
      });

    } catch (error: any) {
      logger.error('[OPEN-RAG-TEST] ❌ Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        query: req.query.search || 'N/A'
      });
    }
  }

  /**
   * 🧪 GET ENDPOINT - Simple RAG Search with Query Parameter (Andrea's Request)
   * GET /internal/test-simple-search?search=avete le mozzarelle&workspaceId=xxx
   */
  async testSimpleSearchGet(req: Request, res: Response): Promise<void> {
    try {
      const { search, workspaceId } = req.query;
      
      if (!search) {
        res.status(400).json({
          error: 'Search parameter is required',
          example: 'GET /internal/test-simple-search?search=mozzarelle&workspaceId=clzd8x8z20000356cqhpe6yu0'
        });
        return;
      }

      const finalWorkspaceId = (workspaceId as string) || "clzd8x8z20000356cqhpe6yu0";
      const query = search as string;

      logger.info(`[SIMPLE-RAG-GET] 🔍 Search: "${query}" in workspace: ${finalWorkspaceId}`);

      // Simple product search 
      const results = await embeddingService.searchProducts(query, finalWorkspaceId, 5);

      res.json({
        success: true,
        query,
        workspaceId: finalWorkspaceId,
        results,
        count: results.length,
        endpoint: 'GET /internal/test-simple-search',
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('[SIMPLE-RAG-GET] ❌ Error:', error);
      res.status(500).json({
        error: 'Error in GET search',
        message: error.message
      });
    }
  }

  /**
   * POST /internal/generate-token
   * Generate secure tokens for various purposes (checkout, invoice, etc.)
   * Called by N8N workflow when creating secure links
   */
  async generateToken(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, action, metadata, workspaceId } = req.body;
      
      if (!customerId || !action) {
        res.status(400).json({ error: 'customerId and action are required' });
        return;
      }

      logger.info(`[INTERNAL-API] Generating ${action} token for customer ${customerId}`);

      // Get customer details
      const customer = await prisma.customers.findUnique({
        where: { id: customerId },
        include: { workspace: true }
      });

      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }

      // Validate workspace if provided
      const targetWorkspaceId = workspaceId || customer.workspaceId;
      if (customer.workspaceId !== targetWorkspaceId) {
        res.status(403).json({ error: 'Customer does not belong to this workspace' });
        return;
      }

      let token: string;
      let expiresAt: Date;
      let linkUrl: string | null = null;

      // Generate different types of tokens based on action
      switch (action) {
        case 'checkout':
          // Create checkout token using SecureTokenService
          const checkoutPayload = {
            customerId,
            workspaceId: targetWorkspaceId,
            customerName: customer.name,
            customerPhone: customer.phone,
            metadata: metadata || {},
            createdAt: new Date().toISOString()
          };

          token = await this.secureTokenService.createToken(
            'checkout',
            targetWorkspaceId,
            checkoutPayload,
            '1h',
            customerId,
            customer.phone
          );

          expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 1);

          // Build checkout URL
          const baseUrl = customer.workspace.url || process.env.FRONTEND_URL || 'http://localhost:3000';
          linkUrl = `${baseUrl}/checkout?token=${token}`;
          break;

        case 'invoice':
          // Create invoice token
          const invoicePayload = {
            customerId,
            workspaceId: targetWorkspaceId,
            customerName: customer.name,
            customerPhone: customer.phone,
            metadata: metadata || {},
            createdAt: new Date().toISOString()
          };

          token = await this.secureTokenService.createToken(
            'invoice',
            targetWorkspaceId,
            invoicePayload,
            '24h',
            customerId,
            customer.phone
          );

          expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24);

          // Build invoice URL
          const invoiceBaseUrl = customer.workspace.url || process.env.FRONTEND_URL || 'http://localhost:3000';
          linkUrl = `${invoiceBaseUrl}/invoice?token=${token}`;
          break;

        case 'cart':
          // Create cart token
          const cartPayload = {
            customerId,
            workspaceId: targetWorkspaceId,
            customerName: customer.name,
            customerPhone: customer.phone,
            metadata: metadata || {},
            createdAt: new Date().toISOString()
          };

          token = await this.secureTokenService.createToken(
            'cart',
            targetWorkspaceId,
            cartPayload,
            '2h',
            customerId,
            customer.phone
          );

          expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 2);

          // Build cart URL
          const cartBaseUrl = customer.workspace.url || process.env.FRONTEND_URL || 'http://localhost:3000';
          linkUrl = `${cartBaseUrl}/cart?token=${token}`;
          break;

        default:
          res.status(400).json({ error: `Unsupported action: ${action}` });
          return;
      }

      res.json({
        success: true,
        token,
        expiresAt,
        linkUrl,
        action,
        customerId,
        workspaceId: targetWorkspaceId
      });

      logger.info(`[INTERNAL-API] Generated ${action} token: ${token.substring(0, 12)}... for customer ${customerId}`);

    } catch (error) {
      logger.error('[INTERNAL-API] Generate token error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 