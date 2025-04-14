import { PrismaClient } from '@prisma/client'
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import { errorMiddleware } from "./interfaces/http/middlewares/error.middleware"
import { loggingMiddleware } from "./middlewares/logging.middleware"
import apiRouter from "./routes"

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
app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/api", apiRouter)

// Route for debugging workspaces
app.get('/api/debug/workspaces', async (req, res) => {
  const prisma = new PrismaClient();
  try {
    const workspaces = await prisma.workspace.findMany();
    return res.json({
      workspaces: workspaces.map(w => ({
        id: w.id,
        name: w.name,
        slug: w.slug
      }))
    });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return res.status(500).json({ error: 'Failed to fetch workspaces' });
  } finally {
    await prisma.$disconnect();
  }
});

// Route for debugging products
app.get('/api/debug/products', async (req, res) => {
  const prisma = new PrismaClient();
  try {
    const products = await prisma.products.findMany({
      take: 20,
      include: {
        category: true
      }
    });
    return res.json({
      totalCount: products.length,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        workspaceId: p.workspaceId,
        categoryId: p.categoryId,
        categoryName: p.category?.name
      }))
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  } finally {
    await prisma.$disconnect();
  }
});

// Error handling should be last
app.use(errorMiddleware)

export default app
