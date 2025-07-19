import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EmbeddingSearchResult {
  id: string;
  chunkId: string;
  content: string;
  similarity: number;
  sourceName: string;
  sourceType: 'document' | 'faq' | 'service' | 'product';
}

export interface TextChunk {
  content: string;
  chunkIndex: number;
}

export class EmbeddingService {
  // Using local embeddings instead of OpenRouter (which doesn't support embeddings)
  private readonly LOCAL_MODEL = 'Xenova/all-MiniLM-L6-v2';
  private readonly MAX_CHUNK_SIZE = 1500; // 🚀 OPTIMIZED: Increased from 500 to 1500 for better context preservation
  private readonly CHUNK_OVERLAP = 300;   // 🚀 OPTIMIZED: Increased from 200 to 300 for better semantic continuity

  // 🎯 CONFIGURABLE SIMILARITY THRESHOLDS (Andrea's Request)
  private readonly SIMILARITY_THRESHOLDS = {
    FAQ: 0.5,      // Lowered from 0.3 to 0.15 for better recall on paraphrased questions
    PRODUCTS: 0.3, // Good balance for product search
    SERVICES: 0.3, // Higher threshold for service precision  
    DOCUMENTS: 0.3 // 🚀 OPTIMIZED: Lowered from 0.5 to 0.3 for better recall with larger, higher-quality chunks
  };

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
   * Generate embedding for a text using local transformers
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Import transformers dynamically to avoid loading issues
      const { pipeline } = await import('@xenova/transformers');
      
      // Create embedding pipeline with local model
      const embedder = await pipeline('feature-extraction', this.LOCAL_MODEL);
      
      // Generate embedding
      const embedding = await embedder(text, { pooling: 'mean', normalize: true });
      
      // Convert to array format
      return Array.from(embedding.data);
    } catch (error) {
      console.error('Error generating local embedding:', error);
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
   * Generate embeddings for FAQ content - always processes ALL active FAQs
   */
  async generateFAQEmbeddings(workspaceId: string): Promise<{ processed: number; errors: string[] }> {
    try {
      // Get all active FAQs for workspace
      const activeFAQs = await prisma.fAQ.findMany({
        where: {
          workspaceId: workspaceId,
          isActive: true
        }
      });

      if (activeFAQs.length === 0) {
        return { processed: 0, errors: ['No active FAQs found to process'] };
      }

      // Delete all existing chunks for FAQs in this workspace before regenerating
      await prisma.fAQChunks.deleteMany({
        where: {
          faq: {
            workspaceId: workspaceId
          }
        }
      });

      console.log(`Deleted existing FAQ chunks for workspace ${workspaceId}`);

      let processed = 0;
      const errors: string[] = [];

      // Process ALL active FAQs (no filtering based on existing chunks)
      for (const faq of activeFAQs) {
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

      // Filter by minimum similarity threshold and sort by similarity (highest first)
      const MINIMUM_SIMILARITY = this.SIMILARITY_THRESHOLDS.FAQ;
      return results
        .filter(result => result.similarity >= MINIMUM_SIMILARITY)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    } catch (error) {
      console.error('Error searching FAQs:', error);
      throw new Error('Failed to search FAQs');
    }
  }

  /**
   * Generate embeddings for Service content - always processes ALL active services
   */
  async generateServiceEmbeddings(workspaceId: string): Promise<{ processed: number; errors: string[] }> {
    try {
      // Get all active Services for workspace
      const activeServices = await prisma.services.findMany({
        where: {
          workspaceId: workspaceId,
          isActive: true
        }
      });

      if (activeServices.length === 0) {
        return { processed: 0, errors: ['No active services found to process'] };
      }

      // Delete all existing chunks for Services in this workspace before regenerating
      await prisma.serviceChunks.deleteMany({
        where: {
          service: {
            workspaceId: workspaceId
          }
        }
      });

      console.log(`Deleted existing Service chunks for workspace ${workspaceId}`);

      let processed = 0;
      const errors: string[] = [];

      // Process ALL active Services (no filtering based on existing chunks)
      for (const service of activeServices) {
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

      // Filter by minimum similarity threshold and sort by similarity (highest first)
      const MINIMUM_SIMILARITY = this.SIMILARITY_THRESHOLDS.SERVICES;
      return results
        .filter(result => result.similarity >= MINIMUM_SIMILARITY)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    } catch (error) {
      console.error('Error searching Services:', error);
      throw new Error('Failed to search services');
    }
  }

  /**
   * Generate embeddings for Product content - always processes ALL active products
   */
  async generateProductEmbeddings(workspaceId: string): Promise<{ processed: number; errors: string[] }> {
    try {
      // Get all active Products for workspace
      const activeProducts = await prisma.products.findMany({
        where: {
          workspaceId: workspaceId,
          isActive: true
        },
        include: {
          category: true
        }
      });

      if (activeProducts.length === 0) {
        return { processed: 0, errors: ['No active products found to process'] };
      }

      // Delete all existing chunks for Products in this workspace before regenerating
      await prisma.productChunks.deleteMany({
        where: {
          product: {
            workspaceId: workspaceId
          }
        }
      });

      console.log(`Deleted existing Product chunks for workspace ${workspaceId}`);

      let processed = 0;
      const errors: string[] = [];

      // Process ALL active Products (no filtering based on existing chunks)
      for (const product of activeProducts) {
        try {
          console.log(`Processing Product: ${product.name}`);
          
          // Create rich content for embedding with multilingual keywords
          const productContent = `
Product: ${product.name}
Description: ${product.description || ''}
Category: ${product.category?.name || 'General'}
Price: €${product.price}
Stock: ${product.stock} units
SKU: ${product.sku || ''}

Keywords and Synonyms:
${this.generateProductKeywords(product.name, product.category?.name)}

Multilingual Terms:
${this.generateMultilingualTerms(product.name, product.category?.name)}
          `.trim();
          
          // Split into chunks
          const chunks = this.splitTextIntoChunks(productContent);

          // Generate embeddings for each chunk
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            
            try {
              const embedding = await this.generateEmbedding(chunk.content);
              
              // Save chunk with embedding to database
              await prisma.productChunks.create({
                data: {
                  productId: product.id,
                  content: chunk.content,
                  chunkIndex: chunk.chunkIndex,
                  embedding: embedding,
                  workspaceId: workspaceId,
                  language: 'multi' // Multi-language content
                }
              });
              
              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (chunkError) {
              console.error(`Error processing chunk ${chunk.chunkIndex} for Product ${product.id}:`, chunkError);
              errors.push(`Product "${product.name}" chunk ${chunk.chunkIndex}: ${chunkError instanceof Error ? chunkError.message : 'Unknown error'}`);
            }
          }

          processed++;
          console.log(`Successfully processed Product: ${product.name}`);

        } catch (error) {
          console.error(`Error processing Product ${product.name}:`, error);
          errors.push(`Product "${product.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return { processed, errors };

    } catch (error) {
      console.error('Error in generateProductEmbeddings:', error);
      throw new Error('Failed to generate product embeddings');
    }
  }

  /**
   * Search across Product chunks using semantic similarity with availability check
   */
  async searchProducts(query: string, workspaceId: string, limit: number = 5): Promise<EmbeddingSearchResult[]> {
    try {
      // Generate embedding for search query
      console.log(`[EMBEDDING] Generating embedding for query: "${query}"`);
      const queryEmbedding = await this.generateEmbedding(query);
      console.log(`[EMBEDDING] Query embedding generated: ${queryEmbedding.length} dimensions`);

      // Get all Product chunks for the workspace
      console.log(`[EMBEDDING] Searching in product chunks for workspace: ${workspaceId}`);
      const chunks = await prisma.productChunks.findMany({
        where: {
          workspaceId: workspaceId,
          product: {
            isActive: true,
            stock: {
              gt: 0 // ONLY products with stock > 0
            }
          }
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
              category: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });
      console.log(`[EMBEDDING] Found ${chunks.length} product chunks to search`);

      // Calculate similarity for each chunk
      const results: EmbeddingSearchResult[] = [];
      
      for (const chunk of chunks) {
        if (chunk.embedding && Array.isArray(chunk.embedding)) {
          try {
            const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding as number[]);
            
            results.push({
              id: chunk.product.id,
              chunkId: chunk.id,
              content: chunk.content,
              similarity: similarity,
              sourceName: chunk.product.name,
              sourceType: 'product'
            });
          } catch (similarityError) {
            console.error('Error calculating similarity for Product chunk:', chunk.id, similarityError);
          }
        }
      }

      // Filter by minimum similarity threshold and sort by similarity (highest first)
      const MINIMUM_SIMILARITY = this.SIMILARITY_THRESHOLDS.PRODUCTS;
      const filteredResults = results
        .filter(result => result.similarity >= MINIMUM_SIMILARITY)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
      
      console.log(`[EMBEDDING] Found ${results.length} total results, ${filteredResults.length} above threshold ${MINIMUM_SIMILARITY}`);
      if (filteredResults.length > 0) {
        console.log(`[EMBEDDING] Top result: "${filteredResults[0].sourceName}" with similarity ${filteredResults[0].similarity.toFixed(3)}`);
      }
      
      return filteredResults;

    } catch (error) {
      console.error('Error searching Products:', error);
      throw new Error('Failed to search products');
    }
  }

  /**
   * Generate product-specific keywords for better semantic search
   */
  private generateProductKeywords(productName: string, categoryName?: string): string {
    const name = productName.toLowerCase();
    const category = categoryName?.toLowerCase() || '';
    
    const keywords: string[] = [];
    
    // Food-specific keywords based on product name
    if (name.includes('mozzarella')) {
      keywords.push('cheese', 'formaggio', 'queso', 'fromage', 'käse', 'fresh cheese', 'dairy', 'latticini', 'lácteos');
      if (name.includes('bufala')) {
        keywords.push('buffalo', 'bufala', 'búfala', 'bufflonne', 'büffel');
      }
    }
    
    if (name.includes('parmigiano') || name.includes('parmesan')) {
      keywords.push('hard cheese', 'aged cheese', 'grated cheese', 'formaggio stagionato', 'queso curado');
    }
    
    if (name.includes('pasta') || name.includes('spaghetti') || name.includes('tagliatelle')) {
      keywords.push('pasta', 'noodles', 'spaghetti', 'tagliatelle', 'linguine', 'penne', 'fusilli');
    }
    
    if (name.includes('prosciutto')) {
      keywords.push('ham', 'cured meat', 'salumi', 'jamón', 'jambon', 'schinken');
    }
    
    if (name.includes('pizza')) {
      keywords.push('pizza', 'margherita', 'napoletana', 'italian pizza');
    }
    
    if (name.includes('olio') || name.includes('oil')) {
      keywords.push('olive oil', 'extra virgin', 'olio extravergine', 'aceite de oliva');
    }
    
    // Category-based keywords
    if (category.includes('cheese')) {
      keywords.push('dairy products', 'cheese', 'formaggio', 'queso', 'fromage');
    }
    
    return keywords.join(', ');
  }

  /**
   * Generate multilingual terms for better international search
   */
  private generateMultilingualTerms(productName: string, categoryName?: string): string {
    const terms: string[] = [];
    
    // Italian terms
    terms.push('prodotto italiano', 'made in italy', 'autentico', 'tradizionale', 'artigianale');
    
    // Spanish terms  
    terms.push('producto italiano', 'hecho en italia', 'auténtico', 'tradicional', 'artesanal');
    
    // English terms
    terms.push('italian product', 'authentic', 'traditional', 'artisanal', 'gourmet');
    
    // French terms
    terms.push('produit italien', 'authentique', 'traditionnel', 'artisanal');
    
    return terms.join(', ');
  }
}

// Export a singleton instance
export const embeddingService = new EmbeddingService(); 