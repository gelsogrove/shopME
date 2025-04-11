import { api } from './api'

export interface Category {
  id: string
  name: string
  description: string
  slug: string
  isActive: boolean
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryData {
  name: string
  description: string
  isActive?: boolean
}

export interface UpdateCategoryData {
  name?: string
  description?: string
  isActive?: boolean
}

/**
 * Get all categories for a workspace
 */
export const getAllForWorkspace = async (workspaceId: string): Promise<Category[]> => {
  try {
    const response = await api.get(`/api/workspaces/${workspaceId}/categories`)
    return response.data
  } catch (error) {
    console.error('Error getting categories:', error)
    throw error
  }
}

/**
 * Get a specific category by ID
 */
export const getById = async (id: string, workspaceId: string): Promise<Category> => {
  try {
    const response = await api.get(`/api/workspaces/${workspaceId}/categories/${id}`)
    return response.data
  } catch (error) {
    console.error('Error getting category:', error)
    throw error
  }
}

/**
 * Create a new category
 */
export const create = async (workspaceId: string, data: CreateCategoryData): Promise<Category> => {
  try {
    const response = await api.post(`/api/workspaces/${workspaceId}/categories`, data)
    return response.data
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

/**
 * Update an existing category
 */
export const update = async (id: string, workspaceId: string, data: UpdateCategoryData): Promise<Category> => {
  try {
    const response = await api.put(`/api/workspaces/${workspaceId}/categories/${id}`, data)
    return response.data
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

/**
 * Delete a category
 */
export const delete_ = async (id: string, workspaceId: string): Promise<void> => {
  try {
    await api.delete(`/api/workspaces/${workspaceId}/categories/${id}`)
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

export const categoriesApi = {
  getAllForWorkspace,
  getById,
  create,
  update,
  delete: delete_
} 