import { Agent, CreateAgentData, UpdateAgentData } from "@/types/agent"
import { api } from "./api"

export type { Agent, CreateAgentData, UpdateAgentData }

/**
 * Get all agents for a workspace
 */
export const getAgents = async (workspaceId: string): Promise<Agent[]> => {
  try {
    const response = await api.get<Agent[]>(`/workspaces/${workspaceId}/agents`)
    console.log("getAgents response:", response.data)
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
    const response = await api.get<Agent>(`/workspaces/${workspaceId}/agents/${agentId}`)
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
    console.log("Creating agent with payload:", {
      workspaceId,
      ...data
    })
    const response = await api.post<Agent>(`/workspaces/${workspaceId}/agents`, data)
    console.log("createAgent response:", response.data)
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
    console.log("Updating agent with payload:", {
      workspaceId,
      agentId,
      ...data
    })
    const response = await api.put<Agent>(
      `/workspaces/${workspaceId}/agents/${agentId}`,
      data
    )
    console.log("updateAgent response:", response.data)
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
    console.log("Deleting agent:", { workspaceId, agentId })
    await api.delete(`/workspaces/${workspaceId}/agents/${agentId}`)
    console.log("Agent deleted successfully")
  } catch (error) {
    console.error("Error deleting agent:", error)
    throw error
  }
} 