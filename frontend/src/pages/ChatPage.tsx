import { PageLayout } from "@/components/layout/PageLayout"
import { ClientSheet } from "@/components/shared/ClientSheet"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { WhatsAppChatModal } from "@/components/shared/WhatsAppChatModal"
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon"
import { useWorkspace } from "@/hooks/use-workspace"
import { useRecentChats } from "@/hooks/useRecentChats"
import { logger } from "@/lib/logger"
import { toast } from "@/lib/toast"
import { api } from "@/services/api"
import { getLanguages, Language } from "@/services/workspaceApi"
import { useQuery } from "@tanstack/react-query"
import {
    Ban,
    Bot,
    Loader2,
    Lock,
    Pencil,
    Send,
    ShoppingBag,
    Trash2,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../components/ui/alert-dialog"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Switch } from "../components/ui/switch"
import { Textarea } from "../components/ui/textarea"

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
    sentBy?: string
    operatorId?: string
  }
}

interface ShippingAddress {
  street: string
  city: string
  zip: string
  country: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  discount?: number
  language?: string
  notes?: string
  shippingAddress: ShippingAddress
  activeChatbot?: boolean
}

interface Chat {
  id: string
  sessionId: string
  customerId: string
  customerName: string
  customerPhone: string
  companyName?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isActive: boolean
  isFavorite: boolean
  messages?: Message[]
  activeChatbot?: boolean
  isBlacklisted?: boolean
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return "Data non disponibile"
  }

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return "Data non valida"
    }

    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }

    return date.toLocaleDateString("it-IT", options)
  } catch (error) {
    return "Errore nella formattazione data"
  }
}

// Helper function to get language flag emoji
const getLanguageFlag = (language?: string): string => {
  switch (language?.toLowerCase()) {
    case 'it':
      return '🇮🇹'
    case 'en':
      return '🇬🇧'
    case 'es':
      return '🇪🇸'
    case 'pt':
      return '🇵🇹'
    default:
      return '🌐' // Default globe icon for unknown languages
  }
}

export function ChatPage() {
  logger.info("🟦 ChatPage component loaded - modifiche applicate!")
  const { workspace, loading: isWorkspaceLoading } = useWorkspace()
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionId = searchParams.get("sessionId")
  const [clientSearchTerm, setClientSearchTerm] = useState(
    searchParams.get("client") || ""
  )
  const initialLoadRef = useRef(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showOrdersDialog, setShowOrdersDialog] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [isInputDisabled, setIsInputDisabled] = useState(false)
  const [activeChatbot, setActiveChatbot] = useState<boolean>(true)
  const [showActiveChatbotDialog, setShowActiveChatbotDialog] = useState(false)
  const [hasToggledChatbot, setHasToggledChatbot] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const navigate = useNavigate()
  const [showPlaygroundDialog, setShowPlaygroundDialog] = useState(false)

  const handlePlaygroundClick = () => setShowPlaygroundDialog(true)
  const handleClosePlayground = () => {
    setShowPlaygroundDialog(false)
    // Reload the entire page to refresh all data
    window.location.reload()
  }

  // Redirect to workspace selection if user has no workspace
  useEffect(() => {
    if (!isWorkspaceLoading && !workspace) {
      logger.info("No workspace found, redirecting to workspace selection")
      navigate("/clients")
    }
  }, [isWorkspaceLoading, workspace, navigate])

  const {
    data: allChats = [],
    isLoading: isLoadingChats,
    isError: isErrorChats,
    refetch: refetchChats,
  } = useRecentChats()

  // Filter chats based on search term
  useEffect(() => {
    const filteredChats = clientSearchTerm
      ? allChats.filter(
          (chat: Chat) =>
            chat.customerName
              ?.toLowerCase()
              .includes(clientSearchTerm.toLowerCase()) ||
            chat.customerPhone
              ?.toLowerCase()
              .includes(clientSearchTerm.toLowerCase()) ||
            chat.companyName
              ?.toLowerCase()
              .includes(clientSearchTerm.toLowerCase()) ||
            chat.lastMessage
              ?.toLowerCase()
              .includes(clientSearchTerm.toLowerCase())
        )
      : allChats
    setChats(filteredChats)
  }, [allChats, clientSearchTerm])

  // Select first chat when chats are loaded and no chat is selected, or select the chat matching the client filter if present
  useEffect(() => {
    if (chats.length > 0 && !selectedChat && !clientSearchTerm) {
      selectChat(chats[0])
      return
    }
    // If we have a sessionId, find that specific chat
    if (chats.length > 0 && (!selectedChat || clientSearchTerm)) {
      if (sessionId) {
        const chatWithSessionId = chats.find(
          (chat) => chat.sessionId === sessionId
        )
        if (chatWithSessionId) {
          selectChat(chatWithSessionId)
          return
        }
      }

      // If we have a client search term, find chats for that client
      if (clientSearchTerm) {
        const clientChats = chats.filter(
          (chat) =>
            chat.customerName
              ?.toLowerCase()
              .includes(clientSearchTerm.toLowerCase()) ||
            chat.customerPhone
              ?.toLowerCase()
              .includes(clientSearchTerm.toLowerCase()) ||
            chat.companyName
              ?.toLowerCase()
              .includes(clientSearchTerm.toLowerCase())
        )

        if (clientChats.length > 0) {
          // Select the most recent chat for this client
          selectChat(clientChats[0])
          return
        }
      }

      // 🚨 ANDREA LOOP FIX: Don't auto-select first chat to prevent potential loops
      // As a fallback, select the first chat
      // if (!selectedChat) {
      //   selectChat(chats[0])
      // }
      logger.info(
        "🚨 LOOP PREVENTION: Not auto-selecting first chat to prevent potential loops"
      )
    }
  }, [chats, selectedChat, sessionId, clientSearchTerm])

  // Get workspaceId from workspace hook
  const workspaceId = workspace?.id

  // Fetch available languages
  const { data: availableLanguages = [] } = useQuery<Language[]>({
    queryKey: ["languages", workspaceId],
    queryFn: async () => getLanguages(),
    enabled: !!workspaceId,
  })

  // Log available languages whenever they change
  useEffect(() => {
    logger.info("Available languages in ChatPage:", availableLanguages)
  }, [availableLanguages])

  // Fetch selected chat details
  useEffect(() => {
    if (selectedChat) {
      // Load messages for the selected chat
      fetchMessagesForChat(selectedChat)

      // Check for stored activeChatbot value and update the state
      if (selectedChat.customerId) {
        fetchCustomerDetails(selectedChat.customerId)
      }
    }
  }, [selectedChat])

  // Function to load messages for a chat
  const fetchMessagesForChat = async (chat: Chat) => {
    if (!workspaceId) return

    try {
      setLoadingChat(true)
      const sessionIdToUse = chat.sessionId || chat.id
      logger.info("Fetching messages for chat with sessionId:", sessionIdToUse)
      const response = await api.get(`/chat/${sessionIdToUse}/messages`)
      if (response.data.success) {
        // Transform backend messages to frontend format
        const transformedMessages = response.data.data.map((message: any) => ({
          id: message.id,
          content: message.content,
          // Map MessageDirection.INBOUND to 'customer' and MessageDirection.OUTBOUND to 'user'
          sender: message.direction === "INBOUND" ? "customer" : "user",
          timestamp: message.createdAt,
          agentName: message.metadata?.agentName || undefined,
          metadata: message.metadata, // 🔧 AGGIUNTO! Ora il metadata viene passato correttamente
        }))

        setMessages(transformedMessages)
      } else {
        toast.error("Failed to load chat messages", { duration: 1000 })
      }
    } catch (error) {
      logger.error("Error loading messages:", error)
      toast.error("Failed to load chat messages", { duration: 1000 })
    } finally {
      setLoadingChat(false)
    }
  }

  // Function to fetch customer details
  const fetchCustomerDetails = async (customerId: string) => {
    if (!workspaceId) return

    try {
      const response = await api.get(
        `/workspaces/${workspaceId}/customers/${customerId}`
      )
      const customerData = response.data

      // Update the activeChatbot state based on the customer data
      setActiveChatbot(customerData.activeChatbot !== false) // Default to true if undefined
    } catch (error) {
      logger.error("Error fetching customer details:", error)
    }
  }

  // Function to handle toggling the chatbot
  const handleActiveChatbotToggle = async (checked: boolean) => {
    if (!selectedChat || !workspaceId) return

    // If turning off the chatbot and first time, show confirmation dialog
    if (!checked && !hasToggledChatbot) {
      setShowActiveChatbotDialog(true)
      return
    }

    await updateActiveChatbotStatus(checked)
  }

  // Function to confirm toggling the chatbot
  const handleActiveChatbotConfirm = async () => {
    setHasToggledChatbot(true)
    setShowActiveChatbotDialog(false)
    await updateActiveChatbotStatus(false)
  }

  // Function to update the activeChatbot status in the backend
  const updateActiveChatbotStatus = async (status: boolean) => {
    if (!selectedChat?.customerId || !workspaceId) return

    try {
      setLoading(true)

      // Update the customer in the backend
      const response = await api.put(
        `/workspaces/${workspaceId}/customers/${selectedChat.customerId}`,
        { activeChatbot: status }
      )

      if (response.status === 200) {
        setActiveChatbot(status)
        toast.success(
          `Chatbot ${status ? "enabled" : "disabled"} for ${
            selectedChat.customerName
          }`,
          { duration: 1000 }
        )
      } else {
        toast.error("Failed to update chatbot status", { duration: 1000 })
      }
    } catch (error) {
      logger.error("Error updating chatbot status:", error)
      toast.error("Failed to update chatbot status", { duration: 1000 })
    } finally {
      setLoading(false)
    }
  }

  // Function to select a chat
  const selectChat = (chat: Chat) => {
    setSelectedChat(chat)
    // Update URL to include sessionId - use sessionId or fallback to id
    const sessionIdToUse = chat.sessionId || chat.id
    const newParams = new URLSearchParams(searchParams)
    newParams.set("sessionId", sessionIdToUse)
    // Preserve client search term if present
    if (clientSearchTerm) {
      newParams.set("client", clientSearchTerm)
    } else {
      newParams.delete("client")
    }
    setSearchParams(newParams)

    // Salva la chat selezionata nel localStorage
    localStorage.setItem("selectedChat", JSON.stringify(chat))

    // Reset unread count when selecting a chat
    if (chat.unreadCount > 0) {
      // Update unread count in the local state
      setChats((prevChats) =>
        prevChats.map((c) =>
          (c.sessionId || c.id) === sessionIdToUse
            ? { ...c, unreadCount: 0 }
            : c
        )
      )

      // Call API to mark messages as read
      api
        .post(`/chat/${sessionIdToUse}/read`)
        .then((response) => {
          if (!response.data.success) {
            logger.error("Failed to mark messages as read")
          }
        })
        .catch((err) => {
          logger.error("Error marking messages as read:", err)
        })
    }
  }

  // Handle chat deletion
  const handleDeleteChat = () => {
    if (!selectedChat) return
    setShowDeleteDialog(true)
  }

  // Handle chat deletion confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedChat) return

    // Validate that we have a valid sessionId
    const sessionIdToDelete = selectedChat.sessionId || selectedChat.id
    if (!sessionIdToDelete) {
      logger.error(
        "No valid session ID found for chat deletion:",
        selectedChat
      )
      toast.error("Cannot delete chat: Invalid session ID", { duration: 1000 })
      setShowDeleteDialog(false)
      return
    }

    try {
      setLoading(true)
      logger.info("Deleting chat with sessionId:", sessionIdToDelete)
      const response = await api.delete(`/chat/${sessionIdToDelete}`)

      if (response.data.success) {
        toast.success("Chat deleted successfully", { duration: 1000 })
        // Remove deleted chat from state
        setChats((prev) =>
          prev.filter(
            (chat) => (chat.sessionId || chat.id) !== sessionIdToDelete
          )
        )
        setSelectedChat(null)
        // Remove sessionId from URL
        const newParams = new URLSearchParams(searchParams)
        newParams.delete("sessionId")
        setSearchParams(newParams)
        // Refresh chat list
        refetchChats()
      } else {
        toast.error(
          "Failed to delete chat: " + (response.data.error || "Unknown error"),
          { duration: 1000 }
        )
      }
    } catch (error) {
      logger.error("Error deleting chat:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to delete chat",
        { duration: 1000 }
      )
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
    }
  }

  // Handle customer edit
  const handleEditCustomer = () => {
    if (!selectedChat) return
    setShowEditSheet(true)
  }

  // Handle customer save after edit
  const handleSaveCustomer = async (customerData: any, clientId?: string) => {
    if ((!selectedChat?.customerId && !clientId) || !workspaceId) return

    try {
      setLoading(true)

      // Use clientId if provided, otherwise use selectedChat.customerId
      const customerId = clientId || selectedChat?.customerId

      // Log customerData for debugging
      logger.info("Customer data to save:", customerData)

      // Endpoint for the customer update
      const endpoint = `/workspaces/${workspaceId}/customers/${customerId}`

      // Make API call with PUT method to update customer
      const response = await api.put(endpoint, customerData)

      if (response.status === 200) {
        toast.success("Customer updated successfully", { duration: 1000 })
        setShowEditSheet(false)
        // Update only the selected chat's customer info
        if (selectedChat) {
          const updatedCustomer = response.data
          setSelectedChat({
            ...selectedChat,
            customerName: updatedCustomer.name || selectedChat.customerName,
            customerPhone: updatedCustomer.phone || selectedChat.customerPhone,
            companyName: updatedCustomer.company || selectedChat.companyName,
          })
        }
        // Refresh chat list
        refetchChats()
      } else {
        toast.error(
          "Failed to update customer: " +
            (response.data?.error || "Unknown error"),
          { duration: 1000 }
        )
      }
    } catch (error) {
      logger.error("Error updating customer:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to update customer",
        { duration: 1000 }
      )
    } finally {
      setLoading(false)
    }
  }

  // Show orders dialog
  const handleViewOrders = () => {
    if (!selectedChat?.customerName) return
                navigate(`/admin/orders?search=${encodeURIComponent(selectedChat.customerName)}`)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) {
      return "Data non disponibile"
    }

    try {
      const date = new Date(dateString)

      if (isNaN(date.getTime())) {
        return "Data non valida"
      }

      return date.toLocaleString("it-IT", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return "Errore nella formattazione data"
    }
  }

  // Handle submitting a new message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    logger.info("🟦 HandleSubmit called", {
      messageInput: messageInput.trim(),
      selectedChat: selectedChat?.id,
      loading,
      workspace: workspace?.id,
    })

    if (!messageInput.trim() || !selectedChat || loading) {
      logger.info("❌ Early return - validation failed", {
        hasMessage: !!messageInput.trim(),
        hasSelectedChat: !!selectedChat,
        notLoading: !loading,
      })
      return
    }

    if (!workspace?.id) {
      logger.error("❌ No workspace ID available!")
      toast.error("No workspace selected", { duration: 1000 })
      return
    }

    // Disable chatbot automatically when agent takes control by typing
    if (activeChatbot) {
      // Only show the dialog if it hasn't been shown before
      if (!hasToggledChatbot) {
        setShowActiveChatbotDialog(true)
      } else {
        // Otherwise just update the status directly
        await updateActiveChatbotStatus(false)
      }
    }

    try {
      setLoading(true)

      // For operator messages, don't add temporary message to avoid duplication
      // We'll add the message only when we get the response from the server
      let tempMessage: Message | null = null

      if (activeChatbot) {
        // Only add temp message if chatbot is active (AI responses)
        tempMessage = {
          id: `temp-${Date.now()}`,
          content: messageInput,
          sender: "user",
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, tempMessage])
      }

      setMessageInput("") // Clear input field

      // Send message to API
      const sessionIdToUse = selectedChat.sessionId || selectedChat.id

      // Debug workspace and sessionStorage
      logger.info(`🔍 Debug workspace info:`, {
        workspace: workspace,
        workspaceId: workspace?.id,
        sessionStorageWorkspace: sessionStorage.getItem("currentWorkspace"),
        sessionId: sessionIdToUse,
      })

      // Verify headers manually
      const headers = {
        "Content-Type": "application/json",
        "x-workspace-id": workspace?.id,
      }

      logger.info(
        `🚀 About to send POST request to /chat/${sessionIdToUse}/send`,
        {
          content: messageInput,
          sender: "user",
          sessionIdToUse,
          workspaceId: workspace?.id,
          url: `/chat/${sessionIdToUse}/send`,
          method: "POST",
          headers,
        }
      )

      let response
      try {
        response = await api.post(
          `/chat/${sessionIdToUse}/send`,
          {
            content: messageInput,
            sender: "user",
          },
          {
            headers: headers,
          }
        )
        logger.info(`✅ POST request successful`, response)
      } catch (requestError) {
        logger.error(`❌ POST request failed`, {
          error: requestError,
          message: requestError?.message,
          response: requestError?.response,
          status: requestError?.response?.status,
          config: requestError?.config,
          requestHeaders: requestError?.config?.headers,
        })
        throw requestError // Re-throw to be caught by outer catch
      }

      if (!response.data.success) {
        toast.error("Failed to send message", { duration: 1000 })
        // Remove the temporary message only if it exists
        if (tempMessage) {
          setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id))
        }
      } else {
        // Handle response differently based on whether we have a temp message or not
        const responseMessages = Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data]

        const transformedMessages = responseMessages.map((message: any) => ({
          id: message.id,
          content: message.content,
          sender: message.direction === "INBOUND" ? "customer" : "user",
          timestamp: message.createdAt || new Date().toISOString(),
          agentName: message.metadata?.agentName,
          metadata: message.metadata, // Include full metadata for operator messages
        }))

        if (tempMessage) {
          // Replace temp message with actual message from server (AI responses)
          setMessages((prev) =>
            prev
              .filter((msg) => msg.id !== tempMessage.id)
              .concat(transformedMessages)
          )
        } else {
          // Just add the operator message directly (manual operator mode)
          setMessages((prev) => [...prev, ...transformedMessages])
        }

        // Update chat list to reflect new message
        refetchChats()
      }
    } catch (error) {
      logger.error("❌ Error sending message:", error)
      logger.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        config: error?.config,
      })
      toast.error("Failed to send message", { duration: 1000 })
    } finally {
      setLoading(false)
    }
  }

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle blocking/unblocking a user
  const handleBlockUser = async () => {
    if (!selectedChat || !workspaceId) return

    const isCurrentlyBlocked = selectedChat.isBlacklisted
    const action = isCurrentlyBlocked ? "unblock" : "block"

    setIsBlocking(true)
    try {
      const response = await api.post(
        `/workspaces/${workspaceId}/customers/${selectedChat.customerId}/${action}`
      )

      if (response.status === 200) {
        // Update the chat in the list with new blocked status
        setChats((prev) =>
          prev.map((chat) =>
            chat.customerId === selectedChat.customerId
              ? { ...chat, isBlacklisted: !isCurrentlyBlocked }
              : chat
          )
        )

        // Update selected chat
        setSelectedChat((prev) =>
          prev ? { ...prev, isBlacklisted: !isCurrentlyBlocked } : null
        )

        toast.success(
          `${selectedChat.customerName} has been ${isCurrentlyBlocked ? "unblocked" : "blocked"}`,
          {
            duration: 1000,
          }
        )
      }
    } catch (error) {
      logger.error(`Error ${action}ing user:`, error)
      toast.error(`Failed to ${action} user`, { duration: 1000 })
    } finally {
      setIsBlocking(false)
      setShowBlockDialog(false)
    }
  }

  return (
    <PageLayout selectedChat={selectedChat}>
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
        {/* Chat List */}
        <Card className="col-span-4 p-4 overflow-hidden flex flex-col">
          <div className="mb-4">
            <Input
              type="search"
              placeholder="Search chats..."
              value={clientSearchTerm}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams)
                if (e.target.value) {
                  newParams.set("client", e.target.value)
                } else {
                  newParams.delete("client")
                }
                // Keep sessionId if present
                if (sessionId) {
                  newParams.set("sessionId", sessionId)
                }
                setSearchParams(newParams)
                setClientSearchTerm(e.target.value)
              }}
              className="w-full"
            />
          </div>

          <div className="overflow-y-auto flex-1">
            {chats.length > 0 ? (
              chats.map((chat: Chat) => {
                // Compare sessionId instead of id
                const isSelected = selectedChat?.sessionId === chat.sessionId

                return (
                  <div
                    key={chat.id}
                    className={`p-4 cursor-pointer rounded-lg mb-2 transition-all
                      ${
                        isSelected
                          ? "border-l-4 border-green-600 bg-green-50 text-green-800 font-bold"
                          : "border-l-0 bg-white text-gray-900"
                      }
                      ${!isSelected ? "hover:bg-gray-50" : ""}
                      ${
                        loadingChat && isSelected
                          ? "opacity-70 pointer-events-none"
                          : ""
                      }`}
                    onClick={() => selectChat(chat)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm flex items-center gap-1">
                          <span className="text-lg" title={`Language: ${chat.customerLanguage || 'Unknown'}`}>
                            {getLanguageFlag(chat.customerLanguage)}
                          </span>
                          {chat.customerName}{" "}
                          {chat.companyName ? `(${chat.companyName})` : ""}
                          {/* Blocked user indicator */}
                          {chat.isBlacklisted && (
                            <span title="Customer is blocked">
                              <Lock className="h-4 w-4 text-red-500" />
                            </span>
                          )}
                          {/* Manual operator icon if chatbot is disabled */}
                          {chat.activeChatbot === false && (
                            <span title="Manual Operator Control">
                              <Bot className="h-4 w-4 text-orange-500" />
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-green-600">
                          {chat.customerPhone}
                        </p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 whitespace-pre-line overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {chat.lastMessage}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDate(chat.lastMessageTime)}
                    </p>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-4 text-gray-500">
                {isLoadingChats ? "Loading chats..." : "No chats found"}
              </div>
            )}
          </div>
        </Card>

        <Card className="col-span-8 p-4 flex flex-col">
          {selectedChat ? (
            <>
              {/* 🚨 OPERATOR CONTROL BANNER */}
              {!activeChatbot && (
                <div className="bg-orange-100 border-l-4 border-orange-500 p-3 mb-2">
                  <div className="flex items-center">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Bot className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-orange-700 font-medium">
                          👨‍💼 <strong>Manual Operator Control Active</strong>
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          AI chatbot is disabled. You are now manually handling
                          this conversation.
                          <span className="font-medium">
                            {" "}
                            Customer messages will be saved but won't trigger AI
                            responses.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 🚫 CUSTOMER BLOCKED BANNER */}
              {selectedChat.isBlacklisted && (
                <div className="bg-red-100 border-l-4 border-red-500 p-3 mb-2">
                  <div className="flex items-center">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Ban className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700 font-medium">
                          🚫 <strong>Customer is Blocked</strong>
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          This customer has been blacklisted. New messages are
                          blocked.
                          <span className="font-medium">
                            {" "}
                            You can view existing messages but cannot send new
                            ones.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Header */}
              <div className="flex justify-between items-center pb-2 border-b h-[60px]">
                <div>
                  <div
                    className="flex items-center cursor-pointer group"
                    onClick={handleEditCustomer}
                  >
                    <h2 className="font-bold text-sm group-hover:text-green-600 transition-colors">
                      {selectedChat.customerName}{" "}
                      {selectedChat.companyName
                        ? `(${selectedChat.companyName})`
                        : ""}
                    </h2>
                    <Pencil className="h-3 w-3 ml-1 text-green-600 group-hover:text-green-700 transition-colors" />
                  </div>
                  <p className="text-xs text-gray-500">
                    {selectedChat.customerPhone}
                  </p>
                </div>
                <div className="flex space-x-2 items-center">
                  {/* ChatBot Toggle */}
                  <div className="flex items-center mr-2">
                    <Bot
                      className={`h-4 w-4 mr-1 ${
                        activeChatbot ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                    <Switch
                      className="mr-1"
                      checked={activeChatbot}
                      onCheckedChange={handleActiveChatbotToggle}
                      title={
                        activeChatbot ? "Disable chatbot" : "Enable chatbot"
                      }
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewOrders}
                    className="hover:bg-blue-50 h-7 px-2 py-0"
                    title="View Customer Orders"
                  >
                    <ShoppingBag className="h-3 w-3 text-blue-600 mr-1" />
                    <span className="text-blue-600 text-xs">View orders</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBlockDialog(true)}
                    className={
                      selectedChat?.isBlacklisted
                        ? "hover:bg-green-50 h-7 px-2 py-0"
                        : "hover:bg-orange-50 h-7 px-2 py-0"
                    }
                    title={
                      selectedChat?.isBlacklisted
                        ? "Unblock User"
                        : "Block User"
                    }
                  >
                    {selectedChat?.isBlacklisted ? (
                      <>
                        <Lock className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-600 text-xs">
                          Unblock user
                        </span>
                      </>
                    ) : (
                      <>
                        <Ban className="h-3 w-3 text-orange-600 mr-1" />
                        <span className="text-orange-600 text-xs">
                          Block user
                        </span>
                      </>
                    )}
                  </Button>
                  <Button
                    id="delete-chat-button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteChat}
                    className="hover:bg-red-50 h-7 px-2 py-0"
                  >
                    <Trash2 className="h-3 w-3 text-red-600 mr-1" />
                    <span className="text-red-600 text-xs">Delete</span>
                  </Button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-2">
                {messages.length > 0 ? (
                  messages.map((message) => {
                    // Using the sender field which is properly mapped from direction
                    const isAgentMessage = message.sender === "user"
                    const isCustomerMessage = message.sender === "customer"

                    // 🚨 ANDREA'S OPERATOR CONTROL INDICATORS
                    // Correct logic:
                    const isChatbotMessage =
                      isAgentMessage &&
                      (message.metadata?.agentSelected?.startsWith(
                        "CHATBOT_"
                      ) ||
                        message.metadata?.agentSelected === "LLM" ||
                        message.metadata?.agentSelected === "AI" ||
                        message.metadata?.agentSelected === "AI_AGENT")

                    // Only EXPLICIT operator messages should be blue
                    const isOperatorMessage =
                      isAgentMessage &&
                      (message.metadata?.agentSelected === "MANUAL_OPERATOR" ||
                        message.metadata?.isOperatorMessage === true ||
                        message.metadata?.sentBy === "HUMAN_OPERATOR")

                    // Debug logging for operator messages
                    if (
                      isAgentMessage &&
                      message.metadata?.agentSelected === "MANUAL_OPERATOR"
                    ) {
                      logger.info("🔍 MANUAL_OPERATOR message detected:", {
                        content: message.content.substring(0, 30) + "...",
                        isOperatorMessage,
                        isChatbotMessage,
                        agentSelected: message.metadata?.agentSelected,
                        metadata: message.metadata,
                      })
                    }

                    // Debug log for non-chatbot messages
                    if (
                      isAgentMessage &&
                      !isChatbotMessage &&
                      !isOperatorMessage
                    ) {
                      logger.info("🔍 Non-chatbot, non-operator message:", {
                        content: message.content.substring(0, 50) + "...",
                        agentSelected: message.metadata?.agentSelected,
                        isOperatorMessage: message.metadata?.isOperatorMessage,
                        sentBy: message.metadata?.sentBy,
                        metadata: message.metadata,
                      })
                    }

                    const isOperatorControl =
                      message.metadata?.isOperatorControl === true
                    const isManualOperator =
                      message.metadata?.agentSelected === "MANUAL_OPERATOR" ||
                      message.metadata?.agentSelected ===
                        "MANUAL_OPERATOR_CONTROL" ||
                      message.metadata?.sentBy === "HUMAN_OPERATOR"

                    const getMessageStyle = () => {
                      // LOG DI DEBUG PER VEDERE I VALORI ESATTI
                      logger.info("🎨 DEBUG MESSAGGIO:", {
                        id: message.id,
                        content: message.content.substring(0, 30),
                        agentSelected: message.metadata?.agentSelected,
                        agentName: message.agentName,
                        isAgentMessage,
                        fullMetadata: message.metadata,
                      })

                      if (!isAgentMessage) {
                        return isOperatorControl
                          ? "bg-orange-50 text-orange-900 border-l-4 border-orange-400" // Customer under control
                          : "bg-gray-100 text-gray-800" // Normal customer
                      }

                      // SE C'È IL BADGE CHATBOT → VERDE (controllo anche agentName)
                      if (
                        message.metadata?.agentSelected === "CHATBOT" ||
                        message.metadata?.agentSelected?.startsWith(
                          "CHATBOT_"
                        ) ||
                        message.metadata?.agentSelected === "AI" ||
                        message.metadata?.agentSelected === "LLM" ||
                        message.agentName
                      ) {
                        // Se ha agentName è un chatbot!
                        return "bg-green-100 text-green-900 border-l-4 border-green-500" // CHATBOT → VERDE
                      }

                      if (
                        message.metadata?.agentSelected === "MANUAL_OPERATOR"
                      ) {
                        return "bg-blue-100 text-blue-900 border-l-4 border-blue-500" // MANUAL_OPERATOR → BLU
                      }

                      // Default fallback
                      return "bg-gray-100 text-gray-800"
                    }

                    return (
                      <div
                        key={message.id}
                        className={`flex mb-4 ${
                          isAgentMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg max-w-[75%] relative ${getMessageStyle()}`}
                        >
                          {/* 🚨 OPERATOR CONTROL BADGE */}
                          {(isOperatorMessage ||
                            isOperatorControl ||
                            isManualOperator) && (
                            <div className="absolute -top-2 -right-2">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium ${
                                  isOperatorMessage
                                    ? "bg-blue-500 text-white"
                                    : "bg-orange-500 text-white"
                                }`}
                              >
                                👨‍💼 {isOperatorMessage ? "OPERATOR" : "MANUAL"}
                              </span>
                            </div>
                          )}

                          <div className="text-sm break-words">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({ node, ...props }) => (
                                  <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                    {...props}
                                  />
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>

                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] opacity-70">
                              {formatDate(message.timestamp)}
                            </span>

                            <div className="flex items-center gap-1">
                              {/* 🤖 AI Agent Badge */}
                              {isAgentMessage &&
                                message.agentName &&
                                !isOperatorMessage && (
                                  <span className="text-[10px] font-medium bg-green-200 text-green-800 px-2 py-0.5 rounded ml-2">
                                    🤖 {message.agentName}
                                  </span>
                                )}

                              {/* 👨‍💼 Operator Badge */}
                              {isOperatorMessage && (
                                <span className="text-[10px] font-medium bg-blue-200 text-blue-800 px-2 py-0.5 rounded ml-2">
                                  👨‍💼 Human Operator
                                </span>
                              )}

                              {/* 📋 Manual Control Badge */}
                              {isOperatorControl && (
                                <span className="text-[10px] font-medium bg-orange-200 text-orange-800 px-2 py-0.5 rounded ml-2">
                                  📋 Under Manual Control
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    {loadingChat ? "Loading messages..." : "No messages yet"}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input: Only show if chatbot is disabled */}
              {!activeChatbot && (
                <div className="mt-2 flex gap-2">
                  <Textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={
                      selectedChat?.isBlacklisted
                        ? "Cannot send messages to blocked customer"
                        : "Type your message..."
                    }
                    className="min-h-[40px] resize-none text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(e)
                      }
                    }}
                    disabled={loading || selectedChat?.isBlacklisted}
                  />
                  <Button
                    onClick={(e) => handleSubmit(e)}
                    className="self-end h-8 w-8 p-0"
                    size="sm"
                    disabled={loading || selectedChat?.isBlacklisted}
                  >
                    {loading ? (
                      <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-gray-500">
              {isLoadingChats ? "Loading chats..." : "No chats found"}
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Chat"
        description={`Are you sure you want to delete the chat with ${selectedChat?.customerName}? This action cannot be undone and all messages will be lost.`}
        onConfirm={handleDeleteConfirm}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
      />

      {/* Active Chatbot Confirmation Dialog */}
      <ConfirmDialog
        open={showActiveChatbotDialog}
        onOpenChange={setShowActiveChatbotDialog}
        title="Disable Chatbot"
        description={`Are you sure you want to disable the chatbot for ${selectedChat?.customerName}? You will need to manually respond to their messages. You can re-enable it later.`}
        onConfirm={handleActiveChatbotConfirm}
        confirmLabel="Disable"
        cancelLabel="Cancel"
        variant="destructive"
      />

      {/* Block User Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedChat?.isBlacklisted ? "Unblock User" : "Block User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedChat?.isBlacklisted
                ? `Are you sure you want to unblock ${selectedChat?.customerName}? They will be able to send messages to your chatbot again.`
                : `Are you sure you want to block ${selectedChat?.customerName}? They will no longer be able to send messages to your chatbot.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockUser}
              disabled={isBlocking}
              className={
                selectedChat?.isBlacklisted
                  ? "bg-green-600 hover:bg-green-700 focus:ring-green-600"
                  : "bg-red-600 hover:bg-red-700 focus:ring-red-600"
              }
            >
              {isBlocking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {selectedChat?.isBlacklisted
                    ? "Unblocking..."
                    : "Blocking..."}
                </>
              ) : selectedChat?.isBlacklisted ? (
                "Unblock"
              ) : (
                "Block"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Orders Dialog */}
      <AlertDialog open={showOrdersDialog} onOpenChange={setShowOrdersDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>View Customer Orders</AlertDialogTitle>
            <AlertDialogDescription>
              This functionality is currently under development and will be
              available soon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction key="orders-dialog-action">OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Customer Edit Sheet */}
      <ClientSheet
        client={selectedChat ? selectedChat.customerId : null}
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        onSubmit={handleSaveCustomer}
        mode="edit"
        availableLanguages={
          Array.isArray(availableLanguages)
            ? availableLanguages.map((lang) => lang.name || "")
            : []
        }
      />
      {/* WhatsApp Floating Button - stile OlaClick, solo su /chat */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handlePlaygroundClick}
          className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 h-16 w-16 p-0 flex items-center justify-center group relative"
          title="Chat WhatsApp"
        >
          <WhatsAppIcon className="h-8 w-8 text-white transition-transform group-hover:scale-110" />
          <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></div>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Chatta con noi su WhatsApp
          </div>
        </Button>
      </div>
      <WhatsAppChatModal
        isOpen={showPlaygroundDialog}
        onClose={handleClosePlayground}
        channelName="WhatsApp Chat"
        workspaceId={workspace?.id}
        selectedChat={selectedChat}
      />
    </PageLayout>
  )
}
