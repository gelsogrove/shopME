import { api } from "@/services/api"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "./use-toast"

interface Workspace {
  id: string
  name: string
  description?: string
  whatsappPhoneNumber?: string
  whatsappApiToken?: string
  whatsappWebhookUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  currency?: string
  language?: string
  stats?: {
    products: number
    orders: number
    revenue: number
  }
}

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(() => {
    // Try to get workspace from sessionStorage on initial load
    const cachedWorkspaceString = sessionStorage.getItem("currentWorkspace")
    if (cachedWorkspaceString) {
      try {
        return JSON.parse(cachedWorkspaceString)
      } catch (err) {
        console.warn("Error parsing cached workspace:", err)
      }
    }
    return null
  })
  const [loading, setLoading] = useState(!workspace) // Set loading to false if we already have a workspace
  const [error, setError] = useState<Error | null>(null)
  const [services, setServices] = useState<any[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const fetchWorkspace = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First check if user is authenticated
      try {
        await api.get("/api/auth/me")
      } catch (err) {
        navigate("/auth/login")
        return
      }
      
      // Check if we have a cached workspace in sessionStorage
      const cachedWorkspaceString = sessionStorage.getItem("currentWorkspace")
      if (cachedWorkspaceString) {
        try {
          const cachedWorkspace = JSON.parse(cachedWorkspaceString)
          setWorkspace(cachedWorkspace)
          setLoading(false)
          return
        } catch (err) {
          // If there's an error parsing the JSON, we'll continue and fetch from API
          console.warn("Error parsing cached workspace:", err)
        }
      }
      
      // If no cached workspace, fetch from API
      const response = await api.get("/api/workspaces")
      // Get the active workspace or the first one
      const workspaces = response.data
      const activeWorkspace = workspaces.find((w: Workspace) => w.isActive) || workspaces[0]
      
      if (activeWorkspace) {
        setWorkspace(activeWorkspace)
        // Cache the workspace in sessionStorage
        sessionStorage.setItem("currentWorkspace", JSON.stringify(activeWorkspace))
      } else {
        toast({
          title: "Warning",
          description: "No workspaces found",
          variant: "destructive",
        })
      }
    } catch (err) {
      setError(err as Error)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch workspace",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateWorkspace = async (updates: Partial<Workspace>) => {
    if (!workspace) return

    try {
      setLoading(true)
      const response = await api.put(`/api/workspaces/${workspace.id}`, updates)
      setWorkspace(response.data)
      // Update the cached workspace in sessionStorage
      sessionStorage.setItem("currentWorkspace", JSON.stringify(response.data))
      toast({
        title: "Success",
        description: "Workspace updated successfully",
      })
      return response.data
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update workspace",
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getWorkspaceServices = async () => {
    if (!workspace) return []
    
    try {
      setServicesLoading(true)
      const response = await api.get(`/api/workspaces/${workspace.id}/services`)
      setServices(response.data)
      return response.data
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch services",
        variant: "destructive",
      })
      return []
    } finally {
      setServicesLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkspace()
  }, [])

  return {
    workspace,
    loading,
    error,
    services,
    servicesLoading,
    fetchWorkspace,
    updateWorkspace,
    getWorkspaceServices,
  }
}
