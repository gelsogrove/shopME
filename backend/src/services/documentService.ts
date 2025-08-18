import logger from "../utils/logger"
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { PDFExtract } from 'pdf.js-extract';
import { embeddingService } from './embeddingService';

const prisma = new PrismaClient();

export interface DocumentUploadData {
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  workspaceId: string;
}

export interface DocumentChunk {
  content: string;
  chunkIndex: number;
  embedding?: number[];
}

export interface SearchResult {
  documentId: string;
  chunkId: string;
  content: string;
  similarity: number;
  documentName: string;
}

export class DocumentService {
  /**
   * Create a new document record in database
   */
  async createDocument(data: DocumentUploadData) {
    try {
      const document = await prisma.documents.create({
        data: {
          filename: data.filename,
          originalName: data.originalName,
          filePath: data.filePath,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          workspaceId: data.workspaceId,
          status: 'UPLOADED'
        }
      });

      return document;
    } catch (error) {
      logger.error('Error creating document:', error);
      throw new Error('Failed to create document record');
    }
  }

  /**
   * Extract text content from PDF file
   */
  async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      const pdfExtract = new PDFExtract();
      const options = {};
      
      return new Promise((resolve, reject) => {
        pdfExtract.extract(filePath, options, (err, data) => {
          if (err) {
            reject(new Error(`PDF extraction failed: ${err.message}`));
            return;
          }

          if (!data || !data.pages) {
            reject(new Error('No content found in PDF'));
            return;
          }

          let fullText = '';
          data.pages.forEach(page => {
            if (page.content) {
              page.content.forEach(item => {
                if (item.str) {
                  fullText += item.str + ' ';
                }
              });
            }
          });

          resolve(fullText.trim());
        });
      });
    } catch (error) {
      logger.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  /**
   * Process document: extract text, create chunks, generate embeddings
   */
  async processDocument(documentId: string): Promise<void> {
    try {
      // Update document status to PROCESSING
      await prisma.documents.update({
        where: { id: documentId },
        data: { status: 'PROCESSING' }
      });

      // Get document info
      const document = await prisma.documents.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        throw new Error('Document not found');
      }

      // Extract text from PDF
      const text = await this.extractTextFromPDF(document.filePath);
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in document');
      }

      // Split into chunks using shared service
      const chunks = embeddingService.splitTextIntoChunks(text);

      // Process each chunk and generate embeddings
      for (const chunk of chunks) {
        try {
          // Generate embedding for chunk using shared service
          const embedding = await embeddingService.generateEmbedding(chunk.content);
          
          // Save chunk with embedding to database
          await prisma.documentChunks.create({
            data: {
              documentId: documentId,
              content: chunk.content,
              chunkIndex: chunk.chunkIndex,
              embedding: embedding
            }
          });
        } catch (chunkError) {
          logger.error(`Error processing chunk ${chunk.chunkIndex}:`, chunkError);
          // Continue with other chunks even if one fails
        }
      }

      // Update document status to PROCESSED
      await prisma.documents.update({
        where: { id: documentId },
        data: { status: 'PROCESSED' }
      });

    } catch (error) {
      logger.error('Error processing document:', error);
      
      // Update document status to ERROR
      await prisma.documents.update({
        where: { id: documentId },
        data: { status: 'ERROR' }
      });
      
      throw error;
    }
  }

  /**
   * Search documents using semantic similarity
   */
  async searchDocuments(query: string, workspaceId: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      // Generate embedding for search query using shared service
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      // Get all document chunks for the workspace
      const chunks = await prisma.documentChunks.findMany({
        where: {
          document: {
            workspaceId: workspaceId,
            status: 'PROCESSED'
          }
        },
        include: {
          document: {
            select: {
              id: true,
              originalName: true
            }
          }
        }
      });

      // Calculate similarity for each chunk using shared service
      const results: SearchResult[] = [];
      
      for (const chunk of chunks) {
        if (chunk.embedding && Array.isArray(chunk.embedding)) {
          try {
            const similarity = embeddingService.cosineSimilarity(queryEmbedding, chunk.embedding as number[]);
            
            results.push({
              documentId: chunk.document.id,
              chunkId: chunk.id,
              content: chunk.content,
              similarity: similarity,
              documentName: chunk.document.originalName
            });
          } catch (similarityError) {
            logger.error('Error calculating similarity for chunk:', chunk.id, similarityError);
          }
        }
      }

      // Sort by similarity (highest first) and limit results
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    } catch (error) {
      logger.error('Error searching documents:', error);
      throw new Error('Failed to search documents');
    }
  }

  /**
   * Get all documents for a workspace
   */
  async getDocuments(workspaceId: string) {
    try {
      return await prisma.documents.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { chunks: true }
          }
        }
      });
    } catch (error) {
      logger.error('Error getting documents:', error);
      throw new Error('Failed to get documents');
    }
  }

  /**
   * Delete document and its chunks
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      const document = await prisma.documents.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        throw new Error('Document not found');
      }

      // Delete file from filesystem
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }

      // Delete from database (chunks will be deleted automatically due to cascade)
      await prisma.documents.delete({
        where: { id: documentId }
      });

    } catch (error) {
      logger.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }

  /**
   * Get document by ID
   */
  async getDocumentById(documentId: string) {
    try {
      const document = await prisma.documents.findUnique({
        where: { id: documentId },
        include: {
          _count: {
            select: { chunks: true }
          }
        }
      });

      return document;
    } catch (error) {
      logger.error('Error getting document by ID:', error);
      throw new Error('Failed to get document');
    }
  }

  /**
   * Update document metadata
   */
  async updateDocument(documentId: string, data: { originalName?: string; isActive?: boolean }) {
    try {
      const updatedDocument = await prisma.documents.update({
        where: { id: documentId },
        data: data,
        include: {
          _count: {
            select: { chunks: true }
          }
        }
      });

      return updatedDocument;
    } catch (error) {
      logger.error('Error updating document:', error);
      throw new Error('Failed to update document');
    }
  }

  /**
   * Generate embeddings for all active documents in a workspace
   */
  async generateEmbeddingsForActiveDocuments(workspaceId: string): Promise<{ processed: number; errors: string[] }> {
    try {
      // Get all active documents that are uploaded but not processed
      const activeDocuments = await prisma.documents.findMany({
        where: {
          workspaceId: workspaceId,
          isActive: true,
          status: 'UPLOADED'
        }
      });

      if (activeDocuments.length === 0) {
        return { processed: 0, errors: ['No active documents found to process'] };
      }

      let processed = 0;
      const errors: string[] = [];

      // Process each document
      for (const document of activeDocuments) {
        try {
          logger.info(`Processing document: ${document.originalName}`);
          
          // Update status to PROCESSING
          await prisma.documents.update({
            where: { id: document.id },
            data: { status: 'PROCESSING' }
          });

          // Extract text from PDF
          const text = await this.extractTextFromPDF(document.filePath);
          
          if (!text || text.trim().length === 0) {
            throw new Error('No text content found in document');
          }

          // Split into chunks
          const chunks = embeddingService.splitTextIntoChunks(text);

          // Prepare all chunk texts for batch processing
          const chunkTexts = chunks.map(chunk => chunk.content);

          // Generate embeddings in batch using shared service
          logger.info(`Generating embeddings for ${chunks.length} chunks...`);
          const embeddings: number[][] = [];
          
          // Process chunks in batches to avoid rate limits
          for (const chunkText of chunkTexts) {
            const embedding = await embeddingService.generateEmbedding(chunkText);
            embeddings.push(embedding);
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Delete existing chunks for this document
          await prisma.documentChunks.deleteMany({
            where: { documentId: document.id }
          });

          // Save chunks with embeddings to database
          for (let i = 0; i < chunks.length; i++) {
            await prisma.documentChunks.create({
              data: {
                documentId: document.id,
                content: chunks[i].content,
                chunkIndex: chunks[i].chunkIndex,
                embedding: embeddings[i]
              }
            });
          }

          // Update document status to PROCESSED
          await prisma.documents.update({
            where: { id: document.id },
            data: { status: 'PROCESSED' }
          });

          processed++;
          logger.info(`Successfully processed document: ${document.originalName}`);

        } catch (error) {
          logger.error(`Error processing document ${document.originalName}:`, error);
          
          // Update document status to ERROR
          await prisma.documents.update({
            where: { id: document.id },
            data: { status: 'ERROR' }
          });

          errors.push(`${document.originalName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return { processed, errors };

    } catch (error) {
      logger.error('Error in generateEmbeddingsForActiveDocuments:', error);
      throw new Error('Failed to generate embeddings for active documents');
    }
  }
}

export const documentService = new DocumentService(); 