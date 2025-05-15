import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import { AgentController } from '../../interfaces/http/controllers/agent.controller';
import { ChatController } from '../../interfaces/http/controllers/chat.controller';
import { EventsController } from '../../interfaces/http/controllers/events.controller';

// Type definitions for mocks
interface MockSession {
  id: string;
  [key: string]: any;
}

interface MockMessage {
  id: string;
  [key: string]: any;
}

jest.mock('../../services/chat.service', () => {
  return {
    chatService: {
      getRecentChats: jest.fn().mockImplementation((userId, workspaceId, limit) => {
        expect(workspaceId).toBeDefined();
        return [];
      }),
      getChatMessages: jest.fn().mockImplementation((sessionId, limit, workspaceId) => {
        expect(workspaceId).toBeDefined();
        return [];
      }),
      markAsRead: jest.fn().mockImplementation((sessionId, workspaceId) => {
        expect(workspaceId).toBeDefined();
        return true;
      }),
      deleteChat: jest.fn().mockImplementation((sessionId, workspaceId) => {
        expect(workspaceId).toBeDefined();
        return true;
      })
    }
  };
});

jest.mock('../../services/agent.service', () => {
  return {
    agentService: {
      getAllForWorkspace: jest.fn().mockImplementation((workspaceId) => {
        expect(workspaceId).toBeDefined();
        return [];
      }),
      getById: jest.fn().mockImplementation((id, workspaceId) => {
        expect(workspaceId).toBeDefined();
        return {};
      }),
      create: jest.fn().mockImplementation((data, workspaceId) => {
        expect(workspaceId).toBeDefined();
        return {};
      }),
      update: jest.fn().mockImplementation((id, data, workspaceId) => {
        expect(workspaceId).toBeDefined();
        return {};
      }),
      delete: jest.fn().mockImplementation((id, workspaceId) => {
        expect(workspaceId).toBeDefined();
        return true;
      })
    }
  };
});

jest.mock('../../services/events.service', () => {
  return {
    eventsService: {
      getAllForWorkspace: jest.fn().mockImplementation((workspaceId) => {
        expect(workspaceId).toBeDefined();
        return [];
      }),
      getById: jest.fn().mockImplementation((id, workspaceId) => {
        expect(workspaceId).toBeDefined();
        return {};
      }),
      create: jest.fn().mockImplementation((data) => {
        // @ts-ignore
        expect(data.workspaceId).toBeDefined();
        return {};
      }),
      update: jest.fn().mockImplementation((id, workspaceId, data) => {
        expect(workspaceId).toBeDefined();
        return {};
      }),
      delete: jest.fn().mockImplementation((id, workspaceId) => {
        expect(workspaceId).toBeDefined();
        return true;
      })
    }
  };
});

jest.mock('@prisma/client', () => {
  // Create typed mock objects
  const mockChatSession = {
    findFirst: jest.fn().mockResolvedValue({ id: 'test-session-id' } as MockSession),
    findUnique: jest.fn().mockResolvedValue({ id: 'test-session-id' } as MockSession),
    update: jest.fn().mockResolvedValue({} as MockSession),
  };
  
  const mockMessage = {
    findMany: jest.fn().mockResolvedValue([] as MockMessage[]),
    create: jest.fn().mockResolvedValue({ id: 'test-message-id' } as MockMessage),
  };
  
  const mockPrismaClient = {
    chatSession: mockChatSession,
    message: mockMessage,
    $disconnect: jest.fn().mockResolvedValue(true)
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    MessageDirection: {
      INBOUND: 'INBOUND',
      OUTBOUND: 'OUTBOUND'
    },
    MessageType: {
      TEXT: 'TEXT'
    }
  };
});

describe('Workspace Filtering Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  
  // Controllers
  let chatController: ChatController;
  let agentController: AgentController;
  let eventsController: EventsController;
  
  const TEST_WORKSPACE_ID = 'test-workspace-123';
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock request and response
    mockRequest = {
      params: { workspaceId: TEST_WORKSPACE_ID },
      body: {},
      query: {},
    };
    
    // Add workspaceId to the request (simulating middleware)
    (mockRequest as any).workspaceId = TEST_WORKSPACE_ID;
    
    // Mock response methods
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as Partial<Response>;
    
    mockNext = jest.fn() as unknown as NextFunction;
    
    // Initialize controllers
    chatController = new ChatController();
    agentController = new AgentController();
    eventsController = new EventsController();
  });
  
  // Test Chat Controller
  describe('Chat Controller', () => {
    it('should use workspace ID in getRecentChats', async () => {
      await chatController.getRecentChats(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
    
    it('should use workspace ID in getChatMessages', async () => {
      mockRequest.params = { sessionId: 'test-session-id', workspaceId: TEST_WORKSPACE_ID };
      await chatController.getChatMessages(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
    
    it('should use workspace ID in markAsRead', async () => {
      mockRequest.params = { sessionId: 'test-session-id', workspaceId: TEST_WORKSPACE_ID };
      await chatController.markAsRead(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
    
    it('should use workspace ID in deleteChat', async () => {
      mockRequest.params = { sessionId: 'test-session-id', workspaceId: TEST_WORKSPACE_ID };
      await chatController.deleteChat(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
  
  // Test Agent Controller
  describe('Agent Controller', () => {
    it('should use workspace ID in getAllForWorkspace', async () => {
      await agentController.getAllForWorkspace(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
    
    it('should use workspace ID in getById', async () => {
      mockRequest.params = { id: 'test-agent-id', workspaceId: TEST_WORKSPACE_ID };
      await agentController.getById(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
    
    it('should use workspace ID in create', async () => {
      mockRequest.body = { name: 'Test Agent', content: 'Test content' };
      await agentController.create(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
    
    it('should use workspace ID in update', async () => {
      mockRequest.params = { id: 'test-agent-id', workspaceId: TEST_WORKSPACE_ID };
      mockRequest.body = { name: 'Updated Agent', content: 'Updated content' };
      await agentController.update(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
    
    it('should use workspace ID in delete', async () => {
      mockRequest.params = { id: 'test-agent-id', workspaceId: TEST_WORKSPACE_ID };
      await agentController.delete(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
  
  // Test Events Controller
  describe('Events Controller', () => {
    it('should use workspace ID in getEventsForWorkspace', async () => {
      await eventsController.getEventsForWorkspace(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
    
    it('should use workspace ID in getEventById', async () => {
      mockRequest.params = { id: 'test-event-id', workspaceId: TEST_WORKSPACE_ID };
      await eventsController.getEventById(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
    
    it('should use workspace ID in createEvent', async () => {
      mockRequest.body = { 
        name: 'Test Event', 
        description: 'Test description',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        location: 'Test location',
        price: 10
      };
      await eventsController.createEvent(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
    
    it('should use workspace ID in updateEvent', async () => {
      mockRequest.params = { id: 'test-event-id', workspaceId: TEST_WORKSPACE_ID };
      mockRequest.body = { name: 'Updated Event', description: 'Updated description' };
      await eventsController.updateEvent(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
    
    it('should use workspace ID in deleteEvent', async () => {
      mockRequest.params = { id: 'test-event-id', workspaceId: TEST_WORKSPACE_ID };
      await eventsController.deleteEvent(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
    });
  });
}); 