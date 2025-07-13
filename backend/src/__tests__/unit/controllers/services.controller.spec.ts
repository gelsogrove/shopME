import { Response } from 'express';
import 'jest';
import { ServicesController } from '../../../interfaces/http/controllers/services.controller';
import { embeddingService } from '../../../services/embeddingService';
import { mockService } from '../mock/entity-mocks';
jest.mock('../../../services/embeddingService', () => ({
  embeddingService: {
    generateServiceEmbeddings: jest.fn().mockResolvedValue({ processed: 1, errors: [] })
  }
}));

// Mock ServiceService
jest.mock('../../../application/services/service.service', () => {
  return {
    default: {
      create: jest.fn().mockResolvedValue(mockService),
      update: jest.fn().mockResolvedValue(mockService),
      delete: jest.fn().mockResolvedValue(true),
      getById: jest.fn().mockResolvedValue(mockService),
      getAllForWorkspace: jest.fn().mockResolvedValue([mockService])
    }
  };
});

describe('ServicesController', () => {
  let servicesController: ServicesController;
  let mockRequest: any;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    servicesController = new ServicesController();
    mockRequest = {
      params: { id: 'service-test-id' },
      workspaceContext: { workspaceId: 'workspace-test-id' },
      body: { name: 'Test Service', price: 29.99, currency: 'EUR' }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    (embeddingService.generateServiceEmbeddings as jest.Mock).mockClear();
  });

  it('should create a service and trigger embedding generation', async () => {
    await servicesController.createService(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(embeddingService.generateServiceEmbeddings).toHaveBeenCalledWith('workspace-test-id');
  });

  it('should update a service and trigger embedding generation', async () => {
    await servicesController.updateService(mockRequest, mockResponse as Response);
    expect(embeddingService.generateServiceEmbeddings).toHaveBeenCalledWith('workspace-test-id');
  });

  it('should delete a service and trigger embedding generation', async () => {
    await servicesController.deleteService(mockRequest, mockResponse as Response);
    expect(embeddingService.generateServiceEmbeddings).toHaveBeenCalledWith('workspace-test-id');
  });
}); 