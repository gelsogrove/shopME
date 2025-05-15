import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../interfaces/http/middlewares/error.middleware';

// Setup mocks before imports
jest.mock('../../../services/events.service', () => {
  return {
    eventsService: {
      getAllForWorkspace: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  };
});

// Import after mocking
import { EventsController } from '../../../interfaces/http/controllers/events.controller';
import { eventsService } from '../../../services/events.service';

// Cast the mocked service to get proper typing for the mock functions
const mockedEventsService = eventsService as jest.Mocked<typeof eventsService>;

describe('Events Controller', () => {
  let eventsController: EventsController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create a new controller instance
    eventsController = new EventsController();

    // Mock request, response, and next
    mockRequest = {
      params: {
        id: 'event-test-id',
        workspaceId: 'workspace-test-id'
      },
      body: {
        name: 'Test Event',
        description: 'Test event description',
        startDate: new Date('2023-12-01T10:00:00Z'),
        endDate: new Date('2023-12-01T12:00:00Z'),
        location: 'Test Location',
        price: 100
      },
      originalUrl: '/api/workspaces/workspace-test-id/events'
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    } as unknown as Partial<Response>;

    mockNext = jest.fn() as unknown as NextFunction;
  });

  describe('getEventsForWorkspace', () => {
    it('should return events filtered by workspace ID', async () => {
      // Setup mock data with all required fields
      const now = new Date();
      const mockEvents = [
        { 
          id: 'event-1',
          name: 'Event 1', 
          workspaceId: 'workspace-test-id',
          description: 'Description 1',
          startDate: now,
          endDate: new Date(now.getTime() + 3600000),
          location: 'Location 1',
          price: 100,
          currency: 'USD',
          isActive: true,
          maxAttendees: 100,
          currentAttendees: 0,
          createdAt: now,
          updatedAt: now
        },
        { 
          id: 'event-2',
          name: 'Event 2', 
          workspaceId: 'workspace-test-id',
          description: 'Description 2',
          startDate: now,
          endDate: new Date(now.getTime() + 3600000),
          location: 'Location 2',
          price: 200,
          currency: 'USD',
          isActive: true,
          maxAttendees: 50,
          currentAttendees: 0,
          createdAt: now,
          updatedAt: now
        }
      ];
      mockedEventsService.getAllForWorkspace.mockResolvedValue(mockEvents);

      // Execute
      await eventsController.getEventsForWorkspace(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockedEventsService.getAllForWorkspace).toHaveBeenCalledWith('workspace-test-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockEvents);
    });

    it('should handle missing workspace ID', async () => {
      // Setup request without workspace ID
      mockRequest.params = {};

      // Configure the mock to throw an error when the service is called
      mockedEventsService.getAllForWorkspace.mockImplementation(() => {
        throw new Error('workspaceId is required');
      });

      // Execute the method and expect it to throw an AppError
      await expect(async () => {
        await eventsController.getEventsForWorkspace(
          mockRequest as Request,
          mockResponse as Response
        );
      }).rejects.toThrow('Failed to get events');
    });

    it('should throw an error when service fails', async () => {
      // Setup service to throw an error
      mockedEventsService.getAllForWorkspace.mockRejectedValue(new Error('Service error'));

      // Execute and expect error
      await expect(async () => {
        await eventsController.getEventsForWorkspace(
          mockRequest as Request,
          mockResponse as Response
        );
      }).rejects.toThrow(AppError);
    });
  });

  describe('getEventById', () => {
    it('should return event filtered by ID and workspace ID', async () => {
      // Setup mock data with all required fields
      const now = new Date();
      const mockEvent = { 
        id: 'event-test-id', 
        name: 'Test Event', 
        workspaceId: 'workspace-test-id',
        description: 'Test description',
        startDate: now,
        endDate: new Date(now.getTime() + 3600000),
        location: 'Test Location',
        price: 100,
        currency: 'USD',
        isActive: true,
        maxAttendees: 100,
        currentAttendees: 0,
        createdAt: now,
        updatedAt: now
      };
      mockedEventsService.getById.mockResolvedValue(mockEvent);

      // Execute
      await eventsController.getEventById(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockedEventsService.getById).toHaveBeenCalledWith('event-test-id', 'workspace-test-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockEvent);
    });

    it('should return 404 if event not found in workspace', async () => {
      // Setup service to return null (event not found)
      mockedEventsService.getById.mockResolvedValue(null);

      // Execute
      await eventsController.getEventById(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Event not found'
      }));
    });
  });

  describe('createEvent', () => {
    it('should handle when workspace ID is not provided', async () => {
      // Setup request without workspace ID
      mockRequest.params = {};
      mockRequest.originalUrl = '/api/events'; // URL without workspace ID

      try {
        // Execute
        await eventsController.createEvent(
          mockRequest as Request,
          mockResponse as Response
        );
        
        // Since the controller seems to throw an error, we should add a fail check
        // in case it doesn't throw as expected
        fail('Expected an error to be thrown');
      } catch (error) {
        // Expect AppError to be thrown with the correct message
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('Failed to create event');
      }
    });

    it('should create event with correct workspace ID', async () => {
      // Setup mock data with all required fields
      const now = new Date();
      const mockCreatedEvent = { 
        id: 'new-event-id', 
        name: 'Test Event', 
        workspaceId: 'workspace-test-id',
        description: 'Test description',
        startDate: now,
        endDate: new Date(now.getTime() + 3600000),
        location: 'Test Location',
        price: 100,
        currency: 'USD',
        isActive: true,
        maxAttendees: 100,
        currentAttendees: 0,
        createdAt: now,
        updatedAt: now
      };
      mockedEventsService.create.mockResolvedValue(mockCreatedEvent);

      // Execute
      await eventsController.createEvent(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockedEventsService.create).toHaveBeenCalledWith(expect.objectContaining({
        workspaceId: 'workspace-test-id'
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedEvent);
    });
  });

  describe('updateEvent', () => {
    it('should update event with correct workspace ID filtering', async () => {
      // Setup mock data with all required fields
      const now = new Date();
      const mockUpdatedEvent = { 
        id: 'event-test-id', 
        name: 'Updated Event', 
        workspaceId: 'workspace-test-id',
        description: 'Updated description',
        startDate: now,
        endDate: new Date(now.getTime() + 3600000),
        location: 'Updated Location',
        price: 150,
        currency: 'USD',
        isActive: true,
        maxAttendees: 100,
        currentAttendees: 0,
        createdAt: now,
        updatedAt: now
      };
      mockedEventsService.update.mockResolvedValue(mockUpdatedEvent);

      // Execute
      await eventsController.updateEvent(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockedEventsService.update).toHaveBeenCalledWith(
        'event-test-id', 
        'workspace-test-id',
        expect.any(Object)
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedEvent);
    });

    it('should return 404 when updating event that does not exist in workspace', async () => {
      // Setup service to return null (event not found)
      mockedEventsService.update.mockResolvedValue(null);

      // Execute
      await eventsController.updateEvent(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Event not found'
      }));
    });
  });

  describe('deleteEvent', () => {
    it('should delete event with correct workspace ID filtering', async () => {
      // Setup mock data with all required fields
      const now = new Date();
      const mockEvent = { 
        id: 'event-test-id', 
        name: 'Test Event', 
        workspaceId: 'workspace-test-id',
        description: 'Test description',
        startDate: now,
        endDate: new Date(now.getTime() + 3600000),
        location: 'Test Location',
        price: 100,
        currency: 'USD',
        isActive: true,
        maxAttendees: 100,
        currentAttendees: 0,
        createdAt: now,
        updatedAt: now
      };
      mockedEventsService.getById.mockResolvedValue(mockEvent);

      // Execute
      await eventsController.deleteEvent(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockedEventsService.getById).toHaveBeenCalledWith('event-test-id', 'workspace-test-id');
      expect(mockedEventsService.delete).toHaveBeenCalledWith('event-test-id', 'workspace-test-id');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
    });

    it('should return 404 when deleting event that does not exist in workspace', async () => {
      // Setup service to return null (event not found)
      mockedEventsService.getById.mockResolvedValue(null);

      // Execute
      await eventsController.deleteEvent(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Event not found'
      }));
    });
  });
}); 