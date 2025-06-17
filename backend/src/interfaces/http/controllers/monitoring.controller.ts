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
   * Export metrics in Prometheus format
   * GET /metrics/prometheus
   */
  async getPrometheusMetrics(req: Request, res: Response): Promise<void> {
    try {
      const prometheusMetrics = flowMetrics.exportPrometheusMetrics();
      
      res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(prometheusMetrics);

      logger.debug('[MONITORING] Prometheus metrics exported');
    } catch (error) {
      logger.error('[MONITORING] Error exporting Prometheus metrics:', error);
      res.status(500).send('# Error exporting metrics\n');
    }
  }



  /**
   * Get system overview dashboard data
   * GET /metrics/dashboard
   */
  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const minutesBack = parseInt(req.query.minutes as string) || 60;
      
      const [
        healthStatus,
        performanceStats,
        aggregatedMetrics,
        workspaceMetrics
      ] = await Promise.all([
        Promise.resolve(flowMetrics.getHealthStatus()),
        Promise.resolve(flowMetrics.getPerformanceStats(minutesBack)),
        Promise.resolve(flowMetrics.getAggregatedMetrics()),
        Promise.resolve(flowMetrics.getAllWorkspaceMetrics())
      ]);

      const dashboard = {
        health: healthStatus,
        performance: performanceStats,
        aggregated: aggregatedMetrics,
        workspaces: {
          total: workspaceMetrics.length,
          active: workspaceMetrics.filter(w => Date.now() - w.lastActivity < 3600000).length, // Active in last hour
          topByMessages: workspaceMetrics
            .sort((a, b) => b.messageCount - a.messageCount)
            .slice(0, 5)
        },
        timeWindow: `${minutesBack} minutes`,
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        data: dashboard
      });

      logger.debug(`[MONITORING] Dashboard data requested for ${minutesBack} minutes`);
    } catch (error) {
      logger.error('[MONITORING] Error getting dashboard data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard data'
      });
    }
  }
} 