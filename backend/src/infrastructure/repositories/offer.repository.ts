import { Offer } from "../../domain/entities/offer.entity";
import { IOfferRepository } from "../../domain/repositories/offer.repository.interface";
import { prisma } from "../../lib/prisma";
import logger from '../../utils/logger';

/**
 * Implementation of Offer Repository using Prisma
 */
export class OfferRepository implements IOfferRepository {
  /**
   * Find all offers in a workspace
   */
  async findAll(workspaceId: string): Promise<Offer[]> {
    const offers = await prisma.offers.findMany({
      where: { workspaceId }
    });
    
    return offers.map(offer => new Offer(offer));
  }
  
  /**
   * Find active offers in a workspace, optionally filtered by category
   */
  async findActive(workspaceId: string, categoryId?: string): Promise<Offer[]> {
    const now = new Date();
    
    const where: any = {
      workspaceId,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now }
    };
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    try {
      const offers = await prisma.offers.findMany({
        where
      });
      
      return offers.map(offer => new Offer(offer));
    } catch (error) {
      logger.error("Error finding active offers:", error);
      throw error;
    }
  }
  
  /**
   * Get active offers in a workspace, optionally filtered by category
   * This is an alias for findActive for backward compatibility
   */
  async getActiveOffers(workspaceId: string, categoryId?: string): Promise<Offer[]> {
    return this.findActive(workspaceId, categoryId);
  }
  
  /**
   * Find a single offer by ID and workspace
   */
  async findById(id: string, workspaceId: string): Promise<Offer | null> {
    const offer = await prisma.offers.findFirst({
      where: { id, workspaceId }
    });
    
    return offer ? new Offer(offer) : null;
  }
  
  /**
   * Create a new offer
   */
  async create(data: any): Promise<Offer> {
    const offer = await prisma.offers.create({
      data
    });
    
    return new Offer(offer);
  }
  
  /**
   * Update an existing offer
   */
  async update(id: string, data: any): Promise<Offer> {
    try {
      logger.info(`Updating offer with ID: ${id}`);
      logger.debug(`Update data:`, data);
      
      // Rimuovi i campi che potrebbero causare problemi con Prisma
      const { createdAt, updatedAt, ...updateData } = data;
      
      // Assicurati che l'offerta esista e appartenga al workspace specificato
      const existingOffer = await prisma.offers.findFirst({
        where: { 
          id,
          workspaceId: updateData.workspaceId
        }
      });
      
      if (!existingOffer) {
        throw new Error(`Offer with ID ${id} not found in workspace ${updateData.workspaceId}`);
      }
      
      const offer = await prisma.offers.update({
        where: { id },
        data: updateData
      });
      
      logger.info(`Successfully updated offer with ID: ${id}`);
      return new Offer(offer);
    } catch (error) {
      logger.error(`Error updating offer with ID ${id}:`, error);
      throw new Error(`Failed to update offer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Delete an offer
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.offers.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      logger.error(`Error deleting offer ${id}:`, error);
      return false;
    }
  }
} 