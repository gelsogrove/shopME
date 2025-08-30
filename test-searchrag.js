#!/usr/bin/env node

// 🧪 TEST SEARCHRAG IMPLEMENTATION
// Testa la nuova implementazione SearchRag con l'endpoint CF/SearchRag

const axios = require('axios');

const BACKEND_URL = "http://localhost:3001";
const WORKSPACE_ID = "cm9hjgq9v00014qk8fsdy4ujv";
const CUSTOMER_ID = "test-customer-123";

  console.log('🚀 Testing SearchRag implementation...\n');

  try {
    // Test 1: CF/SearchRag endpoint
    console.log('📋 Test 1: CF/SearchRag endpoint');
    const cfResponse = await axios.post(`${BACKEND_URL}/api/internal/CF/SearchRag`, {
      query: "mozzarella products",
      workspaceId: WORKSPACE_ID,
      customerId: CUSTOMER_ID
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ CF/SearchRag Response:', {
      success: cfResponse.data.success,
      hasResults: !!cfResponse.data.results,
      resultsCount: cfResponse.data.results ? Object.keys(cfResponse.data.results).length : 0,
      query: cfResponse.data.query
    });

    // Test 2: Direct rag-search endpoint for comparison
    console.log('\n📋 Test 2: Direct rag-search endpoint (for comparison)');
    const directResponse = await axios.post(`${BACKEND_URL}/api/internal/rag-search`, {
      query: "mozzarella products",
      workspaceId: WORKSPACE_ID,
      customerId: CUSTOMER_ID,
      businessType: "ECOMMERCE",
      customerLanguage: "en"
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Direct rag-search Response:', {
      hasResults: !!directResponse.data.results,
      resultsCount: directResponse.data.results ? Object.keys(directResponse.data.results).length : 0
    });

    console.log('\n🎉 SearchRag implementation test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
}

// Run the test
testSearchRag();
