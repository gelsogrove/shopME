import { PrismaClient } from '@prisma/client';
// Cache service removed - using direct repository calls
import { MessageService } from '../../application/services/message.service';
import { flowMetrics } from '../../monitoring/flow-metrics';

const prisma = new PrismaClient();

describe('WhatsApp Dialogue Simulation - Integration Test', () => {
  let messageService: MessageService;
  let workspaceId: string;
  let testPhoneNumber: string;

  beforeAll(async () => {
    messageService = new MessageService();
    testPhoneNumber = '+393331234567';
    
    // Create test workspace with complete settings
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Dialogue Test Workspace',
        slug: 'dialogue-test-workspace',
        plan: 'PROFESSIONAL', // High limits for testing
        isActive: true,
        isDelete: false,
        welcomeMessages: {
          'en': 'Welcome to our store! Please register here: {link}',
          'it': 'Benvenuto nel nostro negozio! Registrati qui: {link}',
          'es': 'Bienvenido a nuestra tienda! Regístrate aquí: {link}'
        },
        wipMessages: {
          'en': 'Our service is temporarily unavailable. We will be back soon!',
          'it': 'Il nostro servizio è temporaneamente non disponibile. Torneremo presto!',
          'es': 'Nuestro servicio no está disponible temporalmente. ¡Volveremos pronto!'
        },
        url: 'https://dialogue-test.example.com'
      }
    });
    workspaceId = workspace.id;

    // Create some test products for the dialogue
    await prisma.products.createMany({
      data: [
        {
          name: 'iPhone 15 Pro',
          slug: 'iphone-15-pro',
          description: 'Latest iPhone with advanced camera system',
          price: 1199.99,
          stock: 10,
          isActive: true,
          workspaceId
        },
        {
          name: 'MacBook Air M3',
          slug: 'macbook-air-m3',
          description: 'Powerful laptop with M3 chip',
          price: 1299.99,
          stock: 5,
          isActive: true,
          workspaceId
        },
        {
          name: 'AirPods Pro',
          slug: 'airpods-pro',
          description: 'Wireless earbuds with noise cancellation',
          price: 249.99,
          stock: 20,
          isActive: true,
          workspaceId
        }
      ]
    });

    // Create some test services
    await prisma.services.createMany({
      data: [
        {
          name: 'Express Shipping',
          description: 'Fast delivery within 24 hours',
          price: 19.99,
          duration: 1,
          isActive: true,
          workspaceId
        },
        {
          name: 'Installation Service',
          description: 'Professional installation at your location',
          price: 99.99,
          duration: 120,
          isActive: true,
          workspaceId
        }
      ]
    });

    // Create some test FAQs
    await prisma.fAQ.createMany({
      data: [
        {
          question: 'What are your shipping options?',
          answer: 'We offer standard shipping (3-5 days) and express shipping (24 hours). Express shipping costs $19.99.',
          isActive: true,
          workspaceId
        },
        {
          question: 'Do you offer warranty?',
          answer: 'Yes, all our products come with a 2-year warranty. We also offer extended warranty options.',
          isActive: true,
          workspaceId
        },
        {
          question: 'Can I return a product?',
          answer: 'Yes, you can return any product within 30 days of purchase for a full refund.',
          isActive: true,
          workspaceId
        }
      ]
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.message.deleteMany({ where: { chatSession: { workspaceId } } });
    await prisma.chatSession.deleteMany({ where: { workspaceId } });
    await prisma.customers.deleteMany({ where: { workspaceId } });
    await prisma.products.deleteMany({ where: { workspaceId } });
    await prisma.services.deleteMany({ where: { workspaceId } });
    await prisma.fAQ.deleteMany({ where: { workspaceId } });
    await prisma.workspace.delete({ where: { id: workspaceId } });
    await prisma.$disconnect();
    // Cache service removed
    flowMetrics.destroy();
  });

  beforeEach(async () => {
    // Clean up only messages and customers before each test, but keep workspace and test data
    await prisma.message.deleteMany({ where: { chatSession: { workspaceId } } });
    await prisma.chatSession.deleteMany({ where: { workspaceId } });
    await prisma.customers.deleteMany({ where: { workspaceId } });
    
    // Clear cache but keep workspace settings cached
          // Cache service removed
  });

  describe('Debug Flow', () => {
    it('should debug the message processing flow', async () => {
      console.log('\n🔍 DEBUG: Testing basic message processing');
      
      // Test with minimal setup
      const testMessage = 'Ciao';
      const testPhone = '+393331234567';
      
      console.log(`📞 Calling processMessage("${testMessage}", "${testPhone}", "${workspaceId}")`);
      
      try {
        const result = await messageService.processMessage(testMessage, testPhone, workspaceId);
        console.log(`✅ Result: ${result}`);
        console.log(`📊 Result type: ${typeof result}`);
        console.log(`🔍 Result === null: ${result === null}`);
        console.log(`🔍 Result === undefined: ${result === undefined}`);
        
        // Check if workspace exists
        const workspace = await prisma.workspace.findUnique({
          where: { id: workspaceId }
        });
        console.log(`🏢 Workspace found: ${!!workspace}`);
        console.log(`🏢 Workspace active: ${workspace?.isActive}`);
        
      } catch (error) {
        console.log(`❌ Error: ${error}`);
        console.log(`📚 Stack: ${error.stack}`);
      }
    }, 30000);
  });

  describe('Complete Customer Journey Simulation', () => {
    it('should simulate a complete customer dialogue from greeting to purchase', async () => {
      console.log('\n🎭 STARTING WHATSAPP DIALOGUE SIMULATION');
      console.log('=' .repeat(60));

      // STEP 1: New customer sends greeting
      console.log('\n👤 CUSTOMER: Sends initial greeting');
      console.log(`📞 Using phone number: ${testPhoneNumber}`);
      console.log(`🏢 Using workspace: ${workspaceId}`);
      
      const greeting = await messageService.processMessage('Ciao!', testPhoneNumber, workspaceId);
      
      console.log(`🤖 BOT: ${greeting}`);
      expect(greeting).toContain('Benvenuto'); // Italian greeting
      expect(greeting).toContain('http'); // Registration link
      
      // Verify customer was NOT created yet (new user flow)
      let customer = await prisma.customers.findFirst({
        where: { phone: testPhoneNumber, workspaceId }
      });
      expect(customer).toBeNull();

      // STEP 2: Customer registers and sends another message
      console.log('\n👤 CUSTOMER: Registers and asks about products');
      
      // Simulate customer registration
      customer = await prisma.customers.create({
        data: {
          name: 'Marco Rossi',
          email: 'marco.rossi@example.com',
          phone: testPhoneNumber,
          workspaceId,
          isActive: true,
          activeChatbot: true,
          language: 'IT'
        }
      });

      const productInquiry = await messageService.processMessage(
        'Ciao, vorrei vedere i vostri iPhone disponibili',
        testPhoneNumber,
        workspaceId
      );
      
      console.log(`🤖 BOT: ${productInquiry}`);
      expect(productInquiry).toBeTruthy();
      expect(productInquiry).not.toBeNull();

      // STEP 3: Customer asks about specific product
      console.log('\n👤 CUSTOMER: Asks about iPhone 15 Pro details');
      
      const productDetails = await messageService.processMessage(
        'Dimmi di più sull\'iPhone 15 Pro, quanto costa?',
        testPhoneNumber,
        workspaceId
      );
      
      console.log(`🤖 BOT: ${productDetails}`);
      expect(productDetails).toBeTruthy();

      // STEP 4: Customer asks about shipping
      console.log('\n👤 CUSTOMER: Asks about shipping options');
      
      const shippingInfo = await messageService.processMessage(
        'Quali sono le opzioni di spedizione?',
        testPhoneNumber,
        workspaceId
      );
      
      console.log(`🤖 BOT: ${shippingInfo}`);
      expect(shippingInfo).toBeTruthy();

      // STEP 5: Customer shows purchase intent
      console.log('\n👤 CUSTOMER: Shows purchase intent');
      
      const purchaseIntent = await messageService.processMessage(
        'Vorrei comprare l\'iPhone 15 Pro, come posso procedere con l\'ordine?',
        testPhoneNumber,
        workspaceId
      );
      
      console.log(`🤖 BOT: ${purchaseIntent}`);
      expect(purchaseIntent).toBeTruthy();
      expect(purchaseIntent).toContain('http'); // Should contain checkout link

      // STEP 6: Customer asks about warranty
      console.log('\n👤 CUSTOMER: Asks about warranty');
      
      const warrantyInfo = await messageService.processMessage(
        'Che garanzia offrite sui prodotti?',
        testPhoneNumber,
        workspaceId
      );
      
      console.log(`🤖 BOT: ${warrantyInfo}`);
      expect(warrantyInfo).toBeTruthy();

      // STEP 7: Customer asks for support
      console.log('\n👤 CUSTOMER: Asks for support contact');
      
      const supportInfo = await messageService.processMessage(
        'Come posso contattare il supporto clienti?',
        testPhoneNumber,
        workspaceId
      );
      
      console.log(`🤖 BOT: ${supportInfo}`);
      expect(supportInfo).toBeTruthy();

      // STEP 8: Customer says goodbye
      console.log('\n👤 CUSTOMER: Says goodbye');
      
      const goodbye = await messageService.processMessage(
        'Grazie per le informazioni, ci sentiamo presto!',
        testPhoneNumber,
        workspaceId
      );
      
      console.log(`🤖 BOT: ${goodbye}`);
      expect(goodbye).toBeTruthy();

      console.log('\n✅ DIALOGUE SIMULATION COMPLETED SUCCESSFULLY');
      console.log('=' .repeat(60));

      // Verify conversation was saved correctly
      const messages = await prisma.message.findMany({
        where: {
          chatSession: {
            workspaceId,
            customer: {
              phone: testPhoneNumber
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      console.log(`\n📊 CONVERSATION SUMMARY:`);
      console.log(`- Total messages exchanged: ${messages.length}`);
      console.log(`- Customer messages: ${messages.filter(m => m.direction === 'INBOUND').length}`);
      console.log(`- Bot responses: ${messages.filter(m => m.direction === 'OUTBOUND').length}`);

      expect(messages.length).toBeGreaterThan(10); // Should have multiple message exchanges
    }, 60000); // 60 second timeout for complete dialogue

    it('should simulate returning customer with welcome back message', async () => {
      console.log('\n🔄 SIMULATING RETURNING CUSTOMER SCENARIO');
      console.log('=' .repeat(50));

      // Create customer with old activity
      const customer = await prisma.customers.create({
        data: {
          name: 'Anna Bianchi',
          email: 'anna.bianchi@example.com',
          phone: testPhoneNumber,
          workspaceId,
          isActive: true,
          activeChatbot: true,
          language: 'IT'
        }
      });

      // Create old chat session and messages (simulate 3 hours ago)
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
          content: 'Ciao, come state?',
          direction: 'INBOUND',
          type: 'TEXT',
          createdAt: oldDate
        }
      });

      console.log('\n👤 RETURNING CUSTOMER: Sends message after 3 hours');
      
      const welcomeBack = await messageService.processMessage(
        'Ciao, sono tornato!',
        testPhoneNumber,
        workspaceId
      );
      
      console.log(`🤖 BOT: ${welcomeBack}`);
      expect(welcomeBack).toContain('Bentornato'); // Welcome back in Italian
      expect(welcomeBack).toContain('Anna'); // Should include customer name

      console.log('\n✅ WELCOME BACK SCENARIO COMPLETED');
    }, 30000);

    it('should simulate operator control scenario', async () => {
      console.log('\n👨‍💼 SIMULATING OPERATOR CONTROL SCENARIO');
      console.log('=' .repeat(50));

      // Create customer with chatbot disabled
      const customer = await prisma.customers.create({
        data: {
          name: 'Giuseppe Verdi',
          email: 'giuseppe.verdi@example.com',
          phone: testPhoneNumber,
          workspaceId,
          isActive: true,
          activeChatbot: false, // Operator control enabled
          language: 'IT'
        }
      });

      console.log('\n👤 CUSTOMER: Sends message (operator control active)');
      
      const operatorResponse = await messageService.processMessage(
        'Ho bisogno di aiuto urgente!',
        testPhoneNumber,
        workspaceId
      );
      
      console.log(`🤖 BOT: No AI response (operator control)`);
      expect(operatorResponse).toBe(''); // Should return empty string for operator control

      // Verify message was saved for operator
      const messages = await prisma.message.findMany({
        where: {
          chatSession: {
            workspaceId,
            customer: {
              phone: testPhoneNumber
            }
          }
        }
      });

      expect(messages.length).toBe(1);
      expect(messages[0].content).toBe('Ho bisogno di aiuto urgente!');

      console.log('\n✅ OPERATOR CONTROL SCENARIO COMPLETED');
    }, 30000);

    it('should simulate spam detection and auto-blacklist', async () => {
      console.log('\n🚫 SIMULATING SPAM DETECTION SCENARIO');
      console.log('=' .repeat(50));

      const spamPhoneNumber = '+393339999999';

      console.log('\n👤 SPAMMER: Sends 10 messages rapidly');

      // Send 10 messages rapidly to trigger spam detection
      const spamPromises = [];
      for (let i = 1; i <= 10; i++) {
        spamPromises.push(
          messageService.processMessage(`Spam message ${i}`, spamPhoneNumber, workspaceId)
        );
      }

      const spamResults = await Promise.all(spamPromises);
      
      console.log(`🤖 BOT: Spam detected, user auto-blacklisted`);
      
      // First few messages might go through, but later ones should be blocked
      const blockedMessages = spamResults.filter(result => result === null);
      expect(blockedMessages.length).toBeGreaterThan(0);

      // Try to send another message - should be blocked
      console.log('\n👤 SPAMMER: Tries to send another message');
      
      const blockedMessage = await messageService.processMessage(
        'Another spam message',
        spamPhoneNumber,
        workspaceId
      );
      
      console.log(`🤖 BOT: Message blocked (blacklisted)`);
      expect(blockedMessage).toBeNull();

      console.log('\n✅ SPAM DETECTION SCENARIO COMPLETED');
    }, 30000);

    it('should simulate multilingual conversation', async () => {
      console.log('\n🌍 SIMULATING MULTILINGUAL CONVERSATION');
      console.log('=' .repeat(50));

      // Test English conversation
      console.log('\n👤 CUSTOMER: Sends English greeting');
      
      const englishGreeting = await messageService.processMessage(
        'Hello!',
        testPhoneNumber,
        workspaceId
      );
      
      console.log(`🤖 BOT (EN): ${englishGreeting}`);
      expect(englishGreeting).toContain('Welcome');

      // Create customer and test Spanish
      const customer = await prisma.customers.create({
        data: {
          name: 'Carlos Rodriguez',
          email: 'carlos@example.com',
          phone: testPhoneNumber,
          workspaceId,
          isActive: true,
          activeChatbot: true,
          language: 'ESP'
        }
      });

      console.log('\n👤 CUSTOMER: Asks question in Spanish');
      
      const spanishResponse = await messageService.processMessage(
        '¿Qué productos tienen disponibles?',
        testPhoneNumber,
        workspaceId
      );
      
      console.log(`🤖 BOT (ES): ${spanishResponse}`);
      expect(spanishResponse).toBeTruthy();

      console.log('\n✅ MULTILINGUAL SCENARIO COMPLETED');
    }, 30000);
  });

  describe('Performance Under Load Simulation', () => {
    it('should handle multiple concurrent conversations', async () => {
      console.log('\n⚡ SIMULATING CONCURRENT CONVERSATIONS');
      console.log('=' .repeat(50));

      const concurrentUsers = 5;
      const messagesPerUser = 3;
      
      // Create multiple customers
      const customers = [];
      for (let i = 0; i < concurrentUsers; i++) {
        const customer = await prisma.customers.create({
          data: {
            name: `Customer ${i}`,
            email: `customer${i}@example.com`,
            phone: `+39333000000${i}`,
            workspaceId,
            isActive: true,
            activeChatbot: true,
            language: 'IT'
          }
        });
        customers.push(customer);
      }

      console.log(`\n👥 ${concurrentUsers} CUSTOMERS: Send messages concurrently`);

      // Simulate concurrent conversations
      const conversationPromises = customers.map(async (customer, userIndex) => {
        const userMessages = [];
        
        for (let msgIndex = 0; msgIndex < messagesPerUser; msgIndex++) {
          const message = `Messaggio ${msgIndex + 1} da utente ${userIndex + 1}`;
          const response = await messageService.processMessage(
            message,
            customer.phone,
            workspaceId
          );
          userMessages.push({ message, response });
          
          // Small delay between messages from same user
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return { userIndex, messages: userMessages };
      });

      const startTime = Date.now();
      const results = await Promise.all(conversationPromises);
      const totalTime = Date.now() - startTime;

      console.log(`🤖 BOT: Handled ${concurrentUsers * messagesPerUser} messages in ${totalTime}ms`);
      console.log(`📊 Average time per message: ${(totalTime / (concurrentUsers * messagesPerUser)).toFixed(2)}ms`);

      // Verify all conversations completed successfully
      results.forEach((result, index) => {
        expect(result.messages).toHaveLength(messagesPerUser);
        result.messages.forEach(({ response }) => {
          expect(response).toBeTruthy();
          expect(response).not.toBeNull();
        });
      });

      // Performance assertions
      expect(totalTime).toBeLessThan(15000); // Should complete within 15 seconds
      expect(totalTime / (concurrentUsers * messagesPerUser)).toBeLessThan(1000); // <1s per message average

      console.log('\n✅ CONCURRENT CONVERSATIONS COMPLETED');
    }, 30000);
  });

  describe('Error Handling Simulation', () => {
    it('should handle gracefully when workspace is inactive', async () => {
      console.log('\n🚧 SIMULATING INACTIVE WORKSPACE SCENARIO');
      console.log('=' .repeat(50));

      // Deactivate workspace
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { isActive: false }
      });

      // Clear cache to ensure fresh data
      // Cache service removed

      console.log('\n👤 CUSTOMER: Sends message to inactive workspace');
      
      const wipResponse = await messageService.processMessage(
        'Ciao, come state?',
        testPhoneNumber,
        workspaceId
      );
      
      console.log(`🤖 BOT: ${wipResponse}`);
      expect(wipResponse).toBeTruthy();
      // Should continue processing after WIP notification (Task 7 fix)

      // Reactivate workspace for other tests
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { isActive: true }
      });

      console.log('\n✅ INACTIVE WORKSPACE SCENARIO COMPLETED');
    }, 30000);
  });

  afterEach(() => {
    // Log metrics after each test
    const metrics = flowMetrics.getAggregatedMetrics();
          // Cache service removed - stats not available
    
    console.log(`\n📊 TEST METRICS:`);
    console.log(`- Messages processed: ${metrics.totalMessages}`);
    console.log(`- Cache hit rate: ${cacheStats.hitRate}%`);
    console.log(`- Cache size: ${cacheStats.size} entries`);
  });
}); 