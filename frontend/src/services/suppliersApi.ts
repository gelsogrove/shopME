import axios from "axios";
import { API_URL } from "../config";

// Define supplier interface
interface Supplier {
  id: string;
  name: string;
  description?: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  slug: string;
}

// Get all suppliers for a workspace
const getAllForWorkspace = async (workspaceId: string): Promise<Supplier[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/workspaces/${workspaceId}/suppliers`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw error;
  }
};

// Get active suppliers for a workspace
const getActiveForWorkspace = async (workspaceId: string): Promise<Supplier[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/workspaces/${workspaceId}/suppliers/active`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching active suppliers:", error);
    throw error;
  }
};

// Get a supplier by ID
const getById = async (workspaceId: string, id: string): Promise<Supplier> => {
  try {
    const response = await axios.get(`${API_URL}/api/workspaces/${workspaceId}/suppliers/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching supplier ${id}:`, error);
    throw error;
  }
};

// Create a new supplier
const create = async (workspaceId: string, data: Partial<Supplier>): Promise<Supplier> => {
  try {
    const response = await axios.post(`${API_URL}/api/workspaces/${workspaceId}/suppliers`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating supplier:", error);
    throw error;
  }
};

// Update a supplier
const update = async (workspaceId: string, id: string, data: Partial<Supplier>): Promise<Supplier> => {
  try {
    const response = await axios.put(`${API_URL}/api/workspaces/${workspaceId}/suppliers/${id}`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating supplier ${id}:`, error);
    throw error;
  }
};

// Delete a supplier
const deleteSupplier = async (workspaceId: string, id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/workspaces/${workspaceId}/suppliers/${id}`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error(`Error deleting supplier ${id}:`, error);
    throw error;
  }
};

export const suppliersApi = {
  getAllForWorkspace,
  getActiveForWorkspace,
  getById,
  create,
  update,
  delete: deleteSupplier,
}; 