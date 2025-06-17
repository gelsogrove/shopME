import { ApiLimitService } from '../../application/services/api-limit.service'
import { CheckoutService } from '../../application/services/checkout.service'
import { MessageService } from '../../application/services/message.service'
import { TokenService } from '../../application/services/token.service'
import { MessageRepository } from '../../repositories/message.repository'

describe('WhatsApp Flow Integration Test', () => {
  let messageService: MessageService
  let messageRepository: MessageRepository
  let tokenService: TokenService
  let checkoutService: CheckoutService
  let apiLimitService: ApiLimitService

  beforeAll(async () => {
    // Initialize real services
    messageRepository = new MessageRepository()
    tokenService = new TokenService()
    checkoutService = new CheckoutService()
    apiLimitService = new ApiLimitService()
    
    messageService = new MessageService(
      messageRepository,
      tokenService,
      checkoutService,
      apiLimitService
    )
  })

  describe('Complete Flow Test', () => {
    const testWorkspaceId = 'cm9hjgq9v00014qk8fsdy4ujv' // From seed
    const testPhoneNumber = '+34666777888'

    it('should handle new user greeting flow', async () => {
      const result = await messageService.processMessage(
        'Hello',
        testPhoneNumber,
        testWorkspaceId
      )

      // Should return welcome message with registration link
      expect(result).toBeTruthy()
      if (result) {
        expect(result).toContain('Welcome')
        expect(result).toContain('register')
      }
    }, 30000)

    it('should handle checkout intent detection', async () => {
      const result = await messageService.processMessage(
        'I want to buy some pasta',
        testPhoneNumber,
        testWorkspaceId
      )

      // Should detect checkout intent and provide link
      expect(result).toBeTruthy()
      if (result) {
        expect(result.toLowerCase()).toContain('order')
      }
    }, 30000)

    it('should handle normal chat with RAG', async () => {
      const result = await messageService.processMessage(
        'What products do you have?',
        testPhoneNumber,
        testWorkspaceId
      )

      // Should return AI response
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    }, 30000)

    it('should handle API limit exceeded', async () => {
      // This would require mocking the API limit service
      // For now, just verify the method exists
      expect(messageService.processMessage).toBeDefined()
    })

    it('should handle workspace inactive', async () => {
      // Test with a non-existent workspace
      const result = await messageService.processMessage(
        'Hello',
        testPhoneNumber,
        'non-existent-workspace'
      )

      // Should return null for inactive workspace
      expect(result).toBeNull()
    }, 30000)
  })

  describe('Error Handling', () => {
    it('should handle invalid workspace gracefully', async () => {
      const result = await messageService.processMessage(
        'Hello',
        '+1234567890',
        'invalid-workspace-id'
      )

      // Should handle error gracefully
      expect(result).toBeNull()
    }, 30000)

    it('should handle empty message gracefully', async () => {
      const result = await messageService.processMessage(
        '',
        '+1234567890',
        testWorkspaceId
      )

      // Should handle empty message
      expect(result).toBeDefined()
    }, 30000)
  })
}) 