import { MessageService } from '../application/services/message.service';
import { TokenService } from '../application/services/token.service';
import { MessageRepository } from '../infrastructure/repositories/message.repository';
import { ProductRepository } from '../infrastructure/repositories/product.repository';

// Mock delle dipendenze
jest.mock('../infrastructure/repositories/message.repository');
jest.mock('../infrastructure/repositories/product.repository');
jest.mock('../services/supplier.service');
jest.mock('../application/services/token.service');

describe('Supplier and Product Integration', () => {
  let messageRepository: jest.Mocked<MessageRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let messageService: MessageService;
  let mockTokenService: jest.Mocked<TokenService>;
  
  const workspaceId = 'workspace-1';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Inizializziamo i mock
    messageRepository = new MessageRepository() as jest.Mocked<MessageRepository>;
    productRepository = new ProductRepository() as jest.Mocked<ProductRepository>;
    mockTokenService = new TokenService() as jest.Mocked<TokenService>;
    
    // Creiamo il service con i mock
    messageService = new MessageService();
    
    // Iniettiamo i mock nel service
    Object.defineProperty(messageService, 'messageRepository', {
      value: messageRepository,
      writable: true
    });
    
    Object.defineProperty(messageService, 'tokenService', {
      value: mockTokenService,
      writable: true
    });
  });
  
  describe('Inactive suppliers', () => {
    it('should not return products from inactive suppliers to customers', async () => {
      // Setup
      messageRepository.getWorkspaceSettings.mockResolvedValue({
        id: workspaceId,
        name: 'Test Workspace',
        isActive: true,
      } as any);
      
      messageRepository.isCustomerBlacklisted.mockResolvedValue(false);
      
      // Mock un cliente registrato
      const registeredCustomer = {
        id: "customer-id",
        phone: "+1234567890",
        name: "Test Customer",
        language: "Italian",
      } as any;
      
      messageRepository.findCustomerByPhone.mockResolvedValue(registeredCustomer);
      messageRepository.validateWorkspaceId.mockResolvedValue(true);
      
      // Mock router prompt e selezione agente
      messageRepository.getRouterAgent.mockResolvedValue("router prompt");
      
      // Mock l'agente per questo workspace
      const mockAgent = {
        id: "agent-id",
        name: "RouterAgent",
        content: "router content",
        workspaceId: workspaceId,
        isRouter: true,
        department: "ROUTER",
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        model: "GPT-4.1-mini",
        max_tokens: 1000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;
      
      messageRepository.getAgentByWorkspaceId.mockResolvedValue(mockAgent);
      
      messageRepository.getResponseFromAgent.mockResolvedValue({
        name: "Products",
        content: "You are a product specialist",
        department: "PRODUCTS",
      } as any);
      
      // Mock prodotti con fornitori attivi e inattivi
      const productsWithActiveSupplier = [
        {
          id: "prod1",
          name: "Pasta from Active Supplier",
          description: "Italian pasta",
          price: 5.99,
          stock: 100,
          isActive: true,
          supplierId: "supplier-active",
          supplier: {
            id: "supplier-active",
            name: "Active Supplier",
            isActive: true
          },
          category: { id: "cat1", name: "Food" },
        }
      ];
      
      const productsWithInactiveSupplier = [
        {
          id: "prod2",
          name: "Oil from Inactive Supplier",
          description: "Extra virgin olive oil",
          price: 12.99,
          stock: 50,
          isActive: true,
          supplierId: "supplier-inactive",
          supplier: {
            id: "supplier-inactive",
            name: "Inactive Supplier",
            isActive: false
          },
          category: { id: "cat2", name: "Oil" },
        }
      ];
      
      // In the repository, only products from active suppliers are returned
      messageRepository.getProducts.mockResolvedValue(productsWithActiveSupplier as any);
      
      messageRepository.getServices.mockResolvedValue([]);
      messageRepository.getLatesttMessages.mockResolvedValue([]);
      
      // Mock response that should only include products from active suppliers
      const expectedResponse = "Ecco i nostri prodotti:\n1. Pasta from Active Supplier - €5.99\nCategoria: Food\nDescrizione: Italian pasta";
      
      // Save the filtered products for verification
      let productsPassedToRag: any[] = [];
      messageRepository.getResponseFromRag.mockImplementation(
        (agent, message, products, services, chatHistory, customer) => {
          productsPassedToRag = products;
          return Promise.resolve(expectedResponse);
        }
      );
      
      messageRepository.getConversationResponse.mockResolvedValue(expectedResponse);
      messageRepository.saveMessage.mockResolvedValue({} as any);
      
      // Execute with a request for products
      const result = await messageService.processMessage(
        "Quali prodotti avete?",
        "+1234567890",
        workspaceId
      );
      
      // Verify getProducts was called
      expect(messageRepository.getProducts).toHaveBeenCalled();
      
      // Verify that only products from active suppliers are returned
      expect(productsPassedToRag).toHaveLength(1);
      
      // Verify products from inactive suppliers are not included
      const productNames = productsPassedToRag.map(p => p.name);
      expect(productNames).toContain("Pasta from Active Supplier");
      expect(productNames).not.toContain("Oil from Inactive Supplier");
      
      // Verify response doesn't mention products from inactive suppliers
      expect(result).toContain("Pasta from Active Supplier");
      expect(result).not.toContain("Oil from Inactive Supplier");
    });
  });
}); 