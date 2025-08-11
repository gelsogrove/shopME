import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { getWorkspaceId } from "@/config/workspace.config"
import { api } from "@/services/api"
import axios from "axios"
import { MessageCircle, Send, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// Define a global variable to store the current session ID
// This will persist across modal closes/opens but not page refreshes
let globalSessionId: string | null = null

interface Message {
  id: string
  content: string
  sender: "user" | "customer"
  timestamp: Date
}

// Interface for selected chat from chat history
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

interface WhatsAppChatModalProps {
  isOpen: boolean
  onClose: () => void
  channelName?: string
  phoneNumber?: string
  workspaceId?: string
  selectedChat?: Chat | null
}

export function WhatsAppChatModal({
  isOpen,
  onClose,
  channelName = "L'Altra Italia",
  phoneNumber = "",
  workspaceId = "",
  selectedChat,
}: WhatsAppChatModalProps) {
  const [userPhoneNumber, setUserPhoneNumber] = useState("")
  const [chatStarted, setChatStarted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [initialMessage, setInitialMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [localSelectedChat, setLocalSelectedChat] = useState<Chat | null>(null)
  // Use the global session ID if available
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Check if we have a valid workspace ID
  const currentWorkspaceId = getWorkspaceId(workspaceId)
  const hasValidWorkspace = currentWorkspaceId !== null

  console.log("WhatsAppChatModal props:", {
    isOpen,
    channelName,
    phoneNumber,
    workspaceId,
    selectedChat,
  })

  console.log("Workspace check:", {
    currentWorkspaceId,
    hasValidWorkspace,
    providedWorkspaceId: workspaceId,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastSendRef = useRef<number>(0) // Track last sendMessage call

  // Load chat from props or localStorage when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Priority 1: Use the chat passed from props if available
      if (selectedChat) {
        console.log("Using selectedChat from props:", selectedChat)
        setLocalSelectedChat(selectedChat)

        // If the selectedChat has a sessionId, use it
        if (selectedChat.sessionId) {
          setSessionId(selectedChat.sessionId)
          globalSessionId = selectedChat.sessionId
        }

        // Store in localStorage as backup
        localStorage.setItem("selectedChat", JSON.stringify(selectedChat))
        return
      }

      // Priority 2: Try to retrieve the chat from localStorage
      try {
        const savedChatJson = localStorage.getItem("selectedChat")
        if (savedChatJson) {
          const savedChat = JSON.parse(savedChatJson) as Chat
          console.log("Using selectedChat from localStorage:", savedChat)
          setLocalSelectedChat(savedChat)

          // If the savedChat has a sessionId, use it
          if (savedChat.sessionId) {
            setSessionId(savedChat.sessionId)
            globalSessionId = savedChat.sessionId
          }

          return
        }
      } catch (error) {
        console.error("Error reading selectedChat from localStorage:", error)
      }

      // If the sessionId was set but not the chat, try to use that
      if (globalSessionId) {
        console.log("Using previously stored sessionId:", globalSessionId)
        setSessionId(globalSessionId)
      }
    }
  }, [isOpen, selectedChat])

  // Initialize chat when a local selected chat is available
  useEffect(() => {
    if (isOpen && localSelectedChat) {
      console.log("Initializing chat with chat:", localSelectedChat)
      setUserPhoneNumber(localSelectedChat.customerPhone)
      setChatStarted(true)
      fetchMessagesForSelectedChat(localSelectedChat)
    }
  }, [isOpen, localSelectedChat])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      console.log("Modal closed, resetting component state")
      setTimeout(() => {
        // Reset solo gli stati necessari, mantenendo la conversazione
        setIsLoading(false)
        setCurrentMessage("")

        // NON resettare questi per mantenere il contesto della conversazione
        // setChatStarted(false)
        // setMessages([])
        // setLocalSelectedChat(null)
      }, 300)
    } else if (isOpen && !localSelectedChat && !selectedChat) {
      // Handle case where modal opens without a selected chat
      console.log("Modal opened without any chat")
      setUserPhoneNumber(phoneNumber || "")
      // Focus input field when chat opens without selected chat
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    }
  }, [isOpen, phoneNumber, localSelectedChat, selectedChat])

  // Fetch messages for the selected chat
  const fetchMessagesForSelectedChat = async (chat: Chat) => {
    if (!chat || !chat.sessionId) {
      console.error(
        "No chat or sessionId provided to fetchMessagesForSelectedChat"
      )
      return
    }

    // Get workspaceId for API call
    const currentWorkspaceId = getWorkspaceId(workspaceId)
    if (!currentWorkspaceId) {
      console.error("No workspace ID available for fetching messages")
      return
    }

    console.log("Fetching messages for chat:", chat.sessionId)
    setIsLoading(true)
    try {
      const response = await api.get(`/chat/${chat.sessionId}/messages`)
      console.log("API response for messages:", response.data)

      if (response.data.success) {
        // Transform backend messages to frontend format for the playground
        const chatMessages = response.data.data.map((message: any) => ({
          id: message.id,
          content: message.content,
          // Map MessageDirection.INBOUND to 'customer' and MessageDirection.OUTBOUND to 'user' (like main chat)
          sender: message.direction === "INBOUND" ? "customer" : "user",
          timestamp: new Date(message.createdAt),
        }))

        console.log(
          `Loaded ${chatMessages.length} messages for chat:`,
          chat.sessionId
        )
        setMessages(chatMessages)
      }
    } catch (error) {
      console.error("Error loading messages for selected chat:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading])

  // Get initials from channel name
  const getInitials = (name: string) => {
    if (!name) return ""
    const words = name.split(" ")
    if (words.length === 1) return name.substring(0, 2).toUpperCase()
    return (words[0][0] + words[1][0]).toUpperCase()
  }

  // Validate phone number - at least 10 digits
  const isValidPhoneNumber = (number: string) => {
    return /^\+?[\d\s]{10,}$/.test(number.trim())
  }

  // Format WhatsApp message for display - handles asterisks as bold
  const formatWhatsAppMessage = (text: string) => {
    // Replace single asterisks with <strong> tags for bold text
    let formattedText = text.replace(/\*(.*?)\*/g, "<strong>$1</strong>")

    // Replace underscores with <em> tags for italic text
    formattedText = formattedText.replace(/_(.*?)_/g, "<em>$1</em>")

    // Convert line breaks to <br> tags
    formattedText = formattedText.replace(/\n/g, "<br />")

    return formattedText
  }

  const startChat = async () => {
    if (!isValidPhoneNumber(userPhoneNumber)) return
    if (!initialMessage.trim()) return

    // Check if we have a valid workspace
    if (!hasValidWorkspace) {
      alert("No workspace available. Please select a workspace first.")
      return
    }

    setChatStarted(true)

    // Add the initial message
    const userMessage: Message = {
      id: (Date.now() + 100).toString(),
      content: initialMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages([userMessage])
    setInitialMessage("")
    setIsLoading(true)

    try {
      // Call the API to process the initial message
      const apiUrl = `${
        import.meta.env.VITE_API_URL || "http://localhost:3001"
      }/api/messages`

      // Use provided workspaceId or get from config
      const currentWorkspaceId = getWorkspaceId(workspaceId)

      // Include isNewConversation flag for new chats
      const response = await axios.post(apiUrl, {
        message: userMessage.content,
        phoneNumber: userPhoneNumber,
        workspaceId: currentWorkspaceId,
        isNewConversation: true, // Add flag to indicate new conversation
      })

      if (response.data.success) {
        // Save sessionId if provided in the response
        if (response.data.data.sessionId) {
          console.log("Setting new session ID:", response.data.data.sessionId)
          setSessionId(response.data.data.sessionId)

          // Update our global variable to persist across modal closings
          globalSessionId = response.data.data.sessionId

          // Create or update the local selected chat
          const newChat: Chat = {
            id: response.data.data.sessionId,
            sessionId: response.data.data.sessionId,
            customerId: response.data.data.customerId || "unknown",
            customerName: "Customer",
            customerPhone: userPhoneNumber,
            lastMessage: initialMessage,
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            isActive: true,
            isFavorite: false,
          }

          setLocalSelectedChat(newChat)
          localStorage.setItem("selectedChat", JSON.stringify(newChat))
        }

        // Create the bot message from the API response
        const botMessage: Message = {
          id: (Date.now() + 200).toString(),
          content: response.data.data.processedMessage,
          sender: "user",
          timestamp: new Date(),
        }

        // Add ONLY the bot response to chat history, not the user's message again
        // This prevents the duplicate "Ciao" message
        setMessages([userMessage, botMessage]) // Include both user message and bot response
      } else {
        // Handle API error response
        console.error("API Error:", response.data.error)

        // Add an error message to the chat
        const errorMessage: Message = {
          id: (Date.now() + 200).toString(),
          content:
            "Sorry, there was an error processing your message. Please try again later.",
          sender: "user",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Error calling message API:", error)

      // Add an error message to the chat in case of exception
      const errorMessage: Message = {
        id: (Date.now() + 200).toString(),
        content:
          "Sorry, there was an error processing your message. Please try again later.",
        sender: "user",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      // Always set loading state to false, regardless of success or failure
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    console.log("🚀 FRONTEND DEBUG: sendMessage called with:", currentMessage)

    if (!currentMessage.trim() || isLoading) {
      console.log(
        "❌ FRONTEND DEBUG: sendMessage blocked - empty message or loading"
      )
      return
    }

    // Prevent double execution with simple debounce
    const now = Date.now()
    const lastCall = lastSendRef.current
    if (now - lastCall < 10000) {
      // 10 second debounce for testing
      console.log(
        "❌ FRONTEND DEBUG: sendMessage blocked - too soon after last call"
      )
      return
    }
    lastSendRef.current = now

    // Check if we have a valid workspace
    if (!hasValidWorkspace) {
      alert("No workspace available. Please select a workspace first.")
      return
    }

    console.log(
      "✅ FRONTEND DEBUG: sendMessage proceeding with message:",
      currentMessage
    )

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: "customer",
      timestamp: new Date(),
    }

    // Save the message to display immediately
    setMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsLoading(true)

    try {
      // Call the API to process the message
      const apiUrl = `${
        import.meta.env.VITE_API_URL || "http://localhost:3001"
      }/api/messages`

      // Use provided workspaceId or get from config
      const currentWorkspaceId = getWorkspaceId(workspaceId)

      console.log("🔄 FRONTEND DEBUG: Making API call to:", apiUrl)
      const response = await axios.post(apiUrl, {
        message: userMessage.content,
        phoneNumber: userPhoneNumber,
        workspaceId: currentWorkspaceId,
        sessionId: sessionId, // Include the sessionId in the request
      })
      console.log("📥 FRONTEND DEBUG: API response received:", response.data)

      if (response.data.success) {
        // Update sessionId if provided in the response and not yet set
        if (response.data.data.sessionId && !sessionId) {
          console.log("Updating sessionId:", response.data.data.sessionId)
          setSessionId(response.data.data.sessionId)

          // Update our global variable to persist across modal closings
          globalSessionId = response.data.data.sessionId

          // Update localStorage with new sessionId
          if (localSelectedChat) {
            const updatedChat = {
              ...localSelectedChat,
              sessionId: response.data.data.sessionId,
            }
            localStorage.setItem("selectedChat", JSON.stringify(updatedChat))
            setLocalSelectedChat(updatedChat)
          }
        }

        // Se la risposta è vuota, non aggiungere nessun messaggio dal bot
        // Questo evita il messaggio duplicato dopo un saluto tipo "Ciao"
        if (
          response.data.data.processedMessage &&
          response.data.data.processedMessage.trim() !== ""
        ) {
          // Create the bot message from the API response
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: response.data.data.processedMessage,
            sender: "user",
            timestamp: new Date(),
          }

          // Add bot response to chat history
          setMessages((prev) => [...prev, botMessage])
        } else {
          console.log("Empty response from API, not adding bot message")
        }
      } else {
        // Handle API error response
        console.error("API Error:", response.data.error)

        // Add an error message to the chat
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "Sorry, there was an error processing your message. Please try again later.",
          sender: "user",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Error calling message API:", error)

      // Add an error message to the chat in case of exception
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, there was an error processing your message. Please try again later.",
        sender: "user",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      // Always set loading state to false, regardless of success or failure
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Reset chat to allow new message
  const handleNewMessage = () => {
    // Don't reset the sessionId when starting a new message
    // This allows us to continue the same conversation
    setChatStarted(false)
    setMessages([])
    setCurrentMessage("")
    setInitialMessage("")
    setUserPhoneNumber("")
    // We're intentionally NOT clearing the sessionId here
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Only allow closing via the X button, not by clicking outside
        if (!open && isOpen) {
          // Do nothing, prevent closing
        }
      }}
    >
            <DialogContent
        className="w-[600px] max-w-[90vw] p-0 overflow-hidden [&>button]:hidden h-[850px] flex flex-col"
        data-state={isOpen ? "open" : "closed"}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <DialogTitle className="sr-only">WhatsApp Chat</DialogTitle>
        <DialogDescription id="whatsapp-dialog-description" className="sr-only">
          WhatsApp conversation interface to chat with a contact
        </DialogDescription>
        {/* WhatsApp header with WhatsApp icon and X */}
        <div className="bg-gradient-to-r from-green-500 to-green-400 shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white text-green-600 rounded-full flex items-center justify-center text-xl font-bold shadow mr-4">
              {selectedChat?.customerName
                ? getInitials(selectedChat.customerName)
                : "WC"}
            </div>
            <span className="text-white text-lg font-bold flex items-center">
              <MessageCircle className="h-6 w-6 mr-2 text-white opacity-80" />
              {userPhoneNumber || channelName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-green-600 rounded-full p-2 transition"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {!chatStarted ? (
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Enter details to start a chat
            </h3>

            {!hasValidWorkspace && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  ⚠️ No workspace available. Please select a workspace first to
                  send messages.
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={userPhoneNumber}
                  onChange={(e) => setUserPhoneNumber(e.target.value)}
                  autoFocus
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the recipient's phone number including country code
                </p>
              </div>

              <div>
                <Label htmlFor="initial-message">First Message *</Label>
                <Textarea
                  id="initial-message"
                  placeholder="Hello, I'd like to know about your products..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  className="mt-2"
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the first message to start the conversation
                </p>
              </div>

              <Button
                className="w-full bg-green-500 hover:bg-green-600"
                onClick={startChat}
                disabled={
                  !hasValidWorkspace ||
                  !isValidPhoneNumber(userPhoneNumber) ||
                  !initialMessage.trim() ||
                  isLoading
                }
              >
                {isLoading
                  ? "Processing..."
                  : !hasValidWorkspace
                  ? "No Workspace Available"
                  : "Start Chat"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat messages */}
            <ScrollArea className="flex-1 p-4 bg-gray-100">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "customer"
                        ? "justify-start"
                        : "justify-end"
                    } mb-3`}
                  >
                    <div
                      className={
                        message.sender === "customer"
                          ? "bg-white border border-gray-200 rounded-2xl rounded-br-md shadow-sm px-3 py-3 max-w-[85%] sm:max-w-[400px] mb-2 word-wrap break-words overflow-wrap-anywhere"
                          : "bg-green-100 text-green-900 rounded-2xl rounded-bl-md shadow-sm px-3 py-3 max-w-[85%] sm:max-w-[400px] mb-2 word-wrap break-words overflow-wrap-anywhere"
                      }
                    >
                      <span 
                        className="break-words whitespace-pre-line text-sm block leading-relaxed overflow-wrap-anywhere hyphens-auto"
                        style={{
                          wordWrap: 'break-word',
                          overflowWrap: 'anywhere',
                          hyphens: 'auto',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          maxWidth: '100%'
                        }}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ node, ...props }) => (
                              <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              />
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </span>
                      <div className="text-[10px] text-gray-300 text-right mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-end mb-2">
                    <div className="bg-green-100 text-green-900 rounded-2xl rounded-bl-md shadow-sm px-4 py-3 max-w-[90%]">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-700 font-medium">
                          typing
                        </span>
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                            style={{
                              animationDelay: "0ms",
                              animationDuration: "0.8s",
                            }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                            style={{
                              animationDelay: "150ms",
                              animationDuration: "0.8s",
                            }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                            style={{
                              animationDelay: "300ms",
                              animationDuration: "0.8s",
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right text-xs text-green-700 mt-1">
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input improved */}
            <div className="flex items-center p-3 border-t bg-white">
              {!hasValidWorkspace && (
                <div className="flex-1 p-3 bg-yellow-50 border border-yellow-200 rounded-md mr-2">
                  <p className="text-sm text-yellow-800">
                    No workspace available. Please select a workspace to send
                    messages.
                  </p>
                </div>
              )}

              {hasValidWorkspace && (
                <>
                  <Textarea
                    ref={inputRef}
                    placeholder={
                      isLoading ? "Please wait..." : "Type a message"
                    }
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`flex-1 rounded-full border border-gray-300 px-4 py-2 mr-2 min-h-[40px] resize-none text-xs ${
                      isLoading ? "opacity-70" : ""
                    }`}
                    rows={2}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isLoading}
                    className={`bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow transition h-10 w-10 flex items-center justify-center ${
                      isLoading ? "bg-gray-400" : ""
                    }`}
                    aria-label="Send message"
                  >
                    <Send size={20} />
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
