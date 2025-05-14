import { NextFunction, Request, Response } from "express";
import { OpenAIService } from "../../../application/services/openai.service";
import logger from "../../../utils/logger";

export class OpenAIController {
  private openaiService: OpenAIService;

  constructor(openaiService?: OpenAIService) {
    this.openaiService = openaiService || new OpenAIService();
  }

  /**
   * Test OpenAI API connection
   */
  testConnection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.openaiService.testConnection();
      
      if (result.status === "error") {
        return res.status(500).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error testing OpenAI connection:', error);
      return next(error);
    }
  };
} 