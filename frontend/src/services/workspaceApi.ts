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

export const getCurrentWorkspace = async (): Promise<Workspace | null> => {
  try {
    // Try to get the workspace directly from sessionStorage
    const workspaceString = sessionStorage.getItem('currentWorkspace');
    console.log('Retrieved workspace from sessionStorage:', workspaceString);
    
    if (!workspaceString) {
      console.log('No workspace found in sessionStorage');
      return null;
    }
    
    const workspace = JSON.parse(workspaceString) as Workspace;
    
    if (!workspace.id) {
      console.log('Workspace found in sessionStorage but has no ID');
      return null;
    }
    
    console.log('Workspace found in sessionStorage with ID:', workspace.id);
    
    // Optionally fetch fresh data from API
    try {
      const response = await api.get(`/api/workspaces/${workspace.id}`);
      console.log('Fresh workspace data retrieved from API:', response.data);
      return response.data;
    } catch (apiError) {
      console.error('Error fetching fresh workspace data, using stored data:', apiError);
      return workspace;
    }
  } catch (error) {
    console.error('Error in getCurrentWorkspace:', error);
    return null;
  }
};

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
  if (!id) {
    console.error('Delete workspace failed: No workspace ID provided');
    throw new Error('No workspace ID provided');
  }

  console.log('Deleting workspace with ID:', id);
  try {
    const response = await api.delete(`/api/workspaces/${id}`);
    console.log('Delete workspace response:', response.status);
    return;
  } catch (error) {
    console.error('Delete workspace failed:', error);
    throw error;
  }
}
