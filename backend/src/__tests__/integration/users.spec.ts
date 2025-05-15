import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { setupTestAuth } from '../unit/helpers/auth';
import { generateTestUser, mockAdminUser } from './mock/mockUsers';
import { mockWorkspaceWithUser } from './mock/mockWorkspaces';
import { prisma, setupJest, teardownJest } from './setup';

describe('Users API Integration Tests', () => {
  // Test data
  const testUser = {
    ...mockAdminUser,
    email: `users-test-user-${mockAdminUser.email.split('@')[0].split('-').pop()}@example.com`
  };
  
  let userId: string;
  let authToken: string;
  let workspaceId: string;
  
  beforeAll(async () => {
    try {
      // Set up test environment
      await setupJest();
      
      // Check if user already exists to avoid duplicate errors
      const existingUser = await prisma.user.findUnique({
        where: { email: testUser.email }
      });
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Register user via API to test the registration process
        const registerData = {
          email: testUser.email,
          password: testUser.password,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          gdprAccepted: true
        };
        
        const registerResponse = await request(app)
          .post('/api/auth/register')
          .send(registerData);
        
        if (registerResponse.status === 201) {
          userId = registerResponse.body.userId;
        } else if (registerResponse.status === 409) {
          // User already exists, find by email
          const user = await prisma.user.findUnique({
            where: { email: testUser.email }
          });
          if (user) {
            userId = user.id;
          } else {
            throw new Error(`Unexpected registration response: ${registerResponse.status}`);
          }
        }
      }
      
      // Create a test workspace using the mock
      const workspaceData = mockWorkspaceWithUser(userId);
      const workspace = await prisma.workspace.create({
        data: {
          name: workspaceData.name,
          slug: workspaceData.slug,
          users: workspaceData.users
        }
      });
      
      workspaceId = workspace.id;
      
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
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
  
  describe('GET /api/users', () => {
    it('should return a list of users for an authenticated admin', async () => {
      const response = await setupTestAuth(
        request(app).get('/api/users'),
        { token: authToken, workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
  
  describe('GET /api/users/me', () => {
    it('should return the current user', async () => {
      const response = await setupTestAuth(
        request(app).get('/api/users/me'),
        { token: authToken, workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe(testUser.email);
    });
    
    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      // Utilizziamo i mock per generare un nuovo utente
      const newUser = generateTestUser('NewTest');
      
      const response = await setupTestAuth(
        request(app).post('/api/users'),
        { token: authToken, workspaceId }
      ).send(newUser);
      
      expect(response.status).toBe(201);
      expect(response.body.id).toBeTruthy();
      expect(response.body.email).toBe(newUser.email);
      
      const newUserId = response.body.id;
      
      // Clean up the newly created user
      if (newUserId) {
        await prisma.user.delete({
          where: { id: newUserId }
        }).catch(e => console.log('Failed to clean up test user:', e));
      }
    });
  });
}); 