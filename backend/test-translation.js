const axios = require('axios');
require('dotenv').config();

async function testTranslation() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('🔑 API Key exists:', !!apiKey);
  console.log('🔑 API Key (first 20 chars):', apiKey ? apiKey.substring(0, 20) + '...' : 'MISSING');
  
  try {
    const text = "ciao quando arriva la mia merce?";
    console.log('🌐 Testing translation for:', text);
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'google/gemma-2-9b-it:free',
      messages: [
        {
          role: 'system',
          content: 'You are a translator for an e-commerce platform. Translate the user\'s message to English using e-commerce terminology. For questions about delivery times, shipping, receiving goods, use keywords like "delivery time", "shipping time", "delivery", "shipping". Return ONLY the English translation, no explanations.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.1,
      max_tokens: 100
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'ShopMe Translation Test'
      },
      timeout: 10000
    });

    const translation = response.data.choices[0]?.message?.content?.trim();
    console.log('✅ Translation successful!');
    console.log('📝 Original:', text);
    console.log('🌐 Translated:', translation);
    
  } catch (error) {
    console.error('❌ Translation failed!');
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Response:', error.response.data);
    }
  }
}

testTranslation();
