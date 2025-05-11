import { ProductService } from '../application/services/product.service';
import { ProductRepository } from '../infrastructure/repositories/product.repository';

// Mock dei repository
jest.mock('../infrastructure/repositories/product.repository');

describe('ProductService', () => {
  let productService: ProductService;
  let mockProductRepository: jest.Mocked<ProductRepository>;

  const workspaceId = 'workspace-1';
  const categoryId = 'category-1';
  const productId = 'product-1';

  const mockProduct = {
    id: productId,
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    isActive: true,
    categoryId: categoryId,
    workspaceId: workspaceId,
  };

  const mockCustomer = {
    id: 'customer-1',
    name: 'Test Customer',
    email: 'test@example.com',
    discount: 10, // 10% customer discount
    workspaceId: workspaceId,
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock instances
    mockProductRepository = new ProductRepository() as jest.Mocked<ProductRepository>;

    // Setup the product service with mocked repositories
    productService = new ProductService();
    (productService as any).productRepository = mockProductRepository;
  });

  describe('getProductsWithOffersApplied', () => {
    it('should apply customer discount when available', async () => {
      // Setup mocks
      mockProductRepository.findAll.mockResolvedValue([mockProduct]);

      // Call the service method
      const result = await productService.getProductsWithOffersApplied(workspaceId, mockCustomer);

      // Verify that the customer discount (10%) is applied (non ci sono più offerte)
      expect(result[0].hasDiscount).toBe(true);
      expect(result[0].discountPercent).toBe(10);
      expect(result[0].discountSource).toBe('customer');
      expect(result[0].price).toBe(90); // 100 - 10%
      expect(result[0].originalPrice).toBe(100);
    });

    it('should not apply any discount when there is no customer discount', async () => {
      // Setup mocks
      mockProductRepository.findAll.mockResolvedValue([mockProduct]);

      // Customer without discount
      const customerWithoutDiscount = { ...mockCustomer, discount: 0 };

      // Call the service method
      const result = await productService.getProductsWithOffersApplied(workspaceId, customerWithoutDiscount);

      // Verify that no discount is applied
      expect(result[0].hasDiscount).toBeUndefined();
      expect(result[0].discountPercent).toBeUndefined();
      expect(result[0].discountSource).toBeUndefined();
      expect(result[0].price).toBe(100);
      expect(result[0].originalPrice).toBeUndefined();
    });
  });
}); 