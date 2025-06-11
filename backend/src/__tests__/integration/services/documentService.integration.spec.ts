import fs from 'fs';
import path from 'path';
import { prisma } from '../../../lib/prisma';
import { DocumentService } from '../../../services/documentService';

// Mock the HuggingFace service for integration tests
jest.mock('../../../services/huggingFaceService', () => ({
  HuggingFaceService: jest.fn().mockImplementation(() => ({
    generateEmbedding: jest.fn().mockResolvedValue(
      Array(384).fill(0).map(() => Math.random() * 2 - 1)
    ),
    generateEmbeddings: jest.fn().mockImplementation((texts: string[]) => 
      Promise.resolve(
        texts.map(() => Array(384).fill(0).map(() => Math.random() * 2 - 1))
      )
    ),
    getModelInfo: jest.fn().mockReturnValue({
      name: 'Xenova/all-MiniLM-L6-v2',
      type: 'Local Transformer Model (Sentence Transformers)',
      local: true,
      dimensions: 384
    }),
    isReady: jest.fn().mockResolvedValue(true)
  }))
}));

describe('DocumentService Integration Tests', () => {
  let documentService: DocumentService;
  let testWorkspaceId: string;
  let testDocumentId: string;

  beforeAll(async () => {
    documentService = new DocumentService();
    
    // Create test workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace for Embeddings',
        slug: 'test-workspace-embeddings-' + Date.now(),
        description: 'Test workspace for document embeddings integration tests'
      }
    });
    testWorkspaceId = workspace.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testDocumentId) {
      await prisma.documentChunks.deleteMany({
        where: { documentId: testDocumentId }
      });
      await prisma.documents.deleteMany({
        where: { id: testDocumentId }
      });
    }
    
    await prisma.workspace.delete({
      where: { id: testWorkspaceId }
    });
  });

  describe('Document CRUD Operations', () => {
    it('should create a document', async () => {
      const testContent = 'Test document content for integration testing.';
      const testFilePath = path.join(__dirname, 'test-document.txt');
      fs.writeFileSync(testFilePath, testContent);

      try {
        const documentData = {
          filename: 'test-document.txt',
          originalName: 'test-document.txt',
          filePath: testFilePath,
          fileSize: Buffer.byteLength(testContent, 'utf8'),
          mimeType: 'text/plain',
          workspaceId: testWorkspaceId
        };

        const document = await documentService.createDocument(documentData);
        testDocumentId = document.id;

        expect(document).toBeDefined();
        expect(document.id).toBeDefined();
        expect(document.filename).toBe('test-document.txt');
        expect(document.workspaceId).toBe(testWorkspaceId);
        expect(document.status).toBe('UPLOADED');

      } finally {
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    });

    it('should get documents for workspace', async () => {
      const documents = await documentService.getDocuments(testWorkspaceId);

      expect(documents).toBeDefined();
      expect(Array.isArray(documents)).toBe(true);
      expect(documents.length).toBeGreaterThan(0);
      
      const testDoc = documents.find(doc => doc.id === testDocumentId);
      expect(testDoc).toBeDefined();
      expect(testDoc?.filename).toBe('test-document.txt');
    });

    it('should get document by id', async () => {
      const document = await documentService.getDocumentById(testDocumentId);

      expect(document).toBeDefined();
      expect(document?.id).toBe(testDocumentId);
      expect(document?.filename).toBe('test-document.txt');
    });

    it('should update document', async () => {
      const updateData = {
        originalName: 'updated-test-document.txt',
        isActive: false
      };

      const updatedDocument = await documentService.updateDocument(testDocumentId, updateData);

      expect(updatedDocument).toBeDefined();
      expect(updatedDocument.originalName).toBe('updated-test-document.txt');
      expect(updatedDocument.isActive).toBe(false);
    });
  });

  describe('Text Processing', () => {
    it('should split text into chunks', async () => {
      const longText = 'This is a test document. '.repeat(100); // Create a long text
      
      // Access the private method through any type casting for testing
      const chunks = (documentService as any).splitTextIntoChunks(longText);

      expect(chunks).toBeDefined();
      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBeGreaterThan(0);
      
      chunks.forEach((chunk: any, index: number) => {
        expect(chunk.content).toBeDefined();
        expect(chunk.chunkIndex).toBe(index);
        expect(typeof chunk.content).toBe('string');
      });
    });
  });

  describe('Search Functionality', () => {
    it('should search documents (with mocked embeddings)', async () => {
      // This test uses mocked embeddings, so it tests the search logic without requiring real ML
      const searchQuery = 'test document';
      
      const results = await documentService.searchDocuments(searchQuery, testWorkspaceId, 5);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      // Results might be empty if no processed documents with embeddings exist
    });
  });
}); 