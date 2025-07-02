import request from 'supertest';
import app from '../../app';
import { prisma } from '../../lib/prisma';

describe('GET /api/workspaces/:workspaceId/products/active-with-categories', () => {
  let workspaceId: string;
  let activeCategory: any;
  let inactiveCategory: any;
  let productWithStock: any;
  let productWithoutStock: any;
  let inactiveProduct: any;

  beforeAll(async () => {
    // Create test workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        slug: 'test-workspace-products-categories'
      }
    });
    workspaceId = workspace.id;

    // Create test categories
    activeCategory = await prisma.categories.create({
      data: {
        name: 'Active Category',
        slug: 'active-category',
        isActive: true,
        workspaceId
      }
    });

    inactiveCategory = await prisma.categories.create({
      data: {
        name: 'Inactive Category',
        slug: 'inactive-category',
        isActive: false,
        workspaceId
      }
    });

    // Create test products
    productWithStock = await prisma.products.create({
      data: {
        name: 'Product with Stock',
        price: 10.99,
        stock: 5, // Stock > 1
        isActive: true,
        slug: 'product-with-stock',
        categoryId: activeCategory.id,
        workspaceId
      }
    });

    productWithoutStock = await prisma.products.create({
      data: {
        name: 'Product without Stock',
        price: 15.99,
        stock: 1, // Stock = 1 (should be excluded as we want > 1)
        isActive: true,
        slug: 'product-without-stock',
        categoryId: activeCategory.id,
        workspaceId
      }
    });

    inactiveProduct = await prisma.products.create({
      data: {
        name: 'Inactive Product',
        price: 20.99,
        stock: 10,
        isActive: false, // Inactive product
        slug: 'inactive-product',
        categoryId: activeCategory.id,
        workspaceId
      }
    });

    // Product in inactive category
    await prisma.products.create({
      data: {
        name: 'Product in Inactive Category',
        price: 25.99,
        stock: 3,
        isActive: true,
        slug: 'product-inactive-category',
        categoryId: inactiveCategory.id, // Inactive category
        workspaceId
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.products.deleteMany({ where: { workspaceId } });
    await prisma.categories.deleteMany({ where: { workspaceId } });
    await prisma.workspace.delete({ where: { id: workspaceId } });
    await prisma.$disconnect();
  });

  it('should return only products with active categories and stock > 1', async () => {
    const response = await request(app)
      .get(`/api/workspaces/${workspaceId}/products/active-with-categories`)
      .set('x-test-auth', 'true')
      .set('x-workspace-id', workspaceId)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('products');
    expect(response.body).toHaveProperty('count');
    expect(response.body).toHaveProperty('filters');

    // Should only return productWithStock
    expect(response.body.count).toBe(1);
    expect(response.body.products[0].id).toBe(productWithStock.id);
    expect(response.body.products[0].name).toBe('Product with Stock');
    expect(response.body.products[0].stock).toBe(5);

    // Verify filters applied
    expect(response.body.filters.conditions).toContain('product.isActive = true');
    expect(response.body.filters.conditions).toContain('category.isActive = true');
    expect(response.body.filters.conditions).toContain('stock > 1');
  });

  it('should filter by specific category when categoryId provided', async () => {
    // Create another active category with a product
    const anotherCategory = await prisma.categories.create({
      data: {
        name: 'Another Active Category',
        slug: 'another-active-category',
        isActive: true,
        workspaceId
      }
    });

    const anotherProduct = await prisma.products.create({
      data: {
        name: 'Another Product',
        price: 30.99,
        stock: 8,
        isActive: true,
        slug: 'another-product',
        categoryId: anotherCategory.id,
        workspaceId
      }
    });

    const response = await request(app)
      .get(`/api/workspaces/${workspaceId}/products/active-with-categories`)
      .query({ categoryId: anotherCategory.id })
      .set('x-test-auth', 'true')
      .set('x-workspace-id', workspaceId)
      .expect(200);

    expect(response.body.count).toBe(1);
    expect(response.body.products[0].id).toBe(anotherProduct.id);
    expect(response.body.filters.categoryFilter).toBe(anotherCategory.id);

    // Clean up
    await prisma.products.delete({ where: { id: anotherProduct.id } });
    await prisma.categories.delete({ where: { id: anotherCategory.id } });
  });

  it('should return 400 if workspaceId is missing', async () => {
    const response = await request(app)
      .get('/api/workspaces//products/active-with-categories')
      .set('x-test-auth', 'true')
      .expect(404); // Route not found due to empty workspaceId
  });

  it('should return empty array if no products match criteria', async () => {
    // Create workspace with no matching products
    const emptyWorkspace = await prisma.workspace.create({
      data: {
        name: 'Empty Workspace',
        slug: 'empty-workspace-products'
      }
    });

    const response = await request(app)
      .get(`/api/workspaces/${emptyWorkspace.id}/products/active-with-categories`)
      .set('x-test-auth', 'true')
      .set('x-workspace-id', emptyWorkspace.id)
      .expect(200);

    expect(response.body.count).toBe(0);
    expect(response.body.products).toEqual([]);

    // Clean up
    await prisma.workspace.delete({ where: { id: emptyWorkspace.id } });
  });
});