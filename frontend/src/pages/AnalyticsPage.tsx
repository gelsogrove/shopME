import {
  CheckCircle,
  ChevronDown,
  Clock,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"

interface Metric {
  title: string
  value: string | number
  change: number
  changeType: "increase" | "decrease"
  icon: React.ReactNode
}

const metrics: Metric[] = [
  {
    title: "Total Revenue",
    value: "€45,231",
    change: 12.5,
    changeType: "increase",
    icon: <TrendingUp className="h-6 w-6" />,
  },
  {
    title: "Active Users",
    value: "1,234",
    change: 8.2,
    changeType: "increase",
    icon: <Users className="h-6 w-6" />,
  },
  {
    title: "Conversations",
    value: "3,456",
    change: 5.1,
    changeType: "decrease",
    icon: <MessageSquare className="h-6 w-6" />,
  },
  {
    title: "Orders",
    value: "789",
    change: 15.3,
    changeType: "increase",
    icon: <ShoppingCart className="h-6 w-6" />,
  },
]

const performanceMetrics = [
  {
    title: "Average Response Time",
    value: "2.5 min",
    icon: <Clock className="h-5 w-5" />,
    color: "text-blue-500",
  },
  {
    title: "Resolution Rate",
    value: "95%",
    icon: <CheckCircle className="h-5 w-5" />,
    color: "text-green-500",
  },
  {
    title: "Abandoned Chats",
    value: "5%",
    icon: <XCircle className="h-5 w-5" />,
    color: "text-red-500",
  },
]

export function AnalyticsPage() {
  const [timeRange] = useState("last7days")

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            {timeRange === "last7days" && "Last 7 Days"}
            {timeRange === "last30days" && "Last 30 Days"}
            {timeRange === "last90days" && "Last 90 Days"}
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button>Export Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-gray-100">{metric.icon}</div>
              <span
                className={`text-sm font-medium ${
                  metric.changeType === "increase"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {metric.changeType === "increase" ? "+" : "-"}
                {Math.abs(metric.change)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500">
              {metric.title}
            </h3>
            <p className="text-2xl font-bold mt-1">{metric.value}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Revenue & Orders</h2>
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            {/* Replace with actual chart component */}
            <p className="text-gray-500">Revenue & Orders Chart</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Customer Engagement</h2>
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            {/* Replace with actual chart component */}
            <p className="text-gray-500">Customer Engagement Chart</p>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={metric.color}>{metric.icon}</div>
              <h3 className="text-sm font-medium text-gray-500">
                {metric.title}
              </h3>
            </div>
            <p className="text-2xl font-bold">{metric.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
