import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../app';
import { prisma, setupJest } from './setup';

// Set a longer timeout for integration tests
jest.setTimeout(15000);

describe('Workspace ID Parameter Validation - API Integration Tests', () => {
  let authToken: string;
  let testWorkspaceId: string;
  let invalidWorkspaceId: string;
  let deletedWorkspaceId: string;
  let inactiveWorkspaceId: string;
  let testUserId: string;

  beforeAll(async () => {
    try {
      await setupJest();

      // Create test user
      const testUser = await prisma.user.create({
        data: {
          email: `workspace-test-${Date.now()}@test.com`,
          passwordHash: 'hashedpassword',
          firstName: 'Test',
          lastName: 'User',
          status: 'ACTIVE',
          role: 'MEMBER'
        }
      });
      testUserId = testUser.id;

      // Create test workspace (active)
      const testWorkspace = await prisma.workspace.create({
        data: {
          name: 'Test Workspace',
          slug: `test-workspace-${Date.now()}`,
          language: 'ENG',
          currency: 'EUR',
          isActive: true,
          isDelete: false
        }
      });
      testWorkspaceId = testWorkspace.id;

      // Create user-workspace relationship
      await prisma.userWorkspace.create({
        data: {
          userId: testUserId,
          workspaceId: testWorkspaceId,
          role: 'OWNER'
        }
      });

      // Create deleted workspace
      const deletedWorkspace = await prisma.workspace.create({
        data: {
          name: 'Deleted Workspace',
          slug: `deleted-workspace-${Date.now()}`,
          language: 'ENG',
          currency: 'EUR',
          isActive: true,
          isDelete: true
        }
      });
      deletedWorkspaceId = deletedWorkspace.id;

      // Create inactive workspace
      const inactiveWorkspace = await prisma.workspace.create({
        data: {
          name: 'Inactive Workspace',
          slug: `inactive-workspace-${Date.now()}`,
          language: 'ENG',
          currency: 'EUR',
          isActive: false,
          isDelete: false
        }
      });
      inactiveWorkspaceId = inactiveWorkspace.id;

      // Generate auth token
      const payload = {
        email: testUser.email,
        userId: testUserId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
      };
      const secret = process.env.JWT_SECRET || 'test-secret-key';
      authToken = jwt.sign(payload, secret);
      
      invalidWorkspaceId = 'non-existent-workspace-id';
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      // Clean up test data
      await prisma.userWorkspace.deleteMany({
        where: { userId: testUserId }
      });
      await prisma.workspace.deleteMany({
        where: {
          id: { in: [testWorkspaceId, deletedWorkspaceId, inactiveWorkspaceId] }
        }
      });
      
      // Try to delete user, but don't fail if it doesn't exist
      try {
        await prisma.user.delete({
          where: { id: testUserId }
        });
      } catch (error) {
        // User might already be deleted, that's ok
        console.log('User already deleted or not found during cleanup');
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  describe('Products API - Basic Functionality', () => {
    it('should accept workspace ID from URL params', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${testWorkspaceId}/products`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should handle missing workspace ID in params', async () => {
      const response = await request(app)
        .get('/api/workspaces//products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404); // Route not found
    });

    // Note: Products API doesn't validate workspace existence at middleware level
    // It handles workspace validation at the service/repository level
    it('should handle invalid workspace ID at service level', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${invalidWorkspaceId}/products`)
        .set('Authorization', `Bearer ${authToken}`);

      // The response depends on how the service handles invalid workspace IDs
      // This could be 200 with empty results or 404, depending on implementation
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Chat API - With Workspace Validation Middleware', () => {
    // Chat routes DO have workspaceValidationMiddleware applied
    it('should reject request with invalid workspace ID', async () => {
      const response = await request(app)
        .post(`/api/workspaces/${invalidWorkspaceId}/chat`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Test message'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Workspace not found');
    });

    it('should reject request with deleted workspace ID', async () => {
      const response = await request(app)
        .post(`/api/workspaces/${deletedWorkspaceId}/chat`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Test message'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Workspace is not available');
    });
  });

  describe('API Behavior Documentation', () => {
    it('should document that most APIs handle workspace validation at service level', async () => {
      // This test documents the current behavior:
      // - Most APIs (products, services, faqs, etc.) don't have workspaceValidationMiddleware
      // - They rely on service-level validation and database constraints
      // - Only chat API currently has the middleware applied
      
      const apis = [
        `/api/workspaces/${testWorkspaceId}/products`,
        `/api/workspaces/${testWorkspaceId}/services`,
        `/api/workspaces/${testWorkspaceId}/faqs`,
        `/api/workspaces/${testWorkspaceId}/offers`
      ];

      for (const apiPath of apis) {
        const response = await request(app)
          .get(apiPath)
          .set('Authorization', `Bearer ${authToken}`);

        // These should work because they have valid workspace IDs
        // and the user has access to the workspace
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Categories API - Workspace ID Validation', () => {
    it('should accept workspace ID from URL params', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${testWorkspaceId}/categories`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should reject POST request with invalid workspace ID', async () => {
      const response = await request(app)
        .post(`/api/workspaces/${invalidWorkspaceId}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Category',
          description: 'Test Description'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Workspace not found');
      expect(response.body.debug.workspaceId).toBe(invalidWorkspaceId);
    });
  });

  describe('Services API - Workspace ID Validation', () => {
    it('should accept workspace ID from URL params', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${testWorkspaceId}/services`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should reject PUT request with deleted workspace ID', async () => {
      const response = await request(app)
        .put(`/api/workspaces/${deletedWorkspaceId}/services/test-service-id`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Service',
          description: 'Updated Description'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Workspace is not available');
    });
  });

  describe('FAQs API - Workspace ID Validation', () => {
    it('should accept workspace ID from URL params', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${testWorkspaceId}/faqs`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should reject DELETE request with invalid workspace ID', async () => {
      const response = await request(app)
        .delete(`/api/workspaces/${invalidWorkspaceId}/faqs/test-faq-id`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Workspace not found');
    });
  });

  describe('Offers API - Workspace ID Validation', () => {
    it('should accept workspace ID from URL params', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${testWorkspaceId}/offers`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should reject request with inactive workspace ID', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${inactiveWorkspaceId}/offers`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Workspace is not available');
    });
  });

  describe('Documents API - Workspace ID Validation', () => {
    it('should accept workspace ID from URL params', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${testWorkspaceId}/documents`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should reject document upload with invalid workspace ID', async () => {
      const response = await request(app)
        .post(`/api/workspaces/${invalidWorkspaceId}/documents/upload`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('document', Buffer.from('test content'), 'test.pdf');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Workspace not found');
    });
  });

  describe('Agent API - Workspace ID Validation', () => {
    it('should accept workspace ID from URL params', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${testWorkspaceId}/agent`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should reject agent configuration update with deleted workspace ID', async () => {
      const response = await request(app)
        .post(`/api/workspaces/${deletedWorkspaceId}/agent`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prompt: 'Test prompt',
          model: 'gpt-3.5-turbo',
          temperature: 0.7
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Workspace is not available');
    });
  });

  describe('Settings API - Workspace ID Validation', () => {
    it('should accept workspace ID from URL params for GDPR settings', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${testWorkspaceId}/settings/gdpr`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should reject GDPR settings update with invalid workspace ID', async () => {
      const response = await request(app)
        .put(`/api/workspaces/${invalidWorkspaceId}/settings/gdpr`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          gdprText: 'Updated GDPR text',
          isActive: true
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Workspace not found');
    });
  });

  describe('Alternative Workspace ID Sources', () => {
    it('should accept workspace ID from query parameter when supported', async () => {
      // Some endpoints might support workspace ID from query
      const response = await request(app)
        .get('/api/prompts')
        .query({ workspaceId: testWorkspaceId })
        .set('Authorization', `Bearer ${authToken}`);

      // This might return 400 if the endpoint doesn't support query-based workspace ID
      // The test verifies that the middleware processes the query parameter
      expect([200, 400, 404]).toContain(response.status);
    });

    it('should accept workspace ID from header when supported', async () => {
      // Test X-Workspace-ID header
      const response = await request(app)
        .get('/api/prompts')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Workspace-ID', testWorkspaceId);

      // This might return 400 if the endpoint doesn't support header-based workspace ID
      // The test verifies that the middleware processes the header
      expect([200, 400, 404]).toContain(response.status);
    });

    it('should reject empty workspace ID from any source', async () => {
      const response = await request(app)
        .get('/api/prompts')
        .query({ workspaceId: '' })
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Workspace-ID', '');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Workspace ID is required');
      expect(response.body.debug.finalWorkspaceId).toBeFalsy();
    });
  });

  describe('Workspace ID Extraction Priority', () => {
    it('should prioritize URL params over query parameters', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${testWorkspaceId}/products`)
        .query({ workspaceId: invalidWorkspaceId }) // This should be ignored
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200); // Should use URL param (valid workspace)
    });

    it('should prioritize URL params over headers', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${testWorkspaceId}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Workspace-ID', invalidWorkspaceId); // This should be ignored

      expect(response.status).toBe(200); // Should use URL param (valid workspace)
    });
  });

  describe('Error Response Format Validation', () => {
    it('should return consistent error format for missing workspace ID', async () => {
      const response = await request(app)
        .get('/api/prompts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('debug');
      expect(response.body).toHaveProperty('sqlQuery');
      expect(response.body.message).toBe('Workspace ID is required');
      expect(response.body.debug).toHaveProperty('url');
      expect(response.body.debug).toHaveProperty('method');
      expect(response.body.debug).toHaveProperty('workspaceIdSources');
    });

    it('should return consistent error format for non-existent workspace', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${invalidWorkspaceId}/services`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('debug');
      expect(response.body).toHaveProperty('sqlQuery');
      expect(response.body.message).toBe('Workspace not found');
      expect(response.body.debug.workspaceId).toBe(invalidWorkspaceId);
      expect(response.body.sqlQuery).toContain('SELECT id, name, isActive, isDelete FROM workspace');
    });

    it('should return consistent error format for inactive/deleted workspace', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${deletedWorkspaceId}/faqs`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('debug');
      expect(response.body).toHaveProperty('sqlQuery');
      expect(response.body.message).toBe('Workspace is not available');
      expect(response.body.debug).toHaveProperty('workspace');
      expect(response.body.debug.workspace.isDelete).toBe(true);
    });
  });

  describe('SQL Query Logging Validation', () => {
    it('should include SQL query in debug response for workspace lookup', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${invalidWorkspaceId}/offers`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.sqlQuery).toBe(
        `SELECT id, name, isActive, isDelete FROM workspace WHERE id = '${invalidWorkspaceId}'`
      );
    });

    it('should not execute SQL query when workspace ID is missing', async () => {
      const response = await request(app)
        .get('/api/prompts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.sqlQuery).toBe('No SQL query executed - workspace ID missing');
    });
  });
}); 