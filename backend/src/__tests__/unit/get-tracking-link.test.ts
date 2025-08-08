import { OrderStatus } from '@prisma/client'
import { OrderService } from '../../application/services/order.service'
import { OrderRepository } from '../../repositories/order.repository'

jest.mock('../../repositories/order.repository')

describe('Get tracking link', () => {
  const mockRepo: jest.Mocked<OrderRepository> = new (OrderRepository as any)()
  const service = new OrderService(mockRepo as any)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('returns tracking payload for latest processing order', async () => {
    ;(mockRepo.findLatestProcessingByCustomer as any).mockResolvedValue({
      id: 'ord1',
      orderCode: '10423',
      status: OrderStatus.PROCESSING,
      trackingNumber: '1234567890',
    })
    const result = await service.getLatestProcessingTracking('w1', 'c1')
    expect(result).toEqual({
      orderId: 'ord1',
      orderCode: '10423',
      status: OrderStatus.PROCESSING,
      trackingNumber: '1234567890',
      trackingUrl: expect.stringContaining('tracking-id=1234567890'),
    })
  })

  it('returns null when no processing order', async () => {
    ;(mockRepo.findLatestProcessingByCustomer as any).mockResolvedValue(null)
    const result = await service.getLatestProcessingTracking('w1', 'c1')
    expect(result).toBeNull()
  })
})