import request from 'supertest';
import app from '../../app';
import { prisma } from '../../lib/prisma';

describe('Calling Function Endpoints', () => {
  let workspaceId: string;
  let validToken: string;
  let expiredToken: string;
  let activeCategory: any;
  let productWithStock: any;
  let service: any;

  beforeAll(async () => {
    // Create test workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace CF',
        slug: 'test-workspace-cf'
      }
    });
    workspaceId = workspace.id;

    // Create valid token
    const tokenResult = await prisma.secureToken.create({
      data: {
        token: 'valid-token-123',
        type: 'calling_function',
        workspaceId,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      }
    });
    validToken = tokenResult.token;

    // Create expired token
    const expiredTokenResult = await prisma.secureToken.create({
      data: {
        token: 'expired-token-123',
        type: 'calling_function',
        workspaceId,
        expiresAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      }
    });
    expiredToken = expiredTokenResult.token;

    // Create test category
    activeCategory = await prisma.categories.create({
      data: {
        name: 'Active Category CF',
        slug: 'active-category-cf',
        isActive: true,
        workspaceId
      }
    });

    // Create test product
    productWithStock = await prisma.products.create({
      data: {
        name: 'Product CF Test',
        price: 19.99,
        stock: 5,
        isActive: true,
        slug: 'product-cf-test',
        categoryId: activeCategory.id,
        workspaceId
      }
    });

    // Create test service
    service = await prisma.services.create({
      data: {
        name: 'Service CF Test',
        description: 'Test service for CF',
        price: 100.00,
        duration: 60,
        isActive: true,
        workspaceId
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.products.deleteMany({ where: { workspaceId } });
    await prisma.services.deleteMany({ where: { workspaceId } });
    await prisma.categories.deleteMany({ where: { workspaceId } });
    await prisma.secureToken.deleteMany({ where: { workspaceId } });
    await prisma.workspace.delete({ where: { id: workspaceId } });
    await prisma.$disconnect();
  });

  describe('GET /api/cf/products', () => {
    it('should return products with valid token', async () => {
      const response = await request(app)
        .get('/api/cf/products')
        .query({ workspaceId })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBe(1);
      expect(response.body.products[0].id).toBe(productWithStock.id);
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/cf/products')
        .query({ workspaceId })
        .expect(401);
    });

    it('should return 403 with expired token', async () => {
      await request(app)
        .get('/api/cf/products')
        .query({ workspaceId })
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);
    });

    it('should return 400 without workspaceId', async () => {
      await request(app)
        .get('/api/cf/products')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400);
    });
  });

  describe('GET /api/cf/services', () => {
    it('should return services with valid token', async () => {
      const response = await request(app)
        .get('/api/cf/services')
        .query({ workspaceId })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBe(1);
      expect(response.body.services[0].id).toBe(service.id);
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/cf/services')
        .query({ workspaceId })
        .expect(401);
    });

    it('should return 403 with expired token', async () => {
      await request(app)
        .get('/api/cf/services')
        .query({ workspaceId })
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);
    });

    it('should return 400 without workspaceId', async () => {
      await request(app)
        .get('/api/cf/services')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400);
    });
  });

  describe('Token validation with query parameter', () => {
    it('should accept token via query parameter for products', async () => {
      const response = await request(app)
        .get('/api/cf/products')
        .query({ workspaceId, token: validToken })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should accept token via query parameter for services', async () => {
      const response = await request(app)
        .get('/api/cf/services')
        .query({ workspaceId, token: validToken })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});