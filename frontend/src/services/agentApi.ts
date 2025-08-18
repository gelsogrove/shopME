import { logger } from "@/lib/logger"
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
  logger.info(`=== GET AGENTS DEBUG ===`)
  logger.info(`Fetching agents for workspace ${workspaceId}`)
  
  try {
    const url = `/workspaces/${workspaceId}/agent`
    logger.info(`GET request URL: ${url}`)
    
    const response = await api.get(url, {
      headers: {
        "x-workspace-id": workspaceId
      }
    })

    logger.info(`Response status: ${response.status}`)
    logger.info(`Response data:`, response.data)

    const data = response.data
    logger.info(`Agents received:`, data)
    logger.info(`Number of agents: ${data?.length || 0}`)
    
    return data || []
  } catch (error) {
    logger.error("Error fetching agents:", error)
    return []
  }
}

/**
 * Get a specific agent by ID
 */
export async function getAgent(workspaceId: string, agentId?: string): Promise<Agent | null> {
  logger.info(`=== GET AGENT DEBUG ===`)
  logger.info(`Getting agent for workspace ${workspaceId}, agentId: ${agentId || 'none'}`)
  try {
    // If no agentId is provided, get the first agent (for single agent setup)
    if (!agentId) {
      logger.info("No agentId provided, getting all agents first...")
      const agents = await getAgents(workspaceId)
      logger.info(`Found ${agents.length} agents`)
      if (agents.length > 0) {
        logger.info(`Using first agent:`, agents[0])
        logger.info(`First agent ID: ${agents[0].id}`)
        logger.info(`First agent name: ${agents[0].name}`)
        logger.info(`First agent content length: ${agents[0].content?.length}`)
        return agents[0]
      }
      // No agents found, return null (do NOT create one)
      return null
    }
    // Get specific agent by ID
    const url = `/workspaces/${workspaceId}/agent/${agentId}`
    logger.info(`GET specific agent URL: ${url}`)
    
    const response = await api.get(url, {
      headers: {
        "x-workspace-id": workspaceId
      }
    })
    
    logger.info(`Specific agent response status: ${response.status}`)
    const agentData = response.data
    logger.info("Specific agent data:", agentData)
    return agentData
  } catch (error) {
    logger.error("Error in getAgent:", error)
    throw error
  }
}

/**
 * Create a new agent
 */
export async function createAgent(workspaceId: string, data: Partial<Agent>): Promise<Agent> {
  logger.info(`Creating agent for workspace ${workspaceId}`, data)
  
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
  logger.info(`Updating agent ${agentId} for workspace ${workspaceId}`, data)
  
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
  logger.info(`Deleting agent ${agentId} for workspace ${workspaceId}`)
  
  await api.delete(`/workspaces/${workspaceId}/agent/${agentId}`, {
    headers: {
      "x-workspace-id": workspaceId
    }
  })
} 