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
  console.log(`API Call - getAllForWorkspace: GET /api/workspaces/${workspaceId}/categories`);
  try {
    const response = await api.get(`/api/workspaces/${workspaceId}/categories`);
    console.log("API Response (getAllForWorkspace):", response.status, response.data);
    return response.data;
  } catch (error: any) {
    console.error("API Error (getAllForWorkspace):", error);
    if (error.response) {
      console.error(`Error status: ${error.response.status}`);
      console.error("Error data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
}

/**
 * Get a specific category by ID
 */
export const getById = async (id: string, workspaceId: string): Promise<Category> => {
  console.log(`API Call - getById: GET /api/workspaces/${workspaceId}/categories/${id}`);
  try {
    const response = await api.get(`/api/workspaces/${workspaceId}/categories/${id}`);
    console.log("API Response (getById):", response.status, response.data);
    return response.data;
  } catch (error: any) {
    console.error("API Error (getById):", error);
    if (error.response) {
      console.error(`Error status: ${error.response.status}`);
      console.error("Error data:", error.response.data);
    }
    throw error;
  }
}

/**
 * Create a new category
 */
export const create = async (workspaceId: string, data: CreateCategoryData): Promise<Category> => {
  console.log(`API Call - create: POST /api/workspaces/${workspaceId}/categories`, data);
  try {
    const response = await api.post(`/api/workspaces/${workspaceId}/categories`, data);
    console.log("API Response (create):", response.status, response.data);
    return response.data;
  } catch (error: any) {
    console.error("API Error (create):", error);
    if (error.response) {
      console.error(`Error status: ${error.response.status}`);
      console.error("Error data:", error.response.data);
    }
    throw error;
  }
}

/**
 * Update an existing category
 */
export const update = async (id: string, workspaceId: string, data: UpdateCategoryData): Promise<Category> => {
  console.log(`API Call - update: PUT /api/workspaces/${workspaceId}/categories/${id}`, data);
  try {
    const response = await api.put(`/api/workspaces/${workspaceId}/categories/${id}`, data);
    console.log("API Response (update):", response.status, response.data);
    return response.data;
  } catch (error: any) {
    console.error("API Error (update):", error);
    if (error.response) {
      console.error(`Error status: ${error.response.status}`);
      console.error("Error data:", error.response.data);
    }
    throw error;
  }
}

/**
 * Delete a category
 */
export const delete_ = async (id: string, workspaceId: string): Promise<void> => {
  console.log(`API Call - delete: DELETE /api/workspaces/${workspaceId}/categories/${id}`);
  try {
    const response = await api.delete(`/api/workspaces/${workspaceId}/categories/${id}`);
    console.log("API Response (delete):", response.status, response.data);
  } catch (error: any) {
    console.error("API Error (delete):", error);
    if (error.response) {
      console.error(`Error status: ${error.response.status}`);
      console.error("Error data:", error.response.data);
    }
    throw error;
  }
}

export const categoriesApi = {
  getAllForWorkspace,
  getById,
  create,
  update,
  delete: delete_
} 