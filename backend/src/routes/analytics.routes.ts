import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../interfaces/http/middlewares/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

// Protect all analytics routes with authentication
router.use(authMiddleware);

/**
 * GET /api/analytics/:workspaceId/dashboard
 * Get dashboard analytics data with optional date range
 * Query params: startDate, endDate (optional)
 * Default: last 3 months excluding current month
 */
router.get('/:workspaceId/dashboard', analyticsController.getDashboardData);

/**
 * GET /api/analytics/:workspaceId/detailed
 * Get detailed metrics for a specific metric type
 * Query params: startDate, endDate (required), metric (required)
 */
router.get('/:workspaceId/detailed', analyticsController.getDetailedMetrics);

export default router;