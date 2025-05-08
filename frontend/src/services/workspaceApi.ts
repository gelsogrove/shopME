import { api } from "./api"

export interface Language {
  id: string
  code: string
  name: string
}

export interface Workspace {
  id: string
  name: string
  description?: string
  whatsappPhoneNumber?: string
  whatsappApiKey?: string
  createdAt: string
  updatedAt?: string
  isActive: boolean
  isDelete: boolean
  currency: string
  language: string
  messageLimit?: number
  challengeStatus: boolean
  wipMessages?:
    | {
        en: string
        it: string
        es: string
        pt: string
      }
    | string
  blocklist?: string
  url?: string | null
  welcomeMessages?:
    | {
        it: string
        en: string
        es: string
        pt: string
      }
    | string
}

export interface CreateWorkspaceData {
  name: string
  whatsappPhoneNumber?: string
  language?: string
  isActive?: boolean
  isDelete?: boolean
  url?: string
}

export interface UpdateWorkspaceData {
  id: string
  name?: string
  whatsappPhoneNumber?: string
  language?: string
  isActive?: boolean
  isDelete?: boolean
  url?: string
}

export const transformWorkspaceResponse = (workspace: any): Workspace => {
  return {
    ...workspace,
    currency: workspace.currency || "EUR",
    language: workspace.language || "en",
    messageLimit: workspace.messageLimit || 50,
    challengeStatus: workspace.challengeStatus || false,
    blocklist: workspace.blocklist || "",
    url: workspace.url || "",
    wipMessages:
      typeof workspace.wipMessages === "string"
        ? JSON.parse(workspace.wipMessages)
        : workspace.wipMessages,
    welcomeMessages:
      typeof workspace.welcomeMessages === "string"
        ? JSON.parse(workspace.welcomeMessages)
        : workspace.welcomeMessages,
  }
}

const transformWorkspaceRequest = (
  workspace: CreateWorkspaceData | UpdateWorkspaceData
) => {
  const { isDelete, ...rest } = workspace
  return {
    ...rest,
    isDelete,
  }
}

export const getCurrentWorkspace = async (): Promise<Workspace> => {
  const workspaceStr = sessionStorage.getItem("currentWorkspace")
  if (!workspaceStr) {
    throw new Error("No workspace selected")
  }

  try {
    const workspace = JSON.parse(workspaceStr)
    if (!workspace.id) {
      throw new Error("Invalid workspace data")
    }

    // Check if we're on the settings page and just saved
    // In this case, use the cached data to avoid unnecessary API calls
    const isSettingsPage = window.location.pathname.includes("/settings")
    const lastSaveTime = sessionStorage.getItem("lastWorkspaceSave")
    const now = Date.now()
    const recentlySaved = lastSaveTime && now - parseInt(lastSaveTime) < 5000 // 5 seconds

    if (isSettingsPage && recentlySaved) {
      console.log("Using cached workspace data (recently saved)")
      return transformWorkspaceResponse(workspace)
    }

    // Get fresh data from API
    const response = await api.get(`/workspaces/${workspace.id}`)
    console.log("API Response - getCurrentWorkspace:", response.data)
    return transformWorkspaceResponse(response.data)
  } catch (error) {
    console.error("Error getting workspace:", error)

    // If we get a 401, don't throw immediately - check if we have workspace data
    if (error.response?.status === 401) {
      try {
        const workspace = JSON.parse(workspaceStr)
        console.log("Using cached workspace data due to auth error")
        return transformWorkspaceResponse(workspace)
      } catch (parseError) {
        console.error("Error parsing cached workspace data:", parseError)
      }
    }

    throw new Error("Failed to get current workspace. Please try again.")
  }
}

export const getWorkspaces = async (): Promise<Workspace[]> => {
  try {
    // Get user from localStorage to check authentication
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      throw new Error("User not authenticated")
    }

    const response = await api.get("/workspaces")
    console.log("API Response - getWorkspaces:", response.data)
    return response.data.map(transformWorkspaceResponse)
  } catch (error) {
    console.error("Error getting workspaces:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to get workspaces. Please try again.")
  }
}

export const getLanguages = async (): Promise<Language[]> => {
  const workspaceStr = sessionStorage.getItem("currentWorkspace")
  if (!workspaceStr) {
    throw new Error("No workspace selected")
  }
  try {
    const workspace = JSON.parse(workspaceStr)
    const response = await api.get("/languages", {
      headers: {
        "x-workspace-id": workspace.id,
      },
    })
    console.log("API Response - getLanguages:", response.data)
    // Extract languages array from response
    const languages = response.data.languages || []
    return languages
  } catch (error) {
    console.error("Error getting languages:", error)
    throw new Error("Failed to get languages. Please try again.")
  }
}

export const createWorkspace = async (
  data: CreateWorkspaceData
): Promise<Workspace> => {
  try {
    const response = await api.post(
      "/workspaces",
      transformWorkspaceRequest(data)
    )
    console.log("API Response - createWorkspace:", response.data)
    return transformWorkspaceResponse(response.data)
  } catch (error) {
    console.error("Error creating workspace:", error)
    throw new Error("Failed to create workspace. Please try again.")
  }
}

export const updateWorkspace = async (
  id: string,
  data: UpdateWorkspaceData
): Promise<Workspace> => {
  try {
    const response = await api.put(
      `/workspaces/${id}`,
      transformWorkspaceRequest(data)
    )
    console.log("API Response - updateWorkspace:", response.data)

    // Store the save timestamp
    sessionStorage.setItem("lastWorkspaceSave", Date.now().toString())

    return transformWorkspaceResponse(response.data)
  } catch (error) {
    console.error("Error updating workspace:", error)
    throw new Error("Failed to update workspace. Please try again.")
  }
}

export const deleteWorkspace = async (id: string): Promise<void> => {
  if (!id) {
    console.error("Delete workspace failed: No workspace ID provided")
    throw new Error("No workspace ID provided")
  }

  console.log("Attempting to delete workspace with ID:", id)
  try {
    // Get user token to ensure we're authenticated
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      console.error("Delete workspace failed: User not authenticated")
      throw new Error("User not authenticated")
    }

    // Make the DELETE request with detailed logging
    console.log("Sending DELETE request to:", `/workspaces/${id}`)
    const response = await api.delete(`/workspaces/${id}`)

    console.log("Delete workspace response status:", response.status)
    console.log("Delete workspace response data:", response.data)

    // Clear the workspace from sessionStorage to prevent issues
    sessionStorage.removeItem("currentWorkspace")

    return
  } catch (error: any) {
    console.error("Delete workspace failed:", error)
    if (error.response) {
      console.error("Error response status:", error.response.status)
      console.error("Error response data:", error.response.data)
    }
    throw error
  }
}
