import { Router } from 'express';
import { MessageRepository } from '../../../repositories/message.repository';
import { InternalApiController } from '../controllers/internal-api.controller';
import { n8nAuthMiddleware } from '../middlewares/n8n-auth.middleware';

const router = Router();

// Initialize dependencies
const messageRepository = new MessageRepository();
const internalApiController = new InternalApiController(messageRepository);

// Apply N8N authentication middleware to all internal routes
router.use(n8nAuthMiddleware);

/**
 * Internal API Routes for N8N Integration
 * All routes require N8N authentication via INTERNAL_API_SECRET
 */

// Channel status check
router.get('/channel-status/:workspaceId', (req, res) => 
  internalApiController.getChannelStatus(req, res)
);

// User registration check
router.get('/user-check/:workspaceId/:phone', (req, res) => 
  internalApiController.getUserCheck(req, res)
);

// WIP status check
router.get('/wip-status/:workspaceId/:phone', (req, res) => 
  internalApiController.getWipStatus(req, res)
);

// RAG search across all content types
router.post('/rag-search', (req, res) => 
  internalApiController.ragSearch(req, res)
);

// LLM processing with context
router.post('/llm-process', (req, res) => 
  internalApiController.llmProcess(req, res)
);

// Save message and conversation
router.post('/save-message', (req, res) => 
  internalApiController.saveMessage(req, res)
);

// Get conversation history
router.get('/conversation-history/:workspaceId/:phone', (req, res) => 
  internalApiController.getConversationHistory(req, res)
);

// Welcome user and generate registration
router.post('/welcome-user', (req, res) => 
  internalApiController.welcomeUser(req, res)
);

export default router; 