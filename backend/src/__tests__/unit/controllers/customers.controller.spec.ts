import { NextFunction, Request, Response } from 'express';
import { CustomerService } from '../../../application/services/customer.service';
import { CustomersController } from '../../../interfaces/http/controllers/customers.controller';

// Mock del CustomerService
jest.mock('../../../application/services/customer.service');

describe('CustomersController - TASK 3: updateChatbotControl', () => {
  let controller: CustomersController;
  let mockCustomerService: jest.Mocked<CustomerService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset dei mock
    jest.clearAllMocks();
    
    // Setup del controller
    controller = new CustomersController();
    mockCustomerService = (controller as any).customerService;
    
    // Setup dei mock per req, res, next
    mockRequest = {
      params: {
        customerId: 'customer-123',
        workspaceId: 'workspace-456'
      },
      body: {},
      user: { id: 'user-789' }
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
  });

  describe('updateChatbotControl', () => {
    const mockExistingCustomer = {
      id: 'customer-123',
      name: 'Test Customer',
      phone: '+1234567890',
      activeChatbot: true,
      workspaceId: 'workspace-456'
    };

    const mockUpdatedCustomer = {
      ...mockExistingCustomer,
      activeChatbot: false
    };

    it('should successfully activate chatbot control', async () => {
      // Arrange
      mockRequest.body = { activeChatbot: true, reason: 'Customer requested AI assistance' };
      mockCustomerService.getById.mockResolvedValue({ ...mockExistingCustomer, activeChatbot: false });
      mockCustomerService.update.mockResolvedValue({ ...mockExistingCustomer, activeChatbot: true });

      // Act
      await controller.updateChatbotControl(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCustomerService.getById).toHaveBeenCalledWith('customer-123', 'workspace-456');
      expect(mockCustomerService.update).toHaveBeenCalledWith(
        'customer-123',
        'workspace-456',
        expect.objectContaining({
          activeChatbot: true,
          chatbotControlChangedAt: expect.any(Date),
          chatbotControlChangedBy: 'user-789',
          chatbotControlChangeReason: 'Customer requested AI assistance'
        })
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        customer: {
          id: 'customer-123',
          name: 'Test Customer',
          phone: '+1234567890',
          activeChatbot: true
        },
        change: {
          previousState: false,
          newState: true,
          reason: 'Customer requested AI assistance',
          changedAt: expect.any(String),
          changedBy: 'user-789'
        },
        message: 'Chatbot control activated - AI will handle messages'
      });
    });

    it('should successfully deactivate chatbot control', async () => {
      // Arrange
      mockRequest.body = { activeChatbot: false, reason: 'Operator intervention needed' };
      mockCustomerService.getById.mockResolvedValue(mockExistingCustomer);
      mockCustomerService.update.mockResolvedValue(mockUpdatedCustomer);

      // Act
      await controller.updateChatbotControl(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCustomerService.update).toHaveBeenCalledWith(
        'customer-123',
        'workspace-456',
        expect.objectContaining({
          activeChatbot: false,
          chatbotControlChangeReason: 'Operator intervention needed'
        })
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          customer: expect.objectContaining({
            activeChatbot: false
          }),
          change: expect.objectContaining({
            previousState: true,
            newState: false,
            reason: 'Operator intervention needed'
          }),
          message: 'Chatbot control deactivated - Manual operator control active'
        })
      );
    });

    it('should handle missing reason gracefully', async () => {
      // Arrange
      mockRequest.body = { activeChatbot: false }; // No reason provided
      mockCustomerService.getById.mockResolvedValue(mockExistingCustomer);
      mockCustomerService.update.mockResolvedValue(mockUpdatedCustomer);

      // Act
      await controller.updateChatbotControl(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCustomerService.update).toHaveBeenCalledWith(
        'customer-123',
        'workspace-456',
        expect.objectContaining({
          activeChatbot: false,
          chatbotControlChangeReason: null
        })
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          change: expect.objectContaining({
            reason: null
          })
        })
      );
    });

    it('should return 400 for invalid activeChatbot value', async () => {
      // Arrange
      mockRequest.body = { activeChatbot: 'invalid' }; // Not a boolean

      // Act
      await controller.updateChatbotControl(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'activeChatbot must be a boolean value'
      });
      expect(mockCustomerService.getById).not.toHaveBeenCalled();
    });

    it('should return 404 when customer not found', async () => {
      // Arrange
      mockRequest.body = { activeChatbot: true };
      mockCustomerService.getById.mockResolvedValue(null);

      // Act
      await controller.updateChatbotControl(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Customer not found'
      });
      expect(mockCustomerService.update).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      mockRequest.body = { activeChatbot: true };
      mockCustomerService.getById.mockResolvedValue(mockExistingCustomer);
      mockCustomerService.update.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await controller.updateChatbotControl(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle missing user in request', async () => {
      // Arrange
      mockRequest.user = undefined; // No user in request
      mockRequest.body = { activeChatbot: true };
      mockCustomerService.getById.mockResolvedValue(mockExistingCustomer);
      mockCustomerService.update.mockResolvedValue({ ...mockExistingCustomer, activeChatbot: true });

      // Act
      await controller.updateChatbotControl(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockCustomerService.update).toHaveBeenCalledWith(
        'customer-123',
        'workspace-456',
        expect.objectContaining({
          chatbotControlChangedBy: 'unknown'
        })
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          change: expect.objectContaining({
            changedBy: 'unknown'
          })
        })
      );
    });
  });
}); 