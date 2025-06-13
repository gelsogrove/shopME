import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EmbeddingSearchResult {
  id: string;
  chunkId: string;
  content: string;
  similarity: number;
  sourceName: string;
  sourceType: 'document' | 'faq' | 'service';
}

export interface TextChunk {
  content: string;
  chunkIndex: number;
}

export class EmbeddingService {
  private readonly OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/embeddings';
  private readonly MODEL = 'text-embedding-3-small';
  private readonly MAX_CHUNK_SIZE = 2000;
  private readonly CHUNK_OVERLAP = 200;

  /**
   * Split text into chunks for embedding processing
   */
  splitTextIntoChunks(text: string): TextChunk[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const chunks: TextChunk[] = [];
    const cleanText = text.trim();

    if (cleanText.length <= this.MAX_CHUNK_SIZE) {
      chunks.push({
        content: cleanText,
        chunkIndex: 0
      });
      return chunks;
    }

    let startIndex = 0;
    let chunkIndex = 0;

    while (startIndex < cleanText.length) {
      let endIndex = startIndex + this.MAX_CHUNK_SIZE;

      if (endIndex < cleanText.length) {
        const lastSentenceEnd = cleanText.lastIndexOf('.', endIndex);
        const lastQuestionEnd = cleanText.lastIndexOf('?', endIndex);
        const lastExclamationEnd = cleanText.lastIndexOf('!', endIndex);
        
        const sentenceEnd = Math.max(lastSentenceEnd, lastQuestionEnd, lastExclamationEnd);
        
        if (sentenceEnd > startIndex + this.MAX_CHUNK_SIZE * 0.5) {
          endIndex = sentenceEnd + 1;
        } else {
          const lastSpace = cleanText.lastIndexOf(' ', endIndex);
          if (lastSpace > startIndex + this.MAX_CHUNK_SIZE * 0.5) {
            endIndex = lastSpace;
          }
        }
      }

      const chunkContent = cleanText.slice(startIndex, endIndex).trim();
      if (chunkContent.length > 0) {
        chunks.push({
          content: chunkContent,
          chunkIndex: chunkIndex
        });
        chunkIndex++;
      }

      startIndex = endIndex - this.CHUNK_OVERLAP;
      if (startIndex < 0) startIndex = 0;
      
      if (startIndex >= endIndex) {
        startIndex = endIndex;
      }
    }

    return chunks;
  }

  /**
   * Generate embedding for a text using OpenRouter API
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY not found in environment variables');
      }

      const response = await fetch(this.OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://laltroitalia.shop',
          'X-Title': "L'Altra Italia Shop"
        },
        body: JSON.stringify({
          model: this.MODEL,
          input: text
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.data || !data.data[0] || !data.data[0].embedding) {
        throw new Error('Invalid response format from OpenRouter API');
      }

      return data.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Generate embeddings for FAQ content - using the EXACT same approach as the working integration tests
   */
  async generateFAQEmbeddings(workspaceId: string): Promise<{ processed: number; errors: string[] }> {
    try {
      // Get all active FAQs for workspace - same as working tests
      const activeFAQs = await prisma.fAQ.findMany({
        where: {
          workspaceId: workspaceId,
          isActive: true
        }
      });

      if (activeFAQs.length === 0) {
        return { processed: 0, errors: ['No active FAQs found to process'] };
      }

      // Check which FAQs already have chunks - using same syntax as tests
      const faqsToProcess = [];
      for (const faq of activeFAQs) {
        const existingChunks = await prisma.fAQChunks.findMany({
          where: { faqId: faq.id }
        });
        
        if (existingChunks.length === 0) {
          faqsToProcess.push(faq);
        }
      }

      if (faqsToProcess.length === 0) {
        return { processed: 0, errors: ['No active FAQs found to process'] };
      }

      let processed = 0;
      const errors: string[] = [];

      // Process each FAQ
      for (const faq of faqsToProcess) {
        try {
          console.log(`Processing FAQ: ${faq.question}`);
          
          // Combine question and answer for embedding
          const faqContent = `Question: ${faq.question}\nAnswer: ${faq.answer}`;
          
          // Split into chunks
          const chunks = this.splitTextIntoChunks(faqContent);

          // Generate embeddings for each chunk
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            
            try {
              const embedding = await this.generateEmbedding(chunk.content);
              
              // Save chunk with embedding to database - same syntax as tests
              await prisma.fAQChunks.create({
                data: {
                  faqId: faq.id,
                  content: chunk.content,
                  chunkIndex: chunk.chunkIndex,
                  embedding: embedding
                }
              });
              
              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (chunkError) {
              console.error(`Error processing chunk ${chunk.chunkIndex} for FAQ ${faq.id}:`, chunkError);
              errors.push(`FAQ "${faq.question}" chunk ${chunk.chunkIndex}: ${chunkError instanceof Error ? chunkError.message : 'Unknown error'}`);
            }
          }

          processed++;
          console.log(`Successfully processed FAQ: ${faq.question}`);

        } catch (error) {
          console.error(`Error processing FAQ ${faq.question}:`, error);
          errors.push(`FAQ "${faq.question}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return { processed, errors };

    } catch (error) {
      console.error('Error in generateFAQEmbeddings:', error);
      throw new Error('Failed to generate FAQ embeddings');
    }
  }

  /**
   * Search across FAQ chunks using semantic similarity - same syntax as tests
   */
  async searchFAQs(query: string, workspaceId: string, limit: number = 5): Promise<EmbeddingSearchResult[]> {
    try {
      // Generate embedding for search query
      const queryEmbedding = await this.generateEmbedding(query);

      // Get all FAQ chunks for the workspace - same syntax as working code
      const chunks = await prisma.fAQChunks.findMany({
        where: {
          faq: {
            workspaceId: workspaceId,
            isActive: true
          }
        },
        include: {
          faq: {
            select: {
              id: true,
              question: true
            }
          }
        }
      });

      // Calculate similarity for each chunk
      const results: EmbeddingSearchResult[] = [];
      
      for (const chunk of chunks) {
        if (chunk.embedding && Array.isArray(chunk.embedding)) {
          try {
            const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding as number[]);
            
            results.push({
              id: chunk.faq.id,
              chunkId: chunk.id,
              content: chunk.content,
              similarity: similarity,
              sourceName: chunk.faq.question,
              sourceType: 'faq'
            });
          } catch (similarityError) {
            console.error('Error calculating similarity for FAQ chunk:', chunk.id, similarityError);
          }
        }
      }

      // Sort by similarity (highest first) and limit results
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    } catch (error) {
      console.error('Error searching FAQs:', error);
      throw new Error('Failed to search FAQs');
    }
  }

  /**
   * Generate embeddings for Service content - using the EXACT same approach as the working FAQ integration
   */
  async generateServiceEmbeddings(workspaceId: string): Promise<{ processed: number; errors: string[] }> {
    try {
      // Get all active Services for workspace - same as working FAQ tests
      const activeServices = await prisma.services.findMany({
        where: {
          workspaceId: workspaceId,
          isActive: true
        }
      });

      if (activeServices.length === 0) {
        return { processed: 0, errors: ['No active services found to process'] };
      }

      // Check which Services already have chunks - using same syntax as FAQ tests
      const servicesToProcess = [];
      for (const service of activeServices) {
        const existingChunks = await prisma.serviceChunks.findMany({
          where: { serviceId: service.id }
        });
        
        if (existingChunks.length === 0) {
          servicesToProcess.push(service);
        }
      }

      if (servicesToProcess.length === 0) {
        return { processed: 0, errors: ['No active services found to process'] };
      }

      let processed = 0;
      const errors: string[] = [];

      // Process each Service
      for (const service of servicesToProcess) {
        try {
          console.log(`Processing Service: ${service.name}`);
          
          // Combine name and description for embedding
          const serviceContent = `Service: ${service.name}\nDescription: ${service.description}\nPrice: ${service.price} ${service.currency}\nDuration: ${service.duration} minutes`;
          
          // Split into chunks
          const chunks = this.splitTextIntoChunks(serviceContent);

          // Generate embeddings for each chunk
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            
            try {
              const embedding = await this.generateEmbedding(chunk.content);
              
              // Save chunk with embedding to database - same syntax as FAQ tests
              await prisma.serviceChunks.create({
                data: {
                  serviceId: service.id,
                  content: chunk.content,
                  chunkIndex: chunk.chunkIndex,
                  embedding: embedding
                }
              });
              
              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (chunkError) {
              console.error(`Error processing chunk ${chunk.chunkIndex} for Service ${service.id}:`, chunkError);
              errors.push(`Service "${service.name}" chunk ${chunk.chunkIndex}: ${chunkError instanceof Error ? chunkError.message : 'Unknown error'}`);
            }
          }

          processed++;
          console.log(`Successfully processed Service: ${service.name}`);

        } catch (error) {
          console.error(`Error processing Service ${service.name}:`, error);
          errors.push(`Service "${service.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return { processed, errors };

    } catch (error) {
      console.error('Error in generateServiceEmbeddings:', error);
      throw new Error('Failed to generate service embeddings');
    }
  }

  /**
   * Search across Service chunks using semantic similarity - same syntax as FAQ tests
   */
  async searchServices(query: string, workspaceId: string, limit: number = 5): Promise<EmbeddingSearchResult[]> {
    try {
      // Generate embedding for search query
      const queryEmbedding = await this.generateEmbedding(query);

      // Get all Service chunks for the workspace - same syntax as working FAQ code
      const chunks = await prisma.serviceChunks.findMany({
        where: {
          service: {
            workspaceId: workspaceId,
            isActive: true
          }
        },
        include: {
          service: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      // Calculate similarity for each chunk
      const results: EmbeddingSearchResult[] = [];
      
      for (const chunk of chunks) {
        if (chunk.embedding && Array.isArray(chunk.embedding)) {
          try {
            const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding as number[]);
            
            results.push({
              id: chunk.service.id,
              chunkId: chunk.id,
              content: chunk.content,
              similarity: similarity,
              sourceName: chunk.service.name,
              sourceType: 'service'
            });
          } catch (similarityError) {
            console.error('Error calculating similarity for Service chunk:', chunk.id, similarityError);
          }
        }
      }

      // Sort by similarity (highest first) and limit results
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    } catch (error) {
      console.error('Error searching Services:', error);
      throw new Error('Failed to search services');
    }
  }
}

// Export a singleton instance
export const embeddingService = new EmbeddingService(); 