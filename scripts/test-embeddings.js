const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api';
const WORKSPACE_ID = 'cm9hjgq9v00014qk8fsdy4ujv';

async function login() {
  // Try different password combinations
  const credentials = [
    { email: 'admin@shopme.com', password: 'admin123' },
    { email: 'admin@shopme.com', password: '' },
    { email: 'admin@shopme.com', password: 'password' },
    { email: 'admin@shopme.com', password: 'admin' }
  ];

  for (const cred of credentials) {
    try {
      console.log(`Trying login with email: ${cred.email}, password: "${cred.password}"`);
      
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cred),
      });

      const data = await response.json();
      
      if (data.success && data.data.token) {
        console.log('✅ Login successful with credentials:', cred.email);
        return data.data.token;
      } else {
        console.log(`❌ Failed with "${cred.password}":`, data.message);
      }
    } catch (error) {
      console.log(`❌ Login error with "${cred.password}":`, error.message);
    }
  }
  
  console.error('❌ All login attempts failed');
  return null;
}

async function testFAQEmbeddings(token) {
  try {
    console.log('\n🔧 Testing FAQ embeddings...');
    
    const response = await fetch(`${BASE_URL}/workspaces/${WORKSPACE_ID}/faqs/generate-embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ FAQ embeddings successful:', data.data);
    } else {
      console.error('❌ FAQ embeddings failed:', data);
    }
  } catch (error) {
    console.error('❌ FAQ embeddings error:', error.message);
  }
}

async function testDocumentEmbeddings(token) {
  try {
    console.log('\n📄 Testing Document embeddings...');
    
    const response = await fetch(`${BASE_URL}/workspaces/${WORKSPACE_ID}/documents/generate-embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Document embeddings successful:', data.data);
    } else {
      console.error('❌ Document embeddings failed:', data);
    }
  } catch (error) {
    console.error('❌ Document embeddings error:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting embedding tests...');
  
  const token = await login();
  if (!token) {
    console.error('Cannot proceed without token');
    process.exit(1);
  }

  await testFAQEmbeddings(token);
  await testDocumentEmbeddings(token);
  
  console.log('\n✅ Tests completed');
}

main().catch(console.error); 