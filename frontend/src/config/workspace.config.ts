/**
 * Workspace configuration
 * This allows for easier management of workspace IDs across the application
 */
import { api } from "../services/api";

// Cache to store workspace data
let cachedWorkspaces: Record<string, any> = {};
let cachedDefaultWorkspace: any = null;

/**
 * Get workspace ID with fallback to API 
 * @param workspaceId Optional workspace ID to use
 * @returns A valid workspace ID (or empty string if not available)
 */
export const getWorkspaceId = (workspaceId?: string): string => {
  // If a valid workspaceId is provided, use it
  if (workspaceId && workspaceId.length > 0) {
    return workspaceId;
  }
  
  // Check if we have a cached default workspace
  if (cachedDefaultWorkspace?.id) {
    return cachedDefaultWorkspace.id;
  }
  
  // Check if environment variables are set (for production)
  if (import.meta.env.VITE_DEFAULT_WORKSPACE_ID) {
    return import.meta.env.VITE_DEFAULT_WORKSPACE_ID;
  }
  
  // Don't return a hardcoded fallback, let the API handle it
  return "";
};

/**
 * Fetch a workspace by ID
 * @param workspaceId The workspace ID to fetch
 * @returns The workspace data or null
 */
export const fetchWorkspace = async (workspaceId: string): Promise<any | null> => {
  try {
    // Check if we have it cached
    if (cachedWorkspaces[workspaceId]) {
      return cachedWorkspaces[workspaceId];
    }
    
    // Fetch from API
    const response = await api.get(`/api/workspaces/${workspaceId}`);
    
    if (response.data?.success && response.data?.data) {
      // Cache the result
      cachedWorkspaces[workspaceId] = response.data.data;
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching workspace ${workspaceId}:`, error);
    return null;
  }
};

/**
 * Fetch the default active workspace
 * @returns The default active workspace data or null
 */
export const fetchDefaultWorkspace = async (): Promise<any | null> => {
  try {
    // Check if we have it cached
    if (cachedDefaultWorkspace) {
      return cachedDefaultWorkspace;
    }
    
    // Fetch from API
    const response = await api.get('/api/workspaces/active');
    
    if (response.data?.success && response.data?.data?.length > 0) {
      // Cache the first active workspace
      cachedDefaultWorkspace = response.data.data[0];
      return cachedDefaultWorkspace;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching default workspace:', error);
    return null;
  }
}; 