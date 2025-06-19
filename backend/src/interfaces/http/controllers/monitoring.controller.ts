import { Request, Response } from 'express';
import { flowMetrics } from '../../../monitoring/flow-metrics';
import logger from '../../../utils/logger';

/**
 * TASK 10: Monitoring Controller
 * 
 * Exposes metrics and health check endpoints for WhatsApp flow monitoring.
 * Provides real-time insights into system performance and health status.
 */
export class MonitoringController {

  /**
   * Health check endpoint for WhatsApp flow
   * GET /health/whatsapp-flow
   */
  async getHealthStatus(req: Request, res: Response): Promise<void> {
    try {
      const healthStatus = flowMetrics.getHealthStatus();

      const response = {
        status: healthStatus.status,
        timestamp: new Date().toISOString(),
        flow: healthStatus.metrics,
        issues: healthStatus.issues
      };

      // Set HTTP status based on health
      const httpStatus = healthStatus.status === 'healthy' ? 200 : 
                        healthStatus.status === 'degraded' ? 200 : 503;

      res.status(httpStatus).json(response);
      
      logger.debug(`[MONITORING] Health check requested - Status: ${healthStatus.status}`);
    } catch (error) {
      logger.error('[MONITORING] Error in health check:', error);
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get aggregated flow metrics
   * GET /metrics/flow/aggregated
   */
  async getAggregatedMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = flowMetrics.getAggregatedMetrics();
      
      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });

      logger.debug('[MONITORING] Aggregated metrics requested');
    } catch (error) {
      logger.error('[MONITORING] Error getting aggregated metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get aggregated metrics'
      });
    }
  }

  /**
   * Get performance statistics for specific time window
   * GET /metrics/flow/performance?minutes=60
   */
  async getPerformanceStats(req: Request, res: Response): Promise<void> {
    try {
      const minutesBack = parseInt(req.query.minutes as string) || 60;
      
      if (minutesBack < 1 || minutesBack > 1440) { // Max 24 hours
        res.status(400).json({
          success: false,
          message: 'Minutes parameter must be between 1 and 1440'
        });
        return;
      }

      const stats = flowMetrics.getPerformanceStats(minutesBack);
      const stepBreakdown = flowMetrics.getStepPerformanceBreakdown(minutesBack);
      
      res.json({
        success: true,
        data: {
          timeWindow: `${minutesBack} minutes`,
          performance: stats,
          stepBreakdown
        },
        timestamp: new Date().toISOString()
      });

      logger.debug(`[MONITORING] Performance stats requested for ${minutesBack} minutes`);
    } catch (error) {
      logger.error('[MONITORING] Error getting performance stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get performance statistics'
      });
    }
  }

  /**
   * Get workspace-specific metrics
   * GET /metrics/flow/workspace/:workspaceId
   */
  async getWorkspaceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params;
      
      if (!workspaceId) {
        res.status(400).json({
          success: false,
          message: 'Workspace ID is required'
        });
        return;
      }

      const metrics = flowMetrics.getWorkspaceMetrics(workspaceId);
      
      if (!metrics) {
        res.status(404).json({
          success: false,
          message: 'No metrics found for this workspace'
        });
        return;
      }

      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });

      logger.debug(`[MONITORING] Workspace metrics requested for ${workspaceId}`);
    } catch (error) {
      logger.error('[MONITORING] Error getting workspace metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get workspace metrics'
      });
    }
  }

  /**
   * Get all workspace metrics
   * GET /metrics/flow/workspaces
   */
  async getAllWorkspaceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = flowMetrics.getAllWorkspaceMetrics();
      
      res.json({
        success: true,
        data: metrics,
        count: metrics.length,
        timestamp: new Date().toISOString()
      });

      logger.debug('[MONITORING] All workspace metrics requested');
    } catch (error) {
      logger.error('[MONITORING] Error getting all workspace metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get workspace metrics'
      });
    }
  }

  /**
   * Get recent flow metrics
   * GET /metrics/flow/recent?minutes=5
   */
  async getRecentMetrics(req: Request, res: Response): Promise<void> {
    try {
      const minutesBack = parseInt(req.query.minutes as string) || 5;
      
      if (minutesBack < 1 || minutesBack > 60) { // Max 1 hour for recent metrics
        res.status(400).json({
          success: false,
          message: 'Minutes parameter must be between 1 and 60'
        });
        return;
      }

      const metrics = flowMetrics.getRecentMetrics(minutesBack);
      
      res.json({
        success: true,
        data: metrics,
        count: metrics.length,
        timeWindow: `${minutesBack} minutes`,
        timestamp: new Date().toISOString()
      });

      logger.debug(`[MONITORING] Recent metrics requested for ${minutesBack} minutes`);
    } catch (error) {
      logger.error('[MONITORING] Error getting recent metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recent metrics'
      });
    }
  }

  /**
   * Get cache metrics
   * GET /metrics/cache
   */
  async getCacheMetrics(req: Request, res: Response): Promise<void> {
    try {
      // Placeholder cache metrics - can be expanded later
      const cacheMetrics = {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
        evictions: 0,
        lastEviction: null
      };

      res.json({
        success: true,
        data: cacheMetrics,
        timestamp: new Date().toISOString()
      });

      logger.debug('[MONITORING] Cache metrics requested');
    } catch (error) {
      logger.error('[MONITORING] Error getting cache metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cache metrics'
      });
    }
  }

  /**
   * Clear cache
   * POST /metrics/cache/clear
   */
  async clearCache(req: Request, res: Response): Promise<void> {
    try {
      // Placeholder cache clearing - can be expanded later
      logger.info('[MONITORING] Cache clear requested');

      res.json({
        success: true,
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('[MONITORING] Error clearing cache:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache'
      });
    }
  }

  /**
   * Get Prometheus-compatible metrics
   * GET /metrics/prometheus
   */
  async getPrometheusMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = flowMetrics.getAggregatedMetrics();
      
      // Format as Prometheus metrics
      let prometheusText = '';
      prometheusText += `# HELP whatsapp_flow_total_requests Total number of WhatsApp flow requests\n`;
      prometheusText += `# TYPE whatsapp_flow_total_requests counter\n`;
      prometheusText += `whatsapp_flow_total_requests ${metrics.totalMessages}\n\n`;
      
      prometheusText += `# HELP whatsapp_flow_success_rate Success rate of WhatsApp flow\n`;
      prometheusText += `# TYPE whatsapp_flow_success_rate gauge\n`;
      prometheusText += `whatsapp_flow_success_rate ${(metrics.successfulMessages / metrics.totalMessages) * 100}\n\n`;
      
      prometheusText += `# HELP whatsapp_flow_avg_response_time_ms Average response time in milliseconds\n`;
      prometheusText += `# TYPE whatsapp_flow_avg_response_time_ms gauge\n`;
      prometheusText += `whatsapp_flow_avg_response_time_ms ${metrics.averageResponseTime}\n`;

      res.setHeader('Content-Type', 'text/plain');
      res.send(prometheusText);

      logger.debug('[MONITORING] Prometheus metrics requested');
    } catch (error) {
      logger.error('[MONITORING] Error getting Prometheus metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get Prometheus metrics'
      });
    }
  }

  /**
   * Get dashboard data for frontend
   * GET /metrics/dashboard
   */
  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const [aggregated, recentMetrics, healthStatus] = await Promise.all([
        flowMetrics.getAggregatedMetrics(),
        flowMetrics.getRecentMetrics(5),
        flowMetrics.getHealthStatus()
      ]);

      const dashboardData = {
        overview: {
          totalRequests: aggregated.totalMessages,
          successRate: (aggregated.successfulMessages / aggregated.totalMessages) * 100,
          avgResponseTime: aggregated.averageResponseTime,
          errorRate: (aggregated.errorMessages / aggregated.totalMessages) * 100,
          status: healthStatus.status
        },
        recentActivity: recentMetrics.slice(0, 10), // Last 10 activities
        healthStatus: healthStatus,
        lastUpdated: new Date().toISOString()
      };

      res.json({
        success: true,
        data: dashboardData,
        timestamp: new Date().toISOString()
      });

      logger.debug('[MONITORING] Dashboard data requested');
    } catch (error) {
      logger.error('[MONITORING] Error getting dashboard data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard data'
      });
    }
  }
} 