import testConfig from '../test';

describe('Test Configuration', () => {
  test('should have correct environment', () => {
    expect(testConfig.env).toBe('test');
  });
  
  test('should have database configuration', () => {
    expect(testConfig.database).toBeDefined();
    expect(testConfig.database.url).toContain('postgres');
  });
  
  test('should have JWT configuration', () => {
    expect(testConfig.jwt).toBeDefined();
    expect(testConfig.jwt.secret).toBe('test-secret');
  });
}); 