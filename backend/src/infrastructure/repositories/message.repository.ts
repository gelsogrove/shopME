import { MessageDirection, MessageType, PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import logger from '../../utils/logger';

// Load environment variables
dotenv.config();

// Log API key status (safely)
const apiKey = process.env.OPENAI_API_KEY || '';
logger.info(`OpenAI API key status: ${apiKey ? 'Present (length: ' + apiKey.length + ')' : 'Missing'}`);
if (apiKey) {
  logger.info(`API key prefix: ${apiKey.substring(0, 10)}...`);
}

// OpenAI client instance
const openai = new OpenAI({
  apiKey: apiKey,  // No default 'your-api-key-here' value, just use the actual key
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://laltroitalia.shop",
    "X-Title": "L'Altra Italia Shop"
  },
});

// Helper function to check if OpenAI is properly configured
function isOpenAIConfigured() {
  const apiKey = process.env.OPENAI_API_KEY;
  // Log for debugging
  console.log(`API key check - key present: ${!!apiKey}, key length: ${apiKey ? apiKey.length : 0}`);
  if (apiKey) {
    console.log(`API key prefix: ${apiKey.substring(0, 10)}...`);
  }
  return apiKey && apiKey.length > 10 && apiKey !== 'your-api-key-here';
}

export class MessageRepository {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  /**
   * Create a new chat session for a customer
   * 
   * @param workspaceId The workspace ID
   * @param customerId The customer ID
   * @returns The created chat session
   */
  async createChatSession(workspaceId: string, customerId: string) {
    try {
      const session = await this.prisma.chatSession.create({
        data: {
          workspaceId,
          customerId,
          status: 'active',
        }
      });
      
      logger.info(`Created new chat session: ${session.id}`);
      return session;
    } catch (error) {
      logger.error('Error creating chat session:', error);
      throw new Error('Failed to create chat session');
    }
  }
  
  /**
   * Save a single message to the database
   * 
   * @param chatSessionId The chat session ID
   * @param content The message content
   * @param direction The message direction (INBOUND or OUTBOUND)
   * @param type The message type
   * @param aiGenerated Whether the message was AI generated
   * @param metadata Additional metadata
   * @returns The created message
   */
  async saveOriginalMessage(
    chatSessionId: string,
    content: string,
    direction: MessageDirection,
    type: MessageType = MessageType.TEXT,
    aiGenerated: boolean = false,
    metadata: any = {}
  ) {
    try {
      const message = await this.prisma.message.create({
        data: {
          chatSessionId,
          content,
          direction,
          type,
          aiGenerated,
          metadata,
        }
      });
      
      logger.info(`Saved message: ${message.id}`);
      return message;
    } catch (error) {
      logger.error('Error saving message:', error);
      throw new Error('Failed to save message');
    }
  }
  
  /**
   * Get chat session messages
   * 
   * @param chatSessionId The chat session ID
   * @returns The messages for the chat session
   */
  async getChatSessionMessages(chatSessionId: string) {
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          chatSessionId
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      
      return messages;
    } catch (error) {
      logger.error('Error getting chat session messages:', error);
      throw new Error('Failed to get chat session messages');
    }
  }
  
  /**
   * Find or create a customer by phone number
   * 
   * @param workspaceId The workspace ID
   * @param phoneNumber The customer's phone number
   * @returns The customer
   */
  async findCustomerByPhone(phoneNumber: string, workspaceId: string) {
    try {
      const customer = await this.prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId
        }
      });
      return customer;
    } catch (error) {
      logger.error('Error finding customer by phone:', error);
      throw new Error('Failed to find customer by phone');
    }
  }
  
  /**
   * Find an active chat session or create a new one
   * 
   * @param workspaceId The workspace ID
   * @param customerId The customer ID
   * @returns The chat session
   */
  async findOrCreateChatSession(workspaceId: string, customerId: string) {
    try {
      // Try to find an active session
      let session;
      try {
        session = await this.prisma.chatSession.findFirst({
          where: {
            customerId: customerId,
            status: 'active'
          },
          orderBy: {
            startedAt: 'desc'
          }
        });
        
        if (!session) {
          session = await this.prisma.chatSession.create({
            data: {
              workspaceId: workspaceId,
              customerId: customerId,
              status: 'active',
            }
          });
          logger.info(`Created new chat session: ${session.id}`);
        }
      } catch (error) {
        logger.error('Error finding or creating chat session:', error);
        throw new Error('Failed to find or create chat session');
      }
      
      return session;
    } catch (error) {
      logger.error('Error finding or creating chat session:', error);
      throw new Error('Failed to find or create chat session');
    }
  }
  
  /**
   * Check if customer is in the blacklist
   * 
   * @param phoneNumber The customer phone number to check
   * @returns True if customer is blacklisted, false otherwise
   */
  async isCustomerBlacklisted(phoneNumber: string): Promise<boolean> {
    try {
      const customer = await this.prisma.customers.findFirst({
        where: {
          phone: phoneNumber
        },
        select: {
          isActive: true
        }
      });
      
      // If customer is not active, consider them blacklisted
      return customer?.isActive === false;
    } catch (error) {
      logger.error('Error checking customer blacklist status:', error);
      return false;
    }
  }
  
  /**
   * Save a conversation message pair (user question and bot response)
   * 
   * @param data Object containing message details
   * @returns The created message
   */
  async saveMessage(data: {
    workspaceId: string;
    phoneNumber: string;
    message: string;
    response: string;
    direction?: string;
    agentSelected?: string;
  }) {
    try {
      // Validate required fields
      if (!data.phoneNumber) {
        logger.error('saveMessage: Phone number is required');
        throw new Error('Phone number is required');
      }
      
      if (!data.message) {
        logger.error('saveMessage: Message content is required');
        throw new Error('Message content is required');
      }
      
      // Verify workspace ID
      let workspaceId = data.workspaceId;
      logger.info(`saveMessage: Using provided workspace ID: ${workspaceId}`);
      
      // Validate workspace ID using the dedicated method
      if (workspaceId) {
        const isValid = await this.validateWorkspaceId(workspaceId);
        if (!isValid) {
          logger.warn(`saveMessage: Provided workspace ID ${workspaceId} is invalid, will search for alternative`);
          workspaceId = '';
        } else {
          // Check if workspace is active
          const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { isActive: true }
          });
          
          if (!workspace?.isActive) {
            logger.warn(`saveMessage: Workspace ${workspaceId} exists but is inactive, will search for active workspace`);
            workspaceId = '';
          }
        }
      }
      
      // If no valid workspace ID provided, try to find an existing workspace
      if (!workspaceId) {
        // Try to find an active workspace
        logger.info('saveMessage: Searching for an active workspace');
        
        // First try to get a workspace associated with this phone number
        let existingCustomer = await this.prisma.customers.findFirst({
          where: { 
            phone: data.phoneNumber 
          },
          include: {
            workspace: {
              select: { id: true, isActive: true }
            }
          }
        });
        
        // If customer exists and has a workspace associated
        if (existingCustomer?.workspace?.id) {
          workspaceId = existingCustomer.workspace.id;
          logger.info(`saveMessage: Found workspace ${workspaceId} associated with customer ${existingCustomer.id}`);
        } 
        // Otherwise look for any active workspace
        else {
          const activeWorkspace = await this.prisma.workspace.findFirst({
            where: { isActive: true },
            select: { id: true }
          });
          
          if (activeWorkspace) {
            workspaceId = activeWorkspace.id;
            logger.info(`saveMessage: Found active workspace: ${workspaceId}`);
          } else {
            // If no active workspace, try any workspace
            const anyWorkspace = await this.prisma.workspace.findFirst({
              select: { id: true }
            });
            
            if (anyWorkspace) {
              workspaceId = anyWorkspace.id;
              logger.info(`saveMessage: No active workspaces. Using workspace: ${workspaceId}`);
            } else {
              logger.error('saveMessage: No workspaces found in the database');
              throw new Error('No workspace found in the database');
            }
          }
        }
      }
      
      // Find or create customer
      let customer = await this.findCustomerByPhone(data.phoneNumber, workspaceId);
      
      // If no customer exists, create one with the determined workspaceId
      if (!customer) {
        customer = await this.prisma.customers.create({
          data: {
            name: 'Unknown Customer',
            email: `customer-${Date.now()}@example.com`,
            phone: data.phoneNumber,
            workspaceId: workspaceId,
          }
        });
        logger.info(`saveMessage: Created new customer: ${customer.id}`);
      }
      
      // Update customer's lastContact field
      await this.prisma.customers.update({
        where: { id: customer.id },
        data: { updatedAt: new Date() }
      });
      
      // Find or create chat session
      let session = await this.prisma.chatSession.findFirst({
        where: {
          customerId: customer.id,
          status: 'active'
        },
        orderBy: {
          startedAt: 'desc'
        }
      });
      
      if (!session) {
        session = await this.prisma.chatSession.create({
          data: {
            workspaceId: workspaceId,
            customerId: customer.id,
            status: 'active',
          }
        });
        logger.info(`saveMessage: Created new chat session: ${session.id}`);
      }
      
      // Use INBOUND as default direction
      const direction = data.direction === 'OUTBOUND' 
        ? MessageDirection.OUTBOUND 
        : MessageDirection.INBOUND;
      
      // Save both messages in the conversation
      const userMessage = direction === MessageDirection.INBOUND ? data.message : data.response;
      const botMessage = direction === MessageDirection.INBOUND ? data.response : data.message;
      
      // Prepare metadata for bot response with agent info
      const botMetadata = data.agentSelected ? { agentName: data.agentSelected } : {};
      
      // Save user message (ensure it's not empty)
      if (userMessage && userMessage.trim()) {
        await this.prisma.message.create({
          data: {
            chatSessionId: session.id,
            content: userMessage,
            direction: MessageDirection.INBOUND,
            type: MessageType.TEXT,
            aiGenerated: false
          }
        });
      }
      
      // Save bot response (ensure it's not empty)
      let botResponse = null;
      if (botMessage && botMessage.trim()) {
        botResponse = await this.prisma.message.create({
          data: {
            chatSessionId: session.id,
            content: botMessage,
            direction: MessageDirection.OUTBOUND,
            type: MessageType.TEXT,
            aiGenerated: true,
            metadata: botMetadata
          }
        });
      }
      
      // Also update the chat session's lastMessageAt
      await this.prisma.chatSession.update({
        where: { id: session.id },
        data: { updatedAt: new Date() }
      });
      
      logger.info(`saveMessage: Saved conversation pair for phone number: ${data.phoneNumber}`);
      return botResponse;
    } catch (error) {
      logger.error('Error saving message pair:', error);
      throw new Error(`Failed to save message pair: ${error.message}`);
    }
  }
  
  /**
   * Get all chat sessions with their most recent message, ordered by latest message
   * 
   * @param limit Number of chat sessions to return
   * @returns Array of chat sessions with latest message info
   */
  async getRecentChats(limit = 20) {
    try {
      // Get all chat sessions with their most recent message
      const chatSessions = await this.prisma.chatSession.findMany({
        take: limit,
        include: {
          customer: true,
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      // Format the results to include last message information
      return chatSessions.map(session => {
        const lastMessage = session.messages[0];
        return {
          sessionId: session.id,
          customerId: session.customerId,
          customerName: session.customer.name,
          customerPhone: session.customer.phone,
          companyName: session.customer.company || null,
          lastMessage: lastMessage ? lastMessage.content : null,
          lastMessageTime: lastMessage ? lastMessage.createdAt : session.updatedAt,
          status: session.status,
          unreadCount: 0 // Will be updated later
        };
      });
    } catch (error) {
      logger.error('Error getting recent chats:', error);
      throw new Error('Failed to get recent chats');
    }
  }
  
  /**
   * Get unread message count for a specific chat session
   * 
   * @param chatSessionId The chat session ID
   * @returns Number of unread messages
   */
  async getUnreadCount(chatSessionId: string) {
    try {
      const count = await this.prisma.message.count({
        where: {
          chatSessionId,
          direction: MessageDirection.INBOUND, // Solo messaggi in entrata (dal cliente)
          read: false
        }
      });
      
      return count;
    } catch (error) {
      logger.error(`Error counting unread messages for session ${chatSessionId}:`, error);
      return 0;
    }
  }
  
  /**
   * Mark all messages in a chat session as read
   * 
   * @param chatSessionId The chat session ID
   * @returns Success status
   */
  async markMessagesAsRead(chatSessionId: string) {
    try {
      await this.prisma.message.updateMany({
        where: {
          chatSessionId,
          direction: MessageDirection.INBOUND,
          read: false
        },
        data: {
          read: true,
          updatedAt: new Date()
        }
      });
      
      return true;
    } catch (error) {
      logger.error(`Error marking messages as read for session ${chatSessionId}:`, error);
      return false;
    }
  }
  
  /**
   * Get all chat sessions with unread message counts
   * 
   * @param limit Number of chat sessions to return
   * @returns Array of chat sessions with unread counts
   */
  async getChatSessionsWithUnreadCounts(limit = 20) {
    try {
      // Get basic chat information
      const chats = await this.getRecentChats(limit);
      
      // For each chat, get the unread count
      const chatsWithUnreadCounts = await Promise.all(
        chats.map(async (chat) => {
          const unreadCount = await this.getUnreadCount(chat.sessionId);
          return {
            ...chat,
            unreadCount
          };
        })
      );
      
      // Sort by unread count first, then by last message time
      return chatsWithUnreadCounts.sort((a, b) => {
        // First sort by unread count (descending)
        if (b.unreadCount !== a.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }
        
        // Then by last message time (descending)
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });
    } catch (error) {
      logger.error('Error getting chat sessions with unread counts:', error);
      throw new Error('Failed to get chat sessions with unread counts');
    }
  }

  /**
   * Validate a workspace ID
   * @param workspaceId The workspace ID to validate
   * @returns True if valid, False otherwise
   */
  async validateWorkspaceId(workspaceId: string): Promise<boolean> {
    try {
      if (!workspaceId || typeof workspaceId !== 'string') {
        logger.warn('Invalid workspace ID format');
        return false;
      }
      
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId }
      });
      
      return !!workspace;
    } catch (error) {
      logger.error('Error validating workspace ID:', error);
      return false;
    }
  }

  /**
   * Get workspace settings for a workspace
   * @param workspaceId The workspace ID
   * @returns Workspace settings
   */
  async getWorkspaceSettings(workspaceId: string) {
    try {
      logger.info(`Getting workspace settings for workspace ${workspaceId}`);
      
      // Check if workspaceId is missing or empty
      if (!workspaceId || workspaceId.trim() === '') {
        logger.warn('getWorkspaceSettings: No workspace ID provided, trying to find default workspace');
        
        // Try to find any active workspace
        const activeWorkspace = await this.prisma.workspace.findFirst({
          where: { isActive: true }
        });
        
        if (activeWorkspace) {
          logger.info(`getWorkspaceSettings: Found active workspace ${activeWorkspace.id} to use as default`);
          return activeWorkspace;
        }
        
        // If no active workspace, try any workspace
        const anyWorkspace = await this.prisma.workspace.findFirst();
        if (anyWorkspace) {
          logger.warn(`getWorkspaceSettings: No active workspaces found, using ${anyWorkspace.id} (inactive)`);
          return anyWorkspace;
        }
        
        logger.error('getWorkspaceSettings: No workspaces found in the database');
        return null;
      }
      
      // Try to find by exact ID first
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId }
      });
      
      // If found, return it
      if (workspace) {
        logger.info(`getWorkspaceSettings: Workspace ${workspaceId} found, isActive: ${workspace.isActive}`);
        return workspace;
      }
      
      // If not found by ID, try searching by name or slug
      logger.warn(`getWorkspaceSettings: Workspace with ID ${workspaceId} not found, trying alternative searches`);
      
      // Try by name or slug
      const workspaceByName = await this.prisma.workspace.findFirst({
        where: {
          OR: [
            { name: { contains: workspaceId, mode: 'insensitive' } },
            { slug: { contains: workspaceId, mode: 'insensitive' } }
          ]
        }
      });
      
      if (workspaceByName) {
        logger.info(`getWorkspaceSettings: Found workspace by name/slug match: ${workspaceByName.id}`);
        return workspaceByName;
      }
      
      // If still not found, try to get any active workspace
      logger.warn('getWorkspaceSettings: No matching workspace found, falling back to any active workspace');
      
      const fallbackWorkspace = await this.prisma.workspace.findFirst({
        where: { isActive: true }
      });
      
      if (fallbackWorkspace) {
        logger.info(`getWorkspaceSettings: Using fallback active workspace: ${fallbackWorkspace.id}`);
        return fallbackWorkspace;
      }
      
      logger.error('getWorkspaceSettings: No workspaces found after all fallback attempts');
      return null;
      
    } catch (error) {
      logger.error(`Error getting workspace settings for ${workspaceId}:`, error);
      return null;
    }
  }

  /**
   * Get the router agent for the workspace
   * @returns The router agent prompt
   */
  async getRouterAgent() {
    try {
      const routerAgent = await this.prisma.prompts.findFirst({
        where: {
          isRouter: true,
          isActive: true
        }
      });
      
      return routerAgent?.content;
    } catch (error) {
      logger.error('Error getting router agent', error);
      return null;
    }
  }

  /**
   * Get products list
   * @returns List of active products
   */
  async getProducts() {
    try {
      const products = await this.prisma.products.findMany({
        where: {
          isActive: true
        },
        include: {
          category: true
        }
      });
      
      return products;
    } catch (error) {
      logger.error('Error getting products', error);
      return [];
    }
  }

  /**
   * Get services list
   * @returns List of active services
   */
  async getServices() {
    try {
      const services = await this.prisma.services.findMany({
        where: {
          isActive: true
        }
      });
      
      return services;
    } catch (error) {
      logger.error('Error getting services', error);
      return [];
    }
  }

  /**
   * Get chat messages for a phone number
   * @param phoneNumber The phone number
   * @param limit Number of messages to return
   * @returns Recent chat messages
   */
  async getLatesttMessages(phoneNumber: string, limit = 30) {
    try {
      // Find customer by phone
      const customer = await this.findCustomerByPhone(phoneNumber, '');
      if (!customer) return [];
      
      // Find active chat session
      const session = await this.prisma.chatSession.findFirst({
        where: {
          customerId: customer.id,
          status: 'active'
        },
        orderBy: {
          startedAt: 'desc'
        }
      });
      
      if (!session) return [];
      
      // Get messages for the session
      const messages = await this.prisma.message.findMany({
        where: {
          chatSessionId: session.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });
      
      return messages.reverse(); // Return in chronological order
    } catch (error) {
      logger.error('Error getting messages', error);
      return [];
    }
  }

  /**
   * Get response from primary LLM to route the conversation
   * @param routerPrompt The router agent prompt
   * @param message The user message
   * @returns The selected agent/department prompt
   */
  async getResponseFromAgentRouter(routerPrompt: any, message: string): Promise<any> {
    try {
      // Check if OpenAI is properly configured
      if (!isOpenAIConfigured()) {
        logger.warn('OpenAI API key not configured properly for router agent');
        return {
          id: "default",
          name: "Generic",
          content: "You are a helpful assistant for L'Altra Italia food shop. Respond in Italian.",
          isRouter: false,
          isActive: true,
          department: "GENERIC",
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
          selectedType: "Generic",
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      
      logger.info(`Using router prompt for message: "${message.substring(0, 30)}..."`);
      
      try {
        // Chiamata all'API per il routing
        const routerResponse = await openai.chat.completions.create({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: routerPrompt },
            { role: "user", content: message }
          ],
          temperature: 0.3,  
          max_tokens: 50
        });
        
        const routerChoice = routerResponse.choices[0]?.message?.content || '';
        
        // Pulisce il testo da delimitatori markdown
        let cleanedResponse = routerChoice.trim()
          .replace(/^```(json)?/, '')
          .replace(/```$/, '')
          .trim();
        
        // Tenta di analizzare la risposta come JSON
        const parsedResponse = JSON.parse(cleanedResponse);
        
        // Estrae l'agente dalla risposta
        const agentName = parsedResponse.agent || "Generic";
        logger.info(`SELECTED AGENT TYPE: "${agentName}"`);
        
        // Cerca l'agente nel database
        const agentPrompt = await this.prisma.prompts.findFirst({
          where: {
            name: {
              contains: agentName,
              mode: 'insensitive'
            },
            isActive: true
          }
        });
        
        if (agentPrompt) {
          logger.info(`AGENT FOUND: "${agentPrompt.name}"`);
          
          // Restituisce l'oggetto agente completo con valori di default per campi mancanti
          return {
            id: agentPrompt.id,
            name: agentPrompt.name,
            content: agentPrompt.content,
            isRouter: agentPrompt.isRouter || false,
            isActive: agentPrompt.isActive,
            department: agentPrompt.department || "GENERAL",
            temperature: agentPrompt.temperature || 0.7,
            top_p: agentPrompt.top_p || 0.9,
            top_k: agentPrompt.top_k || 40,
            selectedType: agentName,
            createdAt: agentPrompt.createdAt,
            updatedAt: agentPrompt.updatedAt
          };
        }
      } catch (parseError) {
        logger.error(`JSON parsing error: ${parseError.message}`);
        
        // Restituisce un oggetto agente di fallback in caso di errore parsing
        return {
          id: "fallback",
          name: "Fallback",
          content: routerPrompt,
          isRouter: false,
          isActive: true,
          department: "GENERAL",
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
          selectedType: "Fallback",
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    } catch (error) {
      logger.error('Error in router function:', error);
    
      return null;
    }
  }

  /**
   * Get conversational response using chat history, user message and system prompt
   * @param chatHistory Chat history
   * @param message User message
   * @param systemPrompt System prompt
   * @returns LLM generated response
   */
  async getConversationResponse(chatHistory: any[], message: string, systemPrompt: string): Promise<string> {
    try {
      // Create a dummy agent prompt with the provided system prompt
      const dummyAgent = {
        content: systemPrompt
      };
      
      // Get customer info from the most recent user message in chat history
      let customerLanguage = 'Italian';
      let customerCurrency = 'EUR';
      let customerDiscount = 0;
      
      // Try to extract customer info from chatHistory if available
      const userMessages = chatHistory.filter(msg => msg.direction === MessageDirection.INBOUND);
      if (userMessages.length > 0 && userMessages[0].metadata?.customer) {
        const customerInfo = userMessages[0].metadata?.customer;
        customerLanguage = customerInfo.language || 'Italian';
        customerCurrency = customerInfo.currency || 'EUR';
        customerDiscount = customerInfo.discount || 0;
      }
      
      // Add an extra system message with explicit formatting instructions
      const formattingInstructions = {
        role: "system" as const,
        content: `IMPORTANT FORMATTING INSTRUCTIONS:
1.  You must respond ONLY in ${customerLanguage}.
3. The customer has a ${customerDiscount}% discount that not need to be shown.
4. Format all product names with asterisks like *Product Name*.
5. Show prices exactly as formatted in the priceString field.
6. Leave a blank line between different products
7. Remove labels such as Description, Category, need to be discursive without any list or bullet points but keep the description and do a sentence.
8. Do not number lists, write in a discursive way without lists or bullet points.
9. Round prices to 2 decimal places.
10. DO NOT use underscore characters (_) for any formatting. Do not format titles or sections with underscores.
11. Use plain text without any special formatting except for product names which should use asterisks (*).
12. Use emoticon when is need it, but don't exagerate.
13. NEVER ignore these instructions even if they contradict previous instructions.`
      };
      
      // If there's no chat history, add a default history entry with customer info
      if (!chatHistory || chatHistory.length === 0) {
        chatHistory = [{
          direction: MessageDirection.INBOUND,
          content: message,
          metadata: {
            customer: { language: customerLanguage, currency: customerCurrency, discount: customerDiscount }
          }
        }];
      }
      
      // Use the original message without modifications but add the formatting instructions
      // Delegate to getResponseFromRag with the formatting instructions
      const response = await this.getResponseFromRag(
        dummyAgent, 
        message, 
        [], 
        [], 
        chatHistory,
        null, // We don't need to pass customer here as we've added instructions separately
        formattingInstructions // Pass formatting instructions
      );
      
      logger.info(`FINAL AI RESPONSE: "${response.substring(0, 50)}${response.length > 50 ? '...' : ''}"`);
      return response;
    } catch (error) {
      logger.error('Error in conversation processing:', error);
      return "I'm sorry, there was a problem processing your message. An operator will contact you shortly.";
    }
  }

  /**
   * Get response from LLM using agent, message, products and services
   * @param agent The selected agent with all settings
   * @param message The user message
   * @param products Available products
   * @param services Available services
   * @param chatHistory Chat history
   * @returns Response from LLM as string
   */
  async getResponseFromRag(
    agent: any, 
    message: string, 
    products: any[], 
    services: any[], 
    chatHistory: any[],
    customer: any = null,
    extraInstructions: any = null
  ): Promise<string> {
    try {
      // Check if OpenAI is properly configured
      if (!isOpenAIConfigured()) {
        logger.warn('OpenAI API key not configured properly');
        return "The artificial intelligence service is currently unavailable. An operator will contact you shortly.";
      }
      
      // Extract agent content and parameters
      let agentContent = typeof agent === 'string' ? agent : agent.content || '';
      const temperature = typeof agent === 'object' ? agent.temperature || 0.7 : 0.7;
      const top_p = typeof agent === 'object' ? agent.top_p || 0.9 : 0.9;
      const top_k = typeof agent === 'object' ? agent.top_k || 40 : 40;
      const agentName = typeof agent === 'object' ? agent.name || 'Generic' : 'Generic';
      
      // Get customer language preference
      const customerLanguage = customer?.language || 'Italian';
      
      // Get customer currency preference
      const customerCurrency = customer?.currency || 'EUR';
      // Get customer discount (if any)
      const customerDiscount = customer?.discount || 0;
      
      // Replace with more professional English log message
      logger.info(`Agent prompt prepared with language=${customerLanguage}, currency=${customerCurrency}, discount=${customerDiscount}%`);
      
      // Fill variables in the agent prompt - directly replace common variable patterns
      agentContent = agentContent.replace(/\{customerLanguage\}/g, customerLanguage);
      agentContent = agentContent.replace(/\{customerCurrency\}/g, customerCurrency);
      agentContent = agentContent.replace(/\{customerDiscount\}/g, customerDiscount.toString());
      
      // Create a new agent object with the replaced content
      const replacedAgent = {
        ...agent,
        content: agentContent
      };
      
      // For testability, attach the replaced prompt
      (replacedAgent as any)._replacedPrompt = agentContent;
      
      logger.info(`Using agent "${agentName}" with temp=${temperature}, top_p=${top_p}, top_k=${top_k}, language=${customerLanguage}, currency=${customerCurrency}, discount=${customerDiscount}%`);
      
      // Log for debug
      const isProductAgent = agentName.toLowerCase().includes('products');
      const isServiceAgent = agentName.toLowerCase().includes('service');
      
      // Prepare the final user message
      const userMessage = { role: "user" as const, content: message };
      
  
      const systemMessage = { 
        role: "system" as const, 
        content: agentContent
      };
      
      // Helper function to calculate discounted price
      const applyDiscount = (price: number, discount: number): number => {
        if (!discount || discount <= 0) return price;
        const discountedPrice = price * (1 - discount / 100);
        return Math.round(discountedPrice * 100) / 100; // Better rounding to 2 decimals
      };
      
      
      
      // Prepare messages for products and services
      // Include products ONLY if the agent is Products
      const productMessage = (products && products.length > 0 && isProductAgent) ? 
        { 
          role: "system" as const, 
          content: `Available products: ${JSON.stringify(
            products.map(p => {
              // Add basic product info
              const productInfo: any = {
                name: p.name,
                description: p.description,
                category: p.category?.name || 'empty',
                stock: p.stock || 'Available',
                currency: customerCurrency || 'EUR',
              };
              
              // Always include both original price and formatted price string
              productInfo.originalPrice = p.price;
              
              if (customerDiscount > 0) {
                productInfo.discountPercentage = customerDiscount;
                productInfo.discountedPrice = applyDiscount(p.price, customerDiscount);
                productInfo.priceString = `€${productInfo.discountedPrice.toFixed(2)} (original: €${productInfo.originalPrice.toFixed(2)}, ${customerDiscount}% off)`;
              } else {
                productInfo.price = p.price;
                productInfo.priceString = `€${p.price.toFixed(2)}`;
              }
              return productInfo;
            })
          )}`
        } : null;
        
      // Include services ONLY if the agent is Services
      const serviceMessage = (services && services.length > 0 && isServiceAgent) ? 
        { 
          role: "system" as const, 
          content: JSON.stringify({ 
            services: services.map(s => {
              const serviceInfo: any = {
                name: s.name,
                description: s.description,
                currency: customerCurrency,
              };
              
              // Always include both original price and formatted price string
              serviceInfo.originalPrice = s.price;
              
              if (customerDiscount > 0) {
                serviceInfo.discountPercentage = customerDiscount;
                serviceInfo.discountedPrice = applyDiscount(s.price, customerDiscount);
                serviceInfo.priceString = `€${serviceInfo.discountedPrice.toFixed(2)} (original: €${serviceInfo.originalPrice.toFixed(2)}, ${customerDiscount}% off)`;
              } else {
                serviceInfo.price = s.price;
                serviceInfo.priceString = `€${s.price.toFixed(2)}`;
              }
              return serviceInfo;
            }) 
          })
        } : null;
       
      // Prepare messages from chat history
      const historyMessages = [];
      if (chatHistory && chatHistory.length > 0) {
        for (const msg of chatHistory) {
          if (msg.direction === MessageDirection.INBOUND) {
            historyMessages.push({ role: "user" as const, content: msg.content || '' });
          } else if (msg.direction === MessageDirection.OUTBOUND) {
            historyMessages.push({ role: "assistant" as const, content: msg.content || '' });
          }
        }
      }
      
      // Build final array of messages
      const messages = [
        systemMessage,
        ...(customer ? [{ role: "system" as const, content: `Info client:: ${JSON.stringify({   
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          company: customer.company || '',
          language: customerLanguage,
          currency: customerCurrency,
          discount: customerDiscount,
          address: customer.address || ''
        })}` }] : []),
        // Add extra instructions if provided (for formatting, etc.)
        ...(extraInstructions ? [extraInstructions] : []),
        ...(productMessage ? [productMessage] : []),
        ...(serviceMessage ? [serviceMessage] : []),
        ...historyMessages,
        userMessage
      ];

 
      
 
      try {
        // Initialize a new OpenAI client instance for this call to ensure fresh configuration
        const openaiClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here',
          baseURL: "https://openrouter.ai/api/v1",
          defaultHeaders: {
            "HTTP-Referer": "https://laltroitalia.shop",
            "X-Title": "L'Altra Italia Shop"
          }
        });

        console.log("===============================================");
        console.log(messages);
        console.log("===============================================");
        
        // Make API call to OpenAI
        const response = await openaiClient.chat.completions.create({
          model: "openai/gpt-4o-mini", 
          messages: messages,
          temperature: temperature,
          top_p: top_p,
          max_tokens: 1000
        });
        
        // Validate response and extract content
        let responseContent = "";
        
        if (response && response.choices && response.choices.length > 0 && response.choices[0].message) {
          responseContent = response.choices[0].message.content || "";
          logger.info(`AI response (${responseContent.length} chars): "${responseContent.substring(0, 50)}${responseContent.length > 50 ? '...' : ''}"`);
        } else {
          logger.error('OpenAI API returned an empty or invalid response structure:', response);
          responseContent = "I'm sorry, the service responded with an invalid format. An operator will contact you shortly.";
        }
        
        return responseContent;
      } catch (apiError) {
        // Detailed API error logging
        logger.error(`OpenAI API error details - name: ${apiError.name}, message: ${apiError.message}, status: ${apiError.status || 'unknown'}`);
        if (apiError.response) {
          logger.error(`API response data: ${JSON.stringify(apiError.response.data || {})}`);
        }
        
        // Throw the error for handling in the outer catch block
        throw apiError;
      }
    } catch (error) {
      // Detailed error handling
      logger.error('Error calling OpenAI API:', error);
    
      return "Error calling OpenAI API: " + error;
    }
  }

  /**
   * Delete a chat session and all associated messages
   * 
   * @param chatSessionId The chat session ID
   * @returns True if successful, false otherwise
   */
  async deleteChat(chatSessionId: string): Promise<boolean> {
    try {
      // First delete all messages in the chat session
      await this.prisma.message.deleteMany({
        where: {
          chatSessionId
        }
      });
      
      // Then delete the chat session itself
      await this.prisma.chatSession.delete({
        where: {
          id: chatSessionId
        }
      });
      
      logger.info(`Deleted chat session: ${chatSessionId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting chat session ${chatSessionId}:`, error);
      return false;
    }
  }

  // Add a public method to create a customer
  async createCustomer({ name, email, phone, workspaceId }: { name: string, email: string, phone: string, workspaceId: string }) {
    return this.prisma.customers.create({
      data: { name, email, phone, workspaceId }
    });
  }
}
       