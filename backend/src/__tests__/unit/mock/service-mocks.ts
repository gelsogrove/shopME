/**
 * Mock dei servizi per i test unitari
 */

import { jest } from '@jest/globals';
import { PaginatedProducts } from '../../../domain/repositories/product.repository.interface';

// UserService mock
export const mockUserService = {
  getById: jest.fn().mockResolvedValue({
    id: 'user-test-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'ADMIN'
  }),
  getByEmail: jest.fn().mockResolvedValue({
    id: 'user-test-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'ADMIN',
    password: '$2b$10$abcdefghijklmnopqrstuvwxyz0123456789' // Mock hashed password
  }),
  create: jest.fn().mockResolvedValue({
    id: 'new-user-id',
    email: 'new@example.com',
    firstName: 'New',
    lastName: 'User',
    role: 'USER'
  }),
  update: jest.fn().mockResolvedValue({
    id: 'user-test-id',
    email: 'updated@example.com',
    firstName: 'Updated',
    lastName: 'User',
    role: 'ADMIN'
  }),
  delete: jest.fn().mockResolvedValue(true)
};

// ProductService mock
export const mockProductService = {
  getById: jest.fn().mockResolvedValue({
    id: 'product-test-id',
    name: 'Test Product',
    description: 'Test description',
    price: 19.99,
    categoryId: 'category-test-id',
    workspaceId: 'workspace-test-id',
    isActive: true
  }),
  getAllProducts: jest.fn().mockResolvedValue([
    {
      id: 'product-test-id',
      name: 'Test Product',
      description: 'Test description',
      price: 19.99,
      categoryId: 'category-test-id',
      workspaceId: 'workspace-test-id',
      isActive: true
    }
  ]),
  getProductsWithPagination: jest.fn().mockResolvedValue({
    products: [
      {
        id: 'product-test-id',
        name: 'Test Product',
        description: 'Test description',
        price: 19.99,
        categoryId: 'category-test-id',
        workspaceId: 'workspace-test-id',
        isActive: true
      }
    ],
    total: 1,
    page: 1,
    totalPages: 1
  } as PaginatedProducts),
  createProduct: jest.fn().mockResolvedValue({
    id: 'new-product-id',
    name: 'New Product',
    description: 'New description',
    price: 29.99,
    categoryId: 'category-test-id',
    workspaceId: 'workspace-test-id',
    isActive: true
  }),
  updateProduct: jest.fn().mockResolvedValue({
    id: 'product-test-id',
    name: 'Updated Product',
    description: 'Updated description',
    price: 24.99,
    categoryId: 'category-test-id',
    workspaceId: 'workspace-test-id',
    isActive: true
  }),
  deleteProduct: jest.fn().mockResolvedValue(true)
};

// CategoryService mock
export const mockCategoryService = {
  getById: jest.fn().mockResolvedValue({
    id: 'category-test-id',
    name: 'Test Category',
    description: 'Test description',
    workspaceId: 'workspace-test-id',
    isActive: true
  }),
  getAllCategories: jest.fn().mockResolvedValue([
    {
      id: 'category-test-id',
      name: 'Test Category',
      description: 'Test description',
      workspaceId: 'workspace-test-id',
      isActive: true
    }
  ]),
  createCategory: jest.fn().mockResolvedValue({
    id: 'new-category-id',
    name: 'New Category',
    description: 'New description',
    workspaceId: 'workspace-test-id',
    isActive: true
  }),
  updateCategory: jest.fn().mockResolvedValue({
    id: 'category-test-id',
    name: 'Updated Category',
    description: 'Updated description',
    workspaceId: 'workspace-test-id',
    isActive: true
  }),
  deleteCategory: jest.fn().mockResolvedValue(true)
};

// OfferService mock
export const mockOfferService = {
  getById: jest.fn().mockResolvedValue({
    id: 'offer-test-id',
    name: 'Test Offer',
    description: 'Test description',
    discount: 10,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    categoryId: 'category-test-id',
    workspaceId: 'workspace-test-id',
    isActive: true
  }),
  getAllOffers: jest.fn().mockResolvedValue([
    {
      id: 'offer-test-id',
      name: 'Test Offer',
      description: 'Test description',
      discount: 10,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      categoryId: 'category-test-id',
      workspaceId: 'workspace-test-id',
      isActive: true
    }
  ]),
  createOffer: jest.fn().mockResolvedValue({
    id: 'new-offer-id',
    name: 'New Offer',
    description: 'New description',
    discount: 15,
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    categoryId: 'category-test-id',
    workspaceId: 'workspace-test-id',
    isActive: true
  }),
  updateOffer: jest.fn().mockResolvedValue({
    id: 'offer-test-id',
    name: 'Updated Offer',
    description: 'Updated description',
    discount: 20,
    startDate: new Date(),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    categoryId: 'category-test-id',
    workspaceId: 'workspace-test-id',
    isActive: true
  }),
  deleteOffer: jest.fn().mockResolvedValue(true)
}; 