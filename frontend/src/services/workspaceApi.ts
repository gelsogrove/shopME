import { api } from "./api"

export interface Workspace {
  id: string
  name: string
  whatsappPhoneNumber: string | null
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export const workspaceApi = {
  async getAll(): Promise<Workspace[]> {
    const response = await api.get("/workspaces")
    return response.data
  },

  async getById(id: string): Promise<Workspace> {
    const response = await api.get(`/workspaces/${id}`)
    return response.data
  },

  async create(data: {
    name: string
    whatsappPhoneNumber?: string
  }): Promise<Workspace> {
    const response = await api.post("/workspaces", data)
    return response.data
  },

  async update(
    id: string,
    data: {
      name?: string
      whatsappPhoneNumber?: string
      isActive?: boolean
    }
  ): Promise<Workspace> {
    const response = await api.put(`/workspaces/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/workspaces/${id}`)
  },
}
