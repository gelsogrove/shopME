/**
 * Unit Tests for Calling Functions with Fixed IDs
 * 
 * Tests the calling functions using the fixed IDs from seed:
 * - Workspace ID: cm9hjgq9v00014qk8fsdy4ujv
 * - Customer ID: test-customer-123
 */

import { confirmOrderFromConversation } from '../../../chatbot/calling-functions/confirmOrderFromConversation'
import { CreateOrder } from '../../../chatbot/calling-functions/CreateOrder'
import { prisma } from '../../../lib/prisma'

// Fixed IDs from seed.ts
const FIXED_WORKSPACE_ID = 'cm9hjgq9v00014qk8fsdy4ujv'
const FIXED_CUSTOMER_ID = 'test-customer-123'

describe('Calling Functions with Fixed IDs', () => {
  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('confirmOrderFromConversation with Fixed IDs', () => {
    it('should generate checkout link for fixed customer', async () => {
      const conversationContext = {
        customerId: FIXED_CUSTOMER_ID,
        workspaceId: FIXED_WORKSPACE_ID,
        conversationHistory: [
          {
            role: 'user',
            content: 'Voglio comprare 2 mozzarelle fresche'
          },
          {
            role: 'assistant', 
            content: 'Perfetto! Ho aggiunto 2 mozzarelle fresche al tuo carrello. Prezzo: €8.00'
          }
        ],
        identifiedProducts: [
          {
            id: 'mozzarella-fresca-001',
            name: 'Mozzarella Fresca',
            quantity: 2,
            unitPrice: 4.00,
            totalPrice: 8.00
          }
        ]
      }

      const result = await confirmOrderFromConversation(conversationContext)

      expect(result.success).toBe(true)
      expect(result.checkoutToken).toBeDefined()
      expect(result.checkoutUrl).toBeDefined()
      expect(result.totalAmount).toBe(8.00)
      expect(result.expiresAt).toBeDefined()
    })

    it('should handle empty cart gracefully', async () => {
      const conversationContext = {
        customerId: FIXED_CUSTOMER_ID,
        workspaceId: FIXED_WORKSPACE_ID,
        conversationHistory: [
          {
            role: 'user',
            content: 'Conferma il mio ordine'
          }
        ],
        identifiedProducts: []
      }

      const result = await confirmOrderFromConversation(conversationContext)

      expect(result.success).toBe(false)
      expect(result.response).toContain('carrello vuoto')
    })
  })

  describe('CreateOrder with Fixed IDs', () => {
    it('should create order for fixed customer', async () => {
      const orderParams = {
        workspaceId: FIXED_WORKSPACE_ID,
        customerId: FIXED_CUSTOMER_ID,
        items: [
          {
            itemType: 'PRODUCT' as const,
            id: 'mozzarella-fresca-001',
            name: 'Mozzarella Fresca',
            quantity: 2,
            unitPrice: 4.00
          }
        ],
        notes: 'Test order with fixed IDs'
      }

      const result = await CreateOrder(orderParams)

      expect(result.success).toBe(true)
      expect(result.orderId).toBeDefined()
      expect(result.message).toContain('Ordine creato con successo')
    })

    it('should handle insufficient stock', async () => {
      const orderParams = {
        workspaceId: FIXED_WORKSPACE_ID,
        customerId: FIXED_CUSTOMER_ID,
        items: [
          {
            itemType: 'PRODUCT' as const,
            id: 'mozzarella-fresca-001',
            name: 'Mozzarella Fresca',
            quantity: 9999, // More than available stock
            unitPrice: 4.00
          }
        ]
      }

      const result = await CreateOrder(orderParams)

      expect(result.success).toBe(false)
      expect(result.error).toBe('INSUFFICIENT_STOCK')
    })
  })

  describe('Error Handling with Fixed IDs', () => {
    it('should reject invalid workspace ID', async () => {
      const conversationContext = {
        customerId: FIXED_CUSTOMER_ID,
        workspaceId: 'invalid-workspace-id',
        conversationHistory: [],
        identifiedProducts: []
      }

      const result = await confirmOrderFromConversation(conversationContext)

      expect(result.success).toBe(false)
    })

    it('should reject invalid customer ID', async () => {
      const orderParams = {
        workspaceId: FIXED_WORKSPACE_ID,
        customerId: 'invalid-customer-id',
        items: []
      }

      const result = await CreateOrder(orderParams)

      expect(result.success).toBe(false)
    })
  })
})
