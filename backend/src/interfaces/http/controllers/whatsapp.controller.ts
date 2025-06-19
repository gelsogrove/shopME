import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { MessageService } from '../../../application/services/message.service';
import { SessionTokenService } from '../../../application/services/session-token.service';
import logger from '../../../utils/logger';

const prisma = new PrismaClient();

/**
 * Controller for WhatsApp integration (Security Gateway Only)
 * Business logic is handled by N8N with Andrea's Session Token Architecture
 */
export class WhatsAppController {
  private messageService: MessageService;
  private sessionTokenService: SessionTokenService;
  
  constructor() {
    this.messageService = new MessageService();
    this.sessionTokenService = new SessionTokenService();
  }
  
  /**
   * 🔍 DETERMINE WORKSPACE ID FROM WHATSAPP PHONE NUMBER
   * Automatically finds the correct workspace based on the WhatsApp phone number
   * that received the message (business phone number)
   */
  private async determineWorkspaceFromWhatsApp(webhookData: any): Promise<string> {
    try {
      // Extract the business phone number that received the message
      const businessPhoneNumber = webhookData.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
      const displayPhoneNumber = webhookData.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;
      
      logger.info(`[WORKSPACE-DETECTION] 🔍 Determining workspace for business phone: ${displayPhoneNumber} (ID: ${businessPhoneNumber})`);
      
      if (displayPhoneNumber) {
        // Look up workspace by WhatsApp phone number
        const workspace = await prisma.workspace.findFirst({
          where: {
            whatsappPhoneNumber: displayPhoneNumber,
            isActive: true,
            isDelete: false
          },
          select: {
            id: true,
            name: true,
            whatsappPhoneNumber: true
          }
        });
        
        if (workspace) {
          logger.info(`[WORKSPACE-DETECTION] ✅ Found workspace: ${workspace.name} (${workspace.id}) for phone ${displayPhoneNumber}`);
          return workspace.id;
        }
        
        logger.warn(`[WORKSPACE-DETECTION] ⚠️ No workspace found for phone ${displayPhoneNumber}`);
      }
      
      // Fallback to environment variable or default
      const fallbackWorkspaceId = process.env.WHATSAPP_WORKSPACE_ID || 'cm9hjgq9v00014qk8fsdy4ujv';
      logger.info(`[WORKSPACE-DETECTION] 🔄 Using fallback workspace: ${fallbackWorkspaceId}`);
      
      return fallbackWorkspaceId;
      
    } catch (error) {
      logger.error('[WORKSPACE-DETECTION] ❌ Error determining workspace:', error);
      
      // Fallback to environment variable or default
      const fallbackWorkspaceId = process.env.WHATSAPP_WORKSPACE_ID || 'cm9hjgq9v00014qk8fsdy4ujv';
      logger.info(`[WORKSPACE-DETECTION] 🔄 Error fallback to workspace: ${fallbackWorkspaceId}`);
      
      return fallbackWorkspaceId;
    }
  }

  /**
   * Handle webhook requests from Meta API
   * This endpoint is public and doesn't require authentication
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      // For GET requests (verification)
      if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        
        // Verify the webhook - in test environment, accept "test-verify-token"
        const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'test-verify-token';
        if (mode === 'subscribe' && token === verifyToken) {
          logger.info('WhatsApp webhook verified');
          res.status(200).send(challenge);
          return;
        }
        
        res.status(403).send('Verification failed');
        return;
      }
      
      // For POST requests (incoming messages)
      const data = req.body;
      logger.info('WhatsApp webhook received', { data });
      
      // Extract required data for MessageService
      const phoneNumber = data.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
      const messageContent = data.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
      
      // 🚀 ANDREA'S ENHANCEMENT: Automatically determine workspace from WhatsApp phone number
      const workspaceId = await this.determineWorkspaceFromWhatsApp(data);
      
      if (phoneNumber && messageContent) {
        // STEP 1: Security Gateway processing
        await this.messageService.processMessage(phoneNumber, messageContent, workspaceId);
        
        // STEP 2: 🚨 ANDREA'S OPERATOR CONTROL CHECK
        const operatorControlResult = await this.checkOperatorControl(phoneNumber, messageContent, workspaceId);
        
        if (operatorControlResult.isOperatorControl) {
          logger.info(`[OPERATOR-CONTROL] 👨‍💼 Customer ${phoneNumber} is under manual operator control - saving message but NOT forwarding to N8N`);
          
          // ✅ Save the incoming message for operator review
          await this.saveIncomingMessageForOperator(phoneNumber, messageContent, workspaceId);
          
          // ❌ DO NOT forward to N8N when operator has control
          res.status(200).send('EVENT_RECEIVED_OPERATOR_CONTROL');
          return;
        }
        
        // STEP 3: 🔑 ANDREA'S SESSION TOKEN GENERATION
        // Generate or renew session token for EVERY WhatsApp message
        const sessionToken = await this.generateSessionTokenForMessage(phoneNumber, workspaceId);
        
        // STEP 4: 🚀 Forward to N8N with session token AND workspace ID
        logger.info(`[CHATBOT-ACTIVE] 🤖 Customer ${phoneNumber} chatbot is active - forwarding to N8N with session token`);
        await this.forwardToN8N(data, sessionToken, workspaceId);
      }
      
      // Acknowledge receipt of the event
      res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      logger.error('Error handling WhatsApp webhook:', error);
      res.status(500).send('ERROR');
    }
  }

  /**
   * 🔑 ANDREA'S SESSION TOKEN GENERATION
   * Generate session token for EVERY WhatsApp message to ensure secure tracking
   */
  private async generateSessionTokenForMessage(phoneNumber: string, workspaceId: string): Promise<string> {
    try {
      logger.info(`[SESSION-TOKEN] 🔑 Generating session token for ${phoneNumber} in workspace ${workspaceId}`);
      
      // Find or create customer
      let customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
          isActive: true
        }
      });

      if (!customer) {
        // Create customer if not exists (for new WhatsApp contacts)
        customer = await prisma.customers.create({
          data: {
            name: `WhatsApp User ${phoneNumber}`,
            email: `${phoneNumber.replace(/[^0-9]/g, '')}@whatsapp.placeholder`,
            phone: phoneNumber,
            workspaceId: workspaceId,
            language: 'Italian',
            currency: 'EUR',
            isActive: true,
            activeChatbot: true // Default to chatbot active
          }
        });
        logger.info(`[SESSION-TOKEN] Created new customer ${customer.id} for phone ${phoneNumber}`);
      }

      // Generate or renew session token
      const sessionToken = await this.sessionTokenService.createOrRenewSessionToken(
        workspaceId,
        customer.id,
        phoneNumber,
        `conv_${Date.now()}_${customer.id}`
      );

      logger.info(`[SESSION-TOKEN] ✅ Session token generated: ${sessionToken.substring(0, 12)}... for customer ${customer.id}`);
      
      return sessionToken;
      
    } catch (error) {
      logger.error(`[SESSION-TOKEN] ❌ Error generating session token for ${phoneNumber}:`, error);
      throw new Error('Failed to generate session token');
    }
  }

  /**
   * 👨‍💼 ANDREA'S OPERATOR CONTROL CHECK
   * Verifies if customer has activeChatbot = false (operator control)
   */
  private async checkOperatorControl(phoneNumber: string, message: string, workspaceId: string): Promise<{isOperatorControl: boolean, customer?: any}> {
    try {
      logger.info(`[OPERATOR-CONTROL] Checking operator control for ${phoneNumber} in workspace ${workspaceId}`);
      
      // Find customer by phone number
      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
          isActive: true
        }
      });

      if (!customer) {
        logger.info(`[OPERATOR-CONTROL] Customer ${phoneNumber} not found - allowing chatbot processing`);
        return { isOperatorControl: false };
      }

      // Check activeChatbot flag
      const isOperatorControl = customer.activeChatbot === false;
      
      logger.info(`[OPERATOR-CONTROL] Customer ${phoneNumber}: activeChatbot=${customer.activeChatbot}, isOperatorControl=${isOperatorControl}`);
      
      return { 
        isOperatorControl, 
        customer 
      };

    } catch (error) {
      logger.error(`[OPERATOR-CONTROL] Error checking operator control for ${phoneNumber}:`, error);
      // On error, allow chatbot processing (fail-safe)
      return { isOperatorControl: false };
    }
  }

  /**
   * 💾 SAVE INCOMING MESSAGE FOR OPERATOR REVIEW
   * Saves customer message when operator has control with special flags
   */
  private async saveIncomingMessageForOperator(phoneNumber: string, message: string, workspaceId: string): Promise<void> {
    try {
      logger.info(`[OPERATOR-CONTROL] Saving incoming message for operator review: ${phoneNumber}`);

      // Find customer by phone number
      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
          isActive: true
        }
      });

      if (!customer) {
        logger.error(`[OPERATOR-CONTROL] Customer ${phoneNumber} not found - cannot save message`);
        return;
      }

      // Find or create chat session
      let chatSession = await prisma.chatSession.findFirst({
        where: {
          customerId: customer.id,
          workspaceId
        }
      });

      if (!chatSession) {
        chatSession = await prisma.chatSession.create({
          data: {
            customerId: customer.id,
            workspaceId,
            status: 'active',
            context: {}
          }
        });
      }

      // Save the incoming message with OPERATOR CONTROL flags
      await prisma.message.create({
        data: {
          content: message,
          direction: 'INBOUND',
          chatSessionId: chatSession.id,
          metadata: {
            agentSelected: 'MANUAL_OPERATOR_CONTROL',
            isOperatorControl: true,
            operatorControlActive: true,
            timestamp: new Date().toISOString()
          }
        }
      });

      logger.info(`[OPERATOR-CONTROL] ✅ Message saved for operator review: ${phoneNumber}`);
      
    } catch (error) {
      logger.error(`[OPERATOR-CONTROL] ❌ Error saving message for operator:`, error);
    }
  }

  /**
   * 🚀 FORWARD TO N8N (Andrea's OPTIMIZED Architecture with Precompiled Data)
   * Sends webhook data to N8N with ALL required data to avoid multiple API calls
   */
  private async forwardToN8N(webhookData: any, sessionToken: string, workspaceId: string): Promise<void> {
    try {
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/whatsapp-webhook';
      
      // 📋 EXTRACT KEY DATA FOR OPTIMIZATION
      const phoneNumber = webhookData.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
      const messageContent = webhookData.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
      const timestamp = webhookData.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.timestamp;
      
      logger.info(`[N8N] 🚀 Forwarding OPTIMIZED webhook to N8N: ${n8nWebhookUrl}`);
      logger.info(`[N8N] 📱 Phone: ${phoneNumber}`);
      logger.info(`[N8N] 💬 Message: ${messageContent}`);
      logger.info(`[N8N] 🔑 Session Token: ${sessionToken.substring(0, 12)}...`);
      
      // 🔍 PRECOMPILE ALL DATA THAT N8N NEEDS (Andrea's Optimization)
      const optimizedData = await this.precompileN8NData(workspaceId, phoneNumber, messageContent, sessionToken);
      
      // 🚀 ANDREA'S ENHANCED PAYLOAD: Everything N8N needs in one call
      const enhancedWebhookData = {
        ...webhookData,
        sessionToken: sessionToken,
        workspaceId: workspaceId,
        
        // 🎯 PRECOMPILED DATA - NO MORE API CALLS NEEDED FROM N8N
        precompiledData: {
          agentConfig: optimizedData.agentConfig,
          customer: optimizedData.customer,
          businessInfo: optimizedData.businessInfo,
          whatsappSettings: optimizedData.whatsappSettings,
          conversationHistory: optimizedData.conversationHistory,
          messageContext: optimizedData.messageContext
        },
        
        // 📊 SECURITY & METADATA  
        securityCheck: {
          timestamp: new Date().toISOString(),
          phoneNumber: phoneNumber,
          messageContent: messageContent,
          tokenGenerated: true,
          workspaceDetected: workspaceId,
          optimizationApplied: true
        }
      };
      
      logger.info(`[N8N] 🎯 Precompiled data: Agent Model ${optimizedData.agentConfig?.model}, Customer ${optimizedData.customer?.id ? 'Found' : 'New'}`);
      
      // Forward to N8N with optimized payload
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedWebhookData)
      });
      
      if (!response.ok) {
        throw new Error(`N8N webhook failed: ${response.status} ${response.statusText}`);
      }
      
      logger.info(`[N8N] ✅ Successfully forwarded OPTIMIZED data to N8N with session token: ${sessionToken.substring(0, 12)}...`);
      
    } catch (error) {
      logger.error(`[N8N] ❌ Error forwarding to N8N:`, error);
      throw error;
    }
  }

  /**
   * 🚀 PRECOMPILE N8N DATA (Andrea's Performance Optimization)
   * Gathers ALL necessary data in parallel to avoid multiple N8N->Backend API calls
   * Replaces: /agent-config, /user-check, /business-type, /channel-status, /conversation-history
   */
  private async precompileN8NData(workspaceId: string, phoneNumber: string, messageContent: string, sessionToken: string) {
    try {
      logger.info(`[PRECOMPILE] 🔄 Gathering all N8N data for workspace ${workspaceId}`);
      
      // 🏃‍♂️ PARALLEL EXECUTION - Andrea's efficiency approach
      const [agentConfig, customer, workspace, recentMessages] = await Promise.all([
        // 1. Agent Configuration (replaces /agent-config call)
        prisma.agentConfig.findFirst({
          where: { workspaceId }
        }),
        
        // 2. Customer Information (replaces /user-check call)  
        prisma.customers.findFirst({
          where: {
            phone: phoneNumber,
            workspaceId: workspaceId,
            isActive: true
          }
        }),
        
        // 3. Workspace Information (replaces /channel-status and /business-type calls)
        prisma.workspace.findUnique({
          where: { id: workspaceId },
          include: {
            whatsappSettings: true
          }
        }),
        
        // 4. Conversation History (replaces /conversation-history call)
        this.getRecentConversationHistory(workspaceId, phoneNumber, 10)
      ]);
      
      logger.info(`[PRECOMPILE] ✅ Data gathered - Agent: ${agentConfig?.model}, Customer: ${customer?.id ? 'exists' : 'new'}, Workspace: ${workspace?.name}`);
      
      return {
        // 🤖 AGENT CONFIGURATION
        agentConfig: agentConfig ? {
          model: agentConfig.model,
          temperature: agentConfig.temperature,
          maxTokens: agentConfig.maxTokens,
          prompt: agentConfig.prompt,
          isActive: agentConfig.isActive
        } : null,
        
        // 👤 CUSTOMER INFORMATION  
        customer: customer ? {
          id: customer.id,
          phone: customer.phone,
          name: customer.name,
          email: customer.email,
          language: customer.language || 'en',
          isActive: customer.isActive,
          activeChatbot: customer.activeChatbot,
          isBlacklisted: customer.isBlacklisted,
          discount: customer.discount,
          currency: customer.currency
        } : null,
        
        // 🏢 BUSINESS INFORMATION
        businessInfo: workspace ? {
          name: workspace.name,
          businessType: workspace.businessType,
          whatsappPhoneNumber: workspace.whatsappPhoneNumber,
          isActive: workspace.isActive,
          plan: workspace.plan,
          language: workspace.language,
          url: workspace.url || '',
          notificationEmail: workspace.notificationEmail,
          welcomeMessages: workspace.welcomeMessages,
          afterRegistrationMessages: workspace.afterRegistrationMessages,
          currency: workspace.currency,
          description: workspace.description
        } : null,
        
        // 📞 WHATSAPP SETTINGS
        whatsappSettings: workspace?.whatsappSettings ? {
          apiKey: workspace.whatsappSettings.apiKey,
          webhookUrl: workspace.whatsappSettings.webhookUrl,
          phoneNumber: workspace.whatsappSettings.phoneNumber,
          gdpr: workspace.whatsappSettings.gdpr
        } : null,
        
        // 💬 CONVERSATION HISTORY (last 10 messages)
        conversationHistory: recentMessages,
        
        // 🔐 SESSION TOKEN
        sessionToken: sessionToken,
        
        // 📱 MESSAGE CONTEXT
        messageContext: {
          phoneNumber: phoneNumber,
          messageContent: messageContent,
          timestamp: new Date().toISOString(),
          workspaceId: workspaceId
        }
      };
      
    } catch (error) {
      logger.error(`[PRECOMPILE] ❌ Error precompiling N8N data:`, error);
      return {
        agentConfig: null,
        customer: null,
        businessInfo: null,
        whatsappSettings: null,
        conversationHistory: [],
        sessionToken: sessionToken,
        messageContext: {
          phoneNumber: phoneNumber,
          messageContent: messageContent,
          timestamp: new Date().toISOString(),
          workspaceId: workspaceId
        }
      };
    }
  }

  /**
   * 💬 GET RECENT CONVERSATION HISTORY
   * Retrieves recent conversation for context (replaces N8N API call)
   */
  private async getRecentConversationHistory(workspaceId: string, phoneNumber: string, limit: number = 10) {
    try {
      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
          isActive: true
        }
      });
      
      if (!customer) {
        return [];
      }
      
      const chatSession = await prisma.chatSession.findFirst({
        where: {
          customerId: customer.id,
          workspaceId
        }
      });
      
      if (!chatSession) {
        return [];
      }
      
      const messages = await prisma.message.findMany({
        where: {
          chatSessionId: chatSession.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        select: {
          id: true,
          content: true,
          direction: true,
          createdAt: true,
          metadata: true
        }
      });
      
      return messages.reverse(); // Return in chronological order
      
    } catch (error) {
      logger.error(`[CONVERSATION-HISTORY] Error getting conversation history:`, error);
      return [];
    }
  }

  /**
   * 📤 SEND OPERATOR MESSAGE TO CUSTOMER
   * Endpoint for operators to send manual messages
   */
  async sendOperatorMessage(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, message, workspaceId } = req.body;
      
      if (!phoneNumber || !message || !workspaceId) {
        res.status(400).json({
          error: 'phoneNumber, message, and workspaceId are required'
        });
        return;
      }

      logger.info(`[OPERATOR-MESSAGE] 👨‍💼 Operator sending message to ${phoneNumber}: ${message}`);

      // Save operator's outbound message with special flags
      await this.saveOperatorOutboundMessage(phoneNumber, message, workspaceId);

      // TODO: Implement actual WhatsApp API call to send message
      // For now, just log the action
      logger.info(`[OPERATOR-MESSAGE] ✅ Message would be sent via WhatsApp API: ${message}`);

      res.json({
        success: true,
        message: 'Operator message sent successfully',
        sentMessage: message,
        phoneNumber,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('[OPERATOR-MESSAGE] ❌ Error sending operator message:', error);
      res.status(500).json({
        error: 'Failed to send operator message',
        message: (error as Error).message
      });
    }
  }

  /**
   * 💾 SAVE OPERATOR OUTBOUND MESSAGE
   * Saves operator's outbound message with special flags for UI distinction
   */
  private async saveOperatorOutboundMessage(phoneNumber: string, message: string, workspaceId: string, operatorId?: string): Promise<void> {
    try {
      // Find customer by phone number
      const customer = await prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId: workspaceId,
          isActive: true
        }
      });

      if (!customer) {
        logger.error(`[OPERATOR-MESSAGE] Customer ${phoneNumber} not found - cannot save message`);
        return;
      }

      // Find or create chat session
      let chatSession = await prisma.chatSession.findFirst({
        where: {
          customerId: customer.id,
          workspaceId
        }
      });

      if (!chatSession) {
        chatSession = await prisma.chatSession.create({
          data: {
            customerId: customer.id,
            workspaceId,
            status: 'active',
            context: {}
          }
        });
      }

      // Save operator's outbound message with OPERATOR flags
      await prisma.message.create({
        data: {
          content: message,
          direction: 'OUTBOUND',
          chatSessionId: chatSession.id,
          metadata: {
            agentSelected: 'MANUAL_OPERATOR',
            isOperatorMessage: true,  // ✅ Flag for UI to show operator badge
            operatorId: operatorId || 'unknown',
            sentBy: 'HUMAN_OPERATOR',
            timestamp: new Date().toISOString()
          }
        }
      });

      logger.info(`[OPERATOR-MESSAGE] ✅ Operator message saved to DB: ${phoneNumber}`);
      
    } catch (error) {
      logger.error(`[OPERATOR-MESSAGE] ❌ Error saving operator message:`, error);
    }
  }
} 