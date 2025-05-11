import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Bell,
    Info,
    LineChart,
    MessageSquare,
    ShoppingCart,
    TrendingUp,
    Users
} from "lucide-react"

export default function DashboardPage() {
  // Mock data for the dashboard
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

  const channelPerformance = [
    { channel: "WhatsApp", conversations: 2345, conversionRate: 3.2 },
    { channel: "Website Chat", conversations: 1123, conversionRate: 2.8 },
    { channel: "Facebook Messenger", conversations: 876, conversionRate: 2.1 },
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* WIP Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 mb-6">
        <AlertCircle className="h-5 w-5 text-amber-500" />
        <div>
          <p className="text-amber-800 font-medium">
            🚧 This dashboard is a work in progress
          </p>
          <p className="text-amber-600 text-sm">
            The data shown is for demonstration purposes only.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {metric.title}
                  </CardTitle>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50">{metric.icon}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                {metric.changeType === "increase" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={metric.changeType === "increase" ? "text-green-500" : "text-red-500"}>
                  {metric.change}%
                </span>
                <span className="text-gray-500 text-sm ml-2">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Over Time Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Conversations Over Time</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of conversations per day over the last 30 days</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardDescription>Daily conversation volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full relative">
              {/* Mock Line Chart using CSS */}
              <div className="absolute bottom-0 left-0 right-0 h-[250px] flex items-end">
                {Array.from({ length: 30 }).map((_, i) => {
                  const height = 30 + Math.random() * 170;
                  return (
                    <div 
                      key={i} 
                      className="flex-1 mx-[1px] bg-gradient-to-t from-blue-500/80 to-blue-500/20"
                      style={{ height: `${height}px` }}
                    />
                  )
                })}
              </div>
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center text-gray-400">
                <LineChart className="h-12 w-12 opacity-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Conversion Rates</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of conversations that led to orders</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardDescription>By channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full relative">
              {/* Mock Bar Chart using CSS */}
              <div className="absolute bottom-0 left-0 right-0 h-[250px] flex items-end justify-around px-12">
                {channelPerformance.map((channel, i) => {
                  const height = 50 + channel.conversionRate * 40;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 w-24">
                      <div 
                        className="w-16 bg-gradient-to-t from-green-500/90 to-green-500/40"
                        style={{ height: `${height}px` }}
                      />
                      <span className="text-xs text-gray-500 font-medium">{channel.channel}</span>
                      <span className="text-xs font-bold">{channel.conversionRate}%</span>
                    </div>
                  )
                })}
              </div>
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center text-gray-400">
                <BarChart3 className="h-12 w-12 opacity-10" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
          <CardDescription>Overview of all communication channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Channel</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Conversations</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Conversion Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {channelPerformance.map((channel, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-3 px-4">{channel.channel}</td>
                    <td className="py-3 px-4">{channel.conversations.toLocaleString()}</td>
                    <td className="py-3 px-4">{channel.conversionRate}%</td>
                    <td className="py-3 px-4">
                      <Badge variant={i === 0 ? "default" : i === 1 ? "secondary" : "outline"}>
                        {i === 0 ? "Active" : i === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { message: "New customer registered via WhatsApp", time: "5 minutes ago", icon: <Bell className="h-4 w-4 text-blue-500" /> },
              { message: "Conversation #3245 converted to order", time: "1 hour ago", icon: <ShoppingCart className="h-4 w-4 text-green-500" /> },
              { message: "System detected high traffic on WhatsApp channel", time: "3 hours ago", icon: <AlertCircle className="h-4 w-4 text-amber-500" /> },
              { message: "Daily analytics report generated", time: "12 hours ago", icon: <BarChart3 className="h-4 w-4 text-purple-500" /> },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className="p-1.5 rounded-full bg-gray-50">
                  {activity.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
