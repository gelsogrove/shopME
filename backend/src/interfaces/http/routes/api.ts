// Add a route to test OpenAI connection
router.get('/test/openai', async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY || '';
    console.log(`API key test - key present: ${!!apiKey}, key length: ${apiKey ? apiKey.length : 0}`);
    if (apiKey) {
      console.log(`API key prefix: ${apiKey.substring(0, 10)}...`);
    }

    // Check if OpenAI is properly configured
    if (!apiKey || apiKey.length < 10 || apiKey === 'your-api-key-here') {
      return res.status(500).json({ 
        status: "error", 
        message: "OpenAI API key not properly configured" 
      });
    }

    // Initialize OpenAI client
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://laltroitalia.shop",
        "X-Title": "L'Altra Italia Shop"
      }
    });

    // Make a simple request to test the connection
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: "Hello! This is a test message." }],
      max_tokens: 5
    });

    // Return success response with completion info
    return res.status(200).json({ 
      status: "ok", 
      message: "OpenAI API connection successful",
      config: {
        apiKeyPrefix: apiKey.substring(0, 10) + "...",
        baseURL: "https://openrouter.ai/api/v1"
      },
      model: completion.model,
      response: completion.choices[0]?.message?.content
    });
  } catch (error) {
    console.error("OpenAI API connection error:", error);
    
    // Prepare detailed error response
    const errorResponse = {
      status: "error",
      message: "Failed to connect to OpenAI API",
      error: {
        name: error.name,
        message: error.message,
        status: error.status || "unknown"
      }
    };
    
    return res.status(500).json(errorResponse);
  }
}); 