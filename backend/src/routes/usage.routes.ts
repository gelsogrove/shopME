import { Router } from "express";
import { usageController } from "../controllers/usage.controller";

const router = Router();

/**
 * Usage Tracking Routes
 * All routes are workspace-specific and require workspaceId parameter
 */

// GET /api/usage/stats/:workspaceId - Get usage statistics for dashboard
router.get("/stats/:workspaceId", usageController.getStats);

// GET /api/usage/summary/:workspaceId - Get usage summary for specific period
router.get("/summary/:workspaceId", usageController.getSummary);

// GET /api/usage/dashboard/:workspaceId - Get comprehensive dashboard data
router.get("/dashboard/:workspaceId", usageController.getDashboardData);

// GET /api/usage/export/:workspaceId - Export usage data (CSV/JSON)
router.get("/export/:workspaceId", usageController.exportData);

export default router;