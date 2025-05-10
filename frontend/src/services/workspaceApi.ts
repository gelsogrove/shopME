import { API_URL } from "@/config"
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

/**
 * Get the current workspace from session storage or API
 */
export async function getCurrentWorkspace(): Promise<Workspace> {
  // First check if we have the workspace in session storage
  const storedWorkspace = sessionStorage.getItem("currentWorkspace")
  
  if (storedWorkspace) {
    try {
      return JSON.parse(storedWorkspace)
    } catch (error) {
      console.error("Failed to parse stored workspace:", error)
    }
  }
  
  // If not in storage, fetch from API
  const response = await fetch(`${API_URL}/workspaces/current`, {
    credentials: "include",
  })
  
  if (!response.ok) {
    throw new Error("Failed to fetch current workspace")
  }
  
  const workspace = await response.json()
  
  // Store in session storage for future use
  sessionStorage.setItem("currentWorkspace", JSON.stringify(workspace))
  
  return workspace
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
