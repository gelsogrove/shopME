import request from 'supertest'
import app from '../app'

jest.mock('../lib/prisma', () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn()
  }
}))

const workspaceId = 'test-workspace-id'
const mockAuthToken = 'mocked-auth-token'
const mockUserId = 'test-user-id'

// Mock dei middleware di autenticazione
jest.mock('../middlewares/auth.middleware', () => ({
  authMiddleware: (_req: any, _res: any, next: () => void) => {
    next()
  }
}))

describe('API Endpoints Structure Test', () => {
  
  describe('GET endpoints', () => {
    
    const endpointsToTest = [
      `/api/chat/recent`,
      `/api/workspaces`,
      `/api/workspaces/${workspaceId}/services`,
      `/api/workspaces/${workspaceId}/faqs`,
      `/api/workspaces/${workspaceId}/events`,
      `/api/workspaces/${workspaceId}/products`,
      `/api/workspaces/${workspaceId}/categories`,
      `/api/api`,
      `/api/workspaces/${workspaceId}/suppliers`,
      `/api/workspaces/${workspaceId}/suppliers/active`,
      `/api/settings`,
      `/api/whatsapp-settings/${workspaceId}/gdpr`,
      `/api/agent/configurations`,
      `/api/workspaces/${workspaceId}/agent/configurations`,
      `/api/chat/histories`,
      `/api/auth/me`,
      `/api/users/me`,
      `/api/users/profile`,
    ]
    
    test.each(endpointsToTest)('Endpoint %s should be registered', async (endpoint) => {
      // Mock authorization header to avoid auth problems
      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('Cookie', [`auth_token=${mockAuthToken}`])

      // We don't care about the response content, just that the route exists
      // 404 means route not found, any other status means the route exists
      expect(response.status).not.toBe(404)
    })
  })

  describe('POST endpoints', () => {
    
    const endpointsToTest = [
      // POST endpoints for resource creation
      `/api/workspaces/${workspaceId}/services`,
      `/api/workspaces/${workspaceId}/faqs`,
      `/api/workspaces/${workspaceId}/events`,
      `/api/workspaces/${workspaceId}/products`,
      `/api/workspaces/${workspaceId}/categories`,
      `/api/api/offers`,
      `/api/workspaces/${workspaceId}/suppliers`,
      `/api/whatsapp-settings/${workspaceId}/gdpr`,
      `/api/agent/configurations`,
      `/api/workspaces/${workspaceId}/agent/configurations`,
      `/api/auth/logout`,
      `/api/users/profile`,
    ]
    
    test.each(endpointsToTest)('POST to %s should be registered', async (endpoint) => {
      // Mock authorization header to avoid auth problems
      const response = await request(app)
        .post(endpoint)
        .send({ name: 'Test resource', description: 'Test description' })
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('Cookie', [`auth_token=${mockAuthToken}`])

      // We don't care about the response content, just that the route exists
      expect(response.status).not.toBe(404)
    })
  })

  describe('PUT endpoints', () => {
    
    const resourceId = 'test-resource-id'
    const endpointsToTest = [
      // PUT endpoints for resource updates
      `/api/workspaces/${workspaceId}/services/${resourceId}`,
      `/api/workspaces/${workspaceId}/faqs/${resourceId}`,
      `/api/workspaces/${workspaceId}/events/${resourceId}`,
      `/api/workspaces/${workspaceId}/products/${resourceId}`,
      `/api/workspaces/${workspaceId}/categories/${resourceId}`,
      `/api/api/offers/${resourceId}`,
      `/api/workspaces/${workspaceId}/suppliers/${resourceId}`,
      `/api/settings/${resourceId}`,
      `/api/whatsapp-settings/${workspaceId}/gdpr`,
      `/api/agent/configurations/${resourceId}`,
      `/api/workspaces/${workspaceId}/agent/configurations/${resourceId}`,
      `/api/users/profile`,
    ]
    
    test.each(endpointsToTest)('PUT to %s should be registered', async (endpoint) => {
      // Mock authorization header to avoid auth problems
      const response = await request(app)
        .put(endpoint)
        .send({ name: 'Updated resource', description: 'Updated description' })
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('Cookie', [`auth_token=${mockAuthToken}`])

      // We don't care about the response content, just that the route exists
      expect(response.status).not.toBe(404)
    })
  })

  describe('DELETE endpoints', () => {
    
    const resourceId = 'test-resource-id'
    const endpointsToTest = [
      // DELETE endpoints for resource removal
      `/api/workspaces/${workspaceId}/services/${resourceId}`,
      `/api/workspaces/${workspaceId}/faqs/${resourceId}`,
      `/api/workspaces/${workspaceId}/events/${resourceId}`,
      `/api/workspaces/${workspaceId}/products/${resourceId}`,
      `/api/workspaces/${workspaceId}/categories/${resourceId}`,
      `/api/api/offers/${resourceId}`,
      `/api/workspaces/${workspaceId}/suppliers/${resourceId}`,
      `/api/agent/configurations/${resourceId}`,
      `/api/workspaces/${workspaceId}/agent/configurations/${resourceId}`,
    ]
    
    test.each(endpointsToTest)('DELETE to %s should be registered', async (endpoint) => {
      // Mock authorization header to avoid auth problems
      const response = await request(app)
        .delete(endpoint)
        .set('Authorization', `Bearer ${mockAuthToken}`)
        .set('Cookie', [`auth_token=${mockAuthToken}`])

      // We don't care about the response content, just that the route exists
      expect(response.status).not.toBe(404)
    })
  })
}) 