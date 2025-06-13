// @ts-nocheck
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import OpenAI from 'openai'
import path from "path"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger"
import { WhatsAppController } from './interfaces/http/controllers/whatsapp.controller'
import { errorMiddleware } from "./interfaces/http/middlewares/error.middleware"
import { jsonFixMiddleware } from "./interfaces/http/middlewares/json-fix.middleware"
import { loggingMiddleware } from "./middlewares/logging.middleware"
import apiRouter from "./routes"
import logger from "./utils/logger"

// Initialize Express app
const app = express()

// Logging middleware should be first
app.use(loggingMiddleware)

// Other middleware
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
      ? [process.env.FRONTEND_URL || "http://localhost:3000"] 
      : ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-workspace-id"],
    exposedHeaders: ["set-cookie"],
  })
)

// Enable pre-flight requests for all routes
app.options('*', cors())

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));
logger.info(`Serving static files from: ${uploadsPath}`);

// Custom JSON parser middleware to handle potentially escaped JSON
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    if (buf && buf.length) {
      try {
        // Store the raw body for debugging purposes
        req.rawBody = buf.toString(encoding || 'utf8');
        
        // Test if we can parse the body
        JSON.parse(req.rawBody);
      } catch (e) {
        // If parsing fails, try to un-escape the string and parse again
        logger.warn(`JSON parse error: ${e.message}. Attempting to fix escaped JSON.`);
        try {
          const unescaped = req.rawBody.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
          JSON.parse(unescaped);
          // If successful, replace the raw body with unescaped version
          req.rawBody = unescaped;
        } catch (e2) {
          logger.error(`Failed to fix JSON: ${e2.message}`);
        }
      }
    }
  }
}));

// Add json-fix middleware after JSON parsing
app.use(jsonFixMiddleware);

// @ts-ignore
app.use(cookieParser())

// Add test endpoint for JSON parsing
app.post('/api/test/json-parser', (req, res) => {
  logger.info('JSON parser test received body:', req.body);
  res.json({
    success: true,
    receivedBody: req.body,
    rawBodyExists: !!req.rawBody,
  });
});

// Public WhatsApp webhook routes (must be before authentication)
logger.info("Mounting public WhatsApp webhook routes");
const whatsappController = new WhatsAppController();
app.post('/api/whatsapp/webhook', (req, res, next) => whatsappController.handleWebhook(req, res).catch(next));
app.get('/api/whatsapp/webhook', (req, res, next) => whatsappController.handleWebhook(req, res).catch(next));

// API versioning
const apiVersions = {
  v1: apiRouter,
  // v2: apiRouterV2, // For future versions
}

// Swagger documentation
// @ts-ignore
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "ShopMe API Documentation",
  docExpansion: "list",
  deepLinking: true,
  displayOperationId: true,
  filter: true
}))

// Log that we're about to mount the API router
logger.info("Mounting API router at /api prefix")

// Hotfix solo per gli ambienti non di test
if (process.env.NODE_ENV !== 'test') {
  // Endpoint di catch-all specifico per bloccare clienti
  // HOTFIX: Risolve il problema del 404 su block customer
  app.post('/api/workspaces/:workspaceId/customers/:id/block', (req, res) => {
    const { id, workspaceId } = req.params;
    logger.info(`🔥 HOTFIX: Block customer catch-all endpoint chiamato per workspace ${workspaceId}, customer ${id}`);
    logger.info(`⚠️ Questo è un hotfix temporaneo per risolvere il problema del 404 su questo endpoint.`);
    
    // Import customerService on-demand
    const { default: customerService } = require('./application/services/customer.service');
    
    // Try to block the customer
    customerService.blockCustomer(id, workspaceId)
      .then(customer => {
        return res.status(200).json({
          message: 'Customer blocked successfully via HOTFIX',
          customer
        });
      })
      .catch(error => {
        logger.error('Error in HOTFIX route:', error);
        return res.status(404).json({ 
          message: error.message || 'Failed to block customer',
          error: true
        });
      });
  });
}

// Mount agent routes directly at root level for legacy support - MUST BE BEFORE API ROUTES
// Create direct route handlers for all agent operations

// GET all agents for workspace
app.get("/workspaces/:workspaceId/agent", async (req, res) => {
  console.log('🔥🔥🔥 DIRECT AGENT GET ROUTE CALLED 🔥🔥🔥');
  console.log('Original URL:', req.originalUrl);
  console.log('Params:', req.params);
  console.log('WorkspaceId from params:', req.params.workspaceId);
  
  try {
    const workspaceId = req.params.workspaceId;
    
    if (!workspaceId) {
      return res.status(400).json({
        message: "Workspace ID is required",
        debug: {
          url: req.originalUrl,
          method: req.method,
          params: req.params,
          query: req.query
        }
      });
    }

    // Import the agent service directly
    const { AgentService } = require('./application/services/agent.service');
    const agentService = new AgentService();
    
    // Get all agents for the workspace
    const agents = await agentService.getAllForWorkspace(workspaceId);
    
    console.log('✅ Successfully retrieved agents:', agents.length);
    return res.json(agents);
    
  } catch (error) {
    console.error('❌ Error in direct agent route:', error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
})

// GET single agent by ID
app.get("/workspaces/:workspaceId/agent/:id", async (req, res) => {
  console.log('🔥🔥🔥 DIRECT AGENT GET BY ID ROUTE CALLED 🔥🔥🔥');
  console.log('Original URL:', req.originalUrl);
  console.log('Params:', req.params);
  
  try {
    const { workspaceId, id } = req.params;
    
    if (!workspaceId || !id) {
      return res.status(400).json({
        message: "Workspace ID and Agent ID are required",
        debug: {
          url: req.originalUrl,
          method: req.method,
          params: req.params
        }
      });
    }

    // Import the agent service directly
    const { AgentService } = require('./application/services/agent.service');
    const agentService = new AgentService();
    
    // Get agent by ID
    const agent = await agentService.getById(id, workspaceId);
    
    console.log('✅ Successfully retrieved agent:', agent?.id);
    return res.json(agent);
    
  } catch (error) {
    console.error('❌ Error in direct agent get by ID route:', error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
})

// PUT update agent by ID
app.put("/workspaces/:workspaceId/agent/:id", async (req, res) => {
  console.log('🔥🔥🔥 DIRECT AGENT PUT ROUTE CALLED 🔥🔥🔥');
  console.log('Original URL:', req.originalUrl);
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  
  try {
    const { workspaceId, id } = req.params;
    const updateData = req.body;
    
    if (!workspaceId || !id) {
      return res.status(400).json({
        message: "Workspace ID and Agent ID are required",
        debug: {
          url: req.originalUrl,
          method: req.method,
          params: req.params
        }
      });
    }

    // Import the agent service directly
    const { AgentService } = require('./application/services/agent.service');
    const agentService = new AgentService();
    
    // Update agent
    const updatedAgent = await agentService.update(id, updateData, workspaceId);
    
    console.log('✅ Successfully updated agent:', updatedAgent?.id);
    return res.json(updatedAgent);
    
  } catch (error) {
    console.error('❌ Error in direct agent PUT route:', error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
})

// POST create new agent
app.post("/workspaces/:workspaceId/agent", async (req, res) => {
  console.log('🔥🔥🔥 DIRECT AGENT POST ROUTE CALLED 🔥🔥🔥');
  console.log('Original URL:', req.originalUrl);
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  
  try {
    const { workspaceId } = req.params;
    const agentData = req.body;
    
    if (!workspaceId) {
      return res.status(400).json({
        message: "Workspace ID is required",
        debug: {
          url: req.originalUrl,
          method: req.method,
          params: req.params
        }
      });
    }

    // Import the agent service directly
    const { AgentService } = require('./application/services/agent.service');
    const agentService = new AgentService();
    
    // Create agent
    const newAgent = await agentService.create({ ...agentData, workspaceId });
    
    console.log('✅ Successfully created agent:', newAgent?.id);
    return res.status(201).json(newAgent);
    
  } catch (error) {
    console.error('❌ Error in direct agent POST route:', error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
})

// DELETE agent by ID
app.delete("/workspaces/:workspaceId/agent/:id", async (req, res) => {
  console.log('🔥🔥🔥 DIRECT AGENT DELETE ROUTE CALLED 🔥🔥🔥');
  console.log('Original URL:', req.originalUrl);
  console.log('Params:', req.params);
  
  try {
    const { workspaceId, id } = req.params;
    
    if (!workspaceId || !id) {
      return res.status(400).json({
        message: "Workspace ID and Agent ID are required",
        debug: {
          url: req.originalUrl,
          method: req.method,
          params: req.params
        }
      });
    }

    // Import the agent service directly
    const { AgentService } = require('./application/services/agent.service');
    const agentService = new AgentService();
    
    // Delete agent
    await agentService.delete(id, workspaceId);
    
    console.log('✅ Successfully deleted agent:', id);
    return res.status(204).send();
    
  } catch (error) {
    console.error('❌ Error in direct agent DELETE route:', error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
})

logger.info("Mounted direct agent routes at /workspaces/:workspaceId/agent")

// Versioned routes
app.use("/api/v1", apiRouter)

// Default version route (current version)
app.use("/api", apiRouter)

// Endpoint di test per OpenAI
// @ts-ignore
app.get("/api/test/openai", async (req, res) => {
  try {
    // Check if OpenAI is properly configured
    const apiKey = process.env.OPENAI_API_KEY;
    const isConfigured = apiKey && apiKey.length > 10 && apiKey !== 'your-api-key-here';
    
    if (!isConfigured) {
      logger.error('OpenAI API key not configured properly for test');
      return res.status(500).json({ 
        status: "error", 
        message: "OpenAI API key not properly configured" 
      });
    }

    // Initialize OpenAI client
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

    logger.info(`Test OpenAI successful - model: ${completion.model}, response: ${completion.choices[0]?.message?.content}`);

    // Return success response with completion info
    return res.status(200).json({ 
      status: "ok", 
      message: "OpenAI API connection successful",
      model: completion.model,
      response: completion.choices[0]?.message?.content,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + "..." : "missing"
    });
  } catch (error) {
    logger.error("OpenAI API connection error:", error);
    
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

// Error handling should be last
app.use(errorMiddleware)

// Add diagnostics endpoint for direct access
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    apiVersion: "v1"
  });
});

// Debug: Print all registered routes at startup
if (process.env.NODE_ENV !== 'test') {
  logger.info('🔍 DEBUG: Printing all registered routes:');
  
  function printRoutes(stack, basePath = '') {
    stack.forEach(middleware => {
      if (middleware.route) {
        // Route
        const methods = Object.keys(middleware.route.methods)
          .filter(method => middleware.route.methods[method])
          .join(', ');
        logger.info(`🛣️  ${methods.toUpperCase()} ${basePath}${middleware.route.path}`);
      } else if (middleware.name === 'router') {
        // Router middleware
        const newBase = basePath + (middleware.regexp ? 
          middleware.regexp.toString().replace('/^', '').replace('/(?=\\/|$)/i', '') : 
          '');
        printRoutes(middleware.handle.stack, newBase);
      }
    });
  }
  
  // Print main app routes
  printRoutes(app._router.stack);
}

export default app
