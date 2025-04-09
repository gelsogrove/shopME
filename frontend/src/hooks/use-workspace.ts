import { useEffect, useState } from "react"
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

  const fetchWorkspace = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/workspace")
      if (!response.ok) {
        throw new Error("Failed to fetch workspace")
      }
      const data = await response.json()
      setWorkspace(data)
    } catch (err) {
      setError(err as Error)
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to fetch workspace",
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
      const response = await fetch(`/api/workspace/${workspace.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        throw new Error("Failed to update workspace")
      }
      const updatedWorkspace = await response.json()
      setWorkspace(updatedWorkspace)
      toast({
        title: "Success",
        description: "Workspace updated successfully",
      })
      return updatedWorkspace
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update workspace",
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
