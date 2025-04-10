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

/**
 * Get all services for a workspace
 */
export const getAllForWorkspace = async (workspaceId: string): Promise<Service[]> => {
  try {
    const response = await api.get(`/api/workspaces/${workspaceId}/services`)
    return response.data
  } catch (error) {
    console.error('Error getting services:', error)
    throw error
  }
}

/**
 * Get a specific service by ID
 */
export const getById = async (id: string): Promise<Service> => {
  try {
    const response = await api.get(`/api/services/${id}`)
    return response.data
  } catch (error) {
    console.error('Error getting service:', error)
    throw error
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
    console.error('Error creating service:', error)
    throw error
  }
}

/**
 * Update an existing service
 */
export const update = async (id: string, data: UpdateServiceData): Promise<Service> => {
  try {
    const response = await api.put(`/api/services/${id}`, data)
    return response.data
  } catch (error) {
    console.error('Error updating service:', error)
    throw error
  }
}

/**
 * Delete a service
 */
export const delete_ = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/services/${id}`)
  } catch (error) {
    console.error('Error deleting service:', error)
    throw error
  }
}

export const servicesApi = {
  getAllForWorkspace,
  getById,
  create,
  update,
  delete: delete_
} 