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

// Increase timeout for all tests
jest.setTimeout(10000); // 10 seconds 