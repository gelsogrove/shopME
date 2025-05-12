import { Request, Response } from 'express';
import FaqService from '../application/services/faq.service';
import { FaqController } from '../interfaces/http/controllers/faq.controller';

// Mock FaqService
jest.mock('../application/services/faq.service', () => ({
  __esModule: true,
  default: {
    getAllForWorkspace: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

describe('FaqController', () => {
  let faqController: FaqController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const mockFaqService = FaqService as jest.Mocked<typeof FaqService>;
  
  beforeEach(() => {
    faqController = new FaqController();
    
    mockRequest = {
      params: { workspaceId: 'test-workspace-id', id: 'test-id' },
      body: {}
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
      
      mockFaqService.getAllForWorkspace.mockResolvedValue(faqs as any);
      
      // Act
      await faqController.getAllFaqs(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockFaqService.getAllForWorkspace).toHaveBeenCalledWith('test-workspace-id');
      expect(mockResponse.json).toHaveBeenCalledWith(faqs);
    });
    
    it('should return error if workspaceId is missing', async () => {
      // Arrange
      mockRequest.params = {};
      
      // Act
      await faqController.getAllFaqs(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Workspace ID is required'
      }));
    });
    
    it('should handle service errors', async () => {
      // Arrange
      mockFaqService.getAllForWorkspace.mockRejectedValue(new Error('Service error'));
      
      // Act
      await faqController.getAllFaqs(mockRequest as Request, mockResponse as Response);
      
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
      mockFaqService.getById.mockResolvedValue(faq as any);
      
      // Act
      await faqController.getFaqById(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockFaqService.getById).toHaveBeenCalledWith('test-id');
      expect(mockResponse.json).toHaveBeenCalledWith(faq);
    });
    
    it('should return 404 if FAQ not found', async () => {
      // Arrange
      mockFaqService.getById.mockResolvedValue(null);
      
      // Act
      await faqController.getFaqById(mockRequest as Request, mockResponse as Response);
      
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
      
      mockFaqService.create.mockResolvedValue(createdFaq as any);
      
      // Act
      await faqController.createFaq(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockFaqService.create).toHaveBeenCalledWith(expect.objectContaining({
        question: 'New Question',
        answer: 'New Answer',
        workspaceId: 'test-workspace-id'
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdFaq);
    });
    
    it('should handle missing required fields error', async () => {
      // Arrange
      mockFaqService.create.mockRejectedValue(new Error('Missing required fields'));
      
      // Act
      await faqController.createFaq(mockRequest as Request, mockResponse as Response);
      
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
      
      mockFaqService.update.mockResolvedValue(updatedFaq as any);
      
      // Act
      await faqController.updateFaq(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockFaqService.update).toHaveBeenCalledWith(
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
      mockFaqService.update.mockRejectedValue(new Error('FAQ not found'));
      
      // Act
      await faqController.updateFaq(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'FAQ not found'
      }));
    });
    
    it('should handle invalid data error', async () => {
      // Arrange
      mockFaqService.update.mockRejectedValue(new Error('Invalid FAQ data'));
      
      // Act
      await faqController.updateFaq(mockRequest as Request, mockResponse as Response);
      
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
      mockFaqService.delete.mockResolvedValue(true);
      
      // Act
      await faqController.deleteFaq(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockFaqService.delete).toHaveBeenCalledWith('test-id');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
    
    it('should handle error when FAQ not found', async () => {
      // Arrange
      mockFaqService.delete.mockRejectedValue(new Error('FAQ not found'));
      
      // Act
      await faqController.deleteFaq(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'FAQ not found'
      }));
    });
  });
}); 