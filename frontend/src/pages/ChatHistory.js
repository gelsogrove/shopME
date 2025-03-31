import { ChevronRight, Home, MessageSquare } from "lucide-react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"

const ChatHistory = () => {
  const { chatId } = useParams()
  const [searchTerm, setSearchTerm] = useState("")

  // Simulated chat data - in a real app, this would come from an API
  const chats = [
    {
      id: 1,
      customer: "Mark Ross",
      orderId: "ORD-2023001",
      messages: [
        {
          id: 1,
          text: "I need help with my order #ORD-2023001",
          timestamp: "10:30 AM",
          sender: "customer",
        },
        {
          id: 2,
          text: "Hello Mark, I'll be happy to help you with your order. What seems to be the issue?",
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
      status: "new",
      lastMessage: "10 min ago",
    },
    {
      id: 2,
      customer: "Sarah Johnson",
      orderId: "ORD-2023002",
      messages: [
        {
          id: 1,
          text: "When will my order arrive?",
          timestamp: "09:45 AM",
          sender: "customer",
        },
        {
          id: 2,
          text: "Hi Sarah, your order is currently being processed. The estimated delivery date is tomorrow.",
          timestamp: "09:47 AM",
          sender: "agent",
        },
        {
          id: 3,
          text: "Perfect, thank you!",
          timestamp: "09:48 AM",
          sender: "customer",
        },
      ],
      status: "read",
      lastMessage: "25 min ago",
    },
  ]

  const filteredChats = chats.filter(
    (chat) =>
      chat.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedChat = chatId
    ? chats.find((chat) => chat.id === parseInt(chatId))
    : null

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link
                to="/chat-history"
                className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white"
              >
                Chat History
              </Link>
            </div>
          </li>
          {selectedChat && (
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                  Chat with {selectedChat.customer}
                </span>
              </div>
            </li>
          )}
        </ol>
      </nav>

      <div className="flex h-[calc(100vh-12rem)]">
        {/* Chat List */}
        <div
          className={`w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow mr-6 ${
            selectedChat ? "hidden md:block" : ""
          }`}
        >
          <div className="p-4 border-b dark:border-gray-700">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="overflow-y-auto h-[calc(100%-5rem)]">
            {filteredChats.map((chat) => (
              <Link
                key={chat.id}
                to={`/chat-history/${chat.id}`}
                className={`block p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  parseInt(chatId) === chat.id
                    ? "bg-gray-50 dark:bg-gray-700"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {chat.customer
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {chat.customer}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {chat.lastMessage}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      Order: {chat.orderId}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        {selectedChat ? (
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {selectedChat.customer
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedChat.customer}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Order: {selectedChat.orderId}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/orders/${selectedChat.orderId}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Order
                </Link>
              </div>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-8rem)]">
              {selectedChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "customer"
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-lg rounded-lg px-4 py-2 ${
                      message.sender === "customer"
                        ? "bg-gray-100 dark:bg-gray-700"
                        : "bg-blue-100 dark:bg-blue-800"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        message.sender === "customer"
                          ? "text-gray-900 dark:text-white"
                          : "text-blue-900 dark:text-blue-100"
                      }`}
                    >
                      {message.text}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "customer"
                          ? "text-gray-500 dark:text-gray-400"
                          : "text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No chat selected
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select a chat from the list to view the conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatHistory
