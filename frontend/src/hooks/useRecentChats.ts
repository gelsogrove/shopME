import { api } from "@/services/api"
import { logger } from "@/lib/logger"
import { useQuery } from "@tanstack/react-query"

export function useRecentChats() {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      try {
        // Get current workspace ID from session storage
        const workspaceData = sessionStorage.getItem("currentWorkspace")
        let workspaceId = null

        if (workspaceData) {
          try {
            const workspace = JSON.parse(workspaceData)
            workspaceId = workspace.id
          } catch (e) {
            logger.error("Error parsing workspace data:", e)
          }
        }

        if (!workspaceId) {
          throw new Error("No workspace ID available")
        }

        // Make API request with explicit header
        const response = await api.get("/chat/recent", {
          headers: {
            "x-workspace-id": workspaceId,
          },
        })

        if (response.data.success) {
                    // Transform the backend data to match frontend expectations
          const transformedChats = response.data.data.map((chat: any) => ({
            id: chat.id,
            sessionId: chat.id, // Map id to sessionId for frontend compatibility
            customerId: chat.customerId,
            customerName: chat.customer?.name || "Unknown Customer",
            customerPhone: chat.customer?.phone || "",
            customerLanguage: chat.context?.language || "en", // Use context.language direttamente
            companyName: chat.customer?.company || "",
            lastMessage: chat.lastMessage || "",
            lastMessageTime: chat.updatedAt || chat.createdAt,
            unreadCount: chat.unreadCount || 0,
            isActive: true,
            isFavorite: false,
            activeChatbot: chat.customer?.activeChatbot ?? true, // Include activeChatbot for chat list icon
            isBlacklisted: chat.customer?.isBlacklisted ?? false, // Include blacklist status
          }))

          // DEBUG: Log per vedere che lingue arrivano dal backend
          transformedChats.forEach(chat => {
            console.log(`🔍 DEBUG - Customer: ${chat.customerName}`)
            console.log(`🔍 DEBUG - Raw chat object:`, chat)
            console.log(`🔍 DEBUG - context?.language:`, chat.context?.language)
            console.log(`🔍 DEBUG - customerLanguage:`, chat.customerLanguage)
            console.log(`🔍 DEBUG - customer?.language:`, chat.customer?.language)
          })

          return transformedChats
        }

        throw new Error("Error loading chats - API response not successful")
      } catch (error) {
        logger.error("Error in useRecentChats:", error)
        throw error
      }
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  })
}
