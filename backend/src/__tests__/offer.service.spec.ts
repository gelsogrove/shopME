import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { OfferService } from '../application/services/offer.service';

// Mock Prisma Client
jest.mock('../lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

import { prisma } from '../lib/prisma';
const mockPrisma = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

describe('OfferService', () => {
  let offerService: OfferService;
  
  beforeEach(() => {
    mockReset(mockPrisma);
    offerService = new OfferService();
  });

  describe('getAllOffers', () => {
    it('should return all offers for a workspace', async () => {
      // Arrange
      const workspaceId = 'test-workspace-id';
      const expectedOffers = [
        { id: '1', name: 'Offer 1', workspaceId },
        { id: '2', name: 'Offer 2', workspaceId }
      ];
      
      mockPrisma.offer.findMany.mockResolvedValue(expectedOffers);

      // Act
      const result = await offerService.getAllOffers(workspaceId);

      // Assert
      expect(result).toEqual(expectedOffers);
      expect(mockPrisma.offer.findMany).toHaveBeenCalledWith({
        where: { workspaceId }
      });
    });
  });

  describe('getActiveOffers', () => {
    it('should return active offers', async () => {
      // Arrange
      const workspaceId = 'test-workspace-id';
      const now = new Date();
      const expectedOffers = [
        { id: '1', name: 'Active Offer 1', workspaceId, isActive: true, startDate: new Date(), endDate: new Date() }
      ];
      
      mockPrisma.offer.findMany.mockResolvedValue(expectedOffers);

      // Act
      const result = await offerService.getActiveOffers(workspaceId);

      // Assert
      expect(result).toEqual(expectedOffers);
      expect(mockPrisma.offer.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId,
          isActive: true,
          startDate: { lte: expect.any(Date) },
          endDate: { gte: expect.any(Date) },
        }
      });
    });

    it('should return active offers for a specific category', async () => {
      // Arrange
      const workspaceId = 'test-workspace-id';
      const categoryId = 'test-category-id';
      const expectedOffers = [
        { id: '1', name: 'Active Offer 1', workspaceId, categoryId, isActive: true, startDate: new Date(), endDate: new Date() }
      ];
      
      mockPrisma.offer.findMany.mockResolvedValue(expectedOffers);

      // Act
      const result = await offerService.getActiveOffers(workspaceId, categoryId);

      // Assert
      expect(result).toEqual(expectedOffers);
      expect(mockPrisma.offer.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId,
          categoryId,
          isActive: true,
          startDate: { lte: expect.any(Date) },
          endDate: { gte: expect.any(Date) },
        }
      });
    });
  });

  describe('getOfferById', () => {
    it('should return an offer by ID', async () => {
      // Arrange
      const id = 'test-id';
      const workspaceId = 'test-workspace-id';
      const expectedOffer = { id, name: 'Test Offer', workspaceId };
      
      mockPrisma.offer.findFirst.mockResolvedValue(expectedOffer);

      // Act
      const result = await offerService.getOfferById(id, workspaceId);

      // Assert
      expect(result).toEqual(expectedOffer);
      expect(mockPrisma.offer.findFirst).toHaveBeenCalledWith({
        where: { id, workspaceId }
      });
    });
  });

  describe('createOffer', () => {
    it('should create a new offer', async () => {
      // Arrange
      const offerData = {
        name: 'New Offer',
        workspaceId: 'test-workspace-id',
        discountPercent: 10,
        startDate: new Date(),
        endDate: new Date()
      };
      
      const createdOffer = { id: 'new-id', ...offerData };
      mockPrisma.offer.create.mockResolvedValue(createdOffer);

      // Act
      const result = await offerService.createOffer(offerData);

      // Assert
      expect(result).toEqual(createdOffer);
      expect(mockPrisma.offer.create).toHaveBeenCalledWith({
        data: offerData
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
      
      const updatedOffer = { id, ...offerData };
      mockPrisma.offer.update.mockResolvedValue(updatedOffer);

      // Act
      const result = await offerService.updateOffer(id, offerData);

      // Assert
      expect(result).toEqual(updatedOffer);
      expect(mockPrisma.offer.update).toHaveBeenCalledWith({
        where: { id },
        data: offerData
      });
    });
  });

  describe('deleteOffer', () => {
    it('should delete an offer', async () => {
      // Arrange
      const id = 'test-id';
      mockPrisma.offer.delete.mockResolvedValue({ id } as any);

      // Act
      const result = await offerService.deleteOffer(id);

      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.offer.delete).toHaveBeenCalledWith({
        where: { id }
      });
    });
  });
}); 