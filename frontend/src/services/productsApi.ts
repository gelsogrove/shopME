import { api } from './api'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  sku: string | null
  image: string | null
  isActive: boolean
  workspaceId: string
  categoryId: string | null
  slug: string
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  createdAt: string
  updatedAt: string
}

export interface CreateProductData {
  name: string
  description?: string
  price: number
  stock?: number
  sku?: string
  image?: string
  categoryId?: string
  isActive?: boolean
}

export interface UpdateProductData {
  name?: string
  description?: string
  price?: number
  stock?: number
  sku?: string
  image?: string
  categoryId?: string
  isActive?: boolean
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
}

/**
 * Get all products for a workspace
 */
export const getAllForWorkspace = async (workspaceId: string): Promise<Product[]> => {
  try {
    const response = await api.get(`/api/workspaces/${workspaceId}/products`)
    return response.data
  } catch (error) {
    console.error('Error getting products:', error)
    throw error
  }
}

/**
 * Get a specific product by ID
 */
export const getById = async (id: string, workspaceId: string): Promise<Product> => {
  try {
    const response = await api.get(`/api/workspaces/${workspaceId}/products/${id}`)
    return response.data
  } catch (error) {
    console.error('Error getting product:', error)
    throw error
  }
}

/**
 * Get products by category
 */
export const getByCategory = async (categoryId: string, workspaceId: string): Promise<Product[]> => {
  try {
    const response = await api.get(`/api/workspaces/${workspaceId}/categories/${categoryId}/products`)
    return response.data
  } catch (error) {
    console.error('Error getting products by category:', error)
    throw error
  }
}

/**
 * Create a new product
 */
export const create = async (workspaceId: string, data: CreateProductData): Promise<Product> => {
  try {
    const response = await api.post(`/api/workspaces/${workspaceId}/products`, data)
    return response.data
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

/**
 * Update an existing product
 */
export const update = async (id: string, workspaceId: string, data: UpdateProductData): Promise<Product> => {
  try {
    const response = await api.put(`/api/workspaces/${workspaceId}/products/${id}`, data)
    return response.data
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

/**
 * Delete a product
 */
export const delete_ = async (id: string, workspaceId: string): Promise<void> => {
  try {
    await api.delete(`/api/workspaces/${workspaceId}/products/${id}`)
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

/**
 * Update product stock
 */
export const updateStock = async (id: string, workspaceId: string, stock: number): Promise<Product> => {
  try {
    const response = await api.patch(`/api/workspaces/${workspaceId}/products/${id}/stock`, { stock })
    return response.data
  } catch (error) {
    console.error('Error updating product stock:', error)
    throw error
  }
}

export const productsApi = {
  getAllForWorkspace,
  getById,
  getByCategory,
  create,
  update,
  delete: delete_,
  updateStock
} 