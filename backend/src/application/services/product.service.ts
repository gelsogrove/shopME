import { ProductRepository } from '../../infrastructure/repositories/product.repository';
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

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getAllProducts(workspaceId: string) {
    try {
      return this.productRepository.findAll(workspaceId);
    } catch (error) {
      logger.error('Error in getAllProducts service:', error);
      throw error;
    }
  }

  async getProductById(id: string, workspaceId: string) {
    try {
      return this.productRepository.findById(id, workspaceId);
    } catch (error) {
      logger.error(`Error in getProductById service for product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Recupera i prodotti con gli sconti applicati, considerando solo gli sconti cliente
   * (rimosso supporto offerte)
   * @param workspaceId ID del workspace
   * @param customer Cliente per cui calcolare gli sconti (opzionale)
   * @returns Prodotti con lo sconto migliore applicato
   */
  async getProductsWithOffersApplied(workspaceId: string, customer?: any) {
    try {
      // Ottieni tutti i prodotti
      const products = await this.productRepository.findAll(workspaceId);
      
      // Se non ci sono prodotti, ritorna un array vuoto
      if (!products || products.length === 0) return [];
      
      // Non ci sono più offerte attive
      const activeOffers: Offer[] = [];
      const hasActiveOffers = false;
      
      // Ottieni lo sconto cliente se disponibile
      const customerDiscount = customer?.discount || 0;
      
      // Per ogni prodotto, verifica gli sconti applicabili
      return products.map(product => {
        // Se non ci sono offerte attive né sconti cliente, restituisci il prodotto invariato
        if (!hasActiveOffers && !customerDiscount) return product;
        
        // Le offerte sono state rimosse, quindi lo sconto migliore è sempre 0
        let bestOfferDiscount = 0;
        
        // Confronta lo sconto delle offerte con lo sconto cliente
        if (bestOfferDiscount > customerDiscount) {
          // L'offerta ha uno sconto migliore
          const originalPrice = product.price;
          const discountedPrice = originalPrice * (1 - bestOfferDiscount / 100);
          
          return {
            ...product,
            originalPrice,
            price: discountedPrice,
            hasDiscount: true,
            discountPercent: bestOfferDiscount,
            discountSource: 'offer'
          };
        } else if (customerDiscount > 0) {
          // Lo sconto cliente è migliore (o non ci sono offerte)
          const originalPrice = product.price;
          const discountedPrice = originalPrice * (1 - customerDiscount / 100);
          
          return {
            ...product,
            originalPrice,
            price: discountedPrice,
            hasDiscount: true,
            discountPercent: customerDiscount,
            discountSource: 'customer'
          };
        }
        
        // Nessuno sconto applicabile
        return product;
      });
    } catch (error) {
      logger.error('Error in getProductsWithOffersApplied service:', error);
      throw error;
    }
  }
} 