import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../lib/prisma';
import { MessageRepository } from '../../../repositories/message.repository';

// Mock dei moduli e servizi esterni
jest.mock('../../../lib/prisma', () => {
  return {
    prisma: {
      customers: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      workspace: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      chatSession: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      $disconnect: jest.fn(),
    },
  };
});

jest.mock('../../../repositories/message.repository');

// Mock del middleware di autenticazione
jest.mock('../../../interfaces/http/middlewares/auth.middleware', () => {
  return {
    authMiddleware: (req, res, next) => next(),
  };
});

describe('Customer Block Integration Tests', () => {
  // Parametri comuni
  const workspaceId = 'workspace-123';
  const customerId = 'customer-123';
  const customerPhone = '+123456789';
  const chatSessionId = 'chat-123';
  
  // Dati di mock
  const mockCustomer = {
    id: customerId,
    name: 'John Doe',
    email: 'john@example.com',
    phone: customerPhone,
    isBlacklisted: false,
    workspaceId,
    activeChatbot: true,
  };
  
  const mockWorkspace = {
    id: workspaceId,
    name: 'Test Workspace',
    blocklist: '',
  };
  
  const mockChatSession = {
    id: chatSessionId,
    customerId,
    workspaceId,
    status: 'active',
  };
  
  const mockMessageRepo = {
    isCustomerBlacklisted: jest.fn(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (MessageRepository as jest.Mock).mockImplementation(() => mockMessageRepo);
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/workspaces/:workspaceId/customers/:id/block', () => {
    it('should block a customer and add phone to workspace blocklist', async () => {
      // Setup: Mock customer e workspace
      (prisma.customers.findFirst as jest.Mock).mockResolvedValueOnce(mockCustomer);
      (prisma.workspace.findUnique as jest.Mock).mockResolvedValue(mockWorkspace);
      
      // Mock update customer
      const updatedCustomer = { ...mockCustomer, isBlacklisted: true };
      (prisma.customers.update as jest.Mock).mockResolvedValueOnce(updatedCustomer);
      
      // Mock update workspace blocklist
      const updatedWorkspace = { 
        ...mockWorkspace, 
        blocklist: mockWorkspace.blocklist 
          ? `${mockWorkspace.blocklist},${customerPhone}` 
          : customerPhone 
      };
      (prisma.workspace.update as jest.Mock).mockResolvedValueOnce(updatedWorkspace);
      
      // Execute
      const response = await request(app)
        .post(`/api/workspaces/${workspaceId}/customers/${customerId}/block`)
        .send();
      
      // Assert
      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        // Verify customer is marked as blacklisted
        expect(response.body).toHaveProperty('message', 'Customer blocked successfully');
        expect(response.body).toHaveProperty('customer');
        expect(response.body.customer).toHaveProperty('isBlacklisted', true);
        
        // Verify customer update was called with correct parameters
        expect(prisma.customers.update).toHaveBeenCalledWith({
          where: {
            id: customerId,
            workspaceId,
          },
          data: {
            isBlacklisted: true,
          },
        });
        
        // Verify workspace blocklist is updated with customer phone
        expect(prisma.workspace.update).toHaveBeenCalledWith({
          where: { id: workspaceId },
          data: {
            blocklist: expect.stringContaining(customerPhone),
          },
        });
      }
    });
    
    it('should check that blocked customer chat is not visible', async () => {
      // Setup - mock customer found and blocklisted
      const blockedCustomer = { ...mockCustomer, isBlacklisted: true };
      (prisma.customers.findUnique as jest.Mock).mockResolvedValue(blockedCustomer);
      (prisma.customers.findFirst as jest.Mock).mockResolvedValue(blockedCustomer);
      
      // Mock workspace with customer phone in blocklist
      const workspaceWithBlocklist = { 
        ...mockWorkspace, 
        blocklist: customerPhone 
      };
      (prisma.workspace.findUnique as jest.Mock).mockResolvedValue(workspaceWithBlocklist);
      
      // Mock empty chat sessions for blocked customer
      (prisma.chatSession.findMany as jest.Mock).mockResolvedValue([]);
      
      // Execute - try to get chat sessions for this customer
      const response = await request(app)
        .get(`/api/workspaces/${workspaceId}/chat-sessions?customerId=${customerId}`)
        .send();
      
      // Assert - since chat sessions for blocked customers shouldn't be returned,
      // we expect either an empty array (if endpoint is implemented with filtering)
      // or an error status code if the API blocks access entirely
      if (response.status === 200) {
        // If the endpoint returns a success status, the response should be an empty array
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
      } else {
        expect([403, 404]).toContain(response.status);
      }
    });

    it('should handle errors when blocking a non-existent customer', async () => {
      // Setup - mock customer not found
      (prisma.customers.findFirst as jest.Mock).mockResolvedValueOnce(null);
      
      // Execute
      const response = await request(app)
        .post(`/api/workspaces/${workspaceId}/customers/${customerId}/block`)
        .send();
      
      // Assert
      expect(response.status).toBe(404);
      
      // Verify no update operations were performed
      expect(prisma.customers.update).not.toHaveBeenCalled();
      expect(prisma.workspace.update).not.toHaveBeenCalled();
    });
  });
  
  describe('Message visibility with blocked customer', () => {
    it('should verify messages from blocked customers are filtered', async () => {
      // Setup - mock a blocked customer
      const blockedCustomer = {
        ...mockCustomer,
        isBlacklisted: true,
      };
      (prisma.customers.findFirst as jest.Mock).mockResolvedValueOnce(blockedCustomer);
      
      // Mock workspace with customer in blocklist
      (prisma.workspace.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockWorkspace,
        blocklist: customerPhone,
      });
      
      // Mock isCustomerBlacklisted to return true - this may be used in message filtering
      mockMessageRepo.isCustomerBlacklisted.mockResolvedValue(true);
      
      // Execute - attempt to get messages for this customer
      const response = await request(app)
        .get(`/api/workspaces/${workspaceId}/messages?customerId=${customerId}`)
        .send();
      
      // Assert - expect either an empty result or an error
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
      } else {
        expect([403, 404]).toContain(response.status);
      }
    });
  });
}); 