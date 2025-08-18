/**
 * Integration Tests with Fixed IDs from Seed
 * 
 * Uses the fixed IDs that are always created by the seed script:
 * - Workspace ID: cm9hjgq9v00014qk8fsdy4ujv
 * - Customer ID: test-customer-123
 */

import request from 'supertest'
import { app } from '../../app'
import { prisma } from '../../lib/prisma'

// Fixed IDs from seed.ts
const FIXED_WORKSPACE_ID = 'cm9hjgq9v00014qk8fsdy4ujv'
const FIXED_CUSTOMER_ID = 'test-customer-123'

describe('Integration Tests with Fixed IDs', () => {
  beforeAll(async () => {
    // Ensure test data exists
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Customer Operations with Fixed ID', () => {
    it('should find customer with fixed ID', async () => {
      const response = await request(app)
        .get(`/api/internal/customers/${FIXED_CUSTOMER_ID}`)
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .query({ workspaceId: FIXED_WORKSPACE_ID })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.id).toBe(FIXED_CUSTOMER_ID)
      expect(response.body.data.name).toBe('Test Customer MCP')
      expect(response.body.data.email).toBe('test-customer-123@shopme.com')
    })

    it('should list customers in fixed workspace', async () => {
      const response = await request(app)
        .get('/api/internal/customers')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .query({ workspaceId: FIXED_WORKSPACE_ID })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
      
      // Should find our fixed customer
      const fixedCustomer = response.body.data.find((c: any) => c.id === FIXED_CUSTOMER_ID)
      expect(fixedCustomer).toBeDefined()
      expect(fixedCustomer.name).toBe('Test Customer MCP')
    })
  })

  describe('Token Generation with Fixed IDs', () => {
    it('should generate token for fixed customer', async () => {
      const response = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .send({
          customerId: FIXED_CUSTOMER_ID,
          action: 'orders',
          workspaceId: FIXED_WORKSPACE_ID
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.token).toBeDefined()
      expect(response.body.linkUrl).toBeDefined()
      expect(response.body.expiresAt).toBeDefined()
    })

    it('should generate token for profile action', async () => {
      const response = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .send({
          customerId: FIXED_CUSTOMER_ID,
          action: 'profile',
          workspaceId: FIXED_WORKSPACE_ID
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.token).toBeDefined()
    })
  })

  describe('Public API with Generated Tokens', () => {
    let generatedToken: string

    beforeAll(async () => {
      // Generate a token for testing
      const response = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .send({
          customerId: FIXED_CUSTOMER_ID,
          action: 'orders',
          workspaceId: FIXED_WORKSPACE_ID
        })

      generatedToken = response.body.token
    })

    it('should access orders with valid token', async () => {
      const response = await request(app)
        .get(`/api/orders?token=${generatedToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.customer.id).toBe(FIXED_CUSTOMER_ID)
      expect(response.body.data.customer.name).toBe('Test Customer MCP')
    })

    it('should access profile with valid token', async () => {
      // Generate profile token
      const profileResponse = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .send({
          customerId: FIXED_CUSTOMER_ID,
          action: 'profile',
          workspaceId: FIXED_WORKSPACE_ID
        })

      const profileToken = profileResponse.body.token

      const response = await request(app)
        .get(`/api/profile?token=${profileToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.id).toBe(FIXED_CUSTOMER_ID)
    })
  })

  describe('Workspace Operations with Fixed ID', () => {
    it('should find workspace with fixed ID', async () => {
      const response = await request(app)
        .get(`/api/internal/workspaces/${FIXED_WORKSPACE_ID}`)
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.id).toBe(FIXED_WORKSPACE_ID)
      expect(response.body.data.name).toBe("L'Altra Italia(ESP)")
    })

    it('should list products in fixed workspace', async () => {
      const response = await request(app)
        .get('/api/internal/products')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .query({ workspaceId: FIXED_WORKSPACE_ID })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  describe('Error Handling with Fixed IDs', () => {
    it('should reject invalid customer ID', async () => {
      const response = await request(app)
        .get('/api/internal/customers/invalid-customer-id')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .query({ workspaceId: FIXED_WORKSPACE_ID })

      expect(response.status).toBe(404)
    })

    it('should reject customer from wrong workspace', async () => {
      const response = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .send({
          customerId: FIXED_CUSTOMER_ID,
          action: 'orders',
          workspaceId: 'wrong-workspace-id'
        })

      expect(response.status).toBe(403)
      expect(response.body.message).toContain('Customer does not belong to this workspace')
    })
  })
})
