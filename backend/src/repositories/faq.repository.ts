import { FAQ } from "../domain/entities/faq.entity";
import { IFaqRepository } from "../domain/repositories/faq.repository.interface";
import { prisma } from "../lib/prisma";
import logger from "../utils/logger";

/**
 * Implementation of FAQ Repository using Prisma
 */
export class FaqRepository implements IFaqRepository {
  /**
   * Find all FAQs in a workspace
   */
  async findAll(workspaceId: string): Promise<FAQ[]> {
    try {
      const faqs = await prisma.fAQ.findMany({
        where: { workspaceId }
      });
      
      return faqs ? faqs.map(faq => new FAQ(faq)) : [];
    } catch (error) {
      logger.error("Error finding FAQs:", error);
      return [];
    }
  }
  
  /**
   * Find a single FAQ by ID and workspace
   */
  async findById(id: string, workspaceId: string): Promise<FAQ | null> {
    try {
      const faq = await prisma.fAQ.findFirst({
        where: { 
          id,
          workspaceId 
        }
      });
      
      return faq ? new FAQ(faq) : null;
    } catch (error) {
      logger.error(`Error finding FAQ ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Create a new FAQ
   */
  async create(data: Partial<FAQ>): Promise<FAQ> {
    try {
      const faq = await prisma.fAQ.create({
        data: data as any
      });
      
      return new FAQ(faq);
    } catch (error) {
      logger.error("Error creating FAQ:", error);
      throw error;
    }
  }
  
  /**
   * Update an existing FAQ
   */
  async update(id: string, workspaceId: string, data: Partial<FAQ>): Promise<FAQ | null> {
    try {
      await prisma.fAQ.updateMany({
        where: { 
          id,
          workspaceId 
        },
        data: data as any
      });
      
      // Get updated FAQ
      return this.findById(id, workspaceId);
    } catch (error) {
      logger.error(`Error updating FAQ ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Delete a FAQ
   */
  async delete(id: string, workspaceId: string): Promise<boolean> {
    try {
      const result = await prisma.fAQ.deleteMany({
        where: { 
          id,
          workspaceId 
        }
      });
      
      return result.count > 0;
    } catch (error) {
      logger.error(`Error deleting FAQ ${id}:`, error);
      return false;
    }
  }
} 