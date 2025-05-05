// Script to test OpenRouter API connection
// Run with: node getOpenRouterResponse.js "Your prompt here"
const { OpenAI } = require('openai');
require('dotenv').config();

// Get the prompt from command line argument or use a default
const prompt = process.argv[2] || 'Say hello';

// Function to test OpenRouter connection
async function getOpenRouterResponse(promptText) {
  try {
    // Get API key from .env
    const apiKey = process.env.OPENAI_API_KEY;
    console.log(`Using API key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'missing'}`);
    
    if (!apiKey) {
      console.error('ERROR: API key is missing');
      return null;
    }
    
    // Create OpenAI client with OpenRouter configuration
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://laltroitalia.shop',
        'X-Title': 'L\'Altra Italia Shop'
      }
    });
    
    // Make the request
    console.log(`Sending prompt: "${promptText}"`);
    
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: promptText }],
      max_tokens: 50
    });
    
    // Log and return the response
    const response = completion.choices[0]?.message?.content;
    console.log(`Response: "${response}"`);
    return response;
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Execute the function
getOpenRouterResponse(prompt)
  .then(response => {
    if (response) {
      console.log('Successfully received response from OpenRouter');
      process.exit(0);
    } else {
      console.error('Failed to get response from OpenRouter');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 