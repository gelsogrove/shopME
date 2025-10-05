import express from "express"
import { authMiddleware } from "../../../middlewares/auth.middleware"
import { BillingController } from "../controllers/billing.controller"

const router = express.Router()
const billingController = new BillingController()

// Protect all billing routes with authentication
router.use(authMiddleware)

/**
 * @route GET /api/billing/:workspaceId/totals
 * @desc Get current billing totals for a workspace
 * @query customerId (optional) - Get totals for specific customer
 */
router.get("/:workspaceId/totals", (req, res) => {
  billingController.getTotals(req, res)
})

/**
 * @route GET /api/billing/:workspaceId/summary
 * @desc Get detailed billing summary for a workspace
 */
router.get("/:workspaceId/summary", (req, res) => {
  billingController.getSummary(req, res)
})

/**
 * @route GET /api/billing/:workspaceId/history
 * @desc Get billing history in simple format: current + new = total
 * @query customerId (optional) - Get history for specific customer
 * @query limit (optional, default 50) - Number of records to return
 */
router.get("/:workspaceId/history", (req, res) => {
  billingController.getHistory(req, res)
})

export { router as billingRouter }
