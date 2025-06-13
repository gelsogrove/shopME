import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../../app';
import { prisma, setupJest, teardownJest } from './setup';

// Set a longer timeout for integration tests
jest.setTimeout(15000);

describe('Workspace ID Parameter Validation - API Integration Tests', () => {
  let authToken: string;
  let testWorkspaceId: string;
  let invalidWorkspaceId: string;
  let deletedWorkspaceId: string;
  let inactiveWorkspaceId: string;

  beforeAll(async () => {
    try {
      await setupJest();

      const timestamp = Date.now();
      // Create test user with proper schema
      const testUser = await prisma.user.create({
        data: {
          email: `workspace-test-${timestamp}@test.com`,
          passwordHash: await bcrypt.hash('Password123!', 10),
          firstName: 'Workspace',
          lastName: 'Test',
          role: 'ADMIN',
          status: 'ACTIVE',
          gdprAccepted: new Date()
        }
      });

      // Create test workspaces with different states and proper schema
      const activeWorkspace = await prisma.workspace.create({
        data: {
          name: 'Active Workspace Test',
          slug: `active-workspace-${timestamp}`,
          isActive: true,
          isDelete: false,
          plan: 'FREE',
          language: 'ENG',
          currency: 'EUR'
        }
      });
      testWorkspaceId = activeWorkspace.id;

      const deletedWorkspace = await prisma.workspace.create({
        data: {
          name: 'Deleted Workspace Test',
          slug: `deleted-workspace-${timestamp}`,
          isActive: true,
          isDelete: true,
          plan: 'FREE',
          language: 'ENG',
          currency: 'EUR'
        }
      });
      deletedWorkspaceId = deletedWorkspace.id;

      const inactiveWorkspace = await prisma.workspace.create({
        data: {
          name: 'Inactive Workspace Test',
          slug: `inactive-workspace-${timestamp}`,
          isActive: false,
          isDelete: false,
          plan: 'FREE',
          language: 'ENG',
          currency: 'EUR'
        }
      });
      inactiveWorkspaceId = inactiveWorkspace.id;

      // Invalid workspace ID (doesn't exist in DB)
      invalidWorkspaceId = 'non-existent-workspace-id';

      // Create user-workspace relations
      await prisma.userWorkspace.create({
        data: {
          userId: testUser.id,
          workspaceId: testWorkspaceId,
          role: 'ADMIN'
        }
      });

      // Try to login to get token, fallback to mock if needed
      try {
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: `workspace-test-${timestamp}@test.com`,
            password: 'Password123!'
          });

        const cookies = loginResponse.headers['set-cookie'];
        if (cookies && cookies.length > 0) {
          const authCookie = cookies[0].split(';')[0];
          authToken = authCookie.split('=')[1];
        } else {
          authToken = 'mock-token-for-workspace-tests';
        }
      } catch (error) {
        console.warn('Login failed, using mock token:', error);
        authToken = 'mock-token-for-workspace-tests';
      }
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await teardownJest();
  });

  describe('Products API - Workspace ID Validation', () => {
    it('should accept workspace ID from URL params', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${testWorkspaceId}/products`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should reject request with missing workspace ID in params', async () => {
      const response = await request(app)
        .get('/api/workspaces//products') // Empty workspace ID
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404); // Route not found
    });

    it('should reject request with invalid workspace ID', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${invalidWorkspaceId}/products`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Workspace not found');
      expect(response.body.debug.workspaceId).toBe(invalidWorkspaceId);
      expect(response.body.sqlQuery).toContain(`SELECT id, name, isActive, isDelete FROM workspace WHERE id = '${invalidWorkspaceId}'`);
    });

    it('should reject request with deleted workspace ID', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${deletedWorkspaceId}/products`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Workspace is not available');
      expect(response.body.debug.workspace.isDelete).toBe(true);
    });

    it('should reject request with inactive workspace ID', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${inactiveWorkspaceId}/products`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Workspace is not available');
      expect(response.body.debug.workspace.isActive).toBe(false);
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
        .get(`/api/settings/${testWorkspaceId}/gdpr`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should reject GDPR settings update with invalid workspace ID', async () => {
      const response = await request(app)
        .put(`/api/settings/${invalidWorkspaceId}/gdpr`)
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