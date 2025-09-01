// Test completo del sistema per Maria Garcia
const axios = require('axios');

async function testMariaGarcia() {
  try {
    console.log('🧪 Testing complete system for Maria Garcia...');
    
    const testData = {
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: '+34666777888',
              text: {
                body: 'what products do you have?'
              }
            }]
          }
        }]
      }]
    };
    
    console.log('📤 Sending request to webhook...');
    
    const response = await axios.post('http://localhost:3001/api/whatsapp/webhook', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Response received:', response.data);
    console.log('🔍 Debug info:', response.data.debug);
    
    if (response.data.debug) {
      console.log('\n📋 PROMPT VARIABLES IN DEBUG:');
      console.log('Translated Query:', response.data.debug.translatedQuery);
      console.log('Processed Prompt preview:', response.data.debug.processedPrompt?.substring(0, 500) + '...');
      console.log('Function Calls:', response.data.debug.functionCalls);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testMariaGarcia();
