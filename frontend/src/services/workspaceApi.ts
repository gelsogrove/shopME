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
  isActive: boolean
  isDelete: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateWorkspaceData {
  name: string
  description?: string
}

export interface UpdateWorkspaceData {
  name?: string
  description?: string
  isActive?: boolean
}

const workspaceApi = {
  async getAll(): Promise<Workspace[]> {
    const response = await api.get("/workspaces")
    return response.data
  },

  async getCurrent(): Promise<Workspace> {
    const response = await api.get("/workspaces/current")
    return response.data
  },

  async getById(id: string): Promise<Workspace> {
    const response = await api.get(`/workspaces/${id}`)
    return response.data
  },

  async create(data: CreateWorkspaceData): Promise<Workspace> {
    const response = await api.post("/workspaces", data)
    return response.data
  },

  async update(id: string, data: UpdateWorkspaceData): Promise<Workspace> {
    const response = await api.put(`/workspaces/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/workspaces/${id}`)
  },
}

// Language functions
export const getLanguages = async (): Promise<Language[]> => {
  const workspaceStr = localStorage.getItem("currentWorkspace")
  if (!workspaceStr) {
    throw new Error("No workspace selected")
  }
  try {
    const workspace = JSON.parse(workspaceStr)
    const response = await api.get("/languages", {
      headers: {
        "x-workspace-id": workspace.id,
      },
    })
    // Extract languages array from response
    const languages = response.data.languages || []
    return languages
  } catch (error) {
    throw new Error("Failed to get languages. Please try again.")
  }
}

// Export individual functions for backward compatibility
export const getCurrentWorkspace = workspaceApi.getCurrent
export const getWorkspaces = workspaceApi.getAll
export const createWorkspace = workspaceApi.create
export const updateWorkspace = workspaceApi.update
export const deleteWorkspace = workspaceApi.delete

export { workspaceApi }
