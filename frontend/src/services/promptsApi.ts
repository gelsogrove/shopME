import { api } from './api'

export interface Prompt {
  id: string
  name: string
  content: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  workspaceId: string
  temperature?: number
  top_p?: number
  top_k?: number
}

export interface CreatePromptData {
  name: string
  content: string
  isActive?: boolean
  temperature?: number
  top_p?: number
  top_k?: number
}

export interface UpdatePromptData {
  name?: string
  content?: string
  isActive?: boolean
  temperature?: number
  top_p?: number
  top_k?: number
}

/**
 * Get all prompts for a workspace
 */
export const getWorkspacePrompts = async (workspaceId: string): Promise<Prompt[]> => {
  try {
    const response = await api.get(`/api/workspaces/${workspaceId}/prompts`)
    return response.data
  } catch (error) {
    console.error('Error getting prompts:', error)
    throw error
  }
}

/**
 * Get a specific prompt by ID
 */
export const getPrompt = async (promptId: string): Promise<Prompt> => {
  try {
    const response = await api.get(`/api/prompts/${promptId}`)
    return response.data
  } catch (error) {
    console.error('Error getting prompt:', error)
    throw error
  }
}

/**
 * Create a new prompt for a workspace
 */
export const createPrompt = async (workspaceId: string, data: CreatePromptData): Promise<Prompt> => {
  try {
    const response = await api.post(`/api/workspaces/${workspaceId}/prompts`, data)
    return response.data
  } catch (error) {
    console.error('Error creating prompt:', error)
    throw error
  }
}

/**
 * Update an existing prompt
 */
export const updatePrompt = async (promptId: string, data: UpdatePromptData): Promise<Prompt> => {
  try {
    const response = await api.put(`/api/prompts/${promptId}`, data)
    return response.data
  } catch (error) {
    console.error('Error updating prompt:', error)
    throw error
  }
}

/**
 * Delete a prompt
 */
export const deletePrompt = async (promptId: string): Promise<void> => {
  try {
    await api.delete(`/api/prompts/${promptId}`)
  } catch (error) {
    console.error('Error deleting prompt:', error)
    throw error
  }
}

/**
 * Activate a prompt (and deactivate all others)
 */
export const activatePrompt = async (promptId: string): Promise<Prompt> => {
  try {
    const response = await api.post(`/api/prompts/${promptId}/activate`)
    return response.data
  } catch (error) {
    console.error('Error activating prompt:', error)
    throw error
  }
}

/**
 * Duplicate a prompt
 */
export const duplicatePrompt = async (promptId: string): Promise<Prompt> => {
  try {
    const response = await api.post(`/api/prompts/${promptId}/duplicate`)
    return response.data
  } catch (error) {
    console.error('Error duplicating prompt:', error)
    throw error
  }
} 