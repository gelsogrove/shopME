import { api } from "./api"

export interface Language {
  id: string
  code: string
  name: string
}

export interface Workspace {
  id: string
  name: string
  whatsappPhoneNumber?: string
  isActive?: boolean
  isDelete?: boolean
  currency?: string
  language?: string
  messageLimit?: number
  challengeStatus?: boolean
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
  const workspaceId = sessionStorage.getItem("currentWorkspaceId")
  if (!workspaceId) {
    throw new Error("No workspace selected")
  }
  try {
    const response = await api.get(`/workspaces/${workspaceId}`)
    console.log('API Response - getCurrentWorkspace:', response.data)
    return transformWorkspaceResponse(response.data)
  } catch (error) {
    console.error('Error getting workspace:', error)
    throw new Error('Failed to get current workspace. Please try again.')
  }
}

export const getWorkspaces = async (): Promise<Workspace[]> => {
  try {
    // Get user from localStorage to check authentication
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      throw new Error('User not authenticated')
    }

    const response = await api.get("/workspaces")
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
  const workspaceId = sessionStorage.getItem("currentWorkspaceId")
  if (!workspaceId) {
    throw new Error("No workspace selected")
  }
  try {
    const response = await api.get("/languages", {
      headers: {
        "x-workspace-id": workspaceId
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
    const response = await api.post("/workspaces", transformWorkspaceRequest(data))
    console.log('API Response - createWorkspace:', response.data)
    return transformWorkspaceResponse(response.data)
  } catch (error) {
    console.error('Error creating workspace:', error)
    throw new Error('Failed to create workspace. Please try again.')
  }
}

export const updateWorkspace = async (id: string, data: UpdateWorkspaceData): Promise<Workspace> => {
  try {
    const response = await api.put(`/workspaces/${id}`, transformWorkspaceRequest(data))
    console.log('API Response - updateWorkspace:', response.data)
    return transformWorkspaceResponse(response.data)
  } catch (error) {
    console.error('Error updating workspace:', error)
    throw new Error('Failed to update workspace. Please try again.')
  }
}

export const deleteWorkspace = async (id: string): Promise<void> => {
  try {
    await api.delete(`/workspaces/${id}`)
    console.log('Workspace deleted successfully:', id)
  } catch (error) {
    console.error('Error deleting workspace:', error)
    throw new Error('Failed to delete workspace. Please try again.')
  }
}
