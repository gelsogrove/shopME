import axios from 'axios';
import { SecureTokenService } from '../application/services/secure-token.service';
import { TranslationService } from './translation.service';
import {
    CategoriesResponse,
    ErrorResponse,
    OffersResponse,
    ProductsResponse,
    RagSearchRequest,
    RagSearchResponse,
    ServicesResponse,
    StandardResponse,
    SuccessResponse,
    TokenResponse
} from '../types/whatsapp.types';

export interface GetAllProductsRequest {
  workspaceId: string;
  customerId: string;
}

export interface GetOrdersListLinkRequest {
  customerId: string;
  workspaceId: string;
  orderCode?: string;
}

export interface GetShipmentTrackingLinkRequest {
  customerId: string;
  workspaceId: string;
  orderCode: string;
}

export class CallingFunctionsService {
  private secureTokenService: SecureTokenService;
  private baseUrl: string;

  constructor() {
    this.secureTokenService = new SecureTokenService();
    this.baseUrl = 'http://localhost:3001/api/internal';
  }

  private createErrorResponse(error: any, context: string): ErrorResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const details = error.response?.data?.message || errorMessage;
    
    console.error(`❌ ${context} error:`, error);
    
    return {
      success: false,
      error: errorMessage,
      message: `Unable to ${context.toLowerCase()}. Please try again later.`,
      details: details,
      timestamp: new Date().toISOString()
    };
  }

  private createSuccessResponse<T>(data: T, context: string): SuccessResponse<T> {
    console.log(`✅ ${context} response:`, data);
    
    return {
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    };
  }

  public async getAllProducts(request: GetAllProductsRequest): Promise<ProductsResponse> {
    try {
      console.log('🔧 Calling getAllProducts with:', request);
      
      // Direct database query with Prisma for complete product list
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      // Get all active offers first to apply discounts
      const activeOffers = await prisma.offers.findMany({
        where: {
          workspaceId: request.workspaceId,
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() }
        },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      console.log('🎯 Active offers found:', activeOffers.length);
      
      // Get all products with categories, ordered by category name alphabetically
      const products = await prisma.products.findMany({
        where: {
          workspaceId: request.workspaceId,
          isActive: true
        },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { category: { name: 'asc' } },
          { name: 'asc' }
        ]
      });
      
      await prisma.$disconnect();
      
      if (!products || products.length === 0) {
        return {
          success: false,
          error: 'Nessun prodotto disponibile',
          message: 'Nessun prodotto disponibile',
          timestamp: new Date().toISOString()
        } as ProductsResponse;
      }
      
      // Group products by category and apply discounts
      const groupedProducts = products.reduce((acc, product) => {
        const categoryName = product.category?.name || 'Senza Categoria';
        const categoryId = product.category?.id;
        
        if (!acc[categoryName]) {
          acc[categoryName] = {
            categoryName,
            products: []
          };
        }
        
        // Check if there's an active offer for this category
        const categoryOffer = activeOffers.find(offer => 
          offer.category && offer.category.id === categoryId
        );
        
        let finalPrice = product.price;
        let hasDiscount = false;
        let discountPercent = 0;
        let originalPrice = product.price;
        
        if (categoryOffer) {
          hasDiscount = true;
          discountPercent = categoryOffer.discountPercent;
          finalPrice = product.price * (1 - discountPercent / 100);
          console.log(`💰 Applied ${discountPercent}% discount to ${product.name}: €${originalPrice} → €${finalPrice.toFixed(2)}`);
        }
        
        acc[categoryName].products.push({
          code: product.code,
          name: product.name,
          description: product.description,
          price: finalPrice, // Final discounted price
          originalPrice: hasDiscount ? originalPrice : undefined, // Show original only if discounted
          discountPercent: hasDiscount ? discountPercent : undefined,
          hasDiscount: hasDiscount,
          unit: product.unit
        });
        
        return acc;
      }, {});
      
      console.log('✅ Products grouped by category with discounts applied:', Object.keys(groupedProducts));
      
      return {
        success: true,
        data: {
          categories: Object.values(groupedProducts),
          totalProducts: products.length,
          totalCategories: Object.keys(groupedProducts).length
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error in getAllProducts:', error);
      return this.createErrorResponse(error, 'getAllProducts') as ProductsResponse;
    }
  }

  public async getServices(request: GetAllProductsRequest): Promise<ServicesResponse> {
    try {
      console.log('🔧 Calling getServices with:', request);
      
      // Direct database query with Prisma for complete services list
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      // Get all services, ordered by name alphabetically
      const services = await prisma.services.findMany({
        where: {
          workspaceId: request.workspaceId,
          isActive: true
        },
        orderBy: { name: 'asc' }
      });
      
      await prisma.$disconnect();
      
      if (!services || services.length === 0) {
        return {
          success: false,
          error: 'Nessun servizio disponibile',
          message: 'Nessun servizio disponibile',
          timestamp: new Date().toISOString()
        } as ServicesResponse;
      }
      
      console.log('✅ Services found:', services.length);
      
      return {
        success: true,
        data: {
          services: services.map(service => ({
            code: service.code,
            name: service.name,
            description: service.description,
            price: service.price,
            unit: service.unit
          })),
          totalServices: services.length
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error in getServices:', error);
      return this.createErrorResponse(error, 'getServices') as ServicesResponse;
    }
  }

  public async getCustomerProfileLink(request: GetOrdersListLinkRequest): Promise<TokenResponse> {
    try {
      console.log('🔧 Calling getCustomerProfileLink with:', request);
      
      // Generate secure token for profile access
      const token = await this.secureTokenService.createToken(
        'profile',
        request.workspaceId,
        { customerId: request.customerId },
        '1h'
      );
      
      if (!token) {
        console.error('❌ Failed to generate profile token');
        return {
          success: false,
          error: 'Errore nella generazione del link profilo',
          message: 'Errore nella generazione del link profilo',
          linkUrl: '',
          expiresAt: new Date().toISOString(),
          action: 'profile',
          timestamp: new Date().toISOString()
        };
      }
      
      // Generate profile link
      const profileUrl = `http://localhost:3000/customer-profile?token=${token}`;
      
      console.log('✅ Profile link generated successfully:', profileUrl);
      
      return {
        success: true,
        linkUrl: profileUrl,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        action: 'profile',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error in getCustomerProfileLink:', error);
      return this.createErrorResponse(error, 'getCustomerProfileLink') as TokenResponse;
    }
  }

  public async getAllCategories(request: GetAllProductsRequest): Promise<CategoriesResponse> {
    try {
      console.log('🔧 Calling getAllCategories with:', request);
      
      // Direct database query with Prisma for all categories
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      // Get all categories for the workspace
      const categories = await prisma.categories.findMany({
        where: {
          workspaceId: request.workspaceId,
          isActive: true
        },
        orderBy: { name: 'asc' }
      });
      
      await prisma.$disconnect();
      
      if (!categories || categories.length === 0) {
        return {
          success: false,
          error: 'Nessuna categoria disponibile al momento',
          message: 'Nessuna categoria disponibile al momento',
          timestamp: new Date().toISOString()
        } as CategoriesResponse;
      }
      
      console.log('✅ Categories found:', categories.length);
      
      return {
        success: true,
        data: {
          categories: categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description
          })),
          totalCategories: categories.length
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error in getAllCategories:', error);
      return this.createErrorResponse(error, 'getAllCategories') as CategoriesResponse;
    }
  }

  public async getActiveOffers(request: GetAllProductsRequest): Promise<OffersResponse> {
    try {
      console.log('🔧 Calling getActiveOffers with:', request);
      
      // Direct database query with Prisma for active offers
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      // Get all active offers for the workspace
      const offers = await prisma.offers.findMany({
        where: {
          workspaceId: request.workspaceId,
          isActive: true,
          startDate: { lte: new Date() }, // Started
          endDate: { gte: new Date() }    // Not ended
        },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { discountPercent: 'desc' } // Best offers first
      });
      
      await prisma.$disconnect();
      
      if (!offers || offers.length === 0) {
        return {
          success: false,
          error: 'Nessuna offerta disponibile al momento',
          message: 'Nessuna offerta disponibile al momento',
          timestamp: new Date().toISOString()
        } as OffersResponse;
      }
      
      console.log('✅ Active offers found:', offers.length);
      
      return {
        success: true,
        data: {
          offers: offers.map(offer => ({
            id: offer.id,
            name: offer.name,
            description: offer.description,
            discountPercent: offer.discountPercent,
            startDate: offer.startDate,
            endDate: offer.endDate,
            category: offer.category ? {
              id: offer.category.id,
              name: offer.category.name
            } : null
          })),
          totalOffers: offers.length
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error in getActiveOffers:', error);
      return this.createErrorResponse(error, 'getActiveOffers') as OffersResponse;
    }
  }

  public async getOrdersListLink(request: GetOrdersListLinkRequest): Promise<TokenResponse> {
    try {
      console.log('🔧 Calling getOrdersListLink with:', request);
      

      
      console.log('🔧 SecureTokenService instance:', !!this.secureTokenService);
      
      // If orderCode is specified, validate it exists in database
      if (request.orderCode) {
        try {
          console.log('🔍 Checking if order exists in database:', request.orderCode);
          
          // Import Prisma client
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();
          
          // Query the database for the order
          const order = await prisma.orders.findFirst({
            where: {
              orderCode: request.orderCode,
              workspaceId: request.workspaceId
            }
          });
          
          await prisma.$disconnect();
          
          if (!order) {
            console.log('❌ Order not found in database:', request.orderCode);
            return {
              success: false,
              error: `Ordine non trovato`,
              message: `Ordine non trovato`,
              timestamp: new Date().toISOString()
            } as TokenResponse;
          }
          
          console.log('✅ Order found in database:', request.orderCode);
          
        } catch (dbError) {
          console.log('❌ Database error while checking order:', dbError);
          return {
            success: false,
            error: `Ordine non trovato`,
            message: `Ordine non trovato`,
            timestamp: new Date().toISOString()
          } as TokenResponse;
        }
      }

      console.log('🔧 About to create token...');
      const token = await this.secureTokenService.createToken(
        'orders',
        request.workspaceId,
        { customerId: request.customerId },
        '1h',
        undefined,
        undefined,
        undefined,
        request.customerId
      );
      console.log('🔧 Token created successfully:', token);

      let linkUrl: string;
      if (request.orderCode) {
        linkUrl = `http://localhost:3000/orders-public/${request.orderCode}?token=${token}`;
      } else {
        linkUrl = `http://localhost:3000/orders-public?token=${token}`;
      }

      return {
        success: true,
        token: token,
        linkUrl: linkUrl,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        action: 'orders',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return this.createErrorResponse(error, 'getOrdersListLink') as TokenResponse;
    }
  }

  // public async getCustomerProfileLink(request: GetAllProductsRequest): Promise<TokenResponse> {
  //   try {
  //     console.log('🔧 Calling getCustomerProfileLink with:', request);
      
  //     const token = await this.secureTokenService.createToken(
  //       'profile',
  //       request.workspaceId,
  //       { customerId: request.customerId },
  //       '1h',
  //       undefined,
  //       undefined,
  //       undefined,
  //       request.customerId
  //     );

  //     const linkUrl = `http://localhost:3000/profile-public?token=${token}`;

  //     return {
  //       success: true,
  //       token: token,
  //       linkUrl: linkUrl,
  //       expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  //       action: 'profile',
  //       timestamp: new Date().toISOString()
  //     };

  //   } catch (error) {
  //     return this.createErrorResponse(error, 'getCustomerProfileLink') as TokenResponse;
  //   }
  // }

  // public async confirmOrderFromConversation(request: RagSearchRequest): Promise<StandardResponse> {
  //   try {
  //     console.log('🔧 Calling confirmOrderFromConversation with:', request);
      
  //     // This would analyze conversation history and extract order details
  //     // For now, return a simple response
  //     return {
  //       success: true,
  //       data: {
  //         message: 'Ordine confermato! Ti invieremo una conferma via email.',
  //         orderConfirmed: true
  //       },
  //       timestamp: new Date().toISOString()
  //     };

  //   } catch (error) {
  //     return this.createErrorResponse(error, 'confirmOrderFromConversation');
  //   }
  // }

  public async SearchRag(request: RagSearchRequest): Promise<RagSearchResponse> {
    try {
      console.log('🔧 Calling SearchRag with:', request);
      
      // Translate query to English for better search results
      const translationService = new TranslationService();
      const translatedQuery = await translationService.translateToEnglish(request.query);
      console.log('🌐 Translated query:', translatedQuery);
      
      const response = await axios.post(`${this.baseUrl}/rag-search`, {
        query: translatedQuery, // Use translated query
        workspaceId: request.workspaceId,
        customerId: request.customerId,
        businessType: "ECOMMERCE", // Default business type
        customerLanguage: "en" // Use English for search
      }, {
        timeout: 15000
      });

      console.log('✅ SearchRag response received:', {
        hasResults: !!response.data.results,
        originalQuery: request.query,
        translatedQuery: translatedQuery,
        resultsCount: response.data.results ? Object.keys(response.data.results).length : 0
      });

      return {
        success: true,
        results: response.data || {},
        query: request.query,
        translatedQuery: translatedQuery,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error in SearchRag:', error);
      return this.createErrorResponse(error, 'SearchRag') as RagSearchResponse;
    }
  }

  public async getShipmentTrackingLink(request: GetShipmentTrackingLinkRequest): Promise<TokenResponse> {
    try {
      console.log('🔧 Calling getShipmentTrackingLink with:', request);
      
      // Validate that orderCode exists in database and get trackingNumber
      let order;
      try {
        console.log('🔍 Checking if order exists in database for tracking:', request.orderCode);
        
        // Import Prisma client
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        // Query the database for the order with trackingNumber
        order = await prisma.orders.findFirst({
          where: {
            orderCode: request.orderCode,
            workspaceId: request.workspaceId
          },
          select: {
            orderCode: true,
            trackingNumber: true
          }
        });
        
        await prisma.$disconnect();
        
        if (!order) {
          console.log('❌ Order not found in database for tracking:', request.orderCode);
          return {
            success: false,
            error: `Ordine non trovato`,
            message: `Ordine non trovato`,
            timestamp: new Date().toISOString()
          } as TokenResponse;
        }
        
        if (!order.trackingNumber) {
          console.log('❌ No tracking number found for order:', request.orderCode);
          return {
            success: false,
            error: `Non c'è il tracking-id nell'ordine`,
            message: `Non c'è il tracking-id nell'ordine`,
            timestamp: new Date().toISOString()
          } as TokenResponse;
        }

        console.log('✅ Order found with tracking number:', order.trackingNumber);
        
      } catch (dbError) {
        console.log('❌ Database error while checking order for tracking:', dbError);
        return {
          success: false,
          error: `Ordine non trovato`,
          message: `Ordine non trovato`,
          timestamp: new Date().toISOString()
        } as TokenResponse;
      }

      // Generate DHL tracking link
      const dhlTrackingUrl = `https://www.dhl.com/it-en/home/tracking.html?locale=true&tracking-id=${order.trackingNumber}`;

      return {
        success: true,
        linkUrl: dhlTrackingUrl,
        trackingNumber: order.trackingNumber,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        action: 'tracking',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return this.createErrorResponse(error, 'getShipmentTrackingLink') as TokenResponse;
    }
  }
}
