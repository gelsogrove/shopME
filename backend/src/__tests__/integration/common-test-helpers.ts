/**
 * 🧪 Common Test Helpers for Integration Tests
 * 
 * Shared functions for all integration tests:
 * - Customer setup and token generation
 * - WhatsApp message simulation
 * - Common assertions
 */

import request from 'supertest'
import app from '../../app'

// Fixed test data from seed.ts
export const FIXED_WORKSPACE_ID = 'cm9hjgq9v00014qk8fsdy4ujv'
export const FIXED_CUSTOMER_ID = 'test-customer-123'
export const FIXED_CUSTOMER_PHONE = '+393451234567'

// Use Maria Garcia - existing registered customer
export const MARIA_GARCIA_PHONE = '+34666777888'
export const MARIA_GARCIA_EMAIL = 'maria.garcia@shopme.com'

/**
 * Setup test customer with active chatbot
 */
export const setupTestCustomer = async () => {
  // Simple setup - just return the test data
  // The customer should already exist in the seed data
  console.log('🧪 Setting up test customer...')
  
  return {
    customerId: FIXED_CUSTOMER_ID,
    phone: FIXED_CUSTOMER_PHONE,
    workspaceId: FIXED_WORKSPACE_ID
  }
}

/**
 * Simulate WhatsApp message with language support
 */
export const simulateWhatsAppMessage = async (
  message: string, 
  language: string = 'en',
  phone: string = MARIA_GARCIA_PHONE // Use Maria Garcia by default
) => {
  return await request(app)
    .post('/api/messages')
    .send({
      workspaceId: FIXED_WORKSPACE_ID,
      phoneNumber: phone,
      message: message,
      language: language // Add language to payload
    })
}

/**
 * Clean up test data
 */
export const cleanupTestData = async () => {
  // Simple cleanup - just log
  console.log('🧪 Cleaning up test data...')
}

/**
 * Extract response message from API response
 */
export const extractResponseMessage = (response: any): string => {
  return response.body?.processedMessage || 
         response.body?.message || 
         JSON.stringify(response.body)
}

/**
 * Check if response is in specific language
 */
export const isResponseInLanguage = (response: string, language: string): boolean => {
  const languageIndicators = {
    en: ['hello', 'welcome', 'help', 'information', 'products', 'services'],
    it: ['ciao', 'benvenuto', 'aiuto', 'informazioni', 'prodotti', 'servizi'],
    es: ['hola', 'bienvenido', 'ayuda', 'información', 'productos', 'servicios']
  }

  const indicators = languageIndicators[language as keyof typeof languageIndicators] || []
  return indicators.some(indicator => 
    response.toLowerCase().includes(indicator.toLowerCase())
  )
}
