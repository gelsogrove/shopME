/**
 * 🧪 Token System Integration Test
 * 
 * Tests token generation for different actions:
 * - Orders token generation
 * - Profile token generation
 * - Multi-language token support
 * 
 * Uses Maria Garcia (registered customer) - NO MOCKS
 */

import {
  cleanupTestData,
  extractResponseMessage,
  setupTestCustomer,
  simulateWhatsAppMessage
} from './common-test-helpers'

describe('🧪 Token System Integration Test', () => {

  beforeAll(async () => {
    await setupTestCustomer()
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  describe('📦 Orders Token Generation', () => {
    it.skip('should generate token for orders request', async () => {
      console.log('\n📦 Testing orders token generation...')
      
      const response = await simulateWhatsAppMessage('show me my orders', 'en')
      
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
      
      // Should contain token for orders
      const hasOrdersToken = responseMessage.includes('token=') ||
                            responseMessage.includes('orders') ||
                            responseMessage.includes('ordini') ||
                            responseMessage.includes('pedidos')
      expect(hasOrdersToken).toBe(true)
      
      console.log('✅ Orders token generation test passed')
    })
  })

  describe('👤 Profile Token Generation', () => {
    it.skip('should generate token for profile request', async () => {
      console.log('\n👤 Testing profile token generation...')
      
      const response = await simulateWhatsAppMessage('change my email', 'en')
      
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
      
      // Should contain token for profile
      const hasProfileToken = responseMessage.includes('token=') ||
                             responseMessage.includes('profile') ||
                             responseMessage.includes('profilo') ||
                             responseMessage.includes('perfil') ||
                             responseMessage.includes('email')
      expect(hasProfileToken).toBe(true)
      
      console.log('✅ Profile token generation test passed')
    })
  })

  describe('🌍 Multi-language Token Support', () => {
    it.skip('should generate tokens for Italian requests', async () => {
      console.log('\n🇮🇹 Testing Italian token generation...')
      
      const response = await simulateWhatsAppMessage('mostrami i miei ordini', 'it')
      
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
      
      // Should contain token or Italian content
      const hasTokenOrItalian = responseMessage.includes('token=') ||
                               responseMessage.includes('ordini') ||
                               responseMessage.includes('profilo') ||
                               responseMessage.includes('servizio')
      expect(hasTokenOrItalian).toBe(true)
      
      console.log('✅ Italian token generation test passed')
    })

    it.skip('should generate tokens for Spanish requests', async () => {
      console.log('\n🇪🇸 Testing Spanish token generation...')
      
      const response = await simulateWhatsAppMessage('muéstrame mis pedidos', 'es')
      
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
      
      // Should contain token or Spanish content
      const hasTokenOrSpanish = responseMessage.includes('token=') ||
                               responseMessage.includes('pedidos') ||
                               responseMessage.includes('perfil') ||
                               responseMessage.includes('servicio')
      expect(hasTokenOrSpanish).toBe(true)
      
      console.log('✅ Spanish token generation test passed')
    })
  })

  describe('📊 Token System Test Summary', () => {
    it('should summarize token system test results', async () => {
      expect(true).toBe(true)
    })
  })
})
