import { pipeline } from '@xenova/transformers';

export interface HuggingFaceEmbeddingResponse {
  embeddings: number[][];
}

export class HuggingFaceService {
  private embeddingPipeline: any = null;
  private readonly model = 'Xenova/all-MiniLM-L6-v2'; // Same model as Hugging Face, but local
  private isInitializing = false;

  constructor() {
    // Initialize pipeline lazily to avoid blocking startup
  }

  /**
   * Initialize the embedding pipeline
   */
  private async initializePipeline(): Promise<void> {
    if (this.embeddingPipeline || this.isInitializing) {
      return;
    }

    try {
      this.isInitializing = true;
      console.log('🤖 Initializing local embedding model (Xenova/all-MiniLM-L6-v2)...');
      
      this.embeddingPipeline = await pipeline('feature-extraction', this.model, {
        quantized: false, // Better quality
      });
      
      console.log('✅ Local embedding model initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing embedding pipeline:', error);
      throw new Error('Failed to initialize local embedding model');
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Generate embeddings for text chunks using local model
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      // Ensure pipeline is initialized
      await this.initializePipeline();
      
      if (!this.embeddingPipeline) {
        throw new Error('Embedding pipeline not initialized');
      }

      const embeddings: number[][] = [];
      
      console.log(`🔄 Generating embeddings for ${texts.length} text chunks locally...`);
      
      // Process texts one by one for better memory management
      for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        console.log(`Processing chunk ${i + 1}/${texts.length}...`);
        
        // Generate embedding using local model
        const result = await this.embeddingPipeline(text, {
          pooling: 'mean',
          normalize: true
        });
        
        // Convert tensor to array
        const embedding = Array.from(result.data as number[]);
        embeddings.push(embedding);
        
        // Small delay to prevent overwhelming the system
        if (i < texts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      console.log(`✅ Successfully generated ${embeddings.length} embeddings locally`);
      return embeddings;
      
    } catch (error) {
      console.error('❌ Error generating embeddings with local model:', error);
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.generateEmbeddings([text]);
    return embeddings[0];
  }

  /**
   * Get model information
   */
  getModelInfo(): { name: string; type: string; local: boolean; dimensions: number } {
    return {
      name: this.model,
      type: 'Local Transformer Model (Sentence Transformers)',
      local: true,
      dimensions: 384 // all-MiniLM-L6-v2 produces 384-dimensional embeddings
    };
  }

  /**
   * Check if the service is ready
   */
  async isReady(): Promise<boolean> {
    try {
      await this.initializePipeline();
      return !!this.embeddingPipeline;
    } catch {
      return false;
    }
  }
}

export const huggingFaceService = new HuggingFaceService(); 