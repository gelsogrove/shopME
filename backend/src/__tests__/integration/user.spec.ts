import request from 'supertest';
import { prisma } from '../../../src/test-setup';
import app from './mock-app';

// Determiniamo se il database è disponibile
let databaseAvailable = false;

describe('User API Integration Tests', () => {
  // Test user data
  const testUser = {
    email: 'test-api-user@example.com',
    password: 'StrongPassword123!',
    firstName: 'Test',
    lastName: 'ApiUser',
    role: 'MEMBER'
  };
  
  let userId: string;
  let authToken: string;
  let workspaceId: string;
  
  // Set timeout for tests
  beforeAll(async () => {
    console.log('Starting User API tests');
    jest.setTimeout(30000);
    
    // Verifichiamo la connessione al DB
    try {
      await prisma.$connect();
      databaseAvailable = true;
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection failed, tests will be skipped:', error);
      databaseAvailable = false;
    }
  });
  
  // Cleanup
  afterAll(async () => {
    // Se il database è disponibile, eseguiamo la pulizia
    if (databaseAvailable) {
      try {
        console.log('Cleaning up test data...');
        
        if (workspaceId) {
          await prisma.workspace.delete({
            where: { id: workspaceId }
          }).catch(err => console.error('Error deleting workspace:', err));
        }
        
        if (userId) {
          await prisma.user.delete({
            where: { id: userId }
          }).catch(err => console.error('Error deleting user:', err));
        }
        
        console.log('Test cleanup completed successfully.');
      } catch (error) {
        console.error('Test cleanup error:', error);
      }
    }
    
    // Always disconnect
    await prisma.$disconnect();
  });
  
  // Conditional test - esegue i test solo se il database è disponibile
  (databaseAvailable ? describe : describe.skip)('User API Endpoints', () => {
    
    // Setup - create test user and get auth token
    beforeAll(async () => {
      try {
        console.log('Setting up test data...');
        
        // Clean up any existing test user
        await prisma.user.deleteMany({
          where: {
            email: testUser.email
          }
        });
        
        // Create a test workspace
        const workspace = await prisma.workspace.create({
          data: {
            name: 'Test Workspace',
            slug: `test-workspace-${Date.now()}`,
            language: 'ENG',
            currency: 'EUR'
          }
        });
        workspaceId = workspace.id;
        
        // Register a test user
        const registerResponse = await request(app)
          .post('/api/auth/register')
          .send(testUser);
        
        expect(registerResponse.status).toBe(201);
        userId = registerResponse.body.user.id;
        
        // Associate user with workspace
        await prisma.userWorkspace.create({
          data: {
            userId,
            workspaceId,
            role: 'ADMIN'
          }
        });
        
        // Login to get auth token
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          });
        
        expect(loginResponse.status).toBe(200);
        const cookieHeader = loginResponse.headers['set-cookie'][0];
        const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
        authToken = tokenMatch ? tokenMatch[1] : '';
        
        console.log('Test setup completed successfully.');
      } catch (error) {
        console.error('Test setup error:', error);
        throw error;
      }
    });
    
    describe('GET /api/users', () => {
      it('should retrieve users list', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Cookie', [`auth_token=${authToken}`])
          .set('X-Workspace-Id', workspaceId);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
      
      it('should retrieve a specific user by ID', async () => {
        const response = await request(app)
          .get(`/api/users/${userId}`)
          .set('Cookie', [`auth_token=${authToken}`])
          .set('X-Workspace-Id', workspaceId);
        
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(userId);
        expect(response.body.email).toBe(testUser.email);
        expect(response.body.firstName).toBe(testUser.firstName);
        expect(response.body.lastName).toBe(testUser.lastName);
        expect(response.body.passwordHash).toBeUndefined();
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
      const newUser = {
        email: `new-user-${Date.now()}@example.com`,
        password: 'NewUserPassword123!',
        firstName: 'New',
        lastName: 'User',
        role: 'MEMBER'
      };
      
      let newUserId: string;
      
      afterAll(async () => {
        // Clean up created test user
        if (newUserId) {
          await prisma.user.delete({
            where: { id: newUserId }
          }).catch(err => console.error('Error cleaning up new user:', err));
        }
      });
      
      it('should create a new user', async () => {
        const response = await request(app)
          .post('/api/users')
          .set('Cookie', [`auth_token=${authToken}`])
          .set('X-Workspace-Id', workspaceId)
          .send(newUser);
        
        expect(response.status).toBe(201);
        expect(response.body.id).toBeTruthy();
        expect(response.body.email).toBe(newUser.email);
        expect(response.body.firstName).toBe(newUser.firstName);
        expect(response.body.lastName).toBe(newUser.lastName);
        expect(response.body.password).toBeUndefined();
        
        newUserId = response.body.id;
      });
      
      it('should return 400 when creating user with invalid data', async () => {
        const response = await request(app)
          .post('/api/users')
          .set('Cookie', [`auth_token=${authToken}`])
          .set('X-Workspace-Id', workspaceId)
          .send({
            email: 'invalid-email',
            password: '123' // Too short
          });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBeTruthy();
      });
    });
    
    describe('PUT /api/users/:id', () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };
      
      it('should update user details', async () => {
        const response = await request(app)
          .put(`/api/users/${userId}`)
          .set('Cookie', [`auth_token=${authToken}`])
          .set('X-Workspace-Id', workspaceId)
          .send(updateData);
        
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(userId);
        expect(response.body.firstName).toBe(updateData.firstName);
        expect(response.body.lastName).toBe(updateData.lastName);
      });
      
      it('should return 404 when updating non-existent user', async () => {
        const response = await request(app)
          .put('/api/users/nonexistent-id')
          .set('Cookie', [`auth_token=${authToken}`])
          .set('X-Workspace-Id', workspaceId)
          .send(updateData);
        
        expect(response.status).toBe(404);
      });
    });
    
    describe('DELETE /api/users/:id', () => {
      let userToDeleteId: string;
      
      beforeAll(async () => {
        // Create a user to delete
        const userToDelete = {
          email: `delete-user-${Date.now()}@example.com`,
          password: 'DeleteUser123!',
          firstName: 'Delete',
          lastName: 'User',
          role: 'MEMBER'
        };
        
        const createResponse = await request(app)
          .post('/api/users')
          .set('Cookie', [`auth_token=${authToken}`])
          .set('X-Workspace-Id', workspaceId)
          .send(userToDelete);
        
        expect(createResponse.status).toBe(201);
        userToDeleteId = createResponse.body.id;
      });
      
      it('should delete a user', async () => {
        const response = await request(app)
          .delete(`/api/users/${userToDeleteId}`)
          .set('Cookie', [`auth_token=${authToken}`])
          .set('X-Workspace-Id', workspaceId);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        
        // Verify user is deleted
        const checkUserResponse = await request(app)
          .get(`/api/users/${userToDeleteId}`)
          .set('Cookie', [`auth_token=${authToken}`])
          .set('X-Workspace-Id', workspaceId);
        
        expect(checkUserResponse.status).toBe(404);
      });
      
      it('should return 404 when deleting non-existent user', async () => {
        const response = await request(app)
          .delete('/api/users/nonexistent-id')
          .set('Cookie', [`auth_token=${authToken}`])
          .set('X-Workspace-Id', workspaceId);
        
        expect(response.status).toBe(404);
      });
    });
  });
}); 