import request from 'supertest';
import { app } from '../../../index';
import { prisma } from '../../../lib/prisma';
import { PlanType } from '../../../utils/planLimits';

describe('Product Controller Plan Limits Integration', () => {
  let authToken: string;
  let workspaceId: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test-plan-limits@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        isActive: true
      }
    });
    userId = user.id;

    // Create test workspace with FREE plan
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        slug: 'test-workspace-plan-limits',
        plan: PlanType.FREE
      }
    });
    workspaceId = workspace.id;

    // Create user-workspace relationship
    await prisma.userWorkspace.create({
      data: {
        userId: userId,
        workspaceId: workspaceId,
        role: 'OWNER'
      }
    });

    // Mock authentication token
    authToken = 'mock-auth-token';
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.products.deleteMany({
      where: { workspaceId }
    });
    await prisma.userWorkspace.deleteMany({
      where: { workspaceId }
    });
    await prisma.workspace.delete({
      where: { id: workspaceId }
    });
    await prisma.user.delete({
      where: { id: userId }
    });
  });

  beforeEach(async () => {
    // Clean up products before each test
    await prisma.products.deleteMany({
      where: { workspaceId }
    });
  });

  describe('FREE Plan Product Limits', () => {
    it('should allow creating products when under the limit (3)', async () => {
      // Create first product
      const response1 = await request(app)
        .post(`/api/workspaces/${workspaceId}/products`)
        .set('x-test-auth', 'true')
        .set('x-workspace-id', workspaceId)
        .send({
          name: 'Test Product 1',
          description: 'Test description',
          price: 10.99,
          workspaceId
        });

      expect(response1.status).toBe(201);
      expect(response1.body.name).toBe('Test Product 1');

      // Create second product
      const response2 = await request(app)
        .post(`/api/workspaces/${workspaceId}/products`)
        .set('x-test-auth', 'true')
        .set('x-workspace-id', workspaceId)
        .send({
          name: 'Test Product 2',
          description: 'Test description',
          price: 15.99,
          workspaceId
        });

      expect(response2.status).toBe(201);
      expect(response2.body.name).toBe('Test Product 2');

      // Create third product (should still be allowed)
      const response3 = await request(app)
        .post(`/api/workspaces/${workspaceId}/products`)
        .set('x-test-auth', 'true')
        .set('x-workspace-id', workspaceId)
        .send({
          name: 'Test Product 3',
          description: 'Test description',
          price: 20.99,
          workspaceId
        });

      expect(response3.status).toBe(201);
      expect(response3.body.name).toBe('Test Product 3');
    });

    it('should reject creating a 4th product (exceeds FREE plan limit)', async () => {
      // Create 3 products first
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post(`/api/workspaces/${workspaceId}/products`)
          .set('x-test-auth', 'true')
          .set('x-workspace-id', workspaceId)
          .send({
            name: `Test Product ${i}`,
            description: 'Test description',
            price: 10.99,
            workspaceId
          });
      }

      // Try to create 4th product (should fail)
      const response = await request(app)
        .post(`/api/workspaces/${workspaceId}/products`)
        .set('x-test-auth', 'true')
        .set('x-workspace-id', workspaceId)
        .send({
          name: 'Test Product 4',
          description: 'Test description',
          price: 25.99,
          workspaceId
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Plan limit reached');
      expect(response.body.error).toContain('FREE plan');
      expect(response.body.error).toContain('3 products');
      expect(response.body.error).toContain('upgrade');
    });

    it('should not count inactive products towards the limit', async () => {
      // Create 3 active products
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post(`/api/workspaces/${workspaceId}/products`)
          .set('x-test-auth', 'true')
          .set('x-workspace-id', workspaceId)
          .send({
            name: `Test Product ${i}`,
            description: 'Test description',
            price: 10.99,
            workspaceId
          });
      }

      // Create an inactive product directly in database
      await prisma.products.create({
        data: {
          name: 'Inactive Product',
          description: 'Test description',
          price: 10.99,
          workspaceId,
          slug: 'inactive-product-test',
          isActive: false
        }
      });

      // Should still be able to create another active product since inactive ones don't count
      const response = await request(app)
        .post(`/api/workspaces/${workspaceId}/products`)
        .set('x-test-auth', 'true')
        .set('x-workspace-id', workspaceId)
        .send({
          name: 'Test Product 4',
          description: 'Test description',
          price: 25.99,
          workspaceId
        });

      expect(response.status).toBe(403); // Should still fail because we have 3 active products
    });
  });

  describe('BASIC Plan Product Limits', () => {
    beforeEach(async () => {
      // Update workspace to BASIC plan
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { plan: PlanType.BASIC }
      });
    });

    it('should allow creating up to 5 products for BASIC plan', async () => {
      // Create 5 products
      for (let i = 1; i <= 5; i++) {
        const response = await request(app)
          .post(`/api/workspaces/${workspaceId}/products`)
          .set('x-test-auth', 'true')
          .set('x-workspace-id', workspaceId)
          .send({
            name: `Test Product ${i}`,
            description: 'Test description',
            price: 10.99,
            workspaceId
          });

        expect(response.status).toBe(201);
      }

      // 6th product should fail
      const response = await request(app)
        .post(`/api/workspaces/${workspaceId}/products`)
        .set('x-test-auth', 'true')
        .set('x-workspace-id', workspaceId)
        .send({
          name: 'Test Product 6',
          description: 'Test description',
          price: 10.99,
          workspaceId
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('BASIC plan');
      expect(response.body.error).toContain('5 products');
    });
  });

  describe('PROFESSIONAL Plan Product Limits', () => {
    beforeEach(async () => {
      // Update workspace to PROFESSIONAL plan
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { plan: PlanType.PROFESSIONAL }
      });
    });

    it('should allow up to 100 products for PROFESSIONAL plan', async () => {
      // Create products up to the limit
      for (let i = 1; i <= 5; i++) {
        const response = await request(app)
          .post(`/api/workspaces/${workspaceId}/products`)
          .set('x-test-auth', 'true')
          .set('x-workspace-id', workspaceId)
          .send({
            name: `Test Product ${i}`,
            description: 'Test description',
            price: 10.99,
            workspaceId
          });

        expect(response.status).toBe(201);
      }
    });
  });
}); 