import { Card, CardContent } from "@/components/ui/card"
import { useWorkspace } from "@/hooks/use-workspace"
import {
  AlertCircle,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  Users
} from "lucide-react"

export default function DashboardPage() {
  const { workspace } = useWorkspace()

  // Dati di esempio per la dashboard
  const metrics = [
    {
      title: "Total Revenue",
      value: "€45,231",
      change: 12.5,
      changeType: "increase",
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      description: "Last 30 days"
    },
    {
      title: "Active Users",
      value: "1,234",
      change: 8.2,
      changeType: "increase",
      icon: <Users className="h-6 w-6 text-blue-500" />,
      description: "Last 30 days"
    },
    {
      title: "Conversations",
      value: "3,456",
      change: 5.1,
      changeType: "decrease",
      icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
      description: "Last 30 days"
    },
    {
      title: "Orders",
      value: "789",
      change: 15.3,
      changeType: "increase",
      icon: <ShoppingCart className="h-6 w-6 text-orange-500" />,
      description: "Last 30 days"
    },
  ]

  // Nuovi dati di esempio per le metriche aggiuntive
  const newCustomers = [
    { id: 1, name: "Maria Rossi", date: "Today, 10:23 AM", avatar: "MR", email: "maria@example.com" },
    { id: 2, name: "Luca Bianchi", date: "Today, 09:15 AM", avatar: "LB", email: "luca@example.com" },
    { id: 3, name: "Sofia Verdi", date: "Yesterday, 17:42 PM", avatar: "SV", email: "sofia@example.com" },
    { id: 4, name: "Marco Neri", date: "Yesterday, 14:30 PM", avatar: "MN", email: "marco@example.com" },
  ]

  const recentOrders = [
    { id: "#ORD-7895", customer: "Maria Rossi", date: "Today, 10:45 AM", total: "€124.00", status: "Completed" },
    { id: "#ORD-7894", customer: "Luca Bianchi", date: "Today, 09:30 AM", total: "€67.50", status: "Processing" },
    { id: "#ORD-7893", customer: "Sofia Verdi", date: "Yesterday", total: "€240.99", status: "Processing" },
    { id: "#ORD-7892", customer: "Marco Neri", date: "Yesterday", total: "€89.99", status: "Pending" },
  ]

  const ordersInProgress = [
    { id: "#ORD-7894", customer: "Luca Bianchi", placed: "Today, 09:30 AM", total: "€67.50", stage: "Payment Confirmed", eta: "Est. delivery: Tomorrow" },
    { id: "#ORD-7893", customer: "Sofia Verdi", placed: "Yesterday, 16:42 PM", total: "€240.99", stage: "Packaging", eta: "Est. delivery: Tomorrow" },
    { id: "#ORD-7888", customer: "Giulia Rosa", placed: "Yesterday, 15:10 PM", total: "€120.00", stage: "Shipped", eta: "Est. delivery: Tomorrow" },
  ]

  const consumptionStats = [
    { category: "API Calls", used: 12345, limit: 20000, percentage: "61%" },
    { category: "Messages", used: 345, limit: 500, percentage: "69%" },
    { category: "Storage", used: "1.2 GB", limit: "5 GB", percentage: "24%" },
    { category: "Function Calls", used: 890, limit: 1000, percentage: "89%" },
  ]

  const monthlyRevenue = [
    { month: "Jan", current: 4200, previous: 3800 },
    { month: "Feb", current: 4800, previous: 4100 },
    { month: "Mar", current: 5200, previous: 4400 },
    { month: "Apr", current: 4900, previous: 4750 },
    { month: "May", current: 6100, previous: 5200 },
    { month: "Jun", current: 7200, previous: 5800 },
    { month: "Jul", current: 7800, previous: 6400 },
    { month: "Aug", current: 8200, previous: 7100 },
  ]

  return (
    <div className="container mx-auto py-6">
      {/* Work in Progress Banner */}
      <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-6 flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="bg-amber-200 p-3 rounded-full">
          <AlertCircle className="h-8 w-8 text-amber-600" />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold text-amber-800">
            🚧 Work in Progress - Dashboard 🚧
          </h2>
          <p className="text-amber-700">
            This dashboard is currently under development. All data shown is for demonstration purposes only.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Dashboard Coming Soon
          </h1>
          <p className="text-gray-500 mb-6">
            We're building a powerful dashboard to help you monitor and analyze your business performance.
            Check back soon for updates.
          </p>
          <div className="max-w-2xl mx-auto bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">What you'll be able to do:</h3>
            <ul className="text-blue-700 space-y-2 text-left">
              <li>• Real-time analytics of your business performance</li>
              <li>• Customer engagement metrics and trends</li>
              <li>• Order tracking and revenue analytics</li>
              <li>• Conversation insights from customer interactions</li>
              <li>• Resource usage monitoring for your workspace</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
