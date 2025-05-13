/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/src/utils/'],
  testPathIgnorePatterns: [
    '/node_modules/', 
    '/dist/', 
    'workspace-middleware.spec.ts',
    'src/__tests__/integration/services/supplier-product.spec.ts',
    'src/__tests__/integration/services/services.spec.ts',
    'src/__tests__/integration/endpoints/endpoints.spec.ts',
    'src/__tests__/integration/test-setup.ts',
    'src/__tests__/unit/mock/entity-mocks.ts',
    'src/__tests__/unit/mock/request-response-mocks.ts',
    'src/__tests__/unit/mock/service-mocks.ts',
    'src/__tests__/unit/helpers/repository-mocks.ts',
    'src/config/environments/test.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}; 