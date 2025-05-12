import { Request, Response } from 'express';
import { OfferService } from '../application/services/offer.service';
import { OffersController } from '../controllers/offer.controller';

// Mock OfferService
jest.mock('../application/services/offer.service');

describe('OffersController', () => {
  let offersController: OffersController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockOfferService: jest.Mocked<OfferService>;
  
  beforeEach(() => {
    mockOfferService = new OfferService() as jest.Mocked<OfferService>;
    offersController = new OffersController();
    
    // Reset the instance of OfferService inside the controller
    (offersController as any).offerService = mockOfferService;
    
    mockRequest = {
      params: { workspaceId: 'test-workspace-id', id: 'test-id' },
      query: {},
      body: {}
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
        { id: '1', name: 'Offer 1', workspaceId: 'test-workspace-id' },
        { id: '2', name: 'Offer 2', workspaceId: 'test-workspace-id' }
      ];
      mockOfferService.getAllOffers.mockResolvedValue(offers);

      // Act
      await offersController.getAllOffers(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockOfferService.getAllOffers).toHaveBeenCalledWith('test-workspace-id');
      expect(mockResponse.json).toHaveBeenCalledWith(offers);
    });

    it('should return 400 when workspaceId is missing', async () => {
      // Arrange
      mockRequest.params = {};

      // Act
      await offersController.getAllOffers(mockRequest as Request, mockResponse as Response);

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
        { id: '1', name: 'Active Offer', workspaceId: 'test-workspace-id', isActive: true }
      ];
      mockOfferService.getActiveOffers.mockResolvedValue(activeOffers);

      // Act
      await offersController.getActiveOffers(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockOfferService.getActiveOffers).toHaveBeenCalledWith('test-workspace-id', undefined);
      expect(mockResponse.json).toHaveBeenCalledWith(activeOffers);
    });

    it('should return active offers filtered by category', async () => {
      // Arrange
      const categoryId = 'test-category';
      mockRequest.query = { categoryId };
      const activeOffers = [
        { id: '1', name: 'Active Offer', workspaceId: 'test-workspace-id', categoryId, isActive: true }
      ];
      mockOfferService.getActiveOffers.mockResolvedValue(activeOffers);

      // Act
      await offersController.getActiveOffers(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockOfferService.getActiveOffers).toHaveBeenCalledWith('test-workspace-id', categoryId);
      expect(mockResponse.json).toHaveBeenCalledWith(activeOffers);
    });
  });

  describe('getOfferById', () => {
    it('should return an offer by id', async () => {
      // Arrange
      const offer = { id: 'test-id', name: 'Test Offer', workspaceId: 'test-workspace-id' };
      mockOfferService.getOfferById.mockResolvedValue(offer);

      // Act
      await offersController.getOfferById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockOfferService.getOfferById).toHaveBeenCalledWith('test-id', 'test-workspace-id');
      expect(mockResponse.json).toHaveBeenCalledWith(offer);
    });

    it('should return 404 when offer not found', async () => {
      // Arrange
      mockOfferService.getOfferById.mockResolvedValue(null);

      // Act
      await offersController.getOfferById(mockRequest as Request, mockResponse as Response);

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
      const offerData = { name: 'New Offer', discountPercent: 10 };
      mockRequest.body = offerData;
      const createdOffer = { id: 'new-id', ...offerData, workspaceId: 'test-workspace-id' };
      mockOfferService.createOffer.mockResolvedValue(createdOffer);

      // Act
      await offersController.createOffer(mockRequest as Request, mockResponse as Response);

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
      const offerData = { name: 'Updated Offer' };
      mockRequest.body = offerData;
      const updatedOffer = { id: 'test-id', ...offerData, workspaceId: 'test-workspace-id' };
      mockOfferService.updateOffer.mockResolvedValue(updatedOffer);

      // Act
      await offersController.updateOffer(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockOfferService.updateOffer).toHaveBeenCalledWith('test-id', {
        ...offerData,
        workspaceId: 'test-workspace-id'
      });
      expect(mockResponse.json).toHaveBeenCalledWith(updatedOffer);
    });
  });

  describe('deleteOffer', () => {
    it('should delete an offer', async () => {
      // Arrange
      mockOfferService.deleteOffer.mockResolvedValue(true);

      // Act
      await offersController.deleteOffer(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockOfferService.deleteOffer).toHaveBeenCalledWith('test-id');
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });
  });
}); 