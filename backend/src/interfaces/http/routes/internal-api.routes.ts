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

// 🛒 CREATE ORDER ENDPOINT - No Auth Required (Temporary for debugging)
// This endpoint is OUTSIDE the auth middleware for N8N debugging
router.post("/create-order", (req, res) =>
  internalApiController.createOrderInternal(req, res)
)

// 🧪 TEST EMBEDDING REGENERATION - No Auth Required (Andrea's Testing)
// This endpoint is OUTSIDE the auth middleware for testing embedding regeneration
router.post(
  "/test-regenerate-embeddings",
  internalApiController.testRegenerateEmbeddings.bind(internalApiController)
)

// 🌐 PUBLIC ORDERS PAGES (NO AUTH)
/**
 * @swagger
 * /internal/public/orders:
 *   get:
 *     tags: [Public]
 *     summary: Get customer orders by phone for public page
 *     description: Returns orders list filtered by phone and workspaceId for external Orders page.
 *     parameters:
 *       - in: query
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: workspaceId
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orders list
 *       400:
 *         description: Missing phone
 *       404:
 *         description: Customer not found
 */
router.get(
  "/public/orders",
  internalApiController.getPublicOrders.bind(internalApiController)
)
/**
 * @swagger
 * /internal/public/orders/{orderCode}:
 *   get:
 *     tags: [Public]
 *     summary: Get order detail by orderCode and phone for public page
 *     parameters:
 *       - in: path
 *         name: orderCode
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: workspaceId
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order detail
 *       400:
 *         description: Missing required params
 *       404:
 *         description: Order or customer not found
 */
router.get(
  "/public/orders/:orderCode",
  internalApiController.getPublicOrderDetail.bind(internalApiController)
)

// Apply authentication middleware to all other internal API routes
router.use(n8nAuthMiddleware)

// N8N Usage Tracking Routes
router.use("/n8n", n8nUsageRoutes)

/**
 * @swagger
 * /internal/orders/tracking-link:
 *   post:
 *     tags: [Internal API]
 *     summary: Get ShopMe tracking link for customer's latest processing order
 *     security:
 *       - N8NAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspaceId, customerId]
 *             properties:
 *               workspaceId:
 *                 type: string
 *               customerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: ShopMe tracking link generated or not available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 orderId:
 *                   type: string
 *                 orderCode:
 *                   type: string
 *                 status:
 *                   type: string
 *                 trackingNumber:
 *                   type: string
 *                   nullable: true
 *                 trackingUrl:
 *                   type: string
 *                   description: ShopMe orders-public page URL with security token
 *                   nullable: true
 *       400:
 *         description: Missing required fields
 */
// REMOVED: Duplicate route that was returning DHL links
// router.post('/orders/tracking-link', (req, res) => internalApiController.getTrackingLink(req, res))

// Generate secure tokens for various purposes
router.post('/generate-token', (req, res) => internalApiController.generateToken(req, res))

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

// 📦 Orders via secure token
router.get(
  "/orders/:token",
  internalApiController.getCustomerOrdersByToken.bind(internalApiController)
)
router.get(
  "/orders/:token/:orderCode",
  internalApiController.getOrderDetailByToken.bind(internalApiController)
)
router.get(
  "/orders/:orderCode/invoice",
  internalApiController.downloadInvoiceByOrderCode.bind(internalApiController)
)
router.get(
  "/orders/:orderCode/ddt",
  internalApiController.downloadDdtByOrderCode.bind(internalApiController)
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

// Preformatted plain text list for N8N direct sending (no truncation by LLM)
router.post(
  "/get-all-products-text",
  (req, res) => internalApiController.getAllProductsText(req, res)
)

// 🛍️ GET ALL SERVICES - For N8N getAllServices Tool (Andrea's Request)
router.post(
  "/get-all-services",
  internalApiController.getAllServices.bind(internalApiController)
)

// 📦 GET SHIPMENT TRACKING LINK - For N8N GetShipmentTrackingLink Tool 
router.post(
  "/orders/tracking-link",
  internalApiController.getShipmentTrackingLink.bind(internalApiController)
)

// 👤 CUSTOMER PROFILE MANAGEMENT
/**
 * @swagger
 * /internal/customer-profile/{token}:
 *   get:
 *     tags: [Internal API]
 *     summary: Get customer profile data for profile management page
 *     security:
 *       - N8NAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile access token
 *     responses:
 *       200:
 *         description: Customer profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     company:
 *                       type: string
 *                     address:
 *                       type: string
 *                     language:
 *                       type: string
 *                     currency:
 *                       type: string
 *                     discount:
 *                       type: number
 *                     invoiceAddress:
 *                       type: object
 *       401:
 *         description: Invalid or expired token
 *       404:
 *         description: Customer not found
 */
router.get(
  "/customer-profile/:token",
  internalApiController.getCustomerProfile.bind(internalApiController)
)

/**
 * @swagger
 * /internal/customer-profile/{token}:
 *   put:
 *     tags: [Internal API]
 *     summary: Update customer profile data from profile management page
 *     security:
 *       - N8NAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *               address:
 *                 type: string
 *               language:
 *                 type: string
 *               currency:
 *                 type: string
 *               invoiceAddress:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid or expired token
 *       404:
 *         description: Customer not found
 */
router.put(
  "/customer-profile/:token",
  internalApiController.updateCustomerProfile.bind(internalApiController)
)

// 🧾 GET ORDERS LIST (Backend-only for LLM reply)
/**
 * @swagger
 * /internal/get-orders-list:
 *   post:
 *     tags: [Internal API]
 *     summary: Get all customer orders (createdAt DESC)
 *     security:
 *       - N8NAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspaceId, customerId]
 *             properties:
 *               workspaceId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               orderCode:
 *                 type: string
 *                 description: Optional order code to highlight in response
 *     responses:
 *       200:
 *         description: Orders list
 */
router.post(
  "/get-orders-list",
  internalApiController.getOrdersList.bind(internalApiController)
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

/**
 * @swagger
 * /internal/get-orders-list:
 *   post:
 *     tags:
 *       - Internal API - N8N
 *     summary: Get Orders List (N8N)
 *     description: Generate secure link for customer to view their order history
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
 *               - customerId
 *             properties:
 *               workspaceId:
 *                 type: string
 *                 description: ID of the workspace
 *                 example: "cm9hjgq9v00014qk8fsdy4ujv"
 *               customerId:
 *                 type: string
 *                 description: ID of the customer
 *                 example: "customer123"
 *     responses:
 *       200:
 *         description: Orders list link generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   description: User-friendly response message
 *                   example: "Ecco il link per vedere tutti i tuoi ordini (5 ordini totali). Da questa pagina potrai scaricare fatture e DDT: https://app.example.com/orders?token=abc123 (valido fino alle 16:30)"
 *                 ordersListUrl:
 *                   type: string
 *                   description: Secure URL for orders list
 *                   example: "https://app.example.com/orders?token=abc123"
 *                 token:
 *                   type: string
 *                   description: Generated secure token
 *                   example: "abc123def456ghi789"
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   description: Token expiration time
 *                   example: "2024-01-16T15:30:00Z"
 *       400:
 *         description: Bad request - missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: string
 *                   example: "Parametri mancanti: workspaceId e customerId sono obbligatori"
 *                 error:
 *                   type: string
 *                   example: "Missing required parameters: workspaceId and customerId"
 *       404:
 *         description: Customer not found or no orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: string
 *                   example: "Non hai ancora effettuato nessun ordine. Il tuo storico ordini è vuoto."
 *                 error:
 *                   type: string
 *                   example: "No orders found for customer"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: string
 *                   example: "Si è verificato un errore durante la generazione del link per gli ordini. Riprova più tardi."
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */


/**
 * @swagger
 * /internal/create-order:
 *   post:
 *     tags:
 *       - Internal API - N8N
 *     summary: Create Order (N8N)
 *     description: Create a new order for a customer with items and services
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
 *               - customerId
 *               - items
 *             properties:
 *               workspaceId:
 *                 type: string
 *               customerId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [product, service]
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
// NOTE: Route definition moved above auth middleware for debugging

/**
 * @swagger
 * /internal/confirm-order-conversation:
 *   post:
 *     tags:
 *       - Internal API - N8N
 *     summary: Confirm Order From Conversation (N8N)
 *     description: Parse conversation context and generate checkout token for order confirmation
 *     security:
 *       - InternalAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationContext
 *               - workspaceId
 *               - customerId
 *             properties:
 *               conversationContext:
 *                 type: string
 *                 description: Last 10 messages from conversation (user + LLM)
 *               workspaceId:
 *                 type: string
 *               customerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checkout token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *                   description: Summary message for user
 *                 checkoutToken:
 *                   type: string
 *                   description: Secure token for frontend access
 *                 checkoutUrl:
 *                   type: string
 *                   description: Frontend URL for order summary
 *                 totalAmount:
 *                   type: number
 *                   description: Calculated total amount
 *                 items:
 *                   type: array
 *                   description: Parsed items with prices
 *       400:
 *         description: Missing parameters or no items found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/confirm-order-conversation",
  internalApiController.confirmOrderFromConversation.bind(internalApiController)
)

/**
 * @swagger
 * /internal/checkout/{token}:
 *   get:
 *     tags:
 *       - Internal API - N8N
 *     summary: Get Checkout Data (Frontend)
 *     description: Get checkout data from secure token for frontend
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Checkout data retrieved successfully
 *       400:
 *         description: Token is required
 *       404:
 *         description: Token not found or expired
 *       500:
 *         description: Internal server error
 */
router.get(
  "/checkout/:token",
  internalApiController.getCheckoutData.bind(internalApiController)
)

export { router as internalApiRoutes }
