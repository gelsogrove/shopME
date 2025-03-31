import { Send } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

export default function ChatDetail() {
  const { chatId } = useParams()
  const [chat, setChat] = useState(null)
  const [newMessage, setNewMessage] = useState("")

  // Mock data - in a real app this would come from an API
  useEffect(() => {
    // Simulate API call
    setChat({
      id: parseInt(chatId),
      customer: "Mario Rossi",
      phone: "+39 333 111 2222",
      orderId: "ORD001",
      messages: [
        {
          id: 1,
          text: "I need help with my order #ORD001",
          timestamp: "10:30 AM",
          sender: "customer",
        },
        {
          id: 2,
          text: "Hello Mario, I'll be happy to help you with your order. What seems to be the issue?",
          timestamp: "10:32 AM",
          sender: "agent",
        },
        {
          id: 3,
          text: "I haven't received any shipping updates",
          timestamp: "10:33 AM",
          sender: "customer",
        },
        {
          id: 4,
          text: "Let me check that for you. Your order was shipped yesterday and the tracking number is TR123456789IT. You should receive it by tomorrow.",
          timestamp: "10:35 AM",
          sender: "agent",
        },
        {
          id: 5,
          text: "Thank you for the information!",
          timestamp: "10:36 AM",
          sender: "customer",
        },
      ],
    })
  }, [chatId])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message = {
      id: chat.messages.length + 1,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: "agent",
    }

    setChat((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }))
    setNewMessage("")
  }

  if (!chat) return null

  return (
    <div className="h-[calc(100vh-9rem)] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {chat.customer}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {chat.phone} • Order #{chat.orderId}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "agent" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.sender === "agent"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === "agent"
                    ? "text-blue-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
