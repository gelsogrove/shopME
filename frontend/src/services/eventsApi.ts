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

// Mock data for events when API fails
const mockEvents: Event[] = [
  {
    id: 'mock-event-1',
    name: 'Wine Tasting Workshop',
    description: 'Join us for a delightful evening of wine tasting featuring premium Italian wines from various regions. Learn about wine production, tasting techniques, and food pairings.',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 hours after start
    location: 'L\'Altra Italia Main Store, Via Roma 42, Milan',
    price: 49.99,
    currency: '€',
    isActive: true,
    maxAttendees: 20,
    currentAttendees: 12,
    workspaceId: 'mock-workspace',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-event-2',
    name: 'Pasta Making Class',
    description: 'Learn the art of making authentic Italian pasta from scratch with our expert chef. You\'ll create different pasta shapes and prepare delicious sauces to complement your creations.',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 hours after start
    location: 'L\'Altra Italia Cooking School, Via Dante 15, Milan',
    price: 75,
    currency: '€',
    isActive: true,
    maxAttendees: 15,
    currentAttendees: 8,
    workspaceId: 'mock-workspace',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-event-3',
    name: 'Italian Cheese and Cured Meats Tasting',
    description: 'Discover the rich flavors of Italian cheeses and cured meats in this guided tasting session. Learn about traditional production methods and regional specialties.',
    startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours after start
    location: 'L\'Altra Italia Deli, Via Mercato 8, Milan',
    price: 39.99,
    currency: '€',
    isActive: true,
    maxAttendees: 25,
    currentAttendees: 15,
    workspaceId: 'mock-workspace',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * Get all events for a workspace
 */
export const getEvents = async (workspaceId: string): Promise<Event[]> => {
  try {
    const response = await api.get(`/workspaces/${workspaceId}/events`)
    return response.data
  } catch (error) {
    console.error('Error getting events:', error)
    return mockEvents // Return mock data if the API call fails
  }
}

/**
 * Get a specific event by ID
 */
export const getEventById = async (workspaceId: string, id: string): Promise<Event> => {
  try {
    const response = await api.get(`/workspaces/${workspaceId}/events/${id}`)
    return response.data
  } catch (error) {
    console.error('Error getting event:', error)
    const mockEvent = mockEvents.find(event => event.id === id)
    if (mockEvent) return mockEvent
    throw error
  }
}

/**
 * Create a new event
 */
export const createEvent = async (workspaceId: string, data: CreateEventData): Promise<Event> => {
  try {
    const response = await api.post(`/workspaces/${workspaceId}/events`, data)
    return response.data
  } catch (error) {
    console.error('Error creating event:', error)
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
    const response = await api.put(`/workspaces/${workspaceId}/events/${id}`, data)
    return response.data
  } catch (error) {
    console.error('Error updating event:', error)
    throw error
  }
}

/**
 * Delete an event
 */
export const deleteEvent = async (workspaceId: string, id: string): Promise<void> => {
  try {
    await api.delete(`/workspaces/${workspaceId}/events/${id}`)
  } catch (error) {
    console.error('Error deleting event:', error)
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