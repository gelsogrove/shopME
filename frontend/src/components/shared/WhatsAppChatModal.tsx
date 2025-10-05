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
import { logger } from "@/lib/logger"
import { api } from "@/services/api"
import axios from "axios"
import { Code, MessageCircle, Send, Settings, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { MessageRenderer } from "./MessageRenderer"

// Define a global variable to store the current session ID
// This will persist across modal closes/opens but not page refreshes
let globalSessionId: string | null = null

interface Message {
  id: string
  content: string
  sender: "user" | "customer" | "bot"
  timestamp: Date
  agentName?: string
  translatedQuery?: string
  processedPrompt?: string
  debugInfo?: string | any // 🔧 Debug information
  processingSource?: string // 🔧 Source of the response (LLM/function name)
  messageCost?: number // 💰 Cost of this message from Billing table
  billingType?: string // 💰 Type of billing (MESSAGE, PUSH_MESSAGE, HUMAN_SUPPORT, etc.)
  functionCalls?: Array<{
    functionName: string
    toolCall?: {
      function?: {
        name: string
        arguments: string
      }
    }
    result: any
    type?: string
    source?: string
    data?: any
  }>
  metadata?: {
    isOperatorMessage?: boolean
    isOperatorControl?: boolean
    agentSelected?: string
    sentBy?: string
    operatorId?: string
  }
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
  const [showFunctionCalls, setShowFunctionCalls] = useState(false)
  const [showProcessedPrompt, setShowProcessedPrompt] = useState(false)

  // Check if we have a valid workspace ID
  const currentWorkspaceId = getWorkspaceId(workspaceId)
  const hasValidWorkspace = currentWorkspaceId !== null

  // Track workspace validity

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastSendRef = useRef<number>(0) // Track last sendMessage call

  // Load chat from props or localStorage when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Priority 1: Use the chat passed from props if available
      if (selectedChat) {
        logger.info("Using selectedChat from props:", selectedChat)
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
          logger.info("Using selectedChat from localStorage:", savedChat)
          setLocalSelectedChat(savedChat)

          // If the savedChat has a sessionId, use it
          if (savedChat.sessionId) {
            setSessionId(savedChat.sessionId)
            globalSessionId = savedChat.sessionId
          }

          return
        }
      } catch (error) {
        logger.error("Error reading selectedChat from localStorage:", error)
      }

      // If the sessionId was set but not the chat, try to use that
      if (globalSessionId) {
        logger.info("Using previously stored sessionId:", globalSessionId)
        setSessionId(globalSessionId)
      }
    }
  }, [isOpen, selectedChat])

  // Initialize chat when a local selected chat is available
  useEffect(() => {
    if (isOpen && localSelectedChat) {
      logger.info("Initializing chat with chat:", localSelectedChat)
      setUserPhoneNumber(localSelectedChat.customerPhone)
      setChatStarted(true)
      fetchMessagesForSelectedChat(localSelectedChat)
    }
  }, [isOpen, localSelectedChat, currentWorkspaceId])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      logger.info("Modal closed, resetting component state")
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
      logger.info("Modal opened without any chat")
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
      logger.error(
        "No chat or sessionId provided to fetchMessagesForSelectedChat"
      )
      return
    }

    // Get workspaceId for API call
    const currentWorkspaceId = getWorkspaceId(workspaceId)
    if (!currentWorkspaceId) {
      logger.error("No workspace ID available for fetching messages")
      return
    }

    logger.info("Fetching messages for chat:", chat.sessionId)
    setIsLoading(true)
    try {
      const response = await api.get(`/chat/${chat.sessionId}/messages`)
      logger.info("API response for messages:", response.data)

      if (response.data.success) {
        // Transform backend messages to frontend format for the playground
        const chatMessages = response.data.data.map((message: any) => ({
          id: message.id,
          content: message.content,
          // Map MessageDirection.INBOUND to 'customer' and MessageDirection.OUTBOUND to 'bot'
          sender: message.direction === "INBOUND" ? "customer" : "bot",
          timestamp: new Date(message.createdAt),
          agentName:
            message.agentName ||
            (message.direction === "OUTBOUND" ? "AI Assistant" : undefined),
          // Debug fields
          translatedQuery: message.translatedQuery,
          processedPrompt: message.processedPrompt,
          processingSource: message.processingSource, // 🔧 NEW: Source information
          messageCost: message.messageCost, // 💰 NEW: Message cost from billing
          billingType: message.billingType, // 💰 NEW: Billing type (MESSAGE, PUSH_MESSAGE, etc.)
          functionCalls: message.functionCallsDebug
            ? (() => {
                try {
                  // Check if it's already an object or a string that needs parsing
                  return typeof message.functionCallsDebug === "string"
                    ? JSON.parse(message.functionCallsDebug)
                    : message.functionCallsDebug
                } catch (error) {
                  return []
                }
              })()
            : [],
          // 🔧 NEW: Add debugInfo from database
          debugInfo: message.debugInfo
            ? (() => {
                try {
                  // Check if it's already an object or a string that needs parsing
                  return typeof message.debugInfo === "string"
                    ? JSON.parse(message.debugInfo)
                    : message.debugInfo
                } catch (error) {
                  return {}
                }
              })()
            : {},
          metadata: {
            isOperatorMessage: message.metadata?.isOperatorMessage || false,
            isOperatorControl: message.metadata?.isOperatorControl || false,
            agentSelected:
              message.metadata?.agentSelected ||
              (message.direction === "OUTBOUND" ? "CHATBOT" : "CUSTOMER"),
            sentBy:
              message.metadata?.sentBy ||
              (message.direction === "OUTBOUND" ? "AI" : "CUSTOMER"),
            operatorId: message.metadata?.operatorId,
          },
        }))

        logger.info(
          `Loaded ${chatMessages.length} messages for chat:`,
          chat.sessionId
        )
        setMessages(chatMessages)
      }
    } catch (error) {
      logger.error("Error loading messages for selected chat:", error)
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

  // 💰 NEW: Fetch current billing totals
  // Rimosso fetchBillingTotals - ora gestito dal sistema Analytics

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
      sender: "customer", // Changed from "user" to "customer" for initial message
      timestamp: new Date(),
      metadata: {
        isOperatorMessage: false,
        isOperatorControl: false,
        agentSelected: "CUSTOMER",
        sentBy: "CUSTOMER",
      },
    }

    setMessages([userMessage])
    setInitialMessage("")
    setIsLoading(true)

    try {
      // Call the API to process the initial message - USE SAME WEBHOOK AS NORMAL MESSAGES
      const apiUrl = `${
        import.meta.env.VITE_API_URL || "http://localhost:3001"
      }/api/whatsapp/webhook`

      // Use provided workspaceId or get from config
      const currentWorkspaceId = getWorkspaceId(workspaceId)

      // Include isNewConversation flag for new chats
      const response = await axios.post(apiUrl, {
        message: userMessage.content,
        phoneNumber: userPhoneNumber,
        workspaceId: currentWorkspaceId,
        isNewConversation: true, // Add flag to indicate new conversation
      })

      // Check if response is just "OK" (customer blocked - no action needed)
      if (response.data === "OK") {
        logger.info(
          "🚫 Customer blocked - received OK response, showing no bot message"
        )
        setIsLoading(false)
        return
      }

      if (response.data.success) {
        // Save sessionId if provided in the response
        if (response.data.data.sessionId) {
          logger.info("Setting new session ID:", response.data.data.sessionId)
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

        // Check if we have a valid bot response before creating message
        const botResponse = response.data.data.message

        if (botResponse && botResponse.trim() !== "") {
          // Create the bot message from the API response
          const botMessage: Message = {
            id: (Date.now() + 200).toString(),
            content: botResponse,
            sender: "bot",
            timestamp: new Date(),
            agentName: "AI Assistant",
            metadata: {
              isOperatorMessage: false,
              isOperatorControl: false,
              agentSelected: "CHATBOT",
              sentBy: "AI",
            },
          }

          // Add ONLY the bot response to chat history, not the user's message again
          // This prevents the duplicate "Ciao" message
          setMessages((prev) => [...prev, botMessage]) // Add only bot response - user message already added
        } else {
          logger.info(
            "Empty response from initial message, customer waiting for operator"
          )
        }
      } else {
        // Handle API error response
        logger.error("API Error:", response.data.error)

        // Add an error message to the chat
        const errorMessage: Message = {
          id: (Date.now() + 200).toString(),
          content:
            "Sorry, there was an error processing your message. Please try again later.",
          sender: "bot",
          timestamp: new Date(),
          agentName: "System",
          metadata: {
            isOperatorMessage: false,
            isOperatorControl: false,
            agentSelected: "SYSTEM_ERROR",
            sentBy: "SYSTEM",
          },
        }

        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      logger.error("Error calling message API:", error)

      // Add an error message to the chat in case of exception
      const errorMessage: Message = {
        id: (Date.now() + 200).toString(),
        content:
          "Sorry, there was an error processing your message. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
        agentName: "System",
        metadata: {
          isOperatorMessage: false,
          isOperatorControl: false,
          agentSelected: "SYSTEM_ERROR",
          sentBy: "SYSTEM",
        },
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      // Always set loading state to false, regardless of success or failure
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    logger.info("🚀 FRONTEND DEBUG: sendMessage called with:", currentMessage)

    if (!currentMessage.trim() || isLoading) {
      logger.info(
        "❌ FRONTEND DEBUG: sendMessage blocked - empty message or loading"
      )
      return
    }

    // Prevent double execution with simple debounce
    const now = Date.now()
    const lastCall = lastSendRef.current
    if (now - lastCall < 10000) {
      // 10 second debounce for testing
      logger.info(
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

    logger.info(
      "✅ FRONTEND DEBUG: sendMessage proceeding with message:",
      currentMessage
    )

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: "customer",
      timestamp: new Date(),
      metadata: {
        isOperatorMessage: false,
        isOperatorControl: false,
        agentSelected: "CUSTOMER",
        sentBy: "CUSTOMER",
      },
    }

    // Save the message to display immediately
    setMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsLoading(true)

    try {
      // Call the API to process the message - LLM SYSTEM
      const apiUrl = `${
        import.meta.env.VITE_API_URL || "http://localhost:3001"
      }/api/whatsapp/webhook`

      // Use provided workspaceId or get from config
      const currentWorkspaceId = getWorkspaceId(workspaceId)

      logger.info("🔄 FRONTEND DEBUG: Making API call to LLM SYSTEM:", apiUrl)
      const response = await axios.post(apiUrl, {
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: userPhoneNumber,
                      text: {
                        body: userMessage.content,
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      })
      logger.info("📥 FRONTEND DEBUG: API response received:", response.data)
      logger.info("📥 FRONTEND DEBUG: Response status:", response.status)
      logger.info(
        "📥 FRONTEND DEBUG: Response success field:",
        response.data.success
      )

      // Check if response is just "OK" (customer blocked - no action needed)
      if (response.data === "OK") {
        logger.info(
          "🚫 Customer blocked - received OK response, showing no bot message"
        )
        setIsLoading(false)
        return
      }

      if (response.data.success) {
        // DUAL LLM SYSTEM response format
        const botResponse = response.data.data.message

        // Handle blacklisted customer - don't show any response
        if (botResponse === "EVENT_RECEIVED_CUSTOMER_BLACKLISTED") {
          logger.info("🚫 Customer is blacklisted - ignoring message")
          return
        }

        if (botResponse && botResponse.trim() !== "") {
          // La logica di billing è ora gestita dal backend e visualizzata in Analytics

          // Create the bot message from the API response
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: botResponse,
            sender: "bot",
            timestamp: new Date(),
            agentName: "AI Assistant",
            // Debug fields from API response
            translatedQuery: response.data.debug?.translatedQuery,
            processedPrompt: response.data.debug?.processedPrompt,
            processingSource: response.data.debug?.processingSource || "LLM", // 🔧 NEW: Source info
            functionCalls: response.data.debug?.functionCalls || [],
            // 💰 Complete debug info (now all properties are directly in debug)
            debugInfo: response.data.debug || {},
            metadata: {
              isOperatorMessage: false,
              isOperatorControl: false,
              agentSelected: "CHATBOT",
              sentBy: "AI",
            },
          }

          // Add bot response to chat history
          setMessages((prev) => [...prev, botMessage])
        } else {
          logger.info(
            "Empty response from DUAL LLM SYSTEM, not adding bot message"
          )
        }
      } else {
        // Handle API error response
        logger.error("API Error:", response.data.error)

        // Add an error message to the chat
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "Sorry, there was an error processing your message. Please try again later.",
          sender: "bot",
          timestamp: new Date(),
          agentName: "System",
          metadata: {
            isOperatorMessage: false,
            isOperatorControl: false,
            agentSelected: "SYSTEM_ERROR",
            sentBy: "SYSTEM",
          },
        }

        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      logger.error("Error calling message API:", error)

      // Add an error message to the chat in case of exception
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, there was an error processing your message. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
        agentName: "System",
        metadata: {
          isOperatorMessage: false,
          isOperatorControl: false,
          agentSelected: "SYSTEM_ERROR",
          sentBy: "SYSTEM",
        },
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
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowFunctionCalls(!showFunctionCalls)}
              className={`text-white hover:bg-green-600 rounded-full p-2 transition ${
                showFunctionCalls ? "bg-green-600" : ""
              }`}
              aria-label="Toggle Function Calls Debug"
              title="Show/Hide Function Calls Debug"
            >
              <Code className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowProcessedPrompt(!showProcessedPrompt)}
              className={`text-white hover:bg-green-600 rounded-full p-2 transition ${
                showProcessedPrompt ? "bg-green-600" : ""
              } hidden`}
              aria-label="Toggle Processed Prompt Debug"
              title="Show/Hide Processed Prompt Debug"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-green-600 rounded-full p-2 transition"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
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
                {messages.map((message) => {
                  // Using the sender field which is properly mapped from direction
                  const isAgentMessage = message.sender === "bot"
                  const isCustomerMessage = message.sender === "customer"

                  // 🚨 ANDREA'S OPERATOR CONTROL INDICATORS
                  // Correct logic:
                  const isChatbotMessage =
                    isAgentMessage &&
                    (message.metadata?.agentSelected?.startsWith("CHATBOT_") ||
                      message.metadata?.agentSelected === "LLM" ||
                      message.metadata?.agentSelected === "AI" ||
                      message.metadata?.agentSelected === "AI_AGENT")

                  // Only EXPLICIT operator messages should be blue
                  const isOperatorMessage =
                    isAgentMessage &&
                    (message.metadata?.agentSelected === "MANUAL_OPERATOR" ||
                      message.metadata?.isOperatorMessage === true ||
                      message.metadata?.sentBy === "HUMAN_OPERATOR")

                  const isOperatorControl =
                    message.metadata?.isOperatorControl === true
                  const isManualOperator =
                    message.metadata?.agentSelected === "MANUAL_OPERATOR" ||
                    message.metadata?.agentSelected ===
                      "MANUAL_OPERATOR_CONTROL" ||
                    message.metadata?.sentBy === "HUMAN_OPERATOR"

                  const getMessageStyle = () => {
                    if (!isAgentMessage) {
                      return isOperatorControl
                        ? "bg-orange-50 text-orange-900 border-l-4 border-orange-400" // Customer under control
                        : "bg-white border border-gray-200" // Normal customer
                    }

                    // SE C'È IL BADGE CHATBOT → VERDE (controllo anche agentName)
                    if (
                      message.metadata?.agentSelected === "CHATBOT" ||
                      message.metadata?.agentSelected?.startsWith("CHATBOT_") ||
                      message.metadata?.agentSelected === "AI" ||
                      message.metadata?.agentSelected === "LLM" ||
                      message.agentName
                    ) {
                      // Se ha agentName è un chatbot!
                      return "bg-green-100 text-green-900 border-l-4 border-green-500" // CHATBOT → VERDE
                    }

                    if (message.metadata?.agentSelected === "MANUAL_OPERATOR") {
                      return "bg-blue-100 text-blue-900 border-l-4 border-blue-500" // MANUAL_OPERATOR → BLU
                    }

                    // Default fallback
                    return "bg-green-100 text-green-900"
                  }

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isAgentMessage ? "justify-end" : "justify-start"
                      } mb-3`}
                    >
                      <div
                        className={`rounded-2xl px-3 py-3 max-w-[85%] sm:max-w-[400px] mb-2 word-wrap break-words overflow-wrap-anywhere relative ${getMessageStyle()}`}
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

                        <div style={{ lineHeight: "1.7", fontSize: "0.95rem" }}>
                          <MessageRenderer
                            content={message.content}
                            variant="chat"
                          />
                        </div>

                        {/* Debug Information */}
                        {(showFunctionCalls || showProcessedPrompt) && (
                          <div className="mt-3 border-t border-gray-300 pt-2 space-y-2">
                            {showProcessedPrompt && message.translatedQuery && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                                <div className="text-xs font-semibold text-yellow-800 mb-1">
                                  🔍 Translated Query:
                                </div>
                                <div className="text-xs text-yellow-700 font-mono whitespace-pre-wrap">
                                  {message.translatedQuery}
                                </div>
                              </div>
                            )}

                            {showProcessedPrompt && message.processedPrompt && (
                              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                                <div className="text-xs font-semibold text-blue-800 mb-1">
                                  📝 Processed Prompt:
                                </div>
                                <div className="text-xs text-blue-700 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                                  {message.processedPrompt}
                                </div>
                              </div>
                            )}

                            {showProcessedPrompt && message.debugInfo && (
                              <div className="bg-green-50 border border-green-200 rounded p-2">
                                <div className="text-xs font-semibold text-green-800 mb-1">
                                  🔧 Debug Flow:
                                </div>
                                <div className="text-xs text-green-700 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                                  {typeof message.debugInfo === "string"
                                    ? message.debugInfo
                                    : JSON.stringify(
                                        message.debugInfo,
                                        null,
                                        2
                                      )}
                                </div>
                              </div>
                            )}

                            {/* 🔧 NEW: Task 1 - Source Information */}
                            {showFunctionCalls && message.sender === "bot" && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                                <div className="text-xs font-semibold text-yellow-800 mb-1">
                                  🎯 Response Source:
                                </div>
                                <div className="text-xs text-yellow-700">
                                  {(() => {
                                    // Determine source based on available data
                                    if (
                                      message.functionCalls &&
                                      message.functionCalls.length > 0
                                    ) {
                                      const functionNames =
                                        message.functionCalls
                                          .map(
                                            (call) =>
                                              call.functionName ||
                                              call.type ||
                                              "Unknown"
                                          )
                                          .filter(
                                            (name, index, arr) =>
                                              arr.indexOf(name) === index
                                          ) // Remove duplicates
                                          .slice(0, 3) // Show max 3 function names
                                          .join(", ")

                                      return (
                                        <div className="space-y-1">
                                          <div className="font-mono">
                                            <span className="font-semibold text-blue-600">
                                              📝 SOURCE:
                                            </span>{" "}
                                            LLM
                                            {message.debugInfo?.model && (
                                              <span className="text-gray-500 text-xs ml-2">
                                                ({message.debugInfo.model})
                                              </span>
                                            )}
                                          </div>
                                          <div className="font-mono">
                                            <span className="font-semibold text-purple-600">
                                              🔧 FUNCTION:
                                            </span>{" "}
                                            {functionNames}
                                            {message.functionCalls.length > 3 &&
                                              ` (+${
                                                message.functionCalls.length - 3
                                              } more)`}
                                          </div>
                                          {message.debugInfo?.temperature !==
                                            undefined &&
                                            message.debugInfo?.temperature !==
                                              null && (
                                              <div className="font-mono text-xs">
                                                <span className="font-semibold text-orange-600">
                                                  🌡️ TEMPERATURE:
                                                </span>{" "}
                                                {message.debugInfo.temperature}
                                              </div>
                                            )}
                                          {message.functionCalls[0]?.toolCall
                                            ?.function?.arguments && (
                                            <div className="font-mono text-xs">
                                              <span className="font-semibold text-orange-600">
                                                📋 PARAMS:
                                              </span>{" "}
                                              {
                                                message.functionCalls[0]
                                                  .toolCall.function.arguments
                                              }
                                            </div>
                                          )}
                                          {message.debugInfo
                                            ?.effectiveParams && (
                                            <div className="font-mono text-xs">
                                              <span className="font-semibold text-green-600">
                                                ✅ EFFECTIVE:
                                              </span>{" "}
                                              {JSON.stringify(
                                                message.debugInfo
                                                  .effectiveParams
                                              )}
                                            </div>
                                          )}
                                          {message.debugInfo
                                            ?.tokenReplacements &&
                                            message.debugInfo.tokenReplacements
                                              .length > 0 && (
                                              <div className="font-mono text-xs">
                                                <span className="font-semibold text-pink-600">
                                                  🔗 TOKENS:
                                                </span>{" "}
                                                {message.debugInfo.tokenReplacements.map(
                                                  (
                                                    token: string,
                                                    idx: number
                                                  ) => (
                                                    <div
                                                      key={idx}
                                                      className="ml-2"
                                                    >
                                                      {token}
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            )}
                                        </div>
                                      )
                                    } else if (
                                      message.processingSource &&
                                      message.processingSource !== "unknown"
                                    ) {
                                      // 🔧 ENHANCED: Show full debug info if available, even with processingSource
                                      if (
                                        message.debugInfo ||
                                        (message.functionCalls &&
                                          message.functionCalls.length > 0)
                                      ) {
                                        const functionNames =
                                          message.functionCalls
                                            ? message.functionCalls
                                                .map(
                                                  (call) =>
                                                    call.functionName ||
                                                    call.type ||
                                                    "Unknown"
                                                )
                                                .filter(
                                                  (name, index, arr) =>
                                                    arr.indexOf(name) === index
                                                )
                                                .slice(0, 3)
                                                .join(", ")
                                            : null

                                        return (
                                          <div className="space-y-1">
                                            <div className="font-mono">
                                              <span className="font-semibold text-blue-600">
                                                📝 SOURCE:
                                              </span>{" "}
                                              LLM
                                              {message.debugInfo?.model && (
                                                <span className="text-gray-500 text-xs ml-2">
                                                  ({message.debugInfo.model})
                                                </span>
                                              )}
                                            </div>
                                            {functionNames && (
                                              <div className="font-mono">
                                                <span className="font-semibold text-purple-600">
                                                  🔧 FUNCTION:
                                                </span>{" "}
                                                {functionNames}
                                                {message.functionCalls &&
                                                  message.functionCalls.length >
                                                    3 &&
                                                  ` (+${
                                                    message.functionCalls
                                                      .length - 3
                                                  } more)`}
                                              </div>
                                            )}
                                            {message.debugInfo?.temperature !==
                                              undefined &&
                                              message.debugInfo?.temperature !==
                                                null && (
                                                <div className="font-mono text-xs">
                                                  <span className="font-semibold text-orange-600">
                                                    🌡️ TEMPERATURE:
                                                  </span>{" "}
                                                  {
                                                    message.debugInfo
                                                      .temperature
                                                  }
                                                </div>
                                              )}
                                            {message.functionCalls &&
                                              message.functionCalls[0]?.toolCall
                                                ?.function?.arguments && (
                                                <div className="font-mono text-xs">
                                                  <span className="font-semibold text-orange-600">
                                                    � PARAMS:
                                                  </span>{" "}
                                                  {
                                                    message.functionCalls[0]
                                                      .toolCall.function
                                                      .arguments
                                                  }
                                                </div>
                                              )}
                                            {message.debugInfo
                                              ?.effectiveParams && (
                                              <div className="font-mono text-xs">
                                                <span className="font-semibold text-green-600">
                                                  ✅ EFFECTIVE:
                                                </span>{" "}
                                                {JSON.stringify(
                                                  message.debugInfo
                                                    .effectiveParams
                                                )}
                                              </div>
                                            )}
                                            {message.debugInfo
                                              ?.tokenReplacements &&
                                              message.debugInfo
                                                .tokenReplacements.length >
                                                0 && (
                                                <div className="font-mono text-xs">
                                                  <span className="font-semibold text-pink-600">
                                                    🔗 TOKENS:
                                                  </span>{" "}
                                                  {message.debugInfo.tokenReplacements.map(
                                                    (
                                                      token: string,
                                                      idx: number
                                                    ) => (
                                                      <div
                                                        key={idx}
                                                        className="ml-2"
                                                      >
                                                        {token}
                                                      </div>
                                                    )
                                                  )}
                                                </div>
                                              )}
                                          </div>
                                        )
                                      } else {
                                        return (
                                          <span className="font-mono">
                                            <span className="font-semibold text-blue-600">
                                              �🔧 SOURCE:
                                            </span>{" "}
                                            {message.processingSource}
                                          </span>
                                        )
                                      }
                                    } else if (
                                      message.metadata?.agentSelected?.includes(
                                        "CHATBOT"
                                      )
                                    ) {
                                      return (
                                        <div className="space-y-1">
                                          <div className="font-mono">
                                            <span className="font-semibold text-blue-600">
                                              📝 SOURCE:
                                            </span>{" "}
                                            LLM
                                            {message.debugInfo?.model && (
                                              <span className="text-gray-500 text-xs ml-2">
                                                ({message.debugInfo.model})
                                              </span>
                                            )}
                                          </div>
                                          {message.debugInfo?.temperature !==
                                            undefined &&
                                            message.debugInfo?.temperature !==
                                              null && (
                                              <div className="font-mono text-xs">
                                                <span className="font-semibold text-orange-600">
                                                  🌡️ TEMPERATURE:
                                                </span>{" "}
                                                {message.debugInfo.temperature}
                                              </div>
                                            )}
                                          {message.debugInfo
                                            ?.tokenReplacements &&
                                            message.debugInfo.tokenReplacements
                                              .length > 0 && (
                                              <div className="font-mono text-xs">
                                                <span className="font-semibold text-pink-600">
                                                  🔗 TOKENS:
                                                </span>{" "}
                                                {message.debugInfo.tokenReplacements.map(
                                                  (
                                                    token: string,
                                                    idx: number
                                                  ) => (
                                                    <div
                                                      key={idx}
                                                      className="ml-2"
                                                    >
                                                      {token}
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            )}
                                        </div>
                                      )
                                    } else {
                                      return (
                                        <span className="font-mono">
                                          <span className="font-semibold text-gray-600">
                                            ❓ UNKNOWN:
                                          </span>{" "}
                                          {message.metadata?.agentSelected ||
                                            "No source info"}
                                        </span>
                                      )
                                    }
                                  })()}
                                </div>
                              </div>
                            )}

                            {/* 🔧 NEW: Task 2 - Timestamp in DEBUG only */}
                            {showFunctionCalls && (
                              <div className="bg-gray-50 border border-gray-200 rounded p-2">
                                <div className="text-xs font-semibold text-gray-800 mb-1">
                                  🕒 Timestamp:
                                </div>
                                <div className="text-xs text-gray-700 font-mono">
                                  {new Date(message.timestamp).toLocaleString(
                                    "it-IT",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    }
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 💰 NEW: Billing Cost in DEBUG */}
                            {showFunctionCalls &&
                              message.messageCost !== undefined &&
                              message.messageCost > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded p-2">
                                  <div className="text-xs font-semibold text-green-800 mb-1">
                                    {(() => {
                                      switch (message.billingType) {
                                        case "MESSAGE":
                                          return "� Message Cost:"
                                        case "PUSH_MESSAGE":
                                          return "📱 Push Notification Cost:"
                                        case "HUMAN_SUPPORT":
                                          return "🤝 Human Support Cost:"
                                        case "NEW_CUSTOMER":
                                          return "👤 New Customer Cost:"
                                        case "NEW_ORDER":
                                          return "📦 New Order Cost:"
                                        default:
                                          return "💰 Billing Cost:"
                                      }
                                    })()}
                                  </div>
                                  <div className="text-xs text-green-700 font-mono font-bold">
                                    €{message.messageCost.toFixed(2)}
                                    {message.billingType && (
                                      <span className="ml-2 text-gray-500 font-normal">
                                        ({message.billingType})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Rimossa sezione pricing information in debug */}
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] opacity-70">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
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
                })}
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
