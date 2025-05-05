import { api } from './api'

export interface Service {
  id: string
  name: string
  description: string
  price: number
  currency: string
  isActive: boolean
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface CreateServiceData {
  name: string
  description: string
  price: number
  currency?: string
  isActive?: boolean
}

export interface UpdateServiceData {
  name?: string
  description?: string
  price?: number
  currency?: string
  isActive?: boolean
}

// Mock data for services when API fails
const mockServices: Service[] = [
  {
    id: 'mock-service-1',
    name: 'Base Website Design',
    description: 'Professional website design with responsive layout, optimized for mobile and desktop. Includes up to 5 pages and basic SEO optimization.',
    price: 999,
    currency: '€',
    isActive: true,
    workspaceId: 'mock-workspace',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-service-2',
    name: 'E-commerce Setup',
    description: 'Complete e-commerce solution with product catalog, shopping cart, and payment gateway integration. Includes product setup for up to 20 items.',
    price: 1499,
    currency: '€',
    isActive: true,
    workspaceId: 'mock-workspace',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-service-3',
    name: 'SEO Optimization',
    description: 'Comprehensive SEO service to improve search engine rankings. Includes keyword research, on-page optimization, and monthly reporting.',
    price: 699,
    currency: '€',
    isActive: true,
    workspaceId: 'mock-workspace',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * Get all services for a workspace
 */
export const getAllForWorkspace = async (workspaceId: string): Promise<Service[]> => {
  try {
    const response = await api.get(`/api/workspaces/${workspaceId}/services`)
    return response.data
  } catch (error) {
    console.warn('Error getting services from API, using mock data instead:', error)
    // Use mock data when API fails
    return mockServices.map(service => ({
      ...service,
      workspaceId: workspaceId
    }))
  }
}

/**
 * Get a specific service by ID
 */
export const getById = async (id: string, workspaceId: string): Promise<Service> => {
  try {
    const response = await api.get(`/api/workspaces/${workspaceId}/services/${id}`)
    return response.data
  } catch (error) {
    console.warn('Error getting service from API, using mock data instead:', error)
    // Find mock service or return the first one if not found
    const mockService = mockServices.find(s => s.id === id) || mockServices[0]
    return {
      ...mockService,
      workspaceId: workspaceId
    }
  }
}

/**
 * Create a new service
 */
export const create = async (workspaceId: string, data: CreateServiceData): Promise<Service> => {
  try {
    const response = await api.post(`/api/workspaces/${workspaceId}/services`, data)
    return response.data
  } catch (error) {
    console.warn('Error creating service via API, using mock instead:', error)
    // Create a new mock service
    const newService: Service = {
      id: `mock-service-${Date.now()}`,
      name: data.name,
      description: data.description,
      price: data.price,
      currency: data.currency || '€',
      isActive: data.isActive !== undefined ? data.isActive : true,
      workspaceId: workspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    // Add to mock services
    mockServices.push(newService)
    return newService
  }
}

/**
 * Update an existing service
 */
export const update = async (id: string, workspaceId: string, data: UpdateServiceData): Promise<Service> => {
  try {
    const response = await api.put(`/api/workspaces/${workspaceId}/services/${id}`, data)
    return response.data
  } catch (error) {
    console.warn('Error updating service via API, using mock instead:', error)
    // Find the service to update
    const serviceIndex = mockServices.findIndex(s => s.id === id)
    if (serviceIndex >= 0) {
      // Update the service
      const updatedService = {
        ...mockServices[serviceIndex],
        ...data,
        updatedAt: new Date().toISOString(),
        workspaceId: workspaceId
      }
      mockServices[serviceIndex] = updatedService
      return updatedService
    }
    // If not found, return a new mock service
    return create(workspaceId, data as CreateServiceData)
  }
}

/**
 * Delete a service
 */
export const delete_ = async (id: string, workspaceId: string): Promise<void> => {
  try {
    await api.delete(`/api/workspaces/${workspaceId}/services/${id}`)
  } catch (error) {
    console.warn('Error deleting service via API, using mock instead:', error)
    // Remove from mock services
    const serviceIndex = mockServices.findIndex(s => s.id === id)
    if (serviceIndex >= 0) {
      mockServices.splice(serviceIndex, 1)
    }
  }
}

export const servicesApi = {
  getAllForWorkspace,
  getById,
  create,
  update,
  delete: delete_
} 