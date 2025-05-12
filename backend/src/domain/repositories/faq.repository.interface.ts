import { FAQ } from "../entities/faq.entity";

/**
 * Interface for FAQ Repository
 * Defines all data operations for FAQ entity
 */
export interface IFaqRepository {
  /**
   * Find all FAQs in a workspace
   */
  findAll(workspaceId: string): Promise<FAQ[]>;
  
  /**
   * Find a single FAQ by ID
   */
  findById(id: string): Promise<FAQ | null>;
  
  /**
   * Create a new FAQ
   */
  create(data: Partial<FAQ>): Promise<FAQ>;
  
  /**
   * Update an existing FAQ
   */
  update(id: string, data: Partial<FAQ>): Promise<FAQ | null>;
  
  /**
   * Delete a FAQ
   */
  delete(id: string): Promise<boolean>;
} 