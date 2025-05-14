import logger from "../../utils/logger";

/**
 * Service layer for OpenAI
 * Handles business logic for OpenAI integration
 */
export class OpenAIService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseURL = "https://openrouter.ai/api/v1";
  }

  /**
   * Test the OpenAI connection
   */
  async testConnection(): Promise<{ 
    status: string;
    message: string;
    config?: any;
    model?: string;
    response?: string;
    error?: any;
  }> {
    try {
      // Check if OpenAI is properly configured
      if (!this.apiKey || this.apiKey.length < 10 || this.apiKey === 'your-api-key-here') {
        return {
          status: "error",
          message: "OpenAI API key not properly configured"
        };
      }

      // Initialize OpenAI client
      const OpenAI = require('openai');
      const openai = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseURL,
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
      return {
        status: "ok",
        message: "OpenAI API connection successful",
        config: {
          apiKeyPrefix: this.apiKey.substring(0, 10) + "...",
          baseURL: this.baseURL
        },
        model: completion.model,
        response: completion.choices[0]?.message?.content
      };
    } catch (error) {
      logger.error("OpenAI API connection error:", error);

      // Prepare detailed error response
      return {
        status: "error",
        message: "Failed to connect to OpenAI API",
        error: {
          name: error.name,
          message: error.message,
          status: error.status || "unknown"
        }
      };
    }
  }
}

export default new OpenAIService(); 