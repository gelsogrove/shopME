import { Router } from "express";
import { OpenAIController } from "../controllers/openai.controller";
import { asyncHandler } from "../middlewares/async.middleware";

export const createOpenAIRouter = (openaiController: OpenAIController): Router => {
  const router = Router();

  // Routes
  router.get("/test", asyncHandler(openaiController.testConnection.bind(openaiController)));

  return router;
};

export { createOpenAIRouter as openaiRouter };
