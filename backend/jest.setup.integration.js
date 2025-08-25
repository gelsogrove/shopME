// Jest setup file for integration tests
// This file runs before each integration test file
// Integration tests use the real database and real services

// Set environment variables for integration tests
process.env.NODE_ENV = 'test'
process.env.INTEGRATION_TEST = 'true'

// Don't mock Prisma for integration tests - use real database
// jest.unmock('@prisma/client')

// Set up global test timeout
jest.setTimeout(30000)

// Enhanced logging for integration tests
const originalConsoleLog = console.log
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

// Track test results
global.testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: []
}

// Enhanced console logging for better debugging
console.log = (...args) => {
  // Show all logs during integration tests for better debugging
  if (process.env.VERBOSE || args[0] && (typeof args[0] === 'string' && args[0].includes('🧪'))) {
    originalConsoleLog('🧪 [INTEGRATION]', ...args)
  }
}

console.error = (...args) => {
  originalConsoleError('❌ [INTEGRATION ERROR]', ...args)
  global.testResults.errors.push(args.join(' '))
}

console.warn = (...args) => {
  originalConsoleWarn('⚠️ [INTEGRATION WARNING]', ...args)
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  global.testResults.errors.push(`Unhandled Rejection: ${reason}`)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  global.testResults.errors.push(`Uncaught Exception: ${error.message}`)
})

console.log('🧪 Integration test setup completed')
