import { api } from "./api"

export interface Language {
  id: string
  code: string
  name: string
}

export interface Workspace {
  id: string
  name: string
  whatsappPhoneNumber: string
  whatsappApiKey: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  isDelete: boolean
  language: string
  currency: string
  challengeStatus: boolean
  wipMessage: string
}

export interface CreateWorkspaceData {
  name: string
  description?: string
  isDelete?: boolean
  isActive?: boolean
  language: string
  currency?: string
  whatsappPhoneNumber?: string
}

export interface UpdateWorkspaceData extends Partial<CreateWorkspaceData> {
  id: string
  challengeStatus?: boolean
  wipMessage?: string
}

const transformWorkspaceResponse = (data: any): Workspace => {
  return {
    ...data,
    language: data.language || 'en',
    currency: data.currency || 'EUR',
    challengeStatus: data.challengeStatus || false,
    wipMessage: data.wipMessage || "Lavori in corso si prega di contattarci piu tardi"
  }
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
    const response = await api.get(`/api/workspaces/${workspaceId}`)
    console.log('API Response - getCurrentWorkspace:', response.data)
    return transformWorkspaceResponse(response.data)
  } catch (error) {
    console.error('Error getting workspace:', error)
    throw error
  }
}

export const getWorkspaces = async (): Promise<Workspace[]> => {
  try {
    const response = await api.get("/api/workspaces")
    console.log('API Response - getWorkspaces:', response.data)
    return response.data.map(transformWorkspaceResponse)
  } catch (error) {
    console.error('Error getting workspaces:', error)
    throw error
  }
}

export const getLanguages = async (): Promise<Language[]> => {
  const workspaceId = sessionStorage.getItem("currentWorkspaceId")
  if (!workspaceId) {
    throw new Error("No workspace selected")
  }
  try {
    const response = await api.get("/api/languages", {
      headers: {
        "x-workspace-id": workspaceId
      }
    })
    console.log('API Response - getLanguages:', response.data)
    return response.data
  } catch (error) {
    console.error('Error getting languages:', error)
    throw error
  }
}

export const createWorkspace = async (
  data: CreateWorkspaceData
): Promise<Workspace> => {
  const response = await api.post("/api/workspaces", data)
  return response.data
}

export const updateWorkspace = async (
  id: string,
  data: UpdateWorkspaceData
): Promise<Workspace> => {
  try {
    console.log('API Request - updateWorkspace:', { id, data })
    const transformedData = transformWorkspaceRequest(data)
    const response = await api.put(`/api/workspaces/${id}`, transformedData)
    console.log('API Response - updateWorkspace:', response.data)
    return transformWorkspaceResponse(response.data)
  } catch (error) {
    console.error('Error updating workspace:', error)
    throw error
  }
}

export const deleteWorkspace = async (id: string): Promise<void> => {
  try {
    await updateWorkspace(id, {
      id,
      isDelete: true
    })
  } catch (error) {
    console.error('Error marking workspace as deleted:', error)
    throw error
  }
}
