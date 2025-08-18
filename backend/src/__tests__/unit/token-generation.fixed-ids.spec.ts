/**
 * Unit Tests for Token Generation with Fixed IDs
 * 
 * Tests token generation using the fixed IDs from seed:
 * - Workspace ID: cm9hjgq9v00014qk8fsdy4ujv
 * - Customer ID: test-customer-123
 */

import request from 'supertest'
import { app } from '../../app'

// Fixed IDs from seed.ts
const FIXED_WORKSPACE_ID = 'cm9hjgq9v00014qk8fsdy4ujv'
const FIXED_CUSTOMER_ID = 'test-customer-123'

describe('Token Generation with Fixed IDs', () => {
  describe('Internal API Token Generation', () => {
    it('should generate orders token for fixed customer', async () => {
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
      
      // Verify token format (JWT)
      expect(response.body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
      
      // Verify link URL format
      expect(response.body.linkUrl).toContain('http')
      expect(response.body.linkUrl).toContain('token=')
    })

    it('should generate profile token for fixed customer', async () => {
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
      expect(response.body.linkUrl).toBeDefined()
    })

    it('should reject invalid customer ID', async () => {
      const response = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .send({
          customerId: 'invalid-customer-id',
          action: 'orders',
          workspaceId: FIXED_WORKSPACE_ID
        })

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
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
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Customer does not belong to this workspace')
    })

    it('should reject invalid action', async () => {
      const response = await request(app)
        .post('/api/internal/generate-token')
        .set('Authorization', 'Basic YWRtaW46YWRtaW4=') // admin:admin
        .send({
          customerId: FIXED_CUSTOMER_ID,
          action: 'invalid-action',
          workspaceId: FIXED_WORKSPACE_ID
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('Token Validation', () => {
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

    it('should validate token structure', () => {
      // JWT tokens have 3 parts separated by dots
      const parts = generatedToken.split('.')
      expect(parts).toHaveLength(3)
      
      // Each part should be base64 encoded
      parts.forEach(part => {
        expect(part).toMatch(/^[A-Za-z0-9+/=]+$/)
      })
    })

    it('should contain expected payload data', () => {
      const parts = generatedToken.split('.')
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
      
      expect(payload.customerId).toBe(FIXED_CUSTOMER_ID)
      expect(payload.workspaceId).toBe(FIXED_WORKSPACE_ID)
      expect(payload.action).toBe('orders')
      expect(payload.exp).toBeDefined()
      expect(payload.iat).toBeDefined()
    })
  })
})
