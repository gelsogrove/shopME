import { Agent, CreateAgentData, UpdateAgentData } from "@/types/agent"
import { api } from "./api"

export interface Agent {
  id: string
  name: string
  content: string
  isRouter: boolean
  department: string | undefined
  createdAt: string
  updatedAt: string
  workspaceId: string
  temperature?: number
  top_p?: number
  top_k?: number
}

export interface CreateAgentData {
  name: string
  content: string
  isRouter?: boolean
  department?: string
  temperature?: number
  top_p?: number
  top_k?: number
}

export interface UpdateAgentData {
  name?: string
  content?: string
  isRouter?: boolean
  department?: string
  temperature?: number
  top_p?: number
  top_k?: number
}

/**
 * Get all agents for a workspace
 */
export const getAgents = async (workspaceId: string): Promise<Agent[]> => {
  try {
    const response = await api.get<Agent[]>(`/api/workspaces/${workspaceId}/agents`)
    return response.data
  } catch (error) {
    console.error("Error getting agents:", error)
    throw error
  }
}

/**
 * Get a specific agent by ID
 */
export const getAgent = async (workspaceId: string, agentId: string): Promise<Agent> => {
  try {
    const response = await api.get<Agent>(`/api/workspaces/${workspaceId}/agents/${agentId}`)
    return response.data
  } catch (error) {
    console.error("Error getting agent:", error)
    throw error
  }
}

/**
 * Create a new agent for a workspace
 */
export const createAgent = async (workspaceId: string, data: CreateAgentData): Promise<Agent> => {
  try {
    const response = await api.post<Agent>(`/api/workspaces/${workspaceId}/agents`, data)
    return response.data
  } catch (error) {
    console.error("Error creating agent:", error)
    throw error
  }
}

/**
 * Update an existing agent
 */
export const updateAgent = async (
  workspaceId: string,
  agentId: string,
  data: UpdateAgentData
): Promise<Agent> => {
  try {
    const response = await api.put<Agent>(
      `/api/workspaces/${workspaceId}/agents/${agentId}`,
      data
    )
    return response.data
  } catch (error) {
    console.error("Error updating agent:", error)
    throw error
  }
}

/**
 * Delete an agent
 */
export const deleteAgent = async (workspaceId: string, agentId: string): Promise<void> => {
  try {
    await api.delete(`/api/workspaces/${workspaceId}/agents/${agentId}`)
  } catch (error) {
    console.error("Error deleting agent:", error)
    throw error
  }
}

/**
 * Duplicate an agent
 */
export const duplicateAgent = async (workspaceId: string, agentId: string): Promise<Agent> => {
  try {
    const response = await api.post<Agent>(
      `/api/workspaces/${workspaceId}/agents/${agentId}/duplicate`
    )
    return response.data
  } catch (error) {
    console.error("Error duplicating agent:", error)
    throw error
  }
} 