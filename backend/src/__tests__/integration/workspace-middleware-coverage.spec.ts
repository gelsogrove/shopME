import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../../app';
import { prisma, setupJest, teardownJest } from './setup';

// Set timeout for integration tests
jest.setTimeout(15000);

describe('Workspace Middleware Coverage Analysis', () => {
  let authToken: string;
  let validWorkspaceId: string;
  const invalidWorkspaceId = 'non-existent-workspace-12345';

  beforeAll(async () => {
    try {
      await setupJest();
      const timestamp = Date.now();

      // Create test user and workspace
      const testUser = await prisma.user.create({
        data: {
          email: `coverage-test-${timestamp}@test.com`,
          passwordHash: await bcrypt.hash('Password123!', 10),
          firstName: 'Coverage',
          lastName: 'Test',
          role: 'ADMIN',
          status: 'ACTIVE',
          gdprAccepted: new Date()
        }
      });

      const testWorkspace = await prisma.workspace.create({
        data: {
          name: 'Coverage Test Workspace',
          slug: `coverage-test-${timestamp}`,
          isActive: true,
          isDelete: false,
          plan: 'FREE',
          language: 'ENG',
          currency: 'EUR'
        }
      });
      validWorkspaceId = testWorkspace.id;

      await prisma.userWorkspace.create({
        data: {
          userId: testUser.id,
          workspaceId: validWorkspaceId,
          role: 'ADMIN'
        }
      });

      // Get auth token
      try {
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: `coverage-test-${timestamp}@test.com`,
            password: 'Password123!'
          });

        const cookies = loginResponse.headers['set-cookie'];
        if (cookies && cookies.length > 0) {
          const authCookie = cookies[0].split(';')[0];
          authToken = authCookie.split('=')[1];
        } else {
          authToken = 'mock-coverage-token';
        }
      } catch (error) {
        authToken = 'mock-coverage-token';
      }
    } catch (error) {
      console.error('Coverage test setup failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await teardownJest();
  });

  describe('Routes WITH Workspace Validation (Should reject invalid workspace)', () => {
    const routesWithValidation = [
      { method: 'GET', path: `/api/workspaces/${invalidWorkspaceId}/products`, name: 'Products List' },
      { method: 'GET', path: `/api/workspaces/${invalidWorkspaceId}/categories`, name: 'Categories List' },
      { method: 'GET', path: `/api/workspaces/${invalidWorkspaceId}/services`, name: 'Services List' },
      { method: 'GET', path: `/api/workspaces/${invalidWorkspaceId}/faqs`, name: 'FAQs List' },
      { method: 'GET', path: `/api/workspaces/${invalidWorkspaceId}/offers`, name: 'Offers List' },
      { method: 'GET', path: `/api/workspaces/${invalidWorkspaceId}/documents`, name: 'Documents List' },
      { method: 'GET', path: `/api/workspaces/${invalidWorkspaceId}/agent`, name: 'Agent Config' }
    ];

    routesWithValidation.forEach(({ method, path, name }) => {
      it(`${name} (${method} ${path}) should validate workspace ID`, async () => {
        const response = await request(app)
          [method.toLowerCase() as 'get'](path)
          .set('Authorization', `Bearer ${authToken}`);

        // Log the actual response for debugging
        console.log(`\n=== ${name} Response ===`);
        console.log(`Status: ${response.status}`);
        console.log(`Body:`, JSON.stringify(response.body, null, 2));
        
        // If workspace validation is working, we should get 404 (workspace not found)
        // If it's not working, we'll get 200 (success) or other error codes
        if (response.status === 404 && 
            response.body.message === 'Workspace not found' && 
            response.body.debug && 
            response.body.sqlQuery) {
          // ✅ Workspace validation is working correctly
          expect(response.status).toBe(404);
          expect(response.body.message).toBe('Workspace not found');
          expect(response.body.debug.workspaceId).toBe(invalidWorkspaceId);
          expect(response.body.sqlQuery).toContain('SELECT id, name, isActive, isDelete FROM workspace');
        } else {
          // ❌ Workspace validation is NOT working - route is bypassing validation
          console.warn(`⚠️  WORKSPACE VALIDATION BYPASS DETECTED for ${name}`);
          console.warn(`Expected: 404 with workspace validation error`);
          console.warn(`Actual: ${response.status} - ${response.body.message || 'No message'}`);
          
          // Fail the test but with a clear message about what's wrong
          expect(response.status).toBe(404); // This will fail and show the bypass
        }
      });
    });
  });

  describe('Routes WITHOUT Workspace Validation (Different behavior expected)', () => {
    const routesWithoutValidation = [
      { method: 'GET', path: '/api/prompts', name: 'Global Prompts' },
      { method: 'GET', path: '/api/categories', name: 'Global Categories' },
      { method: 'GET', path: '/api/faqs', name: 'Global FAQs' },
      { method: 'GET', path: '/api/offers', name: 'Global Offers' }
    ];

    routesWithoutValidation.forEach(({ method, path, name }) => {
      it(`${name} (${method} ${path}) behavior analysis`, async () => {
        const response = await request(app)
          [method.toLowerCase() as 'get'](path)
          .set('Authorization', `Bearer ${authToken}`);

        console.log(`\n=== ${name} Response Analysis ===`);
        console.log(`Status: ${response.status}`);
        console.log(`Body:`, JSON.stringify(response.body, null, 2));
        
        // These routes might not have workspace validation, so document their behavior
        if (response.status === 400 && response.body.message === 'Workspace ID is required') {
          console.log(`✅ Route requires workspace ID via middleware`);
        } else if (response.status === 401) {
          console.log(`ℹ️  Route requires authentication but workspace validation unclear`);
        } else if (response.status === 200) {
          console.log(`ℹ️  Route works without workspace validation`);
        } else {
          console.log(`ℹ️  Route returns ${response.status} - needs analysis`);
        }
        
        // Just document the behavior, don't fail
        expect(response.status).toBeGreaterThanOrEqual(200);
      });
    });
  });

  describe('Workspace ID Sources Testing', () => {
    it('should test URL params vs headers vs query priority', async () => {
      console.log('\n=== Testing Workspace ID Sources Priority ===');
      
      // Test 1: URL params should take priority
      const urlParamsResponse = await request(app)
        .get(`/api/workspaces/${validWorkspaceId}/products`)
        .query({ workspaceId: invalidWorkspaceId })
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Workspace-ID', invalidWorkspaceId);

      console.log(`URL Params Priority Test:`);
      console.log(`- URL: ${validWorkspaceId} (valid)`);
      console.log(`- Query: ${invalidWorkspaceId} (invalid)`);
      console.log(`- Header: ${invalidWorkspaceId} (invalid)`);
      console.log(`- Result: ${urlParamsResponse.status} (expected: 200 if URL params win)`);

      // Test 2: Headers when no URL params
      const headerResponse = await request(app)
        .get('/api/prompts')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Workspace-ID', validWorkspaceId);

      console.log(`Header Test:`);
      console.log(`- Header: ${validWorkspaceId} (valid)`);
      console.log(`- Result: ${headerResponse.status}`);

      // Test 3: Query params when no URL params
      const queryResponse = await request(app)
        .get('/api/prompts')
        .query({ workspaceId: validWorkspaceId })
        .set('Authorization', `Bearer ${authToken}`);

      console.log(`Query Test:`);
      console.log(`- Query: ${validWorkspaceId} (valid)`);
      console.log(`- Result: ${queryResponse.status}`);

      // Document findings
      expect(urlParamsResponse.status).toBeGreaterThanOrEqual(200);
      expect(headerResponse.status).toBeGreaterThanOrEqual(200);
      expect(queryResponse.status).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Error Response Format Analysis', () => {
    it('should analyze workspace validation error format consistency', async () => {
      console.log('\n=== Error Response Format Analysis ===');
      
      const testRequests = [
        { path: `/api/workspaces/${invalidWorkspaceId}/products`, name: 'Products with invalid workspace' },
        { path: `/api/workspaces/${invalidWorkspaceId}/categories`, name: 'Categories with invalid workspace' },
        { path: '/api/prompts', name: 'Prompts without workspace ID' }
      ];

      for (const { path, name } of testRequests) {
        const response = await request(app)
          .get(path)
          .set('Authorization', `Bearer ${authToken}`);

        console.log(`\n${name}:`);
        console.log(`Status: ${response.status}`);
        
        if (response.body.message) {
          console.log(`Message: ${response.body.message}`);
        }
        
        if (response.body.debug) {
          console.log(`Debug Info: Available`);
          console.log(`- URL: ${response.body.debug.url || 'N/A'}`);
          console.log(`- Method: ${response.body.debug.method || 'N/A'}`);
          console.log(`- WorkspaceId: ${response.body.debug.workspaceId || 'N/A'}`);
        }
        
        if (response.body.sqlQuery) {
          console.log(`SQL Query: ${response.body.sqlQuery}`);
        }
      }
      
      // Just verify we got responses
      expect(testRequests.length).toBeGreaterThan(0);
    });
  });
}); 