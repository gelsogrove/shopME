import { Router } from 'express';
import { MonitoringController } from '../controllers/monitoring.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const monitoringController = new MonitoringController();

/**
 * TASK 10: Monitoring Routes
 * 
 * Provides endpoints for monitoring WhatsApp flow performance and health.
 * Some endpoints are public (health checks), others require authentication.
 */

// Public health check endpoints (no auth required)
router.get('/health/whatsapp-flow', monitoringController.getHealthStatus.bind(monitoringController));
router.get('/metrics/prometheus', monitoringController.getPrometheusMetrics.bind(monitoringController));

// Protected metrics endpoints (require authentication)
router.get('/metrics/flow/aggregated', authMiddleware, monitoringController.getAggregatedMetrics.bind(monitoringController));
router.get('/metrics/flow/performance', authMiddleware, monitoringController.getPerformanceStats.bind(monitoringController));
router.get('/metrics/flow/workspace/:workspaceId', authMiddleware, monitoringController.getWorkspaceMetrics.bind(monitoringController));
router.get('/metrics/flow/workspaces', authMiddleware, monitoringController.getAllWorkspaceMetrics.bind(monitoringController));
router.get('/metrics/flow/recent', authMiddleware, monitoringController.getRecentMetrics.bind(monitoringController));
router.get('/metrics/cache', authMiddleware, monitoringController.getCacheMetrics.bind(monitoringController));
router.get('/metrics/dashboard', authMiddleware, monitoringController.getDashboardData.bind(monitoringController));

// Admin endpoints (require authentication)
router.post('/metrics/cache/clear', authMiddleware, monitoringController.clearCache.bind(monitoringController));

export default router; 