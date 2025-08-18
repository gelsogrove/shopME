import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { CategoryService } from '../../../application/services/category.service';

// Mock Prisma Client
jest.mock('../../../lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

// Mock logger
jest.mock('../../../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

import { prisma } from '../../../lib/prisma';
import logger from '../../../utils/logger';
// @ts-ignore - Ignoring TS2615 circular reference error in Prisma types
const mockPrisma = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

describe('CategoryService', () => {
  let categoryService: CategoryService;
  
  beforeEach(() => {
    mockReset(mockPrisma);
    categoryService = new CategoryService();
  });

  describe('getAllForWorkspace', () => {
    it('should return all categories for a workspace', async () => {
      // Arrange
      const workspaceId = 'test-workspace-id';
      const expectedCategories = [
        { 
          id: '1', 
          name: 'Category 1', 
          slug: 'category-1', 
          workspaceId,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        },
        { 
          id: '2', 
          name: 'Category 2', 
          slug: 'category-2', 
          workspaceId,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }
      ];
      
      mockPrisma.categories.findMany.mockResolvedValue(expectedCategories as any);
      
      // Act
      const result = await categoryService.getAllForWorkspace(workspaceId);
      
      // Assert
      expect(result).toHaveLength(2);
      expect(mockPrisma.categories.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            workspaceId,
            isActive: true
          }
        })
      );
    });
    
    it('should handle errors and log them', async () => {
      // Arrange
      const workspaceId = 'test-workspace-id';
      const error = new Error('Database error');
      mockPrisma.categories.findMany.mockRejectedValue(error);
      
      // Act
      const result = await categoryService.getAllForWorkspace(workspaceId);
      
      // Assert
      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return a category by id', async () => {
      // Arrange
      const id = 'category-id';
      const workspaceId = 'test-workspace-id';
      const expectedCategory = { 
        id, 
        name: 'Category', 
        slug: 'category',
        workspaceId,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      mockPrisma.categories.findFirst.mockResolvedValue(expectedCategory as any);
      
      // Act
      const result = await categoryService.getById(id, workspaceId);
      
      // Assert
      expect(result).toEqual(expect.objectContaining({
        id,
        name: 'Category'
      }));
      expect(mockPrisma.categories.findFirst).toHaveBeenCalledWith({
        where: { id, workspaceId }
      });
    });
    
    it('should return null if category not found', async () => {
      // Arrange
      mockPrisma.categories.findFirst.mockResolvedValue(null);
      
      // Act
      const result = await categoryService.getById('non-existent', 'workspace');
      
      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      // Arrange
      const categoryData = {
        name: 'New Category',
        description: 'Description',
        workspaceId: 'test-workspace-id',
        isActive: true
      };
      
      const expectedCategory = {
        id: 'new-id',
        name: 'New Category',
        slug: 'new-category',
        description: 'Description',
        workspaceId: 'test-workspace-id',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.categories.findFirst.mockResolvedValue(null); // No existing category with same slug
      mockPrisma.categories.create.mockResolvedValue(expectedCategory as any);
      
      // Act
      const result = await categoryService.create(categoryData);
      
      // Assert
      expect(result).toEqual(expect.objectContaining({
        name: 'New Category',
        slug: 'new-category'
      }));
      expect(mockPrisma.categories.create).toHaveBeenCalled();
    });
    
    it('should throw error if category with same name exists', async () => {
      // Arrange
      const categoryData = {
        name: 'Existing Category',
        description: 'Description',
        workspaceId: 'test-workspace-id'
      };
      
      const existingCategory = {
        id: 'existing-id',
        name: 'Existing Category',
        slug: 'existing-category',
        workspaceId: 'test-workspace-id',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      // Mock the repository's findBySlug method
      mockPrisma.categories.findFirst.mockResolvedValue(existingCategory as any);
      
      // Act & Assert
      await expect(categoryService.create(categoryData)).rejects.toThrow('A category with this name already exists');
    });
    
    it('should throw error if required fields are missing', async () => {
      // Arrange
      const incompleteData = {
        description: 'Description'
      };
      
      // Act & Assert
      await expect(categoryService.create(incompleteData as any)).rejects.toThrow('Missing required fields');
    });
  });

  describe('update', () => {
    it('should update an existing category', async () => {
      // Arrange
      const id = 'category-id';
      const workspaceId = 'test-workspace-id';
      const updateData = {
        name: 'Updated Category',
        description: 'Updated description'
      };
      
      const existingCategory = {
        id,
        name: 'Original Category',
        slug: 'original-category',
        description: 'Original description',
        workspaceId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedCategory = {
        ...existingCategory,
        name: updateData.name,
        slug: 'updated-category',
        description: updateData.description
      };
      
      mockPrisma.categories.findFirst.mockResolvedValueOnce(existingCategory as any); // For checking existence
      mockPrisma.categories.findFirst.mockResolvedValueOnce(null); // For slug check
      mockPrisma.categories.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.categories.findFirst.mockResolvedValueOnce(updatedCategory as any); // For returning updated category
      
      // Act
      const result = await categoryService.update(id, workspaceId, updateData);
      
      // Assert
      expect(result).toEqual(expect.objectContaining({
        name: 'Updated Category',
        description: 'Updated description'
      }));
      expect(mockPrisma.categories.updateMany).toHaveBeenCalled();
    });
    
    it('should throw error if category not found', async () => {
      // Arrange
      mockPrisma.categories.findFirst.mockResolvedValue(null);
      
      // Act & Assert
      await expect(categoryService.update('non-existent', 'workspace', {})).rejects.toThrow('Category not found');
    });
    
    it('should throw error if updating to a name that already exists', async () => {
      // Arrange
      const id = 'category-id';
      const workspaceId = 'test-workspace-id';
      const updateData = {
        name: 'Existing Name'
      };
      
      const existingCategory = {
        id,
        name: 'Original Name',
        slug: 'original-name',
        workspaceId,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      const conflictingCategory = {
        id: 'other-id',
        name: 'Existing Name',
        slug: 'existing-name',
        workspaceId,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      mockPrisma.categories.findFirst.mockResolvedValueOnce(existingCategory as any); // For checking existence
      mockPrisma.categories.findFirst.mockResolvedValueOnce(conflictingCategory as any); // For slug check
      
      // Act & Assert
      await expect(categoryService.update(id, workspaceId, updateData)).rejects.toThrow('A category with this name already exists');
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      // Arrange
      const id = 'category-id';
      const workspaceId = 'test-workspace-id';
      
      const category = {
        id,
        name: 'Category to Delete',
        workspaceId,
        slug: 'category-to-delete',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      mockPrisma.categories.findFirst.mockResolvedValue(category as any);
      mockPrisma.products.findMany.mockResolvedValue([]);
      mockPrisma.categories.deleteMany.mockResolvedValue({ count: 1 });
      
      // Act
      const result = await categoryService.delete(id, workspaceId);
      
      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.categories.deleteMany).toHaveBeenCalledWith({
        where: { id, workspaceId }
      });
    });
    
    it('should throw error if category not found', async () => {
      // Arrange
      mockPrisma.categories.findFirst.mockResolvedValue(null);
      
      // Act & Assert
      await expect(categoryService.delete('non-existent', 'workspace')).rejects.toThrow('Category not found');
    });
    
    it('should throw error if category has products', async () => {
      // Arrange
      const id = 'category-id';
      const workspaceId = 'test-workspace-id';
      
      const category = {
        id,
        name: 'Category with Products',
        workspaceId,
        slug: 'category-with-products',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      const products = [{ 
        id: 'product-1',
        name: 'Product 1',
        description: null,
        price: 10,
        stock: 100,
        sku: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        workspaceId,
        categoryId: id,
        brandId: null,
        image: null
      }];
      
      mockPrisma.categories.findFirst.mockResolvedValue(category as any);
      mockPrisma.products.findMany.mockResolvedValue(products as any);
      
      // Act & Assert
      await expect(categoryService.delete(id, workspaceId)).rejects.toThrow('Cannot delete category that is used by products');
    });
  });
  
  describe('hasProducts', () => {
    it('should return true if category has products', async () => {
      // Arrange
      const id = 'category-id';
      const workspaceId = 'test-workspace-id';
      
      const products = [{ 
        id: 'product-1',
        name: 'Product 1',
        description: null,
        price: 10,
        stock: 100,
        sku: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        workspaceId,
        categoryId: id,
        brandId: null,
        image: null
      }];
      
      mockPrisma.products.findMany.mockResolvedValue(products as any);
      
      // Act
      const result = await categoryService.hasProducts(id, workspaceId);
      
      // Assert
      expect(result).toBe(true);
    });
    
    it('should return false if category has no products', async () => {
      // Arrange
      mockPrisma.products.findMany.mockResolvedValue([]);
      
      // Act
      const result = await categoryService.hasProducts('id', 'workspace');
      
      // Assert
      expect(result).toBe(false);
    });
  });
}); 