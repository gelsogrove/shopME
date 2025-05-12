import { Message, MessageProps } from '../entities/message.entity';

export interface MessageRepositoryInterface {
  /**
   * Find all messages for a chat
   */
  findByChatId(chatId: string): Promise<Message[]>;

  /**
   * Find a message by ID
   */
  findById(id: string): Promise<Message | null>;

  /**
   * Create a new message
   */
  create(message: Message): Promise<Message>;

  /**
   * Update an existing message
   */
  update(id: string, data: Partial<MessageProps>): Promise<Message | null>;

  /**
   * Delete a message
   */
  delete(id: string): Promise<boolean>;

  /**
   * Delete all messages for a chat
   */
  deleteByChatId(chatId: string): Promise<boolean>;
} 