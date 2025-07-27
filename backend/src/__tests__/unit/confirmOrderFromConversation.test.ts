import { confirmOrderFromConversation } from '../../chatbot/calling-functions/confirmOrderFromConversation'
import { prisma } from '../../lib/prisma'
import logger from '../../utils/logger'

// Mock dependencies
jest.mock('../../lib/prisma', () => ({
  prisma: {
    customers: {
      findFirst: jest.fn(),
    },
    workspace: {
      findUnique: jest.fn(),
    },
    products: {
      findFirst: jest.fn(),
    },
    secureToken: {
      create: jest.fn(),
    },
  },
}))

jest.mock('../../utils/logger')

// Mock crypto module
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => Buffer.from('mockedrandomdata12345')),
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'mockedhashedtoken123456789012'),
  })),
}))

// Mock environment variables
process.env.FRONTEND_URL = 'https://test-shopme.com'

describe('confirmOrderFromConversation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockCustomer = {
    id: 'customer-123',
    name: 'Mario Rossi',
    email: 'mario@example.com',
    phone: '+393451234567',
    workspaceId: 'workspace-123',
  }

  const mockWorkspace = {
    id: 'workspace-123',
    name: 'Test Shop',
    isActive: true,
  }

  const mockProduct = {
    id: 'product-123',
    name: 'Maglietta Rossa',
    description: 'Maglietta di cotone rossa',
    price: 25.00,
    sku: 'SHIRT001',
    isActive: true,
    workspaceId: 'workspace-123',
  }

  const validParams = {
    customerId: 'customer-123',
    workspaceId: 'workspace-123',
    conversationContext: 'Cliente vuole maglietta rossa, confermato ordine',
    prodottiSelezionati: [
      {
        nome: 'maglietta rossa',
        quantita: 1,
        descrizione: 'taglia M',
      },
    ],
  }

  describe('Successful scenarios', () => {
    beforeEach(() => {
      // Setup successful mocks
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(mockCustomer)
      ;(prisma.workspace.findUnique as jest.Mock).mockResolvedValue(mockWorkspace)
      ;(prisma.products.findFirst as jest.Mock).mockResolvedValue(mockProduct)
      ;(prisma.secureToken.create as jest.Mock).mockResolvedValue({
        id: 'token-123',
        token: 'mockedhashedtoken123456789012',
        type: 'checkout',
        expiresAt: new Date(Date.now() + 3600000),
      })
    })

    it('should successfully create checkout link for valid conversation order', async () => {
      const result = await confirmOrderFromConversation(validParams)

      expect(result).toEqual({
        success: true,
        response: expect.stringContaining('🛒 **Riepilogo Ordine**'),
        checkoutToken: 'mockedhashedtoken123456789012',
        checkoutUrl: 'https://test-shopme.com/checkout/mockedhashedtoken123456789012',
        expiresAt: expect.any(Date),
        totalAmount: 25.00,
      })

      // Verify database calls
      expect(prisma.customers.findFirst).toHaveBeenCalledWith({
        where: { id: 'customer-123', workspaceId: 'workspace-123' },
      })

      expect(prisma.workspace.findUnique).toHaveBeenCalledWith({
        where: { id: 'workspace-123' },
      })

      expect(prisma.products.findFirst).toHaveBeenCalledWith({
        where: {
          workspaceId: 'workspace-123',
          OR: [
            { name: { contains: 'maglietta rossa', mode: 'insensitive' } },
            { sku: undefined },
            { description: { contains: 'maglietta rossa', mode: 'insensitive' } },
          ],
          isActive: true,
        },
      })

      expect(prisma.secureToken.create).toHaveBeenCalledWith({
        data: {
          token: 'mockedhashedtoken123456789012',
          type: 'checkout',
          workspaceId: 'workspace-123',
          userId: 'customer-123',
          payload: {
            customerId: 'customer-123',
            prodotti: [
              {
                codice: 'SHIRT001',
                descrizione: 'Maglietta Rossa',
                qty: 1,
                prezzo: 25.00,
                productId: 'product-123',
              },
            ],
            type: 'conversational_order_checkout',
            conversationContext: 'Cliente vuole maglietta rossa, confermato ordine',
          },
          expiresAt: expect.any(Date),
        },
      })
    })

    it('should handle multiple products correctly', async () => {
      const mockProduct2 = {
        id: 'product-456',
        name: 'Jeans Blu',
        description: 'Jeans di denim blu',
        price: 80.00,
        sku: 'JEANS001',
        isActive: true,
        workspaceId: 'workspace-123',
      }

      ;(prisma.products.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockProduct) // First call for maglietta
        .mockResolvedValueOnce(mockProduct2) // Second call for jeans

      const multipleProductsParams = {
        ...validParams,
        prodottiSelezionati: [
          { nome: 'maglietta rossa', quantita: 2 },
          { nome: 'jeans blu', quantita: 1 },
        ],
      }

      const result = await confirmOrderFromConversation(multipleProductsParams)

      expect(result.success).toBe(true)
      expect(result.totalAmount).toBe(130.00) // (25 * 2) + (80 * 1)
      expect(result.response).toContain('€130.00')
      expect(result.response).toContain('Maglietta Rossa')
      expect(result.response).toContain('Jeans Blu')
    })

    it('should use product ID as fallback when SKU is null', async () => {
      const productWithoutSku = { ...mockProduct, sku: null }
      ;(prisma.products.findFirst as jest.Mock).mockResolvedValue(productWithoutSku)

      const result = await confirmOrderFromConversation(validParams)

      expect(result.success).toBe(true)
      expect(prisma.secureToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            payload: expect.objectContaining({
              prodotti: [
                expect.objectContaining({
                  codice: 'product-123', // Uses ID as fallback
                }),
              ],
            }),
          }),
        })
      )
    })
  })

  describe('Error scenarios', () => {
    it('should fail when customerId is missing', async () => {
      const invalidParams = { ...validParams, customerId: '' }

      const result = await confirmOrderFromConversation(invalidParams)

      expect(result).toEqual({
        success: false,
        response: 'Si è verificato un errore durante la creazione dell\'ordine. Riprova o contatta l\'assistenza.',
        error: 'Missing required parameters: customerId or workspaceId',
      })
    })

    it('should fail when workspaceId is missing', async () => {
      const invalidParams = { ...validParams, workspaceId: '' }

      const result = await confirmOrderFromConversation(invalidParams)

      expect(result).toEqual({
        success: false,
        response: 'Si è verificato un errore durante la creazione dell\'ordine. Riprova o contatta l\'assistenza.',
        error: 'Missing required parameters: customerId or workspaceId',
      })
    })

    it('should fail when no products are selected', async () => {
      const invalidParams = { ...validParams, prodottiSelezionati: [] }

      const result = await confirmOrderFromConversation(invalidParams)

      expect(result).toEqual({
        success: false,
        response: 'Non ho identificato prodotti nella nostra conversazione. Puoi specificare cosa vuoi ordinare?',
        error: 'No products identified in conversation',
      })
    })

    it('should fail when customer is not found', async () => {
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await confirmOrderFromConversation(validParams)

      expect(result).toEqual({
        success: false,
        response: 'Si è verificato un errore durante la creazione dell\'ordine. Riprova o contatta l\'assistenza.',
        error: 'Customer customer-123 not found in workspace workspace-123',
      })
    })

    it('should fail when workspace is not found', async () => {
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(mockCustomer)
      ;(prisma.workspace.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await confirmOrderFromConversation(validParams)

      expect(result).toEqual({
        success: false,
        response: 'Si è verificato un errore durante la creazione dell\'ordine. Riprova o contatta l\'assistenza.',
        error: 'Workspace workspace-123 not found',
      })
    })

    it('should fail when product is not found', async () => {
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(mockCustomer)
      ;(prisma.workspace.findUnique as jest.Mock).mockResolvedValue(mockWorkspace)
      ;(prisma.products.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await confirmOrderFromConversation(validParams)

      expect(result).toEqual({
        success: false,
        response: 'Non riesco a trovare il prodotto "maglietta rossa" nel catalogo. Puoi verificare il nome?',
        error: 'Product not found: maglietta rossa',
      })
    })

    it('should handle database errors gracefully', async () => {
      ;(prisma.customers.findFirst as jest.Mock).mockRejectedValue(new Error('Database connection failed'))

      const result = await confirmOrderFromConversation(validParams)

      expect(result).toEqual({
        success: false,
        response: 'Si è verificato un errore durante la creazione dell\'ordine. Riprova o contatta l\'assistenza.',
        error: 'Database connection failed',
      })

      expect(logger.error).toHaveBeenCalledWith(
        '[CONFIRM_ORDER_CONVERSATION] Error confirming order from conversation:',
        expect.any(Error)
      )
    })
  })

  describe('Token generation', () => {
    beforeEach(() => {
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(mockCustomer)
      ;(prisma.workspace.findUnique as jest.Mock).mockResolvedValue(mockWorkspace)
      ;(prisma.products.findFirst as jest.Mock).mockResolvedValue(mockProduct)
      ;(prisma.secureToken.create as jest.Mock).mockResolvedValue({
        id: 'token-123',
        token: 'mockedhashedtoken123456789012',
      })
    })

    it('should generate secure token with correct expiration (1 hour)', async () => {
      const result = await confirmOrderFromConversation(validParams)

      expect(result.success).toBe(true)

      const tokenCreateCall = (prisma.secureToken.create as jest.Mock).mock.calls[0][0]
      const expiresAt = tokenCreateCall.data.expiresAt
      const now = new Date()
      const expectedExpiry = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour

      // Allow for small timing differences (within 10 seconds)
      expect(Math.abs(expiresAt.getTime() - expectedExpiry.getTime())).toBeLessThan(10000)
    })

    it('should limit conversation context to 1000 characters', async () => {
      const longContext = 'A'.repeat(2000) // 2000 characters
      const paramsWithLongContext = {
        ...validParams,
        conversationContext: longContext,
      }

      const result = await confirmOrderFromConversation(paramsWithLongContext)

      expect(result.success).toBe(true)

      const tokenCreateCall = (prisma.secureToken.create as jest.Mock).mock.calls[0][0]
      const savedContext = tokenCreateCall.data.payload.conversationContext

      expect(savedContext).toHaveLength(1000)
      expect(savedContext).toBe('A'.repeat(1000))
    })
  })

  describe('Response message formatting', () => {
    beforeEach(() => {
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(mockCustomer)
      ;(prisma.workspace.findUnique as jest.Mock).mockResolvedValue(mockWorkspace)
      ;(prisma.products.findFirst as jest.Mock).mockResolvedValue(mockProduct)
      ;(prisma.secureToken.create as jest.Mock).mockResolvedValue({
        id: 'token-123',
        token: 'mockedhashedtoken123456789012',
      })
    })

    it('should format response message correctly', async () => {
      const result = await confirmOrderFromConversation(validParams)

      expect(result.response).toContain('🛒 **Riepilogo Ordine**')
      expect(result.response).toContain('• Maglietta Rossa (SHIRT001)')
      expect(result.response).toContain('Quantità: 1 x €25.00 = €25.00')
      expect(result.response).toContain('💰 **Totale: €25.00**')
      expect(result.response).toContain('🔗 **Finalizza il tuo ordine:**')
      expect(result.response).toContain('https://test-shopme.com/checkout/mockedhashedtoken123456789012')
      expect(result.response).toContain('⏰ Link valido per 1 ora')
      expect(result.response).toContain('🔐 Checkout sicuro')
      expect(result.response).toContain('📝 Nel checkout potrai:')
    })
  })
})