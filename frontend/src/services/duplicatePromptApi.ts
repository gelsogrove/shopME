import { api } from './api'
import { Prompt } from './promptsApi'

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