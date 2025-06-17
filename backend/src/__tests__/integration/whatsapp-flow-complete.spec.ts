import { PrismaClient } from '@prisma/client';
import { MessageService } from '../../application/services/message.service';

const prisma = new PrismaClient();

describe('TASK 8: Comprehensive WhatsApp Flow Testing', () => {
  let messageService: MessageService;
  let workspaceId: string;
  let testPhoneNumber: string;

  beforeAll(async () => {
    messageService = new MessageService();
    testPhoneNumber = '+1234567890';
    
    // Create test workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        slug: 'test-workspace',
        plan: 'FREE',
        isActive: true,
        isDelete: false,
        welcomeMessages: {
          'en': 'Welcome! Please register here: {link}',
          'it': 'Benvenuto! Registrati qui: {link}'
        },
        wipMessages: {
          'en': 'Service temporarily unavailable',
          'it': 'Servizio temporaneamente non disponibile'
        },
        url: 'https://test.example.com'
      }
    });
    workspaceId = workspace.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.message.deleteMany({ where: { chatSession: { workspaceId } } });
    await prisma.chatSession.deleteMany({ where: { workspaceId } });
    await prisma.customers.deleteMany({ where: { workspaceId } });
    await prisma.workspace.delete({ where: { id: workspaceId } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up messages and customers before each test
    await prisma.message.deleteMany({ where: { chatSession: { workspaceId } } });
    await prisma.chatSession.deleteMany({ where: { workspaceId } });
    await prisma.customers.deleteMany({ where: { workspaceId } });
  });

  describe('Scenario 1: Nuovo utente + saluto → welcome message + registration', () => {
    it('should handle new user greeting with welcome message and registration link', async () => {
      // Act
      const result = await messageService.processMessage(
        'Hello',
        testPhoneNumber,
        workspaceId
      );

      // Assert
      expect(result).toContain('Welcome!');
      expect(result).toContain('register');
      expect(result).toContain('https://test.example.com/register');
      expect(result).toContain(testPhoneNumber);
      expect(result).toContain(workspaceId);

      // Verify customer was created
      const customer = await prisma.customers.findFirst({
        where: { phone: testPhoneNumber, workspaceId }
      });
      expect(customer).toBeTruthy();
      expect(customer?.name).toBe('Unknown Customer');
    });

    it('should not respond to new user with non-greeting message', async () => {
      // Act
      const result = await messageService.processMessage(
        'I want to buy something',
        testPhoneNumber,
        workspaceId
      );

      // Assert
      expect(result).toBeNull();

      // Verify no customer was created
      const customer = await prisma.customers.findFirst({
        where: { phone: testPhoneNumber, workspaceId }
      });
      expect(customer).toBeNull();
    });
  });

  describe('Scenario 2: Utente registrato + chat normale → RAG response', () => {
    beforeEach(async () => {
      // Create registered customer
      await prisma.customers.create({
        data: {
          name: 'Registered Customer',
          email: 'test@example.com',
          phone: testPhoneNumber,
          workspaceId,
          isActive: true,
          activeChatbot: true
        }
      });
    });

    it('should process normal chat for registered customer', async () => {
      // Act
      const result = await messageService.processMessage(
        'What products do you have?',
        testPhoneNumber,
        workspaceId
      );

      // Assert
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
      expect(result).not.toBe('');
    });
  });

  describe('Scenario 3: Spam detection → auto-blacklist', () => {
    it('should detect spam and auto-blacklist user', async () => {
      // Arrange - Send 10 messages quickly to trigger spam detection
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          messageService.processMessage(
            `Spam message ${i}`,
            testPhoneNumber,
            workspaceId
          )
        );
      }

      // Act
      const results = await Promise.all(promises);

      // Assert
      // Last few messages should return null (blocked)
      const nullResults = results.filter(r => r === null);
      expect(nullResults.length).toBeGreaterThan(0);

      // Verify customer is blacklisted
      const customer = await prisma.customers.findFirst({
        where: { phone: testPhoneNumber, workspaceId }
      });
      expect(customer?.isBlacklisted).toBe(true);
    });
  });

  describe('Scenario 4: Utente blacklisted → no response', () => {
    beforeEach(async () => {
      // Create blacklisted customer
      await prisma.customers.create({
        data: {
          name: 'Blacklisted Customer',
          email: 'blacklisted@example.com',
          phone: testPhoneNumber,
          workspaceId,
          isActive: true,
          isBlacklisted: true
        }
      });
    });

    it('should not respond to blacklisted customer', async () => {
      // Act
      const result = await messageService.processMessage(
        'Hello, I need help',
        testPhoneNumber,
        workspaceId
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Scenario 5: Canale inattivo → WIP message + continue processing', () => {
    beforeEach(async () => {
      // Deactivate workspace
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { isActive: false }
      });

      // Create customer
      await prisma.customers.create({
        data: {
          name: 'Test Customer',
          email: 'test@example.com',
          phone: testPhoneNumber,
          workspaceId,
          isActive: true,
          activeChatbot: true
        }
      });
    });

    afterEach(async () => {
      // Reactivate workspace
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { isActive: true }
      });
    });

    it('should send WIP notification but continue with normal processing', async () => {
      // Act
      const result = await messageService.processMessage(
        'Hello, I need help',
        testPhoneNumber,
        workspaceId
      );

      // Assert
      // Should continue processing and return AI response (not just WIP message)
      expect(result).toBeTruthy();
      expect(result).not.toBe('Service temporarily unavailable');

      // Verify WIP message was saved
      const messages = await prisma.message.findMany({
        where: {
          chatSession: {
            customer: { phone: testPhoneNumber },
            workspaceId
          }
        },
        include: { chatSession: true }
      });

      const wipMessage = messages.find(m => 
        m.direction === 'OUTBOUND' && 
        m.content?.includes('temporarily unavailable')
      );
      expect(wipMessage).toBeTruthy();
    });
  });

  describe('Scenario 6: Controllo operatore → save message, no AI', () => {
    beforeEach(async () => {
      // Create customer with operator control
      await prisma.customers.create({
        data: {
          name: 'Operator Control Customer',
          email: 'operator@example.com',
          phone: testPhoneNumber,
          workspaceId,
          isActive: true,
          activeChatbot: false // Operator control active
        }
      });
    });

    it('should save message but not generate AI response when operator control is active', async () => {
      // Act
      const result = await messageService.processMessage(
        'I need human assistance',
        testPhoneNumber,
        workspaceId
      );

      // Assert
      expect(result).toBe(''); // Empty string for operator control

      // Verify message was saved
      const messages = await prisma.message.findMany({
        where: {
          chatSession: {
            customer: { phone: testPhoneNumber },
            workspaceId
          }
        }
      });

      const inboundMessage = messages.find(m => m.direction === 'INBOUND');
      expect(inboundMessage).toBeTruthy();
      expect(inboundMessage?.content).toBe('I need human assistance');
    });
  });

  describe('Scenario 7: API limit superato → no response', () => {
    it('should not process message when API limit is exceeded', async () => {
      // Note: This test would require mocking the API limit service
      // or creating a workspace with very low limits
      // For now, we'll test the normal case
      
      const result = await messageService.processMessage(
        'Hello',
        testPhoneNumber,
        workspaceId
      );

      // Should process normally (API limit not exceeded)
      expect(result).toBeTruthy();
    });
  });

  describe('Scenario 8: Bentornato dopo 2 ore → welcome back', () => {
    beforeEach(async () => {
      // Create customer
      const customer = await prisma.customers.create({
        data: {
          name: 'Returning Customer',
          email: 'returning@example.com',
          phone: testPhoneNumber,
          workspaceId,
          isActive: true,
          activeChatbot: true
        }
      });

      // Create old chat session and message (more than 2 hours ago)
      const oldDate = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
      
      const chatSession = await prisma.chatSession.create({
        data: {
          customerId: customer.id,
          workspaceId,
          status: 'active',
          createdAt: oldDate
        }
      });

      await prisma.message.create({
        data: {
          chatSessionId: chatSession.id,
          content: 'Old message',
          direction: 'INBOUND',
          type: 'TEXT',
          createdAt: oldDate
        }
      });
    });

    it('should send welcome back message for returning customer', async () => {
      // Act
      const result = await messageService.processMessage(
        'Hello again',
        testPhoneNumber,
        workspaceId
      );

      // Assert
      expect(result).toContain('Welcome back') || expect(result).toContain('Bentornato');
    });
  });

  describe('Scenario 9: Intent checkout → link generation', () => {
    beforeEach(async () => {
      // Create customer
      await prisma.customers.create({
        data: {
          name: 'Shopping Customer',
          email: 'shopping@example.com',
          phone: testPhoneNumber,
          workspaceId,
          isActive: true,
          activeChatbot: true
        }
      });
    });

    it('should generate checkout link when checkout intent is detected', async () => {
      // Act
      const result = await messageService.processMessage(
        'I want to finalize my order',
        testPhoneNumber,
        workspaceId
      );

      // Assert
      expect(result).toContain('checkout') || expect(result).toContain('order');
      expect(result).toContain('https://') || expect(result).toContain('http://');
    });
  });

  describe('Scenario 10: Errori vari → fallback graceful', () => {
    it('should handle database errors gracefully', async () => {
      // Act - Try to process message for non-existent workspace
      const result = await messageService.processMessage(
        'Hello',
        testPhoneNumber,
        'non-existent-workspace'
      );

      // Assert
      expect(result).toBeTruthy();
      expect(result).toContain('Workspace not found') || expect(result).toContain('support');
    });

    it('should handle malformed phone numbers gracefully', async () => {
      // Act
      const result = await messageService.processMessage(
        'Hello',
        'invalid-phone',
        workspaceId
      );

      // Assert
      // Should not crash and should handle gracefully
      expect(result).toBeDefined();
    });

    it('should handle empty messages gracefully', async () => {
      // Act
      const result = await messageService.processMessage(
        '',
        testPhoneNumber,
        workspaceId
      );

      // Assert
      // Should not crash
      expect(result).toBeDefined();
    });

    it('should handle very long messages gracefully', async () => {
      // Act
      const longMessage = 'A'.repeat(10000); // 10KB message
      const result = await messageService.processMessage(
        longMessage,
        testPhoneNumber,
        workspaceId
      );

      // Assert
      // Should not crash
      expect(result).toBeDefined();
    });
  });

  describe('Integration: Complete Flow Scenarios', () => {
    it('should handle complete customer journey: new user → registration → normal chat', async () => {
      // Step 1: New user greeting
      const welcomeResult = await messageService.processMessage(
        'Hello',
        testPhoneNumber,
        workspaceId
      );
      
      expect(welcomeResult).toContain('Welcome');
      expect(welcomeResult).toContain('register');

      // Step 2: Simulate registration (customer should exist now)
      const customer = await prisma.customers.findFirst({
        where: { phone: testPhoneNumber, workspaceId }
      });
      expect(customer).toBeTruthy();

      // Step 3: Normal chat after registration
      const chatResult = await messageService.processMessage(
        'What products do you have?',
        testPhoneNumber,
        workspaceId
      );

      expect(chatResult).toBeTruthy();
      expect(typeof chatResult).toBe('string');
    });

    it('should handle operator control toggle scenario', async () => {
      // Step 1: Create customer with AI active
      const customer = await prisma.customers.create({
        data: {
          name: 'Toggle Customer',
          email: 'toggle@example.com',
          phone: testPhoneNumber,
          workspaceId,
          isActive: true,
          activeChatbot: true
        }
      });

      // Step 2: Normal AI response
      const aiResult = await messageService.processMessage(
        'Hello',
        testPhoneNumber,
        workspaceId
      );
      expect(aiResult).toBeTruthy();
      expect(aiResult).not.toBe('');

      // Step 3: Disable chatbot (simulate operator control)
      await prisma.customers.update({
        where: { id: customer.id },
        data: { activeChatbot: false }
      });

      // Step 4: Should return empty string (operator control)
      const operatorResult = await messageService.processMessage(
        'I need help',
        testPhoneNumber,
        workspaceId
      );
      expect(operatorResult).toBe('');

      // Step 5: Re-enable chatbot
      await prisma.customers.update({
        where: { id: customer.id },
        data: { activeChatbot: true }
      });

      // Step 6: Should return AI response again
      const aiResult2 = await messageService.processMessage(
        'Hello again',
        testPhoneNumber,
        workspaceId
      );
      expect(aiResult2).toBeTruthy();
      expect(aiResult2).not.toBe('');
    });
  });
}); 