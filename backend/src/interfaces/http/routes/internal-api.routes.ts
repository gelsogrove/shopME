import { Router } from "express"
import { MessageRepository } from "../../../repositories/message.repository"
import { InternalApiController } from "../controllers/internal-api.controller"
import { n8nAuthMiddleware } from "../middlewares/n8n-auth.middleware"
import n8nUsageRoutes from "./n8n-usage.routes"

const router = Router()
const messageRepository = new MessageRepository()
const internalApiController = new InternalApiController(messageRepository)

// 🧪 OPEN TEST ENDPOINT - No Auth Required (Andrea's Testing)
// This endpoint is OUTSIDE the auth middleware for easy testing
router.get(
  "/test-rag-open",
  internalApiController.testRagOpen.bind(internalApiController)
)

// Apply authentication middleware to all other internal API routes
router.use(n8nAuthMiddleware)

// N8N Usage Tracking Routes
router.use("/n8n", n8nUsageRoutes)

/**
 * N8N Internal API Routes with Multi-Business Support
 * Protected by INTERNAL_API_SECRET authentication
 */

// Channel and workspace information
router.get(
  "/channel-status/:workspaceId",
  internalApiController.getChannelStatus.bind(internalApiController)
)

router.get(
  "/business-type/:workspaceId",
  internalApiController.getBusinessType.bind(internalApiController)
)

// User management
router.get(
  "/user-check/:workspaceId/:phone",
  internalApiController.getUserCheck.bind(internalApiController)
)

router.get(
  "/wip-status/:workspaceId/:phone",
  internalApiController.getWipStatus.bind(internalApiController)
)

// Content and AI processing
router.post(
  "/rag-search",
  internalApiController.ragSearch.bind(internalApiController)
)

// Agent configuration for N8N direct OpenRouter calls
router.get(
  "/agent-config/:workspaceId",
  internalApiController.getAgentConfig.bind(internalApiController)
)

// ❌ DEPRECATED - Now handled directly by N8N with OpenRouter
// router.post('/llm-process',
//   internalApiController.llmProcess.bind(internalApiController));

// Message handling
router.post(
  "/save-message",
  internalApiController.saveMessage.bind(internalApiController)
)

router.get(
  "/conversation-history/:workspaceId/:phone",
  internalApiController.getConversationHistory.bind(internalApiController)
)

// User onboarding
router.post(
  "/welcome-user",
  internalApiController.welcomeUser.bind(internalApiController)
)

// 🔐 Token validation for public links
router.post(
  "/validate-secure-token",
  internalApiController.validateSecureToken.bind(internalApiController)
)

// 🧾 Get customer invoices by token
router.get(
  "/invoices/:token",
  internalApiController.getCustomerInvoicesByToken.bind(internalApiController)
)

// Registration link generation for new users
router.post(
  "/generate-registration-link",
  internalApiController.generateRegistrationLink.bind(internalApiController)
)

// WhatsApp message sender (saves to DB + sends via API)
router.post(
  "/send-whatsapp",
  internalApiController.sendWhatsApp.bind(internalApiController)
)

// 🧪 TEST ENDPOINT - Complete RAG + Pricing Test (Andrea's Testing)
router.post(
  "/test-rag-complete",
  internalApiController.testRagComplete.bind(internalApiController)
)

// 🧪 SIMPLE TEST - Search Products (Andrea's Testing)
router.post(
  "/test-simple-search",
  internalApiController.testSimpleSearch.bind(internalApiController)
)

// 🧪 MOCK TEST - Demo Results (Andrea's Testing)
router.post(
  "/test-mock-results",
  internalApiController.testMockResults.bind(internalApiController)
)

// 🔍 GET ENDPOINT - Simple RAG Search with Query Parameter (Andrea's Request)
router.get(
  "/test-simple-search",
  internalApiController.testSimpleSearchGet.bind(internalApiController)
)

// 📋 GET ALL PRODUCTS - For N8N getAllProducts Tool (Andrea's Request)
router.post(
  "/get-all-products",
  internalApiController.getAllProducts.bind(internalApiController)
)

// 🛍️ GET ALL SERVICES - For N8N getAllServices Tool (Andrea's Request)
router.post(
  "/get-all-services",
  internalApiController.getAllServices.bind(internalApiController)
)

/**
 * @swagger
 * /internal/get-all-products:
 *   post:
 *     summary: Get all products for workspace with customer discount calculation
 *     description: 📋 Andrea's Logic - Returns all products with highest discount wins logic applied
 *     tags: [Internal API]
 *     security:
 *       - N8NAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspaceId
 *             properties:
 *               workspaceId:
 *                 type: string
 *                 description: ID of the workspace to get products for
 *               customerId:
 *                 type: string
 *                 description: Customer ID for discount calculation (optional)
 *               categoryId:
 *                 type: string
 *                 description: Filter by category ID (optional)
 *               search:
 *                 type: string
 *                 description: Search term for product names (optional)
 *               limit:
 *                 type: number
 *                 description: Maximum number of products to return (default 50)
 *     responses:
 *       200:
 *         description: Products with customer discount logic applied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 customerInfo:
 *                   type: object
 *                   nullable: true
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       originalPrice:
 *                         type: number
 *                       discountPercent:
 *                         type: number
 *                       discountSource:
 *                         type: string
 *                       formatted:
 *                         type: string
 *                 summary:
 *                   type: object
 *                 discountLogic:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /internal/get-all-services:
 *   post:
 *     summary: Get all services for workspace with customer discount calculation
 *     description: 🛍️ Andrea's Logic - Returns all services with highest discount wins logic applied
 *     tags: [Internal API]
 *     security:
 *       - N8NAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspaceId
 *             properties:
 *               workspaceId:
 *                 type: string
 *                 description: ID of the workspace to get services for
 *               customerId:
 *                 type: string
 *                 description: Customer ID for discount calculation (optional)
 *               search:
 *                 type: string
 *                 description: Search term for service names (optional)
 *               limit:
 *                 type: number
 *                 description: Maximum number of services to return (default 50)
 *     responses:
 *       200:
 *         description: Services with customer discount logic applied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 customerInfo:
 *                   type: object
 *                   nullable: true
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       originalPrice:
 *                         type: number
 *                       discountPercent:
 *                         type: number
 *                       discountSource:
 *                         type: string
 *                       formatted:
 *                         type: string
 *                 summary:
 *                   type: object
 *                 discountLogic:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /internal/create-checkout-link:
 *   post:
 *     tags: [Internal API]
 *     summary: Create secure checkout link for customer
 *     security:
 *       - InternalAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - workspaceId
 *               - message
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Customer phone number
 *               workspaceId:
 *                 type: string
 *                 description: Workspace ID
 *               customerId:
 *                 type: string
 *                 description: Customer ID (optional)
 *               message:
 *                 type: string
 *                 description: User message indicating checkout intent
 *     responses:
 *       200:
 *         description: Checkout link created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 checkout_url:
 *                   type: string
 *                 checkout_token:
 *                   type: string
 *                 response_message:
 *                   type: string
 *                 expires_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/create-checkout-link",
  internalApiController.createCheckoutLink.bind(internalApiController)
)

/**
 * @swagger
 * /internal/get-all-categories:
 *   post:
 *     tags: [Internal API]
 *     summary: Get all categories for workspace
 *     security:
 *       - InternalAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspaceId
 *               - message
 *             properties:
 *               workspaceId:
 *                 type: string
 *                 description: Workspace ID
 *               customerId:
 *                 type: string
 *                 description: Customer ID (optional)
 *               message:
 *                 type: string
 *                 description: User message requesting categories
 *               phoneNumber:
 *                 type: string
 *                 description: Customer phone number (optional)
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total_categories:
 *                   type: integer
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       productCount:
 *                         type: integer
 *                 response_message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/get-all-categories",
  internalApiController.getAllCategories.bind(internalApiController)
)

/**
 * @swagger
 * /internal/contact-operator:
 *   post:
 *     tags: [Internal API]
 *     summary: Contact the operator for a customer
 *     security:
 *       - InternalAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - workspaceId
 *               - message
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Customer phone number
 *               workspaceId:
 *                 type: string
 *                 description: Workspace ID
 *               customerId:
 *                 type: string
 *                 description: Customer ID (optional)
 *               message:
 *                 type: string
 *                 description: User message requesting operator contact
 *     responses:
 *       200:
 *         description: Operator contact information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 operator_phone:
 *                   type: string
 *                 operator_name:
 *                   type: string
 *                 response_message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/contact-operator", (req, res) =>
  internalApiController.contactOperator(req, res)
)

/**
 * @swagger
 * /internal/get-active-offers:
 *   post:
 *     summary: Get active offers for workspace with customer discount calculation
 *     description: 💰 Andrea's Logic - Shows only offers better than customer discount, applies highest discount wins logic
 *     tags: [Internal API]
 *     security:
 *       - N8NAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspaceId
 *             properties:
 *               workspaceId:
 *                 type: string
 *                 description: ID of the workspace to get offers for
 *               customerId:
 *                 type: string
 *                 description: Customer ID for discount calculation (optional)
 *     responses:
 *       200:
 *         description: Active offers with customer discount logic applied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 customerInfo:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     name:
 *                       type: string
 *                     discount:
 *                       type: number
 *                 total_offers:
 *                   type: number
 *                   description: Total active offers found
 *                 relevant_offers:
 *                   type: number
 *                   description: Offers better than customer discount
 *                 offers:
 *                   type: array
 *                   description: Only offers better than customer discount
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       discountPercent:
 *                         type: number
 *                       customerDiscount:
 *                         type: number
 *                       bestDiscount:
 *                         type: number
 *                       discountSource:
 *                         type: string
 *                         enum: [customer, offer]
 *                       isOfferBetterThanCustomer:
 *                         type: boolean
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: string
 *                 response_message:
 *                   type: string
 *                 discountLogic:
 *                   type: object
 *                   properties:
 *                     customerDiscount:
 *                       type: number
 *                     note:
 *                       type: string
 *                     appliedLogic:
 *                       type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/get-active-offers", (req, res) =>
  internalApiController.getActiveOffers(req, res)
)

/**
 * @swagger
 * /internal/get-cf-services:
 *   post:
 *     summary: Get complete list of Cloudflare services and functions
 *     tags: [Internal API]
 *     security:
 *       - N8NAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workspaceId:
 *                 type: string
 *                 description: The workspace ID
 *                 example: "cm9hjgq9v00014qk8fsdy4ujv"
 *             required:
 *               - workspaceId
 *     responses:
 *       200:
 *         description: CF services list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total_services:
 *                   type: integer
 *                   example: 7
 *                 implemented:
 *                   type: integer
 *                   example: 4
 *                 partial:
 *                   type: integer
 *                   example: 1
 *                 missing:
 *                   type: integer
 *                   example: 2
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *                       endpoint:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                 response_message:
 *                   type: string
 *                   description: Formatted message for chatbot response
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/get-cf-services", (req, res) =>
  internalApiController.getCFServices(req, res)
)

export { router as internalApiRoutes }
