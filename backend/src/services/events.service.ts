/**
 * Events service for managing events
 */

import { prisma } from "../lib/prisma";

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
      // @ts-ignore - Prisma types issue
      return await prisma.events.findMany({
        where: {
          workspaceId,
        },
        orderBy: {
          startDate: 'asc',
        },
      });
    } catch (error) {
      return [];
    }
  },

  /**
   * Get an event by id
   */
  async getById(id: string, workspaceId: string) {
    // @ts-ignore - Prisma types issue
    return prisma.events.findFirst({
      where: { 
        id,
        workspaceId 
      }
    });
  },

  /**
   * Create a new event
   */
  async create(data: CreateEventData) {
    if (!data.workspaceId) {
      throw new Error('workspaceId is required');
    }
    
    // @ts-ignore - Prisma types issue
    return prisma.events.create({
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
  },

  /**
   * Update an event
   */
  async update(id: string, workspaceId: string, data: UpdateEventData) {
    // First check if event exists
    // @ts-ignore - Prisma types issue
    const existingEvent = await prisma.events.findFirst({
      where: { 
        id,
        workspaceId 
      }
    });

    if (!existingEvent) {
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
    return prisma.events.update({
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
  },

  /**
   * Delete an event
   */
  async delete(id: string, workspaceId: string) {
    // First check if event exists
    // @ts-ignore - Prisma types issue
    const existingEvent = await prisma.events.findFirst({
      where: { 
        id,
        workspaceId 
      }
    });

    if (!existingEvent) {
      return null;
    }

    // @ts-ignore - Prisma types issue
    return prisma.events.deleteMany({
      where: { 
        id,
        workspaceId 
      }
    });
  }
}; 