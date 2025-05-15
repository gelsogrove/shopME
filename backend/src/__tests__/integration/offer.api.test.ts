/**
 * API Test for Offer endpoints
 */
import request from 'supertest';
import app from '../../app';

// Mock delle dipendenze
// Commented out to skip this test file
// jest.mock('../../utils/auth', () => ({
//   authenticateToken: (_req: any, _res: any, next: any) => next(),
//   checkWorkspaceAccess: (_req: any, _res: any, next: any) => next()
// }));

// Mock di Prisma
// jest.mock('@prisma/client', () => {
//   const mockUpdate = jest.fn();
//   return {
//     PrismaClient: jest.fn().mockImplementation(() => ({
//       offer: {
//         update: mockUpdate
//       }
//     }))
//   };
// });

describe.skip('Offer API Tests', () => {
  const workspaceId = 'cm9hjgq9v00014qk8fsdy4ujv';
  const offerId = 'cmal9emio000dpdgxdh9bdnyw';
  const categoryId = 'ec538587-59a9-47d7-9ec7-48c60384d12f';
  
  const offerData = {
    name: "Pasta Week",
    description: "Special discounts on all pasta products",
    discountPercent: 20,
    startDate: new Date("2025-05-07T15:50:22.080Z"),
    endDate: new Date("2025-05-17T15:50:22.080Z"),
    isActive: true,
    workspaceId
  };

  const offerWithCategoryIds = {
    ...offerData,
    categoryIds: [categoryId]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update an offer without categoryIds', async () => {
    const mockOffer = {
      id: offerId,
      ...offerData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Setup del mock
    const { PrismaClient } = require('@prisma/client');
    PrismaClient().offer.update.mockResolvedValue(mockOffer);

    const response = await request(app)
      .put(`/api/workspaces/${workspaceId}/offers/${offerId}`)
      .send(offerData);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(offerId);
  });

  it('should update an offer with categoryIds', async () => {
    const mockOffer = {
      id: offerId,
      ...offerData,
      categoryIds: [categoryId],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Setup del mock
    const { PrismaClient } = require('@prisma/client');
    PrismaClient().offer.update.mockResolvedValue(mockOffer);

    const response = await request(app)
      .put(`/api/workspaces/${workspaceId}/offers/${offerId}`)
      .send(offerWithCategoryIds);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(offerId);
    expect(response.body.categoryIds).toBeDefined();
    expect(response.body.categoryIds.includes(categoryId)).toBe(true);
  });
}); 