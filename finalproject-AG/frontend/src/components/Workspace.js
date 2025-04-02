import { MessageSquare } from "lucide-react"
import { useNavigate } from "react-router-dom"

const ChannelCard = ({ phone, isActive, name, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-green-500 p-3 rounded-full">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-gray-600">{phone}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isActive ? "bg-green-500" : "bg-gray-300"
          }`}
        />
        <span className="text-sm text-gray-600">
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
  )
}

const Workspace = () => {
  const navigate = useNavigate()

  const channels = [
    {
      id: 1,
      name: "Sales Channel",
      phone: "+1 234 567 8900",
      isActive: true,
    },
    {
      id: 2,
      name: "Support Channel",
      phone: "+1 234 567 8901",
      isActive: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Workspaces</h1>
          <p className="mt-2 text-gray-600">
            Select a channel to manage or create a new one
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              {...channel}
              onClick={() => navigate("/dashboard")}
            />
          ))}
        </div>

        <div className="text-center">
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/dashboard")}
          >
            New Chatbot
          </button>
        </div>
      </div>
    </div>
  )
}

export default Workspace
