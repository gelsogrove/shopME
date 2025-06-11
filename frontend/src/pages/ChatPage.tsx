import { PageLayout } from "@/components/layout/PageLayout"
import { ClientSheet } from "@/components/shared/ClientSheet"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useWorkspace } from "@/hooks/use-workspace"
import { useRecentChats } from "@/hooks/useRecentChats"
import { api } from "@/services/api"
import { getLanguages, Language } from "@/services/workspaceApi"
import { useQuery } from "@tanstack/react-query"
import { Ban, Bot, Loader2, Pencil, Send, ShoppingBag, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import { useNavigate, useSearchParams } from "react-router-dom"
import remarkGfm from "remark-gfm"
import { toast } from "sonner"
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

export function ChatPage() {
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

  // Select first chat when chats are loaded and no chat is selected,
  // or select the chat matching the client filter if present
  useEffect(() => {
    if (chats.length > 0 && (!selectedChat || clientSearchTerm)) {
      // If we have a sessionId, find that specific chat
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

      // As a fallback, select the first chat
      if (!selectedChat) {
        selectChat(chats[0])
      }
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
    console.log("Available languages in ChatPage:", availableLanguages)
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
      const response = await api.get(`/chat/${chat.sessionId}/messages`)
      if (response.data.success) {
        // Transform backend messages to frontend format
        const transformedMessages = response.data.data.map((message: any) => ({
          id: message.id,
          content: message.content,
          // Map MessageDirection.INBOUND to 'customer' and MessageDirection.OUTBOUND to 'user'
          sender: message.direction === "INBOUND" ? "customer" : "user",
          timestamp: message.createdAt,
          agentName: message.metadata?.agentName || undefined,
        }))

        setMessages(transformedMessages)
      } else {
        toast.error("Failed to load chat messages", { duration: 1000 })
      }
    } catch (error) {
      console.error("Error loading messages:", error)
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
      console.error("Error fetching customer details:", error)
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
          `Chatbot ${status ? "enabled" : "disabled"} for ${selectedChat.customerName}`,
          { duration: 1000 }
        )
      } else {
        toast.error("Failed to update chatbot status", { duration: 1000 })
      }
    } catch (error) {
      console.error("Error updating chatbot status:", error)
      toast.error("Failed to update chatbot status", { duration: 1000 })
    } finally {
      setLoading(false)
    }
  }

  // Function to select a chat
  const selectChat = (chat: Chat) => {
    setSelectedChat(chat)
    // Update URL to include sessionId
    const newParams = new URLSearchParams(searchParams)
    newParams.set("sessionId", chat.sessionId)
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
          c.sessionId === chat.sessionId ? { ...c, unreadCount: 0 } : c
        )
      )

      // Call API to mark messages as read
      api
        .post(`/chat/${chat.sessionId}/read`)
        .then((response) => {
          if (!response.data.success) {
            console.error("Failed to mark messages as read")
          }
        })
        .catch((err) => {
          console.error("Error marking messages as read:", err)
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

    try {
      setLoading(true)
      const response = await api.delete(`/chat/${selectedChat.sessionId}`)

      if (response.data.success) {
        toast.success("Chat deleted successfully", { duration: 1000 })
        // Remove deleted chat from state
        setChats((prev) =>
          prev.filter((chat) => chat.sessionId !== selectedChat.sessionId)
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
      console.error("Error deleting chat:", error)
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
      console.log("Customer data to save:", customerData)

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
      console.error("Error updating customer:", error)
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
    setShowOrdersDialog(true)
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
    if (!messageInput.trim() || !selectedChat || loading) return

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

      // Add message to UI immediately for better UX
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        content: messageInput,
        sender: "user", // This is an agent (user) message
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, tempMessage])
      setMessageInput("") // Clear input field

      // Send message to API
      const response = await api.post(`/chat/${selectedChat.sessionId}/send`, {
        content: messageInput,
        sender: "user",
      })

      if (!response.data.success) {
        toast.error("Failed to send message", { duration: 1000 })
        // Remove the temporary message
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id))
      } else {
        // Replace temp message with actual message from server, making sure to transform it
        const responseMessages = Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data]

        const transformedMessages = responseMessages.map((message: any) => ({
          id: message.id,
          content: message.content,
          sender: message.direction === "INBOUND" ? "customer" : "user",
          timestamp: message.createdAt || new Date().toISOString(),
          agentName: message.metadata?.agentName,
        }))

        // Remove temp message and add transformed ones
        setMessages((prev) =>
          prev
            .filter((msg) => msg.id !== tempMessage.id)
            .concat(transformedMessages)
        )

        // Update chat list to reflect new message
        refetchChats()
      }
    } catch (error) {
      console.error("Error sending message:", error)
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

  // Handle blocking a user
  const handleBlockUser = async () => {
    if (!selectedChat || !workspaceId) return

    setIsBlocking(true)
    try {
      const blockResponse = await api.post(`/workspaces/${workspaceId}/customers/${selectedChat.customerId}/block`)
      
      if (blockResponse.status === 200) {
        // Remove the chat from the list
        setChats((prev) => prev.filter(chat => chat.customerId !== selectedChat.customerId))
        setSelectedChat(null)
        toast.success(`${selectedChat.customerName} has been blocked`, { duration: 1000 })
      }
    } catch (error) {
      console.error("Error blocking user:", error)
      toast.error("Failed to block user", { duration: 1000 })
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
                        <h3 className="font-medium text-sm">
                          {chat.customerName}{" "}
                          {chat.companyName ? `(${chat.companyName})` : ""}
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
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {chat.lastMessage}
                    </p>
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
                    className="hover:bg-orange-50 h-7 px-2 py-0"
                    title="Block User"
                  >
                    <Ban className="h-3 w-3 text-orange-600 mr-1" />
                    <span className="text-orange-600 text-xs">Block user</span>
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

                    return (
                      <div
                        key={message.id}
                        className={`flex mb-4 ${
                          isAgentMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg max-w-[75%] ${
                            isAgentMessage
                              ? "bg-green-100 text-green-900"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
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
                            {isAgentMessage && message.agentName && (
                              <span className="text-[10px] font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded ml-2">
                                {message.agentName}
                              </span>
                            )}
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

              {/* Message Input */}
              <div className="mt-2 flex gap-2">
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[40px] resize-none text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  disabled={loading}
                />
                <Button
                  onClick={(e) => handleSubmit(e)}
                  className="self-end h-8 w-8 p-0"
                  size="sm"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
              </div>
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
            <AlertDialogTitle>Block User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block {selectedChat?.customerName}? They will no longer be able to send messages to your chatbot, and their chat will be removed from your chat history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBlockUser}
              disabled={isBlocking}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isBlocking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Blocking...
                </>
              ) : (
                "Block User"
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
    </PageLayout>
  )
}
