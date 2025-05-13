import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { UserRole } from '@prisma/client';
import request from 'supertest';
import app from '../../app';
import { prisma, setupJest, teardownJest } from './test-setup';

// Determiniamo se il database è disponibile
let databaseAvailable = false;

describe('User API Integration Tests', () => {
  // Test user data
  const timestamp = Date.now();
  const testUser = {
    email: `test-api-user-${timestamp}@example.com`,
    password: 'StrongPassword123!',
    firstName: 'Test',
    lastName: 'ApiUser',
    role: 'MEMBER',
    gdprAccepted: true
  };
  
  let userId: string;
  let authToken: string;
  let workspaceId: string;
  
  // Set timeout for tests
  beforeAll(async () => {
    jest.setTimeout(30000);
    
    try {
      // Setup database and seed
      const setupResult = await setupJest();
      databaseAvailable = true;
      
      // Setup test workspace
      const workspace = await prisma.workspace.create({
        data: {
          name: 'Test Workspace for API',
          slug: `test-workspace-api-${timestamp}`,
          language: 'en',
          currency: 'EUR',
          isActive: true,
          url: 'http://localhost:3000'
        }
      });
      workspaceId = workspace.id;
      
      // Register test user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          gdprAccepted: testUser.gdprAccepted
        });
      
      // Handle both new user and existing user cases
      if (registerResponse.status === 201) {
        userId = registerResponse.body.userId;
      } else if (registerResponse.status === 409) {
        // User already exists, fetch ID from database
        const existingUser = await prisma.user.findUnique({
          where: { email: testUser.email }
        });
        userId = existingUser.id;
      } else {
        throw new Error(`Unexpected registration response: ${registerResponse.status}`);
      }
      
      // Ensure we have a valid user ID
      if (!userId) {
        throw new Error('Failed to get valid user ID');
      }
      
      // Attempt to create user-workspace relationship
      try {
        // Verifichiamo se l'utente esiste effettivamente nel DB
        const userInDb = await prisma.user.findUnique({
          where: { 
            id: userId 
          }
        });
        
        if (!userInDb) {
          // Non possiamo creare l'associazione, ma possiamo continuare i test senza lanciare errori
        } else {
          // Verifichiamo se l'associazione esiste già
          const existingAssociation = await prisma.userWorkspace.findFirst({
            where: {
              userId: userId,
              workspaceId: workspaceId
            }
          });
          
          if (!existingAssociation) {
            // Creiamo l'associazione
            await prisma.userWorkspace.create({
              data: {
                userId: userId,
                workspaceId: workspaceId,
                role: 'ADMIN' as UserRole
              }
            });
          }
        }
      } catch (error) {
        // Non lanciamo l'errore per consentire ai test di continuare
      }
      
      // Login to get auth token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(loginResponse.status).toBe(200);
      
      // Extract token from cookies
      const cookieHeader = loginResponse.headers['set-cookie'];
      if (!cookieHeader || cookieHeader.length === 0) {
        throw new Error('No cookie headers in login response');
      }
      
      const tokenMatch = cookieHeader[0].match(/auth_token=([^;]+)/);
      authToken = tokenMatch ? tokenMatch[1] : '';
      
      if (!authToken) {
        throw new Error('Auth token not found in cookie');
      }
    } catch (error) {
      throw error;
    }
  });
  
  afterAll(async () => {
    await teardownJest();
  });
  
  describe('User API Endpoints', () => {
    describe('GET /api/users', () => {
      it('should retrieve users list', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Cookie', [`auth_token=${authToken}`])
          .set('X-Workspace-Id', workspaceId);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
      
      it('should retrieve a specific user by ID', async () => {
        const response = await request(app)
          .get(`/api/users/${userId}`)
          .set('Cookie', [`auth_token=${authToken}`])
          .set('X-Workspace-Id', workspaceId);
        
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(userId);
        expect(response.body.email).toBe(testUser.email);
      });
      
      it('should return 404 for non-existent user', async () => {
        const response = await request(app)
          .get('/api/users/nonexistent-id')
          .set('Cookie', [`auth_token=${authToken}`])
          .set('X-Workspace-Id', workspaceId);
        
        expect(response.status).toBe(404);
      });
    });
    
    describe('POST /api/users', () => {
      const newUserEmail = `new-user-${timestamp}@example.com`;
      const newUser = {
        email: newUserEmail,
        password: 'NewUserPassword123!',
        firstName: 'New',
        lastName: 'User',
        role: 'MEMBER'
      };
      
      let newUserId: string;
      
      it('should create a new user', async () => {
        const response = await request(app)
          .post('/api/users')
          .set('Cookie', [`auth_token=${authToken}`])
          .set('X-Workspace-Id', workspaceId)
          .send(newUser);
        
        expect(response.status).toBe(201);
        expect(response.body.id).toBeTruthy();
        expect(response.body.email).toBe(newUser.email);
        
        newUserId = response.body.id;
      });
      
      afterAll(async () => {
        // Clean up created test user
        if (newUserId) {
          await prisma.user.delete({
            where: { id: newUserId }
          }).catch(err => {});
        }
      });
    });
  });
}); 