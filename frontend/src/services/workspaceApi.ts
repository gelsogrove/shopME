import { api } from "./api"

export interface Language {
  id: string
  code: string
  name: string
}

export interface Workspace {
  id: string
  name: string
  description?: string
  whatsappPhoneNumber?: string
  whatsappApiKey?: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  isDelete: boolean
  currency?: string
  language?: string
  messageLimit?: number
  challengeStatus?: boolean
  wipMessage?: string
  blocklist?: string
}

export interface CreateWorkspaceData {
  name: string
  whatsappPhoneNumber?: string
  language?: string
  isActive?: boolean
  isDelete?: boolean
}

export interface UpdateWorkspaceData {
  id: string
  name?: string
  whatsappPhoneNumber?: string
  language?: string
  isActive?: boolean
  isDelete?: boolean
}

export const transformWorkspaceResponse = (workspace: any): Workspace => {
  return {
    ...workspace,
    currency: workspace.currency || 'EUR',
    language: workspace.language || 'en',
    messageLimit: workspace.messageLimit || 50,
    challengeStatus: workspace.challengeStatus || false,
    blocklist: workspace.blocklist || '',
  };
}

const transformWorkspaceRequest = (workspace: CreateWorkspaceData | UpdateWorkspaceData) => {
  const { isDelete, ...rest } = workspace
  return {
    ...rest,
    isDelete
  }
}

export const getCurrentWorkspace = async (): Promise<Workspace> => {
  console.log('Checking storages for currentWorkspace...');
  
  try {
    // 1. First try from sessionStorage (preferred)
    const workspaceStr = sessionStorage.getItem("currentWorkspace");
    console.log('Workspace from sessionStorage:', workspaceStr);
    
    if (workspaceStr) {
      try {
        const workspace = JSON.parse(workspaceStr);
        if (workspace && workspace.id) {
          console.log('Found valid workspace in sessionStorage with ID:', workspace.id);
          const response = await api.get(`/api/workspaces/${workspace.id}`);
          return transformWorkspaceResponse(response.data);
        }
      } catch (error) {
        console.error('Error parsing workspace from sessionStorage:', error);
      }
    }
    
    // 2. Try to extract workspace ID from user object in localStorage
    console.log('Trying to get workspace from localStorage user object...');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.workspaces && user.workspaces.length > 0) {
          const workspaceId = user.workspaces[0].id;
          console.log('Found workspace ID in localStorage user object:', workspaceId);
          
          const response = await api.get(`/api/workspaces/${workspaceId}`);
          const workspaceData = transformWorkspaceResponse(response.data);
          
          // Cache for future use
          sessionStorage.setItem("currentWorkspace", JSON.stringify(workspaceData));
          
          return workspaceData;
        }
      } catch (error) {
        console.error('Error extracting workspace from localStorage user:', error);
      }
    }
    
    // 3. If still nothing, get all workspaces
    console.log('Getting all workspaces as fallback...');
    const response = await api.get("/api/workspaces");
    const workspaces = response.data;
    
    if (!workspaces || workspaces.length === 0) {
      throw new Error("No workspaces available");
    }
    
    // Get the active workspace or the first one
    const workspaceData = workspaces.find((w: any) => w.isActive) || workspaces[0];
    const transformedWorkspace = transformWorkspaceResponse(workspaceData);
    
    // Cache for future use
    sessionStorage.setItem("currentWorkspace", JSON.stringify(transformedWorkspace));
    
    return transformedWorkspace;
  } catch (error) {
    console.error("Error getting current workspace:", error);
    throw error;
  }
}

export const getWorkspaces = async (): Promise<Workspace[]> => {
  try {
    // Get user from localStorage to check authentication
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      throw new Error('User not authenticated')
    }

    const response = await api.get("/api/workspaces")
    console.log('API Response - getWorkspaces:', response.data)
    return response.data.map(transformWorkspaceResponse)
  } catch (error) {
    console.error('Error getting workspaces:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to get workspaces. Please try again.')
  }
}

export const getLanguages = async (): Promise<Language[]> => {
  const workspaceStr = sessionStorage.getItem("currentWorkspace")
  if (!workspaceStr) {
    throw new Error("No workspace selected")
  }
  try {
    const workspace = JSON.parse(workspaceStr)
    const response = await api.get("/api/languages", {
      headers: {
        "x-workspace-id": workspace.id
      }
    })
    console.log('API Response - getLanguages:', response.data)
    return response.data
  } catch (error) {
    console.error('Error getting languages:', error)
    throw new Error('Failed to get languages. Please try again.')
  }
}

export const createWorkspace = async (data: CreateWorkspaceData): Promise<Workspace> => {
  try {
    const response = await api.post("/api/workspaces", transformWorkspaceRequest(data))
    console.log('API Response - createWorkspace:', response.data)
    return transformWorkspaceResponse(response.data)
  } catch (error) {
    console.error('Error creating workspace:', error)
    throw new Error('Failed to create workspace. Please try again.')
  }
}

export const updateWorkspace = async (id: string, data: UpdateWorkspaceData): Promise<Workspace> => {
  try {
    const response = await api.put(`/api/workspaces/${id}`, transformWorkspaceRequest(data))
    console.log('API Response - updateWorkspace:', response.data)
    return transformWorkspaceResponse(response.data)
  } catch (error) {
    console.error('Error updating workspace:', error)
    throw new Error('Failed to update workspace. Please try again.')
  }
}

export const deleteWorkspace = async (id: string): Promise<void> => {
  console.log('Attempting to delete workspace with ID:', id);
  try {
    console.log('Making DELETE request to /api/workspaces/${id}...');
    const response = await api.delete(`/api/workspaces/${id}`)
    console.log('Delete workspace response status:', response.status);
    console.log('Delete workspace response data:', response.data);
    return response.data
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting workspace:", error)
      console.error("Error details:", {
        message: error.message,
        response: (error as any).response?.data,
        status: (error as any).response?.status
      });
    }
    throw error
  }
}
