import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../../app';
import { setupTestAuth } from '../unit/helpers/auth';
import { generateTestCategory, mockCategory } from './mock/mockCategories';
import { generateTestUser } from './mock/mockUsers';
import { mockWorkspace, mockWorkspaceWithUser } from './mock/mockWorkspaces';
import { prisma, setupJest, teardownJest } from './setup';

describe('Categories API Integration Tests', () => {
  // Test data utilizzando i mock
  const testUser = generateTestUser('Category');
  testUser.role = 'ADMIN' as UserRole;
  
  const testWorkspace = { ...mockWorkspace };
  
  const newCategory = { ...mockCategory };
  
  let userId: string;
  let authToken: string;
  let workspaceId: string;
  let categoryId: string;
  
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
          language: testWorkspace.language,
          currency: testWorkspace.currency,
          isActive: testWorkspace.isActive,
          users: workspaceData.users
        }
      });
      
      workspaceId = workspace.id;
      
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
  
  describe('POST /api/workspaces/:workspaceId/categories', () => {
    it('should create a new category and return 201', async () => {
      const response = await setupTestAuth(
        request(app)
          .post(`/api/workspaces/${workspaceId}/categories`)
          .send(newCategory),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(201);
      expect(response.body).toBeTruthy();
      
      // Save category ID for later tests
      if (response.body.id) {
        categoryId = response.body.id;
      } else if (response.body.category && response.body.category.id) {
        categoryId = response.body.category.id;
      }
      
      expect(categoryId).toBeTruthy();
      expect(response.body.name).toBe(newCategory.name);
      expect(response.body.slug).toBe(newCategory.slug);
      expect(response.body.description).toBe(newCategory.description);
    });
    
    it('should return 400 with invalid data', async () => {
      // Utilizziamo il mock per l'invalid category
      const invalidCategory = {
        // Missing required fields
        name: '',
        slug: ''
      };
      
      const response = await setupTestAuth(
        request(app)
          .post(`/api/workspaces/${workspaceId}/categories`)
          .send(invalidCategory),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect([400, 422, 500]).toContain(response.status);
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`/api/workspaces/${workspaceId}/categories`)
        .send(newCategory)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/workspaces/:workspaceId/categories', () => {
    it('should return all categories with status 200', async () => {
      const response = await setupTestAuth(
        request(app).get(`/api/workspaces/${workspaceId}/categories`),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should find at least one category (the one we just created)
      expect(response.body.length).toBeGreaterThan(0);
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${workspaceId}/categories`)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/workspaces/:workspaceId/categories/:id', () => {
    it('should return the category by ID with status 200', async () => {
      const response = await setupTestAuth(
        request(app).get(`/api/workspaces/${workspaceId}/categories/${categoryId}`),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(categoryId);
      expect(response.body.name).toBe(newCategory.name);
      expect(response.body.slug).toBe(newCategory.slug);
      expect(response.body.description).toBe(newCategory.description);
      expect(response.body.workspaceId).toBe(workspaceId);
    });
    
    it('should return 404 for non-existent category', async () => {
      const nonExistentId = 'non-existent-id';
      
      const response = await setupTestAuth(
        request(app).get(`/api/workspaces/${workspaceId}/categories/${nonExistentId}`),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(404);
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${workspaceId}/categories/${categoryId}`)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('PUT /api/workspaces/:workspaceId/categories/:id', () => {
    it('should update the category and return 200', async () => {
      // Utilizziamo generateTestCategory per creare un update
      const updatedCategory = generateTestCategory('Updated');
      
      const response = await setupTestAuth(
        request(app)
          .put(`/api/workspaces/${workspaceId}/categories/${categoryId}`)
          .send(updatedCategory),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(categoryId);
      expect(response.body.name).toBe(updatedCategory.name);
      expect(response.body.slug).toBe(updatedCategory.slug);
      expect(response.body.description).toBe(updatedCategory.description);
    });
    
    it('should return 404 for non-existent category', async () => {
      const nonExistentId = 'non-existent-id';
      const updatedCategory = generateTestCategory('NotFound');
      
      const response = await setupTestAuth(
        request(app)
          .put(`/api/workspaces/${workspaceId}/categories/${nonExistentId}`)
          .send(updatedCategory),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(404);
    });
    
    it('should return 400 with invalid data', async () => {
      const invalidCategory = {
        name: '',
        slug: '',
        description: 'Invalid category without required fields'
      };
      
      const response = await setupTestAuth(
        request(app)
          .put(`/api/workspaces/${workspaceId}/categories/${categoryId}`)
          .send(invalidCategory),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect([400, 422, 500]).toContain(response.status);
    });
  });
  
  describe('DELETE /api/workspaces/:workspaceId/categories/:id', () => {
    it('should delete the category and return 200', async () => {
      const response = await setupTestAuth(
        request(app).delete(`/api/workspaces/${workspaceId}/categories/${categoryId}`),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(204);
      
      // Verify the category is deleted
      const getResponse = await setupTestAuth(
        request(app).get(`/api/workspaces/${workspaceId}/categories/${categoryId}`),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(getResponse.status).toBe(404);
    });
    
    it('should return 404 for non-existent category', async () => {
      const nonExistentId = 'non-existent-id';
      
      const response = await setupTestAuth(
        request(app).delete(`/api/workspaces/${workspaceId}/categories/${nonExistentId}`),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(404);
    });
  });
}); 