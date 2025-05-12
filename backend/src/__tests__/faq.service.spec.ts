import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { FaqService } from '../application/services/faq.service';

// Mock Prisma Client
jest.mock('../lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

import { prisma } from '../lib/prisma';
const mockPrisma = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

describe('FaqService', () => {
  let faqService: FaqService;
  
  beforeEach(() => {
    mockReset(mockPrisma);
    faqService = new FaqService();
  });

  describe('getAllForWorkspace', () => {
    it('should return all FAQs for a workspace', async () => {
      // Arrange
      const workspaceId = 'test-workspace-id';
      const expectedFaqs = [
        { 
          id: '1', 
          question: 'Question 1',
          answer: 'Answer 1',
          workspaceId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        },
        { 
          id: '2', 
          question: 'Question 2',
          answer: 'Answer 2',
          workspaceId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }
      ];
      
      mockPrisma.fAQ.findMany.mockResolvedValue(expectedFaqs as any);
      
      // Act
      const result = await faqService.getAllForWorkspace(workspaceId);
      
      // Assert
      expect(result).toHaveLength(2);
      expect(mockPrisma.fAQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workspaceId }
        })
      );
    });
    
    it('should handle errors and log them', async () => {
      // Arrange
      const workspaceId = 'test-workspace-id';
      const error = new Error('Database error');
      mockPrisma.fAQ.findMany.mockRejectedValue(error);
      
      // Act & Assert
      await expect(faqService.getAllForWorkspace(workspaceId)).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should return a FAQ by id', async () => {
      // Arrange
      const id = 'faq-id';
      const expectedFaq = { 
        id, 
        question: 'Question',
        answer: 'Answer',
        workspaceId: 'test-workspace-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      mockPrisma.fAQ.findUnique.mockResolvedValue(expectedFaq as any);
      
      // Act
      const result = await faqService.getById(id);
      
      // Assert
      expect(result).toEqual(expect.objectContaining({
        id,
        question: 'Question',
        answer: 'Answer'
      }));
      expect(mockPrisma.fAQ.findUnique).toHaveBeenCalledWith({
        where: { id }
      });
    });
    
    it('should return null if FAQ not found', async () => {
      // Arrange
      mockPrisma.fAQ.findUnique.mockResolvedValue(null);
      
      // Act
      const result = await faqService.getById('non-existent');
      
      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new FAQ', async () => {
      // Arrange
      const faqData = {
        question: 'New Question',
        answer: 'New Answer',
        workspaceId: 'test-workspace-id',
        isActive: true
      };
      
      const expectedFaq = {
        id: 'new-id',
        ...faqData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.fAQ.create.mockResolvedValue(expectedFaq as any);
      
      // Act
      const result = await faqService.create(faqData);
      
      // Assert
      expect(result).toEqual(expect.objectContaining({
        question: 'New Question',
        answer: 'New Answer'
      }));
      expect(mockPrisma.fAQ.create).toHaveBeenCalledWith({
        data: faqData
      });
    });
    
    it('should throw error if required fields are missing', async () => {
      // Arrange
      const incompleteData = {
        answer: 'Answer'
      };
      
      // Act & Assert
      await expect(faqService.create(incompleteData as any)).rejects.toThrow('Missing required fields');
    });
  });

  describe('update', () => {
    it('should update an existing FAQ', async () => {
      // Arrange
      const id = 'faq-id';
      const updateData = {
        question: 'Updated Question',
        answer: 'Updated Answer'
      };
      
      const existingFaq = {
        id,
        question: 'Original Question',
        answer: 'Original Answer',
        workspaceId: 'test-workspace-id',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedFaq = {
        ...existingFaq,
        question: updateData.question,
        answer: updateData.answer
      };
      
      mockPrisma.fAQ.findUnique.mockResolvedValueOnce(existingFaq as any);
      mockPrisma.fAQ.update.mockResolvedValue(updatedFaq as any);
      
      // Act
      const result = await faqService.update(id, updateData);
      
      // Assert
      expect(result).toEqual(expect.objectContaining({
        question: 'Updated Question',
        answer: 'Updated Answer'
      }));
      expect(mockPrisma.fAQ.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData
      });
    });
    
    it('should throw error if FAQ not found', async () => {
      // Arrange
      mockPrisma.fAQ.findUnique.mockResolvedValue(null);
      
      // Act & Assert
      await expect(faqService.update('non-existent', {})).rejects.toThrow('FAQ not found');
    });
    
    it('should throw error if update data is invalid', async () => {
      // Arrange
      const id = 'faq-id';
      const updateData = {
        question: '',
        answer: 'Valid Answer'
      };
      
      const existingFaq = {
        id,
        question: 'Original Question',
        answer: 'Original Answer',
        workspaceId: 'test-workspace-id',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.fAQ.findUnique.mockResolvedValue(existingFaq as any);
      
      // Act & Assert
      await expect(faqService.update(id, updateData)).rejects.toThrow('Invalid FAQ data');
    });
  });

  describe('delete', () => {
    it('should delete a FAQ', async () => {
      // Arrange
      const id = 'faq-id';
      
      const faq = {
        id,
        question: 'Question to Delete',
        answer: 'Answer to Delete',
        workspaceId: 'test-workspace-id',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.fAQ.findUnique.mockResolvedValue(faq as any);
      mockPrisma.fAQ.delete.mockResolvedValue({} as any);
      
      // Act
      const result = await faqService.delete(id);
      
      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.fAQ.delete).toHaveBeenCalledWith({
        where: { id }
      });
    });
    
    it('should throw error if FAQ not found', async () => {
      // Arrange
      mockPrisma.fAQ.findUnique.mockResolvedValue(null);
      
      // Act & Assert
      await expect(faqService.delete('non-existent')).rejects.toThrow('FAQ not found');
    });
  });
}); 