/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        isolatedModules: true,
        diagnostics: {
          ignoreCodes: [
            2615,
            6133,
          ]
        }
      }
    ]
  },
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/src/utils/'],
  testMatch: ['**/src/__tests__/unit/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
  transformIgnorePatterns: [
    'node_modules/'
  ],
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
}; 