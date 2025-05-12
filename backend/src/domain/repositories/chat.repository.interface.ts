import { Chat, ChatProps } from '../entities/chat.entity';

export interface ChatRepositoryInterface {
  /**
   * Find all chats for a workspace
   */
  findAllByWorkspace(workspaceId: string): Promise<Chat[]>;

  /**
   * Find chats by user ID
   */
  findByUser(userId: string): Promise<Chat[]>;

  /**
   * Find chats by customer ID
   */
  findByCustomer(customerId: string): Promise<Chat[]>;

  /**
   * Find a chat by ID
   */
  findById(id: string, workspaceId: string): Promise<Chat | null>;

  /**
   * Create a new chat
   */
  create(chat: Chat): Promise<Chat>;

  /**
   * Update an existing chat
   */
  update(id: string, workspaceId: string, data: Partial<ChatProps>): Promise<Chat | null>;

  /**
   * Delete a chat
   */
  delete(id: string, workspaceId: string): Promise<boolean>;

  /**
   * Complete a chat
   */
  markAsCompleted(id: string, workspaceId: string): Promise<Chat | null>;
} 