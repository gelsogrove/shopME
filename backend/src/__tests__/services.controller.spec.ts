import { Request, Response } from 'express';
import ServiceService from '../application/services/service.service';
import { ServicesController } from '../interfaces/http/controllers/services.controller';

// Mock ServiceService
jest.mock('../application/services/service.service', () => ({
  __esModule: true,
  default: {
    getAllForWorkspace: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

describe('ServicesController', () => {
  let servicesController: ServicesController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const mockServiceService = ServiceService as jest.Mocked<typeof ServiceService>;
  
  beforeEach(() => {
    servicesController = new ServicesController();
    
    mockRequest = {
      params: { workspaceId: 'test-workspace-id', id: 'test-id' },
      body: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    jest.clearAllMocks();
  });
  
  describe('getServicesForWorkspace', () => {
    it('should return all services for a workspace', async () => {
      // Arrange
      const services = [
        { id: '1', name: 'Service 1', price: 100 },
        { id: '2', name: 'Service 2', price: 150 }
      ];
      
      mockServiceService.getAllForWorkspace.mockResolvedValue(services as any);
      
      // Act
      await servicesController.getServicesForWorkspace(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockServiceService.getAllForWorkspace).toHaveBeenCalledWith('test-workspace-id');
      expect(mockResponse.json).toHaveBeenCalledWith(services);
    });
    
    it('should return error if workspaceId is missing', async () => {
      // Arrange
      mockRequest.params = {};
      
      // Act
      await servicesController.getServicesForWorkspace(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Workspace ID is required'
      }));
    });
    
    it('should handle service errors', async () => {
      // Arrange
      mockServiceService.getAllForWorkspace.mockRejectedValue(new Error('Service error'));
      
      // Act
      await servicesController.getServicesForWorkspace(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Failed to get services'
      }));
    });
  });
  
  describe('getServiceById', () => {
    it('should return a service by ID', async () => {
      // Arrange
      const service = { id: 'test-id', name: 'Test Service', price: 100 };
      mockServiceService.getById.mockResolvedValue(service as any);
      
      // Act
      await servicesController.getServiceById(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockServiceService.getById).toHaveBeenCalledWith('test-id');
      expect(mockResponse.json).toHaveBeenCalledWith(service);
    });
    
    it('should return 404 if service not found', async () => {
      // Arrange
      mockServiceService.getById.mockResolvedValue(null);
      
      // Act
      await servicesController.getServiceById(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Service not found'
      }));
    });
  });
  
  describe('createService', () => {
    it('should create a new service', async () => {
      // Arrange
      mockRequest.body = {
        name: 'New Service',
        description: 'New Description',
        price: '200',
        currency: 'EUR',
        duration: '120'
      };
      
      const createdService = {
        id: 'new-id',
        name: 'New Service',
        description: 'New Description',
        price: 200,
        currency: 'EUR',
        duration: 120,
        workspaceId: 'test-workspace-id'
      };
      
      mockServiceService.create.mockResolvedValue(createdService as any);
      
      // Act
      await servicesController.createService(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockServiceService.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Service',
        description: 'New Description',
        price: 200,
        duration: 120,
        workspaceId: 'test-workspace-id'
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdService);
    });
    
    it('should handle validation error', async () => {
      // Arrange
      mockServiceService.create.mockRejectedValue(new Error('Invalid service data'));
      
      // Act
      await servicesController.createService(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Invalid service data'
      }));
    });
  });
  
  describe('updateService', () => {
    it('should update an existing service', async () => {
      // Arrange
      mockRequest.body = {
        name: 'Updated Service',
        price: '250'
      };
      
      const updatedService = {
        id: 'test-id',
        name: 'Updated Service',
        price: 250,
        workspaceId: 'test-workspace-id'
      };
      
      mockServiceService.update.mockResolvedValue(updatedService as any);
      
      // Act
      await servicesController.updateService(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockServiceService.update).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({
          name: 'Updated Service',
          price: 250
        })
      );
      expect(mockResponse.json).toHaveBeenCalledWith(updatedService);
    });
    
    it('should handle not found error', async () => {
      // Arrange
      mockServiceService.update.mockRejectedValue(new Error('Service not found'));
      
      // Act
      await servicesController.updateService(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Service not found'
      }));
    });
    
    it('should handle validation error', async () => {
      // Arrange
      mockServiceService.update.mockRejectedValue(new Error('Invalid service data'));
      
      // Act
      await servicesController.updateService(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Invalid service data'
      }));
    });
  });
  
  describe('deleteService', () => {
    it('should delete a service', async () => {
      // Arrange
      mockServiceService.delete.mockResolvedValue(true);
      
      // Act
      await servicesController.deleteService(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockServiceService.delete).toHaveBeenCalledWith('test-id');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
    
    it('should handle error when service not found', async () => {
      // Arrange
      mockServiceService.delete.mockRejectedValue(new Error('Service not found'));
      
      // Act
      await servicesController.deleteService(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Service not found'
      }));
    });
  });
}); 