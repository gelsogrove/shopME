/**
 * Events service for managing events
 */

import { prisma } from "../lib/prisma";
import logger from "../utils/logger";

// Import event types

// Define data types for service operations
type CreateEventData = {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  price: number;
  workspaceId: string;
  currency?: string;
  isActive?: boolean;
  maxAttendees?: number;
};

type UpdateEventData = Partial<CreateEventData> & {
  currentAttendees?: number;
};

export const eventsService = {
  /**
   * Get all events for a workspace
   */
  async getAllForWorkspace(workspaceId: string) {
    try {
      logger.info(`[EVENTS] Getting events for workspace: ${workspaceId}`);
      
      // @ts-ignore - Prisma types issue
      const events = await prisma.events.findMany({
        where: {
          workspaceId,
        },
        orderBy: {
          startDate: 'asc',
        },
      });
      
      logger.info(`[EVENTS] Found ${events.length} events for workspace ${workspaceId}`);
      events.forEach(event => {
        logger.info(`[EVENTS] Event: ${event.name} (ID: ${event.id}) - WorkspaceId: ${event.workspaceId}`);
      });
      
      return events;
    } catch (error) {
      logger.error(`[EVENTS] Error getting events for workspace ${workspaceId}:`, error);
      return [];
    }
  },

  /**
   * Get an event by id
   */
  async getById(id: string, workspaceId: string) {
    logger.info(`[EVENTS] Getting event ${id} for workspace ${workspaceId}`);
    
    // @ts-ignore - Prisma types issue
    const event = await prisma.events.findFirst({
      where: { 
        id,
        workspaceId 
      }
    });
    
    if (event) {
      logger.info(`[EVENTS] Found event: ${event.name} - WorkspaceId: ${event.workspaceId}`);
    } else {
      logger.warn(`[EVENTS] Event ${id} not found in workspace ${workspaceId}`);
    }
    
    return event;
  },

  /**
   * Create a new event
   */
  async create(data: CreateEventData) {
    if (!data.workspaceId) {
      throw new Error('workspaceId is required');
    }
    
    logger.info(`[EVENTS] Creating event "${data.name}" for workspace ${data.workspaceId}`);
    
    // @ts-ignore - Prisma types issue
    const event = await prisma.events.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        price: data.price,
        workspaceId: data.workspaceId,
        currency: data.currency || 'EUR',
        isActive: data.isActive !== undefined ? data.isActive : true,
        maxAttendees: data.maxAttendees,
        currentAttendees: 0,
      }
    });
    
    logger.info(`[EVENTS] Created event ${event.id} for workspace ${event.workspaceId}`);
    return event;
  },

  /**
   * Update an event
   */
  async update(id: string, workspaceId: string, data: UpdateEventData) {
    logger.info(`[EVENTS] Updating event ${id} for workspace ${workspaceId}`);
    
    // First check if event exists
    // @ts-ignore - Prisma types issue
    const existingEvent = await prisma.events.findFirst({
      where: { 
        id,
        workspaceId 
      }
    });

    if (!existingEvent) {
      logger.warn(`[EVENTS] Event ${id} not found in workspace ${workspaceId} for update`);
      return null;
    }

    const { 
      name, 
      description, 
      startDate, 
      endDate, 
      location, 
      price, 
      currency, 
      isActive,
      maxAttendees,
      currentAttendees
    } = data;
    
    // @ts-ignore - Prisma types issue
    const updatedEvent = await prisma.events.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(location && { location }),
        ...(price !== undefined && { price }),
        ...(currency && { currency }),
        ...(isActive !== undefined && { isActive }),
        ...(maxAttendees !== undefined && { maxAttendees }),
        ...(currentAttendees !== undefined && { currentAttendees })
      }
    });
    
    logger.info(`[EVENTS] Updated event ${id} for workspace ${workspaceId}`);
    return updatedEvent;
  },

  /**
   * Delete an event
   */
  async delete(id: string, workspaceId: string) {
    logger.info(`[EVENTS] Deleting event ${id} for workspace ${workspaceId}`);
    
    // First check if event exists
    // @ts-ignore - Prisma types issue
    const existingEvent = await prisma.events.findFirst({
      where: { 
        id,
        workspaceId 
      }
    });

    if (!existingEvent) {
      logger.warn(`[EVENTS] Event ${id} not found in workspace ${workspaceId} for deletion`);
      return null;
    }

    // @ts-ignore - Prisma types issue
    const result = await prisma.events.deleteMany({
      where: { 
        id,
        workspaceId 
      }
    });
    
    logger.info(`[EVENTS] Deleted event ${id} from workspace ${workspaceId}`);
    return result;
  }
}; 