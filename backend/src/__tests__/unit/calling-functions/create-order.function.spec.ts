import 'jest'

// Prepare PrismaClient mock before importing module under test
const mockPrisma = {
  customers: {
    findUnique: jest.fn(),
  },
  products: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  services: {
    findFirst: jest.fn(),
  },
  orders: {
    create: jest.fn(),
  },
}

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  ItemType: {
    PRODUCT: 'PRODUCT',
    SERVICE: 'SERVICE',
  },
}))

import { CreateOrder } from '../../../chatbot/calling-functions/CreateOrder'

describe('CreateOrder calling function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.FRONTEND_URL = 'http://localhost:5173'
  })

  it('creates an order and inserts items in DB with stock decrement', async () => {
    // Arrange
    mockPrisma.customers.findUnique.mockResolvedValue({
      id: 'cust-1',
      name: 'Mario',
      workspaceId: 'ws-1',
    })

    mockPrisma.products.findFirst.mockResolvedValue({
      id: 'prod-1',
      name: 'Spaghetti',
      ProductCode: 'SP01',
      stock: 10,
      status: 'ACTIVE',
      workspaceId: 'ws-1',
    })

    mockPrisma.orders.create.mockResolvedValue({
      id: 'order-1',
      items: [],
      customer: { id: 'cust-1', name: 'Mario' },
    })

    const params = {
      workspaceId: 'ws-1',
      customerId: 'cust-1',
      items: [
        {
          type: 'product' as const,
          id: 'SP01',
          name: 'Spaghetti',
          quantity: 2,
          unitPrice: 5.0,
        },
      ],
      notes: 'Ordine di prova',
    }

    // Act
    const result = await CreateOrder(params)

    // Assert
    expect(result.success).toBe(true)
    expect(result.orderId).toBe('order-1')
    expect(result.checkoutUrl).toBe('http://localhost:5173/checkout/order/order-1')

    // DB insert assertions
    expect(mockPrisma.orders.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderCode: expect.any(String),
          customerId: 'cust-1',
          workspaceId: 'ws-1',
          status: 'PENDING',
          totalAmount: 10.0,
          shippingAmount: 0,
          taxAmount: 0,
          discountAmount: 0,
          notes: 'Ordine di prova',
          items: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({
                itemType: 'PRODUCT',
                quantity: 2,
                unitPrice: 5.0,
                totalPrice: 10.0,
                product: expect.objectContaining({
                  connect: expect.objectContaining({ id: 'prod-1' }),
                }),
              }),
            ]),
          }),
        }),
        include: expect.objectContaining({
          items: expect.objectContaining({
            include: expect.objectContaining({
              product: true,
              service: true,
            }),
          }),
          customer: true,
        }),
      })
    )

    // Stock decrement assertion
    expect(mockPrisma.products.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prod-1' },
        data: expect.objectContaining({
          stock: expect.objectContaining({ decrement: 2 }),
        }),
      })
    )
  })

  it('returns error when customer not found', async () => {
    mockPrisma.customers.findUnique.mockResolvedValue(null)

    const res = await CreateOrder({
      workspaceId: 'ws-1',
      customerId: 'missing',
      items: [
        { type: 'product', id: 'SP01', name: 'Spaghetti', quantity: 1, unitPrice: 5 },
      ],
    })

    expect(res.success).toBe(false)
    expect(res.error).toBe('CUSTOMER_NOT_FOUND')
    expect(mockPrisma.orders.create).not.toHaveBeenCalled()
  })
})