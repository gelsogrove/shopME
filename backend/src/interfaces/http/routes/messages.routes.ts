import dotenv from 'dotenv';
import express from 'express';
import OpenAI from 'openai';
import { MessageController } from '../controllers/message.controller';
import { asyncHandler } from '../middlewares/async.middleware';

// Load environment variables
dotenv.config();

export const messagesRouter = (): express.Router => {
  const router = express.Router();
  const messageController = new MessageController();

  /**
   * @route POST /api/messages
   * @desc Process a message and return a response
   * @access Public
   */
  router.post('/', asyncHandler(messageController.processMessage.bind(messageController)));
  
  /**
   * @route GET /api/messages/test
   * @desc Test endpoint for debugging metadata extraction
   * @access Public
   */
  router.get('/test', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Message test endpoint is working. POST a message to /api/messages to see the full response with metadata.'
    });
  });
  
  /**
   * @route GET /api/messages/test/openai
   * @desc Test OpenAI/OpenRouter connectivity
   * @access Public
   */
  router.get('/test/openai', asyncHandler(async (req, res) => {
    try {
      // Get API key from env
      const apiKey = process.env.OPENAI_API_KEY || '';
      
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          message: 'API key is missing from environment variables'
        });
      }
      
      // Initialize OpenAI with OpenRouter configuration
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://laltroitalia.shop",
          "X-Title": "L'Altra Italia Shop"
        }
      });
      
      // Make a simple test call
      const response = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Say hello in Italian" }
        ],
        temperature: 0.3,
        max_tokens: 50
      });
      
      // Return the response
      res.status(200).json({
        success: true,
        message: 'OpenAI/OpenRouter connectivity test successful',
        response: response
      });
    } catch (error) {
      // Return the error
      res.status(500).json({
        success: false,
        message: 'OpenAI/OpenRouter connectivity test failed',
        error: error.message,
        details: error
      });
    }
  }));

  return router;
}; 