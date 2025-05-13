import { Response } from 'express';
import { WorkspaceContextDTO } from '../application/dtos/workspace-context.dto';
import { FaqController } from '../interfaces/http/controllers/faq.controller';
import { WorkspaceRequest } from '../interfaces/http/types/workspace-request';

// Definiamo direttamente i mock per le funzioni del service
const mockGetAllForWorkspace = jest.fn();
const mockGetById = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

// Mock per FaqService 
jest.mock('../application/services/faq.service', () => {
  return {
    FaqService: jest.fn().mockImplementation(() => {
      return {
        getAllForWorkspace: mockGetAllForWorkspace,
        getById: mockGetById,
        create: mockCreate,
        update: mockUpdate,
        delete: mockDelete
      };
    })
  };
});

describe('FaqController', () => {
  let faqController: FaqController;
  let mockRequest: Partial<WorkspaceRequest>;
  let mockResponse: Partial<Response>;
  
  beforeEach(() => {
    faqController = new FaqController();
    
    // Create the workspace context
    const workspaceContext = new WorkspaceContextDTO('test-workspace-id');
    
    mockRequest = {
      params: { workspaceId: 'test-workspace-id', id: 'test-id' },
      body: {},
      workspaceContext
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    jest.clearAllMocks();
  });
  
  describe('getAllFaqs', () => {
    it('should return all FAQs for a workspace', async () => {
      // Arrange
      const faqs = [
        { id: '1', question: 'Question 1', answer: 'Answer 1' },
        { id: '2', question: 'Question 2', answer: 'Answer 2' }
      ];
      
      mockGetAllForWorkspace.mockResolvedValue(faqs);
      
      // Act
      await faqController.getAllFaqs(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockGetAllForWorkspace).toHaveBeenCalledWith('test-workspace-id');
      expect(mockResponse.json).toHaveBeenCalledWith(faqs);
    });
    
    it('should return error if workspaceId is missing', async () => {
      // Arrange
      mockRequest.params = {};
      mockRequest.workspaceContext = undefined as any;
      
      // Act
      await faqController.getAllFaqs(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Workspace ID is required'
      }));
    });
    
    it('should handle service errors', async () => {
      // Arrange
      mockGetAllForWorkspace.mockRejectedValue(new Error('Service error'));
      
      // Act
      await faqController.getAllFaqs(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Failed to get FAQs'
      }));
    });
  });
  
  describe('getFaqById', () => {
    it('should return a FAQ by ID', async () => {
      // Arrange
      const faq = { id: 'test-id', question: 'Test Question', answer: 'Test Answer' };
      mockGetById.mockResolvedValue(faq);
      
      // Act
      await faqController.getFaqById(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockGetById).toHaveBeenCalledWith('test-id');
      expect(mockResponse.json).toHaveBeenCalledWith(faq);
    });
    
    it('should return 404 if FAQ not found', async () => {
      // Arrange
      mockGetById.mockResolvedValue(null);
      
      // Act
      await faqController.getFaqById(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'FAQ not found'
      }));
    });
  });
  
  describe('createFaq', () => {
    it('should create a new FAQ', async () => {
      // Arrange
      mockRequest.body = {
        question: 'New Question',
        answer: 'New Answer'
      };
      
      const createdFaq = {
        id: 'new-id',
        question: 'New Question',
        answer: 'New Answer',
        workspaceId: 'test-workspace-id'
      };
      
      mockCreate.mockResolvedValue(createdFaq);
      
      // Act
      await faqController.createFaq(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        question: 'New Question',
        answer: 'New Answer',
        workspaceId: 'test-workspace-id'
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdFaq);
    });
    
    it('should handle missing required fields error', async () => {
      // Arrange
      mockCreate.mockRejectedValue(new Error('Missing required fields'));
      
      // Act
      await faqController.createFaq(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Missing required fields'
      }));
    });
  });
  
  describe('updateFaq', () => {
    it('should update an existing FAQ', async () => {
      // Arrange
      mockRequest.body = {
        question: 'Updated Question',
        answer: 'Updated Answer'
      };
      
      const updatedFaq = {
        id: 'test-id',
        question: 'Updated Question',
        answer: 'Updated Answer',
        workspaceId: 'test-workspace-id'
      };
      
      mockUpdate.mockResolvedValue(updatedFaq);
      
      // Act
      await faqController.updateFaq(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockUpdate).toHaveBeenCalledWith(
        'test-id',
        expect.objectContaining({
          question: 'Updated Question',
          answer: 'Updated Answer'
        })
      );
      expect(mockResponse.json).toHaveBeenCalledWith(updatedFaq);
    });
    
    it('should handle not found error', async () => {
      // Arrange
      mockUpdate.mockRejectedValue(new Error('FAQ not found'));
      
      // Act
      await faqController.updateFaq(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'FAQ not found'
      }));
    });
    
    it('should handle invalid data error', async () => {
      // Arrange
      mockUpdate.mockRejectedValue(new Error('Invalid FAQ data'));
      
      // Act
      await faqController.updateFaq(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Invalid FAQ data'
      }));
    });
  });
  
  describe('deleteFaq', () => {
    it('should delete a FAQ', async () => {
      // Arrange
      mockDelete.mockResolvedValue(true);
      
      // Act
      await faqController.deleteFaq(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockDelete).toHaveBeenCalledWith('test-id');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
    
    it('should handle error when FAQ not found', async () => {
      // Arrange
      mockDelete.mockRejectedValue(new Error('FAQ not found'));
      
      // Act
      await faqController.deleteFaq(mockRequest as WorkspaceRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'FAQ not found'
      }));
    });
  });
}); 