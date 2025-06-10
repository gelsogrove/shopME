// @ts-nocheck
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock Prisma - define before jest.mock
const mockEvents = {
  findMany: jest.fn(),
  findFirst: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deleteMany: jest.fn(),
};

const mockPrisma = {
  events: mockEvents
};

jest.mock('../../lib/prisma', () => ({
  prisma: mockPrisma
}));

// Import after mock
import { eventsService } from '../../services/events.service';

describe('Events Workspace Isolation Tests', () => {
  const WORKSPACE_A = 'workspace-a-123';
  const WORKSPACE_B = 'workspace-b-456';
  
  const mockEventA = {
    id: 'event-a-1',
    name: 'Event A1',
    description: 'Event in workspace A',
    workspaceId: WORKSPACE_A,
    startDate: new Date(),
    endDate: new Date(),
    location: 'Location A',
    price: 50,
    currency: 'EUR',
    isActive: true
  };
  
  const mockEventB = {
    id: 'event-b-1',
    name: 'Event B1',
    description: 'Event in workspace B',
    workspaceId: WORKSPACE_B,
    startDate: new Date(),
    endDate: new Date(),
    location: 'Location B',
    price: 75,
    currency: 'EUR',
    isActive: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllForWorkspace', () => {
    it('should only return events for the specified workspace', async () => {
      // Mock database to return only events for workspace A
      mockEvents.findMany.mockResolvedValue([mockEventA]);

      const result = await eventsService.getAllForWorkspace(WORKSPACE_A);

      // Verify the correct workspace filter was applied
      expect(mockEvents.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId: WORKSPACE_A,
        },
        orderBy: {
          startDate: 'asc',
        },
      });

      // Verify only workspace A events are returned
      expect(result).toHaveLength(1);
      expect(result[0].workspaceId).toBe(WORKSPACE_A);
      expect(result[0].id).toBe('event-a-1');
    });

    it('should return empty array for workspace with no events', async () => {
      mockEvents.findMany.mockResolvedValue([]);

      const result = await eventsService.getAllForWorkspace('empty-workspace');

      expect(mockEvents.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId: 'empty-workspace',
        },
        orderBy: {
          startDate: 'asc',
        },
      });

      expect(result).toHaveLength(0);
    });

    it('should not return events from other workspaces', async () => {
      // Mock database to return events for workspace B only
      mockEvents.findMany.mockResolvedValue([mockEventB]);

      const result = await eventsService.getAllForWorkspace(WORKSPACE_B);

      // Verify workspace B filter was applied
      expect(mockEvents.findMany).toHaveBeenCalledWith({
        where: {
          workspaceId: WORKSPACE_B,
        },
        orderBy: {
          startDate: 'asc',
        },
      });

      // Verify no workspace A events are returned
      expect(result).toHaveLength(1);
      expect(result[0].workspaceId).toBe(WORKSPACE_B);
      expect(result[0].workspaceId).not.toBe(WORKSPACE_A);
    });
  });

  describe('getById', () => {
    it('should only return event if it belongs to the specified workspace', async () => {
      mockEvents.findFirst.mockResolvedValue(mockEventA);

      const result = await eventsService.getById('event-a-1', WORKSPACE_A);

      // Verify both event ID and workspace ID filters are applied
      expect(mockEvents.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'event-a-1',
          workspaceId: WORKSPACE_A
        }
      });

      expect(result.workspaceId).toBe(WORKSPACE_A);
    });

    it('should return null if event exists but belongs to different workspace', async () => {
      mockEvents.findFirst.mockResolvedValue(null);

      const result = await eventsService.getById('event-a-1', WORKSPACE_B);

      // Verify the query includes both ID and workspace filters
      expect(mockEvents.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'event-a-1',
          workspaceId: WORKSPACE_B // Different workspace
        }
      });

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create event with the specified workspaceId', async () => {
      const newEventData = {
        name: 'New Event',
        description: 'Test event',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test Location',
        price: 100,
        workspaceId: WORKSPACE_A
      };

      mockEvents.create.mockResolvedValue({ ...newEventData, id: 'new-event-id' });

      const result = await eventsService.create(newEventData);

      // Verify workspaceId is included in the create data
      expect(mockEvents.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workspaceId: WORKSPACE_A,
          name: 'New Event',
          description: 'Test event',
          location: 'Test Location',
          price: 100
        })
      });

      expect(result.workspaceId).toBe(WORKSPACE_A);
    });

    it('should throw error if workspaceId is missing', async () => {
      const invalidEventData = {
        name: 'Invalid Event',
        description: 'Missing workspace',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test Location',
        price: 100
        // Missing workspaceId
      };

      await expect(eventsService.create(invalidEventData)).rejects.toThrow('workspaceId is required');
    });
  });

  describe('update', () => {
    it('should only update event if it belongs to the specified workspace', async () => {
      mockEvents.findFirst.mockResolvedValue(mockEventA);
      mockEvents.update.mockResolvedValue({ ...mockEventA, name: 'Updated Event' });

      const updateData = { name: 'Updated Event' };
      const result = await eventsService.update('event-a-1', WORKSPACE_A, updateData);

      // Verify workspace check is performed
      expect(mockEvents.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'event-a-1',
          workspaceId: WORKSPACE_A
        }
      });

      // Verify update is called
      expect(mockEvents.update).toHaveBeenCalled();
      expect(result.name).toBe('Updated Event');
    });

    it('should return null if event belongs to different workspace', async () => {
      mockEvents.findFirst.mockResolvedValue(null);

      const updateData = { name: 'Updated Event' };
      const result = await eventsService.update('event-a-1', WORKSPACE_B, updateData);

      // Verify workspace check is performed
      expect(mockEvents.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'event-a-1',
          workspaceId: WORKSPACE_B
        }
      });

      // Verify update is NOT called
      expect(mockEvents.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should only delete event if it belongs to the specified workspace', async () => {
      mockEvents.findFirst.mockResolvedValue(mockEventA);
      mockEvents.deleteMany.mockResolvedValue({ count: 1 });

      const result = await eventsService.delete('event-a-1', WORKSPACE_A);

      // Verify workspace check is performed
      expect(mockEvents.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'event-a-1',
          workspaceId: WORKSPACE_A
        }
      });

      // Verify delete includes both ID and workspace filters
      expect(mockEvents.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 'event-a-1',
          workspaceId: WORKSPACE_A
        }
      });
    });

    it('should return null if event belongs to different workspace', async () => {
      mockEvents.findFirst.mockResolvedValue(null);

      const result = await eventsService.delete('event-a-1', WORKSPACE_B);

      // Verify workspace check is performed
      expect(mockEvents.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'event-a-1',
          workspaceId: WORKSPACE_B
        }
      });

      // Verify delete is NOT called
      expect(mockEvents.deleteMany).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('Cross-workspace isolation', () => {
    it('should ensure events from different workspaces are completely isolated', async () => {
      // Test that workspace A cannot access workspace B events
      mockEvents.findMany
        .mockResolvedValueOnce([mockEventA]) // Call for workspace A
        .mockResolvedValueOnce([mockEventB]); // Call for workspace B

      const eventsA = await eventsService.getAllForWorkspace(WORKSPACE_A);
      const eventsB = await eventsService.getAllForWorkspace(WORKSPACE_B);

      // Verify each workspace only gets its own events
      expect(eventsA).toHaveLength(1);
      expect(eventsA[0].workspaceId).toBe(WORKSPACE_A);
      
      expect(eventsB).toHaveLength(1);
      expect(eventsB[0].workspaceId).toBe(WORKSPACE_B);

      // Verify no cross-contamination
      expect(eventsA[0].workspaceId).not.toBe(WORKSPACE_B);
      expect(eventsB[0].workspaceId).not.toBe(WORKSPACE_A);
    });
  });
}); 