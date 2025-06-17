import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { app } from '../../../index';

const prisma = new PrismaClient();

describe('TASK 3: Customer Chatbot Control API Integration Tests', () => {
  let workspaceId: string;
  let customerId: string;
  let authToken: string;

  beforeAll(async () => {
    // Setup test data
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        plan: 'FREE',
        isActive: true,
        isDelete: false
      }
    });
    workspaceId = workspace.id;

    const customer = await prisma.customers.create({
      data: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+1234567890',
        workspaceId: workspaceId,
        activeChatbot: true,
        isActive: true
      }
    });
    customerId = customer.id;

    // Create test user and get auth token
    const user = await prisma.user.create({
      data: {
        email: 'operator@test.com',
        password: 'hashedpassword',
        name: 'Test Operator'
      }
    });

    // Create user workspace association
    await prisma.userWorkspace.create({
      data: {
        userId: user.id,
        workspaceId: workspaceId,
        role: 'OWNER'
      }
    });

    // Mock auth token (in real scenario, this would come from login)
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.customers.deleteMany({ where: { workspaceId } });
    await prisma.userWorkspace.deleteMany({ where: { workspaceId } });
    await prisma.workspace.delete({ where: { id: workspaceId } });
    await prisma.user.deleteMany({ where: { email: 'operator@test.com' } });
    await prisma.$disconnect();
  });

  describe('PUT /api/workspaces/:workspaceId/customers/:customerId/chatbot-control', () => {
    it('should successfully deactivate chatbot control', async () => {
      const response = await request(app)
        .put(`/api/workspaces/${workspaceId}/customers/${customerId}/chatbot-control`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          activeChatbot: false,
          reason: 'Customer needs human assistance'
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        customer: {
          id: customerId,
          name: 'Test Customer',
          phone: '+1234567890',
          activeChatbot: false
        },
        change: {
          previousState: true,
          newState: false,
          reason: 'Customer needs human assistance',
          changedAt: expect.any(String),
          changedBy: expect.any(String)
        },
        message: 'Chatbot control deactivated - Manual operator control active'
      });

      // Verify database was updated
      const updatedCustomer = await prisma.customers.findUnique({
        where: { id: customerId }
      });
      expect(updatedCustomer?.activeChatbot).toBe(false);
    });

    it('should successfully reactivate chatbot control', async () => {
      const response = await request(app)
        .put(`/api/workspaces/${workspaceId}/customers/${customerId}/chatbot-control`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          activeChatbot: true,
          reason: 'Issue resolved, returning to AI'
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        customer: {
          activeChatbot: true
        },
        change: {
          previousState: false,
          newState: true,
          reason: 'Issue resolved, returning to AI'
        },
        message: 'Chatbot control activated - AI will handle messages'
      });

      // Verify database was updated
      const updatedCustomer = await prisma.customers.findUnique({
        where: { id: customerId }
      });
      expect(updatedCustomer?.activeChatbot).toBe(true);
    });

    it('should handle missing reason gracefully', async () => {
      const response = await request(app)
        .put(`/api/workspaces/${workspaceId}/customers/${customerId}/chatbot-control`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          activeChatbot: false
        });

      expect(response.status).toBe(200);
      expect(response.body.change.reason).toBeNull();
    });

    it('should return 400 for invalid activeChatbot value', async () => {
      const response = await request(app)
        .put(`/api/workspaces/${workspaceId}/customers/${customerId}/chatbot-control`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          activeChatbot: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'activeChatbot must be a boolean value'
      });
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .put(`/api/workspaces/${workspaceId}/customers/non-existent-id/chatbot-control`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          activeChatbot: true
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'Customer not found'
      });
    });

    it('should return 404 for customer in different workspace', async () => {
      // Create customer in different workspace
      const otherWorkspace = await prisma.workspace.create({
        data: {
          name: 'Other Workspace',
          plan: 'FREE',
          isActive: true,
          isDelete: false
        }
      });

      const otherCustomer = await prisma.customers.create({
        data: {
          name: 'Other Customer',
          email: 'other@example.com',
          phone: '+9876543210',
          workspaceId: otherWorkspace.id,
          activeChatbot: true,
          isActive: true
        }
      });

      const response = await request(app)
        .put(`/api/workspaces/${workspaceId}/customers/${otherCustomer.id}/chatbot-control`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          activeChatbot: false
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'Customer not found'
      });

      // Cleanup
      await prisma.customers.delete({ where: { id: otherCustomer.id } });
      await prisma.workspace.delete({ where: { id: otherWorkspace.id } });
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/workspaces/${workspaceId}/customers/${customerId}/chatbot-control`)
        .send({
          activeChatbot: false
        });

      expect(response.status).toBe(401);
    });
  });
}); 