import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

interface CreateEventData {
  name: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  price: number
  workspaceId: string
  currency?: string
  isActive?: boolean
  maxAttendees?: number
}

interface UpdateEventData {
  name?: string
  description?: string
  startDate?: Date
  endDate?: Date
  location?: string
  price?: number
  currency?: string
  isActive?: boolean
  maxAttendees?: number
  currentAttendees?: number
}

export const eventsService = {
  async getAllForWorkspace(workspaceId: string) {
    try {
      console.log("Getting events for workspace:", workspaceId);
      // @ts-ignore - Prisma types issue
      return await prisma.events.findMany({
        where: {
          workspaceId
        },
        orderBy: {
          startDate: 'asc'
        }
      });
    } catch (error) {
      console.error("Error getting events for workspace:", error);
      return [];
    }
  },

  async getById(id: string, workspaceId: string) {
    // @ts-ignore - Prisma types issue
    return prisma.events.findFirst({
      where: { 
        id,
        workspaceId 
      }
    });
  },

  async create(data: CreateEventData) {
    const { 
      name, 
      description, 
      startDate, 
      endDate, 
      location, 
      price, 
      workspaceId, 
      currency = "EUR", 
      isActive = true,
      maxAttendees 
    } = data
    
    if (!workspaceId) {
      throw new Error("workspaceId is required");
    }
    
    console.log("Creating event with workspaceId:", workspaceId);
    
    // @ts-ignore - Prisma types issue
    return prisma.events.create({
      data: {
        name,
        description,
        startDate,
        endDate,
        location,
        price,
        currency,
        isActive,
        workspaceId,
        maxAttendees
      }
    });
  },

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
      throw new Error("Event not found");
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
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(location !== undefined && { location }),
        ...(price !== undefined && { price }),
        ...(currency !== undefined && { currency }),
        ...(isActive !== undefined && { isActive }),
        ...(maxAttendees !== undefined && { maxAttendees }),
        ...(currentAttendees !== undefined && { currentAttendees }),
      }
    });
  },

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
      throw new Error("Event not found");
    }

    // @ts-ignore - Prisma types issue
    return prisma.events.deleteMany({
      where: { 
        id,
        workspaceId
      }
    });
  },
} 