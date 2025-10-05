import { useChat } from "@/contexts/ChatContext"
import { logger } from "@/lib/logger"
import { api } from "@/services/api"
import { useQuery } from "@tanstack/react-query"
import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { toast as sonnerToast } from "sonner"
import { pollingCoordinator } from "./usePollingCoordinator"

/**
 * Global hook that runs in the background on every page
 * to detect new messages and show toast notifications
 */
export function useGlobalNewMessageNotifier() {
  const { selectedChat } = useChat() // Get selected chat from context
  const navigate = useNavigate()
  // Track previous chats to detect new messages
  const previousChatsRef = useRef<
    Map<string, { lastMessage: string; lastMessageTime: string }>
  >(new Map())

  // Polling for chat list every 8 seconds
  const { data: allChats = [] } = useQuery({
    queryKey: ["global-chats"],
    queryFn: async () => {
      try {
        // First check if we have cached data
        const cachedData = pollingCoordinator.getCachedData()
        if (cachedData) {
          logger.info("📦 GlobalNotifier: Using cached data")
          return cachedData
        }

        // Check if we can make the API call
        if (!pollingCoordinator.canMakeCall("useGlobalNewMessageNotifier")) {
          logger.info("🚫 GlobalNotifier: API call blocked by coordinator")
          throw new Error("API call blocked by coordinator")
        }

        // Get current workspace ID from local storage
        const workspaceData = localStorage.getItem("currentWorkspace")
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
          pollingCoordinator.markCallCompleted("recent-chats")
          return [] // No workspace, no polling
        }

        logger.info("📡 GlobalNotifier: Making API call to /chat/recent")

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
            language: chat.context?.language || chat.customer?.language || "en",
            companyName: chat.customer?.company || null,
            lastMessage: chat.lastMessage || "",
            lastMessageTime: chat.updatedAt || chat.createdAt,
            unreadCount: chat.unreadCount || 0,
            isActive: true,
            isFavorite: false,
            activeChatbot: chat.customer?.activeChatbot ?? true,
            isBlacklisted: chat.customer?.isBlacklisted ?? false,
          }))

          // Mark call as completed and cache the data
          pollingCoordinator.markCallCompleted("recent-chats", transformedChats)

          // Check for new messages and show toast
          logger.info(`🌍 GLOBAL: Total chats: ${transformedChats.length}`)
          transformedChats.forEach((chat: any) => {
            const chatId = chat.sessionId
            const previous = previousChatsRef.current.get(chatId)

            // If we have a previous state and the message changed
            if (
              previous &&
              (previous.lastMessage !== chat.lastMessage ||
                previous.lastMessageTime !== chat.lastMessageTime)
            ) {
              // Skip toast if this is the currently selected chat
              if (selectedChat && selectedChat.sessionId === chat.sessionId) {
                logger.info(
                  "🌍🔇 Skipping toast for selected chat:",
                  chat.customerName
                )
                return
              }

              // New message detected!
              logger.info(
                "🌍🔔 GLOBAL NEW MESSAGE DETECTED for",
                chat.customerName
              )
              logger.info("Previous:", previous.lastMessage?.substring(0, 30))
              logger.info("Current:", chat.lastMessage?.substring(0, 30))

              // Show toast for global notifications
              const messagePreview =
                chat.lastMessage?.substring(0, 30) || "New message"
              const displayText =
                messagePreview +
                (chat.lastMessage && chat.lastMessage.length > 30 ? "..." : "")

              logger.info("🌍🎯 Showing GLOBAL toast:", displayText)

              sonnerToast.success(`💬 ${chat.customerName}`, {
                description: displayText,
                duration: 3000,
                action: {
                  label: "Open",
                  onClick: () => {
                    logger.info(
                      "🌍🔗 Toast clicked, navigating to chat:",
                      chat.sessionId
                    )
                    navigate(`/chat?session=${chat.sessionId}`)
                  },
                },
              })

              logger.info("🌍✅ Global toast created successfully!")
            }

            // Update previous state
            previousChatsRef.current.set(chatId, {
              lastMessage: chat.lastMessage || "",
              lastMessageTime: chat.lastMessageTime || "",
            })
          })

          return transformedChats
        }

        return []
      } catch (error) {
        // Make sure to mark call as completed even on error
        pollingCoordinator.markCallCompleted("recent-chats")
        logger.error("Error in global chat polling:", error)
        return []
      }
    },
    enabled: true, // Always enabled
    refetchInterval: 8000, // Poll every 8 seconds (increased from 4)
    refetchIntervalInBackground: true, // Allow background polling
    staleTime: 3000, // Data is fresh for 3 seconds (increased from 1)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch on focus
  })

  return allChats
}
