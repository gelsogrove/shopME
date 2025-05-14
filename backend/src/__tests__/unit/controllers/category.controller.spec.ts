import { Request, Response } from 'express';
import { CategoryService } from '../../../application/services/category.service';
import { CategoryController } from '../../../interfaces/http/controllers/category.controller';

// Mock CategoryService
jest.mock('../../../application/services/category.service');

describe('CategoryController', () => {
  let categoryController: CategoryController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockCategoryService: jest.Mocked<CategoryService>;
  
  beforeEach(() => {
    mockCategoryService = new CategoryService() as jest.Mocked<CategoryService>;
    categoryController = new CategoryController();
    
    // Reset the instance of CategoryService inside the controller
    (categoryController as any).categoryService = mockCategoryService;
    
    mockRequest = {
      params: { workspaceId: 'test-workspace-id', id: 'test-id' },
      body: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
  });
  
  describe('getAllCategories', () => {
    it('should return all categories for a workspace', async () => {
      // Arrange
      const categories = [
        { id: '1', name: 'Category 1' },
        { id: '2', name: 'Category 2' }
      ];
      
      mockCategoryService.getAllForWorkspace.mockResolvedValue(categories as any);
      
      // Act
      await categoryController.getAllCategories(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockCategoryService.getAllForWorkspace).toHaveBeenCalledWith('test-workspace-id');
      expect(mockResponse.json).toHaveBeenCalledWith(categories);
    });
    
    it('should return error if workspaceId is missing', async () => {
      // Arrange
      mockRequest.params = {};
      mockRequest.query = {};
      
      // Act
      await categoryController.getAllCategories(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Workspace ID is required'
      }));
    });
    
    it('should handle service errors', async () => {
      // Arrange
      mockCategoryService.getAllForWorkspace.mockRejectedValue(new Error('Service error'));
      
      // Act
      await categoryController.getAllCategories(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Failed to get categories'
      }));
    });
  });
  
  describe('getCategoryById', () => {
    it('should return a category by ID', async () => {
      // Arrange
      const category = { id: 'test-id', name: 'Test Category' };
      mockCategoryService.getById.mockResolvedValue(category as any);
      
      // Act
      await categoryController.getCategoryById(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockCategoryService.getById).toHaveBeenCalledWith('test-id', 'test-workspace-id');
      expect(mockResponse.json).toHaveBeenCalledWith(category);
    });
    
    it('should return 404 if category not found', async () => {
      // Arrange
      mockCategoryService.getById.mockResolvedValue(null);
      
      // Act
      await categoryController.getCategoryById(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Category not found'
      }));
    });
  });
  
  describe('createCategory', () => {
    it('should create a new category', async () => {
      // Arrange
      mockRequest.body = {
        name: 'New Category',
        description: 'Description'
      };
      
      const createdCategory = {
        id: 'new-id',
        name: 'New Category',
        description: 'Description',
        workspaceId: 'test-workspace-id'
      };
      
      mockCategoryService.create.mockResolvedValue(createdCategory as any);
      
      // Act
      await categoryController.createCategory(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockCategoryService.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Category',
        description: 'Description',
        workspaceId: 'test-workspace-id'
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdCategory);
    });
    
    it('should handle duplicate category error', async () => {
      // Arrange
      mockCategoryService.create.mockRejectedValue(new Error('A category with this name already exists'));
      
      // Act
      await categoryController.createCategory(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'A category with this name already exists'
      }));
    });
  });
  
  describe('updateCategory', () => {
    it('should update an existing category', async () => {
      // Arrange
      mockRequest.body = {
        name: 'Updated Category',
        description: 'Updated Description'
      };
      
      const updatedCategory = {
        id: 'test-id',
        name: 'Updated Category',
        description: 'Updated Description',
        workspaceId: 'test-workspace-id'
      };
      
      mockCategoryService.update.mockResolvedValue(updatedCategory as any);
      
      // Act
      await categoryController.updateCategory(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockCategoryService.update).toHaveBeenCalledWith(
        'test-id',
        'test-workspace-id',
        expect.objectContaining({
          name: 'Updated Category',
          description: 'Updated Description'
        })
      );
      expect(mockResponse.json).toHaveBeenCalledWith(updatedCategory);
    });
    
    it('should handle not found error', async () => {
      // Arrange
      mockRequest.body = { name: 'Valid Name' }; // Aggiungiamo un nome valido per passare la validazione
      mockCategoryService.update.mockRejectedValue(new Error('Category not found'));
      
      // Act
      await categoryController.updateCategory(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Category not found'
      }));
    });
  });
  
  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      // Arrange
      mockCategoryService.delete.mockResolvedValue(true);
      
      // Act
      await categoryController.deleteCategory(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockCategoryService.delete).toHaveBeenCalledWith('test-id', 'test-workspace-id');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
    
    it('should handle error when category has products', async () => {
      // Arrange
      mockCategoryService.delete.mockRejectedValue(new Error('Cannot delete category that is used by products'));
      
      // Act
      await categoryController.deleteCategory(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Cannot delete category that is used by products'
      }));
    });
  });
  
  describe('hasProducts', () => {
    it('should return whether a category has products', async () => {
      // Arrange
      mockCategoryService.hasProducts.mockResolvedValue(true);
      
      // Act
      await categoryController.hasProducts(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockCategoryService.hasProducts).toHaveBeenCalledWith('test-id', 'test-workspace-id');
      expect(mockResponse.json).toHaveBeenCalledWith({ hasProducts: true });
    });
  });
}); 