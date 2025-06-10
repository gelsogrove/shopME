import { api } from './api'

export interface Event {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  location: string
  price: number
  currency: string
  isActive: boolean
  maxAttendees?: number
  currentAttendees?: number
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface CreateEventData {
  name: string
  description: string
  startDate: string
  endDate: string
  location: string
  price: number
  currency?: string
  isActive?: boolean
  maxAttendees?: number
}

export interface UpdateEventData {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  location?: string
  price?: number
  currency?: string
  isActive?: boolean
  maxAttendees?: number
  currentAttendees?: number
}

/**
 * Get all events for a workspace
 */
export const getEvents = async (workspaceId: string): Promise<Event[]> => {
  try {
    console.log('[EVENTS API] Getting events for workspace:', workspaceId);
    const response = await api.get(`/workspaces/${workspaceId}/events`)
    console.log('[EVENTS API] Response received:', {
      status: response.status,
      eventsCount: response.data?.length || 0,
      events: response.data?.map((e: Event) => ({ id: e.id, name: e.name, workspaceId: e.workspaceId })) || []
    });
    return response.data || []
  } catch (error) {
    console.error('[EVENTS API] Error getting events for workspace', workspaceId, ':', error)
    // Don't return mock data - let the error propagate so we can see what's wrong
    throw error
  }
}

/**
 * Get a specific event by ID
 */
export const getEventById = async (workspaceId: string, id: string): Promise<Event> => {
  try {
    console.log('[EVENTS API] Getting event', id, 'for workspace:', workspaceId);
    const response = await api.get(`/workspaces/${workspaceId}/events/${id}`)
    console.log('[EVENTS API] Event response:', { id: response.data.id, name: response.data.name, workspaceId: response.data.workspaceId });
    return response.data
  } catch (error) {
    console.error('[EVENTS API] Error getting event:', error)
    throw error
  }
}

/**
 * Create a new event
 */
export const createEvent = async (workspaceId: string, data: CreateEventData): Promise<Event> => {
  try {
    console.log('[EVENTS API] Creating event for workspace:', workspaceId, 'with data:', data);
    const response = await api.post(`/workspaces/${workspaceId}/events`, data)
    console.log('[EVENTS API] Event created:', { id: response.data.id, name: response.data.name, workspaceId: response.data.workspaceId });
    return response.data
  } catch (error) {
    console.error('[EVENTS API] Error creating event:', error)
    throw error
  }
}

/**
 * Update an existing event
 */
export const updateEvent = async (
  workspaceId: string,
  id: string,
  data: UpdateEventData
): Promise<Event> => {
  try {
    console.log('[EVENTS API] Updating event', id, 'for workspace:', workspaceId);
    const response = await api.put(`/workspaces/${workspaceId}/events/${id}`, data)
    console.log('[EVENTS API] Event updated:', { id: response.data.id, name: response.data.name, workspaceId: response.data.workspaceId });
    return response.data
  } catch (error) {
    console.error('[EVENTS API] Error updating event:', error)
    throw error
  }
}

/**
 * Delete an event
 */
export const deleteEvent = async (workspaceId: string, id: string): Promise<void> => {
  try {
    console.log('[EVENTS API] Deleting event', id, 'for workspace:', workspaceId);
    await api.delete(`/workspaces/${workspaceId}/events/${id}`)
    console.log('[EVENTS API] Event deleted successfully');
  } catch (error) {
    console.error('[EVENTS API] Error deleting event:', error)
    throw error
  }
}

export const eventsApi = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} 