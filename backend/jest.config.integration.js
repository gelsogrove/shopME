/** @type {import('jest').Config} */
module.exports = {
  clearMocks: false, // Don't clear mocks for integration tests
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        isolatedModules: false, // Allow modules to be shared
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
  testMatch: ['**/src/__tests__/integration/**/*.integration.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.integration.js'],
  verbose: true,
  testTimeout: 30000, // Longer timeout for integration tests
  transformIgnorePatterns: [
    'node_modules/'
  ],
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  // Set environment for integration tests
  setupFiles: ['<rootDir>/jest.setup.integration.js'],
  
  // Enhanced reporting configuration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'integration-test-results.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }],
    ['jest-html-reporters', {
      publicPath: './test-results',
      filename: 'integration-test-report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'Integration Test Report',
      inlineSource: true
    }]
  ],
  
  // Better error reporting
  errorOnDeprecated: true,
  notify: false,
  
  // Handle async operations properly
  detectOpenHandles: true,
  forceExit: true,
  
  // Collect coverage for integration tests
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
