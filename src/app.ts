import cors from "cors"
import express from "express"
import workspaceRoutes from "./routes/workspaceRoutes"

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/workspaces", workspaceRoutes)

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack)
    res.status(500).json({ error: "Something broke!" })
  }
)

export default app
