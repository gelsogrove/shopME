import { MessageDirection, MessageType, PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import logger from '../../utils/logger';

// OpenAI client instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here', // Usa variabile d'ambiente o configura in un posto sicuro
});

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
  async findOrCreateCustomerByPhone(workspaceId: string, phoneNumber: string) {
    try {
      // Try to find an existing customer with this phone number
      let customer = await this.prisma.customers.findFirst({
        where: {
          phone: phoneNumber,
          workspaceId
        }
      });
      
      // If no customer found, create a new one
      if (!customer) {
        customer = await this.prisma.customers.create({
          data: {
            name: 'Unknown Customer',
            email: `customer-${Date.now()}@example.com`,
            phone: phoneNumber,
            workspaceId,
          }
        });
        
        logger.info(`Created new customer: ${customer.id}`);
      }
      
      return customer;
    } catch (error) {
      logger.error('Error finding or creating customer:', error);
      throw new Error('Failed to find or create customer');
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
  
  
  async findCustomerByPhone(phoneNumber: string) {
    try {
      const whereClause: any = { phone: phoneNumber };
      
      const customer = await this.prisma.customers.findFirst({
        where: whereClause
      });
      
      return customer;
    } catch (error) {
      logger.error('Error finding customer:', error);
      return null;
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
  }) {
    try {
      // Verifica se esiste un workspace valido
      let workspaceId = data.workspaceId;
      
      // Cerca un workspace valido nel database
      if (!workspaceId) {
        // Cerca il primo workspace disponibile
        const workspace = await this.prisma.workspace.findFirst({
          select: { id: true }
        });
        
        if (workspace) {
          workspaceId = workspace.id;
          logger.info(`Using workspace: ${workspaceId}`);
        } else {
          throw new Error('No workspace found in the database');
        }
      } else {
        // Verifica che il workspace fornito esista
        const workspace = await this.prisma.workspace.findUnique({
          where: { id: workspaceId },
          select: { id: true }
        });
        
        if (!workspace) {
          // Se non esiste, cerca il primo workspace disponibile
          const firstWorkspace = await this.prisma.workspace.findFirst({
            select: { id: true }
          });
          
          if (firstWorkspace) {
            workspaceId = firstWorkspace.id;
            logger.info(`Provided workspace not found. Using workspace: ${workspaceId}`);
          } else {
            throw new Error('No workspace found in the database');
          }
        }
      }
      
      // Prima cerca il cliente (senza crearlo)
      let customer = await this.findCustomerByPhone(data.phoneNumber);
      
      // Se non esiste, crealo ora con il workspaceId
      if (!customer) {
        customer = await this.prisma.customers.create({
          data: {
            name: 'Unknown Customer',
            email: `customer-${Date.now()}@example.com`,
            phone: data.phoneNumber,
            workspaceId: workspaceId,
          }
        });
        logger.info(`Created new customer: ${customer.id}`);
      }
      
      // Trova o crea una sessione di chat
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
        logger.info(`Created new chat session: ${session.id}`);
      }
      
      // Use INBOUND as default direction
      const direction = data.direction === 'OUTBOUND' 
        ? MessageDirection.OUTBOUND 
        : MessageDirection.INBOUND;
      
      // Save both messages in the conversation
      const userMessage = direction === MessageDirection.INBOUND ? data.message : data.response;
      const botMessage = direction === MessageDirection.INBOUND ? data.response : data.message;
      
      // Save user message
      await this.prisma.message.create({
        data: {
          chatSessionId: session.id,
          content: userMessage,
          direction: MessageDirection.INBOUND,
          type: MessageType.TEXT,
          aiGenerated: false
        }
      });
      
      // Save bot response
      const botResponse = await this.prisma.message.create({
        data: {
          chatSessionId: session.id,
          content: botMessage,
          direction: MessageDirection.OUTBOUND,
          type: MessageType.TEXT,
          aiGenerated: true
        }
      });
      
      logger.info(`Saved conversation pair for phone number: ${data.phoneNumber}`);
      return botResponse;
    } catch (error) {
      logger.error('Error saving message pair:', error);
      throw new Error('Failed to save message pair');
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
   * Get WhatsApp channel settings for a workspace
   * @param workspaceId The workspace ID
   * @returns Channel settings with isActive status and wipMessage
   /**
    * Get workspace settings for a workspace
    * @param workspaceId The workspace ID
    * @returns Workspace settings
    */
   async getWorkspaceSettings(workspaceId: string) {
     try {
       const workspace = await this.prisma.workspace.findUnique({
         where: { id: workspaceId }
       });
       
       if (!workspace) {
         throw new Error('Workspace not found');
       }

       return workspace;
       
     } catch (error) {
       logger.error('Error getting workspace settings', error);
       throw new Error('Failed to get workspace settings');
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
       
       return routerAgent;
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
    * Get chat messages for a phone number
    * @param phoneNumber The phone number
    * @param limit Number of messages to return
    * @returns Recent chat messages
    */
   async getLatesttMessages(phoneNumber: string, limit = 30) {
     try {
       // Find customer by phone
       const customer = await this.findCustomerByPhone(phoneNumber);
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
   async getResponseFromLLM(routerPrompt: any, message: string): Promise<any> {
     try {
       // In una implementazione reale, qui chiameresti un API di un LLM come OpenAI
       // Per ora simulo una risposta basica
       console.log(`Routing message with router prompt: ${routerPrompt?.name || 'Default router'}`);
       
       // Controlla se c'è una menzione di prodotti
       if (message.toLowerCase().includes('prodotto') || 
           message.toLowerCase().includes('product') ||
           message.toLowerCase().includes('pizza') ||
           message.toLowerCase().includes('pasta')) {
         // Cerca un agent specializzato in prodotti
         const productAgent = await this.prisma.prompts.findFirst({
           where: {
             department: 'PRODUCTS',
             isActive: true
           }
         });
         
         return productAgent || routerPrompt;
       }
       
       // Default: ritorna il router prompt stesso
       return routerPrompt;
     } catch (error) {
       console.error('Error getting response from LLM:', error);
       // In caso di errore ritorna il prompt originale
       return routerPrompt;
     }
   }

   /**
    * Get system prompt from sub-LLM using agent, message, products and history
    * @param agentPrompt The selected agent prompt
    * @param message The user message
    * @param products Available products
    * @param chatHistory Chat history
    * @returns Enriched system prompt
    */
   async getResponseFromRag(agentPrompt: any, message: string, products: any[], chatHistory: any[]): Promise<string> {
     try {
       // In una implementazione reale, qui chiameresti un'API di un LLM come OpenAI
       // Per ora creiamo un prompt di sistema semplice
       
       // Estrai contenuto del prompt agent
       const promptContent = agentPrompt?.content || "You are a helpful assistant for L'Altra Italia food shop.";
       
       // Prepara informazioni sui prodotti rilevanti (max 3 per non sovraccaricare)
       let productInfo = "";
       
       // Se il messaggio menziona prodotti, includi informazioni
       if (message.toLowerCase().includes('prodotto') || 
           message.toLowerCase().includes('product') ||
           message.toLowerCase().includes('pizza') ||
           message.toLowerCase().includes('pasta')) {
         
         // Filtra prodotti che potrebbero essere rilevanti al messaggio
         const relevantProducts = products
           .filter(p => p.name.toLowerCase().includes('pizza') || p.name.toLowerCase().includes('pasta'))
           .slice(0, 3);
         
         if (relevantProducts.length > 0) {
           productInfo = "Relevant products:\n" + 
             relevantProducts.map(p => 
               `- ${p.name}: ${p.description} (Price: €${p.price})`
             ).join("\n");
         }
       }
       
       // Costruisci il prompt di sistema
       const systemPrompt = `${promptContent}
       
${productInfo}

Remember to be helpful, concise and accurate. If you don't know something, say so.`;
       
       return systemPrompt;
     } catch (error) {
       console.error('Error getting system prompt from sub-LLM:', error);
       return agentPrompt?.content || "You are a helpful assistant.";
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
      
       const formattedHistory = chatHistory.map(msg => ({
         role: msg.direction === 'INBOUND' ? 'user' as const : 'assistant' as const,
         content: msg.content
       }));
       
       const response = await openai.chat.completions.create({
         model: "gpt-4-mini",
         messages: [
           { role: "system" as const, content: systemPrompt },
           ...formattedHistory,
           { role: "user" as const, content: message }
         ],
         temperature: 0.7,
         max_tokens: 2500
       });
       
       return response.choices[0].message.content || "Mi dispiace, non sono riuscito a generare una risposta. Riprova.";
     } catch (error) {
       console.error('Error calling LLM API:', error);
       return "Mi dispiace, c'è stato un problema con il servizio. Riprova più tardi.";
     }
   }
} ``
       