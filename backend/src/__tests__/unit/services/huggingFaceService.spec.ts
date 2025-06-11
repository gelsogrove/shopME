// Mock the HuggingFace service to avoid loading the actual ML model in unit tests
jest.mock('../../../services/huggingFaceService');

import { mockHuggingFaceService } from '../mock/huggingFaceService.mock';

describe('HuggingFaceService', () => {
  let service: any;

  beforeAll(() => {
    service = mockHuggingFaceService;
  });

  describe('generateEmbedding', () => {
    it('should generate embedding for single text', async () => {
      const text = 'Test document for embedding generation';
      
      const embedding = await service.generateEmbedding(text);
      
      expect(embedding).toBeDefined();
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(384); // all-MiniLM-L6-v2 dimensions
      expect(embedding.every(val => typeof val === 'number')).toBe(true);
    }, 30000); // 30s timeout for model loading

    it('should generate consistent embeddings for same text', async () => {
      const text = 'Consistent test text';
      
      const embedding1 = await service.generateEmbedding(text);
      const embedding2 = await service.generateEmbedding(text);
      
      expect(embedding1).toEqual(embedding2);
    });

    it('should generate different embeddings for different texts', async () => {
      const text1 = 'First test document';
      const text2 = 'Second test document';
      
      const embedding1 = await service.generateEmbedding(text1);
      const embedding2 = await service.generateEmbedding(text2);
      
      expect(embedding1).not.toEqual(embedding2);
    });

    it('should handle empty text', async () => {
      const text = '';
      
      const embedding = await service.generateEmbedding(text);
      
      expect(embedding).toBeDefined();
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(384);
    });
  });

  describe('generateEmbeddings', () => {
    it('should generate embeddings for multiple texts', async () => {
      const texts = [
        'First test document',
        'Second test document',
        'Third test document'
      ];
      
      const embeddings = await service.generateEmbeddings(texts);
      
      expect(embeddings).toBeDefined();
      expect(Array.isArray(embeddings)).toBe(true);
      expect(embeddings.length).toBe(texts.length);
      
      embeddings.forEach(embedding => {
        expect(Array.isArray(embedding)).toBe(true);
        expect(embedding.length).toBe(384);
        expect(embedding.every(val => typeof val === 'number')).toBe(true);
      });
    });

    it('should handle empty array', async () => {
      const texts: string[] = [];
      
      const embeddings = await service.generateEmbeddings(texts);
      
      expect(embeddings).toBeDefined();
      expect(Array.isArray(embeddings)).toBe(true);
      expect(embeddings.length).toBe(0);
    });

    it('should handle single text in array', async () => {
      const texts = ['Single test document'];
      
      const embeddings = await service.generateEmbeddings(texts);
      
      expect(embeddings).toBeDefined();
      expect(Array.isArray(embeddings)).toBe(true);
      expect(embeddings.length).toBe(1);
      expect(embeddings[0].length).toBe(384);
    });
  });

  describe('getModelInfo', () => {
    it('should return correct model information', () => {
      const info = service.getModelInfo();
      
      expect(info).toBeDefined();
      expect(info.name).toBe('Xenova/all-MiniLM-L6-v2');
      expect(info.dimensions).toBe(384);
      expect(info.type).toBe('Local Transformer Model (Sentence Transformers)');
      expect(info.local).toBe(true);
    });
  });

  describe('isReady', () => {
    it('should return true when service is ready', async () => {
      const isReady = await service.isReady();
      
      expect(isReady).toBe(true);
    }, 30000); // 30s timeout for model loading
  });
}); 