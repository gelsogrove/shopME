import request from 'supertest';
import app from '../../app';
import { setupTestAuth } from '../unit/helpers/auth';

describe('GDPR API Integration Tests', () => {
  // Test data
  const authToken = 'test-token';
  const workspaceId = 'test-workspace-id';
  const anotherWorkspaceId = 'another-workspace-id';

  describe('GET /api/gdpr/default', () => {
    it('should retrieve default GDPR content from the compatibility endpoint', async () => {
      const response = await setupTestAuth(
        request(app).get('/api/gdpr/default'),
        { useTestAuth: true, workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(response.body).toBeTruthy();
      expect(response.body.content).toBeTruthy();
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/gdpr/default')
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/settings/default-gdpr', () => {
    it('should retrieve default GDPR content', async () => {
      const response = await setupTestAuth(
        request(app).get('/api/settings/default-gdpr'),
        { useTestAuth: true, workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(response.body).toBeTruthy();
      expect(response.body.content).toBeTruthy();
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/settings/default-gdpr')
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/settings/:workspaceId/gdpr', () => {
    it('should retrieve GDPR content for a workspace', async () => {
      const response = await setupTestAuth(
        request(app).get(`/api/settings/${workspaceId}/gdpr`),
        { useTestAuth: true, workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(response.body).toBeTruthy();
    });

    it('should not allow access to GDPR content from another workspace', async () => {
      // Try to access another workspace's GDPR with authentication for workspaceId
      const response = await setupTestAuth(
        request(app).get(`/api/settings/${anotherWorkspaceId}/gdpr`),
        { useTestAuth: true, workspaceId } // Auth for first workspace
      );
      
      // Should be unauthorized or forbidden
      expect([401, 403]).toContain(response.status);
    });
    
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/settings/${workspaceId}/gdpr`)
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });

    it('should return 403 if workspaceId is not provided', async () => {
      const response = await setupTestAuth(
        request(app).get('/api/settings//gdpr'),
        { useTestAuth: true, workspaceId }
      );
      
      expect(response.status).toBe(403);
    });
  });
}); 