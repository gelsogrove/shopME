import { logger } from "@/lib/logger"
import { api } from "@/services/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "./use-toast"

export interface Workspace {
  id: string
  name: string
  description?: string
  whatsappPhoneNumber?: string
  whatsappApiToken?: string
  whatsappWebhookUrl?: string
  n8nWorkflowUrl?: string
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
        logger.warn("Error parsing cached workspace:", err)
      }
    }
    return null
  })
  const { toast } = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch workspaces using React Query
  const { 
    data: workspaces = [], 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      try {
        logger.info("🔍 Fetching workspaces...")
        const response = await api.get("/workspaces")
        logger.info("📥 Workspaces API response:", response.data)
        logger.info("📊 Response type:", typeof response.data)
        logger.info("📊 Is array:", Array.isArray(response.data))
        
        // Handle different response structures
        let workspaces = response.data
        if (response.data && response.data.data) {
          workspaces = response.data.data
          logger.info("📦 Extracted workspaces from data.data:", workspaces)
        }
        
        if (!Array.isArray(workspaces)) {
          logger.error("❌ Workspaces is not an array:", workspaces)
          throw new Error("Invalid workspaces data format")
        }
        
        logger.info("✅ Returning workspaces:", workspaces)
        return workspaces as Workspace[]
      } catch (err: any) {
        logger.error("❌ Error fetching workspaces:", err)
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate("/auth/login")
        }
        throw err
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 unauthorized
      if (axios.isAxiosError(error) && error.response?.status === 401) return false
      return failureCount < 2
    }
  })

  // Handle workspaces error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch workspaces",
        variant: "destructive",
      })
    }
  }, [error, toast])

  // Fetch services using React Query
  const {
    data: services = [],
    isLoading: servicesLoading,
    error: servicesError
  } = useQuery({
    queryKey: ['services', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return []
      const response = await api.get(`/workspaces/${workspace.id}/services`)
      return response.data
    },
    enabled: !!workspace?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  })

  // Handle services error
  useEffect(() => {
    if (servicesError) {
      toast({
        title: "Error",
        description: servicesError instanceof Error ? servicesError.message : "Failed to fetch services",
        variant: "destructive",
      })
    }
  }, [servicesError, toast])

  // Update workspace mutation
  const updateWorkspaceMutation = useMutation({
    mutationFn: async (updates: Partial<Workspace>) => {
      if (!workspace) throw new Error("No workspace selected")
      const response = await api.put(`/workspaces/${workspace.id}`, updates)
      return response.data
    },
    onSuccess: (data) => {
      setWorkspace(data)
      sessionStorage.setItem("currentWorkspace", JSON.stringify(data))
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      toast({
        title: "Success",
        description: "Workspace updated successfully",
      })
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update workspace",
        variant: "destructive",
      })
    }
  })

  // Delete workspace mutation
  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: string) => {
      const response = await api.delete(`/workspaces/${workspaceId}`)
      return response.data
    },
    onSuccess: () => {
      // Clear current workspace if it was deleted
      sessionStorage.removeItem("currentWorkspace")
      setWorkspace(null)
      // Invalidate workspaces cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      toast({
        title: "Success",
        description: "Workspace deleted successfully",
      })
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete workspace",
        variant: "destructive",
      })
    }
  })

  // Add function to set current workspace
  const setCurrentWorkspace = (newWorkspace: Workspace) => {
    logger.info("Setting current workspace:", newWorkspace)
    setWorkspace(newWorkspace)
    sessionStorage.setItem("currentWorkspace", JSON.stringify(newWorkspace))
  }

  // Initialize workspace from workspaces data if needed
  useEffect(() => {
    if (!workspace && workspaces && workspaces.length > 0) {
      // Get the active workspace or the first one
      const activeWorkspace = workspaces.find((w: Workspace) => w.isActive) || workspaces[0]
      
      if (activeWorkspace) {
        logger.info("Setting active workspace:", activeWorkspace)
        setWorkspace(activeWorkspace)
        // Cache the workspace in sessionStorage
        sessionStorage.setItem("currentWorkspace", JSON.stringify(activeWorkspace))
      }
    }
  }, [workspaces, workspace])

  return {
    workspace,
    loading,
    error: error as Error | null,
    services,
    servicesLoading,
    fetchWorkspace: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
    updateWorkspace: updateWorkspaceMutation.mutate,
    deleteWorkspace: deleteWorkspaceMutation.mutate,
    getWorkspaceServices: () => queryClient.invalidateQueries({ queryKey: ['services', workspace?.id] }),
    setCurrentWorkspace,
  }
}
