// Aggiungo un endpoint di test per OpenAI nel router principale
// @ts-ignore
app.get("/api/test/openai", authMiddleware, async (req, res) => {
  try {
    // Check if OpenAI is properly configured
    const apiKey = process.env.OPENAI_API_KEY;
    const isConfigured = apiKey && apiKey.length > 10 && apiKey !== 'your-api-key-here';
    
    if (!isConfigured) {
      return res.status(500).json({ 
        status: "error", 
        message: "OpenAI API key not properly configured" 
      });
    }

    // Initialize OpenAI client
    // @ts-ignore
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://laltroitalia.shop",
        "X-Title": "L'Altra Italia Shop",
        "Content-Type": "application/json"
      },
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
      model: completion.model,
      response: completion.choices[0]?.message?.content,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + "..." : "missing"
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