#!/usr/bin/env node

const axios = require('axios');

// Test profile update functionality
async function testProfileUpdate() {
  try {
    console.log('🧪 Testing profile update functionality...');
    
    // First, let's try to get the current user (this will require authentication)
    // For this test, we'll need a valid JWT token
    
    const baseURL = 'http://localhost:3001/api';
    
    // Test the health endpoint first
    console.log('📡 Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Note: For a real test, we would need to:
    // 1. Login to get a JWT token
    // 2. Use that token to authenticate the profile update request
    
    console.log('⚠️  To test profile update, you need to:');
    console.log('1. Login to the application in the browser');
    console.log('2. Open browser dev tools');
    console.log('3. Go to Application > Local Storage');
    console.log('4. Copy the JWT token');
    console.log('5. Use that token to test the API directly');
    
    console.log('\n📋 Profile update endpoint: PUT /users/profile');
    console.log('📋 Expected payload: { firstName: "string", lastName: "string", email: "string" }');
    console.log('📋 Expected response: User object without password');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testProfileUpdate(); 