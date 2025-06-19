import { Router } from 'express';
import { MessageRepository } from '../../../repositories/message.repository';
import { InternalApiController } from '../controllers/internal-api.controller';
import { n8nAuthMiddleware } from '../middlewares/n8n-auth.middleware';

const router = Router();
const messageRepository = new MessageRepository();
const internalApiController = new InternalApiController(messageRepository);

// 🧪 OPEN TEST ENDPOINT - No Auth Required (Andrea's Testing)
// This endpoint is OUTSIDE the auth middleware for easy testing
router.get('/test-rag-open', 
  internalApiController.testRagOpen.bind(internalApiController));

// Apply authentication middleware to all other internal API routes
router.use(n8nAuthMiddleware);

/**
 * N8N Internal API Routes with Multi-Business Support
 * Protected by INTERNAL_API_SECRET authentication
 */

// Channel and workspace information
router.get('/channel-status/:workspaceId', 
  internalApiController.getChannelStatus.bind(internalApiController));

router.get('/business-type/:workspaceId', 
  internalApiController.getBusinessType.bind(internalApiController));

// User management
router.get('/user-check/:workspaceId/:phone', 
  internalApiController.getUserCheck.bind(internalApiController));

router.get('/wip-status/:workspaceId/:phone', 
  internalApiController.getWipStatus.bind(internalApiController));

// Content and AI processing
router.post('/rag-search', 
  internalApiController.ragSearch.bind(internalApiController));

// Agent configuration for N8N direct OpenRouter calls
router.get('/agent-config/:workspaceId', 
  internalApiController.getAgentConfig.bind(internalApiController));

// ❌ DEPRECATED - Now handled directly by N8N with OpenRouter
// router.post('/llm-process', 
//   internalApiController.llmProcess.bind(internalApiController));

// Message handling
router.post('/save-message', 
  internalApiController.saveMessage.bind(internalApiController));

router.get('/conversation-history/:workspaceId/:phone', 
  internalApiController.getConversationHistory.bind(internalApiController));

// User onboarding
router.post('/welcome-user', 
  internalApiController.welcomeUser.bind(internalApiController));

// Registration link generation for new users
router.post('/generate-registration-link', 
  internalApiController.generateRegistrationLink.bind(internalApiController));

 
// WhatsApp message sender (saves to DB + sends via API)
router.post('/send-whatsapp', 
  internalApiController.sendWhatsApp.bind(internalApiController));

// 🧪 TEST ENDPOINT - Complete RAG + Pricing Test (Andrea's Testing)
router.post('/test-rag-complete', 
  internalApiController.testRagComplete.bind(internalApiController));

// 🧪 SIMPLE TEST - Search Products (Andrea's Testing)
router.post('/test-simple-search', 
  internalApiController.testSimpleSearch.bind(internalApiController));

// 🧪 MOCK TEST - Demo Results (Andrea's Testing)
router.post('/test-mock-results', 
  internalApiController.testMockResults.bind(internalApiController));

// 🔍 GET ENDPOINT - Simple RAG Search with Query Parameter (Andrea's Request)
router.get('/test-simple-search', 
  internalApiController.testSimpleSearchGet.bind(internalApiController));

export { router as internalApiRoutes };
