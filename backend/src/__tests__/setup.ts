import '@jest/globals';

// This file is automatically loaded before tests run
// Add any global setup code here 

describe('Test environment setup', () => {
  test('Jest is properly configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
}); 