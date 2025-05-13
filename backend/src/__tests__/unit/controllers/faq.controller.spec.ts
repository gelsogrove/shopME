import { Response } from 'express';
import { FaqController } from '../../../interfaces/http/controllers/faq.controller';

// Mock per FaqService
jest.mock('../../../application/services/faq.service', () => {
  return {
    FaqService: jest.fn().mockImplementation(() => {
      return {
        getAllForWorkspace: jest.fn().mockResolvedValue([
          { id: '1', question: 'Test Question 1', answer: 'Test Answer 1', workspaceId: 'workspace-1' },
          { id: '2', question: 'Test Question 2', answer: 'Test Answer 2', workspaceId: 'workspace-1' }
        ]),
        getById: jest.fn().mockImplementation((id) => {
          if (id === 'not-found') {
            return Promise.resolve(null);
          }
          return Promise.resolve({ id, question: 'Test Question', answer: 'Test Answer', workspaceId: 'workspace-1' });
        }),
        create: jest.fn().mockImplementation((data) => {
          if (!data.question || !data.answer) {
            return Promise.reject(new Error('Missing required fields'));
          }
          return Promise.resolve({ id: 'new-faq', question: data.question, answer: data.answer, workspaceId: data.workspaceId });
        }),
        update: jest.fn().mockResolvedValue({ id: 'faq-1', question: 'Updated Question', answer: 'Updated Answer', workspaceId: 'workspace-1' }),
        delete: jest.fn().mockResolvedValue(true)
      };
    })
  };
});

describe('Test environment setup', () => {
  it('Jest is properly configured', () => {
    expect(1 + 1).toBe(2);
  });
});

describe('FaqController', () => {
  let faqController: FaqController;
  let mockRequest: any;
  let mockResponse: Partial<Response>;
  
  beforeEach(() => {
    faqController = new FaqController();
    
    // Utilizzo any per evitare problemi di tipizzazione con Request
    mockRequest = {
      params: { 
        id: 'test-id',
        workspaceId: 'test-workspace-id'
      },
      body: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });
  
  it('should return all FAQs for a workspace', async () => {
    // Act
    await faqController.getAllFaqs(mockRequest, mockResponse as Response);
    
    // Assert
    expect(mockResponse.json).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: '1' }),
      expect.objectContaining({ id: '2' })
    ]));
  });
  
  it('should return error if workspaceId is missing', async () => {
    // Arrange
    mockRequest.params = { id: 'test-id' };
    
    // Act
    await faqController.getAllFaqs(mockRequest, mockResponse as Response);
    
    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringMatching(/workspace/i)
    }));
  });
  
  it('should handle service errors', async () => {
    // Arrange
    const faqService = (faqController as any).faqService;
    faqService.getAllForWorkspace = jest.fn().mockRejectedValue(new Error('Service error'));
    
    // Act
    await faqController.getAllFaqs(mockRequest, mockResponse as Response);
    
    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringMatching(/failed to get faqs/i)
    }));
  });
  
  it('should return a FAQ by ID', async () => {
    // Act
    await faqController.getFaqById(mockRequest, mockResponse as Response);
    
    // Assert
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(String),
      question: expect.any(String),
      answer: expect.any(String)
    }));
  });
  
  it('should return 404 if FAQ not found', async () => {
    // Arrange
    mockRequest.params = { 
      id: 'not-found',
      workspaceId: 'test-workspace-id'
    };
    
    // Act
    await faqController.getFaqById(mockRequest, mockResponse as Response);
    
    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringMatching(/not found/i)
    }));
  });
  
  it('should create a new FAQ', async () => {
    // Arrange
    mockRequest.body = {
      question: 'New Question',
      answer: 'New Answer'
    };
    
    // Act
    await faqController.createFaq(mockRequest, mockResponse as Response);
    
    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(String)
    }));
  });
  
  it('should handle missing required fields error', async () => {
    // Arrange
    mockRequest.body = {};
    
    // Usiamo un mocking specifico per questo test
    const faqService = (faqController as any).faqService;
    faqService.create = jest.fn().mockRejectedValue(new Error('Missing required fields'));
    
    // Act
    await faqController.createFaq(mockRequest, mockResponse as Response);
    
    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringMatching(/required/i)
    }));
  });
  
  it('should update an existing FAQ', async () => {
    // Arrange
    mockRequest.body = {
      question: 'Updated Question',
      answer: 'Updated Answer'
    };
    
    // Act
    await faqController.updateFaq(mockRequest, mockResponse as Response);
    
    // Assert
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(String)
    }));
  });
  
  it('should handle not found error', async () => {
    // Arrange
    mockRequest.params = { 
      id: 'not-found',
      workspaceId: 'test-workspace-id'
    };
    
    const faqService = (faqController as any).faqService;
    faqService.update = jest.fn().mockRejectedValue(new Error('FAQ not found'));
    
    // Act
    await faqController.updateFaq(mockRequest, mockResponse as Response);
    
    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringMatching(/not found/i)
    }));
  });
  
  it('should handle invalid data error', async () => {
    // Arrange
    mockRequest.body = {
      question: 'Invalid Question',
      answer: 'Invalid Answer'
    };
    
    const faqService = (faqController as any).faqService;
    faqService.update = jest.fn().mockRejectedValue(new Error('Invalid FAQ data'));
    
    // Act
    await faqController.updateFaq(mockRequest, mockResponse as Response);
    
    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringMatching(/invalid/i)
    }));
  });
  
  it('should delete a FAQ', async () => {
    // Act
    await faqController.deleteFaq(mockRequest, mockResponse as Response);
    
    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.send).toHaveBeenCalled();
  });
  
  it('should handle error when FAQ not found', async () => {
    // Arrange
    mockRequest.params = { 
      id: 'not-found',
      workspaceId: 'test-workspace-id'
    };
    
    const faqService = (faqController as any).faqService;
    faqService.delete = jest.fn().mockRejectedValue(new Error('FAQ not found'));
    
    // Act
    await faqController.deleteFaq(mockRequest, mockResponse as Response);
    
    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringMatching(/not found/i)
    }));
  });
}); 