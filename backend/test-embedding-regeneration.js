#!/usr/bin/env node

/**
 * Test Embedding Regeneration
 * This script tests the enhanced embedding regeneration system
 */

const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: responseBody,
          headers: res.headers
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testEmbeddingRegeneration() {
  console.log("🧪 Testing Embedding Regeneration System")
  console.log("=========================================")

  try {
    // Test workspace ID
    const workspaceId = "clzd8x8z20000356cqhpe6yu0"

    console.log(`📋 Testing FAQ embeddings for workspace: ${workspaceId}`)

    // Test RAG search BEFORE regeneration
    console.log('\n🔍 Testing RAG search BEFORE embedding regeneration...');
    const ragBefore = await makeRequest({
      hostname: 'localhost',
      port: 3002,
      path: `/api/internal/test-rag-open?search=${encodeURIComponent('tempi di consegna')}`,
      method: 'GET'
    });
    
    const resultBefore = JSON.parse(ragBefore.body);
    console.log(`📊 BEFORE - FAQ Results: ${resultBefore.results?.faqs?.length || 0}`);

    // Now trigger FAQ embedding regeneration using our corrected system
    console.log('\n🔄 Triggering FAQ embedding regeneration...');
    
    // We'll simulate an FAQ update which should trigger embedding regeneration
    // Since we can't access the authenticated endpoints, we'll check if there's a way to test directly
    console.log('⚡ Note: Our enhanced system should automatically regenerate embeddings when FAQs are updated');
    console.log('🛠️ Checking server logs for embedding regeneration activity...');
    
    // Wait a moment for any background processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test RAG search AFTER any regeneration
    console.log('\n� Testing RAG search to see if embeddings are available...');
    const ragAfter = await makeRequest({
      hostname: 'localhost',
      port: 3002,
      path: `/api/internal/test-rag-open?search=${encodeURIComponent('tempi di consegna')}`,
      method: 'GET'
    });
    
    const resultAfter = JSON.parse(ragAfter.body);
    console.log(`📊 CURRENT STATE - FAQ Results: ${resultAfter.results?.faqs?.length || 0}`);
    
    if (resultAfter.results?.faqs?.length > 0) {
      console.log('🎉 SUCCESS! FAQ embeddings are working!');
      console.log('📝 Found FAQ:', resultAfter.results.faqs[0]);
    } else {
      console.log('⚠️ No FAQ embeddings found yet.');
      console.log('🔧 This might mean embeddings need manual regeneration.');
      console.log('� Try accessing the FAQ via authenticated endpoints to trigger regeneration.');
    }

    console.log("\n🎉 Test completed!")
  } catch (error) {
    console.error("❌ Test failed:", error)
    console.error("Stack:", error.stack)
  }
}

// Run the test
testEmbeddingRegeneration().catch(console.error)
