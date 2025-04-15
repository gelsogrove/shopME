import { api } from './api'

export interface ShippingAddress {
  street: string
  city: string
  zip: string
  country: string
}

export interface Client {
  id: string
  name: string
  email: string
  company: string
  discount: number
  phone: string
  language: string
  notes?: string
  shippingAddress: ShippingAddress
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface CreateClientData {
  name: string
  email: string
  company: string
  discount?: number
  phone: string
  language: string
  notes?: string
  shippingAddress?: ShippingAddress
}

export interface UpdateClientData extends Partial<CreateClientData> {}

/**
 * Get all clients for a workspace with optional filters and pagination
 */
export const getAllForWorkspace = async (
  workspaceId: string,
  options?: {
    search?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ 
  clients: Client[]; 
  total: number; 
  page: number; 
  totalPages: number 
}> => {
  try {
    console.log('Fetching clients for workspace:', workspaceId);
    if (!workspaceId) {
      console.error('WorkspaceId missing in getAllForWorkspace');
      return {
        clients: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    }
    
    // Construct query parameters
    const queryParams = new URLSearchParams();
    
    if (options?.search) {
      queryParams.append('search', options.search);
    }
    
    if (options?.page) {
      queryParams.append('page', options.page.toString());
    }
    
    if (options?.limit) {
      queryParams.append('limit', options.limit.toString());
    }
    
    const queryString = queryParams.toString();
    const requestUrl = `/api/workspaces/${workspaceId}/clients${queryString ? `?${queryString}` : ''}`;
    console.log('Clients API request URL:', requestUrl);
    
    const response = await api.get(requestUrl);
    console.log('Clients API response status:', response.status);
    console.log('Clients API response data:', response.data);
    
    if (!response.data) {
      console.error('Empty API response');
      return {
        clients: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching clients:', error);
    return {
      clients: [],
      total: 0,
      page: 1,
      totalPages: 0
    };
  }
};

/**
 * Get a client by ID
 */
export const getById = async (clientId: string, workspaceId: string): Promise<Client | null> => {
  try {
    const response = await api.get(`/api/workspaces/${workspaceId}/clients/${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client by ID:', error);
    return null;
  }
};

/**
 * Create a new client
 */
export const create = async (clientData: CreateClientData, workspaceId: string): Promise<Client | null> => {
  try {
    const response = await api.post(`/api/workspaces/${workspaceId}/clients`, clientData);
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

/**
 * Update an existing client
 */
export const update = async (clientId: string, clientData: UpdateClientData, workspaceId: string): Promise<Client | null> => {
  try {
    const response = await api.put(`/api/workspaces/${workspaceId}/clients/${clientId}`, clientData);
    return response.data;
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

/**
 * Delete a client
 */
export const delete_ = async (clientId: string, workspaceId: string): Promise<boolean> => {
  try {
    await api.delete(`/api/workspaces/${workspaceId}/clients/${clientId}`);
    return true;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

export const clientsApi = {
  getAllForWorkspace,
  getById,
  create,
  update,
  delete: delete_
} 