import { API_URL } from "../config"

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
  console.log(`Fetching agents for workspace ${workspaceId}`)
  
  try {
    const response = await fetch(`${API_URL}/workspaces/${workspaceId}/agent`, {
      method: "GET",
      credentials: "include",
    })

    if (!response.ok) {
      console.error(`Failed to fetch agents: ${response.statusText}`)
      return []
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching agents:", error)
    return []
  }
}

/**
 * Get a specific agent by ID
 */
export async function getAgent(workspaceId: string, agentId?: string): Promise<Agent> {
  console.log(`Getting agent for workspace ${workspaceId}, agentId: ${agentId || 'none'}`)
  
  try {
    // If no agentId is provided, get the first agent (for single agent setup)
    if (!agentId) {
      const agents = await getAgents(workspaceId)
      if (agents.length > 0) {
        console.log(`Found ${agents.length} agents, using first one:`, agents[0])
        return agents[0]
      }
      
      // If no agents exist, create a default one
      console.log("No agents found, creating default agent")
      return createAgent(workspaceId, {
        name: "Default Agent",
        content: "# Default Agent Instructions\n\nI am a helpful AI assistant for your business.",
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        model: "openai/gpt-4.1-mini",
        max_tokens: 1000
      })
    }

    // Get specific agent by ID
    const response = await fetch(`${API_URL}/workspaces/${workspaceId}/agent/${agentId}`, {
      method: "GET",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch agent: ${response.statusText}`)
    }

    return response.json()
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
  
  const response = await fetch(`${API_URL}/workspaces/${workspaceId}/agent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to create agent: ${response.statusText}`)
  }

  return response.json()
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
  
  const response = await fetch(`${API_URL}/workspaces/${workspaceId}/agent/${agentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to update agent: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Delete an agent
 */
export async function deleteAgent(workspaceId: string, agentId: string): Promise<void> {
  console.log(`Deleting agent ${agentId} for workspace ${workspaceId}`)
  
  const response = await fetch(`${API_URL}/workspaces/${workspaceId}/agent/${agentId}`, {
    method: "DELETE",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Failed to delete agent: ${response.statusText}`)
  }
} 