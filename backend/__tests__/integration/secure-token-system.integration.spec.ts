import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { SecureTokenService } from '../../src/application/services/secure-token.service'
import logger from '../../src/utils/logger'

describe('🔐 Secure Token System Integration Tests', () => {
  let prisma: PrismaClient
  let secureTokenService: SecureTokenService
  let testWorkspace: any
  let testCustomer: any
  let testUser: any

  // Test data
  const testPhoneNumber = '+393401234567'
  const testCustomerName = 'Mario Rossi Test'
  const testCustomerEmail = 'mario.rossi.test@example.com'

  beforeAll(async () => {
    prisma = new PrismaClient()
    secureTokenService = new SecureTokenService()

    // Create test workspace
    testWorkspace = await prisma.workspaces.create({
      data: {
        name: 'Test Workspace Token System',
        isActive: true,
        isDelete: false,
        businessType: 'ECOMMERCE'
      }
    })

    // Create test user
    testUser = await prisma.users.create({
      data: {
        email: 'admin.test@example.com',
        password: 'hashedpassword',
        name: 'Admin Test',
        role: 'ADMIN'
      }
    })

    // Create test customer
    testCustomer = await prisma.customers.create({
      data: {
        name: testCustomerName,
        email: testCustomerEmail,
        phone: testPhoneNumber,
        workspaceId: testWorkspace.id,
        isActive: true
      }
    })

    logger.info(`[TOKEN-TEST] Setup completed - Workspace: ${testWorkspace.id}, Customer: ${testCustomer.id}`)
  })

  afterAll(async () => {
    // Cleanup test data
    await prisma.secureToken.deleteMany({
      where: { workspaceId: testWorkspace.id }
    })
    await prisma.customers.deleteMany({
      where: { workspaceId: testWorkspace.id }
    })
    await prisma.users.deleteMany({
      where: { id: testUser.id }
    })
    await prisma.workspaces.deleteMany({
      where: { id: testWorkspace.id }
    })
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean up any existing tokens for this customer
    await prisma.secureToken.deleteMany({
      where: { 
        customerId: testCustomer.id,
        workspaceId: testWorkspace.id 
      }
    })
  })

  describe('🎯 Token Creation Tests', () => {
    it('should create orders token successfully', async () => {
      const token = await secureTokenService.createToken(
        'orders',
        testWorkspace.id,
        { customerId: testCustomer.id, phone: testPhoneNumber },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )

      expect(token).toBeDefined()
      expect(token).toHaveLength(64) // 32 bytes = 64 hex chars

      // Verify token is stored in database
      const storedToken = await prisma.secureToken.findFirst({
        where: { token, customerId: testCustomer.id }
      })

      expect(storedToken).toBeDefined()
      expect(storedToken?.type).toBe('orders')
      expect(storedToken?.workspaceId).toBe(testWorkspace.id)
      expect(storedToken?.customerId).toBe(testCustomer.id)
      expect(storedToken?.phoneNumber).toBe(testPhoneNumber)
    })

    it('should create profile token successfully', async () => {
      const token = await secureTokenService.createToken(
        'profile',
        testWorkspace.id,
        { customerId: testCustomer.id, phone: testPhoneNumber },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )

      expect(token).toBeDefined()
      expect(token).toHaveLength(64)

      const storedToken = await prisma.secureToken.findFirst({
        where: { token, customerId: testCustomer.id }
      })

      expect(storedToken?.type).toBe('profile')
    })

    it('should create cart token successfully', async () => {
      const token = await secureTokenService.createToken(
        'cart',
        testWorkspace.id,
        { customerId: testCustomer.id, cartId: 'test-cart-123' },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )

      expect(token).toBeDefined()
      expect(token).toHaveLength(64)

      const storedToken = await prisma.secureToken.findFirst({
        where: { token, customerId: testCustomer.id }
      })

      expect(storedToken?.type).toBe('cart')
    })

    it('should create checkout token successfully', async () => {
      const token = await secureTokenService.createToken(
        'checkout',
        testWorkspace.id,
        { 
          customerId: testCustomer.id, 
          products: [
            { id: 'prod1', name: 'Test Product', price: 10.00, quantity: 2 }
          ],
          totalAmount: 20.00
        },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )

      expect(token).toBeDefined()
      expect(token).toHaveLength(64)

      const storedToken = await prisma.secureToken.findFirst({
        where: { token, customerId: testCustomer.id }
      })

      expect(storedToken?.type).toBe('checkout')
    })

    it('should reuse existing valid token instead of creating new one', async () => {
      // Create first token
      const firstToken = await secureTokenService.createToken(
        'orders',
        testWorkspace.id,
        { customerId: testCustomer.id },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )

      // Try to create second token for same customer/type/workspace
      const secondToken = await secureTokenService.createToken(
        'orders',
        testWorkspace.id,
        { customerId: testCustomer.id },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )

      // Should return the same token
      expect(firstToken).toBe(secondToken)

      // Should only have one token in database
      const tokenCount = await prisma.secureToken.count({
        where: { 
          customerId: testCustomer.id,
          type: 'orders',
          workspaceId: testWorkspace.id
        }
      })

      expect(tokenCount).toBe(1)
    })
  })

  describe('🔍 Token Validation Tests', () => {
    let validToken: string

    beforeEach(async () => {
      // Create a valid token for testing
      validToken = await secureTokenService.createToken(
        'orders',
        testWorkspace.id,
        { customerId: testCustomer.id, phone: testPhoneNumber },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )
    })

    it('should validate valid token successfully', async () => {
      const validation = await secureTokenService.validateToken(validToken)

      expect(validation.valid).toBe(true)
      expect(validation.data).toBeDefined()
      expect(validation.data?.customerId).toBe(testCustomer.id)
      expect(validation.data?.workspaceId).toBe(testWorkspace.id)
      expect(validation.data?.type).toBe('orders')
      expect(validation.data?.phoneNumber).toBe(testPhoneNumber)
    })

    it('should reject invalid token', async () => {
      const invalidToken = 'invalid-token-12345'
      const validation = await secureTokenService.validateToken(invalidToken)

      expect(validation.valid).toBe(false)
      expect(validation.data).toBeUndefined()
    })

    it('should reject expired token', async () => {
      // Create token with very short expiration
      const shortToken = await secureTokenService.createToken(
        'orders',
        testWorkspace.id,
        { customerId: testCustomer.id },
        '1ms', // 1 millisecond
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10))

      const validation = await secureTokenService.validateToken(shortToken)
      expect(validation.valid).toBe(false)
    })

    it('should validate token with specific type', async () => {
      const validation = await secureTokenService.validateToken(validToken, 'orders')
      expect(validation.valid).toBe(true)
    })

    it('should reject token with wrong type', async () => {
      const validation = await secureTokenService.validateToken(validToken, 'profile')
      expect(validation.valid).toBe(false)
    })

    it('should validate token with workspaceId', async () => {
      const validation = await secureTokenService.validateToken(validToken, undefined, testWorkspace.id)
      expect(validation.valid).toBe(true)
    })

    it('should reject token with wrong workspaceId', async () => {
      const wrongWorkspaceId = 'wrong-workspace-id'
      const validation = await secureTokenService.validateToken(validToken, undefined, wrongWorkspaceId)
      expect(validation.valid).toBe(false)
    })
  })

  describe('🌐 TOKEN-ONLY System Tests', () => {
    let universalToken: string

    beforeEach(async () => {
      // Create a token that should work for any page type
      universalToken = await secureTokenService.createToken(
        'any',
        testWorkspace.id,
        { customerId: testCustomer.id, phone: testPhoneNumber },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )
    })

    it('should accept any valid token type for validation (TOKEN-ONLY system)', async () => {
      // Test that token works without specifying type
      const validation = await secureTokenService.validateToken(universalToken)
      expect(validation.valid).toBe(true)

      // Test that token works with different type specifications
      const validationOrders = await secureTokenService.validateToken(universalToken, 'orders')
      const validationProfile = await secureTokenService.validateToken(universalToken, 'profile')
      const validationCart = await secureTokenService.validateToken(universalToken, 'cart')
      const validationCheckout = await secureTokenService.validateToken(universalToken, 'checkout')

      expect(validationOrders.valid).toBe(true)
      expect(validationProfile.valid).toBe(true)
      expect(validationCart.valid).toBe(true)
      expect(validationCheckout.valid).toBe(true)
    })

    it('should work with specific type tokens in TOKEN-ONLY system', async () => {
      // Create specific type tokens
      const ordersToken = await secureTokenService.createToken(
        'orders',
        testWorkspace.id,
        { customerId: testCustomer.id },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )

      const profileToken = await secureTokenService.createToken(
        'profile',
        testWorkspace.id,
        { customerId: testCustomer.id },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )

      // Test that orders token works for orders validation
      const ordersValidation = await secureTokenService.validateToken(ordersToken, 'orders')
      expect(ordersValidation.valid).toBe(true)

      // Test that profile token works for profile validation
      const profileValidation = await secureTokenService.validateToken(profileToken, 'profile')
      expect(profileValidation.valid).toBe(true)

      // Test cross-type validation (should fail in strict mode)
      const crossValidation = await secureTokenService.validateToken(ordersToken, 'profile')
      expect(crossValidation.valid).toBe(false)
    })
  })

  describe('🔒 Workspace Isolation Tests', () => {
    let otherWorkspace: any
    let otherCustomer: any

    beforeAll(async () => {
      // Create another workspace and customer
      otherWorkspace = await prisma.workspaces.create({
        data: {
          name: 'Other Test Workspace',
          isActive: true,
          isDelete: false,
          businessType: 'ECOMMERCE'
        }
      })

      otherCustomer = await prisma.customers.create({
        data: {
          name: 'Other Customer',
          email: 'other@example.com',
          phone: '+393409876543',
          workspaceId: otherWorkspace.id,
          isActive: true
        }
      })
    })

    afterAll(async () => {
      // Cleanup other workspace data
      await prisma.secureToken.deleteMany({
        where: { workspaceId: otherWorkspace.id }
      })
      await prisma.customers.deleteMany({
        where: { workspaceId: otherWorkspace.id }
      })
      await prisma.workspaces.deleteMany({
        where: { id: otherWorkspace.id }
      })
    })

    it('should isolate tokens by workspace', async () => {
      // Create token in first workspace
      const token1 = await secureTokenService.createToken(
        'orders',
        testWorkspace.id,
        { customerId: testCustomer.id },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )

      // Create token in second workspace
      const token2 = await secureTokenService.createToken(
        'orders',
        otherWorkspace.id,
        { customerId: otherCustomer.id },
        '1h',
        testUser.id,
        '+393409876543',
        '127.0.0.1',
        otherCustomer.id
      )

      // Validate token1 with first workspace
      const validation1 = await secureTokenService.validateToken(token1, undefined, testWorkspace.id)
      expect(validation1.valid).toBe(true)

      // Validate token1 with second workspace (should fail)
      const validation1Wrong = await secureTokenService.validateToken(token1, undefined, otherWorkspace.id)
      expect(validation1Wrong.valid).toBe(false)

      // Validate token2 with second workspace
      const validation2 = await secureTokenService.validateToken(token2, undefined, otherWorkspace.id)
      expect(validation2.valid).toBe(true)

      // Validate token2 with first workspace (should fail)
      const validation2Wrong = await secureTokenService.validateToken(token2, undefined, testWorkspace.id)
      expect(validation2Wrong.valid).toBe(false)
    })
  })

  describe('🧹 Token Cleanup Tests', () => {
    it('should cleanup expired tokens', async () => {
      // Create multiple tokens with different expiration times
      const validToken = await secureTokenService.createToken(
        'orders',
        testWorkspace.id,
        { customerId: testCustomer.id },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )

      // Create expired token by manually setting expiration in past
      const expiredToken = await secureTokenService.createToken(
        'profile',
        testWorkspace.id,
        { customerId: testCustomer.id },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )

      // Manually expire the token
      await prisma.secureToken.update({
        where: { token: expiredToken },
        data: { expiresAt: new Date(Date.now() - 1000) } // 1 second ago
      })

      // Run cleanup
      const cleanedCount = await secureTokenService.cleanupExpiredTokens()

      // Verify expired token is gone
      const expiredTokenExists = await prisma.secureToken.findFirst({
        where: { token: expiredToken }
      })
      expect(expiredTokenExists).toBeNull()

      // Verify valid token still exists
      const validTokenExists = await prisma.secureToken.findFirst({
        where: { token: validToken }
      })
      expect(validTokenExists).toBeDefined()

      expect(cleanedCount).toBeGreaterThan(0)
    })

    it('should mark token as used', async () => {
      const token = await secureTokenService.createToken(
        'orders',
        testWorkspace.id,
        { customerId: testCustomer.id },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )

      // Mark token as used
      const marked = await secureTokenService.markTokenAsUsed(token)
      expect(marked).toBe(true)

      // Verify token is marked as used
      const usedToken = await prisma.secureToken.findFirst({
        where: { token }
      })
      expect(usedToken?.usedAt).toBeDefined()

      // Verify token is no longer valid
      const validation = await secureTokenService.validateToken(token)
      expect(validation.valid).toBe(false)
    })

    it('should revoke token', async () => {
      const token = await secureTokenService.createToken(
        'orders',
        testWorkspace.id,
        { customerId: testCustomer.id },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )

      // Revoke token
      const revoked = await secureTokenService.revokeToken(token)
      expect(revoked).toBe(true)

      // Verify token is expired
      const revokedToken = await prisma.secureToken.findFirst({
        where: { token }
      })
      expect(revokedToken?.expiresAt).toBeDefined()
      expect(new Date(revokedToken!.expiresAt)).toBeLessThan(new Date())

      // Verify token is no longer valid
      const validation = await secureTokenService.validateToken(token)
      expect(validation.valid).toBe(false)
    })
  })

  describe('🌐 API Endpoint Tests', () => {
    let apiToken: string

    beforeEach(async () => {
      apiToken = await secureTokenService.createToken(
        'orders',
        testWorkspace.id,
        { customerId: testCustomer.id, phone: testPhoneNumber },
        '1h',
        testUser.id,
        testPhoneNumber,
        '127.0.0.1',
        testCustomer.id
      )
    })

    it('should validate token via API endpoint', async () => {
      const response = await axios.post('http://localhost:3001/api/internal/validate-secure-token', {
        token: apiToken,
        workspaceId: testWorkspace.id
      })

      expect(response.status).toBe(200)
      expect(response.data.valid).toBe(true)
      expect(response.data.data).toBeDefined()
      expect(response.data.data.customerId).toBe(testCustomer.id)
      expect(response.data.data.workspaceId).toBe(testWorkspace.id)
    })

    it('should reject invalid token via API endpoint', async () => {
      try {
        await axios.post('http://localhost:3001/api/internal/validate-secure-token', {
          token: 'invalid-token',
          workspaceId: testWorkspace.id
        })
        fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
        expect(error.response.data.valid).toBe(false)
      }
    })

    it('should reject token with wrong workspace via API endpoint', async () => {
      try {
        await axios.post('http://localhost:3001/api/internal/validate-secure-token', {
          token: apiToken,
          workspaceId: 'wrong-workspace-id'
        })
        fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(403)
        expect(error.response.data.valid).toBe(false)
      }
    })
  })

  describe('📊 Token Statistics Tests', () => {
    beforeEach(async () => {
      // Create tokens of different types
      await secureTokenService.createToken('orders', testWorkspace.id, {}, '1h', testUser.id, testPhoneNumber, '127.0.0.1', testCustomer.id)
      await secureTokenService.createToken('profile', testWorkspace.id, {}, '1h', testUser.id, testPhoneNumber, '127.0.0.1', testCustomer.id)
      await secureTokenService.createToken('cart', testWorkspace.id, {}, '1h', testUser.id, testPhoneNumber, '127.0.0.1', testCustomer.id)
    })

    it('should return token statistics', async () => {
      const stats = await secureTokenService.getTokenStats(testWorkspace.id)

      expect(stats).toBeDefined()
      expect(typeof stats).toBe('object')
      
      // Should have statistics for the token types we created
      expect(stats.orders).toBeDefined()
      expect(stats.profile).toBeDefined()
      expect(stats.cart).toBeDefined()
      
      // Counts should be at least 1 for each type
      expect(stats.orders).toBeGreaterThan(0)
      expect(stats.profile).toBeGreaterThan(0)
      expect(stats.cart).toBeGreaterThan(0)
    })
  })
})
