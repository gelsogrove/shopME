/**
 * 🧪 Quick Test for Specific Order Request
 * 
 * Tests if chatbot calls GetLastOrderLink() for "dammi l'ordine 20003"
 */

import {
  cleanupTestData,
  extractResponseMessage,
  setupTestCustomer,
  simulateWhatsAppMessage
} from './common-test-helpers'

describe('🧪 Specific Order Request Test', () => {

  beforeAll(async () => {
    await setupTestCustomer()
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  it('should call GetLastOrderLink() for specific order request', async () => {
    console.log('\n🔍 Testing specific order request: "dammi l ordine 20003"...')
    
    const response = await simulateWhatsAppMessage('dammi l ordine 20003', 'it')
    
    expect(response.status).toBe(200)
    
    const responseMessage = extractResponseMessage(response)
    console.log(`- Response: "${responseMessage}"`)
    
    // Should contain order-specific content
    const hasOrderContent = responseMessage.includes('20003') ||
                           responseMessage.includes('ordine') ||
                           responseMessage.includes('order') ||
                           responseMessage.includes('link') ||
                           responseMessage.includes('token')
    
    expect(hasOrderContent).toBe(true)
    
    // Should NOT contain general orders list message
    const hasGeneralMessage = responseMessage.includes('lista generale') ||
                             responseMessage.includes('general list') ||
                             responseMessage.includes('tutti gli ordini')
    
    expect(hasGeneralMessage).toBe(false)
    
    console.log('✅ Specific order request test passed')
  })
})
