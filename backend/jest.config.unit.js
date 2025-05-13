/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/src/utils/'],
  testMatch: ['**/src/__tests__/unit/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', 'workspace-middleware.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}; 