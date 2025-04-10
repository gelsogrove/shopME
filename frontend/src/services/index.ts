// Export the API client
export { api } from './api'

// Re-export service APIs
export { servicesApi } from './servicesApi'

// Export prompt API functions
export {
    activatePrompt, createPrompt, deletePrompt, duplicatePrompt, getPrompt, getWorkspacePrompts, updatePrompt
} from './promptsApi'

// Export workspace API functions
export {
    createWorkspace, deleteWorkspace, getCurrentWorkspace, getLanguages, getWorkspaces, updateWorkspace
} from './workspaceApi'

// Export interface types
export type { CreatePromptData, Prompt, UpdatePromptData } from './promptsApi'
export type { Service } from './servicesApi'
export type { CreateWorkspaceData, Language, UpdateWorkspaceData, Workspace } from './workspaceApi'

