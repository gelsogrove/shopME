/**
 * Order Flow Integration Test with Fixed IDs
 * 
 * Tests the complete order flow via API endpoints using fixed IDs:
 * - Workspace ID: cm9hjgq9v00014qk8fsdy4ujv
 * - Customer ID: test-customer-123
 * 
 * Flow: Token Generation → Order Confirmation → Order Creation → Order Retrieval
 */

import request from 'supertest'
import { app } from '../../app'

// Fixed IDs from seed.ts
const FIXED_WORKSPACE_ID = 'cm9hjgq9v00014qk8fsdy4ujv'
const FIXED_CUSTOMER_ID = 'test-customer-123'

describe('Order Flow Integration with Fixed IDs', () => {
  let generatedToken: string
  let createdOrderId: string

  describe('Complete Order Flow via API', () => {
    it('should complete full order flow from token to order creation', async () => {
      logger.info('🚀 Starting complete order flow test...')

      // Step 1: Generate token for orders
      logger.info('📋 Step 1: Generating token...')
      const tokenResponse = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .send({
          customerId: FIXED_CUSTOMER_ID,
          action: 'orders',
          workspaceId: FIXED_WORKSPACE_ID
        })

      expect(tokenResponse.status).toBe(200)
      expect(tokenResponse.body.success).toBe(true)
      expect(tokenResponse.body.token).toBeDefined()
      
      generatedToken = tokenResponse.body.token
      logger.info(`✅ Token generated: ${generatedToken.substring(0, 20)}...`)

      // Step 2: Access orders page with token
      logger.info('🛒 Step 2: Accessing orders page...')
      const ordersResponse = await request(app)
        .get(`/api/orders?token=${generatedToken}`)

      expect(ordersResponse.status).toBe(200)
      expect(ordersResponse.body.success).toBe(true)
      expect(ordersResponse.body.data.customer.id).toBe(FIXED_CUSTOMER_ID)
      expect(ordersResponse.body.data.customer.name).toBe('Test Customer MCP')
      
      logger.info(`✅ Orders page accessed for customer: ${ordersResponse.body.data.customer.name}`)

      // Step 3: Create order via internal API
      logger.info('📝 Step 3: Creating order...')
      const createOrderResponse = await request(app)
        .post('/api/internal/orders')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .send({
          workspaceId: FIXED_WORKSPACE_ID,
          customerId: FIXED_CUSTOMER_ID,
          items: [
            {
              itemType: 'PRODUCT',
              id: 'mozzarella-fresca-001',
              name: 'Mozzarella Fresca',
              quantity: 2,
              unitPrice: 4.00
            },
            {
              itemType: 'PRODUCT',
              id: 'vino-rosso-chianti-001',
              name: 'Vino Rosso Chianti',
              quantity: 1,
              unitPrice: 12.00
            }
          ],
          notes: 'Ordine di test via API con ID fissi'
        })

      expect(createOrderResponse.status).toBe(200)
      expect(createOrderResponse.body.success).toBe(true)
      expect(createOrderResponse.body.data.orderId).toBeDefined()
      
      createdOrderId = createOrderResponse.body.data.orderId
      logger.info(`✅ Order created with ID: ${createdOrderId}`)

      // Step 4: Retrieve the created order
      logger.info('🔍 Step 4: Retrieving created order...')
      const getOrderResponse = await request(app)
        .get(`/api/internal/orders/${createdOrderId}`)
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .query({ workspaceId: FIXED_WORKSPACE_ID })

      expect(getOrderResponse.status).toBe(200)
      expect(getOrderResponse.body.success).toBe(true)
      expect(getOrderResponse.body.data.id).toBe(createdOrderId)
      expect(getOrderResponse.body.data.customerId).toBe(FIXED_CUSTOMER_ID)
      expect(getOrderResponse.body.data.workspaceId).toBe(FIXED_WORKSPACE_ID)
      
      logger.info(`✅ Order retrieved successfully`)
      logger.info(`   - Order Code: ${getOrderResponse.body.data.orderCode}`)
      logger.info(`   - Total Amount: €${getOrderResponse.body.data.totalAmount}`)
      logger.info(`   - Items Count: ${getOrderResponse.body.data.orderItems?.length || 0}`)

      // Step 5: Verify order items
      if (getOrderResponse.body.data.orderItems) {
        expect(getOrderResponse.body.data.orderItems).toHaveLength(2)
        
        const mozzarellaItem = getOrderResponse.body.data.orderItems.find((item: any) => 
          item.product?.name === 'Mozzarella Fresca'
        )
        const vinoItem = getOrderResponse.body.data.orderItems.find((item: any) => 
          item.product?.name === 'Vino Rosso Chianti'
        )

        expect(mozzarellaItem).toBeDefined()
        expect(mozzarellaItem.quantity).toBe(2)
        expect(mozzarellaItem.unitPrice).toBe(4.00)

        expect(vinoItem).toBeDefined()
        expect(vinoItem.quantity).toBe(1)
        expect(vinoItem.unitPrice).toBe(12.00)

        logger.info('✅ Order items verified correctly')
      }

      logger.info('🎉 Complete order flow test successful!')
    })

    it('should handle order with services via API', async () => {
      // Generate token
      const tokenResponse = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .send({
          customerId: FIXED_CUSTOMER_ID,
          action: 'orders',
          workspaceId: FIXED_WORKSPACE_ID
        })

      expect(tokenResponse.status).toBe(200)
      const token = tokenResponse.body.token

      // Create order with service
      const createOrderResponse = await request(app)
        .post('/api/internal/orders')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .send({
          workspaceId: FIXED_WORKSPACE_ID,
          customerId: FIXED_CUSTOMER_ID,
          items: [
            {
              itemType: 'PRODUCT',
              id: 'mozzarella-fresca-001',
              name: 'Mozzarella Fresca',
              quantity: 1,
              unitPrice: 4.00
            },
            {
              itemType: 'SERVICE',
              id: 'consegna-urgente-001',
              name: 'Consegna Urgente',
              quantity: 1,
              unitPrice: 5.00
            }
          ],
          notes: 'Ordine con prodotto e servizio via API'
        })

      expect(createOrderResponse.status).toBe(200)
      expect(createOrderResponse.body.success).toBe(true)
    })
  })

  describe('Token Validation and Security', () => {
    it('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/orders?token=invalid-token')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it('should reject expired tokens', async () => {
      // Create a token with very short expiration (1 second)
      const tokenResponse = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .send({
          customerId: FIXED_CUSTOMER_ID,
          action: 'orders',
          workspaceId: FIXED_WORKSPACE_ID,
          expiresIn: 1 // 1 second
        })

      expect(tokenResponse.status).toBe(200)
      const token = tokenResponse.body.token

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await request(app)
        .get(`/api/orders?token=${token}`)

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it('should validate workspace isolation', async () => {
      // Try to access order from wrong workspace
      const response = await request(app)
        .get(`/api/internal/orders/${createdOrderId || 'test-order-id'}`)
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .query({ workspaceId: 'wrong-workspace-id' })

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/internal/orders')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .send({
          workspaceId: FIXED_WORKSPACE_ID,
          // Missing customerId
          items: []
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should handle invalid item data', async () => {
      const response = await request(app)
        .post('/api/internal/orders')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .send({
          workspaceId: FIXED_WORKSPACE_ID,
          customerId: FIXED_CUSTOMER_ID,
          items: [
            {
              itemType: 'PRODUCT',
              // Missing required fields
              name: 'Test Product'
            }
          ]
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should handle non-existent customer', async () => {
      const response = await request(app)
        .post('/api/internal/orders')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .send({
          workspaceId: FIXED_WORKSPACE_ID,
          customerId: 'non-existent-customer',
          items: []
        })

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })
  })
})
