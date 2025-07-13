import { Response } from 'express';
import 'jest';
import { DocumentController } from '../../../controllers/documentController';
import { embeddingService } from '../../../services/embeddingService';
jest.mock('../../../services/embeddingService', () => ({
  embeddingService: {
    generateDocumentEmbeddings: jest.fn().mockResolvedValue({ processed: 1, errors: [] })
  }
}));

const mockDocument = {
  id: 'doc-test-id',
  filename: 'test.pdf',
  originalName: 'test.pdf',
  filePath: '/tmp/test.pdf',
  fileSize: 12345,
  mimeType: 'application/pdf',
  workspaceId: 'workspace-test-id',
  status: 'UPLOADED',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock documentService
jest.mock('../../../services/documentService', () => ({
  documentService: {
    createDocument: jest.fn().mockResolvedValue(mockDocument),
    updateDocument: jest.fn().mockResolvedValue({ ...mockDocument, originalName: 'updated.pdf' }),
    deleteDocument: jest.fn().mockResolvedValue(true),
    getDocumentById: jest.fn().mockResolvedValue(mockDocument)
  }
}));

describe('DocumentController', () => {
  let documentController: DocumentController;
  let mockRequest: any;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    documentController = new DocumentController();
    mockRequest = {
      params: { id: 'doc-test-id' },
      body: { workspaceId: 'workspace-test-id', originalName: 'test.pdf' },
      file: { filename: 'test.pdf', originalname: 'test.pdf', path: '/tmp/test.pdf', size: 12345, mimetype: 'application/pdf' },
      query: { workspaceId: 'workspace-test-id' }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    (embeddingService.generateDocumentEmbeddings as jest.Mock).mockClear();
  });

  it('should create a document and trigger embedding generation', async () => {
    await documentController.uploadDocument(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(embeddingService.generateDocumentEmbeddings).toHaveBeenCalledWith('workspace-test-id');
  });

  it('should update a document and trigger embedding generation', async () => {
    await documentController.updateDocument(mockRequest, mockResponse as Response);
    expect(embeddingService.generateDocumentEmbeddings).toHaveBeenCalledWith('workspace-test-id');
  });

  it('should delete a document and trigger embedding generation', async () => {
    await documentController.deleteDocument(mockRequest, mockResponse as Response);
    expect(embeddingService.generateDocumentEmbeddings).toHaveBeenCalledWith('workspace-test-id');
  });
}); 