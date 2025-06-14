import request from 'supertest';
import app from '../../app';
import { setupTestAuth } from '../unit/helpers/auth';

describe.skip('GDPR API Integration Tests', () => {
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

  describe('PUT /api/settings/:workspaceId/gdpr', () => {
    const testGdprContent = `
# Test GDPR Policy

## Privacy Policy
This is a test privacy policy for integration testing.

### Data Collection
We collect test data for testing purposes.

### Data Usage
Test data is used for testing only.

### Contact
For testing inquiries, contact test@example.com.
    `.trim();

    it('should successfully update GDPR content for a workspace', async () => {
      const response = await setupTestAuth(
        request(app)
          .put(`/api/settings/${workspaceId}/gdpr`)
          .send({ gdpr: testGdprContent }),
        { useTestAuth: true, workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(response.body).toBeTruthy();
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeTruthy();
      
      // Verify the response contains the updated GDPR content
      if (response.body.data.gdpr) {
        expect(response.body.data.gdpr).toBe(testGdprContent);
      }
      expect(response.body.data.workspaceId).toBe(workspaceId);
    });

    it('should handle very long GDPR content', async () => {
      const longContent = 'A'.repeat(5000); // 5KB of content
      
      const response = await setupTestAuth(
        request(app)
          .put(`/api/settings/${workspaceId}/gdpr`)
          .send({ gdpr: longContent }),
        { useTestAuth: true, workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeTruthy();
      
      if (response.body.data.gdpr) {
        expect(response.body.data.gdpr.length).toBe(5000);
      }
    });

    it('should handle empty GDPR content', async () => {
      const response = await setupTestAuth(
        request(app)
          .put(`/api/settings/${workspaceId}/gdpr`)
          .send({ gdpr: '' }),
        { useTestAuth: true, workspaceId }
      );
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 if GDPR content is missing', async () => {
      const response = await setupTestAuth(
        request(app)
          .put(`/api/settings/${workspaceId}/gdpr`)
          .send({}), // No gdpr field
        { useTestAuth: true, workspaceId }
      );
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('GDPR content is required');
    });

    it('should return 400 if workspaceId is missing', async () => {
      const response = await setupTestAuth(
        request(app)
          .put('/api/settings//gdpr')
          .send({ gdpr: testGdprContent }),
        { useTestAuth: true, workspaceId }
      );
      
      expect(response.status).toBe(400);
    });

    it('should not allow updating GDPR for another workspace', async () => {
      const response = await setupTestAuth(
        request(app)
          .put(`/api/settings/${anotherWorkspaceId}/gdpr`)
          .send({ gdpr: testGdprContent }),
        { useTestAuth: true, workspaceId } // Auth for first workspace
      );
      
      // Should be unauthorized or forbidden
      expect([401, 403]).toContain(response.status);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put(`/api/settings/${workspaceId}/gdpr`)
        .send({ gdpr: testGdprContent })
        .set('X-Test-Skip-Auth', 'true');
      
      expect(response.status).toBe(401);
    });

    it('should verify GDPR content persists after update', async () => {
      const uniqueContent = `Test GDPR content ${Date.now()}`;
      
      // First, update the GDPR content
      const updateResponse = await setupTestAuth(
        request(app)
          .put(`/api/settings/${workspaceId}/gdpr`)
          .send({ gdpr: uniqueContent }),
        { useTestAuth: true, workspaceId }
      );
      
      expect(updateResponse.status).toBe(200);
      
      // Then, retrieve it to verify it was saved
      const getResponse = await setupTestAuth(
        request(app).get(`/api/settings/${workspaceId}/gdpr`),
        { useTestAuth: true, workspaceId }
      );
      
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.content || getResponse.body.data?.gdpr).toBe(uniqueContent);
    });
  });
}); 