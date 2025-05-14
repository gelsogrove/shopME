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
      
      return faqs.map(faq => new FAQ(faq));
    } catch (error) {
      logger.error("Error finding FAQs:", error);
      throw error;
    }
  }
  
  /**
   * Find a single FAQ by ID
   */
  async findById(id: string): Promise<FAQ | null> {
    try {
      const faq = await prisma.fAQ.findUnique({
        where: { id }
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
  async update(id: string, data: Partial<FAQ>): Promise<FAQ | null> {
    try {
      const faq = await prisma.fAQ.update({
        where: { id },
        data: data as any
      });
      
      return new FAQ(faq);
    } catch (error) {
      logger.error(`Error updating FAQ ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Delete a FAQ
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.fAQ.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      logger.error(`Error deleting FAQ ${id}:`, error);
      return false;
    }
  }
} 