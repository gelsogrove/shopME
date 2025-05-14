import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { OfferService } from '../../application/services/offer.service';
import { OfferRepository } from '../../repositories/offer.repository';

// Mock dependencies
jest.mock('../../repositories/offer.repository');

describe.skip('Offer Service - Category Handling', () => {
  let offerService: OfferService;
  let mockRepository: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock for repository
    mockRepository = {
      // @ts-ignore
      create: jest.fn().mockResolvedValue({ id: 'test-id' }),
      // @ts-ignore
      findById: jest.fn().mockResolvedValue(null)
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
}); 