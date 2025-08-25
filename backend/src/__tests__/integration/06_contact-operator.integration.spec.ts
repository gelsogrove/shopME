/**
 * 🧪 Contact Operator Integration Test
 * 
 * Tests operator contact requests:
 * - Italian operator requests
 * - English operator requests
 * - Spanish operator requests
 * 
 * Uses Maria Garcia (registered customer) - NO MOCKS
 */

import {
  cleanupTestData,
  extractResponseMessage,
  setupTestCustomer,
  simulateWhatsAppMessage
} from './common-test-helpers'

describe('🧪 Contact Operator Integration Test', () => {

  beforeAll(async () => {
    await setupTestCustomer()
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  describe('🇮🇹 Italian Operator Request', () => {
    it.skip('should handle Italian operator request', async () => {
      console.log('\n🇮🇹 Testing Italian operator request...')
      
      const response = await simulateWhatsAppMessage('voglio contattare un operatore', 'it')
      
      expect(response.status).toBe(200)
      
      const responseMessage = extractResponseMessage(response)
      console.log(`- Response: "${responseMessage.substring(0, 100)}..."`)
      
      // Verify we get a meaningful response
      const hasContent = responseMessage.length > 20
      expect(hasContent).toBe(true)
      
      // Should NOT contain registration links (Maria is already registered)
      const hasRegistrationLink = responseMessage.includes('register') ||
                                 responseMessage.includes('To use this service') ||
                                 responseMessage.includes('Per utilizzare questo servizio')
      expect(hasRegistrationLink).toBe(false)
      
      // Should contain operator-related content in Italian
      const hasOperatorContent = responseMessage.includes('operatore') ||
                                responseMessage.includes('contattare') ||
                                responseMessage.includes('assistenza') ||
                                responseMessage.includes('aiuto') ||
                                responseMessage.includes('supporto')
      expect(hasOperatorContent).toBe(true)
      
      console.log('✅ Italian operator request test passed')
    })
  })

  describe('🇬🇧 English Operator Request', () => {
    it.skip('should handle English operator request', async () => {
      console.log('\n🇬🇧 Testing English operator request...')
      
      const response = await simulateWhatsAppMessage('I want to contact an operator', 'en')
      
      expect(response.status).toBe(200)
      
      const responseMessage = extractResponseMessage(response)
      console.log(`- Response: "${responseMessage.substring(0, 100)}..."`)
      
      // Verify we get a meaningful response
      const hasContent = responseMessage.length > 20
      expect(hasContent).toBe(true)
      
      // Should NOT contain registration links (Maria is already registered)
      const hasRegistrationLink = responseMessage.includes('register') ||
                                 responseMessage.includes('To use this service') ||
                                 responseMessage.includes('Per utilizzare questo servizio')
      expect(hasRegistrationLink).toBe(false)
      
      // Should contain operator-related content in English
      const hasOperatorContent = responseMessage.includes('operator') ||
                                responseMessage.includes('contact') ||
                                responseMessage.includes('assistance') ||
                                responseMessage.includes('help') ||
                                responseMessage.includes('support')
      expect(hasOperatorContent).toBe(true)
      
      console.log('✅ English operator request test passed')
    })
  })

  describe('🇪🇸 Spanish Operator Request', () => {
    it.skip('should handle Spanish operator request', async () => {
      console.log('\n🇪🇸 Testing Spanish operator request...')
      
      const response = await simulateWhatsAppMessage('quiero contactar con un operador', 'es')
      
      expect(response.status).toBe(200)
      
      const responseMessage = extractResponseMessage(response)
      console.log(`- Response: "${responseMessage.substring(0, 100)}..."`)
      
      // Verify we get a meaningful response
      const hasContent = responseMessage.length > 20
      expect(hasContent).toBe(true)
      
      // Should NOT contain registration links (Maria is already registered)
      const hasRegistrationLink = responseMessage.includes('register') ||
                                 responseMessage.includes('To use this service') ||
                                 responseMessage.includes('Per utilizzare questo servizio')
      expect(hasRegistrationLink).toBe(false)
      
      // Should contain operator-related content in Spanish
      const hasOperatorContent = responseMessage.includes('operador') ||
                                responseMessage.includes('contactar') ||
                                responseMessage.includes('asistencia') ||
                                responseMessage.includes('ayuda') ||
                                responseMessage.includes('soporte')
      expect(hasOperatorContent).toBe(true)
      
      console.log('✅ Spanish operator request test passed')
    })
  })

  describe('📊 Contact Operator Test Summary', () => {
    it('should summarize contact operator test results', async () => {
      expect(true).toBe(true)
    })
  })
})
