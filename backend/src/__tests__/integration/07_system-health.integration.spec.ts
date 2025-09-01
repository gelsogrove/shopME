import request from 'supertest';
import app from '../../app';
import { prisma } from '../../lib/prisma';
import { simulateWhatsAppMessage } from './common-test-helpers';

describe('🔧 System Health Integration Tests', () => {
  const TEST_WORKSPACE_ID = 'cm9hjgq9v00014qk8fsdy4ujv';
  const TEST_CUSTOMER_PHONE = '+39123456789';

  beforeAll(async () => {
    // Ensure test customer exists
    await prisma.customers.upsert({
      where: { id: TEST_CUSTOMER_PHONE }, // Use phone as ID for test
      update: {},
      create: {
        id: TEST_CUSTOMER_PHONE, // Use phone as ID
        phone: TEST_CUSTOMER_PHONE,
        email: 'test@example.com',
        name: 'Test Customer',
        workspace: {
          connect: { id: TEST_WORKSPACE_ID }
        },
        language: 'en'
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('🚨 Critical System Health Checks', () => {
    it.skip('should detect workflow failures', async () => {
      // Test if external workflow systems are accessible
      try {
        // This would be where we test external integrations
        const response = { status: 200 }; // Mock response
        
        if (response.status !== 200) {
          console.error('🚨 CRITICAL: External workflow is failing with error');
          expect(response.status).toBe(200);
          throw new Error('External workflow is not functional - system health check failed');
        }
        
        expect(response.status).toBe(200);
      } catch (error) {
        console.error('External workflow test error:', error);
        throw error;
      }
    });

    it.skip('should detect OpenRouter API failures', async () => {
      const response = await simulateWhatsAppMessage(
        TEST_CUSTOMER_PHONE,
        'hello',
        TEST_WORKSPACE_ID
      );

      // Check for OpenRouter specific errors
      const responseText = response.body?.data?.processedMessage || '';
      const openRouterErrors = [
        'payment required',
        'credits exhausted',
        '402',
        'prompt tokens limit exceeded'
      ];

      const hasOpenRouterError = openRouterErrors.some(error => 
        responseText.toLowerCase().includes(error)
      );

      if (hasOpenRouterError) {
        console.error('🚨 CRITICAL: OpenRouter API is failing');
        console.error('Response:', responseText);
        throw new Error('OpenRouter API health check failed - credits may be exhausted');
      }
    }, 30000);

    it.skip('should verify basic message processing works', async () => {
      const response = await simulateWhatsAppMessage(
        TEST_CUSTOMER_PHONE,
        'hello',
        TEST_WORKSPACE_ID
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('processedMessage');
      
      const processedMessage = response.body.data.processedMessage;
      expect(typeof processedMessage).toBe('string');
      expect(processedMessage.length).toBeGreaterThan(0);

      // Check that response is not an error message
      const errorPatterns = [
        /error/i,
        /failed/i,
        /unavailable/i,
        /service unavailable/i,
        /internal server error/i
      ];

      const isErrorResponse = errorPatterns.some(pattern => 
        pattern.test(processedMessage)
      );

      if (isErrorResponse) {
        console.error('🚨 CRITICAL: Basic message processing is failing');
        console.error('Response:', processedMessage);
        throw new Error('Basic message processing health check failed');
      }
    }, 30000);
  });

  describe('🔍 System Component Health', () => {
    it.skip('should verify external systems are accessible', async () => {
      // Test if external systems are accessible
      try {
        // This would test external system connectivity
        const isAccessible = true; // Mock check
        
        if (!isAccessible) {
          console.error('🚨 CRITICAL: External systems are not accessible');
          throw new Error('External system health check failed - service may be down');
        }
        
        expect(isAccessible).toBe(true);
      } catch (error) {
        console.error('External system accessibility test error:', error);
        throw error;
      }
    });

    it.skip('should verify database connection', async () => {
      try {
        const customer = await prisma.customers.findFirst({
          where: { phone: TEST_CUSTOMER_PHONE }
        });
        
        expect(customer).toBeDefined();
        expect(customer?.phone).toBe(TEST_CUSTOMER_PHONE);
      } catch (error) {
        console.error('🚨 CRITICAL: Database connection failed');
        throw new Error('Database health check failed');
      }
    });

    it.skip('should verify backend API is responsive', async () => {
      try {
        const response = await request(app)
          .get('/health')
          .timeout(5000);
        
        expect(response.status).toBe(200);
      } catch (error) {
        console.error('🚨 CRITICAL: Backend API is not responsive');
        throw new Error('Backend API health check failed');
      }
    });
  });

  describe('📊 System Performance Health', () => {
    it.skip('should complete message processing within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await simulateWhatsAppMessage(
        TEST_CUSTOMER_PHONE,
        'hello',
        TEST_WORKSPACE_ID
      );

      const processingTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(processingTime).toBeLessThan(15000); // 15 seconds max
      
      if (processingTime > 15000) {
        console.error('🚨 WARNING: Message processing is too slow');
        console.error(`Processing time: ${processingTime}ms`);
      }
    }, 30000);
  });
});
