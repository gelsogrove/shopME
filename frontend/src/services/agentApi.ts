import { api } from "./api"

export interface Agent {
  id: string
  name: string
  content: string
  workspaceId: string
  isRouter?: boolean
  department?: string | null
  temperature?: number
  top_p?: number
  top_k?: number
  model?: string
  max_tokens?: number
  createdAt: string
  updatedAt: string
}

/**
 * Get all agents for a workspace
 */
export async function getAgents(workspaceId: string): Promise<Agent[]> {
  console.log(`=== GET AGENTS DEBUG ===`)
  console.log(`Fetching agents for workspace ${workspaceId}`)
  
  try {
    const url = `/workspaces/${workspaceId}/agent`
    console.log(`GET request URL: ${url}`)
    
    const response = await api.get(url, {
      headers: {
        "x-workspace-id": workspaceId
      }
    })

    console.log(`Response status: ${response.status}`)
    console.log(`Response data:`, response.data)

    const data = response.data
    console.log(`Agents received:`, data)
    console.log(`Number of agents: ${data?.length || 0}`)
    
    return data || []
  } catch (error) {
    console.error("Error fetching agents:", error)
    return []
  }
}

/**
 * Get a specific agent by ID
 */
export async function getAgent(workspaceId: string, agentId?: string): Promise<Agent | null> {
  console.log(`=== GET AGENT DEBUG ===`)
  console.log(`Getting agent for workspace ${workspaceId}, agentId: ${agentId || 'none'}`)
  try {
    // If no agentId is provided, get the first agent (for single agent setup)
    if (!agentId) {
      console.log("No agentId provided, getting all agents first...")
      const agents = await getAgents(workspaceId)
      console.log(`Found ${agents.length} agents`)
      if (agents.length > 0) {
        console.log(`Using first agent:`, agents[0])
        console.log(`First agent ID: ${agents[0].id}`)
        console.log(`First agent name: ${agents[0].name}`)
        console.log(`First agent content length: ${agents[0].content?.length}`)
        return agents[0]
      }
      // No agents found, return null (do NOT create one)
      return null
    }
    // Get specific agent by ID
    const url = `/workspaces/${workspaceId}/agent/${agentId}`
    console.log(`GET specific agent URL: ${url}`)
    
    const response = await api.get(url, {
      headers: {
        "x-workspace-id": workspaceId
      }
    })
    
    console.log(`Specific agent response status: ${response.status}`)
    const agentData = response.data
    console.log("Specific agent data:", agentData)
    return agentData
  } catch (error) {
    console.error("Error in getAgent:", error)
    throw error
  }
}

/**
 * Create a new agent
 */
export async function createAgent(workspaceId: string, data: Partial<Agent>): Promise<Agent> {
  console.log(`Creating agent for workspace ${workspaceId}`, data)
  
  const response = await api.post(`/workspaces/${workspaceId}/agent`, data, {
    headers: {
      "x-workspace-id": workspaceId
    }
  })

  return response.data
}

/**
 * Update an existing agent
 */
export async function updateAgent(
  workspaceId: string,
  agentId: string,
  data: Partial<Agent>
): Promise<Agent> {
  console.log(`Updating agent ${agentId} for workspace ${workspaceId}`, data)
  
  const response = await api.put(`/workspaces/${workspaceId}/agent/${agentId}`, data, {
    headers: {
      "x-workspace-id": workspaceId
    }
  })

  return response.data
}

/**
 * Delete an agent
 */
export async function deleteAgent(workspaceId: string, agentId: string): Promise<void> {
  console.log(`Deleting agent ${agentId} for workspace ${workspaceId}`)
  
  await api.delete(`/workspaces/${workspaceId}/agent/${agentId}`, {
    headers: {
      "x-workspace-id": workspaceId
    }
  })
} 