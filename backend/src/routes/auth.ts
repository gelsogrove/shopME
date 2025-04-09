import { Router } from "express"
import { login } from "../controllers/auth.controller"

const router = Router()

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

// Authentication routes
router.post("/login", login)

export default router 