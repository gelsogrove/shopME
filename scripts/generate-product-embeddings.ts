import { PrismaClient } from '@prisma/client';
import { embeddingService } from '../backend/src/services/embeddingService';

const prisma = new PrismaClient();

async function generateProductEmbeddings() {
  try {
    console.log('🚀 Starting product embeddings generation...');
    
    const workspaceId = 'cm9hjgq9v00014qk8fsdy4ujv';
    
    const result = await embeddingService.generateProductEmbeddings(workspaceId);
    
    console.log('✅ Product embeddings generation completed!');
    console.log(`📊 Processed: ${result.processed} products`);
    
    if (result.errors.length > 0) {
      console.log('⚠️ Errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
  } catch (error) {
    console.error('❌ Error generating product embeddings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateProductEmbeddings(); 