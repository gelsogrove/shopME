import { MoreVertical, Phone, Send, Video } from "lucide-react"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"

interface Message {
  id: string
  content: string
  sender: "user" | "customer"
  timestamp: string
}

interface Chat {
  id: string
  customerName: string
  customerPhone: string
  lastMessage: string
  unreadCount: number
  lastActive: string
  messages: Message[]
}

const mockChats: Chat[] = [
  {
    id: "1",
    customerName: "John Doe",
    customerPhone: "+39123456789",
    lastMessage: "I'd like to know more about your products",
    unreadCount: 2,
    lastActive: "2024-04-01T10:30:00",
    messages: [
      {
        id: "1",
        content: "Hello! I'm interested in your products",
        sender: "customer",
        timestamp: "2024-04-01T10:25:00",
      },
      {
        id: "2",
        content: "I'd like to know more about your products",
        sender: "customer",
        timestamp: "2024-04-01T10:30:00",
      },
    ],
  },
  // Add more mock chats as needed
]

export function ChatPage() {
  const [chats] = useState<Chat[]>(mockChats)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredChats = chats.filter(
    (chat) =>
      chat.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.customerPhone.includes(searchTerm)
  )

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    // Update chat with new message
    console.log("Sending message:", message)
    setNewMessage("")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
        {/* Chat List */}
        <Card className="col-span-4 p-4 overflow-hidden flex flex-col">
          <div className="mb-4">
            <Input
              type="search"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 rounded-lg mb-2 ${
                  selectedChat?.id === chat.id ? "bg-gray-50" : ""
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{chat.customerName}</h3>
                    <p className="text-sm text-gray-500">
                      {chat.customerPhone}
                    </p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {chat.lastMessage}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(chat.lastActive).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat Window */}
        <Card className="col-span-8 p-4 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <h2 className="font-bold">{selectedChat.customerName}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedChat.customerPhone}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" title="Voice Call">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Video Call">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="More Options">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {selectedChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a chat to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
