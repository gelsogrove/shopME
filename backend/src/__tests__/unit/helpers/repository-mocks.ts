/**
 * Mock repository values for tests
 */

import { jest } from '@jest/globals';

// Define generic types for the mock repository
interface MockEntity {
  id: string;
  name: string;
  [key: string]: any;
}

// Funzioni mock preconfigurate per i repository
export const mockRepositoryValues = {
  findAll: jest.fn().mockReturnValue(Promise.resolve([{ id: 'test-id', name: 'Test Resource' }])),
  findById: jest.fn().mockReturnValue(Promise.resolve({ id: 'test-id', name: 'Test Resource' })),
  findByWorkspaceId: jest.fn().mockReturnValue(Promise.resolve([{ id: 'test-id', name: 'Test Resource' }])),
  findBySlug: jest.fn().mockReturnValue(Promise.resolve(null)),
  create: jest.fn().mockReturnValue(Promise.resolve({ id: 'test-id', name: 'Test Resource' })),
  update: jest.fn().mockReturnValue(Promise.resolve({ id: 'test-id', name: 'Updated Resource' })),
  delete: jest.fn().mockReturnValue(Promise.resolve(true)),
  findFirst: jest.fn().mockReturnValue(Promise.resolve({ id: 'test-id', name: 'Test Resource' })),
  findMany: jest.fn().mockReturnValue(Promise.resolve([{ id: 'test-id', name: 'Test Resource' }])),
  findActiveByWorkspaceId: jest.fn().mockReturnValue(Promise.resolve([{ id: 'test-id', name: 'Test Resource' }])),
  isUsedByProducts: jest.fn().mockReturnValue(Promise.resolve(false))
};

// Funzione per creare una funzione jest mock che ritorna i valori definiti
export function mockRepository() {
  return jest.fn().mockImplementation(() => mockRepositoryValues);
}

// Funzione per mockare tutti i repository standard
export function setupRepositoryMocks() {
  // Definiamo prima i mock di tutti i moduli principali
  jest.mock('../../repositories/product.repository', () => ({
    ProductRepository: mockRepository()
  }));

  jest.mock('../../repositories/category.repository', () => ({
    CategoryRepository: mockRepository()
  }));

  jest.mock('../../repositories/service.repository', () => ({
    ServiceRepository: mockRepository()
  }));

  jest.mock('../../repositories/faq.repository', () => ({
    FaqRepository: mockRepository()
  }));

  jest.mock('../../repositories/supplier.repository', () => ({
    SupplierRepository: mockRepository()
  }));

  jest.mock('../../repositories/workspace.repository', () => ({
    WorkspaceRepository: mockRepository()
  }));

  jest.mock('../../repositories/message.repository', () => ({
    MessageRepository: mockRepository()
  }));
  
  jest.mock('../../repositories/offer.repository', () => ({
    OfferRepository: mockRepository()
  }));
} 