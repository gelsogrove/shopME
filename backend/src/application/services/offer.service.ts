import { Offer } from "../../domain/entities/offer.entity";
import { IOfferRepository } from "../../domain/repositories/offer.repository.interface";
import { OfferRepository } from "../../infrastructure/repositories/offer.repository";
import logger from "../../utils/logger";

/**
 * Service layer for Offers
 * Handles business logic for offers
 */
export class OfferService {
  private offerRepository: IOfferRepository;

  constructor() {
    this.offerRepository = new OfferRepository();
  }

  /**
   * Get all offers for a workspace
   */
  async getAllOffers(workspaceId: string): Promise<Offer[]> {
    try {
      return await this.offerRepository.findAll(workspaceId);
    } catch (error) {
      logger.error("Error getting all offers:", error);
      throw error;
    }
  }

  /**
   * Get active offers, optionally filtered by category
   */
  async getActiveOffers(workspaceId: string, categoryId?: string): Promise<Offer[]> {
    try {
      return await this.offerRepository.findActive(workspaceId, categoryId);
    } catch (error) {
      logger.error("Error getting active offers:", error);
      throw error;
    }
  }

  /**
   * Get offer by ID
   */
  async getOfferById(id: string, workspaceId: string): Promise<Offer | null> {
    try {
      return await this.offerRepository.findById(id, workspaceId);
    } catch (error) {
      logger.error(`Error getting offer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new offer
   */
  async createOffer(data: any): Promise<Offer> {
    try {
      // Validate required fields
      if (!data.name || !data.discountPercent || !data.startDate || !data.endDate) {
        throw new Error("Missing required fields");
      }
      
      // Create offer entity for validation
      const offerToValidate = new Offer(data);
      if (!offerToValidate.validate()) {
        throw new Error("Invalid offer data");
      }
      
      return await this.offerRepository.create(data);
    } catch (error) {
      logger.error("Error creating offer:", error);
      throw error;
    }
  }

  /**
   * Update an offer
   */
  async updateOffer(id: string, data: any): Promise<Offer> {
    try {
      // Check if offer exists
      const existingOffer = await this.offerRepository.findById(id, data.workspaceId);
      if (!existingOffer) {
        throw new Error("Offer not found");
      }
      
      // Create merged offer for validation
      const offerToUpdate = new Offer({
        ...existingOffer,
        ...data
      });
      
      if (!offerToUpdate.validate()) {
        throw new Error("Invalid offer data");
      }
      
      return await this.offerRepository.update(id, data);
    } catch (error) {
      logger.error(`Error updating offer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an offer
   */
  async deleteOffer(id: string): Promise<boolean> {
    try {
      return await this.offerRepository.delete(id);
    } catch (error) {
      logger.error(`Error deleting offer ${id}:`, error);
      throw error;
    }
  }

  async getBestDiscount(workspaceId: string, categoryId?: string): Promise<number> {
    try {
      const offers = await this.offerRepository.getActiveOffers(workspaceId, categoryId) as Offer[];
      
      if (!offers || offers.length === 0) return 0;
      
      // Trova l'offerta con lo sconto maggiore
      const bestDiscount = Math.max(...offers.map(offer => offer.discountPercent));
      return bestDiscount;
    } catch (error) {
      logger.error('Error in getBestDiscount service:', error);
      return 0;
    }
  }
} 