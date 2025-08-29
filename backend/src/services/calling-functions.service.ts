import { SecureTokenService } from '../application/services/secure-token.service';
import {
    ErrorResponse,
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

  // public async getAllProducts(request: GetAllProductsRequest): Promise<ProductsResponse> {
  //   try {
  //     console.log('🔧 Calling getAllProducts with:', request);
      
  //     const response = await axios.get(`${this.baseUrl}/public/products`, {
  //       params: {
  //         workspaceId: request.workspaceId,
  //         customerId: request.customerId
  //       },
  //       timeout: 10000
  //     });

  //     return {
  //       success: true,
  //       products: response.data.products || [],
  //       totalCount: response.data.products?.length || 0,
  //       timestamp: new Date().toISOString()
  //     };

  //   } catch (error) {
  //     return this.createErrorResponse(error, 'getAllProducts') as ProductsResponse;
  //   }
  // }

  // public async getServices(request: GetAllProductsRequest): Promise<ServicesResponse> {
  //   try {
  //     console.log('🔧 Calling getServices with:', request);
      
  //     const response = await axios.get(`${this.baseUrl}/public/services`, {
  //       params: {
  //         workspaceId: request.workspaceId,
  //         customerId: request.customerId
  //       },
  //       timeout: 10000
  //     });

  //     return {
  //       success: true,
  //       services: response.data.services || [],
  //       totalCount: response.data.services?.length || 0,
  //       timestamp: new Date().toISOString()
  //     };

  //   } catch (error) {
  //     return this.createErrorResponse(error, 'getServices') as ServicesResponse;
  //   }
  // }

  // public async getAllCategories(request: GetAllProductsRequest): Promise<CategoriesResponse> {
  //   try {
  //     console.log('🔧 Calling getAllCategories with:', request);
      
  //     const response = await axios.get(`${this.baseUrl}/categories`, {
  //       params: {
  //         workspaceId: request.workspaceId,
  //         customerId: request.customerId
  //       },
  //       timeout: 10000
  //     });

  //     return {
  //       success: true,
  //       categories: response.data.categories || [],
  //       totalCount: response.data.categories?.length || 0,
  //       timestamp: new Date().toISOString()
  //     };

  //   } catch (error) {
  //     return this.createErrorResponse(error, 'getAllCategories') as CategoriesResponse;
  //   }
  // }

  // public async getActiveOffers(request: GetAllProductsRequest): Promise<OffersResponse> {
  //   try {
  //     console.log('🔧 Calling getActiveOffers with:', request);
      
  //     const response = await axios.get(`${this.baseUrl}/offers`, {
  //       params: {
  //         workspaceId: request.workspaceId,
  //         customerId: request.customerId
  //       },
  //       timeout: 10000
  //     });

  //     return {
  //       success: true,
  //       offers: response.data.offers || [],
  //       totalCount: response.data.offers?.length || 0,
  //       timestamp: new Date().toISOString()
  //     };

  //   } catch (error) {
  //     return this.createErrorResponse(error, 'getActiveOffers') as OffersResponse;
  //   }
  // }

  // public async contactOperator(request: GetAllProductsRequest): Promise<StandardResponse> {
  //   try {
  //     console.log('🔧 Calling contactOperator with:', request);
      
  //     return {
  //       success: true,
  //       data: {
  //         message: 'Un operatore ti contatterà al più presto. Grazie per la tua pazienza!',
  //         operatorContacted: true,
  //         estimatedResponseTime: '5-10 minuti'
  //       },
  //       timestamp: new Date().toISOString()
  //     };

  //   } catch (error) {
  //     return this.createErrorResponse(error, 'contactOperator');
  //   }
  // }

  public async getOrdersListLink(request: GetOrdersListLinkRequest): Promise<TokenResponse> {
    try {
      console.log('🔧 Calling getOrdersListLink with:', request);
      
      // If orderCode is specified, verify order exists first
      if (request.orderCode) {
        try {
          console.log('🔍 Checking if order exists:', request.orderCode);
          const orderCheckResponse = await fetch(`${this.baseUrl}/public/orders/${request.orderCode}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!orderCheckResponse.ok) {
            console.log('❌ Order not found:', request.orderCode);
            return {
              success: false,
              error: `Ordine ${request.orderCode} non trovato`,
              message: `Mi dispiace, l'ordine ${request.orderCode} non è stato trovato nel sistema. Verifica il numero dell'ordine e riprova.`,
              timestamp: new Date().toISOString()
            } as TokenResponse;
          }
          
          console.log('✅ Order found:', request.orderCode);
        } catch (orderError) {
          console.log('❌ Error checking order:', orderError);
          return {
            success: false,
            error: `Errore nella verifica dell'ordine ${request.orderCode}`,
            message: `Mi dispiace, non riesco a verificare l'ordine ${request.orderCode} al momento. Riprova più tardi.`,
            timestamp: new Date().toISOString()
          } as TokenResponse;
        }
      }
      
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

  // public async ragSearch(request: RagSearchRequest): Promise<RagSearchResponse> {
  //   try {
  //     console.log('🔧 Calling ragSearch with:', request);
      
  //     const response = await axios.post(`${this.baseUrl}/rag-search`, {
  //       query: request.query,
  //       workspaceId: request.workspaceId,
  //       customerId: request.customerId,
  //       messages: request.messages
  //     }, {
  //       timeout: 15000
  //     });

  //     return {
  //       success: true,
  //       results: response.data.results || {},
  //       query: request.query,
  //       translatedQuery: response.data.translatedQuery,
  //       timestamp: new Date().toISOString()
  //     };

  //   } catch (error) {
  //     return this.createErrorResponse(error, 'ragSearch') as RagSearchResponse;
  //   }
  // }

  // public async getShipmentTrackingLink(request: GetShipmentTrackingLinkRequest): Promise<GetShipmentTrackingLinkResponse> {
  //   try {
  //     console.log('🔧 Calling getShipmentTrackingLink with:', request);
      
  //     const response = await axios.get(`${this.baseUrl}/shipment-tracking`, {
  //       params: {
  //         workspaceId: request.workspaceId,
  //         customerId: request.customerId
  //       },
  //       timeout: 10000
  //     });

  //     return {
  //       success: true,
  //       linkUrl: response.data.trackingUrl || '',
  //       timestamp: new Date().toISOString()
  //     };

  //   } catch (error) {
  //     const errorResponse = this.createErrorResponse(error, 'getShipmentTrackingLink');
  //     return {
  //       ...errorResponse,
  //       linkUrl: ''
  //     };
  //   }
  // }
}
