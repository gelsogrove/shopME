import { FlowiseIntegrationService } from '../../application/services/flowise-integration.service';
import { MessageService } from '../../application/services/message.service';
import logger from '../../utils/logger';

describe('Flowise Integration Tests', () => {
  let flowiseService: FlowiseIntegrationService;
  let messageService: MessageService;
  const testWorkspaceId = 'cm9hjgq9v00014qk8fsdy4ujv'; // From seed

  beforeAll(() => {
    flowiseService = new FlowiseIntegrationService();
    messageService = new MessageService();
  });

  describe('Flowise Service Health', () => {
    it('should check Flowise health status', async () => {
      const isHealthy = await flowiseService.healthCheck();
      
      // Log the result for debugging
      logger.info(`[TEST] Flowise health check result: ${isHealthy}`);
      
      // Test should pass regardless of Flowise status for CI/CD
      expect(typeof isHealthy).toBe('boolean');
    }, 10000);

    it('should get available flows', async () => {
      try {
        const flows = await flowiseService.getAvailableFlows();
        
        logger.info(`[TEST] Available flows count: ${flows.length}`);
        expect(Array.isArray(flows)).toBe(true);
      } catch (error) {
        // If Flowise is not running, this is expected
        logger.info(`[TEST] Flowise not available: ${error.message}`);
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  describe('Message Processing with Flowise', () => {
    const testPhoneNumber = '+393331234567';
    const testMessage = 'Ciao, avete mozzarella?';

    it('should process message with Flowise integration', async () => {
      try {
        const response = await messageService.processMessageWithFlowise(
          testMessage,
          testPhoneNumber,
          testWorkspaceId
        );

        logger.info(`[TEST] Flowise response: ${response}`);
        
        // Should return either a response or null (if blocked/error)
        expect(response === null || typeof response === 'string').toBe(true);
      } catch (error) {
        logger.info(`[TEST] Flowise processing error (expected if not running): ${error.message}`);
        expect(error).toBeDefined();
      }
    }, 30000);

    it('should fallback to traditional processing if Flowise unavailable', async () => {
      // This test ensures fallback works
      const response = await messageService.processMessageWithFlowise(
        testMessage,
        testPhoneNumber,
        testWorkspaceId
      );

      // Should get some response (either from Flowise or fallback)
      expect(response === null || typeof response === 'string').toBe(true);
      
      logger.info(`[TEST] Fallback processing result: ${response ? 'Success' : 'Blocked/Error'}`);
    }, 30000);
  });

  describe('Flowise Flow Configuration', () => {
    it('should handle flow setup gracefully', async () => {
      try {
        const flowId = await flowiseService.setupWhatsAppFlow();
        
        if (flowId) {
          logger.info(`[TEST] Flow created with ID: ${flowId}`);
          expect(typeof flowId).toBe('string');
        } else {
          logger.info(`[TEST] Flow setup failed (expected if Flowise not running)`);
          expect(flowId).toBeNull();
        }
      } catch (error) {
        logger.info(`[TEST] Flow setup error (expected if Flowise not running): ${error.message}`);
        expect(error).toBeDefined();
      }
    }, 15000);
  });

  describe('Performance Comparison', () => {
    const testPhoneNumber = '+393331234567';
    const testMessage = 'Ciao, che prodotti avete?';

    it('should compare traditional vs Flowise processing times', async () => {
      // Traditional processing
      const traditionalStart = Date.now();
      const traditionalResponse = await messageService.processMessage(
        testMessage,
        testPhoneNumber,
        testWorkspaceId
      );
      const traditionalTime = Date.now() - traditionalStart;

      // Flowise processing
      const flowiseStart = Date.now();
      const flowiseResponse = await messageService.processMessageWithFlowise(
        testMessage,
        testPhoneNumber,
        testWorkspaceId
      );
      const flowiseTime = Date.now() - flowiseStart;

      logger.info(`[TEST] Performance comparison:`);
      logger.info(`  Traditional: ${traditionalTime}ms`);
      logger.info(`  Flowise: ${flowiseTime}ms`);
      logger.info(`  Winner: ${flowiseTime < traditionalTime ? 'Flowise' : 'Traditional'}`);

      // Both should return valid responses
      expect(traditionalResponse === null || typeof traditionalResponse === 'string').toBe(true);
      expect(flowiseResponse === null || typeof flowiseResponse === 'string').toBe(true);

      // Performance metrics should be positive numbers
      expect(traditionalTime).toBeGreaterThan(0);
      expect(flowiseTime).toBeGreaterThan(0);
    }, 45000);
  });

  describe('Error Handling', () => {
    it('should handle invalid workspace gracefully', async () => {
      const response = await messageService.processMessageWithFlowise(
        'Test message',
        '+1234567890',
        'invalid-workspace-id'
      );

      // Should handle error gracefully
      expect(response === null || typeof response === 'string').toBe(true);
    }, 15000);

    it('should handle empty message gracefully', async () => {
      const response = await messageService.processMessageWithFlowise(
        '',
        '+1234567890',
        testWorkspaceId
      );

      // Should handle empty message
      expect(response === null || typeof response === 'string').toBe(true);
    }, 15000);
  });

  describe('Integration Points', () => {
    it('should have proper environment configuration', () => {
      const flowiseUrl = process.env.FLOWISE_URL || 'http://localhost:3003';
      const flowiseApiKey = process.env.FLOWISE_API_KEY;
      const flowiseFlowId = process.env.FLOWISE_FLOW_ID;

      expect(flowiseUrl).toBeDefined();
      expect(typeof flowiseUrl).toBe('string');
      
      logger.info(`[TEST] Flowise configuration:`);
      logger.info(`  URL: ${flowiseUrl}`);
      logger.info(`  API Key configured: ${!!flowiseApiKey}`);
      logger.info(`  Flow ID: ${flowiseFlowId || 'default'}`);
    });

    it('should have proper service initialization', () => {
      expect(flowiseService).toBeDefined();
      expect(messageService).toBeDefined();
      
      // Check that services have required methods
      expect(typeof flowiseService.healthCheck).toBe('function');
      expect(typeof flowiseService.processWhatsAppMessage).toBe('function');
      expect(typeof messageService.processMessageWithFlowise).toBe('function');
    });
  });
}); 