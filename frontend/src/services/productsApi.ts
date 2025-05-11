import { api } from './api'

export interface Category {
  id: string
  name: string
  description?: string
  workspaceId: string
  slug: string
}

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
  category?: Category | null
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
 * Get all products for a workspace with optional filters and pagination
 */
export const getAllForWorkspace = async (
  workspaceId: string, 
  options?: {
    search?: string;
    categoryId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ 
  products: Product[]; 
  total: number; 
  page: number; 
  totalPages: number 
}> => {
  try {
    console.log('Chiamata getAllForWorkspace con workspaceId:', workspaceId);
    if (!workspaceId) {
      console.error('WorkspaceId mancante in getAllForWorkspace');
      return {
        products: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    }
    
    // Construct query parameters
    const queryParams = new URLSearchParams();
    
    // Rimuoviamo il workspaceId dalla query string, è già nell'URL
    queryParams.append('workspaceId', workspaceId);
    
    if (options?.search) {
      queryParams.append('search', options.search);
    }
    
    if (options?.categoryId) {
      queryParams.append('categoryId', options.categoryId);
    }
    
    if (options?.status) {
      queryParams.append('status', options.status);
    }
    
    if (options?.page) {
      queryParams.append('page', options.page.toString());
    }
    
    if (options?.limit) {
      queryParams.append('limit', options.limit.toString());
    }
    
    const queryString = queryParams.toString();
    const requestUrl = `/workspaces/${workspaceId}/products${queryString ? `?${queryString}` : ''}`;
    console.log('API request URL:', requestUrl);
    
    const response = await api.get(requestUrl);
    console.log('Products API response status:', response.status);
    console.log('Products API response data:', response.data);
    
    if (!response.data) {
      console.error('Risposta API vuota');
      return {
        products: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    }
    
    // La risposta ora è direttamente l'array dei prodotti
    if (Array.isArray(response.data)) {
      const products = response.data;
      return {
        products,
        total: products.length,
        page: options?.page || 1,
        totalPages: Math.ceil(products.length / (options?.limit || 10))
      };
    }
    
    // Per retrocompatibilità, supportiamo ancora il formato vecchio
    if (response.data.products) {
      return response.data;
    }
    
    // Se non è né un array né ha il nodo products, ritorniamo vuoto
    console.error('Formato risposta API non riconosciuto:', response.data);
    return {
      products: [],
      total: 0,
      page: 1,
      totalPages: 0
    };
  } catch (error) {
    console.error('Error getting products:', error);
    // In caso di errore, ritorna un oggetto vuoto standard
    return {
      products: [],
      total: 0, 
      page: 1,
      totalPages: 0
    };
  }
}

/**
 * Get a specific product by ID
 */
export const getById = async (id: string, workspaceId: string): Promise<Product> => {
  try {
    const response = await api.get(`/workspaces/${workspaceId}/products/${id}`)
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
    const response = await api.get(`/workspaces/${workspaceId}/categories/${categoryId}/products`)
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
    const response = await api.post(`/workspaces/${workspaceId}/products`, data)
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
    const response = await api.put(`/workspaces/${workspaceId}/products/${id}`, data)
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
    await api.delete(`/workspaces/${workspaceId}/products/${id}`)
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
    const response = await api.patch(`/workspaces/${workspaceId}/products/${id}/stock`, { stock })
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