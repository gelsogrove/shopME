import { Response } from 'express';
import { WorkspaceContextDTO } from '../../../application/dtos/workspace-context.dto';
import { OfferService } from '../../../application/services/offer.service';
import { Offer } from '../../../domain/entities/offer.entity';
import { OfferController } from '../../../interfaces/http/controllers/offer.controller';
import { WorkspaceRequest } from '../../../interfaces/http/types/workspace-request';

// Mock OfferService
jest.mock('../../../application/services/offer.service');

// Helper per creare oggetti Offer validi
const createTestOffer = (id: string, name: string, workspaceId: string, isActive = true): Offer => {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + 30);
  
  return new Offer({
    id,
    name,
    workspaceId,
    discountPercent: 10,
    startDate: now,
    endDate: future,
    isActive,
    createdAt: now,
    updatedAt: now
  });
};

describe('OffersController', () => {
  let offersController: OfferController;
  let mockRequest: Partial<WorkspaceRequest>;
  let mockResponse: Partial<Response>;
  let mockOfferService: jest.Mocked<OfferService>;
  
  beforeEach(() => {
    mockOfferService = new OfferService() as jest.Mocked<OfferService>;
    offersController = new OfferController();
    
    // Reset the instance of OfferService inside the controller
    (offersController as any).offerService = mockOfferService;
    
    // Create the workspace context
    const workspaceContext = new WorkspaceContextDTO('test-workspace-id');
    
    mockRequest = {
      params: { workspaceId: 'test-workspace-id', id: 'test-id' },
      query: {},
      body: {},
      workspaceContext
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOffers', () => {
    it('should return all offers', async () => {
      // Arrange
      const offers = [
        createTestOffer('1', 'Offer 1', 'test-workspace-id'),
        createTestOffer('2', 'Offer 2', 'test-workspace-id')
      ];
      mockOfferService.getAllOffers.mockResolvedValue(offers);

      // Act
      await offersController.getAllOffers(mockRequest as WorkspaceRequest, mockResponse as Response);

      // Assert
      expect(mockOfferService.getAllOffers).toHaveBeenCalledWith('test-workspace-id');
      expect(mockResponse.json).toHaveBeenCalledWith(offers);
    });

    it('should return 400 when workspaceId is missing', async () => {
      // Arrange
      mockRequest.params = {};
      mockRequest.workspaceContext = undefined as any;

      // Act
      await offersController.getAllOffers(mockRequest as WorkspaceRequest, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ 
        error: expect.stringContaining('Workspace ID is required')
      }));
    });
  });

  describe('getActiveOffers', () => {
    it('should return active offers', async () => {
      // Arrange
      const activeOffers = [
        createTestOffer('1', 'Active Offer', 'test-workspace-id', true)
      ];
      mockOfferService.getActiveOffers.mockResolvedValue(activeOffers);

      // Act
      await offersController.getActiveOffers(mockRequest as WorkspaceRequest, mockResponse as Response);

      // Assert
      expect(mockOfferService.getActiveOffers).toHaveBeenCalledWith('test-workspace-id', undefined);
      expect(mockResponse.json).toHaveBeenCalledWith(activeOffers);
    });

    it('should return active offers filtered by category', async () => {
      // Arrange
      const categoryId = 'test-category';
      mockRequest.query = { categoryId };
      const activeOffers = [
        createTestOffer('1', 'Active Offer', 'test-workspace-id', true)
      ];
      // Aggiungi manualmente la proprietà categoryId
      (activeOffers[0] as any).categoryId = categoryId;
      
      mockOfferService.getActiveOffers.mockResolvedValue(activeOffers);

      // Act
      await offersController.getActiveOffers(mockRequest as WorkspaceRequest, mockResponse as Response);

      // Assert
      expect(mockOfferService.getActiveOffers).toHaveBeenCalledWith('test-workspace-id', categoryId);
      expect(mockResponse.json).toHaveBeenCalledWith(activeOffers);
    });
  });

  describe('getOfferById', () => {
    it('should return an offer by id', async () => {
      // Arrange
      const offer = createTestOffer('test-id', 'Test Offer', 'test-workspace-id');
      mockOfferService.getOfferById.mockResolvedValue(offer);

      // Act
      await offersController.getOfferById(mockRequest as WorkspaceRequest, mockResponse as Response);

      // Assert
      expect(mockOfferService.getOfferById).toHaveBeenCalledWith('test-id', 'test-workspace-id');
      expect(mockResponse.json).toHaveBeenCalledWith(offer);
    });

    it('should return 404 when offer not found', async () => {
      // Arrange
      mockOfferService.getOfferById.mockResolvedValue(null);

      // Act
      await offersController.getOfferById(mockRequest as WorkspaceRequest, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({ 
        error: 'Offer not found' 
      }));
    });
  });

  describe('createOffer', () => {
    it('should create an offer', async () => {
      // Arrange
      const now = new Date();
      const future = new Date();
      future.setDate(future.getDate() + 30);
      
      const offerData = { 
        name: 'New Offer', 
        discountPercent: 10,
        startDate: now,
        endDate: future
      };
      mockRequest.body = offerData;
      
      const createdOffer = new Offer({
        id: 'new-id',
        ...offerData,
        workspaceId: 'test-workspace-id',
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      mockOfferService.createOffer.mockResolvedValue(createdOffer);

      // Act
      await offersController.createOffer(mockRequest as WorkspaceRequest, mockResponse as Response);

      // Assert
      expect(mockOfferService.createOffer).toHaveBeenCalledWith({
        ...offerData,
        workspaceId: 'test-workspace-id'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdOffer);
    });
  });

  describe('updateOffer', () => {
    it('should update an offer', async () => {
      // Arrange
      const now = new Date();
      const future = new Date();
      future.setDate(future.getDate() + 30);
      
      const offerData = { 
        name: 'Updated Offer',
        discountPercent: 15
      };
      mockRequest.body = offerData;
      
      const existingOffer = new Offer({
        id: 'test-id',
        name: 'Original Offer',
        discountPercent: 10,
        workspaceId: 'test-workspace-id',
        startDate: now,
        endDate: future,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      const updatedOffer = new Offer({
        id: 'test-id',
        ...offerData,
        workspaceId: 'test-workspace-id',
        startDate: now,
        endDate: future,
        isActive: true,
        createdAt: now,
        updatedAt: now
      });
      
      mockOfferService.getOfferById.mockResolvedValue(existingOffer);
      mockOfferService.updateOffer.mockResolvedValue(updatedOffer);

      // Act
      await offersController.updateOffer(mockRequest as WorkspaceRequest, mockResponse as Response);

      // Assert
      expect(mockOfferService.getOfferById).toHaveBeenCalledWith('test-id', 'test-workspace-id');
      expect(mockOfferService.updateOffer).toHaveBeenCalledWith('test-id', {
        ...offerData,
        workspaceId: 'test-workspace-id'
      });
      expect(mockResponse.json).toHaveBeenCalledWith(updatedOffer);
    });
    
    it('should return 404 when offer to update does not exist', async () => {
      // Arrange
      const offerData = { name: 'Updated Offer' };
      mockRequest.body = offerData;
      
      mockOfferService.getOfferById.mockResolvedValue(null);

      // Act
      await offersController.updateOffer(mockRequest as WorkspaceRequest, mockResponse as Response);

      // Assert
      expect(mockOfferService.getOfferById).toHaveBeenCalledWith('test-id', 'test-workspace-id');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Offer not found' });
    });
  });

  describe('deleteOffer', () => {
    it('should delete an offer', async () => {
      // Arrange
      const existingOffer = createTestOffer('test-id', 'Test Offer', 'test-workspace-id');
      mockOfferService.getOfferById.mockResolvedValue(existingOffer);
      mockOfferService.deleteOffer.mockResolvedValue(true);

      // Act
      await offersController.deleteOffer(mockRequest as WorkspaceRequest, mockResponse as Response);

      // Assert
      expect(mockOfferService.getOfferById).toHaveBeenCalledWith('test-id', 'test-workspace-id');
      expect(mockOfferService.deleteOffer).toHaveBeenCalledWith('test-id');
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });
    
    it('should return 404 when offer to delete does not exist', async () => {
      // Arrange
      mockOfferService.getOfferById.mockResolvedValue(null);

      // Act
      await offersController.deleteOffer(mockRequest as WorkspaceRequest, mockResponse as Response);

      // Assert
      expect(mockOfferService.getOfferById).toHaveBeenCalledWith('test-id', 'test-workspace-id');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Offer not found' });
    });
  });
}); 