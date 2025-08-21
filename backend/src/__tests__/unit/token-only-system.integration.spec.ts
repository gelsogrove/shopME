import request from 'supertest'
import app from '../../app'
import { connectTestDatabase, createTestCustomer, createTestUser, createTestWorkspace, testPrisma } from '../unit/helpers/prisma-test'

describe('🔐 TOKEN-ONLY SYSTEM Integration Tests', () => {
  let testWorkspace: any
  let testCustomer: any
  let testUser: any
  let universalToken: string

  beforeAll(async () => {
    // Connect to test database
    await connectTestDatabase()
    
    // Clean up any existing test data
    await testPrisma.secureToken.deleteMany({
      where: {
        token: {
          startsWith: 'test-'
        }
      }
    })

    // Create test workspace
    testWorkspace = await createTestWorkspace('Token-Only Test Workspace')
    
    // Create test customer
    testCustomer = await createTestCustomer(testWorkspace.id, {
      name: 'Test Customer Token',
      email: 'test-token@example.com',
      phone: '+393331112223'
    })

    // Create test user
    testUser = await createTestUser(testWorkspace.id, {
      email: 'test-user@example.com',
      password: 'TestPassword123!'
    })
  })

  afterAll(async () => {
    // Clean up test data
    await testPrisma.secureToken.deleteMany({
      where: {
        customerId: testCustomer.id
      }
    })
    await testPrisma.customers.delete({
      where: { id: testCustomer.id }
    })
    await testPrisma.user.delete({
      where: { id: testUser.id }
    })
    await testPrisma.workspace.delete({
      where: { id: testWorkspace.id }
    })
    await testPrisma.$disconnect()
  })

  describe('🎯 Universal Token Generation', () => {
    test('should generate universal token (type: "any") for profile action', async () => {
      const response = await request(app)
        .post('/api/internal/generate-token')
        .send({
          customerId: testCustomer.id,
          workspaceId: testWorkspace.id,
          action: 'profile'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.token).toBeDefined()
      expect(response.body.linkUrl).toContain('/customer-profile?token=')
      expect(response.body.action).toBe('profile')

      // Store token for cross-page tests
      universalToken = response.body.token

      // Verify token is created with type "any" in database
      const tokenRecord = await testPrisma.secureToken.findFirst({
        where: { token: universalToken }
      })
      expect(tokenRecord).toBeDefined()
      expect(tokenRecord?.type).toBe('any')
      expect(tokenRecord?.customerId).toBe(testCustomer.id)
      expect(tokenRecord?.workspaceId).toBe(testWorkspace.id)
    })

    test('should generate universal token (type: "any") for orders action', async () => {
      const response = await request(app)
        .post('/api/internal/generate-token')
        .send({
          customerId: testCustomer.id,
          workspaceId: testWorkspace.id,
          action: 'orders'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.token).toBeDefined()
      expect(response.body.linkUrl).toContain('/orders-public?token=')
      expect(response.body.action).toBe('orders')

      // Verify token is created with type "any" in database
      const tokenRecord = await testPrisma.secureToken.findFirst({
        where: { token: response.body.token }
      })
      expect(tokenRecord).toBeDefined()
      expect(tokenRecord?.type).toBe('any')
    })

    test('should reuse existing universal token if not expired', async () => {
      // Generate first token
      const response1 = await request(app)
        .post('/api/internal/generate-token')
        .send({
          customerId: testCustomer.id,
          workspaceId: testWorkspace.id,
          action: 'profile'
        })
        .expect(200)

      const firstToken = response1.body.token

      // Generate second token immediately (should reuse)
      const response2 = await request(app)
        .post('/api/internal/generate-token')
        .send({
          customerId: testCustomer.id,
          workspaceId: testWorkspace.id,
          action: 'orders'
        })
        .expect(200)

      // Should return the same token (reuse logic)
      expect(response2.body.token).toBe(firstToken)
    })
  })

  describe('🔄 Cross-Page Token Validation', () => {
    test('should validate universal token for profile page', async () => {
      const response = await request(app)
        .post('/api/internal/validate-secure-token')
        .send({
          token: universalToken,
          workspaceId: testWorkspace.id
        })
        .expect(200)

      expect(response.body.valid).toBe(true)
      expect(response.body.data.customerId).toBe(testCustomer.id)
      expect(response.body.data.workspaceId).toBe(testWorkspace.id)
      expect(response.body.data.type).toBe('any')
    })

    test('should validate universal token for orders page', async () => {
      const response = await request(app)
        .post('/api/internal/validate-secure-token')
        .send({
          token: universalToken,
          workspaceId: testWorkspace.id
        })
        .expect(200)

      expect(response.body.valid).toBe(true)
      expect(response.body.data.customerId).toBe(testCustomer.id)
      expect(response.body.data.workspaceId).toBe(testWorkspace.id)
      expect(response.body.data.type).toBe('any')
    })

    test('should validate universal token without workspaceId (TOKEN-ONLY)', async () => {
      const response = await request(app)
        .post('/api/internal/validate-secure-token')
        .send({
          token: universalToken
        })
        .expect(200)

      expect(response.body.valid).toBe(true)
      expect(response.body.data.customerId).toBe(testCustomer.id)
      expect(response.body.data.type).toBe('any')
    })
  })

  describe('🚨 Error Handling & Security', () => {
    test('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/internal/validate-secure-token')
        .send({
          token: 'invalid-token-12345',
          workspaceId: testWorkspace.id
        })
        .expect(200)

      expect(response.body.valid).toBe(false)
    })

    test('should reject expired token', async () => {
      // Create an expired token
      const expiredToken = await testPrisma.secureToken.create({
        data: {
          token: 'test-expired-token',
          type: 'any',
          workspaceId: testWorkspace.id,
          customerId: testCustomer.id,
          expiresAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
        }
      })

      const response = await request(app)
        .post('/api/internal/validate-secure-token')
        .send({
          token: expiredToken.token,
          workspaceId: testWorkspace.id
        })
        .expect(200)

      expect(response.body.valid).toBe(false)

      // Clean up
      await testPrisma.secureToken.delete({
        where: { id: expiredToken.id }
      })
    })

    test('should enforce workspace isolation', async () => {
      // Create another workspace
      const otherWorkspace = await createTestWorkspace('Other Workspace')
      const otherCustomer = await createTestCustomer(otherWorkspace.id, {
        name: 'Other Customer',
        email: 'other@example.com',
        phone: '+393334445556'
      })

      // Generate token for other workspace
      const otherResponse = await request(app)
        .post('/api/internal/generate-token')
        .send({
          customerId: otherCustomer.id,
          workspaceId: otherWorkspace.id,
          action: 'profile'
        })
        .expect(200)

      const otherToken = otherResponse.body.token

      // Try to validate other workspace token with wrong workspace
      const response = await request(app)
        .post('/api/internal/validate-secure-token')
        .send({
          token: otherToken,
          workspaceId: testWorkspace.id // Wrong workspace
        })
        .expect(200)

      expect(response.body.valid).toBe(false)

      // Clean up
      await testPrisma.secureToken.delete({
        where: { token: otherToken }
      })
      await testPrisma.customers.delete({
        where: { id: otherCustomer.id }
      })
      await testPrisma.workspace.delete({
        where: { id: otherWorkspace.id }
      })
    })

    test('should reject missing customerId in token generation', async () => {
      const response = await request(app)
        .post('/api/internal/generate-token')
        .send({
          workspaceId: testWorkspace.id,
          action: 'profile'
        })
        .expect(400)

      expect(response.body.error).toContain('Customer ID is required')
    })

    test('should reject missing workspaceId in token generation', async () => {
      const response = await request(app)
        .post('/api/internal/generate-token')
        .send({
          customerId: testCustomer.id,
          action: 'profile'
        })
        .expect(400)

      expect(response.body.error).toContain('Workspace ID is required')
    })

    test('should reject unsupported action', async () => {
      const response = await request(app)
        .post('/api/internal/generate-token')
        .send({
          customerId: testCustomer.id,
          workspaceId: testWorkspace.id,
          action: 'unsupported'
        })
        .expect(400)

      expect(response.body.error).toContain('Unsupported action')
    })
  })

  describe('📋 Customer Profile Access', () => {
    test('should access customer profile with universal token', async () => {
      const response = await request(app)
        .get(`/api/internal/customer-profile/${universalToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.customer.id).toBe(testCustomer.id)
      expect(response.body.customer.name).toBe('Test Customer Token')
      expect(response.body.customer.email).toBe('test-token@example.com')
    })

    test('should reject profile access with invalid token', async () => {
      const response = await request(app)
        .get('/api/internal/customer-profile/invalid-token')
        .expect(401)

      expect(response.body.error).toContain('Invalid or expired token')
    })
  })

  describe('📦 Orders Access', () => {
    test('should access orders list with universal token', async () => {
      const response = await request(app)
        .get(`/api/internal/orders/${universalToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.customerId).toBe(testCustomer.id)
      expect(response.body.workspaceId).toBe(testWorkspace.id)
    })

    test('should reject orders access with invalid token', async () => {
      const response = await request(app)
        .get('/api/internal/orders/invalid-token')
        .expect(401)

      expect(response.body.error).toContain('Invalid or expired token')
    })
  })

  describe('🔄 N8N Integration Tests', () => {
    test('should generate profile token via N8N GetOrdersListLink with action=profile', async () => {
      const response = await request(app)
        .post('/api/internal/generate-token')
        .send({
          customerId: testCustomer.id,
          workspaceId: testWorkspace.id,
          action: 'profile'
        })
        .expect(200)

      // Verify the response format matches N8N expectations
      expect(response.body).toMatchObject({
        success: true,
        token: expect.any(String),
        linkUrl: expect.stringContaining('/customer-profile?token='),
        action: 'profile',
        customerId: testCustomer.id,
        workspaceId: testWorkspace.id
      })

      // Verify token is universal (type: "any")
      const tokenRecord = await testPrisma.secureToken.findFirst({
        where: { token: response.body.token }
      })
      expect(tokenRecord?.type).toBe('any')
    })

    test('should generate orders token via N8N GetOrdersListLink with action=orders', async () => {
      const response = await request(app)
        .post('/api/internal/generate-token')
        .send({
          customerId: testCustomer.id,
          workspaceId: testWorkspace.id,
          action: 'orders'
        })
        .expect(200)

      // Verify the response format matches N8N expectations
      expect(response.body).toMatchObject({
        success: true,
        token: expect.any(String),
        linkUrl: expect.stringContaining('/orders-public?token='),
        action: 'orders',
        customerId: testCustomer.id,
        workspaceId: testWorkspace.id
      })

      // Verify token is universal (type: "any")
      const tokenRecord = await testPrisma.secureToken.findFirst({
        where: { token: response.body.token }
      })
      expect(tokenRecord?.type).toBe('any')
    })
  })
})
