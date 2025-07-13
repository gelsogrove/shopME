// Jest setup file
// This file runs before each test file
// You can add global setup code here

// Example: Setting up console mocks to avoid noise in tests
// const originalConsoleLog = console.log;
// console.log = jest.fn();

// Solo per i test unitari, mocka PrismaClient
// Per i test di integrazione, usiamo il vero PrismaClient
if (process.env.NODE_ENV === 'test' && !process.env.INTEGRATION_TEST) {
  jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
      constructor: jest.fn(),
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    };
    
    // Aggiungiamo le enumerazioni usate nei test
    const ProductStatus = {
      ACTIVE: 'ACTIVE',
      DRAFT: 'DRAFT',
      ARCHIVED: 'ARCHIVED',
      OUT_OF_STOCK: 'OUT_OF_STOCK'
    };
    
    return {
      PrismaClient: jest.fn(() => mockPrismaClient),
      ProductStatus
    };
  });
}

// Mock @xenova/transformers for all tests to avoid ESM import errors
jest.mock('@xenova/transformers', () => ({
  pipeline: jest.fn().mockResolvedValue(async () => ({
    data: [0.1, 0.2, 0.3],
    // Simulate the structure expected by embeddingService
    // For mean pooling, just return a dummy array
    // For .data, return an array-like object
    // This is enough for tests to pass
  }))
}));

// Increase timeout for all tests
jest.setTimeout(10000); // 10 seconds 