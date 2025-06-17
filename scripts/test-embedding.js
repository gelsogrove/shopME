const { embeddingService } = require('./backend/src/services/embeddingService');

async function testEmbedding() {
  try {
    console.log('🧪 Testing embedding generation...');
    console.log('Query: "hai il limoncello?"');
    
    const embedding = await embeddingService.generateEmbedding('hai il limoncello?');
    
    console.log('✅ Embedding generated successfully!');
    console.log('Embedding length:', embedding.length);
    console.log('First 10 values:', embedding.slice(0, 10));
    console.log('Embedding type:', typeof embedding[0]);
    
  } catch (error) {
    console.error('❌ Embedding generation failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

testEmbedding(); 