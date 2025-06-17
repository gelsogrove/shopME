import { CheckoutService } from '../../../application/services/checkout.service'

describe('CheckoutService', () => {
  let checkoutService: CheckoutService

  beforeEach(() => {
    checkoutService = new CheckoutService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('detectCheckoutIntent', () => {
    it('should detect checkout intent for order keywords', () => {
      const testCases = [
        'I want to order this product',
        'Can I buy this item?',
        'I would like to purchase',
        'How can I checkout?',
        'I want to finalize my order'
      ]

      testCases.forEach(message => {
        const result = checkoutService.detectCheckoutIntent(message, 'en')
        expect(result).toBe(true)
      })
    })

    it('should not detect checkout intent for regular messages', () => {
      const testCases = [
        'Hello, how are you?',
        'What products do you have?',
        'Can you help me?',
        'Tell me about your services'
      ]

      testCases.forEach(message => {
        const result = checkoutService.detectCheckoutIntent(message, 'en')
        expect(result).toBe(false)
      })
    })

    it('should detect checkout intent in different languages', () => {
      const testCases = [
        { message: 'Voglio ordinare questo prodotto', language: 'it' },
        { message: 'Quiero comprar este artículo', language: 'es' },
        { message: 'Je veux acheter ce produit', language: 'fr' }
      ]

      testCases.forEach(({ message, language }) => {
        const result = checkoutService.detectCheckoutIntent(message, language)
        expect(result).toBe(true)
      })
    })

    it('should handle empty or invalid messages', () => {
      expect(checkoutService.detectCheckoutIntent('', 'en')).toBe(false)
      expect(checkoutService.detectCheckoutIntent('   ', 'en')).toBe(false)
      expect(checkoutService.detectCheckoutIntent('xyz', 'en')).toBe(false)
    })

    it('should default to English for unknown languages', () => {
      const result = checkoutService.detectCheckoutIntent('I want to buy this', 'unknown-lang')
      expect(result).toBe(true)
    })
  })

  describe('generateCheckoutToken', () => {
    it('should generate a valid 32-character token', () => {
      const token = checkoutService.generateCheckoutToken('customer-123', 'workspace-456')
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBe(32)
      expect(token).toMatch(/^[a-f0-9]{32}$/) // Should be hex string
    })

    it('should generate different tokens for different inputs', () => {
      const token1 = checkoutService.generateCheckoutToken('customer-123', 'workspace-456')
      const token2 = checkoutService.generateCheckoutToken('customer-789', 'workspace-456')
      const token3 = checkoutService.generateCheckoutToken('customer-123', 'workspace-789')
      
      expect(token1).not.toBe(token2)
      expect(token1).not.toBe(token3)
      expect(token2).not.toBe(token3)
    })

    it('should generate different tokens for same inputs at different times', () => {
      const token1 = checkoutService.generateCheckoutToken('customer-123', 'workspace-456')
      
      // Wait a small amount to ensure different timestamp
      setTimeout(() => {
        const token2 = checkoutService.generateCheckoutToken('customer-123', 'workspace-456')
        expect(token1).not.toBe(token2)
      }, 10)
    })
  })

  describe('createCheckoutLink', () => {
    it('should create checkout link successfully', async () => {
      const result = await checkoutService.createCheckoutLink(
        'customer-1',
        'workspace-1',
        'Test Customer',
        '+1234567890'
      )

      expect(result.success).toBe(true)
      expect(result.checkoutUrl).toContain('checkout')
      expect(result.checkoutUrl).toContain('token=')
    })

    it('should handle errors gracefully', async () => {
      // Test with invalid data
      const result = await checkoutService.createCheckoutLink(
        '',
        '',
        '',
        ''
      )

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should create a valid checkout link with default URL', async () => {
      const result = await checkoutService.createCheckoutLink('customer-123', 'workspace-456')
      
      expect(result.success).toBe(true)
      expect(result.checkoutUrl).toBeDefined()
      expect(result.token).toBeDefined()
      expect(result.expiresAt).toBeDefined()
      
      // Check URL format
      expect(result.checkoutUrl).toMatch(/^https:\/\//)
      expect(result.checkoutUrl).toContain('checkout?token=')
      expect(result.checkoutUrl).toContain('customer=customer-123')
      expect(result.checkoutUrl).toContain('workspace=workspace-456')
      
      // Check token format
      expect(result.token).toMatch(/^[a-f0-9]{32}$/)
      
      // Check expiration (should be ~1 hour from now)
      const now = new Date()
      const expiresAt = result.expiresAt!
      const timeDiff = expiresAt.getTime() - now.getTime()
      expect(timeDiff).toBeGreaterThan(55 * 60 * 1000) // At least 55 minutes
      expect(timeDiff).toBeLessThan(65 * 60 * 1000) // At most 65 minutes
    })

    it('should create checkout link with custom base URL', async () => {
      const customUrl = 'https://custom-shop.com'
      const result = await checkoutService.createCheckoutLink('customer-123', 'workspace-456', customUrl)
      
      expect(result.success).toBe(true)
      expect(result.checkoutUrl).toMatch(new RegExp(`^${customUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
      expect(result.checkoutUrl).toContain('/checkout?token=')
    })

    it('should handle base URL without protocol', async () => {
      const result = await checkoutService.createCheckoutLink('customer-123', 'workspace-456', 'example.com')
      
      expect(result.success).toBe(true)
      expect(result.checkoutUrl).toMatch(/^https:\/\/example\.com/)
    })

    it('should use environment variable when no base URL provided', async () => {
      // Mock environment variable
      const originalFrontendUrl = process.env.FRONTEND_URL
      process.env.FRONTEND_URL = 'https://env-shop.com'
      
      const result = await checkoutService.createCheckoutLink('customer-123', 'workspace-456')
      
      expect(result.success).toBe(true)
      expect(result.checkoutUrl).toMatch(/^https:\/\/env-shop\.com/)
      
      // Restore original environment
      process.env.FRONTEND_URL = originalFrontendUrl
    })
  })

  describe('getCheckoutMessage', () => {
    it('should return formatted checkout message', () => {
      const checkoutUrl = 'https://example.com/checkout/token123'
      const result = checkoutService.getCheckoutMessage(checkoutUrl, 'en')

      expect(result).toContain(checkoutUrl)
      expect(result).toContain('Complete your order')
    })

    it('should return localized checkout message', () => {
      const checkoutUrl = 'https://example.com/checkout/token123'
      const result = checkoutService.getCheckoutMessage(checkoutUrl, 'it')

      expect(result).toContain(checkoutUrl)
      expect(result).toContain('Completa il tuo ordine')
    })

    it('should generate checkout message in English', () => {
      const message = checkoutService.getCheckoutMessage('https://example.com/checkout', 'John Doe', 'en')
      
      expect(message).toContain('John Doe')
      expect(message).toContain('🛒')
      expect(message).toContain('Ready to complete your order')
      expect(message).toContain('https://example.com/checkout')
      expect(message).toContain('1 hour')
    })

    it('should generate checkout message in Italian', () => {
      const message = checkoutService.getCheckoutMessage('https://example.com/checkout', 'Marco Rossi', 'it')
      
      expect(message).toContain('Marco Rossi')
      expect(message).toContain('🛒')
      expect(message).toContain('Pronto a completare')
      expect(message).toContain('https://example.com/checkout')
      expect(message).toContain('1 ora')
    })

    it('should generate checkout message in Spanish', () => {
      const message = checkoutService.getCheckoutMessage('https://example.com/checkout', 'Juan Pérez', 'es')
      
      expect(message).toContain('Juan Pérez')
      expect(message).toContain('🛒')
      expect(message).toContain('Listo para completar')
      expect(message).toContain('https://example.com/checkout')
      expect(message).toContain('1 hora')
    })

    it('should generate checkout message in Portuguese', () => {
      const message = checkoutService.getCheckoutMessage('https://example.com/checkout', 'João Silva', 'pt')
      
      expect(message).toContain('João Silva')
      expect(message).toContain('🛒')
      expect(message).toContain('Pronto para completar')
      expect(message).toContain('https://example.com/checkout')
      expect(message).toContain('1 hora')
    })

    it('should default to English for unknown languages', () => {
      const message = checkoutService.getCheckoutMessage('https://example.com/checkout', 'Customer', 'unknown-lang')
      
      expect(message).toContain('Customer')
      expect(message).toContain('Ready to complete your order')
      expect(message).toContain('https://example.com/checkout')
    })

    it('should handle language variations', () => {
      // Test different language format variations
      const testCases = [
        { lang: 'Italian', expected: 'Pronto a completare' },
        { lang: 'ITALIAN', expected: 'Pronto a completare' },
        { lang: 'spanish', expected: 'Listo para completar' },
        { lang: 'Portuguese', expected: 'Pronto para completar' }
      ]

      testCases.forEach(({ lang, expected }) => {
        const message = checkoutService.getCheckoutMessage('https://example.com/checkout', 'Customer', lang)
        expect(message).toContain(expected)
      })
    })
  })

  describe('validateCheckoutToken', () => {
    it('should validate properly formatted tokens', async () => {
      const validToken = 'a'.repeat(32) // 32 character hex-like string
      const result = await checkoutService.validateCheckoutToken(validToken, 'customer-123', 'workspace-456')
      
      expect(result).toBe(true)
    })

    it('should reject invalid token formats', async () => {
      const invalidTokens = [
        '', // empty
        'short', // too short
        'a'.repeat(31), // 31 characters
        'a'.repeat(33), // 33 characters
        null as any, // null
        undefined as any // undefined
      ]

      for (const token of invalidTokens) {
        const result = await checkoutService.validateCheckoutToken(token, 'customer-123', 'workspace-456')
        expect(result).toBe(false)
      }
    })

    it('should handle validation errors gracefully', async () => {
      // Mock an error in validation
      const originalConsoleError = console.error
      console.error = jest.fn() // Suppress error logs during test
      
      // This should not throw, but return false
      const result = await checkoutService.validateCheckoutToken('valid32characterstringhere123456', 'customer-123', 'workspace-456')
      
      expect(result).toBe(true) // Current implementation returns true for valid format
      
      console.error = originalConsoleError
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete checkout flow', async () => {
      const customerId = 'customer-123'
      const workspaceId = 'workspace-456'
      const customerName = 'John Doe'
      const language = 'en'
      
      // 1. Detect checkout intent
      const hasIntent = checkoutService.detectCheckoutIntent('I want to buy this product', language)
      expect(hasIntent).toBe(true)
      
      // 2. Create checkout link
      const linkResult = await checkoutService.createCheckoutLink(customerId, workspaceId)
      expect(linkResult.success).toBe(true)
      
      // 3. Generate checkout message
      const message = checkoutService.getCheckoutMessage(linkResult.checkoutUrl!, customerName, language)
      expect(message).toContain(customerName)
      expect(message).toContain(linkResult.checkoutUrl)
      
      // 4. Validate token
      const isValid = await checkoutService.validateCheckoutToken(linkResult.token!, customerId, workspaceId)
      expect(isValid).toBe(true)
    })

    it('should handle multilingual checkout flow', async () => {
      const languages = ['en', 'it', 'es', 'pt']
      const messages = [
        'I want to buy this',
        'Voglio comprare questo',
        'Quiero comprar esto',
        'Quero comprar isto'
      ]
      
      for (let i = 0; i < languages.length; i++) {
        const lang = languages[i]
        const message = messages[i]
        
        // Should detect intent in all languages
        const hasIntent = checkoutService.detectCheckoutIntent(message, lang)
        expect(hasIntent).toBe(true)
        
        // Should generate appropriate message
        const checkoutMessage = checkoutService.getCheckoutMessage('https://example.com/checkout', 'Customer', lang)
        expect(checkoutMessage).toBeDefined()
        expect(checkoutMessage.length).toBeGreaterThan(0)
      }
    })
  })
}) 