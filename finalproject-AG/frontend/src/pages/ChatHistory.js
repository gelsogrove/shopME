import { Search } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import PageLayout from "../components/layout/PageLayout"

export default function ChatHistory() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data - in a real app this would come from an API
  const chats = [
    {
      id: 1,
      customer: "Mario Rossi",
      phone: "+39 333 111 2222",
      orderId: "ORD001",
      lastMessage: "Thank you for the information!",
      date: "Today at 10:36 AM",
      status: "completed",
    },
    {
      id: 2,
      customer: "Sarah Johnson",
      phone: "+39 333 333 4444",
      orderId: "ORD002",
      lastMessage: "When will my order arrive?",
      date: "Today at 11:00 AM",
      status: "new",
    },
  ]

  const filteredChats = chats.filter(
    (chat) =>
      chat.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.phone.includes(searchTerm) ||
      chat.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PageLayout title="Chat History">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => navigate(`/chat-history/${chat.id}`)}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {chat.customer}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {chat.phone}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Order: #{chat.orderId}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {chat.date}
                  </span>
                  {chat.status === "new" && (
                    <span className="mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded-full">
                      New
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
                {chat.lastMessage}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
