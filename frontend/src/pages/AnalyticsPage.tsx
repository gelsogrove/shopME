import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle,
  Clock,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react"

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
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🚧 Work in Progress
          </h1>
          <p className="text-gray-500">
            This feature is currently under development.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
