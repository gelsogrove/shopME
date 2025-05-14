/**
 * Mock data for products in integration tests
 */
import { timestamp } from './mockUsers';

export const mockProduct = {
  name: `Test Product ${timestamp}`,
  description: 'This is a test product',
  price: 99.99,
  stock: 100,
  status: 'ACTIVE',
  slug: `test-product-${timestamp}`,
  isActive: true
};

export const mockProductWithCategory = (categoryId: string, workspaceId?: string) => ({
  ...mockProduct,
  categoryId,
  ...(workspaceId && { workspaceId })
});

export const generateTestProduct = (prefix: string, categoryId?: string, workspaceId?: string) => ({
  name: `${prefix} Product ${timestamp}`,
  description: `${prefix} product description for testing`,
  price: 129.99,
  stock: 50,
  status: 'ACTIVE',
  slug: `${prefix.toLowerCase()}-product-${timestamp}`,
  isActive: true,
  ...(categoryId && { categoryId }),
  ...(workspaceId && { workspaceId })
});

export const invalidProduct = {
  // Missing required fields
  description: 'Invalid product without required fields'
}; 