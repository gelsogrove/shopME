import { Request, Response } from 'express';
import { MessageRepository } from '../../../repositories/message.repository';
import { embeddingService } from '../../../services/embeddingService';
import logger from '../../../utils/logger';

/**
 * Internal API Controller for N8N Integration
 * Handles all internal API endpoints called by N8N workflows
 */
export class InternalApiController {
  constructor(
    private messageRepository: MessageRepository
  ) {}

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
        reason: isChannelActive ? 'Channel active' : 'WhatsApp not configured'
      });

    } catch (error) {
      logger.error('[INTERNAL-API] Channel status error:', error);
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
   * Unified semantic search across all content types
   */
  async ragSearch(req: Request, res: Response): Promise<void> {
    try {
      const { query, workspaceId } = req.body;
      
      if (!query || !workspaceId) {
        res.status(400).json({ error: 'Query and workspaceId required' });
        return;
      }

      logger.info(`[INTERNAL-API] RAG search for: "${query}" in workspace: ${workspaceId}`);

      // Parallel search across all content types
      const [productResults, faqResults, serviceResults] = await Promise.all([
        embeddingService.searchProducts(query, workspaceId, 5),
        embeddingService.searchFAQs(query, workspaceId, 5),
        embeddingService.searchServices(query, workspaceId, 5)
      ]);

      // Get full product details with stock verification
      const productIds = productResults.map(r => r.id);
      const fullProducts = productIds.length > 0 ? await this.messageRepository.findProducts(workspaceId, {
        productIds: productIds,
        limit: 5,
        isActive: true
      }) : [];

      res.json({
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
        documents: [] // Documents not implemented yet
      });

    } catch (error) {
      logger.error('[INTERNAL-API] RAG search error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /internal/llm-process
   * Process message with LLM using OpenRouter
   */
  async llmProcess(req: Request, res: Response): Promise<void> {
    try {
      const { message, ragResults, customer, workspaceId, conversationHistory } = req.body;
      
      if (!message || !workspaceId) {
        res.status(400).json({ error: 'Message and workspaceId required' });
        return;
      }

      // Build comprehensive prompt
      const finalPrompt = `You are a helpful AI assistant for an e-commerce business.

CUSTOMER CONTEXT:
- Name: ${customer?.name || 'Guest'}
- Language: ${customer?.language || 'italian'}
- Discount: ${customer?.discount || 0}%

SEMANTIC SEARCH RESULTS:

PRODUCTS FOUND (with availability):
${ragResults?.products?.map((r: any) => 
  `- ${r.product?.name} (Similarity: ${r.similarity.toFixed(3)})
    Price: €${r.product?.price}
    Stock: ${r.product?.stock} units available
    Category: ${r.product?.category?.name || 'General'}
    Match: ${r.content}`
).join('\n\n') || 'No products found'}

FAQS FOUND:
${ragResults?.faqs?.map((r: any) => 
  `- ${r.faq?.question} (Similarity: ${r.similarity.toFixed(3)})
    Answer: ${r.faq?.answer}
    Match: ${r.content}`
).join('\n\n') || 'No FAQs found'}

SERVICES FOUND:
${ragResults?.services?.map((r: any) => 
  `- ${r.service?.name} (Similarity: ${r.similarity.toFixed(3)})
    Description: ${r.service?.description}
    Match: ${r.content}`
).join('\n\n') || 'No services found'}

RECENT CHAT HISTORY:
${conversationHistory?.map((h: any) => `${h.direction === 'INBOUND' ? 'Customer' : 'Bot'}: ${h.content}`).join('\n') || 'No history'}

CUSTOMER MESSAGE: ${message}

INSTRUCTIONS:
- Combine ALL relevant information into a single, coherent response
- Show product availability and prices
- Include FAQ answers if relevant
- Mention services if applicable
- Respond in ${customer?.language || 'italian'}
- Be helpful and comprehensive but concise`;

      // Call OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [{ role: 'user', content: finalPrompt }],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const formattedResponse = data.choices?.[0]?.message?.content || null;

      res.json({
        response: formattedResponse,
        model: 'anthropic/claude-3.5-sonnet',
        tokensUsed: data.usage?.total_tokens || 0
      });

    } catch (error) {
      logger.error('[INTERNAL-API] LLM process error:', error);
      res.status(500).json({ error: 'Internal server error' });
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
} 