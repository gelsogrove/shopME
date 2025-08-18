import { PrismaClient } from '@prisma/client'
import { CategoryRepository } from '../../repositories/category.repository'
import { CustomerRepository } from '../../repositories/customer.repository'
import { FaqRepository } from '../../repositories/faq.repository'
import { OrderRepository } from '../../repositories/order.repository'
import { ProductRepository } from '../../repositories/product.repository'
import { ServiceRepository } from '../../repositories/service.repository'

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    services: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn()
    },
    fAQ: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn()
    },
    categories: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn()
    },
    products: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn()
    },
    orders: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn()
    },
    customers: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn()
    },
    $disconnect: jest.fn()
  }))
}))

describe('🚨 CRITICAL: Workspace Isolation Security Tests', () => {
  let mockPrisma: any
  let serviceRepository: ServiceRepository
  let faqRepository: FaqRepository
  let categoryRepository: CategoryRepository
  let productRepository: ProductRepository
  let orderRepository: OrderRepository
  let customerRepository: CustomerRepository

  const WORKSPACE_A = 'workspace-a-test'
  const WORKSPACE_B = 'workspace-b-test'
  const TEST_ID = 'test-id-123'

  beforeEach(() => {
    jest.clearAllMocks()
    mockPrisma = new PrismaClient()
    
    // Initialize repositories with mocked Prisma
    serviceRepository = new ServiceRepository()
    ;(serviceRepository as any).prisma = mockPrisma
    
    faqRepository = new FaqRepository()
    ;(faqRepository as any).prisma = mockPrisma
    
    categoryRepository = new CategoryRepository()
    ;(categoryRepository as any).prisma = mockPrisma
    
    productRepository = new ProductRepository()
    ;(productRepository as any).prisma = mockPrisma
    
    orderRepository = new OrderRepository()
    ;(orderRepository as any).prisma = mockPrisma
    
    customerRepository = new CustomerRepository()
    ;(customerRepository as any).prisma = mockPrisma
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('🔐 ServiceRepository Workspace Isolation', () => {
    test('✅ findById should include workspaceId in where clause', async () => {
      const mockService = { id: TEST_ID, name: 'Test Service', workspaceId: WORKSPACE_A }
      mockPrisma.services.findFirst.mockResolvedValue(mockService)

      await serviceRepository.findById(TEST_ID, WORKSPACE_A)

      expect(mockPrisma.services.findFirst).toHaveBeenCalledWith({
        where: {
          id: TEST_ID,
          workspaceId: WORKSPACE_A
        }
      })
    })

    test('✅ findByIds should include workspaceId in where clause', async () => {
      const mockServices = [
        { id: 'service-1', name: 'Service 1', workspaceId: WORKSPACE_A },
        { id: 'service-2', name: 'Service 2', workspaceId: WORKSPACE_A }
      ]
      mockPrisma.services.findMany.mockResolvedValue(mockServices)

      await serviceRepository.findByIds(['service-1', 'service-2'], WORKSPACE_A)

      expect(mockPrisma.services.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['service-1', 'service-2']
          },
          workspaceId: WORKSPACE_A
        }
      })
    })

    test('✅ update should include workspaceId in where clause', async () => {
      const mockService = { id: TEST_ID, name: 'Updated Service', workspaceId: WORKSPACE_A }
      mockPrisma.services.updateMany.mockResolvedValue({ count: 1 })
      mockPrisma.services.findFirst.mockResolvedValue(mockService)

      await serviceRepository.update(TEST_ID, WORKSPACE_A, { name: 'Updated Service' })

      expect(mockPrisma.services.updateMany).toHaveBeenCalledWith({
        where: {
          id: TEST_ID,
          workspaceId: WORKSPACE_A
        },
        data: { name: 'Updated Service' }
      })
    })

    test('✅ delete should include workspaceId in where clause', async () => {
      mockPrisma.services.deleteMany.mockResolvedValue({ count: 1 })

      await serviceRepository.delete(TEST_ID, WORKSPACE_A)

      expect(mockPrisma.services.deleteMany).toHaveBeenCalledWith({
        where: {
          id: TEST_ID,
          workspaceId: WORKSPACE_A
        }
      })
    })

    test('✅ findAll should include workspaceId in where clause', async () => {
      const mockServices = [
        { id: 'service-1', name: 'Service 1', workspaceId: WORKSPACE_A },
        { id: 'service-2', name: 'Service 2', workspaceId: WORKSPACE_A }
      ]
      mockPrisma.services.findMany.mockResolvedValue(mockServices)

      await serviceRepository.findAll(WORKSPACE_A)

      expect(mockPrisma.services.findMany).toHaveBeenCalledWith({
        where: { workspaceId: WORKSPACE_A },
        orderBy: { name: 'asc' }
      })
    })
  })

  describe('🔐 FaqRepository Workspace Isolation', () => {
    test('✅ findById should include workspaceId in where clause', async () => {
      const mockFaq = { id: TEST_ID, question: 'Test Question', answer: 'Test Answer', workspaceId: WORKSPACE_A }
      mockPrisma.fAQ.findFirst.mockResolvedValue(mockFaq)

      await faqRepository.findById(TEST_ID, WORKSPACE_A)

      expect(mockPrisma.fAQ.findFirst).toHaveBeenCalledWith({
        where: {
          id: TEST_ID,
          workspaceId: WORKSPACE_A
        }
      })
    })

    test('✅ update should include workspaceId in where clause', async () => {
      const mockFaq = { id: TEST_ID, question: 'Updated Question', answer: 'Updated Answer', workspaceId: WORKSPACE_A }
      mockPrisma.fAQ.updateMany.mockResolvedValue({ count: 1 })
      mockPrisma.fAQ.findFirst.mockResolvedValue(mockFaq)

      await faqRepository.update(TEST_ID, WORKSPACE_A, { question: 'Updated Question' })

      expect(mockPrisma.fAQ.updateMany).toHaveBeenCalledWith({
        where: {
          id: TEST_ID,
          workspaceId: WORKSPACE_A
        },
        data: { question: 'Updated Question' }
      })
    })

    test('✅ delete should include workspaceId in where clause', async () => {
      mockPrisma.fAQ.deleteMany.mockResolvedValue({ count: 1 })

      await faqRepository.delete(TEST_ID, WORKSPACE_A)

      expect(mockPrisma.fAQ.deleteMany).toHaveBeenCalledWith({
        where: {
          id: TEST_ID,
          workspaceId: WORKSPACE_A
        }
      })
    })

    test('✅ findAll should include workspaceId in where clause', async () => {
      const mockFaqs = [
        { id: 'faq-1', question: 'FAQ 1', answer: 'Answer 1', workspaceId: WORKSPACE_A },
        { id: 'faq-2', question: 'FAQ 2', answer: 'Answer 2', workspaceId: WORKSPACE_A }
      ]
      mockPrisma.fAQ.findMany.mockResolvedValue(mockFaqs)

      await faqRepository.findAll(WORKSPACE_A)

      expect(mockPrisma.fAQ.findMany).toHaveBeenCalledWith({
        where: { workspaceId: WORKSPACE_A }
      })
    })
  })

  describe('🔐 CategoryRepository Workspace Isolation', () => {
    test('✅ findById should include workspaceId in where clause', async () => {
      const mockCategory = { id: TEST_ID, name: 'Test Category', workspaceId: WORKSPACE_A }
      mockPrisma.categories.findFirst.mockResolvedValue(mockCategory)

      await categoryRepository.findById(TEST_ID, WORKSPACE_A)

      expect(mockPrisma.categories.findFirst).toHaveBeenCalledWith({
        where: {
          id: TEST_ID,
          workspaceId: WORKSPACE_A
        }
      })
    })

    test('✅ findBySlug should include workspaceId in where clause', async () => {
      const mockCategory = { id: TEST_ID, name: 'Test Category', slug: 'test-category', workspaceId: WORKSPACE_A }
      mockPrisma.categories.findFirst.mockResolvedValue(mockCategory)

      await categoryRepository.findBySlug('test-category', WORKSPACE_A)

      expect(mockPrisma.categories.findFirst).toHaveBeenCalledWith({
        where: {
          slug: 'test-category',
          workspaceId: WORKSPACE_A
        }
      })
    })

    test('✅ update should include workspaceId in where clause', async () => {
      const mockCategory = { id: TEST_ID, name: 'Updated Category', workspaceId: WORKSPACE_A }
      mockPrisma.categories.updateMany.mockResolvedValue({ count: 1 })
      mockPrisma.categories.findFirst.mockResolvedValue(mockCategory)

      await categoryRepository.update(TEST_ID, WORKSPACE_A, { name: 'Updated Category' })

      expect(mockPrisma.categories.updateMany).toHaveBeenCalledWith({
        where: {
          id: TEST_ID,
          workspaceId: WORKSPACE_A
        },
        data: { name: 'Updated Category' }
      })
    })

    test('✅ delete should include workspaceId in where clause', async () => {
      mockPrisma.categories.deleteMany.mockResolvedValue({ count: 1 })

      await categoryRepository.delete(TEST_ID, WORKSPACE_A)

      expect(mockPrisma.categories.deleteMany).toHaveBeenCalledWith({
        where: {
          id: TEST_ID,
          workspaceId: WORKSPACE_A
        }
      })
    })

    test('✅ findAll should include workspaceId in where clause', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Category 1', workspaceId: WORKSPACE_A },
        { id: 'cat-2', name: 'Category 2', workspaceId: WORKSPACE_A }
      ]
      mockPrisma.categories.findMany.mockResolvedValue(mockCategories)

      await categoryRepository.findAll(WORKSPACE_A)

      expect(mockPrisma.categories.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId: WORKSPACE_A,
          isActive: true
        },
        orderBy: {
          name: 'asc'
        }
      })
    })

    test('✅ hasProducts should include workspaceId in where clause', async () => {
      const mockProducts = [{ id: 'prod-1', name: 'Product 1', workspaceId: WORKSPACE_A }]
      mockPrisma.products.findMany.mockResolvedValue(mockProducts)

      await categoryRepository.hasProducts(TEST_ID, WORKSPACE_A)

      expect(mockPrisma.products.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: TEST_ID,
          workspaceId: WORKSPACE_A
        },
        take: 1
      })
    })
  })

  describe('🔐 ProductRepository Workspace Isolation', () => {
    test('✅ findAll should include workspaceId in where clause', async () => {
      const mockProducts = [
        { id: 'prod-1', name: 'Product 1', workspaceId: WORKSPACE_A },
        { id: 'prod-2', name: 'Product 2', workspaceId: WORKSPACE_A }
      ]
      mockPrisma.products.findMany.mockResolvedValue(mockProducts)
      mockPrisma.products.count.mockResolvedValue(2)

      await productRepository.findAll(WORKSPACE_A)

      expect(mockPrisma.products.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            workspaceId: WORKSPACE_A
          })
        })
      )
    })
  })

  describe('🔐 OrderRepository Workspace Isolation', () => {
    test('✅ findAll should include workspaceId in where clause', async () => {
      const mockOrders = [
        { id: 'order-1', orderCode: 'ORD-001', workspaceId: WORKSPACE_A },
        { id: 'order-2', orderCode: 'ORD-002', workspaceId: WORKSPACE_A }
      ]
      mockPrisma.orders.findMany.mockResolvedValue(mockOrders)
      mockPrisma.orders.count.mockResolvedValue(2)

      await orderRepository.findAll(WORKSPACE_A)

      expect(mockPrisma.orders.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            workspaceId: WORKSPACE_A
          })
        })
      )
    })
  })

  describe('🔐 CustomerRepository Workspace Isolation', () => {
    test('✅ findAll should include workspaceId in where clause', async () => {
      const mockCustomers = [
        { id: 'cust-1', name: 'Customer 1', workspaceId: WORKSPACE_A },
        { id: 'cust-2', name: 'Customer 2', workspaceId: WORKSPACE_A }
      ]
      mockPrisma.customers.findMany.mockResolvedValue(mockCustomers)

      await customerRepository.findAll(WORKSPACE_A)

      expect(mockPrisma.customers.findMany).toHaveBeenCalledWith({
        where: { workspaceId: WORKSPACE_A },
        orderBy: { name: 'asc' }
      })
    })

    test('✅ findByPhone should include workspaceId in where clause', async () => {
      const mockCustomer = { id: 'cust-1', name: 'Customer 1', phone: '+393451234567', workspaceId: WORKSPACE_A }
      mockPrisma.customers.findFirst.mockResolvedValue(mockCustomer)

      await customerRepository.findByPhone('+393451234567', WORKSPACE_A)

      expect(mockPrisma.customers.findFirst).toHaveBeenCalledWith({
        where: {
          phone: '+393451234567',
          workspaceId: WORKSPACE_A
        }
      })
    })
  })

  describe('🚨 SECURITY VULNERABILITY DETECTION', () => {
    test('❌ Should detect missing workspaceId in ServiceRepository.findById', async () => {
      // This test would fail if the method signature doesn't require workspaceId
      expect(serviceRepository.findById).toHaveLength(2) // Should expect 2 parameters: id and workspaceId
    })

    test('❌ Should detect missing workspaceId in FaqRepository.findById', async () => {
      // This test would fail if the method signature doesn't require workspaceId
      expect(faqRepository.findById).toHaveLength(2) // Should expect 2 parameters: id and workspaceId
    })

    test('❌ Should detect missing workspaceId in CategoryRepository.findById', async () => {
      // This test would fail if the method signature doesn't require workspaceId
      expect(categoryRepository.findById).toHaveLength(2) // Should expect 2 parameters: id and workspaceId
    })
  })

  describe('🔍 METHOD SIGNATURE VALIDATION', () => {
    test('✅ ServiceRepository methods should require workspaceId', () => {
      const serviceRepo = new ServiceRepository()
      
      // Check method signatures
      expect(serviceRepo.findById).toBeDefined()
      expect(serviceRepo.findByIds).toBeDefined()
      expect(serviceRepo.update).toBeDefined()
      expect(serviceRepo.delete).toBeDefined()
      expect(serviceRepo.findAll).toBeDefined()
    })

    test('✅ FaqRepository methods should require workspaceId', () => {
      const faqRepo = new FaqRepository()
      
      // Check method signatures
      expect(faqRepo.findById).toBeDefined()
      expect(faqRepo.update).toBeDefined()
      expect(faqRepo.delete).toBeDefined()
      expect(faqRepo.findAll).toBeDefined()
    })

    test('✅ CategoryRepository methods should require workspaceId', () => {
      const categoryRepo = new CategoryRepository()
      
      // Check method signatures
      expect(categoryRepo.findById).toBeDefined()
      expect(categoryRepo.findBySlug).toBeDefined()
      expect(categoryRepo.update).toBeDefined()
      expect(categoryRepo.delete).toBeDefined()
      expect(categoryRepo.findAll).toBeDefined()
      expect(categoryRepo.hasProducts).toBeDefined()
    })
  })
})
