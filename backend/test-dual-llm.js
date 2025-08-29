const axios = require('axios');

async function testDualLLMService() {
  console.log('🚀 Testing DualLLMService directly...\n');

  const request = {
    chatInput: "show me the list of orders",
    customerid: "test-customer-123",
    workspaceId: "cm9hjgq9v00014qk8fsdy4ujv",
    messages: []
  };

  try {
    // Test the webhook endpoint directly
    const response = await axios.post('http://localhost:3001/api/whatsapp/webhook', request, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Webhook Response:');
    console.log(JSON.stringify(response.data, null, 2));

    // Test the internal test endpoint
    const testResponse = await axios.post('http://localhost:3001/api/test/dual-llm', request, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Test Endpoint Response:');
    console.log(JSON.stringify(testResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error testing DualLLMService:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testDualLLMService();
