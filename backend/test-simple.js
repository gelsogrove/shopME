const axios = require('axios');

async function testBackendFunctionDefinitions() {
  console.log('🚀 Testing backend function definitions...\n');

  try {
    // Test the internal API endpoint to get function definitions
    const response = await axios.get('http://localhost:3001/api/internal/agent-config/cm9hjgq9v00014qk8fsdy4ujv');
    
    console.log('✅ Backend agent config:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Test the tool descriptions endpoint
    const toolResponse = await axios.get('http://localhost:3001/api/internal/tool-descriptions');
    
    console.log('\n✅ Backend tool descriptions:');
    console.log(JSON.stringify(toolResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing backend:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testBackendFunctionDefinitions();
