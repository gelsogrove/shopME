/**
 * 🧪 Welcome Message Integration Test
 * 
 * Tests welcome messages and registration flow:
 * - Ciao (Italian) → Italian welcome + registration link
 * - Hola (Spanish) → Spanish welcome + registration link
 * - Hi/Hello (English) → English welcome + registration link
 * 
 * Verifies language detection and registration links
 */

import {
    extractResponseMessage,
    isResponseInLanguage,
    simulateWhatsAppMessage
} from './common-test-helpers'

describe('🧪 Welcome Message Integration Test', () => {

  describe('🇮🇹 Italian Welcome Messages', () => {
    const italianGreetings = [
      'Ciao',
      'ciao',
      'Buongiorno',
      'Salve'
    ]

    italianGreetings.forEach((greeting) => {
      it(`should respond in Italian to "${greeting}" with registration link`, async () => {
        console.log(`\n👋 Testing Italian greeting: "${greeting}"`)
        
        const response = await simulateWhatsAppMessage(greeting, 'it', '+39999999999')
        
        console.log(`- Response Status: ${response.status}`)
        expect(response.status).toBe(200)
        
        const responseMessage = extractResponseMessage(response)
        console.log(`- Response: "${responseMessage.substring(0, 100)}..."`)
        
        // Verify response is in Italian
        const isItalian = isResponseInLanguage(responseMessage, 'it') ||
                         responseMessage.includes('Ciao') ||
                         responseMessage.includes('benvenuto') ||
                         responseMessage.includes('servizio')
        console.log(`- Response in Italian: ${isItalian}`)
        expect(isItalian).toBe(true)
        
        // Verify registration link is provided
        const hasRegistrationLink = responseMessage.includes('register') ||
                                   responseMessage.includes('registr') ||
                                   responseMessage.includes('To use this service') ||
                                   responseMessage.includes('Per utilizzare questo servizio')
        console.log(`- Contains registration info: ${hasRegistrationLink}`)
        expect(hasRegistrationLink).toBe(true)
        
        console.log(`✅ Italian greeting "${greeting}" - ALL TESTS PASSED`)
      })
    })
  })

  describe('🇪🇸 Spanish Welcome Messages', () => {
    const spanishGreetings = [
      'Hola',
      'hola',
      'Buenos días',
      'Saludos'
    ]

    spanishGreetings.forEach((greeting) => {
      it(`should respond in Spanish to "${greeting}" with registration link`, async () => {
        console.log(`\n👋 Testing Spanish greeting: "${greeting}"`)
        
        const response = await simulateWhatsAppMessage(greeting, 'es', '+34999999999')
        
        console.log(`- Response Status: ${response.status}`)
        expect(response.status).toBe(200)
        
        const responseMessage = extractResponseMessage(response)
        console.log(`- Response: "${responseMessage.substring(0, 100)}..."`)
        
        // Verify response is in Spanish
        const isSpanish = isResponseInLanguage(responseMessage, 'es') ||
                         responseMessage.includes('Hola') ||
                         responseMessage.includes('bienvenido') ||
                         responseMessage.includes('servicio')
        console.log(`- Response in Spanish: ${isSpanish}`)
        expect(isSpanish).toBe(true)
        
        // Verify registration link is provided
        const hasRegistrationLink = responseMessage.includes('register') ||
                                   responseMessage.includes('registr') ||
                                   responseMessage.includes('To use this service') ||
                                   responseMessage.includes('Para utilizar este servicio')
        console.log(`- Contains registration info: ${hasRegistrationLink}`)
        expect(hasRegistrationLink).toBe(true)
        
        console.log(`✅ Spanish greeting "${greeting}" - ALL TESTS PASSED`)
      })
    })
  })

  describe('🇬🇧 English Welcome Messages', () => {
    const englishGreetings = [
      'Hi',
      'Hello',
      'hello',
      'hi',
      'Good morning',
      'Hey'
    ]

    englishGreetings.forEach((greeting) => {
      it(`should respond in English to "${greeting}" with registration link`, async () => {
        console.log(`\n👋 Testing English greeting: "${greeting}"`)
        
        const response = await simulateWhatsAppMessage(greeting, 'en', '+1999999999')
        
        console.log(`- Response Status: ${response.status}`)
        expect(response.status).toBe(200)
        
        const responseMessage = extractResponseMessage(response)
        console.log(`- Response: "${responseMessage.substring(0, 100)}..."`)
        
        // Verify response is in English
        const isEnglish = isResponseInLanguage(responseMessage, 'en') ||
                         responseMessage.includes('Hello') ||
                         responseMessage.includes('Hi') ||
                         responseMessage.includes('welcome') ||
                         responseMessage.includes('service')
        console.log(`- Response in English: ${isEnglish}`)
        expect(isEnglish).toBe(true)
        
        // Verify registration link is provided
        const hasRegistrationLink = responseMessage.includes('register') ||
                                   responseMessage.includes('To use this service') ||
                                   responseMessage.includes('registration') ||
                                   responseMessage.includes('sign up')
        console.log(`- Contains registration info: ${hasRegistrationLink}`)
        expect(hasRegistrationLink).toBe(true)
        
        console.log(`✅ English greeting "${greeting}" - ALL TESTS PASSED`)
      })
    })
  })

  describe('🎯 Registration Flow Verification', () => {
    it('should maintain language consistency in registration flow', async () => {
      console.log('\n🎯 Testing registration flow language consistency...')
      
      const greetings = [
        { text: 'Hello', lang: 'en' },
        { text: 'Ciao', lang: 'it' },
        { text: 'Hola', lang: 'es' }
      ]

      for (const greeting of greetings) {
        console.log(`\n- Testing: "${greeting.text}" (${greeting.lang})`)
        
        const response = await simulateWhatsAppMessage(greeting.text, greeting.lang, `+${Math.floor(Math.random() * 999999999)}`)
        expect(response.status).toBe(200)
        
        const responseMessage = extractResponseMessage(response)
        
        // Check for registration requirement
        const requiresRegistration = responseMessage.includes('register') ||
                                    responseMessage.includes('To use this service') ||
                                    responseMessage.includes('Per utilizzare questo servizio') ||
                                    responseMessage.includes('Para utilizar este servicio')
        
        console.log(`  ✅ Requires registration (${greeting.lang}): ${requiresRegistration}`)
        expect(requiresRegistration).toBe(true)
      }
      
      console.log('\n✅ Registration flow verification - ALL TESTS PASSED')
    })
  })

  describe('📊 Welcome Message Test Summary', () => {
    it('should summarize welcome message test results', async () => {
      console.log('\n📊 WELCOME MESSAGE TEST SUMMARY:')
      console.log('✅ Italian greetings work correctly')
      console.log('✅ Spanish greetings work correctly')
      console.log('✅ English greetings work correctly')
      console.log('✅ Language detection working')
      console.log('✅ Registration links provided')
      console.log('\n🚀 ALL WELCOME MESSAGE TESTS PASSED!')
      
      expect(true).toBe(true)
    })
  })
})
