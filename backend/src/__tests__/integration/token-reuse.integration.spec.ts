import { PrismaClient } from '@prisma/client'
import request from 'supertest'
import app from '../../app'

const prisma = new PrismaClient()

describe('Token Reuse Integration Tests', () => {
  const testCustomerId = '7cfe9033-5fe5-47be-929f-4e40a024c94c'
  const testWorkspaceId = 'cm9hjgq9v00014qk8fsdy4ujv'
  const authHeader = 'Basic ' + Buffer.from('admin:admin').toString('base64')

  beforeEach(async () => {
    // Clean up tokens for test customer
    await prisma.secureToken.deleteMany({
      where: {
        customerId: testCustomerId,
      },
    })
  })

  afterAll(async () => {
    // Clean up
    await prisma.secureToken.deleteMany({
      where: {
        customerId: testCustomerId,
      },
    })
    await prisma.$disconnect()
  })

  describe('POST /api/internal/generate-token - Token Reuse', () => {
    it('should return the same token for multiple requests within 1 hour', async () => {
      const tokenPayload = {
        customerId: testCustomerId,
        workspaceId: testWorkspaceId,
        action: 'orders',
      }

      // First request
      const response1 = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', authHeader)
        .send(tokenPayload)
        .expect(200)

      expect(response1.body).toHaveProperty('token')
      expect(typeof response1.body.token).toBe('string')
      expect(response1.body.token.length).toBe(64) // SHA-256 hex string

      const firstToken = response1.body.token

      // Wait 1 second to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Second request
      const response2 = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', authHeader)
        .send(tokenPayload)
        .expect(200)

      const secondToken = response2.body.token

      // Third request
      const response3 = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', authHeader)
        .send(tokenPayload)
        .expect(200)

      const thirdToken = response3.body.token

      // Assert: All tokens should be identical
      expect(secondToken).toBe(firstToken)
      expect(thirdToken).toBe(firstToken)

      // Verify only one record exists in database
      const tokensInDb = await prisma.secureToken.findMany({
        where: {
          customerId: testCustomerId,
          type: 'orders',
          workspaceId: testWorkspaceId,
        },
      })

      expect(tokensInDb).toHaveLength(1)
      expect(tokensInDb[0].token).toBe(firstToken)
    })

    it('should create different tokens for different action types', async () => {
      // Create orders token
      const ordersResponse = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', authHeader)
        .send({
          customerId: testCustomerId,
          workspaceId: testWorkspaceId,
          action: 'orders',
        })
        .expect(200)

      // Create profile token
      const profileResponse = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', authHeader)
        .send({
          customerId: testCustomerId,
          workspaceId: testWorkspaceId,
          action: 'profile',
        })
        .expect(200)

      // Tokens should be different
      expect(ordersResponse.body.token).not.toBe(profileResponse.body.token)

      // Both should be valid tokens
      expect(typeof ordersResponse.body.token).toBe('string')
      expect(typeof profileResponse.body.token).toBe('string')
      expect(ordersResponse.body.token.length).toBe(64)
      expect(profileResponse.body.token.length).toBe(64)

      // Verify two records exist in database
      const tokensInDb = await prisma.secureToken.findMany({
        where: {
          customerId: testCustomerId,
          workspaceId: testWorkspaceId,
        },
      })

      expect(tokensInDb).toHaveLength(2)
      expect(tokensInDb.map(t => t.type).sort()).toEqual(['orders', 'profile'])
    })

    it('should create different tokens for different customers', async () => {
      const customer1Id = testCustomerId
      const customer2Id = 'different-customer-id-12345'

      // Create token for customer 1
      const response1 = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', authHeader)
        .send({
          customerId: customer1Id,
          workspaceId: testWorkspaceId,
          action: 'orders',
        })
        .expect(200)

      // Create token for customer 2
      const response2 = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', authHeader)
        .send({
          customerId: customer2Id,
          workspaceId: testWorkspaceId,
          action: 'orders',
        })
        .expect(200)

      // Tokens should be different
      expect(response1.body.token).not.toBe(response2.body.token)

      // Clean up customer 2 token
      await prisma.secureToken.deleteMany({
        where: {
          customerId: customer2Id,
        },
      })
    })

    it('should handle token expiration correctly', async () => {
      // Create a token that expires quickly (we'll manually set expiration in DB)
      const response = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', authHeader)
        .send({
          customerId: testCustomerId,
          workspaceId: testWorkspaceId,
          action: 'orders',
        })
        .expect(200)

      const originalToken = response.body.token

      // Manually expire the token
      await prisma.secureToken.updateMany({
        where: {
          customerId: testCustomerId,
          type: 'orders',
          workspaceId: testWorkspaceId,
        },
        data: {
          expiresAt: new Date(Date.now() - 1000), // 1 second ago
        },
      })

      // Request new token - should create a new one
      const newResponse = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', authHeader)
        .send({
          customerId: testCustomerId,
          workspaceId: testWorkspaceId,
          action: 'orders',
        })
        .expect(200)

      const newToken = newResponse.body.token

      // Should be different from original token
      expect(newToken).not.toBe(originalToken)
      expect(typeof newToken).toBe('string')
      expect(newToken.length).toBe(64)
    })
  })

  describe('Token Validation After Reuse', () => {
    it('should validate reused tokens correctly', async () => {
      // Generate token
      const generateResponse = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', authHeader)
        .send({
          customerId: testCustomerId,
          workspaceId: testWorkspaceId,
          action: 'orders',
        })
        .expect(200)

      const token = generateResponse.body.token

      // Get the same token again (should reuse)
      const reuseResponse = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', authHeader)
        .send({
          customerId: testCustomerId,
          workspaceId: testWorkspaceId,
          action: 'orders',
        })
        .expect(200)

      expect(reuseResponse.body.token).toBe(token)

      // Validate the reused token works correctly
      // This would require a validation endpoint, but we can check the database
      const tokenInDb = await prisma.secureToken.findFirst({
        where: {
          token: token,
          customerId: testCustomerId,
          type: 'orders',
          workspaceId: testWorkspaceId,
        },
      })

      expect(tokenInDb).toBeTruthy()
      expect(tokenInDb!.expiresAt.getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('GET /api/internal/public/orders - Token-Only Access', () => {
    let validToken: string

    beforeEach(async () => {
      // Generate a valid token for testing
      const tokenResponse = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', authHeader)
        .send({
          customerId: testCustomerId,
          workspaceId: testWorkspaceId,
          action: 'orders',
        })
        .expect(200)

      validToken = tokenResponse.body.token
    })

    it('should access orders list with only token parameter', async () => {
      const response = await request(app)
        .get('/api/internal/public/orders')
        .query({ token: validToken })
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('customer')
      expect(response.body.data).toHaveProperty('orders')
      expect(Array.isArray(response.body.data.orders)).toBe(true)
    })

    it('should reject access with invalid token', async () => {
      const response = await request(app)
        .get('/api/internal/public/orders')
        .query({ token: 'invalid-token-12345' })
        .expect(401)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'Invalid or expired token')
    })

    it('should reject access without token parameter', async () => {
      const response = await request(app)
        .get('/api/internal/public/orders')
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'token is required')
    })

    it('should access specific order with only token parameter', async () => {
      // First get orders list to find an order code
      const ordersResponse = await request(app)
        .get('/api/internal/public/orders')
        .query({ token: validToken })
        .expect(200)

      const orders = ordersResponse.body.data.orders
      if (orders.length > 0) {
        const orderCode = orders[0].orderCode

        const response = await request(app)
          .get(`/api/internal/public/orders/${orderCode}`)
          .query({ token: validToken })
          .expect(200)

        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveProperty('order')
        expect(response.body.data.order).toHaveProperty('orderCode', orderCode)
      }
    })
  })
})
