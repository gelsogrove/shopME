import { Response } from 'express';
import { WorkspaceContextDTO } from '../../../application/dtos/workspace-context.dto';
import { Service } from '../../../domain/entities/service.entity';
import { ServicesController } from '../../../interfaces/http/controllers/services.controller';
import { WorkspaceRequest } from '../../../interfaces/http/types/workspace-request';

// Mock completo di ServiceService includendo l'inizializzazione
jest.mock('../../../application/services/service.service', () => {
  return {
    __esModule: true,
    default: {
      getAllForWorkspace: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  };
});

// Import the mocked service
import ServiceService from '../../../application/services/service.service';

// Get the mocked functions
const mockGetAllForWorkspace = ServiceService.getAllForWorkspace as jest.Mock;
const mockGetById = ServiceService.getById as jest.Mock;
const mockCreate = ServiceService.create as jest.Mock;
const mockUpdate = ServiceService.update as jest.Mock;
const mockDelete = ServiceService.delete as jest.Mock;

// Helper per creare servizi di test
const createTestService = (id: string, name: string, price: number): Service => {
  return {
    id,
    name,
    description: `Description for ${name}`,
    price,
    duration: 60,
    isActive: true,
    workspaceId: 'test-workspace-id',
    createdAt: new Date(),
    updatedAt: new Date()
  } as Service;
};

describe('ServicesController', () => {
  let servicesController: ServicesController;
  let mockRequest: Partial<WorkspaceRequest>;
  let mockResponse: Partial<Response>;
  
  beforeEach(() => {
    servicesController = new ServicesController();
    
    // Create the workspace context
    const workspaceContext = new WorkspaceContextDTO('test-workspace-id');
    
    mockRequest = {
      params: { workspaceId: 'test-workspace-id', id: 'test-id' },
      body: {},
      workspaceContext
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    // Reset di tutti i mock
    jest.clearAllMocks();
  });
  
  describe('getServicesForWorkspace', () => {
    it('should return all services for a workspace', async () => {
      // Arrange
      const services = [
        createTestService('1', 'Service 1', 100),
        createTestService('2', 'Service 2', 150)
      ];
      
      mockGetAllForWorkspace.mockResolvedValue(services);
      
      // Act
      await servicesController.getServicesForWorkspace(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockGetAllForWorkspace).toHaveBeenCalledWith('test-workspace-id');
      expect(mockResponse.json).toHaveBeenCalledWith(services);
    });
    
    it('should return error if workspaceId is missing', async () => {
      // Arrange
      // Set workspaceContext to undefined to simulate missing workspaceId
      mockRequest.workspaceContext = undefined as any;
      
      // Act
      await servicesController.getServicesForWorkspace(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Failed to get services'
      }));
    });
    
    it('should handle service errors', async () => {
      // Arrange
      mockGetAllForWorkspace.mockRejectedValue(new Error('Service error'));
      
      // Act
      await servicesController.getServicesForWorkspace(mockRequest as WorkspaceRequest, mockResponse as Response);
      
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
      const service = createTestService('test-id', 'Test Service', 100);
      mockGetById.mockResolvedValue(service);
      
      // Act
      await servicesController.getServiceById(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockGetById).toHaveBeenCalledWith('test-id', 'test-workspace-id');
      expect(mockResponse.json).toHaveBeenCalledWith(service);
    });
    
    it('should return 404 if service not found', async () => {
      // Arrange
      mockGetById.mockResolvedValue(null);
      
      // Act
      await servicesController.getServiceById(mockRequest as WorkspaceRequest, mockResponse as Response);
      
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
      
      const createdService = createTestService('new-id', 'New Service', 200);
      createdService.description = 'New Description';
      createdService.duration = 120;
      
      mockCreate.mockResolvedValue(createdService);
      
      // Act
      await servicesController.createService(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
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
      mockRequest.body = {}; // No name provided
      mockCreate.mockRejectedValue(new Error('Invalid service data'));
      
      // Act
      await servicesController.createService(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      // Accetto sia il messaggio generico sia quello specifico
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringMatching(/Name is required|Invalid service data/)
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
      
      const existingService = createTestService('test-id', 'Original Service', 200);
      const updatedService = createTestService('test-id', 'Updated Service', 250);
      
      mockGetById.mockResolvedValue(existingService);
      mockUpdate.mockResolvedValue(updatedService);
      
      // Act
      await servicesController.updateService(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockGetById).toHaveBeenCalledWith('test-id', 'test-workspace-id');
      expect(mockUpdate).toHaveBeenCalledWith(
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
      mockGetById.mockResolvedValue(null);
      
      // Act
      await servicesController.updateService(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Service not found in specified workspace'
      }));
    });
    
    it('should handle validation error', async () => {
      // Arrange
      const existingService = createTestService('test-id', 'Original Service', 200);
      mockRequest.body = {}; // Body vuoto
      mockGetById.mockResolvedValue(existingService);
      mockUpdate.mockRejectedValue(new Error('Invalid service data'));
      
      // Act
      await servicesController.updateService(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      // Accetto sia il messaggio generico sia quello specifico
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringMatching(/No valid fields provided for update|Invalid service data/)
      }));
    });
  });
  
  describe('deleteService', () => {
    it('should delete a service', async () => {
      // Arrange
      const existingService = createTestService('test-id', 'Service to delete', 100);
      mockGetById.mockResolvedValue(existingService);
      mockDelete.mockResolvedValue(true);
      
      // Act
      await servicesController.deleteService(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockGetById).toHaveBeenCalledWith('test-id', 'test-workspace-id');
      expect(mockDelete).toHaveBeenCalledWith('test-id');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
    
    it('should handle error when service not found', async () => {
      // Arrange
      mockGetById.mockResolvedValue(null);
      
      // Act
      await servicesController.deleteService(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Service not found in specified workspace'
      }));
    });
  });
}); 