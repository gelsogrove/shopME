import { PrismaClient } from '@prisma/client'
import { ServiceRepository } from '../../repositories/service.repository'
import { FaqRepository } from '../../repositories/faq.repository'
import { CategoryRepository } from '../../repositories/category.repository'
import { ProductRepository } from '../../repositories/product.repository'
import { OrderRepository } from '../../repositories/order.repository'
import { CustomerRepository } from '../../repositories/customer.repository'
import { AgentRepository } from '../../repositories/agent.repository'
import { WorkspaceRepository } from '../../repositories/workspace.repository'

const prisma = new PrismaClient()

describe('🚨 CRITICAL: Workspace Isolation Security Audit', () => {
  const WORKSPACE_A = 'workspace-a-test'
  const WORKSPACE_B = 'workspace-b-test'
  
  beforeAll(async () => {
    // Create test workspaces
    await prisma.workspace.createMany({
      data: [
        { id: WORKSPACE_A, name: 'Workspace A', url: 'http://localhost:3000', isActive: true },
        { id: WORKSPACE_B, name: 'Workspace B', url: 'http://localhost:3000', isActive: true }
      ],
      skipDuplicates: true
    })
  })

  afterAll(async () => {
    // Cleanup test data
    await prisma.workspace.deleteMany({
      where: { id: { in: [WORKSPACE_A, WORKSPACE_B] } }
    })
    await prisma.$disconnect()
  })

  describe('🔐 ServiceRepository Workspace Isolation', () => {
    let serviceRepository: ServiceRepository
    let serviceA: any
    let serviceB: any

    beforeAll(async () => {
      serviceRepository = new ServiceRepository()
      
      // Create test services
      serviceA = await prisma.services.create({
        data: {
          id: 'service-a-test',
          name: 'Service A',
          description: 'Test service A',
          price: 100,
          workspaceId: WORKSPACE_A,
          isActive: true
        }
      })
      
      serviceB = await prisma.services.create({
        data: {
          id: 'service-b-test',
          name: 'Service B',
          description: 'Test service B',
          price: 200,
          workspaceId: WORKSPACE_B,
          isActive: true
        }
      })
    })

    afterAll(async () => {
      await prisma.services.deleteMany({
        where: { id: { in: [serviceA.id, serviceB.id] } }
      })
    })

    test('❌ findById should NOT work without workspaceId filter', async () => {
      // This test demonstrates the security vulnerability
      const serviceFromA = await serviceRepository.findById(serviceA.id)
      const serviceFromB = await serviceRepository.findById(serviceB.id)
      
      // Both services are accessible from any workspace - SECURITY RISK!
      expect(serviceFromA).not.toBeNull()
      expect(serviceFromB).not.toBeNull()
      
      console.warn('🚨 SECURITY VULNERABILITY: ServiceRepository.findById does not filter by workspaceId!')
      console.warn('Service from workspace A accessible from workspace B:', serviceFromA?.name)
      console.warn('Service from workspace B accessible from workspace A:', serviceFromB?.name)
    })

    test('❌ findByIds should NOT work without workspaceId filter', async () => {
      // This test demonstrates the security vulnerability
      const services = await serviceRepository.findByIds([serviceA.id, serviceB.id])
      
      // Both services are accessible from any workspace - SECURITY RISK!
      expect(services).toHaveLength(2)
      
      console.warn('🚨 SECURITY VULNERABILITY: ServiceRepository.findByIds does not filter by workspaceId!')
      console.warn('Services accessible across workspaces:', services.map(s => s.name))
    })

    test('✅ findAll should work with workspaceId filter', async () => {
      const servicesA = await serviceRepository.findAll(WORKSPACE_A)
      const servicesB = await serviceRepository.findAll(WORKSPACE_B)
      
      expect(servicesA).toHaveLength(1)
      expect(servicesB).toHaveLength(1)
      expect(servicesA[0].name).toBe('Service A')
      expect(servicesB[0].name).toBe('Service B')
    })
  })

  describe('🔐 FaqRepository Workspace Isolation', () => {
    let faqRepository: FaqRepository
    let faqA: any
    let faqB: any

    beforeAll(async () => {
      faqRepository = new FaqRepository()
      
      // Create test FAQs
      faqA = await prisma.fAQ.create({
        data: {
          id: 'faq-a-test',
          question: 'FAQ A Question',
          answer: 'FAQ A Answer',
          workspaceId: WORKSPACE_A,
          isActive: true
        }
      })
      
      faqB = await prisma.fAQ.create({
        data: {
          id: 'faq-b-test',
          question: 'FAQ B Question',
          answer: 'FAQ B Answer',
          workspaceId: WORKSPACE_B,
          isActive: true
        }
      })
    })

    afterAll(async () => {
      await prisma.fAQ.deleteMany({
        where: { id: { in: [faqA.id, faqB.id] } }
      })
    })

    test('❌ findById should NOT work without workspaceId filter', async () => {
      // This test demonstrates the security vulnerability
      const faqFromA = await faqRepository.findById(faqA.id)
      const faqFromB = await faqRepository.findById(faqB.id)
      
      // Both FAQs are accessible from any workspace - SECURITY RISK!
      expect(faqFromA).not.toBeNull()
      expect(faqFromB).not.toBeNull()
      
      console.warn('🚨 SECURITY VULNERABILITY: FaqRepository.findById does not filter by workspaceId!')
      console.warn('FAQ from workspace A accessible from workspace B:', faqFromA?.question)
      console.warn('FAQ from workspace B accessible from workspace A:', faqFromB?.question)
    })

    test('✅ findAll should work with workspaceId filter', async () => {
      const faqsA = await faqRepository.findAll(WORKSPACE_A)
      const faqsB = await faqRepository.findAll(WORKSPACE_B)
      
      expect(faqsA).toHaveLength(1)
      expect(faqsB).toHaveLength(1)
      expect(faqsA[0].question).toBe('FAQ A Question')
      expect(faqsB[0].question).toBe('FAQ B Question')
    })
  })

  describe('🔐 CategoryRepository Workspace Isolation', () => {
    let categoryRepository: CategoryRepository
    let categoryA: any
    let categoryB: any

    beforeAll(async () => {
      categoryRepository = new CategoryRepository()
      
      // Create test categories
      categoryA = await prisma.categories.create({
        data: {
          id: 'category-a-test',
          name: 'Category A',
          description: 'Test category A',
          workspaceId: WORKSPACE_A,
          isActive: true
        }
      })
      
      categoryB = await prisma.categories.create({
        data: {
          id: 'category-b-test',
          name: 'Category B',
          description: 'Test category B',
          workspaceId: WORKSPACE_B,
          isActive: true
        }
      })
    })

    afterAll(async () => {
      await prisma.categories.deleteMany({
        where: { id: { in: [categoryA.id, categoryB.id] } }
      })
    })

    test('✅ findById should work with workspaceId filter', async () => {
      const categoryFromA = await categoryRepository.findById(categoryA.id, WORKSPACE_A)
      const categoryFromB = await categoryRepository.findById(categoryB.id, WORKSPACE_B)
      
      // Should find correct categories
      expect(categoryFromA).not.toBeNull()
      expect(categoryFromB).not.toBeNull()
      expect(categoryFromA?.name).toBe('Category A')
      expect(categoryFromB?.name).toBe('Category B')
    })

    test('✅ findById should NOT find cross-workspace categories', async () => {
      const categoryFromWrongWorkspace = await categoryRepository.findById(categoryA.id, WORKSPACE_B)
      const categoryFromWrongWorkspace2 = await categoryRepository.findById(categoryB.id, WORKSPACE_A)
      
      // Should NOT find categories from other workspaces
      expect(categoryFromWrongWorkspace).toBeNull()
      expect(categoryFromWrongWorkspace2).toBeNull()
    })

    test('✅ findAll should work with workspaceId filter', async () => {
      const categoriesA = await categoryRepository.findAll(WORKSPACE_A)
      const categoriesB = await categoryRepository.findAll(WORKSPACE_B)
      
      expect(categoriesA).toHaveLength(1)
      expect(categoriesB).toHaveLength(1)
      expect(categoriesA[0].name).toBe('Category A')
      expect(categoriesB[0].name).toBe('Category B')
    })
  })

  describe('🔐 ProductRepository Workspace Isolation', () => {
    let productRepository: ProductRepository
    let productA: any
    let productB: any

    beforeAll(async () => {
      productRepository = new ProductRepository()
      
      // Create test products
      productA = await prisma.products.create({
        data: {
          id: 'product-a-test',
          name: 'Product A',
          description: 'Test product A',
          price: 100,
          stock: 10,
          workspaceId: WORKSPACE_A,
          isActive: true,
          status: 'ACTIVE'
        }
      })
      
      productB = await prisma.products.create({
        data: {
          id: 'product-b-test',
          name: 'Product B',
          description: 'Test product B',
          price: 200,
          stock: 20,
          workspaceId: WORKSPACE_B,
          isActive: true,
          status: 'ACTIVE'
        }
      })
    })

    afterAll(async () => {
      await prisma.products.deleteMany({
        where: { id: { in: [productA.id, productB.id] } }
      })
    })

    test('✅ findAll should work with workspaceId filter', async () => {
      const productsA = await productRepository.findAll(WORKSPACE_A)
      const productsB = await productRepository.findAll(WORKSPACE_B)
      
      expect(productsA.products).toHaveLength(1)
      expect(productsB.products).toHaveLength(1)
      expect(productsA.products[0].name).toBe('Product A')
      expect(productsB.products[0].name).toBe('Product B')
    })
  })

  describe('🔐 OrderRepository Workspace Isolation', () => {
    let orderRepository: OrderRepository
    let customerA: any
    let customerB: any
    let orderA: any
    let orderB: any

    beforeAll(async () => {
      orderRepository = new OrderRepository()
      
      // Create test customers
      customerA = await prisma.customers.create({
        data: {
          id: 'customer-a-test',
          name: 'Customer A',
          phone: '+393451234567',
          workspaceId: WORKSPACE_A
        }
      })
      
      customerB = await prisma.customers.create({
        data: {
          id: 'customer-b-test',
          name: 'Customer B',
          phone: '+393456789012',
          workspaceId: WORKSPACE_B
        }
      })
      
      // Create test orders
      orderA = await prisma.orders.create({
        data: {
          id: 'order-a-test',
          orderCode: 'ORD-A-001',
          customerId: customerA.id,
          workspaceId: WORKSPACE_A,
          status: 'PENDING',
          totalAmount: 100
        }
      })
      
      orderB = await prisma.orders.create({
        data: {
          id: 'order-b-test',
          orderCode: 'ORD-B-001',
          customerId: customerB.id,
          workspaceId: WORKSPACE_B,
          status: 'PENDING',
          totalAmount: 200
        }
      })
    })

    afterAll(async () => {
      await prisma.orders.deleteMany({
        where: { id: { in: [orderA.id, orderB.id] } }
      })
      await prisma.customers.deleteMany({
        where: { id: { in: [customerA.id, customerB.id] } }
      })
    })

    test('✅ findAll should work with workspaceId filter', async () => {
      const ordersA = await orderRepository.findAll(WORKSPACE_A)
      const ordersB = await orderRepository.findAll(WORKSPACE_B)
      
      expect(ordersA.orders).toHaveLength(1)
      expect(ordersB.orders).toHaveLength(1)
      expect(ordersA.orders[0].orderCode).toBe('ORD-A-001')
      expect(ordersB.orders[0].orderCode).toBe('ORD-B-001')
    })
  })
})
