/**
 * Order Simulation Test with Fixed IDs
 * 
 * Simulates a complete order flow using the fixed IDs from seed:
 * - Workspace ID: cm9hjgq9v00014qk8fsdy4ujv
 * - Customer ID: test-customer-123
 * 
 * Flow: Conversation → Product Identification → Order Confirmation → Order Creation
 */

import { confirmOrderFromConversation } from '../../chatbot/calling-functions/confirmOrderFromConversation'
import { CreateOrder } from '../../chatbot/calling-functions/CreateOrder'
import { logger } from '../../utils/logger'

// Fixed IDs from seed.ts
const FIXED_WORKSPACE_ID = 'cm9hjgq9v00014qk8fsdy4ujv'
const FIXED_CUSTOMER_ID = 'test-customer-123'

describe('Order Simulation with Fixed IDs', () => {
  describe('Complete Order Flow Simulation', () => {
    it('should simulate complete order from conversation to creation', async () => {
      // Step 1: Simulate conversation context
      const conversationContext = {
        customerId: FIXED_CUSTOMER_ID,
        workspaceId: FIXED_WORKSPACE_ID,
        conversationContext: "User wants to buy 2 fresh mozzarellas and 1 bottle of red wine",
        conversationHistory: [
          {
            role: 'user',
            content: 'Ciao! Vorrei comprare 2 mozzarelle fresche e 1 bottiglia di vino rosso'
          },
          {
            role: 'assistant',
            content: 'Perfetto! Ho aggiunto al tuo carrello:\n• 2x Mozzarella Fresca (€4.00 cadauna)\n• 1x Vino Rosso Chianti (€12.00)\n\nTotale: €20.00\n\nVuoi procedere con l\'ordine?'
          },
          {
            role: 'user',
            content: 'Sì, conferma il mio ordine'
          }
        ],
        identifiedProducts: [
          {
            id: 'mozzarella-fresca-001',
            name: 'Mozzarella Fresca',
            quantity: 2,
            unitPrice: 4.00,
            totalPrice: 8.00
          },
          {
            id: 'vino-rosso-chianti-001',
            name: 'Vino Rosso Chianti',
            quantity: 1,
            unitPrice: 12.00,
            totalPrice: 12.00
          }
        ]
      }

      // Step 2: Test order confirmation (generate checkout link)
      logger.info('🛒 Step 1: Confirming order from conversation...')
      const confirmationResult = await confirmOrderFromConversation(conversationContext)

      // Verify confirmation step
      expect(confirmationResult.success).toBe(true)
      expect(confirmationResult.checkoutToken).toBeDefined()
      expect(confirmationResult.checkoutUrl).toBeDefined()
      expect(confirmationResult.totalAmount).toBe(20.00)
      expect(confirmationResult.expiresAt).toBeDefined()

      logger.info(`✅ Order confirmation successful:`)
      logger.info(`   - Total Amount: €${confirmationResult.totalAmount}`)
      logger.info(`   - Checkout Token: ${confirmationResult.checkoutToken?.substring(0, 20)}...`)
      logger.info(`   - Checkout URL: ${confirmationResult.checkoutUrl}`)

      // Step 3: Test actual order creation
      logger.info('📝 Step 2: Creating actual order...')
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
          },
          {
            itemType: 'PRODUCT' as const,
            id: 'vino-rosso-chianti-001',
            name: 'Vino Rosso Chianti',
            quantity: 1,
            unitPrice: 12.00
          }
        ],
        notes: 'Ordine simulato con ID fissi - Test completo del flusso'
      }

      const orderResult = await CreateOrder(orderParams)

      // Verify order creation
      expect(orderResult.success).toBe(true)
      expect(orderResult.orderId).toBeDefined()
      expect(orderResult.message).toContain('Ordine creato con successo')

      logger.info(`✅ Order creation successful:`)
      logger.info(`   - Order ID: ${orderResult.orderId}`)
      logger.info(`   - Message: ${orderResult.message}`)

      // Step 4: Verify order details
      logger.info('🔍 Step 3: Verifying order details...')
      expect(orderResult.orderId).toBeTruthy()
      expect(typeof orderResult.orderId).toBe('string')
      expect(orderResult.orderId.length).toBeGreaterThan(0)

      logger.info('🎉 Complete order simulation successful!')
    })

    it('should handle order with services', async () => {
      // Simulate order with both products and services
      const conversationContext = {
        customerId: FIXED_CUSTOMER_ID,
        workspaceId: FIXED_WORKSPACE_ID,
        conversationContext: "User wants to buy 1 mozzarella and book urgent delivery",
        conversationHistory: [
          {
            role: 'user',
            content: 'Voglio comprare 1 mozzarella e prenotare una consegna urgente'
          },
          {
            role: 'assistant',
            content: 'Perfetto! Ho aggiunto:\n• 1x Mozzarella Fresca (€4.00)\n• 1x Consegna Urgente (€5.00)\n\nTotale: €9.00'
          }
        ],
        identifiedProducts: [
          {
            id: 'mozzarella-fresca-001',
            name: 'Mozzarella Fresca',
            quantity: 1,
            unitPrice: 4.00,
            totalPrice: 4.00
          }
        ]
      }

      // Test confirmation
      const confirmationResult = await confirmOrderFromConversation(conversationContext)
      expect(confirmationResult.success).toBe(true)
      expect(confirmationResult.totalAmount).toBe(4.00)

      // Test order creation with service
      const orderParams = {
        workspaceId: FIXED_WORKSPACE_ID,
        customerId: FIXED_CUSTOMER_ID,
        items: [
          {
            itemType: 'PRODUCT' as const,
            id: 'mozzarella-fresca-001',
            name: 'Mozzarella Fresca',
            quantity: 1,
            unitPrice: 4.00
          },
          {
            itemType: 'SERVICE' as const,
            id: 'consegna-urgente-001',
            name: 'Consegna Urgente',
            quantity: 1,
            unitPrice: 5.00
          }
        ],
        notes: 'Ordine con prodotto e servizio'
      }

      const orderResult = await CreateOrder(orderParams)
      expect(orderResult.success).toBe(true)
    })

    it('should handle empty cart gracefully', async () => {
      const conversationContext = {
        customerId: FIXED_CUSTOMER_ID,
        workspaceId: FIXED_WORKSPACE_ID,
        conversationContext: "User wants to confirm empty order",
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
      expect(result.response).toContain('I have not identified products')
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
        ],
        notes: 'Test stock insufficiente'
      }

      const result = await CreateOrder(orderParams)
      expect(result.success).toBe(false)
      expect(result.error).toBe('INSUFFICIENT_STOCK')
    })
  })

  describe('Order Validation', () => {
    it('should validate order parameters', () => {
      const validateOrderParams = (params: any) => {
        const errors = []
        
        if (!params.workspaceId) errors.push('Missing workspaceId')
        if (!params.customerId) errors.push('Missing customerId')
        if (!params.items || params.items.length === 0) errors.push('Missing items')
        
        params.items?.forEach((item: any, index: number) => {
          if (!item.id) errors.push(`Item ${index}: Missing id`)
          if (!item.name) errors.push(`Item ${index}: Missing name`)
          if (!item.quantity || item.quantity <= 0) errors.push(`Item ${index}: Invalid quantity`)
          if (!item.unitPrice || item.unitPrice <= 0) errors.push(`Item ${index}: Invalid unitPrice`)
        })
        
        return errors
      }

      const validParams = {
        workspaceId: FIXED_WORKSPACE_ID,
        customerId: FIXED_CUSTOMER_ID,
        items: [
          {
            id: 'test-product',
            name: 'Test Product',
            quantity: 1,
            unitPrice: 10.00
          }
        ]
      }

      const invalidParams = {
        workspaceId: '',
        customerId: FIXED_CUSTOMER_ID,
        items: []
      }

      expect(validateOrderParams(validParams)).toHaveLength(0)
      expect(validateOrderParams(invalidParams)).toContain('Missing workspaceId')
      expect(validateOrderParams(invalidParams)).toContain('Missing items')
    })

    it('should calculate order totals correctly', () => {
      const calculateOrderTotal = (items: any[]) => {
        return items.reduce((total, item) => {
          return total + (item.quantity * item.unitPrice)
        }, 0)
      }

      const items = [
        { quantity: 2, unitPrice: 4.00 },
        { quantity: 1, unitPrice: 12.00 },
        { quantity: 3, unitPrice: 2.50 }
      ]

      const total = calculateOrderTotal(items)
      expect(total).toBe(2 * 4.00 + 1 * 12.00 + 3 * 2.50) // 8 + 12 + 7.5 = 27.5
      expect(total).toBe(27.5)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid workspace ID', async () => {
      const conversationContext = {
        customerId: FIXED_CUSTOMER_ID,
        workspaceId: 'invalid-workspace-id',
        conversationHistory: [],
        identifiedProducts: []
      }

      const result = await confirmOrderFromConversation(conversationContext)
      expect(result.success).toBe(false)
    })

    it('should handle invalid customer ID', async () => {
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
