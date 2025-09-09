/**
 * Cart Performance Monitoring System
 * Monitors lock contention, queue sizes, operation timeouts and performance metrics
 * Solves: Problem #4 - Missing performance monitoring and optimization
 */

export interface PerformanceMetrics {
  // Lock metrics
  lockAcquisitionTime: number
  lockHoldTime: number
  lockContentionCount: number
  lockTimeoutCount: number
  
  // Queue metrics
  queueSize: number
  queueWaitTime: number
  queueProcessingTime: number
  
  // Operation metrics
  operationDuration: number
  operationSuccess: boolean
  operationType: 'add' | 'remove' | 'clear' | 'view'
  
  // Context metrics
  contextHitRate: number
  contextSize: number
  
  // Timestamps
  timestamp: Date
  customerId: string
  workspaceId: string
}

export interface PerformanceAlert {
  type: 'lock_contention' | 'queue_overflow' | 'slow_operation' | 'high_error_rate'
  severity: 'warning' | 'critical'
  message: string
  metrics: Partial<PerformanceMetrics>
  timestamp: Date
  recommendations: string[]
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical'
  averageResponseTime: number
  errorRate: number
  lockContentionRate: number
  queueUtilization: number
  recommendations: string[]
}

/**
 * Cart Performance Monitor
 * Real-time monitoring and alerting for cart operations
 */
export class CartPerformanceMonitor {
  private static instance: CartPerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private alerts: PerformanceAlert[] = []
  
  // Configuration thresholds
  private readonly MAX_METRICS_HISTORY = 1000
  private readonly SLOW_OPERATION_THRESHOLD = 5000 // 5 seconds
  private readonly HIGH_CONTENTION_THRESHOLD = 0.2 // 20%
  private readonly QUEUE_SIZE_WARNING = 10
  private readonly QUEUE_SIZE_CRITICAL = 25
  private readonly ERROR_RATE_WARNING = 0.05 // 5%
  private readonly ERROR_RATE_CRITICAL = 0.15 // 15%

  private constructor() {
    this.startPerformanceMonitoring()
  }

  public static getInstance(): CartPerformanceMonitor {
    if (!CartPerformanceMonitor.instance) {
      CartPerformanceMonitor.instance = new CartPerformanceMonitor()
    }
    return CartPerformanceMonitor.instance
  }

  /**
   * Record performance metrics for an operation
   */
  public recordMetrics(metrics: PerformanceMetrics): void {
    // Add to metrics history
    this.metrics.push(metrics)
    
    // Maintain size limit
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics.shift()
    }
    
    // Check for performance issues
    this.checkPerformanceAlerts(metrics)
    
    console.log(`📊 Performance: ${metrics.operationType} took ${metrics.operationDuration}ms`)
  }

  /**
   * Start operation timing
   */
  public startOperation(
    customerId: string, 
    workspaceId: string, 
    operationType: 'add' | 'remove' | 'clear' | 'view'
  ): { 
    recordLockAcquisition: (acquisitionTime: number) => void
    recordQueueWait: (waitTime: number) => void
    complete: (success: boolean, additionalMetrics?: Partial<PerformanceMetrics>) => void
  } {
    const startTime = Date.now()
    let lockAcquisitionTime = 0
    let queueWaitTime = 0
    
    return {
      recordLockAcquisition: (acquisitionTime: number) => {
        lockAcquisitionTime = acquisitionTime
      },
      
      recordQueueWait: (waitTime: number) => {
        queueWaitTime = waitTime
      },
      
      complete: (success: boolean, additionalMetrics?: Partial<PerformanceMetrics>) => {
        const endTime = Date.now()
        const operationDuration = endTime - startTime
        
        const metrics: PerformanceMetrics = {
          lockAcquisitionTime,
          lockHoldTime: operationDuration - lockAcquisitionTime,
          lockContentionCount: additionalMetrics?.lockContentionCount || 0,
          lockTimeoutCount: additionalMetrics?.lockTimeoutCount || 0,
          queueSize: additionalMetrics?.queueSize || 0,
          queueWaitTime,
          queueProcessingTime: operationDuration - queueWaitTime,
          operationDuration,
          operationSuccess: success,
          operationType,
          contextHitRate: additionalMetrics?.contextHitRate || 0,
          contextSize: additionalMetrics?.contextSize || 0,
          timestamp: new Date(),
          customerId,
          workspaceId,
          ...additionalMetrics
        }
        
        this.recordMetrics(metrics)
      }
    }
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(metrics: PerformanceMetrics): void {
    const now = new Date()
    
    // Check for slow operations
    if (metrics.operationDuration > this.SLOW_OPERATION_THRESHOLD) {
      this.addAlert({
        type: 'slow_operation',
        severity: metrics.operationDuration > this.SLOW_OPERATION_THRESHOLD * 2 ? 'critical' : 'warning',
        message: `Slow ${metrics.operationType} operation: ${metrics.operationDuration}ms`,
        metrics,
        timestamp: now,
        recommendations: [
          'Check database connection pool',
          'Review query performance',
          'Consider caching strategies',
          'Monitor server resources'
        ]
      })
    }
    
    // Check for lock contention
    if (metrics.lockContentionCount > 0) {
      const recentMetrics = this.getRecentMetrics(5 * 60 * 1000) // Last 5 minutes
      const contentionRate = recentMetrics.filter(m => m.lockContentionCount > 0).length / recentMetrics.length
      
      if (contentionRate > this.HIGH_CONTENTION_THRESHOLD) {
        this.addAlert({
          type: 'lock_contention',
          severity: contentionRate > this.HIGH_CONTENTION_THRESHOLD * 2 ? 'critical' : 'warning',
          message: `High lock contention rate: ${(contentionRate * 100).toFixed(1)}%`,
          metrics,
          timestamp: now,
          recommendations: [
            'Reduce lock hold time',
            'Implement optimistic locking',
            'Consider sharding by customer',
            'Review operation batching'
          ]
        })
      }
    }
    
    // Check for queue overflow
    if (metrics.queueSize > this.QUEUE_SIZE_WARNING) {
      this.addAlert({
        type: 'queue_overflow',
        severity: metrics.queueSize > this.QUEUE_SIZE_CRITICAL ? 'critical' : 'warning',
        message: `High queue size: ${metrics.queueSize} operations pending`,
        metrics,
        timestamp: now,
        recommendations: [
          'Increase processing capacity',
          'Implement queue prioritization',
          'Add circuit breaker pattern',
          'Consider async processing'
        ]
      })
    }
    
    // Check error rate
    const recentMetrics = this.getRecentMetrics(10 * 60 * 1000) // Last 10 minutes
    if (recentMetrics.length > 10) {
      const errorRate = recentMetrics.filter(m => !m.operationSuccess).length / recentMetrics.length
      
      if (errorRate > this.ERROR_RATE_WARNING) {
        this.addAlert({
          type: 'high_error_rate',
          severity: errorRate > this.ERROR_RATE_CRITICAL ? 'critical' : 'warning',
          message: `High error rate: ${(errorRate * 100).toFixed(1)}%`,
          metrics,
          timestamp: now,
          recommendations: [
            'Check database connectivity',
            'Review error handling',
            'Monitor external dependencies',
            'Implement retry logic'
          ]
        })
      }
    }
  }

  /**
   * Add performance alert
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert)
    
    // Maintain alert history (keep last 100)
    if (this.alerts.length > 100) {
      this.alerts.shift()
    }
    
    // Log critical alerts immediately
    if (alert.severity === 'critical') {
      console.error(`🚨 CRITICAL ALERT: ${alert.message}`)
      console.error(`📊 Recommendations:`, alert.recommendations)
    } else {
      console.warn(`⚠️ WARNING: ${alert.message}`)
    }
  }

  /**
   * Get recent metrics within time window
   */
  private getRecentMetrics(timeWindowMs: number): PerformanceMetrics[] {
    const cutoff = Date.now() - timeWindowMs
    return this.metrics.filter(m => m.timestamp.getTime() > cutoff)
  }

  /**
   * Get system health status
   */
  public getSystemHealth(): SystemHealth {
    const recentMetrics = this.getRecentMetrics(15 * 60 * 1000) // Last 15 minutes
    
    if (recentMetrics.length === 0) {
      return {
        status: 'healthy',
        averageResponseTime: 0,
        errorRate: 0,
        lockContentionRate: 0,
        queueUtilization: 0,
        recommendations: ['No recent activity to analyze']
      }
    }
    
    // Calculate key metrics
    const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.operationDuration, 0) / recentMetrics.length
    const errorRate = recentMetrics.filter(m => !m.operationSuccess).length / recentMetrics.length
    const lockContentionRate = recentMetrics.filter(m => m.lockContentionCount > 0).length / recentMetrics.length
    const averageQueueSize = recentMetrics.reduce((sum, m) => sum + m.queueSize, 0) / recentMetrics.length
    const queueUtilization = averageQueueSize / this.QUEUE_SIZE_CRITICAL
    
    // Determine system status
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy'
    const recommendations: string[] = []
    
    if (errorRate > this.ERROR_RATE_CRITICAL || 
        averageResponseTime > this.SLOW_OPERATION_THRESHOLD * 2 ||
        queueUtilization > 0.8) {
      status = 'critical'
      recommendations.push('Immediate attention required')
    } else if (errorRate > this.ERROR_RATE_WARNING || 
               averageResponseTime > this.SLOW_OPERATION_THRESHOLD ||
               lockContentionRate > this.HIGH_CONTENTION_THRESHOLD ||
               queueUtilization > 0.5) {
      status = 'degraded'
      recommendations.push('Performance optimization needed')
    }
    
    // Add specific recommendations
    if (averageResponseTime > this.SLOW_OPERATION_THRESHOLD) {
      recommendations.push('Optimize slow operations')
    }
    if (lockContentionRate > this.HIGH_CONTENTION_THRESHOLD) {
      recommendations.push('Reduce lock contention')
    }
    if (queueUtilization > 0.5) {
      recommendations.push('Scale queue processing')
    }
    if (errorRate > this.ERROR_RATE_WARNING) {
      recommendations.push('Investigate error sources')
    }
    
    return {
      status,
      averageResponseTime,
      errorRate,
      lockContentionRate,
      queueUtilization,
      recommendations
    }
  }

  /**
   * Get performance statistics
   */
  public getPerformanceStats(timeWindowMs: number = 60 * 60 * 1000): {
    totalOperations: number
    successRate: number
    averageResponseTime: number
    operationBreakdown: Record<string, number>
    lockMetrics: {
      averageAcquisitionTime: number
      averageHoldTime: number
      contentionRate: number
    }
    queueMetrics: {
      averageSize: number
      averageWaitTime: number
      maxSize: number
    }
  } {
    const metrics = this.getRecentMetrics(timeWindowMs)
    
    if (metrics.length === 0) {
      return {
        totalOperations: 0,
        successRate: 0,
        averageResponseTime: 0,
        operationBreakdown: {},
        lockMetrics: {
          averageAcquisitionTime: 0,
          averageHoldTime: 0,
          contentionRate: 0
        },
        queueMetrics: {
          averageSize: 0,
          averageWaitTime: 0,
          maxSize: 0
        }
      }
    }
    
    const totalOperations = metrics.length
    const successfulOps = metrics.filter(m => m.operationSuccess).length
    const successRate = successfulOps / totalOperations
    
    const averageResponseTime = metrics.reduce((sum, m) => sum + m.operationDuration, 0) / totalOperations
    
    const operationBreakdown: Record<string, number> = {}
    metrics.forEach(m => {
      operationBreakdown[m.operationType] = (operationBreakdown[m.operationType] || 0) + 1
    })
    
    const lockMetrics = {
      averageAcquisitionTime: metrics.reduce((sum, m) => sum + m.lockAcquisitionTime, 0) / totalOperations,
      averageHoldTime: metrics.reduce((sum, m) => sum + m.lockHoldTime, 0) / totalOperations,
      contentionRate: metrics.filter(m => m.lockContentionCount > 0).length / totalOperations
    }
    
    const queueMetrics = {
      averageSize: metrics.reduce((sum, m) => sum + m.queueSize, 0) / totalOperations,
      averageWaitTime: metrics.reduce((sum, m) => sum + m.queueWaitTime, 0) / totalOperations,
      maxSize: Math.max(...metrics.map(m => m.queueSize))
    }
    
    return {
      totalOperations,
      successRate,
      averageResponseTime,
      operationBreakdown,
      lockMetrics,
      queueMetrics
    }
  }

  /**
   * Get recent alerts
   */
  public getRecentAlerts(count: number = 10): PerformanceAlert[] {
    return this.alerts.slice(-count).reverse()
  }

  /**
   * Clear old metrics and alerts
   */
  public cleanup(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    
    // Keep only last hour of metrics
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() > oneHourAgo)
    
    // Keep only last hour of alerts
    this.alerts = this.alerts.filter(a => a.timestamp.getTime() > oneHourAgo)
    
    console.log(`🧹 Performance monitor cleanup: ${this.metrics.length} metrics, ${this.alerts.length} alerts`)
  }

  /**
   * Start automatic performance monitoring
   */
  private startPerformanceMonitoring(): void {
    // Health check every 5 minutes
    setInterval(() => {
      const health = this.getSystemHealth()
      if (health.status !== 'healthy') {
        console.warn(`🏥 System Health: ${health.status} - ${health.recommendations.join(', ')}`)
      }
    }, 5 * 60 * 1000)
    
    // Cleanup every hour
    setInterval(() => {
      this.cleanup()
    }, 60 * 60 * 1000)
    
    console.log('📊 Cart performance monitoring started')
  }

  /**
   * Generate performance report
   */
  public generateReport(): string {
    const health = this.getSystemHealth()
    const stats = this.getPerformanceStats()
    const recentAlerts = this.getRecentAlerts(5)
    
    let report = `
🏥 **CART SYSTEM HEALTH REPORT**
=================================

**System Status:** ${health.status.toUpperCase()}
**Average Response Time:** ${health.averageResponseTime.toFixed(0)}ms
**Error Rate:** ${(health.errorRate * 100).toFixed(1)}%
**Lock Contention Rate:** ${(health.lockContentionRate * 100).toFixed(1)}%
**Queue Utilization:** ${(health.queueUtilization * 100).toFixed(1)}%

📊 **PERFORMANCE STATISTICS**
============================

**Total Operations:** ${stats.totalOperations}
**Success Rate:** ${(stats.successRate * 100).toFixed(1)}%

**Operation Breakdown:**
${Object.entries(stats.operationBreakdown)
  .map(([op, count]) => `  - ${op}: ${count}`)
  .join('\n')}

**Lock Performance:**
  - Avg Acquisition Time: ${stats.lockMetrics.averageAcquisitionTime.toFixed(0)}ms
  - Avg Hold Time: ${stats.lockMetrics.averageHoldTime.toFixed(0)}ms
  - Contention Rate: ${(stats.lockMetrics.contentionRate * 100).toFixed(1)}%

**Queue Performance:**
  - Average Size: ${stats.queueMetrics.averageSize.toFixed(1)}
  - Average Wait Time: ${stats.queueMetrics.averageWaitTime.toFixed(0)}ms
  - Max Size: ${stats.queueMetrics.maxSize}

🚨 **RECENT ALERTS**
==================

${recentAlerts.length > 0 
  ? recentAlerts.map(alert => 
      `${alert.severity === 'critical' ? '🚨' : '⚠️'} ${alert.type}: ${alert.message}`
    ).join('\n')
  : 'No recent alerts'}

💡 **RECOMMENDATIONS**
=====================

${health.recommendations.map(rec => `• ${rec}`).join('\n')}
`
    
    return report
  }
}

// Export singleton instance
export const cartPerformanceMonitor = CartPerformanceMonitor.getInstance()
