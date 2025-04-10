import { api } from './api'

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
export const getWorkspaceAgents = async (workspaceId: string): Promise<Agent[]> => {
  try {
    console.log(`API: Fetching agents for workspace ${workspaceId}`);
    const response = await api.get(`/api/workspaces/${workspaceId}/agents`);
    console.log(`API: Received ${response.data?.length || 0} agents`);
    return response.data;
  } catch (error) {
    console.error('Error getting agents:', error);
    throw error;
  }
};

/**
 * Get a specific agent by ID
 */
export const getAgent = async (agentId: string): Promise<Agent> => {
  try {
    console.log(`API: Fetching agent ${agentId}`);
    const response = await api.get(`/api/agents/${agentId}`);
    console.log(`API: Received agent`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting agent:', error);
    throw error;
  }
};

/**
 * Create a new agent for a workspace
 */
export const createAgent = async (workspaceId: string, data: CreateAgentData): Promise<Agent> => {
  try {
    console.log(`API: Creating agent for workspace ${workspaceId}`, data);
    const response = await api.post(`/api/workspaces/${workspaceId}/agents`, data);
    console.log(`API: Created agent:`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating agent:', error);
    throw error;
  }
};

/**
 * Update an existing agent
 */
export const updateAgent = async (agentId: string, data: UpdateAgentData): Promise<Agent> => {
  try {
    console.log(`API: Updating agent ${agentId}`, data);
    const response = await api.put(`/api/agents/${agentId}`, data);
    console.log(`API: Updated agent:`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating agent:', error);
    throw error;
  }
};

/**
 * Delete an agent
 */
export const deleteAgent = async (agentId: string): Promise<void> => {
  try {
    console.log(`API: Deleting agent ${agentId}`);
    await api.delete(`/api/agents/${agentId}`);
    console.log(`API: Deleted agent ${agentId}`);
  } catch (error) {
    console.error('Error deleting agent:', error);
    throw error;
  }
};

/**
 * Duplicate an agent
 */
export const duplicateAgent = async (agentId: string): Promise<Agent> => {
  try {
    console.log(`API: Duplicating agent ${agentId}`);
    const response = await api.post(`/api/agents/${agentId}/duplicate`);
    console.log(`API: Duplicated agent:`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error duplicating agent:', error);
    throw error;
  }
}; 