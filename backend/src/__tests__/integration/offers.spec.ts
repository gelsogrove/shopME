import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../../app';
import { setupTestAuth } from '../helpers/auth';
import { generateTestCategory } from './mock/mockCategories';
import { generateTestOffer, invalidOffer, mockOffer } from './mock/mockOffers';
import { generateTestUser } from './mock/mockUsers';
import { mockWorkspaceWithUser } from './mock/mockWorkspaces';
import { prisma, setupJest, teardownJest } from './setup';

describe.skip('Offers API Integration Tests', () => {
  // Test data utilizzando i mock
  const testUser = generateTestUser('Offer');
  testUser.role = 'ADMIN' as UserRole;
  
  const testCategory = generateTestCategory('Offer');
  
  const newOffer = { ...mockOffer };
  
  let userId: string;
  let authToken: string;
  let workspaceId: string;
  let categoryId: string;
  let offerId: string;
  
  beforeAll(async () => {
    try {
      // Set up test environment
      await setupJest();
      
      // Create a test user with admin role
      const user = await prisma.user.create({
        data: {
          email: testUser.email,
          passwordHash: await bcrypt.hash(testUser.password, 10),
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          role: testUser.role,
          gdprAccepted: testUser.gdprAccepted
        }
      });
      
      userId = user.id;
      
      // Create a test workspace using mockWorkspaceWithUser
      const workspaceData = mockWorkspaceWithUser(userId);
      const workspace = await prisma.workspace.create({
        data: {
          name: workspaceData.name,
          slug: workspaceData.slug,
          language: 'ENG',
          currency: 'EUR',
          isActive: true,
          users: workspaceData.users
        }
      });
      
      workspaceId = workspace.id;
      
      // Create a category for offers
      const category = await prisma.categories.create({
        data: {
          name: testCategory.name,
          slug: testCategory.slug,
          description: testCategory.description,
          isActive: testCategory.isActive,
          workspaceId: workspaceId
        }
      });
      
      categoryId = category.id;
      
      // Login to get token
      const loginResponse = await setupTestAuth(
        request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          }),
        { token: authToken, workspaceId: workspaceId }
      );
      
      const cookies = loginResponse.headers['set-cookie'];
      if (cookies && cookies.length > 0) {
        const authCookie = cookies[0].split(';')[0];
        authToken = authCookie.split('=')[1];
      }
      
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  });
  
  afterAll(async () => {
    // Clean up test environment
    await teardownJest();
  });
  
  describe('POST /api/workspaces/:workspaceId/offers', () => {
    it('should create a new offer and return 201', async () => {
      // Add the category ID to the new offer
      const offerWithCategory = {
        ...newOffer,
        categoryId: categoryId
      };
      
      const response = await setupTestAuth(
        request(app)
          .post(`/api/workspaces/${workspaceId}/offers`)
          .set('X-Workspace-Id', workspaceId)
          .send(offerWithCategory),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(201);
      expect(response.body).toBeTruthy();
      
      // Save offer ID for later tests
      offerId = response.body.id;
      
      expect(offerId).toBeTruthy();
      expect(response.body.name).toBe(newOffer.name);
      expect(response.body.discountPercent).toBe(newOffer.discountPercent);
      expect(response.body.categoryId).toBe(categoryId);
      expect(response.body.workspaceId).toBe(workspaceId);
    });
    
    it('should return 400 with invalid data', async () => {
      const response = await setupTestAuth(
        request(app)
          .post(`/api/workspaces/${workspaceId}/offers`)
          .set('X-Workspace-Id', workspaceId)
          .send(invalidOffer),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect([400, 422, 500]).toContain(response.status);
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`/api/workspaces/${workspaceId}/offers`)
        .send(newOffer)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/workspaces/:workspaceId/offers', () => {
    it('should return all offers with status 200', async () => {
      const response = await setupTestAuth(
        request(app)
          .get(`/api/workspaces/${workspaceId}/offers`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should find at least one offer (the one we just created)
      expect(response.body.length).toBeGreaterThan(0);
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${workspaceId}/offers`)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
    
    it('should filter offers by category', async () => {
      const response = await setupTestAuth(
        request(app)
          .get(`/api/workspaces/${workspaceId}/offers?categoryId=${categoryId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      
      // Check that all returned offers have the right category
      if (response.body.offers) {
        // Paginated response
        expect(Array.isArray(response.body.offers)).toBe(true);
        response.body.offers.forEach(offer => {
          expect(offer.categoryId).toBe(categoryId);
        });
      } else if (Array.isArray(response.body)) {
        // Array response
        response.body.forEach(offer => {
          expect(offer.categoryId).toBe(categoryId);
        });
      }
    });
  });
  
  describe('GET /api/workspaces/:workspaceId/offers/:id', () => {
    it('should return the offer by ID with status 200', async () => {
      const response = await setupTestAuth(
        request(app)
          .get(`/api/workspaces/${workspaceId}/offers/${offerId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(offerId);
      expect(response.body.name).toBe(newOffer.name);
      expect(response.body.categoryId).toBe(categoryId);
      expect(response.body.workspaceId).toBe(workspaceId);
    });
    
    it('should return 404 for non-existent offer', async () => {
      const nonExistentId = 'non-existent-id';
      
      const response = await setupTestAuth(
        request(app)
          .get(`/api/workspaces/${workspaceId}/offers/${nonExistentId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(404);
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${workspaceId}/offers/${offerId}`)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('PUT /api/workspaces/:workspaceId/offers/:id', () => {
    it('should update the offer and return 200', async () => {
      const updatedOffer = generateTestOffer('Updated', workspaceId);
      
      const response = await setupTestAuth(
        request(app)
          .put(`/api/workspaces/${workspaceId}/offers/${offerId}`)
          .set('X-Workspace-Id', workspaceId)
          .send(updatedOffer),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(offerId);
      expect(response.body.name).toBe(updatedOffer.name);
      expect(response.body.description).toBe(updatedOffer.description);
      expect(response.body.discountPercent).toBe(updatedOffer.discountPercent);
    });
    
    it('should return 404 for non-existent offer', async () => {
      const nonExistentId = 'non-existent-id';
      const updatedOffer = generateTestOffer('NotFound', workspaceId);
      
      const response = await setupTestAuth(
        request(app)
          .put(`/api/workspaces/${workspaceId}/offers/${nonExistentId}`)
          .set('X-Workspace-Id', workspaceId)
          .send(updatedOffer),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(404);
    });
    
    it('should return 400 with invalid data', async () => {
      const response = await setupTestAuth(
        request(app)
          .put(`/api/workspaces/${workspaceId}/offers/${offerId}`)
          .set('X-Workspace-Id', workspaceId)
          .send(invalidOffer),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect([400, 422, 500]).toContain(response.status);
    });
  });
  
  describe('DELETE /api/workspaces/:workspaceId/offers/:id', () => {
    it('should delete the offer and return 200', async () => {
      const response = await setupTestAuth(
        request(app)
          .delete(`/api/workspaces/${workspaceId}/offers/${offerId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      
      // Verify the offer is deleted
      const getResponse = await setupTestAuth(
        request(app)
          .get(`/api/workspaces/${workspaceId}/offers/${offerId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(getResponse.status).toBe(404);
    });
    
    it('should return 404 for non-existent offer', async () => {
      const nonExistentId = 'non-existent-id';
      
      const response = await setupTestAuth(
        request(app)
          .delete(`/api/workspaces/${workspaceId}/offers/${nonExistentId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(404);
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/workspaces/${workspaceId}/offers/any-id`)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });
}); 