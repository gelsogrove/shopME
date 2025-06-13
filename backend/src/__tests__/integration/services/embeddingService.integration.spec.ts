import { prisma } from '../../../lib/prisma';
import { embeddingService } from '../../../services/embeddingService';

// Mock fetch for OpenRouter API calls in integration tests
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      data: [{
        embedding: Array(10).fill(0).map(() => Math.random() * 2 - 1) // Smaller embedding for testing
      }]
    })
  })
) as jest.Mock;

describe('EmbeddingService Integration Tests', () => {
  let testWorkspaceId: string;
  let testFAQId: string;

  beforeAll(async () => {
    // Create test workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace for FAQ Embeddings',
        slug: 'test-workspace-faq-embeddings-' + Date.now(),
        description: 'Test workspace for FAQ embeddings integration tests'
      }
    });
    testWorkspaceId = workspace.id;

    // Create test FAQ
    const faq = await prisma.fAQ.create({
      data: {
        question: 'What are your business hours?',
        answer: 'We are open Monday to Friday from 9 AM to 6 PM.',
        isActive: true,
        workspaceId: testWorkspaceId
      }
    });
    testFAQId = faq.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testFAQId) {
      await prisma.fAQChunks.deleteMany({
        where: { faqId: testFAQId }
      });
      await prisma.fAQ.deleteMany({
        where: { id: testFAQId }
      });
    }
    
    await prisma.workspace.delete({
      where: { id: testWorkspaceId }
    });
  });

  describe('FAQ Embedding Generation', () => {
    it('should generate embeddings for active FAQs', async () => {
      const result = await embeddingService.generateFAQEmbeddings(testWorkspaceId);

      expect(result).toBeDefined();
      expect(result.processed).toBeGreaterThan(0);
      expect(Array.isArray(result.errors)).toBe(true);

      // Verify chunks were created
      const chunks = await prisma.fAQChunks.findMany({
        where: { faqId: testFAQId }
      });

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].content).toContain('What are your business hours?');
      expect(chunks[0].embedding).toBeDefined();
    });

    it('should not process FAQs that already have embeddings', async () => {
      // Run embedding generation twice
      await embeddingService.generateFAQEmbeddings(testWorkspaceId);
      const result = await embeddingService.generateFAQEmbeddings(testWorkspaceId);

      // Should not process any FAQs the second time
      expect(result.processed).toBe(0);
      expect(result.errors).toContain('No active FAQs found to process');
    });
  });

  describe('FAQ Search', () => {
    beforeAll(async () => {
      // Ensure embeddings are generated
      await embeddingService.generateFAQEmbeddings(testWorkspaceId);
    });

    it('should search FAQs using semantic similarity', async () => {
      const searchQuery = 'opening hours';
      
      const results = await embeddingService.searchFAQs(searchQuery, testWorkspaceId, 5);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('id');
        expect(results[0]).toHaveProperty('content');
        expect(results[0]).toHaveProperty('similarity');
        expect(results[0]).toHaveProperty('sourceName');
        expect(results[0]).toHaveProperty('sourceType');
        expect(results[0].sourceType).toBe('faq');
      }
    });

    it('should return empty results for non-matching queries', async () => {
      const searchQuery = 'completely unrelated topic that should not match';
      
      const results = await embeddingService.searchFAQs(searchQuery, testWorkspaceId, 5);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      // Results might be empty or have very low similarity scores
    });
  });

  describe('Text Processing', () => {
    it('should split text into chunks', () => {
      const text = 'This is a test FAQ question and answer.';
      
      const chunks = embeddingService.splitTextIntoChunks(text);

      expect(chunks).toBeDefined();
      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBeGreaterThan(0);
      
      chunks.forEach((chunk, index) => {
        expect(chunk.content).toBeDefined();
        expect(chunk.chunkIndex).toBe(index);
        expect(typeof chunk.content).toBe('string');
      });
    });

    it('should calculate cosine similarity correctly', () => {
      const vecA = [1, 0, 0];
      const vecB = [0, 1, 0];
      const vecC = [1, 0, 0];

      // Orthogonal vectors should have similarity close to 0
      const similarity1 = embeddingService.cosineSimilarity(vecA, vecB);
      expect(similarity1).toBeCloseTo(0, 5);

      // Identical vectors should have similarity of 1
      const similarity2 = embeddingService.cosineSimilarity(vecA, vecC);
      expect(similarity2).toBeCloseTo(1, 5);
    });
  });
}); 