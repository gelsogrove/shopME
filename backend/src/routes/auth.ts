import { Router } from "express"
import { login } from "../controllers/auth.controller"
import { wrapController } from "../utils/controller-wrapper"

const router = Router()

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

// Authentication routes
router.post("/login", wrapController(login))

export default router 