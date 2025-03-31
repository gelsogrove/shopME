import { useState } from "react"
import { useParams } from "react-router-dom"

const ChatHistory = () => {
  const { customerId } = useParams()
  const [newMessage, setNewMessage] = useState("")
  const [error, setError] = useState("")

  // Example chat history
  const chatHistory = [
    {
      id: 1,
      type: "user",
      message: "I need help with my order #ORD-2023001",
      timestamp: "2024-03-31T10:30:00",
    },
    {
      id: 2,
      type: "bot",
      message:
        "Of course! I found your order #ORD-2023001. I can see it was shipped yesterday. How can I help you?",
      timestamp: "2024-03-31T10:30:05",
    },
    {
      id: 3,
      type: "user",
      message: "I'd like to know when it will arrive",
      timestamp: "2024-03-31T10:30:30",
    },
    {
      id: 4,
      type: "bot",
      message:
        "According to tracking, delivery is scheduled for tomorrow between 10:00 AM and 12:00 PM. Would you like me to send you the tracking link?",
      timestamp: "2024-03-31T10:30:35",
    },
    {
      id: 5,
      type: "user",
      message: "Yes, thank you",
      timestamp: "2024-03-31T10:31:00",
    },
    {
      id: 6,
      type: "bot",
      message:
        "Here's your tracking link: https://tracking.example.com/ORD-2023001. Is there anything else I can help you with?",
      timestamp: "2024-03-31T10:31:05",
    },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) {
      return
    }

    // Here you would typically send the message to your backend
    console.log("Sending message:", newMessage)
    setNewMessage("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (!customerId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center text-red-600">
          Invalid customer ID
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Chat History</h1>
          <div className="text-sm text-gray-500">Order #ORD-2023001</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
            {chatHistory.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.type === "user"
                      ? "bg-blue-600 text-white ml-4"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white mr-4"
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <span className="text-xs mt-1 block opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <form
            onSubmit={handleSubmit}
            className="border-t dark:border-gray-700 p-4"
          >
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                aria-label="Message input"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatHistory
