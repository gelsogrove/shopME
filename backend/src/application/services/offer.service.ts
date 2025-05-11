import { OfferRepository } from '../../infrastructure/repositories/offer.repository';
import logger from '../../utils/logger';

// Definizione dell'interfaccia Offer
interface Offer {
  id: string;
  name: string;
  description: string | null;
  discountPercent: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  categoryId: string | null;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  categoryName?: string;
}

export class OfferService {
  private offerRepository: OfferRepository;

  constructor() {
    this.offerRepository = new OfferRepository();
  }

  async getAllOffers(workspaceId: string) {
    try {
      return this.offerRepository.findAll(workspaceId);
    } catch (error) {
      logger.error('Error in getAllOffers service:', error);
      throw error;
    }
  }

  async getOfferById(id: string, workspaceId: string) {
    try {
      return this.offerRepository.findById(id, workspaceId);
    } catch (error) {
      logger.error(`Error in getOfferById service for offer ${id}:`, error);
      throw error;
    }
  }

  async createOffer(offer: any) {
    try {
      return this.offerRepository.create(offer);
    } catch (error) {
      logger.error('Error in createOffer service:', error);
      throw error;
    }
  }

  async updateOffer(id: string, offer: any) {
    try {
      return this.offerRepository.update(id, offer);
    } catch (error) {
      logger.error(`Error in updateOffer service for offer ${id}:`, error);
      throw error;
    }
  }

  async deleteOffer(id: string) {
    try {
      return this.offerRepository.delete(id);
    } catch (error) {
      logger.error(`Error in deleteOffer service for offer ${id}:`, error);
      throw error;
    }
  }

  async getActiveOffers(workspaceId: string, categoryId?: string) {
    try {
      return this.offerRepository.getActiveOffers(workspaceId, categoryId) as Promise<Offer[]>;
    } catch (error) {
      logger.error('Error in getActiveOffers service:', error);
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