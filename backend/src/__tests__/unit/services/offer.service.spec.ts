import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { OfferService } from '../../../application/services/offer.service';

// Mock Prisma Client
jest.mock('../../../lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>()
}));

// Import the mocked prisma instance
import { prisma as mockPrisma } from '../../../lib/prisma';

// Mock logger
jest.mock('../../../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
}));

// Helper function to create mock offer objects
function createMockOffer(id: string, name: string, workspaceId: string, options: any = {}) {
  const now = new Date();
  const future = new Date(now.getTime() + 86400000); // add 1 day
  
  return {
    id,
    name,
    workspaceId,
    discountPercent: options.discountPercent || 10,
    startDate: options.startDate || now,
    endDate: options.endDate || future,
    isActive: options.isActive !== undefined ? options.isActive : true,
    categoryId: options.categoryId || null,
    description: options.description || null,
    createdAt: now,
    updatedAt: now
  };
}

describe('OfferService', () => {
  let offerService: OfferService;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Configure mock findMany
    (mockPrisma.offers.findMany as jest.Mock).mockImplementation(() => {
      return {
        then: (callback: Function) => callback([
          createMockOffer('1', 'Offer 1', 'test-workspace-id'),
          createMockOffer('2', 'Offer 2', 'test-workspace-id')
        ])
      };
    });
    
    // Configure mock findFirst
    (mockPrisma.offers.findFirst as jest.Mock).mockImplementation(() => {
      return {
        then: (callback: Function) => callback(createMockOffer('test-id', 'Test Offer', 'test-workspace-id'))
      };
    });
    
    // Configure mock create
    (mockPrisma.offers.create as jest.Mock).mockImplementation((args: any) => {
      const offerData = args.data;
      return {
        then: (callback: Function) => callback(createMockOffer('new-id', offerData.name, offerData.workspaceId))
      };
    });
    
    // Configure mock update
    (mockPrisma.offers.update as jest.Mock).mockImplementation((args: any) => {
      const id = args.where.id;
      const offerData = args.data;
      return {
        then: (callback: Function) => callback(createMockOffer(id, offerData.name || 'Updated Offer', offerData.workspaceId || 'test-workspace-id'))
      };
    });
    
    // Configure mock delete
    (mockPrisma.offers.delete as jest.Mock).mockImplementation((args: any) => {
      const id = args.where.id;
      return {
        then: (callback: Function) => callback(createMockOffer(id, 'Deleted Offer', 'test-workspace-id'))
      };
    });
    
    offerService = new OfferService();
  });

  describe('getAllOffers', () => {
    it('should return all offers for a workspace', async () => {
      // Arrange
      const workspaceId = 'test-workspace-id';
      const expectedOffers = [
        createMockOffer('1', 'Offer 1', workspaceId),
        createMockOffer('2', 'Offer 2', workspaceId)
      ];
      
      // Act
      const result = await offerService.getAllOffers(workspaceId);

      // Assert
      expect(result).toEqual(expect.arrayContaining(
        expectedOffers.map(offer => expect.objectContaining({ 
          id: offer.id, 
          name: offer.name,
          workspaceId: offer.workspaceId 
        }))
      ));
      expect(mockPrisma.offers.findMany).toHaveBeenCalledWith({
        where: { workspaceId },
        include: { category: true }
      });
    });
  });

  describe('getActiveOffers', () => {
    it('should return only active offers for a workspace', async () => {
      // Arrange
      const workspaceId = 'test-workspace-id';
      const now = new Date();
      
      const expectedOffers = [
        createMockOffer('1', 'Offer 1', workspaceId),
        createMockOffer('2', 'Offer 2', workspaceId),
      ];
      
      // Act
      const result = await offerService.getActiveOffers(workspaceId);

      // Assert
      expect(result).toEqual(expect.arrayContaining(
        expectedOffers.map(offer => expect.objectContaining({ 
          id: offer.id, 
          name: offer.name,
          isActive: true 
        }))
      ));
      expect(mockPrisma.offers.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId,
          isActive: true,
          startDate: { lte: expect.any(Date) },
          endDate: { gte: expect.any(Date) }
        },
        include: { category: true }
      });
    });
  });

  describe('getOfferById', () => {
    it('should return an offer by ID', async () => {
      // Arrange
      const id = 'test-id';
      const workspaceId = 'test-workspace-id';
      const expectedOffer = createMockOffer(id, 'Test Offer', workspaceId);
      
      // Act
      const result = await offerService.getOfferById(id, workspaceId);

      // Assert
      expect(result).toEqual(expect.objectContaining({ 
        id: expectedOffer.id, 
        name: expectedOffer.name
      }));
      expect(mockPrisma.offers.findFirst).toHaveBeenCalledWith({
        where: { id, workspaceId },
        include: { category: true }
      });
    });
  });

  describe('createOffer', () => {
    it('should create a new offer', async () => {
      // Arrange
      const now = new Date();
      const future = new Date(now.getTime() + 86400000);
      const offerData = {
        name: 'New Offer',
        workspaceId: 'test-workspace-id',
        discountPercent: 10,
        startDate: now,
        endDate: future,
        isActive: true,
        description: 'New offer description',
      };
      
      // Act
      const result = await offerService.createOffer(offerData as any);

      // Assert
      expect(result).toEqual(expect.objectContaining({ 
        name: offerData.name,
        workspaceId: offerData.workspaceId
      }));
      expect(mockPrisma.offers.create).toHaveBeenCalledWith({
        data: offerData,
        include: { category: true }
      });
    });
  });

  describe('updateOffer', () => {
    it('should update an existing offer', async () => {
      // Arrange
      const id = 'test-id';
      const offerData = {
        name: 'Updated Offer',
        workspaceId: 'test-workspace-id'
      };
      
      // Act
      const result = await offerService.updateOffer(id, offerData);

      // Assert
      expect(result).toEqual(expect.objectContaining({ 
        id,
        name: offerData.name
      }));
      expect(mockPrisma.offers.update).toHaveBeenCalledWith({
        where: { id },
        data: offerData,
        include: { category: true }
      });
    });
  });

  describe('deleteOffer', () => {
    it('should delete an offer', async () => {
      // Arrange
      const id = 'test-id';
      
      // Act
      const result = await offerService.deleteOffer(id);

      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.offers.delete).toHaveBeenCalledWith({
        where: { id }
      });
    });
  });
}); 