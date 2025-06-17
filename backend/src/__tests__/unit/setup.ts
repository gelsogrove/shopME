// Unit test setup file
import '@jest/globals';

// Global test configuration
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
