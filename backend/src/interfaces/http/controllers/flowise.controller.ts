import { Request, Response } from 'express';
import { FlowiseIntegrationService } from '../../../application/services/flowise-integration.service';
import { MessageService } from '../../../application/services/message.service';
import logger from '../../../utils/logger';

/**
 * 🤖 Flowise Controller
 * 
 * Manages Flowise integration, health checks, and flow management
 */
export class FlowiseController {
  private flowiseService: FlowiseIntegrationService;
  private messageService: MessageService;

  constructor() {
    this.flowiseService = new FlowiseIntegrationService();
    this.messageService = new MessageService();
  }

  /**
   * 🔍 Health check for Flowise service
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.flowiseService.healthCheck();
      
      res.status(200).json({
        success: true,
        data: {
          flowise: {
            status: isHealthy ? 'healthy' : 'unhealthy',
            url: process.env.FLOWISE_URL || 'http://localhost:3003',
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      logger.error('[FLOWISE] Health check error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check Flowise health'
      });
    }
  }

  /**
   * 📋 Get available flows from Flowise
   */
  async getFlows(req: Request, res: Response): Promise<void> {
    try {
      const flows = await this.flowiseService.getAvailableFlows();
      
      res.status(200).json({
        success: true,
        data: {
          flows,
          count: flows.length
        }
      });
    } catch (error) {
      logger.error('[FLOWISE] Get flows error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Flowise flows'
      });
    }
  }

  /**
   * 🔄 Setup WhatsApp flow in Flowise
   */
  async setupWhatsAppFlow(req: Request, res: Response): Promise<void> {
    try {
      const flowId = await this.flowiseService.setupWhatsAppFlow();
      
      if (flowId) {
        res.status(201).json({
          success: true,
          data: {
            flowId,
            message: 'WhatsApp flow created successfully',
            url: `${process.env.FLOWISE_URL}/chatflow/${flowId}`
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to create WhatsApp flow'
        });
      }
    } catch (error) {
      logger.error('[FLOWISE] Setup flow error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to setup WhatsApp flow'
      });
    }
  }

  /**
   * 🧪 Test message processing with Flowise
   */
  async testMessage(req: Request, res: Response): Promise<void> {
    try {
      const { message, phoneNumber, workspaceId } = req.body;

      if (!message || !phoneNumber || !workspaceId) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: message, phoneNumber, workspaceId'
        });
        return;
      }

      const startTime = Date.now();
      
      // Process message with Flowise
      const response = await this.messageService.processMessageWithFlowise(
        message,
        phoneNumber,
        workspaceId
      );

      const processingTime = Date.now() - startTime;

      res.status(200).json({
        success: true,
        data: {
          input: {
            message,
            phoneNumber,
            workspaceId
          },
          output: {
            response,
            processingTime: `${processingTime}ms`
          },
          metadata: {
            processedWith: 'flowise',
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      logger.error('[FLOWISE] Test message error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process test message'
      });
    }
  }

  /**
   * 📊 Compare traditional vs Flowise processing
   */
  async compareProcessing(req: Request, res: Response): Promise<void> {
    try {
      const { message, phoneNumber, workspaceId } = req.body;

      if (!message || !phoneNumber || !workspaceId) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: message, phoneNumber, workspaceId'
        });
        return;
      }

      // Process with traditional method
      const traditionalStart = Date.now();
      const traditionalResponse = await this.messageService.processMessage(
        message,
        phoneNumber,
        workspaceId
      );
      const traditionalTime = Date.now() - traditionalStart;

      // Process with Flowise
      const flowiseStart = Date.now();
      const flowiseResponse = await this.messageService.processMessageWithFlowise(
        message,
        phoneNumber,
        workspaceId
      );
      const flowiseTime = Date.now() - flowiseStart;

      res.status(200).json({
        success: true,
        data: {
          input: {
            message,
            phoneNumber,
            workspaceId
          },
          comparison: {
            traditional: {
              response: traditionalResponse,
              processingTime: `${traditionalTime}ms`
            },
            flowise: {
              response: flowiseResponse,
              processingTime: `${flowiseTime}ms`
            },
            performance: {
              winner: flowiseTime < traditionalTime ? 'flowise' : 'traditional',
              difference: `${Math.abs(flowiseTime - traditionalTime)}ms`,
              improvement: flowiseTime < traditionalTime 
                ? `${((traditionalTime - flowiseTime) / traditionalTime * 100).toFixed(1)}% faster`
                : `${((flowiseTime - traditionalTime) / traditionalTime * 100).toFixed(1)}% slower`
            }
          }
        }
      });
    } catch (error) {
      logger.error('[FLOWISE] Compare processing error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to compare processing methods'
      });
    }
  }

  /**
   * 🔧 Get Flowise configuration
   */
  async getConfiguration(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: {
          configuration: {
            url: process.env.FLOWISE_URL || 'http://localhost:3003',
            flowId: process.env.FLOWISE_FLOW_ID || 'whatsapp-main-flow',
            apiKeyConfigured: !!process.env.FLOWISE_API_KEY,
            environment: process.env.NODE_ENV || 'development'
          },
          integration: {
            enabled: true,
            fallbackToTraditional: true,
            healthCheckInterval: '30s'
          },
          endpoints: {
            health: '/api/flowise/health',
            flows: '/api/flowise/flows',
            setup: '/api/flowise/setup',
            test: '/api/flowise/test',
            compare: '/api/flowise/compare'
          }
        }
      });
    } catch (error) {
      logger.error('[FLOWISE] Get configuration error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get Flowise configuration'
      });
    }
  }
} 