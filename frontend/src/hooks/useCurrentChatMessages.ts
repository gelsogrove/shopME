import { logger } from "@/lib/logger"
import { api } from "@/services/api"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

interface Message {
  id: string
  content: string
  sender: "user" | "customer"
  timestamp: string
  agentName?: string
  metadata?: {
    isOperatorMessage?: boolean
    isOperatorControl?: boolean
    agentSelected?: string
  }
}

/**
 * Hook to fetch and poll messages for the currently selected chat
 * This keeps the message list up-to-date without losing user's scroll position
 */
export function useCurrentChatMessages(
  sessionId: string | null,
  enabled: boolean = true
) {
  // SIMPLIFIED: No tab blocking, always poll when enabled
  const hasPollingLock = enabled // Can poll if enabled
  const queryClient = useQueryClient()

  // Listen for updates from other tabs via localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "chat-messages-updated" && e.newValue) {
        const data = JSON.parse(e.newValue)
        if (data.sessionId === sessionId) {
          logger.info(
            "📥 Received chat messages update from another tab for session",
            sessionId
          )
          queryClient.invalidateQueries({
            queryKey: ["chat-messages", sessionId],
          })
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [queryClient, sessionId])

  return useQuery({
    queryKey: ["chat-messages", sessionId],
    queryFn: async () => {
      if (!sessionId) {
        return []
      }

      try {
        logger.info(`Fetching messages for session: ${sessionId}`)

        const response = await api.get(`/chat/${sessionId}/messages`)

        if (response.data.success) {
          const messages: Message[] = response.data.data.map(
            (message: any) => ({
              id: message.id,
              content: message.content,
              sender: message.direction === "INBOUND" ? "customer" : "user",
              timestamp: message.createdAt || new Date().toISOString(),
              agentName: message.metadata?.agentName,
              metadata: message.metadata,
            })
          )

          logger.info(
            `Loaded ${messages.length} messages for session ${sessionId}`
          )
          return messages
        }

        return []
      } catch (error) {
        logger.error("Error fetching messages:", error)
        return []
      }
    },
    enabled: !!sessionId, // Always enabled when sessionId exists - polling controlled by refetchInterval
    refetchInterval: hasPollingLock ? 4000 : false, // Only poll if we have the lock
    refetchIntervalInBackground: true, // Allow background polling
    staleTime: 1000, // Data is fresh for 1 second
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
    refetchOnWindowFocus: hasPollingLock, // Refetch on focus if we have lock
  })
}
