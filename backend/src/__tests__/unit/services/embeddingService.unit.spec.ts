import { EmbeddingService } from '../../../services/embeddingService';

// Mock the database to avoid memory issues
jest.mock('../../../lib/prisma', () => ({
  prisma: {}
}));

describe('EmbeddingService Unit Tests', () => {
  let embeddingService: EmbeddingService;

  beforeEach(() => {
    embeddingService = new EmbeddingService();
  });

  describe('Text Processing', () => {
    it('should split text into chunks correctly', () => {
      const text = 'This is a test text that should be split into chunks.';
      
      const chunks = embeddingService.splitTextIntoChunks(text);

      expect(chunks).toBeDefined();
      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].content).toBe(text);
      expect(chunks[0].chunkIndex).toBe(0);
    });

    it('should handle empty text', () => {
      const text = '';
      
      const chunks = embeddingService.splitTextIntoChunks(text);

      expect(chunks).toBeDefined();
      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBe(0);
    });

    it('should handle short text', () => {
      const text = 'Short text';
      
      const chunks = embeddingService.splitTextIntoChunks(text);

      expect(chunks).toBeDefined();
      expect(Array.isArray(chunks)).toBe(true);
      expect(chunks.length).toBe(1);
      expect(chunks[0].content).toBe('Short text');
      expect(chunks[0].chunkIndex).toBe(0);
    });
  });

  describe('Cosine Similarity', () => {
    it('should calculate cosine similarity correctly for identical vectors', () => {
      const vecA = [1, 2, 3];
      const vecB = [1, 2, 3];

      const similarity = embeddingService.cosineSimilarity(vecA, vecB);

      expect(similarity).toBeCloseTo(1, 5);
    });

    it('should calculate cosine similarity correctly for orthogonal vectors', () => {
      const vecA = [1, 0, 0];
      const vecB = [0, 1, 0];

      const similarity = embeddingService.cosineSimilarity(vecA, vecB);

      expect(similarity).toBeCloseTo(0, 5);
    });

    it('should calculate cosine similarity correctly for opposite vectors', () => {
      const vecA = [1, 0, 0];
      const vecB = [-1, 0, 0];

      const similarity = embeddingService.cosineSimilarity(vecA, vecB);

      expect(similarity).toBeCloseTo(-1, 5);
    });

    it('should throw error for vectors of different lengths', () => {
      const vecA = [1, 2, 3];
      const vecB = [1, 2];

      expect(() => {
        embeddingService.cosineSimilarity(vecA, vecB);
      }).toThrow('Vectors must have the same length');
    });

    it('should handle zero vectors', () => {
      const vecA = [0, 0, 0];
      const vecB = [1, 2, 3];

      const similarity = embeddingService.cosineSimilarity(vecA, vecB);

      expect(similarity).toBe(0);
    });
  });
}); 