import axios from 'axios';
import { SecureTokenService } from '../application/services/secure-token.service';
import { ReplaceLinkWithToken } from '../chatbot/calling-functions/ReplaceLinkWithToken';
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

export interface GetProductsByCategoryRequest {
  workspaceId: string;
  customerId?: string;
  categoryName: string;
  phoneNumber?: string;
  message?: string;
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

  public async getAllProducts(request: GetAllProductsRequest): Promise<CategoriesResponse> {
    try {
      console.log('🔧 Calling getAllProducts (now returns categories) with:', request);
      
      // Direct database query with Prisma for categories list
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      // Get all categories with product counts, filtering out categories with 0 products
      const categories = await prisma.categories.findMany({
        where: {
          workspaceId: request.workspaceId,
          isActive: true,
          products: {
            some: {
              isActive: true
            }
          }
        },
        select: {
          id: true,
          name: true,
          description: true,
          _count: {
            select: {
              products: {
                where: {
                  isActive: true
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      });
      
      await prisma.$disconnect();
      
      if (!categories || categories.length === 0) {
        return {
          success: false,
          error: 'Nessuna categoria disponibile',
          message: 'Nessuna categoria disponibile',
          timestamp: new Date().toISOString()
        } as CategoriesResponse;
      }
      
      // Mappatura icone per categoria
      const categoryIcons: { [key: string]: string } = {
        'Cheeses & Dairy': '🧀',
        'Cured Meats': '🥓',
        'Salami & Cold Cuts': '🥩',
        'Pasta & Rice': '🍝',
        'Tomato Products': '🍅',
        'Flour & Baking': '🌾',
        'Sauces & Preserves': '🍯',
        'Water & Beverages': '💧',
        'Frozen Products': '🧊',
        'Various & Spices': '🌿'
      };

      return {
        success: true,
        data: {
          categories: categories.map(category => ({
            id: category.id,
            name: `${categoryIcons[category.name] || ''} ${category.name}`, // Add icon to name
            description: category.description,
            productCount: category._count.products
          })),
          totalCategories: categories.length
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error in getAllProducts:', error);
      return this.createErrorResponse(error, 'getAllProducts') as CategoriesResponse;
    }
  }

  public async getProductsByCategory(request: GetAllProductsRequest & { categoryName: string }): Promise<ProductsResponse> {
    try {
      console.log('🔧 Calling getProductsByCategory with:', request);
      
      // Direct database query with Prisma for products in specific category
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
      
      // Get products in the specific category
      const products = await prisma.products.findMany({
        where: {
          workspaceId: request.workspaceId,
          isActive: true,
          category: {
            name: request.categoryName
          }
        },
        select: {
          id: true,
          name: true,
          ProductCode: true,
          description: true,
          formato: true,
          price: true,
          stock: true,
          sku: true,
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });
      
      await prisma.$disconnect();
      
      if (!products || products.length === 0) {
        return {
          success: false,
          error: `Nessun prodotto disponibile nella categoria "${request.categoryName}"`,
          message: `Nessun prodotto disponibile nella categoria "${request.categoryName}"`,
          timestamp: new Date().toISOString()
        } as ProductsResponse;
      }
      
      // Apply discounts to products
      const productsWithDiscounts = products.map(product => {
        const categoryId = product.category?.id;
        
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
        
        return {
          code: product.ProductCode || product.sku || product.id,
          ProductCode: product.ProductCode,
          name: product.name,
          description: product.description,
          formato: product.formato,
          price: finalPrice, // Final discounted price
          originalPrice: hasDiscount ? originalPrice : undefined, // Show original only if discounted
          discountPercent: hasDiscount ? discountPercent : undefined,
          hasDiscount: hasDiscount,
          stock: product.stock
        };
      });
      
      console.log(`✅ Found ${products.length} products in category "${request.categoryName}"`);
      
      return {
        success: true,
        data: {
          categories: [{
            categoryName: request.categoryName,
            products: productsWithDiscounts
          }],
          totalProducts: products.length,
          totalCategories: 1
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error in getProductsByCategory:', error);
      return this.createErrorResponse(error, 'getProductsByCategory') as ProductsResponse;
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
      
      // 🔧 CRITICAL FIX: Use the actual GetCustomerProfileLink function
      const { GetCustomerProfileLink } = require('../chatbot/calling-functions/GetCustomerProfileLink');
      
      const result = await GetCustomerProfileLink({
        workspaceId: request.workspaceId,
        customerId: request.customerId
      });
      
      if (!result) {
        console.error('❌ Failed to generate profile link');
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
      
      console.log('✅ Profile link generated successfully:', result.profileUrl);
      
      return {
        success: true,
        linkUrl: result.profileUrl,
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
      
      // Mappatura icone per categoria
      const categoryIcons: { [key: string]: string } = {
        'Cheeses & Dairy': '🧀',
        'Cured Meats': '🥓',
        'Salami & Cold Cuts': '🥩', 
        'Pasta & Rice': '🍝',
        'Tomato Products': '🍅',
        'Flour & Baking': '🌾',
        'Sauces & Preserves': '🍯',
        'Water & Beverages': '💧',
        'Frozen Products': '🧊',
        'Various & Spices': '🌿'
      };

      return {
        success: true,
        data: {
          categories: categories.map(category => {
            const icon = categoryIcons[category.name] || '📦';
            return {
              id: category.id,
              name: `${icon} ${category.name}`,
              description: category.description
            };
          }),
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


  public async confirmOrderFromConversation(request: RagSearchRequest): Promise<StandardResponse> {
    try {
      console.log('🔧 Calling confirmOrderFromConversation with:', request);
      
      // Generate secure token for checkout/cart access
      const token = await this.secureTokenService.createToken(
        'checkout',
        request.workspaceId,
        { customerId: request.customerId },
        '1h',
        undefined,
        undefined,
        undefined,
        request.customerId
      );
      
      if (!token) {
        console.error('❌ Failed to generate checkout token');
        return {
          success: false,
          error: 'Errore nella generazione del link checkout',
          message: 'Errore nella generazione del link checkout',
          timestamp: new Date().toISOString()
        };
      }
      
      // Generate cart link
      const checkoutUrl = `http://localhost:3000/checkout?token=${token}`;
      
      console.log('✅ Checkout link generated successfully:', checkoutUrl);
      
      return {
        success: true,
        data: {
          message: 'Ordine confermato! Clicca sul link per completare il checkout.',
          checkoutUrl: checkoutUrl,
          orderConfirmed: true
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return this.createErrorResponse(error, 'confirmOrderFromConversation');
    }
  }

  public async SearchRag(request: RagSearchRequest): Promise<RagSearchResponse> {
    try {
      console.log('🔧 Calling SearchRag with:', request);
      
      // Use the query directly without translation to preserve Italian product names
      // The TranslationService in DualLLMService already handles translation correctly
      const translatedQuery = request.query;
      console.log('🌐 Using original query (no translation):', translatedQuery);
      
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


  /**
   * Replace [LINK_WITH_TOKEN] with generated link
   */
  public async replaceLinkWithToken(
    response: string, 
    linkType: string = 'auto', 
    customerId: string, 
    workspaceId: string
  ): Promise<StandardResponse> {
    try {
      console.log('🔧 Calling replaceLinkWithToken with:', { response, linkType, customerId, workspaceId });
      
      const result = await ReplaceLinkWithToken(
        { response, linkType: linkType as any },
        customerId,
        workspaceId
      );
      
      if (result.success) {
        return {
          success: true,
          message: result.response || response,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to replace link token',
          message: response, // Return original response if replacement fails
          timestamp: new Date().toISOString()
        };
      }
      
    } catch (error) {
      return this.createErrorResponse(error, 'replaceLinkWithToken') as StandardResponse;
    }
  }
}
