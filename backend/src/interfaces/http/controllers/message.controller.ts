import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { ApiLimitService } from '../../../application/services/api-limit.service';
import { CheckoutService } from '../../../application/services/checkout.service';
import { LangChainMessageService } from '../../../application/services/langchain-message.service';
import { TokenService } from '../../../application/services/token.service';
import { MessageRepository } from '../../../repositories/message.repository';
import { detectLanguage } from '../../../utils/language-detector';
import logger from '../../../utils/logger';

export class MessageController {
  private langChainMessageService: LangChainMessageService;

  constructor() {
    // Create dependencies for LangChainMessageService
    const prisma = new PrismaClient();
    const messageRepository = new MessageRepository();
    const tokenService = new TokenService();
    const checkoutService = new CheckoutService();
    const apiLimitService = new ApiLimitService(prisma);
    
    this.langChainMessageService = new LangChainMessageService(
      messageRepository,
      tokenService,
      checkoutService,
      apiLimitService
    );
  }

  /**
   * Process a message and return a response using LangChain directly
   * @route POST /api/messages
   */
  async processMessage(req: Request, res: Response): Promise<void> {
    try {
      const { message, phoneNumber, workspaceId, sessionId, isNewConversation } = req.body;

      // Validate required fields
      if (!message || typeof message !== 'string') {
        logger.warn('Invalid request: Message is required and must be a string');
        res.status(400).json({
          success: false,
          error: 'Message is required and must be a string'
        });
        return;
      }

      if (!phoneNumber || typeof phoneNumber !== 'string') {
        logger.warn('Invalid request: Phone number is required and must be a string');
        res.status(400).json({
          success: false,
          error: 'Phone number is required and must be a string'
        });
        return;
      }

      if (!workspaceId || typeof workspaceId !== 'string') {
        logger.warn('Invalid request: Workspace ID is required and must be a string');
        res.status(400).json({
          success: false,
          error: 'Workspace ID is required and must be a string'
        });
        return;
      }

      // Log the request details
      logger.info(`[MESSAGES API] Processing message: ${message}`);
      logger.info(`[MESSAGES API] From phone number: ${phoneNumber}`);
      logger.info(`[MESSAGES API] For workspace: ${workspaceId}`);
      
      // Detect language of the incoming message
      const detectedLanguage = detectLanguage(message);
      logger.info(`[MESSAGES API] Detected language for message: ${detectedLanguage}`);
      
      // Process the message directly with LangChain service
      const response = await this.langChainMessageService.processMessage(
        message,
        phoneNumber,
        workspaceId
      );
      
      // Return the processed message with metadata
      res.status(200).json({
        success: true,
        data: {
          originalMessage: message,
          processedMessage: response || "No response generated",
          phoneNumber: phoneNumber,
          workspaceId: workspaceId,
          timestamp: new Date().toISOString(),
          metadata: { agentName: "RAG Chat" },
          detectedLanguage: detectedLanguage,
          sessionId: sessionId,
          customerId: `customer-${phoneNumber.replace('+', '')}`,
          customerLanguage: detectedLanguage
        }
      });
    } catch (error) {
      logger.error('[MESSAGES API] Error processing message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process message'
      });
    }
  }
} 