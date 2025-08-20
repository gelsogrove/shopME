import { PrismaClient } from '@prisma/client'
import { SecureTokenService } from '../../application/services/secure-token.service'

describe('🔒 TOKEN-ONLY SYSTEM INTEGRATION TESTS', () => {
  let prisma: PrismaClient
  let secureTokenService: SecureTokenService

  beforeAll(async () => {
    prisma = new PrismaClient()
    secureTokenService = new SecureTokenService(prisma)
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean up test data
    await prisma.secureToken.deleteMany({
      where: {
        customerId: {
          startsWith: 'test-customer-'
        }
      }
    })
  })

  it('should create and validate token correctly', async () => {
    // Arrange
    const customerId = 'test-customer-123'
    const workspaceId = 'test-workspace-456'
    const type = 'orders'

    // Act - Create token
    const token = await secureTokenService.createToken(
      type,
      workspaceId,
      { test: 'payload' },
      '1h',
      undefined,
      '+39123456789',
      '127.0.0.1',
      customerId
    )

    // Assert
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(10)

    // Act - Validate token
    const validation = await secureTokenService.validateToken(token, type)

    // Assert
    expect(validation).toBeDefined()
    expect(validation.valid).toBe(true)
  })

  it('should reuse existing token when not expired', async () => {
    // Arrange
    const customerId = 'test-customer-456'
    const workspaceId = 'test-workspace-789'
    const type = 'profile'

    // Act - Create first token
    const token1 = await secureTokenService.createToken(
      type,
      workspaceId,
      { test: 'payload1' },
      '1h',
      undefined,
      '+39123456789',
      '127.0.0.1',
      customerId
    )

    // Act - Create second token (should reuse)
    const token2 = await secureTokenService.createToken(
      type,
      workspaceId,
      { test: 'payload2' },
      '1h',
      undefined,
      '+39123456789',
      '127.0.0.1',
      customerId
    )

    // Assert - Same token should be reused
    expect(token1).toBe(token2)
  })

  it('should handle different token types independently', async () => {
    // Arrange
    const customerId = 'test-customer-789'
    const workspaceId = 'test-workspace-123'

    // Act - Create orders token
    const ordersToken = await secureTokenService.createToken(
      'orders',
      workspaceId,
      { test: 'orders' },
      '1h',
      undefined,
      '+39123456789',
      '127.0.0.1',
      customerId
    )

    // Act - Create profile token
    const profileToken = await secureTokenService.createToken(
      'profile',
      workspaceId,
      { test: 'profile' },
      '1h',
      undefined,
      '+39123456789',
      '127.0.0.1',
      customerId
    )

    // Assert - Different tokens for different types
    expect(ordersToken).not.toBe(profileToken)
  })

  it('should enforce workspace isolation', async () => {
    // Arrange
    const customerId = 'test-customer-isolation'
    const workspace1 = 'test-workspace-1'
    const workspace2 = 'test-workspace-2'
    const type = 'orders'

    // Act - Create token for workspace 1
    const token1 = await secureTokenService.createToken(
      type,
      workspace1,
      { test: 'workspace1' },
      '1h',
      undefined,
      '+39123456789',
      '127.0.0.1',
      customerId
    )

    // Act - Create token for workspace 2
    const token2 = await secureTokenService.createToken(
      type,
      workspace2,
      { test: 'workspace2' },
      '1h',
      undefined,
      '+39123456789',
      '127.0.0.1',
      customerId
    )

    // Assert - Different tokens for different workspaces
    expect(token1).not.toBe(token2)
  })
})
