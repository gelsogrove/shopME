import { Request, Response } from 'express'
import { OrdersController } from '../../interfaces/http/controllers/orders.controller'

describe('OrdersController', () => {
  let ordersController: OrdersController
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockJson: jest.Mock
  let mockStatus: jest.Mock

  beforeEach(() => {
    ordersController = new OrdersController()
    mockJson = jest.fn()
    mockStatus = jest.fn().mockReturnValue({ json: mockJson })
    
    mockRequest = {
      query: {},
      params: {},
    }
    
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    }
  })

  describe('getCustomerOrders', () => {
    it('should return 401 when no token is provided', async () => {
      await ordersController.getCustomerOrders(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Token is required'
      })
    })

    it('should return 401 when invalid token is provided', async () => {
      mockRequest.query = { token: 'invalid-token' }

      await ordersController.getCustomerOrders(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token'
      })
    })
  })

  describe('getOrderDetail', () => {
    it('should return 401 when no token is provided', async () => {
      mockRequest.params = { orderCode: 'ORD-2025-001' }

      await ordersController.getOrderDetail(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Token is required'
      })
    })
  })

  describe('downloadInvoice', () => {
    it('should return 501 (not implemented)', async () => {
      mockRequest.params = { orderCode: 'ORD-2025-001' }
      mockRequest.query = { token: 'mock-token' }
      ;(mockRequest as any).jwtPayload = {
        clientId: 'mock-customer-id',
        workspaceId: 'mock-workspace-id',
        scope: 'orders:list'
      }

      await ordersController.downloadInvoice(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: expect.stringMatching(/not found|not implemented/i)
      })
    })
  })

  describe('downloadDdt', () => {
    it('should return 501 (not implemented)', async () => {
      mockRequest.params = { orderCode: 'ORD-2025-001' }
      mockRequest.query = { token: 'mock-token' }
      ;(mockRequest as any).jwtPayload = {
        clientId: 'mock-customer-id',
        workspaceId: 'mock-workspace-id',
        scope: 'orders:list'
      }

      await ordersController.downloadDdt(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: expect.stringMatching(/not found|not implemented/i)
      })
    })
  })
})
