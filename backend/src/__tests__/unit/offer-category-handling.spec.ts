// @ts-nocheck - Jest mock typing issues, needs proper mock setup
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { OfferService } from '../../application/services/offer.service';
import { OfferRepository } from '../../repositories/offer.repository';

// Mock dependencies
jest.mock('../../repositories/offer.repository');

describe('Offer Service - Category Handling', () => {
  let offerService: OfferService;
  let mockRepository: Record<string, jest.Mock>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock for repository with all necessary methods
    mockRepository = {
      create: jest.fn().mockResolvedValue({ id: 'test-id' }),
      findById: jest.fn().mockResolvedValue(null),
      findAll: jest.fn().mockResolvedValue([]),
      findActive: jest.fn().mockResolvedValue([]),
      getActiveOffers: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ id: 'test-id' }),
      delete: jest.fn().mockResolvedValue(true)
    };
    
    // Mock the repository implementation
    (OfferRepository as jest.Mock).mockImplementation(() => mockRepository);
    
    // Create service instance
    offerService = new OfferService();
  });

  it('should handle null categoryIds when creating an offer', async () => {
    // Setup test data
    const offerData = {
      name: "Test Offer",
      description: "Test Description",
      discountPercent: 20,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      categoryIds: null,
      workspaceId: "test-workspace-id"
    };

    // Call the service method
    await offerService.createOffer(offerData);

    // Verify repository was called
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
    
    // Check what was passed to the repository
    const createArgs = mockRepository.create.mock.calls[0][0];
    
    // The categoryIds field should have been removed
    expect(createArgs).not.toHaveProperty('categoryIds');
    
    // And no categoryId should be set since categoryIds was null
    expect(createArgs.categoryId).toBeUndefined();
  });
  
  it('should set categoryId when categoryIds has one element', async () => {
    // Setup test data with a single category ID
    const offerData = {
      name: "Test Offer with Category",
      description: "Test Description",
      discountPercent: 15,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      categoryIds: ["test-category-id"],
      workspaceId: "test-workspace-id"
    };

    // Call the service method
    await offerService.createOffer(offerData);

    // Verify repository was called
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
    
    // Check what was passed to the repository
    const createArgs = mockRepository.create.mock.calls[0][0];
    
    // The categoryIds field should have been removed
    expect(createArgs).not.toHaveProperty('categoryIds');
    
    // The first categoryId should have been set as the categoryId
    expect(createArgs.categoryId).toBe("test-category-id");
  });
}); 