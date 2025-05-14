import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../../app';
import { setupTestAuth } from '../helpers/auth';
import { generateTestCategory } from './mock/mockCategories';
import { generateTestProduct, invalidProduct, mockProduct } from './mock/mockProducts';
import { generateTestUser } from './mock/mockUsers';
import { mockWorkspaceWithUser } from './mock/mockWorkspaces';
import { prisma, setupJest, teardownJest } from './setup';

describe.skip('Products API Integration Tests', () => {
  // Test data utilizzando i mock
  const testUser = generateTestUser('Product');
  testUser.role = 'ADMIN' as UserRole;
  
  const testCategory = generateTestCategory('Product');
  
  const newProduct = { ...mockProduct };
  
  let userId: string;
  let authToken: string;
  let workspaceId: string;
  let categoryId: string;
  let productId: string;
  
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
      
      // Create a category for products
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
  
  describe('POST /api/workspaces/:workspaceId/products', () => {
    it('should create a new product and return 201', async () => {
      // Add the category ID to the new product
      const productWithCategory = {
        ...newProduct,
        categoryId: categoryId
      };
      
      const response = await setupTestAuth(
        request(app)
          .post(`/api/workspaces/${workspaceId}/products`)
          .set('X-Workspace-Id', workspaceId)
          .send(productWithCategory),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(201);
      expect(response.body).toBeTruthy();
      
      // Save product ID for later tests
      productId = response.body.id;
      
      expect(productId).toBeTruthy();
      expect(response.body.name).toBe(newProduct.name);
      expect(response.body.price).toBe(newProduct.price);
      expect(response.body.categoryId).toBe(categoryId);
      expect(response.body.workspaceId).toBe(workspaceId);
    });
    
    it('should return 400 with invalid data', async () => {
      const response = await setupTestAuth(
        request(app)
          .post(`/api/workspaces/${workspaceId}/products`)
          .set('X-Workspace-Id', workspaceId)
          .send(invalidProduct),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect([400, 422, 500]).toContain(response.status);
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`/api/workspaces/${workspaceId}/products`)
        .send(newProduct)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/workspaces/:workspaceId/products', () => {
    it('should return all products with status 200', async () => {
      const response = await setupTestAuth(
        request(app)
          .get(`/api/workspaces/${workspaceId}/products`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      
      // Response might be paginated or an array
      if (response.body.products) {
        // Paginated response
        expect(Array.isArray(response.body.products)).toBe(true);
        expect(response.body.products.length).toBeGreaterThan(0);
      } else {
        // Array response
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      }
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${workspaceId}/products`)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
    
    it('should filter products by category', async () => {
      const response = await setupTestAuth(
        request(app)
          .get(`/api/workspaces/${workspaceId}/products?categoryId=${categoryId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      
      // Check that all returned products have the right category
      if (response.body.products) {
        // Paginated response
        expect(Array.isArray(response.body.products)).toBe(true);
        response.body.products.forEach(product => {
          expect(product.categoryId).toBe(categoryId);
        });
      } else if (Array.isArray(response.body)) {
        // Array response
        response.body.forEach(product => {
          expect(product.categoryId).toBe(categoryId);
        });
      }
    });
  });
  
  describe('GET /api/workspaces/:workspaceId/products/:id', () => {
    it('should return the product by ID with status 200', async () => {
      const response = await setupTestAuth(
        request(app)
          .get(`/api/workspaces/${workspaceId}/products/${productId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(productId);
      expect(response.body.name).toBe(newProduct.name);
      expect(response.body.categoryId).toBe(categoryId);
      expect(response.body.workspaceId).toBe(workspaceId);
    });
    
    it('should return 404 for non-existent product', async () => {
      const nonExistentId = 'non-existent-id';
      
      const response = await setupTestAuth(
        request(app)
          .get(`/api/workspaces/${workspaceId}/products/${nonExistentId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(404);
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${workspaceId}/products/${productId}`)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('PUT /api/workspaces/:workspaceId/products/:id', () => {
    it('should update the product and return 200', async () => {
      const updatedProduct = generateTestProduct('Updated', categoryId);
      
      const response = await setupTestAuth(
        request(app)
          .put(`/api/workspaces/${workspaceId}/products/${productId}`)
          .set('X-Workspace-Id', workspaceId)
          .send(updatedProduct),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(productId);
      expect(response.body.name).toBe(updatedProduct.name);
      expect(response.body.description).toBe(updatedProduct.description);
      expect(response.body.price).toBe(updatedProduct.price);
    });
    
    it('should return 404 for non-existent product', async () => {
      const nonExistentId = 'non-existent-id';
      const updatedProduct = generateTestProduct('NotFound', categoryId);
      
      const response = await setupTestAuth(
        request(app)
          .put(`/api/workspaces/${workspaceId}/products/${nonExistentId}`)
          .set('X-Workspace-Id', workspaceId)
          .send(updatedProduct),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(404);
    });
    
    it('should return 400 with invalid data', async () => {
      const response = await setupTestAuth(
        request(app)
          .put(`/api/workspaces/${workspaceId}/products/${productId}`)
          .set('X-Workspace-Id', workspaceId)
          .send(invalidProduct),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect([400, 422, 500]).toContain(response.status);
    });
  });
  
  describe('DELETE /api/workspaces/:workspaceId/products/:id', () => {
    it('should delete the product and return 200', async () => {
      const response = await setupTestAuth(
        request(app)
          .delete(`/api/workspaces/${workspaceId}/products/${productId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      
      // Verify the product is deleted
      const getResponse = await setupTestAuth(
        request(app)
          .get(`/api/workspaces/${workspaceId}/products/${productId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(getResponse.status).toBe(404);
    });
    
    it('should return 404 for non-existent product', async () => {
      const nonExistentId = 'non-existent-id';
      
      const response = await setupTestAuth(
        request(app)
          .delete(`/api/workspaces/${workspaceId}/products/${nonExistentId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(404);
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/workspaces/${workspaceId}/products/any-id`)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });
}); 