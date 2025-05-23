import { Agent, CreateAgentData, UpdateAgentData } from "@/types/agent"
import { api } from "./api"

export type { Agent, CreateAgentData, UpdateAgentData }

/**
 * Get the agent for a workspace
 */
export const getAgent = async (workspaceId: string): Promise<Agent> => {
  try {
    const response = await api.get<Agent[]>(`/workspaces/${workspaceId}/agents`)
    console.log("getAgent response:", response.data)
    if (response.data && response.data.length > 0) {
      return response.data[0]
    }
    throw new Error("No agent found")
  } catch (error) {
    console.error("Error getting agent:", error)
    throw error
  }
}

/**
 * Get the agent by ID
 */
export const getAgentById = async (workspaceId: string, agentId: string): Promise<Agent> => {
  try {
    const response = await api.get<Agent>(`/workspaces/${workspaceId}/agents/${agentId}`)
    return response.data
  } catch (error) {
    console.error("Error getting agent by ID:", error)
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
 * Update the existing agent
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