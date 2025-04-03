import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function DashboardPage() {
  // Sample data for the dashboard
  const newClients = [
    { id: 1, name: "Marco Rossi", date: "2 hours ago" },
    { id: 2, name: "Giulia Verdi", date: "6 hours ago" },
    { id: 3, name: "Luca Bianchi", date: "1 day ago" },
    { id: 4, name: "Sofia Romano", date: "2 days ago" },
  ]

  const latestOrders = [
    { id: 1, customer: "Marco Rossi", amount: "€299.99" },
    { id: 2, customer: "Giuseppe Verdi", amount: "€199.99" },
    { id: 3, customer: "Sofia Bianchi", amount: "€399.99" },
    { id: 4, customer: "Alessandro Neri", amount: "€149.50" },
  ]

  const latestMessages = [
    {
      id: 1,
      name: "Marco Rossi",
      initials: "MR",
      message: "I need help with my order #12345...",
      time: "2h ago",
    },
    {
      id: 2,
      name: "Giuseppe Verdi",
      initials: "GV",
      message: "When will Parmigiano Reggiano be available?",
      time: "4h ago",
    },
    {
      id: 3,
      name: "Sofia Bianchi",
      initials: "SB",
      message: "Can I modify my shipping address?",
      time: "1d ago",
    },
    {
      id: 4,
      name: "Elena Ferrari",
      initials: "EF",
      message: "I'd like to return a damaged product.",
      time: "2d ago",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6">
        {/* Main content boxes */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Latest orders box */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Latest Orders
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/orders" className="flex items-center gap-1 text-sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="font-medium">{order.customer}</div>
                    <div className="font-semibold text-green-600">
                      {order.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New clients box */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">New Clients</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/clients" className="flex items-center gap-1 text-sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {newClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.date}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Latest messages box */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Latest Messages
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/chats" className="flex items-center gap-1 text-sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestMessages.map((message) => (
                  <div
                    key={message.id}
                    className="flex gap-3 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <span className="text-sm font-semibold text-gray-700">
                        {message.initials}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{message.name}</div>
                        <div className="text-xs text-gray-500">
                          {message.time}
                        </div>
                      </div>
                      <p className="line-clamp-1 text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
