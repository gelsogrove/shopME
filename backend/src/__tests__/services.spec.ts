import request from 'supertest';
import app from '../app';

// Mock Prisma
jest.mock('../lib/prisma', () => {
  const mockServices: any[] = [];
  return {
    prisma: {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      services: {
        findMany: jest.fn().mockResolvedValue(mockServices),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((data) => data.data),
        update: jest.fn().mockImplementation((data) => ({ id: 'test-id', ...data.data })),
        delete: jest.fn(),
      }
    }
  };
})

// Mock auth middleware
jest.mock('../interfaces/http/middlewares/auth.middleware', () => ({
  authMiddleware: (_req: any, _res: any, next: () => void) => {
    next()
  }
}))

describe('Services API', () => {
  const workspaceId = 'test-workspace-id'
  const mockAuthToken = 'mocked-auth-token'
  
  describe('Parameter handling', () => {
    test('Should extract workspaceId from URL path parameter', async () => {
      const response = await request(app)
        .get(`/api/workspaces/${workspaceId}/services`)
        .set('Authorization', `Bearer ${mockAuthToken}`)
      
      // Should not return the "Workspace ID is required" error
      expect(response.status).not.toBe(400)
      expect(response.body).not.toHaveProperty('error', 'Workspace ID is required')
    })

    test('Should extract workspaceId from query parameter', async () => {
      const response = await request(app)
        .get(`/api/services?workspaceId=${workspaceId}`)
        .set('Authorization', `Bearer ${mockAuthToken}`)
      
      // Should not return the "Workspace ID is required" error
      expect(response.status).not.toBe(400)
      expect(response.body).not.toHaveProperty('error', 'Workspace ID is required')
    })

    test('Should extract workspaceId from header', async () => {
      const response = await request(app)
        .get(`/api/services`)
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('X-Workspace-Id', workspaceId)  // Make sure to use capital X for header
      
      // Should not return the "Workspace ID is required" error
      expect(response.status).not.toBe(400)
      expect(response.body).not.toHaveProperty('error', 'Workspace ID is required')
    })

    test('Should fail with 400 if workspaceId is missing', async () => {
      const response = await request(app)
        .get(`/api/services`)
        .set('Authorization', `Bearer ${mockAuthToken}`)
      
      // Should return the "Workspace ID is required" error
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Workspace ID is required')
    })
  })
}) 