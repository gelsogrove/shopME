import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import logger from '../../utils/logger'
import { InternalApiController } from '../../interfaces/http/controllers/internal-api.controller'

// Mock dependencies
// Mock MessageRepository
const mockMessageRepository = {
  getWorkspaceSettings: jest.fn(),
  getMessages: jest.fn(),
  saveMessage: jest.fn(),
}

jest.mock('../../repositories/message.repository', () => ({
  MessageRepository: jest.fn().mockImplementation(() => mockMessageRepository),
}))

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    customers: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    products: {
      findFirst: jest.fn(),
    },
    services: {
      findFirst: jest.fn(),
    },
    orders: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaClient)),
  }
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  }
})

jest.mock('../../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}))

describe('InternalApiController - createOrderInternal', () => {
  let controller: InternalApiController
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockPrisma: any

  beforeEach(() => {
    mockPrisma = new PrismaClient()
    // Inizializza il controller con il mock di MessageRepository
    controller = new InternalApiController(mockMessageRepository)
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    
    // Reset mocks before each test
    jest.clearAllMocks()
    
    // Set up the default mock implementations
    mockPrisma.customers.findFirst.mockResolvedValue({
      id: 'customer-123',
      name: 'Test Customer',
      phone: '+393401234567',
      email: 'test@example.com',
      workspaceId: 'workspace-123',
      activeChatbot: true,
      isBlacklisted: false,
      discount: 0,
    })
    
    mockPrisma.orders.findFirst.mockResolvedValue({
      orderCode: 'ORD-20250805-001',
      createdAt: new Date('2025-08-05'),
    })
    
    mockPrisma.orders.create.mockResolvedValue({
      id: 'order-123',
      orderCode: 'ORD-20250805-002',
      status: 'PENDING',
      totalAmount: 39.96,
      createdAt: new Date('2025-08-05'),
      items: [
        {
          id: 'item-1',
          itemType: 'PRODUCT',
          quantity: 4,
          unitPrice: 9.99,
          totalPrice: 39.96,
          productId: 'product-123',
        }
      ],
      customer: {
        id: 'customer-123',
        name: 'Test Customer',
      }
    })
  })

  describe('when handling different field formats', () => {
    
    test('should create order successfully with new format fields (itemType/productCode)', async () => {
      // Setup product mock response
      mockPrisma.products.findFirst.mockResolvedValue({
        id: 'product-123',
        name: 'Mozzarella di Bufala Campana DOP',
        ProductCode: '00004',
        price: 9.99,
        workspaceId: 'workspace-123',
        status: 'ACTIVE',
      })
      
      // Setup request with new format
      mockRequest = {
        body: {
          workspaceId: 'workspace-123',
          customerId: 'customer-123',
          items: [
            {
              itemType: 'PRODUCT',
              productCode: '00004',
              name: 'Mozzarella di Bufala Campana DOP',
              quantity: 4,
              unitPrice: 9.99,
            }
          ],
          notes: 'Test order with new format',
        }
      }
      
      // Call method
      await controller.createOrderInternal(mockRequest as Request, mockResponse as Response)
      
      // Assertions
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('[CREATE-ORDER] Received payload'))
      expect(mockPrisma.products.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { ProductCode: '00004' },
            { sku: '00004' },
            { id: '00004' }
          ])
        })
      }))
      expect(mockPrisma.orders.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          totalAmount: 39.96,
          customerId: 'customer-123',
          workspaceId: 'workspace-123',
          items: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({
                itemType: 'PRODUCT',
                quantity: 4,
                unitPrice: 9.99,
                totalPrice: 39.96,
                productId: 'product-123',
              })
            ])
          })
        })
      }))
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        order: expect.objectContaining({
          totalAmount: 39.96,
          itemsCount: 1,
        })
      }))
    })
    
    test('should create order successfully with legacy format fields (type/id)', async () => {
      // Setup product mock response
      mockPrisma.products.findFirst.mockResolvedValue({
        id: 'product-123',
        name: 'Mozzarella di Bufala Campana DOP',
        ProductCode: '00004',
        price: 9.99,
        workspaceId: 'workspace-123',
        status: 'ACTIVE',
      })
      
      // Setup request with legacy format
      mockRequest = {
        body: {
          workspaceId: 'workspace-123',
          customerId: 'customer-123',
          items: [
            {
              type: 'product',
              id: '00004',
              name: 'Mozzarella di Bufala Campana DOP',
              quantity: 4,
              unitPrice: 9.99,
            }
          ],
          notes: 'Test order with legacy format',
        }
      }
      
      // Call method
      await controller.createOrderInternal(mockRequest as Request, mockResponse as Response)
      
      // Assertions
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('[CREATE-ORDER] Received payload'))
      expect(mockPrisma.products.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { ProductCode: '00004' },
            { sku: '00004' },
            { id: '00004' }
          ])
        })
      }))
      expect(mockPrisma.orders.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          totalAmount: 39.96,
          customerId: 'customer-123',
          workspaceId: 'workspace-123',
          items: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({
                itemType: 'PRODUCT',
                quantity: 4,
                unitPrice: 9.99,
                totalPrice: 39.96,
                productId: 'product-123',
              })
            ])
          })
        })
      }))
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        order: expect.objectContaining({
          totalAmount: 39.96,
          itemsCount: 1,
        })
      }))
    })
    
    test('should create order successfully with mixed format fields', async () => {
      // Setup product mock responses
      mockPrisma.products.findFirst
        .mockResolvedValueOnce({
          id: 'product-123',
          name: 'Mozzarella di Bufala Campana DOP',
          ProductCode: '00004',
          price: 9.99,
          workspaceId: 'workspace-123',
          status: 'ACTIVE',
        })
        .mockResolvedValueOnce({
          id: 'product-456',
          name: 'Tuscan IGP Extra Virgin Olive Oil',
          ProductCode: '00001',
          price: 15.99,
          workspaceId: 'workspace-123',
          status: 'ACTIVE',
        })
      
      // Setup request with mixed format
      mockRequest = {
        body: {
          workspaceId: 'workspace-123',
          customerId: 'customer-123',
          items: [
            {
              itemType: 'PRODUCT',
              productCode: '00004',
              name: 'Mozzarella di Bufala Campana DOP',
              quantity: 2,
              unitPrice: 9.99,
            },
            {
              type: 'product',
              id: '00001',
              name: 'Tuscan IGP Extra Virgin Olive Oil',
              quantity: 1,
              unitPrice: 15.99,
            }
          ],
          notes: 'Test order with mixed format',
        }
      }
      
      // Update orders create mock for multiple items
      mockPrisma.orders.create.mockResolvedValue({
        id: 'order-123',
        orderCode: 'ORD-20250805-002',
        status: 'PENDING',
        totalAmount: 35.97,
        createdAt: new Date('2025-08-05'),
        items: [
          {
            id: 'item-1',
            itemType: 'PRODUCT',
            quantity: 2,
            unitPrice: 9.99,
            totalPrice: 19.98,
            productId: 'product-123',
          },
          {
            id: 'item-2',
            itemType: 'PRODUCT',
            quantity: 1,
            unitPrice: 15.99,
            totalPrice: 15.99,
            productId: 'product-456',
          }
        ],
        customer: {
          id: 'customer-123',
          name: 'Test Customer',
        }
      })
      
      // Call method
      await controller.createOrderInternal(mockRequest as Request, mockResponse as Response)
      
      // Assertions
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('[CREATE-ORDER] Received payload'))
      expect(mockPrisma.products.findFirst).toHaveBeenCalledTimes(2)
      expect(mockPrisma.orders.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          totalAmount: expect.any(Number),
          customerId: 'customer-123',
          workspaceId: 'workspace-123',
        })
      }))
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        order: expect.objectContaining({
          itemsCount: 2,
        })
      }))
    })
    
    test('should create order with auto-created customer when customer not found', async () => {
      // Setup mock to return no customer first, then return a created customer
      mockPrisma.customers.findFirst.mockResolvedValue(null)
      mockPrisma.customers.create.mockResolvedValue({
        id: 'new-customer-123',
        name: 'Test Customer 0bcf157b-e0ad-45dc-896c-f894cb19ead5',
        phone: '+393401234567',
        email: '0bcf157b-e0ad-45dc-896c-f894cb19ead5@test.local',
        workspaceId: 'workspace-123',
        activeChatbot: true,
        isBlacklisted: false,
        discount: 0,
      })
      
      // Setup product mock response
      mockPrisma.products.findFirst.mockResolvedValue({
        id: 'product-123',
        name: 'Mozzarella di Bufala Campana DOP',
        ProductCode: '00004',
        price: 9.99,
        workspaceId: 'workspace-123',
        status: 'ACTIVE',
      })
      
      // Update order mock for new customer
      mockPrisma.orders.create.mockResolvedValue({
        id: 'order-123',
        orderCode: 'ORD-20250805-002',
        status: 'PENDING',
        totalAmount: 39.96,
        createdAt: new Date('2025-08-05'),
        items: [
          {
            id: 'item-1',
            itemType: 'PRODUCT',
            quantity: 4,
            unitPrice: 9.99,
            totalPrice: 39.96,
            productId: 'product-123',
          }
        ],
        customer: {
          id: 'new-customer-123',
          name: 'Test Customer 0bcf157b-e0ad-45dc-896c-f894cb19ead5',
        }
      })
      
      // Setup request
      mockRequest = {
        body: {
          workspaceId: 'workspace-123',
          customerId: '0bcf157b-e0ad-45dc-896c-f894cb19ead5',
          items: [
            {
              itemType: 'PRODUCT',
              productCode: '00004',
              name: 'Mozzarella di Bufala Campana DOP',
              quantity: 4,
              unitPrice: 9.99,
            }
          ],
          notes: 'Test order with new customer',
        }
      }
      
      // Call method
      await controller.createOrderInternal(mockRequest as Request, mockResponse as Response)
      
      // Assertions
      expect(mockPrisma.customers.findFirst).toHaveBeenCalled()
      expect(mockPrisma.customers.create).toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Creating temporary customer'))
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        order: expect.objectContaining({
          totalAmount: 39.96,
          itemsCount: 1,
          customerName: 'Test Customer 0bcf157b-e0ad-45dc-896c-f894cb19ead5',
        })
      }))
    })
    
    test('should handle error when product is not found', async () => {
      // Setup product mock response to return null (product not found)
      mockPrisma.products.findFirst.mockResolvedValue(null)
      
      // Setup request
      mockRequest = {
        body: {
          workspaceId: 'workspace-123',
          customerId: 'customer-123',
          items: [
            {
              itemType: 'PRODUCT',
              productCode: 'INVALID-CODE',
              name: 'Nonexistent Product',
              quantity: 4,
              unitPrice: 9.99,
            }
          ],
          notes: 'Test order with invalid product',
        }
      }
      
      // Update order create mock for this case
      mockPrisma.orders.create.mockResolvedValue({
        id: 'order-123',
        orderCode: 'ORD-20250805-002',
        status: 'PENDING',
        totalAmount: 39.96,  // This will still be calculated even if product not found
        createdAt: new Date('2025-08-05'),
        items: [
          {
            id: 'item-1',
            itemType: 'PRODUCT',
            quantity: 4,
            unitPrice: 9.99,
            totalPrice: 39.96,
            productId: null, // No product ID since it wasn't found
          }
        ],
        customer: {
          id: 'customer-123',
          name: 'Test Customer',
        }
      })
      
      // Call method
      await controller.createOrderInternal(mockRequest as Request, mockResponse as Response)
      
      // Assertions
      expect(mockPrisma.products.findFirst).toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Product not found'))
      expect(mockPrisma.orders.create).toHaveBeenCalled() // Order should still be created
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        order: expect.anything()
      }))
    })
    
    test('should handle server error correctly', async () => {
      // Setup product mock to throw an error
      mockPrisma.orders.create.mockRejectedValue(new Error('Database connection failed'))
      
      // Setup request
      mockRequest = {
        body: {
          workspaceId: 'workspace-123',
          customerId: 'customer-123',
          items: [
            {
              itemType: 'PRODUCT',
              productCode: '00004',
              name: 'Mozzarella di Bufala Campana DOP',
              quantity: 4,
              unitPrice: 9.99,
            }
          ],
          notes: 'Test order that will fail',
        }
      }
      
      // Call method
      await controller.createOrderInternal(mockRequest as Request, mockResponse as Response)
      
      // Assertions
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('[CREATE-ORDER] ❌ Errore creazione ordine:'), 
        expect.any(Error)
      )
      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Internal server error',
        message: 'Database connection failed',
      }))
    })
  })
})
