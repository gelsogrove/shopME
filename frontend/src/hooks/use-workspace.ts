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
  stats?: {
    products: number
    orders: number
    revenue: number
  }
}

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
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
      
      const response = await api.get("/api/workspace")
      setWorkspace(response.data)
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
      const response = await api.put(`/api/workspace/${workspace.id}`, updates)
      setWorkspace(response.data)
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

  useEffect(() => {
    fetchWorkspace()
  }, [])

  return {
    workspace,
    loading,
    error,
    fetchWorkspace,
    updateWorkspace,
  }
}
