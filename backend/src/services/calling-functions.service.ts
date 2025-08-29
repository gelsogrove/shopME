import axios from 'axios';
import { SecureTokenService } from '../application/services/secure-token.service';
import {
    GetServicesResponse,
    GetShipmentTrackingLinkRequest,
    GetShipmentTrackingLinkResponse,
    RagSearchRequest,
    RagSearchResponse,
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

  public async getAllProducts(request: GetAllProductsRequest): Promise<any> {
    try {
      console.log('🔧 Calling getAllProducts with:', request);
      
      const response = await axios.get(`${this.baseUrl}/products`, {
        params: {
          workspaceId: request.workspaceId,
          customerId: request.customerId
        },
        timeout: 10000
      });

      console.log('✅ getAllProducts response:', response.data);
      return {
        success: true,
        products: response.data.products || []
      };

    } catch (error) {
      console.error('❌ getAllProducts error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        products: []
      };
    }
  }

  public async getServices(request: GetAllProductsRequest): Promise<GetServicesResponse> {
    try {
      console.log('🔧 Calling getServices with:', request);
      
      const response = await axios.get(`${this.baseUrl}/services`, {
        params: {
          workspaceId: request.workspaceId,
          customerId: request.customerId
        },
        timeout: 10000
      });

      console.log('✅ getServices response:', response.data);
      return {
        success: true,
        services: response.data.services || []
      };

    } catch (error) {
      console.error('❌ getServices error:', error);
      return {
        success: false,
        services: []
      };
    }
  }

  public async getAllCategories(request: GetAllProductsRequest): Promise<any> {
    try {
      console.log('🔧 Calling getAllCategories with:', request);
      
      const response = await axios.get(`${this.baseUrl}/categories`, {
        params: {
          workspaceId: request.workspaceId,
          customerId: request.customerId
        },
        timeout: 10000
      });

      console.log('✅ getAllCategories response:', response.data);
      return {
        success: true,
        categories: response.data.categories || []
      };

    } catch (error) {
      console.error('❌ getAllCategories error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        categories: []
      };
    }
  }

  public async getActiveOffers(request: GetAllProductsRequest): Promise<any> {
    try {
      console.log('🔧 Calling getActiveOffers with:', request);
      
      const response = await axios.get(`${this.baseUrl}/offers`, {
        params: {
          workspaceId: request.workspaceId,
          customerId: request.customerId
        },
        timeout: 10000
      });

      console.log('✅ getActiveOffers response:', response.data);
      return {
        success: true,
        offers: response.data.offers || []
      };

    } catch (error) {
      console.error('❌ getActiveOffers error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        offers: []
      };
    }
  }

  public async contactOperator(request: GetAllProductsRequest): Promise<any> {
    try {
      console.log('🔧 Calling contactOperator with:', request);
      
      // Simulate operator contact
      return {
        success: true,
        message: 'Un operatore ti contatterà al più presto. Grazie per la tua pazienza!',
        operatorContacted: true,
        estimatedResponseTime: '5-10 minuti'
      };

    } catch (error) {
      console.error('❌ contactOperator error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async getOrdersListLink(request: GetOrdersListLinkRequest): Promise<TokenResponse> {
    try {
      console.log('🔧 Calling getOrdersListLink with:', request);
      
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

      console.log('✅ getOrdersListLink generated:', linkUrl);
      
      return {
        token: token,
        success: true,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        linkUrl: linkUrl,
        action: 'orders'
      };

    } catch (error) {
      console.error('❌ getOrdersListLink error:', error);
      return {
        token: '',
        success: false,
        expiresAt: new Date().toISOString(),
        linkUrl: '',
        action: 'orders'
      };
    }
  }

  public async getCustomerProfileLink(request: GetAllProductsRequest): Promise<TokenResponse> {
    try {
      console.log('🔧 Calling getCustomerProfileLink with:', request);
      
      const token = await this.secureTokenService.createToken(
        'profile',
        request.workspaceId,
        { customerId: request.customerId },
        '1h',
        undefined,
        undefined,
        undefined,
        request.customerId
      );

      const linkUrl = `http://localhost:3000/profile-public?token=${token}`;

      console.log('✅ getCustomerProfileLink generated:', linkUrl);
      
      return {
        token: token,
        success: true,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        linkUrl: linkUrl,
        action: 'profile'
      };

    } catch (error) {
      console.error('❌ getCustomerProfileLink error:', error);
      return {
        token: '',
        success: false,
        expiresAt: new Date().toISOString(),
        linkUrl: '',
        action: 'profile'
      };
    }
  }

  public async confirmOrderFromConversation(request: RagSearchRequest): Promise<any> {
    try {
      console.log('🔧 Calling confirmOrderFromConversation with:', request);
      
      // This would analyze conversation history and extract order details
      // For now, return a simple response
      return {
        success: true,
        message: 'Ordine confermato! Ti invieremo una conferma via email.',
        orderConfirmed: true
      };

    } catch (error) {
      console.error('❌ confirmOrderFromConversation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async ragSearch(request: RagSearchRequest): Promise<RagSearchResponse> {
    try {
      console.log('🔧 Calling ragSearch with:', request);
      
      const response = await axios.post(`${this.baseUrl}/rag-search`, {
        query: request.query,
        workspaceId: request.workspaceId,
        customerId: request.customerId,
        messages: request.messages
      }, {
        timeout: 15000
      });

      console.log('✅ ragSearch response:', response.data);
      return {
        success: true,
        results: response.data.results || []
      };

    } catch (error) {
      console.error('❌ ragSearch error:', error);
      return {
        success: false,
        results: []
      };
    }
  }

  public async getShipmentTrackingLink(request: GetShipmentTrackingLinkRequest): Promise<GetShipmentTrackingLinkResponse> {
    try {
      console.log('🔧 Calling getShipmentTrackingLink with:', request);
      
      const response = await axios.get(`${this.baseUrl}/shipment-tracking`, {
        params: {
          workspaceId: request.workspaceId,
          customerId: request.customerId
        },
        timeout: 10000
      });

      console.log('✅ getShipmentTrackingLink response:', response.data);
      return {
        success: true,
        linkUrl: response.data.trackingUrl || ''
      };

    } catch (error) {
      console.error('❌ getShipmentTrackingLink error:', error);
      return {
        success: false,
        linkUrl: ''
      };
    }
  }
}
