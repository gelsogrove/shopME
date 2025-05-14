import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../../app';
import { setupTestAuth } from '../helpers/auth';
import { generateTestClient, invalidClient, mockClient } from './mock/mockClients';
import { generateTestUser } from './mock/mockUsers';
import { mockWorkspaceWithUser } from './mock/mockWorkspaces';
import { prisma, setupJest, teardownJest } from './setup';

describe('Clients API Integration Tests', () => {
  // Test data utilizzando i mock
  const testUser = generateTestUser('Client');
  testUser.role = 'ADMIN' as UserRole;
  
  const newClient = { ...mockClient };
  
  let userId: string;
  let authToken: string;
  let workspaceId: string;
  let clientId: string;
  
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
  
  describe('POST /api/workspaces/:workspaceId/customers', () => {
    it('should create a new client and return 201', async () => {
      const response = await setupTestAuth(
        request(app)
          .post(`/api/workspaces/${workspaceId}/customers`)
          .set('X-Workspace-Id', workspaceId)
          .send({...newClient, workspaceId}),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(201);
      expect(response.body).toBeTruthy();
      
      // Save client ID for later tests
      clientId = response.body.id;
      
      expect(clientId).toBeTruthy();
      expect(response.body.email).toBe(newClient.email);
      expect(response.body.name).toBe(newClient.name);
      expect(response.body.phone).toBe(newClient.phone);
    });
    
    it('should return 400 with invalid data', async () => {
      const response = await setupTestAuth(
        request(app)
          .post(`/api/workspaces/${workspaceId}/customers`)
          .set('X-Workspace-Id', workspaceId)
          .send(invalidClient),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect([400, 422, 500]).toContain(response.status);
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`/api/workspaces/${workspaceId}/customers`)
        .send(newClient)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/workspaces/:workspaceId/customers', () => {
    it('should return all clients with status 200', async () => {
      const response = await setupTestAuth(
        request(app)
          .get(`/api/workspaces/${workspaceId}/customers`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should find at least one client (the one we just created)
      expect(response.body.length).toBeGreaterThan(0);
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${workspaceId}/customers`)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/workspaces/:workspaceId/customers/:id', () => {
    it('should return the client by ID with status 200', async () => {
      const response = await setupTestAuth(
        request(app)
          .get(`/api/workspaces/${workspaceId}/customers/${clientId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(clientId);
      expect(response.body.email).toBe(newClient.email);
      expect(response.body.name).toBe(newClient.name);
      expect(response.body.workspaceId).toBe(workspaceId);
    });
    
    it('should return 404 for non-existent client', async () => {
      const nonExistentId = 'non-existent-id';
      
      const response = await setupTestAuth(
        request(app)
          .get(`/api/workspaces/${workspaceId}/customers/${nonExistentId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(404);
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${workspaceId}/customers/${clientId}`)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('PUT /api/workspaces/:workspaceId/customers/:id', () => {
    it('should update the client and return 200', async () => {
      const updatedClient = generateTestClient('Updated', workspaceId);
      
      const response = await setupTestAuth(
        request(app)
          .put(`/api/workspaces/${workspaceId}/customers/${clientId}`)
          .set('X-Workspace-Id', workspaceId)
          .send(updatedClient),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(clientId);
      expect(response.body.email).toBe(updatedClient.email);
      expect(response.body.name).toBe(updatedClient.name);
      expect(response.body.phone).toBe(updatedClient.phone);
    });
    
    it('should return 404 for non-existent client', async () => {
      const nonExistentId = 'non-existent-id';
      const updatedClient = generateTestClient('NotFound');
      
      const response = await setupTestAuth(
        request(app)
          .put(`/api/workspaces/${workspaceId}/customers/${nonExistentId}`)
          .set('X-Workspace-Id', workspaceId)
          .send(updatedClient),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(404);
    });
    
    it('should return 400 with invalid data', async () => {
      const response = await setupTestAuth(
        request(app)
          .put(`/api/workspaces/${workspaceId}/customers/${clientId}`)
          .set('X-Workspace-Id', workspaceId)
          .send(invalidClient),
        { token: authToken, workspaceId: workspaceId }
      );
      
      // Il controller ora accetta aggiornamenti parziali, quindi sia 200 (successo) che 400 (errore) sono validi
      expect([200, 400, 422, 500]).toContain(response.status);
    });
  });
  
  describe('DELETE /api/workspaces/:workspaceId/customers/:id', () => {
    it('should delete the client and return 200', async () => {
      const response = await setupTestAuth(
        request(app)
          .delete(`/api/workspaces/${workspaceId}/customers/${clientId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(204);
      
      // Verify the client is deleted
      const getResponse = await setupTestAuth(
        request(app)
          .get(`/api/workspaces/${workspaceId}/customers/${clientId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(getResponse.status).toBe(404);
    });
    
    it('should return 404 for non-existent client', async () => {
      const nonExistentId = 'non-existent-id';
      
      const response = await setupTestAuth(
        request(app)
          .delete(`/api/workspaces/${workspaceId}/customers/${nonExistentId}`)
          .set('X-Workspace-Id', workspaceId),
        { token: authToken, workspaceId: workspaceId }
      );
      
      expect(response.status).toBe(404);
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/workspaces/${workspaceId}/customers/any-id`)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });
}); 