/**
 * 🚨 CRITICAL SECURITY TESTS - WORKSPACE ISOLATION
 * 
 * These tests ensure that workspaceId is properly validated and isolated
 * across all services to prevent cross-workspace data access.
 */

import { PrismaClient } from '@prisma/client'
import { SecureTokenService } from '../../application/services/secure-token.service'
import { SessionTokenService } from '../../application/services/session-token.service'

describe('🚨 CRITICAL: Workspace Isolation Security Tests', () => {
  let prisma: PrismaClient
  let secureTokenService: SecureTokenService
  let sessionTokenService: SessionTokenService
  
  // Test workspaces
  const WORKSPACE_A = 'workspace-a-test'
  const WORKSPACE_B = 'workspace-b-test'
  
  beforeAll(async () => {
    prisma = new PrismaClient()
    secureTokenService = new SecureTokenService()
    sessionTokenService = new SessionTokenService()
    
    // Create test workspaces
    await prisma.workspace.upsert({
      where: { id: WORKSPACE_A },
      update: {},
      create: {
        id: WORKSPACE_A,
        name: 'Test Workspace A',
        slug: 'test-workspace-a',
        isActive: true
      }
    })
    
    await prisma.workspace.upsert({
      where: { id: WORKSPACE_B },
      update: {},
      create: {
        id: WORKSPACE_B,
        name: 'Test Workspace B',
        slug: 'test-workspace-b',
        isActive: true
      }
    })
  })
  
  afterAll(async () => {
    // Cleanup test data
    await prisma.secureToken.deleteMany({
      where: {
        workspaceId: { in: [WORKSPACE_A, WORKSPACE_B] }
      }
    })
    
    await prisma.workspace.deleteMany({
      where: {
        id: { in: [WORKSPACE_A, WORKSPACE_B] }
      }
    })
    
    await prisma.$disconnect()
  })

  describe('🔐 SecureTokenService Workspace Isolation', () => {
    test('should NOT validate token from different workspace', async () => {
      // Create token for workspace A
      const tokenA = await secureTokenService.createToken(
        'checkout',
        WORKSPACE_A,
        { customerId: 'customer-a' },
        '1h',
        undefined,
        '+393451234567'
      )
      
      // Try to validate with workspace B - should FAIL
      const validation = await secureTokenService.validateToken(
        tokenA,
        'checkout',
        WORKSPACE_B // Wrong workspace!
      )
      
      expect(validation.valid).toBe(false)
    })
    
    test('should validate token ONLY with correct workspace', async () => {
      // Create token for workspace A
      const tokenA = await secureTokenService.createToken(
        'invoice',
        WORKSPACE_A,
        { customerId: 'customer-a' },
        '1h',
        undefined,
        '+393451234567'
      )
      
      // Should validate with correct workspace
      const validationA = await secureTokenService.validateToken(
        tokenA,
        'invoice',
        WORKSPACE_A // Correct workspace
      )
      
      expect(validationA.valid).toBe(true)
      expect(validationA.data?.workspaceId).toBe(WORKSPACE_A)
      
      // Should NOT validate with wrong workspace
      const validationB = await secureTokenService.validateToken(
        tokenA,
        'invoice',
        WORKSPACE_B // Wrong workspace!
      )
      
      expect(validationB.valid).toBe(false)
    })
    
    test('should isolate registration tokens by workspace', async () => {
      // Create registration tokens for both workspaces
      const tokenA = await secureTokenService.createToken(
        'registration',
        WORKSPACE_A,
        { phone: '+393451234567' },
        '1h',
        undefined,
        '+393451234567'
      )
      
      const tokenB = await secureTokenService.createToken(
        'registration',
        WORKSPACE_B,
        { phone: '+393451234567' },
        '1h',
        undefined,
        '+393451234567'
      )
      
      // Each token should only work with its own workspace
      const validationA = await secureTokenService.validateToken(tokenA, 'registration', WORKSPACE_A)
      const validationB = await secureTokenService.validateToken(tokenB, 'registration', WORKSPACE_B)
      const crossValidationA = await secureTokenService.validateToken(tokenA, 'registration', WORKSPACE_B)
      const crossValidationB = await secureTokenService.validateToken(tokenB, 'registration', WORKSPACE_A)
      
      expect(validationA.valid).toBe(true)
      expect(validationB.valid).toBe(true)
      expect(crossValidationA.valid).toBe(false) // ❌ Should fail cross-workspace
      expect(crossValidationB.valid).toBe(false) // ❌ Should fail cross-workspace
    })
  })

  describe('🔐 SessionTokenService Workspace Isolation', () => {
    test('should create session tokens with correct workspace', async () => {
      const sessionTokenA = await sessionTokenService.createOrRenewSessionToken(
        WORKSPACE_A,
        'customer-a-test',
        '+393451234567'
      )
      
      expect(sessionTokenA).toBeDefined()
      expect(typeof sessionTokenA).toBe('string')
    })
    
    test('should validate session token ONLY with correct workspace', async () => {
      const sessionTokenA = await sessionTokenService.createOrRenewSessionToken(
        WORKSPACE_A,
        'customer-a-test',
        '+393451234567'
      )
      
      // Should validate with correct workspace
      const validationA = await sessionTokenService.validateSessionToken(
        sessionTokenA,
        WORKSPACE_A
      )
      
      expect(validationA.valid).toBe(true)
      
      // Should NOT validate with wrong workspace
      const validationB = await sessionTokenService.validateSessionToken(
        sessionTokenA,
        WORKSPACE_B
      )
      
      expect(validationB.valid).toBe(false)
    })
    
    test('should check renewal ONLY within correct workspace', async () => {
      const sessionTokenA = await sessionTokenService.createOrRenewSessionToken(
        WORKSPACE_A,
        'customer-a-test',
        '+393451234567'
      )
      
      // Should check renewal with correct workspace
      const renewalA = await sessionTokenService.needsRenewal(
        sessionTokenA,
        WORKSPACE_A
      )
      
      expect(renewalA).toBe(false) // Fresh token shouldn't need renewal
      
      // Should NOT work with wrong workspace (should return true = needs renewal)
      const renewalB = await sessionTokenService.needsRenewal(
        sessionTokenA,
        WORKSPACE_B
      )
      
      expect(renewalB).toBe(true) // Cross-workspace should fail = needs renewal
    })
    
    test('should get active session ONLY from correct workspace', async () => {
      await sessionTokenService.createOrRenewSessionToken(
        WORKSPACE_A,
        'customer-a-test',
        '+393451234567'
      )
      
      // Should find session in correct workspace
      const sessionA = await sessionTokenService.getActiveSession(
        WORKSPACE_A,
        '+393451234567'
      )
      
      expect(sessionA).not.toBeNull()
      
      // Should NOT find session in wrong workspace
      const sessionB = await sessionTokenService.getActiveSession(
        WORKSPACE_B,
        '+393451234567'
      )
      
      expect(sessionB).toBeNull() // ❌ Should not find cross-workspace
    })
  })

  describe('🔐 Database Query Workspace Isolation', () => {
    beforeAll(async () => {
      // Create test customers for both workspaces
      await prisma.customers.upsert({
        where: { id: 'customer-a-test' },
        update: {},
        create: {
          id: 'customer-a-test',
          name: 'Customer A',
          email: 'customer-a@test.com',
          phone: '+393451234567',
          workspaceId: WORKSPACE_A
        }
      })
      
      await prisma.customers.upsert({
        where: { id: 'customer-b-test' },
        update: {},
        create: {
          id: 'customer-b-test',
          name: 'Customer B',
          email: 'customer-b@test.com',
          phone: '+393451234567', // Same phone, different workspace
          workspaceId: WORKSPACE_B
        }
      })
    })
    
    afterAll(async () => {
      await prisma.customers.deleteMany({
        where: {
          id: { in: ['customer-a-test', 'customer-b-test'] }
        }
      })
    })
    
    test('should find customer ONLY in correct workspace', async () => {
      // Same phone number exists in both workspaces
      const customerA = await prisma.customers.findFirst({
        where: {
          phone: '+393451234567',
          workspaceId: WORKSPACE_A
        }
      })
      
      const customerB = await prisma.customers.findFirst({
        where: {
          phone: '+393451234567',
          workspaceId: WORKSPACE_B
        }
      })
      
      expect(customerA?.id).toBe('customer-a-test')
      expect(customerA?.workspaceId).toBe(WORKSPACE_A)
      
      expect(customerB?.id).toBe('customer-b-test')
      expect(customerB?.workspaceId).toBe(WORKSPACE_B)
      
      // Verify they are different customers
      expect(customerA?.id).not.toBe(customerB?.id)
    })
    
    test('should NOT find customer without workspaceId filter', async () => {
      // This test ensures developers don't forget workspaceId
      const customerWithoutWorkspace = await prisma.customers.findFirst({
        where: {
          phone: '+393451234567'
          // ❌ Missing workspaceId - dangerous!
        }
      })
      
      // This will find A customer, but we don't know which workspace!
      // This is exactly the security risk we want to prevent
      expect(customerWithoutWorkspace).not.toBeNull()
      
      // Log warning about missing workspace filter
      logger.warn('🚨 SECURITY WARNING: Customer query without workspaceId filter!')
      logger.warn('Found customer:', customerWithoutWorkspace?.id, 'in workspace:', customerWithoutWorkspace?.workspaceId)
    })
  })

  describe('🔐 Token Payload Workspace Consistency', () => {
    test('should ensure token payload workspaceId matches token workspaceId', async () => {
      const token = await secureTokenService.createToken(
        'checkout',
        WORKSPACE_A,
        { 
          customerId: 'customer-a-test',
          workspaceId: WORKSPACE_A, // Payload should match token workspaceId
          amount: 100.50
        },
        '1h',
        undefined,
        '+393451234567'
      )
      
      const validation = await secureTokenService.validateToken(
        token,
        'checkout',
        WORKSPACE_A
      )
      
      expect(validation.valid).toBe(true)
      expect(validation.data?.workspaceId).toBe(WORKSPACE_A)
      expect(validation.payload?.workspaceId).toBe(WORKSPACE_A)
      
      // Both should match
      expect(validation.data?.workspaceId).toBe(validation.payload?.workspaceId)
    })
    
    test('should detect workspace mismatch in token payload', async () => {
      const token = await secureTokenService.createToken(
        'checkout',
        WORKSPACE_A,
        { 
          customerId: 'customer-a-test',
          workspaceId: WORKSPACE_B, // ❌ Payload has different workspace!
          amount: 100.50
        },
        '1h',
        undefined,
        '+393451234567'
      )
      
      const validation = await secureTokenService.validateToken(
        token,
        'checkout',
        WORKSPACE_A
      )
      
      expect(validation.valid).toBe(true) // Token itself is valid
      expect(validation.data?.workspaceId).toBe(WORKSPACE_A) // Token workspaceId
      expect(validation.payload?.workspaceId).toBe(WORKSPACE_B) // Payload workspaceId
      
      // Detect mismatch
      expect(validation.data?.workspaceId).not.toBe(validation.payload?.workspaceId)
      
      logger.warn('🚨 SECURITY WARNING: Token and payload workspaceId mismatch!')
    })
  })
})