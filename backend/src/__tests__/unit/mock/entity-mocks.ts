/**
 * Mock delle entità di dominio per i test unitari
 */
import { Category } from '../../../domain/entities/category.entity';
import { Offer } from '../../../domain/entities/offer.entity';
import { Product } from '../../../domain/entities/product.entity';
import { Service } from '../../../domain/entities/service.entity';
import { Supplier } from '../../../domain/entities/supplier.entity';
import { User } from '../../../domain/entities/user.entity';
import { Workspace } from '../../../domain/entities/workspace.entity';

// Workspace mock
export const mockWorkspace = new Workspace({
  id: 'workspace-test-id',
  name: 'Test Workspace',
  slug: 'test-workspace',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true
});

// User mock
export const mockUser = new User({
  id: 'user-test-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'ADMIN',
  createdAt: new Date(),
  updatedAt: new Date(),
  status: 'ACTIVE'
});

// Category mock
export const mockCategory = new Category({
  id: 'category-test-id',
  name: 'Test Category',
  description: 'Test category description',
  workspaceId: 'workspace-test-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true
});

// Product mock
export const mockProduct = new Product({
  id: 'product-test-id',
  name: 'Test Product',
  description: 'Test product description',
  price: 19.99,
  categoryId: 'category-test-id',
  workspaceId: 'workspace-test-id',
  supplierId: 'supplier-test-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
  stock: 10
});

// Supplier mock
export const mockSupplier = new Supplier({
  id: 'supplier-test-id',
  name: 'Test Supplier',
  email: 'supplier@example.com',
  phone: '+1234567890',
  address: 'Test Address',
  workspaceId: 'workspace-test-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true
});

// Offer mock
export const mockOffer = new Offer({
  id: 'offer-test-id',
  name: 'Test Offer',
  description: 'Test offer description',
  discountPercent: 10,
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  categoryId: 'category-test-id',
  workspaceId: 'workspace-test-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true
});

// Service mock
export const mockService = new Service({
  id: 'service-test-id',
  name: 'Test Service',
  description: 'Test service description',
  price: 29.99,
  currency: 'EUR',
  workspaceId: 'workspace-test-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true
}); 